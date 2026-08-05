const CONFIG = {
    // Dynamically use the current host (works for localhost and prod)
    API_BASE_URL: window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1') 
        ? 'http://localhost:5000/api' 
        : 'https://vkservicesenterprise.in/api',
};
