const authService = {
  register: (user) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if user already exists
    if (users.find(u => u.email === user.email)) {
      throw new Error('User already exists');
    }
    
    // Add new user
    const newUser = {
      id: Date.now().toString(),
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role || 'user',
      adminId: user.role === 'user' ? user.adminId : null,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // If user is admin and has users array, store the relation
    if (user.role === 'admin' && user.users) {
      localStorage.setItem(`admin_${newUser.id}_users`, JSON.stringify(user.users));
    }
    
    return newUser;
  },

  login: (email, password, role = null) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // If role is specified, check if it matches
    if (role && user.role !== role) {
      throw new Error('Invalid role for this user');
    }
    
    // Store current user in sessionStorage
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    
    return user;
  },

  logout: () => {
    sessionStorage.removeItem('currentUser');
  },

  getCurrentUser: () => {
    const user = sessionStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  },

  getUsers: () => {
    return JSON.parse(localStorage.getItem('users') || '[]');
  },

  updateUser: (userId, updates) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    users[userIndex] = { ...users[userIndex], ...updates };
    localStorage.setItem('users', JSON.stringify(users));
    
    // Update current user if it's the same user
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      sessionStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
    }
    
    return users[userIndex];
  }
};

export default authService;
