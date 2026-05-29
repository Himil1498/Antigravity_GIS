/**
 * Reports Utilities
 * Helper functions for generating XLSX and CSV files
 */

const XLSX = require('xlsx');

/**
 * Helper: Generate XLSX file
 * @param {Object} res Express response object
 * @param {Array} data Data to export
 * @param {String} reportName Name of the report (for filename)
 * @param {Array} columns Column definitions { header, key }
 */
const generateXLSX = (res, data, reportName, columns) => {
    try {
        // Sanitize data: XLSX cannot handle Date objects, JSONB objects, arrays, BigInt, etc.
        const sanitizedData = data.map(row => {
            const clean = {};
            for (const col of columns) {
                let val = row[col.key];
                if (val === null || val === undefined) {
                    clean[col.key] = '';
                } else if (val instanceof Date) {
                    clean[col.key] = val.toISOString();
                } else if (typeof val === 'bigint') {
                    clean[col.key] = Number(val);
                } else if (typeof val === 'object') {
                    // Arrays or JSONB objects from PostgreSQL
                    clean[col.key] = JSON.stringify(val);
                } else {
                    clean[col.key] = val;
                }
            }
            return clean;
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(sanitizedData, { header: columns.map(c => c.key) });

        // Set column headers
        XLSX.utils.sheet_add_aoa(ws, [columns.map(c => c.header)], { origin: 'A1' });

        // Auto-size columns for better readability
        ws['!cols'] = columns.map(c => ({ wch: Math.max(c.header.length + 2, 15) }));

        XLSX.utils.book_append_sheet(wb, ws, 'Report');

        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', `attachment; filename="${reportName}_${new Date().toISOString().split('T')[0]}.xlsx"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        console.error(`❌ XLSX generation failed for "${reportName}":`, error.message, error.stack);
        res.status(500).json({ success: false, error: `Failed to generate XLSX: ${error.message}` });
    }
};

/**
 * Helper: Generate CSV file
 * @param {Object} res Express response object
 * @param {Array} data Data to export
 * @param {String} reportName Name of the report (for filename)
 */
const generateCSV = (res, data, reportName) => {
    if (!data || data.length === 0) {
        return res.status(404).json({ success: false, error: 'No data available' });
    }

    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                // Escape quotes and wrap in quotes if contains comma or newline
                if (value === null || value === undefined) return '';
                const stringValue = String(value);
                if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
                    return `"${stringValue.replace(/"/g, '""')}"`;
                }
                return stringValue;
            }).join(',')
        )
    ];

    res.setHeader('Content-Disposition', `attachment; filename="${reportName}_${new Date().toISOString().split('T')[0]}.csv"`);
    res.setHeader('Content-Type', 'text/csv');
    res.send(csvRows.join('\n'));
};

module.exports = {
    generateXLSX,
    generateCSV
};
