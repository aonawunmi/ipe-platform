// Simple test script for authentication endpoints

const testRegister = async () => {
  try {
    const response = await fetch('http://localhost:3000/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@ipe.com',
        password: 'SecurePass123!',
        fullName: 'Test User',
        phone: '+2348012345678'
      })
    });

    const data = await response.json();
    console.log('\n✅ REGISTER TEST:');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('❌ REGISTER ERROR:', error.message);
    return null;
  }
};

const testLogin = async () => {
  try {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@ipe.com',
        password: 'SecurePass123!'
      })
    });

    const data = await response.json();
    console.log('\n✅ LOGIN TEST:');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('❌ LOGIN ERROR:', error.message);
    return null;
  }
};

const testGetMe = async (accessToken) => {
  try {
    const response = await fetch('http://localhost:3000/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    });

    const data = await response.json();
    console.log('\n✅ GET ME TEST:');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('❌ GET ME ERROR:', error.message);
    return null;
  }
};

// Run tests
(async () => {
  console.log('🎯 Testing IPE Authentication API\n');
  console.log('=' .repeat(50));

  const registerResult = await testRegister();

  if (registerResult && registerResult.accessToken) {
    console.log('\n' + '='.repeat(50));
    await testLogin();

    console.log('\n' + '='.repeat(50));
    await testGetMe(registerResult.accessToken);
  }

  console.log('\n' + '='.repeat(50));
  console.log('\n✅ All authentication tests completed!');
})();
