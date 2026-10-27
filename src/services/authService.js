import api, { setAccessToken, getAccessToken } from './api.js';

export const authService = {
  // Login: receives short-lived access token and sets it, HttpOnly cookie set by browser
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    const accessToken = response.data.accessToken || response.data.token;
    if (accessToken) {
      setAccessToken(accessToken);
    }
    if (response.data.user) {
      localStorage.setItem('currentUser', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Refresh Session via HttpOnly cookie
  async refreshSession() {
    const response = await api.post('/auth/refresh');
    const accessToken = response.data.accessToken || response.data.token;
    if (accessToken) {
      setAccessToken(accessToken);
    }
    if (response.data.user) {
      localStorage.setItem('currentUser', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Register Student
  async registerStudent(studentData) {
    const response = await api.post('/auth/register-student', studentData);
    return response.data;
  },

  // Register Faculty
  async registerFaculty(facultyData) {
    const response = await api.post('/auth/register-faculty', facultyData);
    return response.data;
  },

  // Get current logged-in user profile from MongoDB via JWT
  async getMe() {
    const response = await api.get('/auth/me');
    if (response.data.user) {
      localStorage.setItem('currentUser', JSON.stringify(response.data.user));
    }
    return response.data.user;
  },

  // Upload Profile Picture to Cloudinary via backend
  async updateProfilePicture(file) {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.post('/auth/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.data?.user) {
      localStorage.setItem('currentUser', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Get students (authenticated, with optional criteria params)
  async getStudents(params = {}) {
    const response = await api.get('/students', { params });
    return response.data.students || response.data.data || response.data;
  },

  // Get all faculty (authenticated)
  async getFaculty() {
    const response = await api.get('/auth/faculty');
    return response.data.data;
  },

  // Logout current session: revokes session in MongoDB & clears HttpOnly cookie
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Continue cleanup even if network fails
    }
    setAccessToken(null);
    localStorage.removeItem('currentUser');
  },

  // Logout from all devices: revokes all active sessions for user in MongoDB
  async logoutAll() {
    try {
      await api.post('/auth/logout-all');
    } catch (e) {
      // Continue cleanup even if network fails
    }
    setAccessToken(null);
    localStorage.removeItem('currentUser');
  },

  // Forgot Password: sends password reset email with token via Brevo HTTP API
  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reset Password: submit new password with token and email
  async resetPassword(token, emailOrPassword, newPassword) {
    try {
      let payload;
      if (newPassword !== undefined) {
        payload = { token, email: emailOrPassword, newPassword };
      } else {
        payload = { token, newPassword: emailOrPassword };
      }
      const response = await api.post('/auth/reset-password', payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Check if access token is present
  isAuthenticated() {
    return Boolean(getAccessToken());
  }
};

export default authService;
