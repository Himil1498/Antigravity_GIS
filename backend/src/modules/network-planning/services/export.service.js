const { pool } = require("../../../config/database");
const AdmZip = require("adm-zip");

class ExportService {
  /**
   * Export combined data based on filters
   * Options: { folderId, includeApproved, includeLiveInventory, includeImportedFiles, includeCurrentFolder, format, userRole, exportMode }
   */
  async exportCombinedData(options) {
    const {
      specificFolders = [],
      specificFiles = [],
      format,
      userRole,
      exportMode = "merged"
    } = options;

    const isAdmin = userRole === "admin" || userRole === "Admin";
    const client = await pool.getConnection();
    try {
      // Build UNION Query
      let queries = [];
      let params = [];
      let paramIdx = 1;

      // Specific Folders & Files
      if (specificFolders.length > 0 || specificFiles.length > 0) {
           let folderFilter = "";
           if (specificFolders.length > 0) {
               const ids = specificFolders.map(id => parseInt(id)).filter(id => !isNaN(id)).join(',');
               if (ids) {
                   folderFilter = `f.folder_id IN (
                        WITH RECURSIVE target_folders AS (
                            SELECT id FROM network_folders WHERE id IN (${ids})
                            UNION
                            SELECT c.id FROM network_folders c 
                            JOIN target_folders p ON c.parent_id = p.id
                        )
                        SELECT id FROM target_folders
                   )`;
               }
           }
           let fileFilter = "";
           if (specificFiles.length > 0) {
               const fids = specificFiles.map(id => parseInt(id)).filter(id => !isNaN(id)).join(',');
               if (fids) {
                   fileFilter = `f.id IN (${fids})`;
               }
           }

           let whereClause = [folderFilter, fileFilter].filter(Boolean).join(' OR ');

           if (whereClause) {
               queries.push(`
                  SELECT 
                      nf.id::text as feature_id,
                      'Specific Selection' as status,
                      nf.properties->>'name' as name,
                      nf.properties,
                      ST_AsKML(ST_Transform(nf.geom, 4326)) as kml,
                      f.name as file_name,
                      f.id as file_id,
                      f.folder_id
                  FROM network_features nf
                  JOIN network_files f ON nf.file_id = f.id
                  WHERE (${whereClause})
                    AND nf.deleted_at IS NULL
               `);
           }
      }

      if (queries.length === 0) {
        throw new Error("No data sources selected");
      }

      const finalQuery = queries.join(" UNION ALL ");
      const result = await client.query(finalQuery, params);
      const rows = result.rows || result[0];

      // Fetch all folders to build hierarchy paths
      const allFoldersRes = await client.query('SELECT id, name, parent_id FROM network_folders');
      const folderRows = allFoldersRes.rows || allFoldersRes[0];
      const folderMap = new Map();
      folderRows.forEach(f => folderMap.set(f.id, f));

      const getFolderPath = (folderId) => {
          if (!folderId || !folderMap.has(folderId)) return '';
          let path = [];
          let currentId = folderId;
          while (currentId && folderMap.has(currentId)) {
              const folder = folderMap.get(currentId);
              // Clean folder names to be safe for zip paths
              const safeFolderName = (folder.name || 'Folder').replace(/[<>:"|?*]/g, '_');
              path.unshift(safeFolderName);
              currentId = folder.parent_id;
          }
          return path.join('/');
      };

      // Deduplicate by feature_id
      const uniqueRowsMap = new Map();
      rows.forEach(r => {
          if (!uniqueRowsMap.has(r.feature_id)) {
              uniqueRowsMap.set(r.feature_id, r);
          }
      });
      const uniqueRows = Array.from(uniqueRowsMap.values());

      // Helper function to completely escape XML
      const escapeXml = (unsafe) => {
         if (!unsafe) return "";
         return String(unsafe).replace(/[<>&'"]/g, function (c) {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case "'": return '&apos;';
                case '"': return '&quot;';
                default: return c;
            }
         });
      };

      const getKmlStyles = () => `
    <Style id="icon-blue"><IconStyle><scale>1.1</scale><Icon><href>http://maps.google.com/mapfiles/kml/paddle/blu-circle.png</href></Icon></IconStyle></Style>
    <Style id="icon-green"><IconStyle><scale>1.1</scale><Icon><href>http://maps.google.com/mapfiles/kml/paddle/grn-circle.png</href></Icon></IconStyle></Style>
    <Style id="icon-red"><IconStyle><scale>1.1</scale><Icon><href>http://maps.google.com/mapfiles/kml/paddle/red-circle.png</href></Icon></IconStyle></Style>
    <Style id="icon-yellow"><IconStyle><scale>1.1</scale><Icon><href>http://maps.google.com/mapfiles/kml/paddle/ylw-circle.png</href></Icon></IconStyle></Style>
`;

      const generatePlacemark = (row) => {
          let styleId = "icon-yellow";
          const props = row.properties || {};
          const status = (props.status || row.status || "").toLowerCase();

          if (status.includes("plan") || status.includes("proposed"))
            styleId = "icon-blue";
          if (status.includes("active") || status.includes("live") || status.includes("built"))
            styleId = "icon-green";
          if (status.includes("fault") || status.includes("down"))
            styleId = "icon-red";

          let extendedData = "<ExtendedData>";
          extendedData += `<Data name="Source File"><value>${escapeXml(row.file_name)}</value></Data>`;
          for (const [key, val] of Object.entries(props)) {
            if (val !== null && val !== undefined && typeof val !== "object") {
              extendedData += `<Data name="${escapeXml(key)}"><value>${escapeXml(String(val))}</value></Data>`;
            }
          }
          extendedData += "</ExtendedData>";

          return `
      <Placemark>
        <name>${escapeXml(row.name || "Feature")}</name>
        <styleUrl>#${styleId}</styleUrl>
        ${extendedData}
        ${row.kml}
      </Placemark>`;
      };

      if (exportMode === "individual") {
          // INDIVIDUAL EXPORT MODE -> Generate a ZIP of individual KML files
          const rowsByFileId = {};
          const fileNameMap = {};
          const folderIdMap = {};
          uniqueRows.forEach(row => {
              const fid = row.file_id || 'unnamed';
              if (!rowsByFileId[fid]) rowsByFileId[fid] = [];
              rowsByFileId[fid].push(row);
              fileNameMap[fid] = row.file_name || 'Unnamed_File';
              if (!folderIdMap[fid]) folderIdMap[fid] = row.folder_id;
          });

          const zip = new AdmZip();
          const usedPaths = new Set();
          
          if (Object.keys(rowsByFileId).length === 0) {
              const emptyKml = `<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2">\n  <Document><name>No Data Found</name></Document>\n</kml>`;
              zip.addFile("Empty_Export.kml", Buffer.from(emptyKml, "utf8"));
          } else {
              Object.keys(rowsByFileId).forEach(fid => {
                  const originalName = fileNameMap[fid];
                  let baseName = originalName.replace(/[^a-z0-9\-_ ]/gi, '_').trim();
                  if (!baseName) baseName = 'export';
                  
                  const folderPath = getFolderPath(folderIdMap[fid]);
                  const prefix = folderPath ? `${folderPath}/` : '';
                  
                  // Ensure unique filename path in zip
                  let finalPath = `${prefix}${baseName}.kml`;
                  let counter = 1;
                  while (usedPaths.has(finalPath)) {
                      finalPath = `${prefix}${baseName}_${counter}.kml`;
                      counter++;
                  }
                  usedPaths.add(finalPath);

                  let kmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${escapeXml(originalName)}</name>
    ${getKmlStyles()}`;
                  
                  rowsByFileId[fid].forEach(row => {
                      kmlBody += generatePlacemark(row);
                  });
                  
                  kmlBody += `\n  </Document>\n</kml>`;
                  
                  zip.addFile(finalPath, Buffer.from(kmlBody, "utf8"));
              });
          }

          return {
              buffer: zip.toBuffer(),
              filename: "Network_Export_Individual.zip",
              contentType: "application/zip",
          };

      } else {
          // MERGED EXPORT MODE
          // Group by file_name for KML Folders inside the single document
          const rowsByFile = {};
          uniqueRows.forEach(row => {
              const fn = row.file_name || 'Other';
              if (!rowsByFile[fn]) rowsByFile[fn] = [];
              rowsByFile[fn].push(row);
          });

          let kmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Exported Network Data</name>
    ${getKmlStyles()}`;

          if (uniqueRows.length === 0) {
            kmlBody += `
    <Placemark>
      <name>No Data Found</name>
      <description>No data matched your selection criteria.</description>
      <Point><coordinates>0,0</coordinates></Point>
    </Placemark>`;
          } else {
            Object.keys(rowsByFile).forEach(folderName => {
                 kmlBody += `\n    <Folder>\n      <name>${escapeXml(folderName)}</name>`;
                 rowsByFile[folderName].forEach(row => {
                      kmlBody += generatePlacemark(row);
                 });
                 kmlBody += `\n    </Folder>`;
            });
          }

          kmlBody += `\n  </Document>\n</kml>`;

          // Convert to requested format
          if (format === "kmz") {
            const zip = new AdmZip();
            zip.addFile("doc.kml", Buffer.from(kmlBody, "utf8"));
            return {
              buffer: zip.toBuffer(),
              filename: "Exported_Data_Merged.kmz",
              contentType: "application/vnd.google-earth.kmz",
            };
          } else {
            return {
              buffer: Buffer.from(kmlBody, "utf8"),
              filename: "Exported_Data_Merged.kml",
              contentType: "application/vnd.google-earth.kml+xml",
            };
          }
      }

    } finally {
      client.release();
    }
  }
}

module.exports = new ExportService();
