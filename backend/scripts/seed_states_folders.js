require("dotenv").config({ path: "../.env" });
const { pool } = require("../src/config/database");

const states = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

async function seedStates() {
  console.log("Connected to database. Starting state folder seeding...");

  try {
    // We will do everything via pool.query without transactions for simplicity
    
    // Grab all root folders
    const [roots] = await pool.query(
      `SELECT id, name, category, default_icon FROM network_folders WHERE parent_id IS NULL`
    );

    let customerParents = roots.filter(r => r.category === 'customer' || r.name.toLowerCase() === 'customer' || r.name.toLowerCase() === 'customers');
    let infraParents = roots.filter(r => (r.category === 'active' || r.category === 'passive' || r.category === 'infrastructure') && !r.name.toLowerCase().includes('infra provider'));
    
    // Find Infra Provider to get its children
    const infraProviderRoot = roots.find(r => r.name.toLowerCase().includes('infra provider'));
    if (infraProviderRoot) {
      console.log(`Skipping Infra Provider tree (ID: ${infraProviderRoot.id}) as requested.`);
    }

    let allTargets = [];

    // For Customers:
    const mainCustomerRoot = customerParents.find(r => r.name.toLowerCase() === 'customers' || r.name.toLowerCase() === 'customer');
    if (mainCustomerRoot) {
        const [subCustomers] = await pool.query(
            `SELECT id, name, category, default_icon FROM network_folders WHERE parent_id = ?`, [mainCustomerRoot.id]
        );
        if (subCustomers.length > 0) {
            allTargets.push(...subCustomers);
        } else {
            allTargets.push(mainCustomerRoot); // It's just flat
        }
    } else {
        allTargets.push(...customerParents);
    }

    // For Infrastructure:
    const mainInfraRoot = infraParents.find(r => r.name.toLowerCase() === 'infrastructure');
    if (mainInfraRoot) {
        const [subInfra] = await pool.query(
            `SELECT id, name, category, default_icon FROM network_folders WHERE parent_id = ? AND name NOT ILIKE '%Infra Provider%'`, [mainInfraRoot.id]
        );
        if (subInfra.length > 0) {
             allTargets.push(...subInfra);
        } else {
             allTargets.push(mainInfraRoot);
        }
    } else {
        allTargets.push(...infraParents); // Add flat ones like POP, Datacenter if they are roots
    }

    console.log(`Found ${allTargets.length} target parent folders to receive State/UT sub-folders.`);

    let insertCount = 0;

    for (const parent of allTargets) {
      console.log(`Processing Parent: ${parent.name} (ID: ${parent.id}, Category: ${parent.category})`);
      
      const [existingChildren] = await pool.query(
          `SELECT name FROM network_folders WHERE parent_id = ?`, [parent.id]
      );
      const existingNames = new Set(existingChildren.map(c => c.name));

      for (const state of states) {
        if (!existingNames.has(state)) {
           await pool.query(`
             INSERT INTO network_folders (name, parent_id, category, default_icon, is_system, created_by)
             VALUES (?, ?, ?, ?, true, 1)
           `, [state, parent.id, parent.category || 'infrastructure', parent.default_icon]);
           insertCount++;
        }
      }
    }

    console.log(`✅ Successfully seeded ${insertCount} state folders! Expected ~ ${states.length * allTargets.length}`);

  } catch (err) {
    console.error("❌ Error seeding states:", err);
  } finally {
    process.exit(0);
  }
}

seedStates();
