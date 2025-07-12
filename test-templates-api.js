const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000/api';

async function testTemplatesAPI() {
  console.log('🧪 Testing Templates API Endpoints...\n');
  
  // Test 1: GET /api/templates (no auth required)
  console.log('1. Testing GET /api/templates (public endpoint):');
  try {
    const response = await fetch(`${API_BASE_URL}/templates`);
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, data);
  } catch (error) {
    console.log(`   Error:`, error.message);
  }
  
  console.log('\n2. Testing POST /api/templates/from-components (requires auth):');
  // Test 2: POST /api/templates/from-components (auth required)
  try {
    const response = await fetch(`${API_BASE_URL}/templates/from-components`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake-token'
      },
      body: JSON.stringify({
        components: [],
        name: 'Test Template',
        category: 'test'
      })
    });
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, data);
  } catch (error) {
    console.log(`   Error:`, error.message);
  }
  
  console.log('\n3. Testing with missing token:');
  // Test 3: POST without token
  try {
    const response = await fetch(`${API_BASE_URL}/templates/from-components`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        components: [],
        name: 'Test Template',
        category: 'test'
      })
    });
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, data);
  } catch (error) {
    console.log(`   Error:`, error.message);
  }
}

testTemplatesAPI().catch(console.error);