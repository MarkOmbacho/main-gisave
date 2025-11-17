// Quick Supabase Connection Test
// Run this in browser console on localhost:8080

console.log('Testing Supabase Connection...');
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

// Test if supabase client is working
if (window.supabase) {
  window.supabase.auth.getSession()
    .then(({ data, error }) => {
      console.log('Supabase Auth Test:', { data, error });
      if (!error) {
        console.log('✅ Supabase is working!');
      } else {
        console.log('❌ Supabase error:', error);
      }
    });
} else {
  console.log('Supabase client not found on window object');
}