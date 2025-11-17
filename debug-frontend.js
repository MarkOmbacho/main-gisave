// Test script to check what API URL your live site is using
// Open browser console on https://main-gisave.vercel.app and paste this:

console.log('🔍 Checking Frontend Configuration...');
console.log('Current URL:', window.location.href);
console.log('Mode:', import.meta.env?.MODE || 'unknown');
console.log('VITE_API_URL:', import.meta.env?.VITE_API_URL || 'NOT SET');
console.log('VITE_SUPABASE_URL:', import.meta.env?.VITE_SUPABASE_URL || 'NOT SET');

// Test if API is reachable
if (import.meta.env?.VITE_API_URL) {
  fetch(import.meta.env.VITE_API_URL + '/')
    .then(response => response.json())
    .then(data => {
      console.log('✅ Backend connection test:', data);
    })
    .catch(error => {
      console.log('❌ Backend connection failed:', error.message);
    });
} else {
  console.log('❌ VITE_API_URL not set - this is the problem!');
}