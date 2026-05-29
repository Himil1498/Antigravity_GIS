require('dotenv').config({ path: '../.env' });
const folderService = require('../src/modules/network-planning/services/folder.service');

async function test() {
  try {
    // 108 is Raj, 11 is Airtel
    const catalog = await folderService.getFolderContents(11, 108, 'user', false, 'view');
    console.log(`Airtel has ${catalog.folders.length} children.`);
    if(catalog.folders.length > 0) {
       console.log("Airtel children:", catalog.folders.map(f => f.name).join(', '));
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

test();
