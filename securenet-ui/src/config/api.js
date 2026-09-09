// ============================================================
// Central API configuration
// All components must import from here — NEVER hardcode URLs
// ============================================================

// In production this is set to your Render backend URL via Vercel env vars
// In development it falls back to localhost
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const API_V1   = `${API_BASE}/api/v1`;

// WebSocket: auto-switches between ws:// and wss:// based on API_BASE protocol
export const WS_URL   = (import.meta.env.VITE_API_URL || 'http://localhost:8000')
  .replace(/^https/, 'wss')
  .replace(/^http/, 'ws') + '/ws';
