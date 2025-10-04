const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/events/all',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  }
};

console.log('🔍 Testing API endpoint: http://localhost:3001/api/events/all');

const req = http.request(options, (res) => {
  console.log(`📊 Status Code: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📄 Response Body:');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

req.end();
