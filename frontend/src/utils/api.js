// Centralized API configuration
// During local development, VITE_API_URL will fall back to http://localhost:5000 if not set.
// On production (Vercel), VITE_API_URL should be set to the Render backend URL.

export const API_BASE = import.meta.env.VITE_API_URL || '';
