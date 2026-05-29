
export const BACKEND_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:82/api';
export const DEFAULT_TIMEOUT = 60000; // 60 seconds - needed for operations like user creation that involve password hashing + email sending

