export const initializeDefaultUsers = () => {
  const existingUsers = localStorage.getItem('users');
  if (!existingUsers) {
    const defaultUsers = [
      {
        id: '1',
        email: 'admin@hims.com',
        password: 'admin123',
        name: 'System Administrator',
        role: 'admin',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        email: 'inspector@hims.com',
        password: 'inspector123',
        name: 'John Inspector',
        role: 'inspector',
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        email: 'viewer@hims.com',
        password: 'viewer123',
        name: 'Jane Viewer',
        role: 'viewer',
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem('users', JSON.stringify(defaultUsers));
  }
};

export const getUserById = (userId) => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  return users.find(user => user.id === userId);
};

export const createUser = (userData) => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const newUser = {
    ...userData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  return newUser;
};

export const updateUser = (userId, updates) => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const index = users.findIndex(user => user.id === userId);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    localStorage.setItem('users', JSON.stringify(users));
    return users[index];
  }
  return null;
};

export const deleteUser = (userId) => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const filtered = users.filter(user => user.id !== userId);
  localStorage.setItem('users', JSON.stringify(filtered));
};