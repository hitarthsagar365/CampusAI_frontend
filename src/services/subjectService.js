import api from './api';

export const subjectService = {
  // Fetch all subjects with optional filtering (e.g. by department or course)
  async getSubjects(filters = {}) {
    const response = await api.get('/subjects', { params: filters });
    return response.data.data || response.data || [];
  },

  // Requirement 3: Filter subjects dynamically by course (e.g. GET /api/subjects?course=CyberSecurity)
  async getSubjectsByCourse(course) {
    const response = await api.get('/subjects', { params: { course } });
    return response.data.data || response.data || [];
  },

  async getSubjectById(id) {
    const response = await api.get(`/subjects/${id}`);
    return response.data.data || response.data;
  },

  async createSubject(subjectData) {
    const response = await api.post('/subjects', subjectData);
    return response.data.data || response.data;
  },

  async updateSubject(id, subjectData) {
    const response = await api.put(`/subjects/${id}`, subjectData);
    return response.data.data || response.data;
  },

  async deleteSubject(id) {
    const response = await api.delete(`/subjects/${id}`);
    return response.data;
  }
};

export default subjectService;
