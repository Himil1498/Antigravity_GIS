const zlib = require('zlib');
const util = require('util');

const gzip = util.promisify(zlib.gzip);
const gunzip = util.promisify(zlib.gunzip);

/**
 * Compress data using GZIP
 * @param {Object|string} data - Data to compress
 * @returns {Promise<Buffer>} Compressed data
 */
const compressData = async (data) => {
  if (!data) return null;
  const stringData = typeof data === 'string' ? data : JSON.stringify(data);
  return await gzip(stringData);
};

/**
 * Decompress GZIP data
 * @param {Buffer} data - Compressed data
 * @returns {Promise<Object>} Decompressed data object
 */
const decompressData = async (data) => {
  if (!data) return null;
  const decompressed = await gunzip(data);
  return JSON.parse(decompressed.toString());
};

module.exports = {
  compressData,
  decompressData
};
