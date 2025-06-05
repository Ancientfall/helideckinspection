const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }
  return response.json();
};

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(response);
  },

  register: async (name, email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    return handleResponse(response);
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

// Inspections API
export const inspectionsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/inspections`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/inspections/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getByFacility: async (facilityId) => {
    const response = await fetch(`${API_BASE_URL}/inspections/facility/${facilityId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  create: async (inspectionData) => {
    const response = await fetch(`${API_BASE_URL}/inspections`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(inspectionData)
    });
    return handleResponse(response);
  },

  update: async (id, inspectionData) => {
    const response = await fetch(`${API_BASE_URL}/inspections/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(inspectionData)
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/inspections/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Facilities API
export const facilitiesAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/facilities`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/facilities/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  create: async (facilityData) => {
    const response = await fetch(`${API_BASE_URL}/facilities`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(facilityData)
    });
    return handleResponse(response);
  },

  update: async (id, facilityData) => {
    const response = await fetch(`${API_BASE_URL}/facilities/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(facilityData)
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/facilities/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Statistics API
export const statsAPI = {
  getDashboard: async () => {
    const response = await fetch(`${API_BASE_URL}/stats/dashboard`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Helicard API
export const helicardAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/helicards`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/helicards/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  create: async (helicardData) => {
    const response = await fetch(`${API_BASE_URL}/helicards`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(helicardData)
    });
    return handleResponse(response);
  },

  update: async (id, helicardData) => {
    const response = await fetch(`${API_BASE_URL}/helicards/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(helicardData)
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/helicards/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};