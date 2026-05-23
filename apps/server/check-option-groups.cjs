const { Client } = require('pg');

async function checkOptionGroups() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    database: 'vendure_ecommerce',
    user: 'postgres',
    password: 'admin@#'
  });

  try {
    await client.connect();
    // find option groups for a known slug or code
    const res = await client.query(`
      SELECT pog.code as option_group_code, pog.id as pog_id, pt.slug as product_slug, pt.name as product_name
      FROM product_option_group pog
      JOIN product p ON pog."productId" = p.id
      JOIN product_translation pt ON pt."baseId" = p.id
      WHERE pt."languageCode" = 'en'
      LIMIT 20;
    `);
    require('fs').writeFileSync('output.json', JSON.stringify(res.rows, null, 2));
    console.log('Results written to output.json');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

checkOptionGroups();
