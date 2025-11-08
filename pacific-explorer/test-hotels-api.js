const fetch = require('node-fetch');

async function testHotelsAPI() {
  try {
    console.log('Testing hotels API...');
    const response = await fetch('http://127.0.0.1:3005/api/hotels/nearby?lat=-9.4438&lng=147.1803&radius=2000');
    const data = await response.json();

    console.log('API Response:');
    console.log('Success:', data.success);
    console.log('Count:', data.count);
    console.log('Hotels found:', data.hotels?.length || 0);

    if (data.hotels && data.hotels.length > 0) {
      console.log('\nFirst 3 hotels:');
      data.hotels.slice(0, 3).forEach((hotel, i) => {
        console.log(`${i+1}. ${hotel.name} (${hotel.distanceMeters}m away)`);
      });
    }
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testHotelsAPI();
