#!/usr/bin/env node

const API_BASE_URL = 'http://localhost:5001/api';

async function testBackendIntegration() {
  console.log('Testing Backend Integration...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Endpoint...');
    const healthRes = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthRes.json();
    console.log('✓ Health check:', healthData.message);

    // Test 2: Register a new user
    console.log('\n2. Testing User Registration...');
    const testUser = {
      username: 'testuser' + Date.now(),
      email: `test${Date.now()}@example.com`,
      password: 'testpass123'
    };
    
    const registerRes = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    if (!registerRes.ok) {
      const error = await registerRes.json();
      throw new Error(error.error || 'Registration failed');
    }
    
    const registerData = await registerRes.json();
    console.log('✓ User registered:', registerData.user.username);
    const token = registerData.token;

    // Test 3: Login
    console.log('\n3. Testing Login...');
    const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: testUser.username,
        password: testUser.password
      })
    });
    
    const loginData = await loginRes.json();
    console.log('✓ Login successful:', loginData.user.username);

    // Test 4: Get Facilities
    console.log('\n4. Testing Facilities Endpoint...');
    const facilitiesRes = await fetch(`${API_BASE_URL}/facilities`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const facilities = await facilitiesRes.json();
    console.log(`✓ Retrieved ${facilities.length} facilities`);
    console.log('  Example:', facilities[0].name);

    // Test 5: Create Inspection
    console.log('\n5. Testing Inspection Creation...');
    const inspectionData = {
      facility_id: facilities[0].id,
      facility_name: facilities[0].name,
      inspection_date: new Date().toISOString().split('T')[0],
      inspector_name: testUser.username,
      helideck_condition: 'Good',
      lighting_status: 'Operational',
      perimeter_net_status: 'Intact',
      friction_test_result: 'Pass',
      overall_status: 'Compliant',
      notes: 'Test inspection from integration test'
    };

    const inspectionRes = await fetch(`${API_BASE_URL}/inspections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(inspectionData)
    });

    const newInspection = await inspectionRes.json();
    console.log('✓ Inspection created with ID:', newInspection.id);

    // Test 6: Get Inspections
    console.log('\n6. Testing Get Inspections...');
    const inspectionsRes = await fetch(`${API_BASE_URL}/inspections`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const inspections = await inspectionsRes.json();
    console.log(`✓ Retrieved ${inspections.length} inspection(s)`);

    console.log('\n✅ All tests passed! Backend integration is working correctly.');
    console.log('\nYou can now:');
    console.log('1. Start the frontend: cd helideck-app && npm start');
    console.log('2. Register/login with a new account');
    console.log('3. Create and view inspections');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nMake sure the backend is running on port 5001');
  }
}

testBackendIntegration();