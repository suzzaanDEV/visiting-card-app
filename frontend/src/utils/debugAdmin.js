// Debug utility for admin authentication
export const debugAdminAuth = async () => {
  try {
    console.log('🔍 Debugging admin authentication...');
    
    // Check if admin token exists
    const adminToken = localStorage.getItem('adminToken');
    console.log('Admin token exists:', !!adminToken);
    if (adminToken) {
      console.log('Token length:', adminToken.length);
      console.log('Token preview:', adminToken.substring(0, 50) + '...');
    }
    
    // Test admin login
    const loginResponse = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@cardly.com',
        password: 'password'
      })
    });
    
    console.log('Login response status:', loginResponse.status);
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('Login successful:', loginData);
      
      // Test access requests with the new token
      const accessResponse = await fetch('/api/admin/access-requests', {
        headers: {
          'Authorization': `Bearer ${loginData.token}`
        }
      });
      
      console.log('Access requests response status:', accessResponse.status);
      
      if (accessResponse.ok) {
        const accessData = await accessResponse.json();
        console.log('Access requests successful:', accessData);
        console.log('Number of requests:', accessData.requests?.length || 0);
      } else {
        const errorData = await accessResponse.json();
        console.error('Access requests failed:', errorData);
      }
    } else {
      const errorData = await loginResponse.json();
      console.error('Login failed:', errorData);
    }
  } catch (error) {
    console.error('Debug error:', error);
  }
};

// Export for use in browser console
window.debugAdminAuth = debugAdminAuth; 