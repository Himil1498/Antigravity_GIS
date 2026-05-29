const { parentPort, workerData } = require("worker_threads");
const { pool } = require("../config/database");
const fs = require("fs");
const { DOMParser } = require("@xmldom/xmldom");
const tj = require("@mapbox/togeojson");
const AdmZip = require("adm-zip");
const path = require("path");

async function processKml() {
  const { fileRecord, filePath } = workerData;
  const client = await pool.getConnection();

  try {
    await client.query("BEGIN");

    console.time("KML Worker Processing");
    console.log(
      `Worker: Processing KML file: ${fileRecord.name} (${fileRecord.id})`,
    );

    // Safety Check: Avoid processing files larger than 50MB
    try {
      const stats = fs.statSync(filePath);
      constCbFileSizeInBytes = stats.size;
      const MAX_PROCESS_SIZE = 50 * 1024 * 1024; // 50MB

      if (stats.size > MAX_PROCESS_SIZE) {
        throw new Error(
          `Skipping KML processing: File too large (${stats.size} bytes)`,
        );
      }
    } catch (fsErr) {
      if (fsErr.code === "ENOENT") {
        throw new Error("File not found on disk");
      }
      throw fsErr;
    }

    let buffer = null;

    // 1. Read File into Buffer
    if (fileRecord.file_type === "kmz") {
      const zip = new AdmZip(filePath);
      const zipEntries = zip.getEntries();
      const mainKml = zipEntries.find((entry) =>
        entry.entryName.endsWith(".kml"),
      );
      if (mainKml) {
        buffer = zip.readFile(mainKml); // Read raw bytes to avoid V8 string limit
      }
    } else {
      buffer = fs.readFileSync(filePath);
    }

    if (!buffer) {
      throw new Error("No KML content found or empty file");
    }

    // 2. Parse (Streaming Buffer to avoid OOM / String limits)
    let featureCount = 0;
    const placemarkStart = Buffer.from('<Placemark');
    const placemarkEnd = Buffer.from('</Placemark>');
    let offset = 0;
    let batch = [];
    const batchSize = 1000;
    
    // Strict PostGIS geometry validation to prevent 'Too few ordinates' errors
    const isValidGeometry = (geom) => {
        if (!geom || !geom.coordinates) return false;
        
        // Helper to check coordinate array depth and length
        const checkCoords = (coords, minPoints) => {
            if (!Array.isArray(coords)) return false;
            // Point: [x, y]
            if (typeof coords[0] === 'number') {
               return coords.length >= 2; 
            }
            // Array of points or arrays
            if (Array.isArray(coords[0])) {
               if (typeof coords[0][0] === 'number') {
                   return coords.length >= minPoints;
               } else {
                   // Deeper nesting (MultiPolygon)
                   return coords.every(c => checkCoords(c, minPoints));
               }
            }
            return false;
        };

        switch (geom.type) {
            case 'Point':
                return checkCoords(geom.coordinates, 1);
            case 'LineString':
            case 'MultiPoint':
                return checkCoords(geom.coordinates, 2);
            case 'Polygon':
            case 'MultiLineString':
                return checkCoords(geom.coordinates, 4);
            case 'MultiPolygon':
                return checkCoords(geom.coordinates, 4);
            case 'GeometryCollection':
                return geom.geometries && geom.geometries.length > 0 && geom.geometries.every(isValidGeometry);
            default:
                return false;
        }
    };

    const processBatch = async (batchFeatures) => {
        if (batchFeatures.length === 0) return;
        const values = [];
        const params = [];
        let pIdx = 1;

        batchFeatures.forEach((f) => {
          const geomStr = JSON.stringify(f.geometry);
          const propsStr = JSON.stringify(f.properties || {});
          values.push(
            `($${pIdx}, ST_Transform(ST_SetSRID(ST_Force2D(ST_MakeValid(ST_GeomFromGeoJSON($${
              pIdx + 1
            }))), 4326), 3857), $${pIdx + 2})`,
          );
          params.push(fileRecord.id, geomStr, propsStr);
          pIdx += 3;
        });

        const query = `
              INSERT INTO network_features (file_id, geom, properties)
              VALUES ${values.join(",")}
           `;
           
        try {
            await client.query("SAVEPOINT batch_savepoint");
            await client.query(query, params);
            await client.query("RELEASE SAVEPOINT batch_savepoint");
        } catch (batchErr) {
            await client.query("ROLLBACK TO SAVEPOINT batch_savepoint");
            // Fallback: Insert row by row to isolate bad geometries
            for (const f of batchFeatures) {
                try {
                    await client.query("SAVEPOINT single_savepoint");
                    const geomStr = JSON.stringify(f.geometry);
                    const propsStr = JSON.stringify(f.properties || {});
                    await client.query(`
                        INSERT INTO network_features (file_id, geom, properties)
                        VALUES ($1, ST_Transform(ST_SetSRID(ST_Force2D(ST_MakeValid(ST_GeomFromGeoJSON($2))), 4326), 3857), $3)
                    `, [fileRecord.id, geomStr, propsStr]);
                    await client.query("RELEASE SAVEPOINT single_savepoint");
                } catch (singleErr) {
                    await client.query("ROLLBACK TO SAVEPOINT single_savepoint");
                    console.error("Skipped bad geometry in fallback:", singleErr.message);
                }
            }
        }
    };

    while (offset < buffer.length) {
        const startIdx = buffer.indexOf(placemarkStart, offset);
        if (startIdx === -1) break;

        const endIdx = buffer.indexOf(placemarkEnd, startIdx);
        if (endIdx === -1) break;

        const endOffset = endIdx + placemarkEnd.length;
        const placemarkXml = buffer.toString('utf8', startIdx, endOffset);

        const wrapped = `<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom">${placemarkXml}</kml>`;
        const dom = new DOMParser().parseFromString(wrapped, "text/xml");
        const geojson = tj.kml(dom);

        if (geojson && geojson.features && geojson.features.length > 0) {
            const feature = geojson.features[0];
            // Only push features that have a valid geometry matching PostGIS strict requirements
            if (isValidGeometry(feature.geometry)) {
                batch.push(feature);
                featureCount++;
            }
        }

        if (batch.length >= batchSize) {
            await processBatch(batch);
            batch = []; // clear memory
        }

        offset = endOffset;
    }
    
    // Process remaining
    if (batch.length > 0) {
        await processBatch(batch);
    }

    console.log(`Worker: Extracted ${featureCount} features.`);
    buffer = null; // Free main buffer

    if (featureCount > 0) {
      console.timeEnd("KML Worker Processing");

      // 4. Success Update
      await client.query(
        "UPDATE network_files SET processing_status = 'completed', feature_count = $1 WHERE id = $2",
        [featureCount, fileRecord.id],
      );
    } else {
      await client.query(
        "UPDATE network_files SET processing_status = 'completed', feature_count = 0 WHERE id = $1",
        [fileRecord.id],
      );
    }

    await client.query("COMMIT");
    parentPort.postMessage({ success: true, count: featureCount });
  } catch (error) {
    if (client) await client.query("ROLLBACK");

    console.error("Worker Error:", error);

    // Try to update status to failed
    try {
      // Need a fresh transaction if the previous one was rolled back or corrupted
      await client.query("BEGIN");
      await client.query(
        "UPDATE network_files SET processing_status = 'failed', error_message = $1 WHERE id = $2",
        [error.message, fileRecord.id],
      );
      await client.query("COMMIT");
    } catch (statusErr) {
      console.error("Worker failed to update status:", statusErr);
    }

    parentPort.postMessage({ success: false, error: error.message });
  } finally {
    if (client) client.release();
    // Close the pool connection to prevent the worker from hanging
    // The worker has its own pool instance, so ending it is safe and required
    await pool.end();
  }
}

processKml();
