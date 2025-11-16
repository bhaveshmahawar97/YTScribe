// Simple API helper for authentication-related requests
// Uses the Fetch API and sends cookies (credentials) with every request

const API_BASE_URL = 'http://localhost:5000';

async function request(path, options = {}) {
  const response = await fetch(API_BASE_URL + path, {
    credentials: 'include', // important so browser sends/receives cookies
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  let data = {};
  try {
    data = await response.json();
  } catch (e) {
    // If response has no JSON body, keep data as empty object
  }

  if (!response.ok) {
    // Throw a simple Error so components can show a toast or inline message
    const message = data.message || 'Something went wrong';
    throw new Error(message);
  }

  return data;
}

// Register a new user with the backend
export function registerUser(payload) {
  // payload: { name, email, password, confirmPassword }
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Log in a user with email and password
export function loginUser(payload) {
  // payload: { email, password }
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Ask backend who the current logged-in user is (based on cookies)
export function getCurrentUser() {
  return request('/api/user/me', {
    method: 'GET',
  });
}

// Log out on the backend (clears cookies)
export function logoutUser() {
  return request('/api/auth/logout', {
    method: 'POST',
  });
}
