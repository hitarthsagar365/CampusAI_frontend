import api from './api';

export const academicService = {
  // COURSES
  async getCourses(filters = {}) {
    const response = await api.get('/courses', { params: filters });
    return response.data.data;
  },
  async getCourseById(id) {
    const response = await api.get(`/courses/${id}`);
    return response.data.data;
  },
  async createCourse(courseData) {
    const response = await api.post('/courses', courseData);
    return response.data.data;
  },
  async updateCourse(id, courseData) {
    const response = await api.put(`/courses/${id}`, courseData);
    return response.data.data;
  },
  async deleteCourse(id) {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },

  // SUBJECTS
  async getSubjects(filters = {}) {
    const response = await api.get('/subjects', { params: filters });
    return response.data.data || response.data || [];
  },
  async getSubjectsByCourseAndSemester(course, semester) {
    const params = {};
    if (course && course !== 'All' && course !== 'All Departments') {
      params.course = course;
      params.department = course;
    }
    if (semester !== undefined && semester !== null && semester !== '' && semester !== 'All') {
      params.semester = String(semester).replace(/\D/g, '') || semester;
    }
    const response = await api.get('/subjects', { params });
    return response.data.data || response.data || [];
  },
  async getSubjectById(id) {
    const response = await api.get(`/subjects/${id}`);
    return response.data.data;
  },
  async createSubject(subjectData) {
    const response = await api.post('/subjects', subjectData);
    return response.data.data;
  },
  async updateSubject(id, subjectData) {
    const response = await api.put(`/subjects/${id}`, subjectData);
    return response.data.data;
  },
  async deleteSubject(id) {
    const response = await api.delete(`/subjects/${id}`);
    return response.data;
  },

  // CLASSES
  async getClasses(filters = {}) {
    const response = await api.get('/classes', { params: filters });
    return response.data.data;
  },
  async createClass(classData) {
    const response = await api.post('/classes', classData);
    return response.data.data;
  },
  async deleteClass(id) {
    const response = await api.delete(`/classes/${id}`);
    return response.data;
  }
};

export default academicService;
