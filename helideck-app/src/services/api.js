const API_BASE_URL = 'http://localhost:5001/api';

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
  login: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return handleResponse(response);
  },

  register: async (username, email, password, role = null) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, ...(role && { role }) })
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
    // Backend doesn't have facility-specific endpoint, filter on client side
    const allInspections = await inspectionsAPI.getAll();
    return allInspections.filter(inspection => inspection.facility_id === facilityId);
  },

  create: async (inspectionData, attachments = []) => {
    const formData = new FormData();
    
    // Add inspection data fields
    Object.keys(inspectionData).forEach(key => {
      formData.append(key, inspectionData[key]);
    });
    
    // Add attachments if any
    attachments.forEach(file => {
      formData.append('attachments', file);
    });
    
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/inspections`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData
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
  }
};

// Health check API
export const healthAPI = {
  check: async () => {
    const response = await fetch(`${API_BASE_URL}/health`);
    return handleResponse(response);
  }
};

// Users API
export const userAPI = {
  getAllUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getUserById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  updateUserRole: async (userId, role) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role })
    });
    return handleResponse(response);
  },

  deleteUser: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getCurrentUserInfo: async () => {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  updatePassword: async (currentPassword, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/users/me/password`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    return handleResponse(response);
  },

  getRolesList: async () => {
    const response = await fetch(`${API_BASE_URL}/users/roles/list`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Note: Helicards and notifications are not yet implemented in the backend
// These will need to be added to the backend first