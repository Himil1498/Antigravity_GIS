const { prisma } = require('./src/config/database');

async function check() {
  const fileQueryStr = `SELECT * FROM network_files WHERE name = 'My Places (29 MAY 26) - Fixed.kmz' ORDER BY created_at DESC LIMIT 1`;
  const [filesRows] = await Promise.all([
      prisma.$queryRawUnsafe(fileQueryStr)
  ]);
  
  console.log("JSON:", JSON.stringify(filesRows, null, 2));
  
  await prisma.$disconnect();
}
check();
