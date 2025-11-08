// Test script to check if fetch works in Node.js

async function testFetch() {
  try {
    console.log('Testing fetch to Overpass API...');
    
    const query = `[out:json][timeout:25];node(around:1000,-33.8688,151.2093)[tourism=hotel];out body;`;
    const url = 'https://overpass-api.de/api/interpreter';
    
    console.log('Sending POST request to:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`,
    });
    
    console.log('Response status:', response.status);
    console.log('Response statusText:', response.statusText);
    
    const data = await response.json();
    console.log('Success! Got data:', JSON.stringify(data, null, 2).substring(0, 500));
    
  } catch (error) {
    console.error('Error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.cause) {
      console.error('Error cause:', error.cause);
    }
  }
}

testFetch();
