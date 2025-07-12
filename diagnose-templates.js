const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000/api';

async function diagnosisReport() {
  console.log('🔍 TEMPLATES API DIAGNOSIS REPORT');
  console.log('='.repeat(50));
  
  console.log('\n📋 CONFIGURATION CHECK:');
  console.log('   API Base URL:', API_BASE_URL);
  
  console.log('\n🛠️  SERVER HEALTH CHECK:');
  
  // 1. Test server health
  try {
    const healthResponse = await fetch(`${API_BASE_URL.replace('/api', '')}/`);
    console.log(`   ✅ Server Response: ${healthResponse.status}`);
  } catch (error) {
    console.log(`   ❌ Server Health Error: ${error.message}`);
    return;
  }
  
  console.log('\n📊 ENDPOINTS TESTING:');
  
  // 2. Test public templates endpoint
  console.log('\n   1. GET /api/templates (Public):');
  try {
    const getResponse = await fetch(`${API_BASE_URL}/templates`);
    const getData = await getResponse.json();
    console.log(`      Status: ${getResponse.status}`);
    console.log(`      Content-Type: ${getResponse.headers.get('content-type')}`);
    console.log(`      Response: ${JSON.stringify(getData).substring(0, 100)}...`);
  } catch (error) {
    console.log(`      ❌ Error: ${error.message}`);
  }
  
  // 3. Test protected endpoint without auth
  console.log('\n   2. POST /api/templates/from-components (No Auth):');
  try {
    const noAuthResponse = await fetch(`${API_BASE_URL}/templates/from-components`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        components: [{ type: 'text', props: { text: 'Test' } }],
        name: 'Diagnostic Template',
        category: 'test'
      })
    });
    const noAuthData = await noAuthResponse.json();
    console.log(`      Status: ${noAuthResponse.status}`);
    console.log(`      Response: ${JSON.stringify(noAuthData)}`);
  } catch (error) {
    console.log(`      ❌ Error: ${error.message}`);
  }
  
  // 4. Test protected endpoint with invalid auth
  console.log('\n   3. POST /api/templates/from-components (Invalid Auth):');
  try {
    const badAuthResponse = await fetch(`${API_BASE_URL}/templates/from-components`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token-123'
      },
      body: JSON.stringify({
        components: [{ type: 'text', props: { text: 'Test' } }],
        name: 'Diagnostic Template',
        category: 'test'
      })
    });
    const badAuthData = await badAuthResponse.json();
    console.log(`      Status: ${badAuthResponse.status}`);
    console.log(`      Response: ${JSON.stringify(badAuthData)}`);
  } catch (error) {
    console.log(`      ❌ Error: ${error.message}`);
  }
  
  // 5. Test user creation for auth testing
  console.log('\n   4. Attempting to create test user:');
  try {
    const signupResponse = await fetch(`${API_BASE_URL}/auth/signup/local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@diagnostic.com',
        password: 'test123',
        nickname: 'TestUser'
      })
    });
    const signupData = await signupResponse.json();
    console.log(`      Signup Status: ${signupResponse.status}`);
    console.log(`      Signup Response: ${JSON.stringify(signupData).substring(0, 200)}...`);
    
    if (signupResponse.status === 201 || signupResponse.status === 409) {
      // 6. Test login
      console.log('\n   5. Testing login:');
      const loginResponse = await fetch(`${API_BASE_URL}/auth/login/local`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@diagnostic.com',
          password: 'test123'
        })
      });
      const loginData = await loginResponse.json();
      console.log(`      Login Status: ${loginResponse.status}`);
      
      if (loginResponse.ok && loginData.access_token) {
        console.log(`      ✅ Login successful! Token obtained.`);
        
        // 7. Test templates endpoint with valid auth
        console.log('\n   6. POST /api/templates/from-components (Valid Auth):');
        const validAuthResponse = await fetch(`${API_BASE_URL}/templates/from-components`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loginData.access_token}`
          },
          body: JSON.stringify({
            components: [{ 
              type: 'text', 
              id: 'test-1',
              x: 100,
              y: 100,
              width: 200,
              height: 50,
              props: { text: 'Diagnostic Test Component' } 
            }],
            name: 'Diagnostic Template',
            category: 'test',
            tags: ['diagnostic', 'test'],
            canvasSettings: { canvasHeight: 1080 }
          })
        });
        
        console.log(`      Status: ${validAuthResponse.status}`);
        console.log(`      Content-Type: ${validAuthResponse.headers.get('content-type')}`);
        
        if (validAuthResponse.status === 500) {
          const errorText = await validAuthResponse.text();
          console.log(`      🚨 500 ERROR DETECTED!`);
          console.log(`      Error Response: ${errorText}`);
        } else {
          const validAuthData = await validAuthResponse.json();
          console.log(`      Response: ${JSON.stringify(validAuthData, null, 2)}`);
        }
        
      } else {
        console.log(`      ❌ Login failed: ${JSON.stringify(loginData)}`);
      }
    }
  } catch (error) {
    console.log(`      ❌ Auth test error: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🏁 DIAGNOSIS COMPLETE');
}

diagnosisReport().catch(console.error);