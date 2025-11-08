const { Client } = require('pg');

async function searchNearbyHotels() {
  const client = new Client({
    host: '170.64.167.7',
    port: 30432,
    database: 'nsdi-app',
    user: 'postgres',
    password: 'admin123',
  });

  try {
    await client.connect();
    console.log('Connected to OSM database');

    // Search for hotels near Port Moresby (-9.4438, 147.1803) within 2km
    const lat = -9.4438;
    const lng = 147.1803;
    const radius = 2000; // meters

    const query = `
      SELECT
        name,
        tourism,
        amenity,
        leisure,
        building,
        ST_Y(ST_Transform(ST_Centroid(way), 4326)) as latitude,
        ST_X(ST_Transform(ST_Centroid(way), 4326)) as longitude,
        ST_Distance(
          ST_Transform(way, 4326)::geography,
          ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography
        ) as distance
      FROM osm_data.planet_osm_polygon
      WHERE name IS NOT NULL
        AND (
          tourism IN ('hotel', 'resort', 'guest_house', 'hostel', 'motel', 'apartment', 'chalet') OR
          amenity IN ('hotel', 'resort', 'guest_house', 'hostel', 'motel', 'apartment', 'chalet') OR
          building IN ('hotel', 'resort', 'guest_house', 'hostel', 'motel', 'apartment', 'chalet')
        )
        AND ST_DWithin(
          ST_Transform(way, 4326)::geography,
          ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
          $3
        )
      ORDER BY distance
      LIMIT 20;
    `;

    const result = await client.query(query, [lng, lat, radius]);
    console.log(`Found ${result.rows.length} hotels near Port Moresby:`);
    console.log('='.repeat(50));

    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.name}`);
      console.log(`   Type: ${row.tourism || row.amenity || row.building || 'unknown'}`);
      console.log(`   Coordinates: ${row.latitude.toFixed(6)}, ${row.longitude.toFixed(6)}`);
      console.log(`   Distance: ${Math.round(row.distance)} meters`);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

searchNearbyHotels();
