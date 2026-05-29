require('dotenv').config({ path: '../.env' });
const catalogService = require('../src/modules/network-planning/services/catalog.service');

async function test() {
  try {
    const catalog = await catalogService.getUnifiedCatalog(108, null, false, false);
    
    // Inspect customer folders
    if (catalog.customers && catalog.customers.length > 0) {
      console.log(`Found ${catalog.customers.length} customer roots.`);
      // Check Airtel
      const customerRoot = catalog.customers.find(c => c.name.toLowerCase() === 'customer');
      if (customerRoot) {
        const airtel = customerRoot.children.find(c => c.name.toLowerCase() === 'airtel');
        if (airtel) {
          console.log(`Airtel has ${airtel.children.length} children.`);
          console.log("Airtel children:", airtel.children.map(c => c.name).join(', '));
        } else {
          console.log("Airtel not found in Customer root.");
          // maybe Airtel is directly in customers array?
          const airtelDirect = catalog.customers.find(c => c.name.toLowerCase() === 'airtel');
          if (airtelDirect) {
            console.log(`Airtel (Direct) has ${airtelDirect.children.length} children.`);
            console.log("Airtel (Direct) children:", airtelDirect.children.map(c => c.name).join(', '));
          }
        }
      } else {
        // Maybe the roots are directly in customers array
        const airtel = catalog.customers.find(c => c.name.toLowerCase() === 'airtel');
        if (airtel) {
            console.log(`Airtel has ${airtel.children.length} children.`);
            console.log("Airtel children:", airtel.children.map(c => c.name).join(', '));
        }
      }
    } else {
      console.log("No customers found.");
    }
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

test();
