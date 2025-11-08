import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

/**
 * GET /api/hotels/nearby?lat=<lat>&lng=<lng>&radius=<meters>
 * Returns hotels and lodges near the given coordinates from OSM database
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');
    const radiusParam = searchParams.get('radius') || '5000';

    if (!latParam || !lngParam) {
      return NextResponse.json({ error: 'Missing required parameters: lat and lng' }, { status: 400 });
    }

    const latitude = parseFloat(latParam);
    const longitude = parseFloat(lngParam);
    const radius = parseInt(radiusParam);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
    }

    // Connect to OSM database
    const client = new Client({
      host: '170.64.167.7',
      port: 30432,
      database: 'nsdi-app',
      user: 'postgres',
      password: 'admin123',
    });

    await client.connect();

    try {
      // Query hotels and lodges from OSM data
      const query = `
        SELECT
          name,
          tourism,
          amenity,
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
            tourism IN ('hotel', 'guest_house') OR
            amenity IN ('hotel', 'guest_house') OR
            building IN ('hotel', 'guest_house')
          )
          AND ST_DWithin(
            ST_Transform(way, 4326)::geography,
            ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
            $3
          )
        ORDER BY distance
        LIMIT 50;
      `;

      const result = await client.query(query, [latitude, longitude, radius]);

      // Format results
      const hotels = result.rows.map((row: Record<string, unknown>, index: number) => ({
        id: index + 1, // Use sequential number as ID
        name: String(row.name ?? ''),
        type: String(row.tourism || row.amenity || row.building || 'unknown'),
        latitude: parseFloat(String(row.latitude ?? '0')),
        longitude: parseFloat(String(row.longitude ?? '0')),
        distanceMeters: Math.round(parseFloat(String(row.distance ?? '0'))),
        province: null, // OSM doesn't have province data
        city: null, // OSM doesn't have city data
      }));

      return NextResponse.json({
        success: true,
        count: hotels.length,
        hotels: hotels,
        copernicusCount: 0,
        copernicusDetections: []
      });

    } finally {
      await client.end();
    }

  } catch (error) {
    console.error('Error in hotels/nearby:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to query nearby hotels',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
