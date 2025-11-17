// Dashboard Debug Script
// Open browser console on your live dashboard and paste this:

console.log('🔍 Dashboard Debug Check...');

// Check environment variables
console.log('Environment Check:');
console.log('- API URL:', import.meta.env.VITE_API_URL);
console.log('- Supabase URL:', import.meta.env.VITE_SUPABASE_URL);

// Test backend API
console.log('\n🔌 Testing Backend API...');
if (import.meta.env.VITE_API_URL) {
  fetch(import.meta.env.VITE_API_URL + '/')
    .then(response => {
      console.log('✅ Backend API Status:', response.status);
      return response.json();
    })
    .then(data => {
      console.log('✅ Backend Response:', data);
    })
    .catch(error => {
      console.log('❌ Backend API Error:', error.message);
    });
}

// Test Supabase
console.log('\n🗄️ Testing Supabase...');
try {
  if (window.supabase) {
    window.supabase.auth.getSession()
      .then(({ data, error }) => {
        if (error) {
          console.log('❌ Supabase Auth Error:', error);
        } else {
          console.log('✅ Supabase Session:', !!data.session);
          console.log('✅ User ID:', data.session?.user?.id || 'Not logged in');
        }
      });
  } else {
    console.log('❌ Supabase client not available');
  }
} catch (error) {
  console.log('❌ Supabase Error:', error.message);
}

// Monitor network requests
console.log('\n📡 Monitor Network tab for slow requests...');
console.log('Look for requests taking >5 seconds');