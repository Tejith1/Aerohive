require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkSchema() {
  const url = `${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`;
  const response = await fetch(url, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });
  
  if (!response.ok) {
    console.error("Failed to fetch schema:", response.statusText);
    return;
  }
  
  const schema = await response.json();
  const tables = ['service_providers', 'drone_services', 'service_bookings'];
  
  for (const tableName of tables) {
    console.log(`\n--- SCHEMA FOR: ${tableName} ---`);
    const tableDef = schema.definitions[tableName];
    if (tableDef) {
      console.log("Properties (columns):");
      for (const [colName, colProp] of Object.entries(tableDef.properties)) {
        console.log(`  - ${colName}: ${colProp.type} (${colProp.format || 'no format'})`);
      }
    } else {
      console.log("Not found in definitions.");
    }
  }
}

checkSchema().catch(console.error);
