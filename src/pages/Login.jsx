import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { GraduationCap, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, CheckCircle2, Mail, X } from 'lucide-react';
import { DEPARTMENT_OPTIONS } from '../constants/departments';
import authService from '../services/authService';
import subjectService from '../services/subjectService';
import { useAuth } from '../context/AuthContext';

export default function Login({ currentUser, setCurrentUser, students = [], setStudents, faculty = [], setFaculty }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('login'); // 'login' | 'reg_student' | 'reg_faculty'
  const [role, setRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Login state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState({});

  // Forgot Password modal state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotMessage('');

    if (!forgotEmail || !forgotEmail.trim()) {
      setForgotError('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotEmail.trim())) {
      setForgotError('Please enter a valid email address.');
      return;
    }

    try {
      setForgotLoading(true);
      const data = await authService.forgotPassword(forgotEmail.trim());
      setForgotMessage(data?.message || 'If an account with that email exists, a reset link has been sent.');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to request password reset. Please try again.';
      setForgotError(message);
    } finally {
      setForgotLoading(false);
    }
  };

  // Student Reg State
  const [stName, setStName] = useState('');
  const [stEnrollment, setStEnrollment] = useState('');
  const [stEmail, setStEmail] = useState('');
  const [stCourse, setStCourse] = useState('');
  const [stSemester, setStSemester] = useState('');
  const [stDepartment, setStDepartment] = useState('');
  const [stPassword, setStPassword] = useState('');
  const [stErrors, setStErrors] = useState({});

  // Faculty Reg State
  const [faName, setFaName] = useState('');
  const [faUsername, setFaUsername] = useState('');
  const [faEmail, setFaEmail] = useState('');
  const [faDepartment, setFaDepartment] = useState('AIML');
  const [faSemester, setFaSemester] = useState('7');
  const [faClassSection, setFaClassSection] = useState('A');
  const [faAssignedSubject, setFaAssignedSubject] = useState('');
  const [faPassword, setFaPassword] = useState('');
  const [faErrors, setFaErrors] = useState({});

  // Global 3-level cascade: subjects query filtered dynamically by selected faculty department AND semester
  const { data: subjects = [], isLoading: isSubjectsLoading } = useQuery({
    queryKey: ['subjects', faDepartment, faSemester],
    queryFn: () =>
      faDepartment && faSemester
        ? subjectService.getSubjectsByCourseAndSemester(faDepartment, faSemester)
        : [],
    enabled: Boolean(faDepartment && faSemester),
    staleTime: 5 * 60 * 1000
  });

  // Mutations
  const loginMutation = useMutation({
    mutationFn: (credentials) => login(credentials),
    onSuccess: (data) => {
      const user = data.user;
      if (setCurrentUser) {
        setCurrentUser(user);
      }
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'teacher' || user.role === 'faculty') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    },
    onError: (error) => {
      setLoginErrors({ general: error.message });
    }
  });

  const studentRegMutation = useMutation({
    mutationFn: (data) => authService.registerStudent(data),
    onSuccess: (data) => {
      if (setStudents) {
        setStudents(prev => [...prev, data.user]);
      }
      setStName('');
      setStEnrollment('');
      setStEmail('');
      setStCourse('');
      setStSemester('');
      setStDepartment('');
      setStPassword('');
      setStErrors({});
      setSuccessMsg('Student registration successful! You can now log in.');
      setViewMode('login');
      setRole('student');
      setIdentifier(data.user.enrollment);
    },
    onError: (error) => {
      setStErrors({ general: error.message });
    }
  });

  const facultyRegMutation = useMutation({
    mutationFn: (data) => authService.registerFaculty(data),
    onSuccess: (data) => {
      if (setFaculty) {
        setFaculty(prev => [...prev, data.user]);
      }
      setFaName('');
      setFaUsername('');
      setFaEmail('');
      setFaDepartment('AIML');
      setFaSemester('7');
      setFaClassSection('A');
      setFaAssignedSubject('');
      setFaPassword('');
      setFaErrors({});
      setSuccessMsg('Faculty registration successful! You can now log in.');
      setViewMode('login');
      setRole('teacher');
      setIdentifier(data.user.username);
    },
    onError: (error) => {
      setFaErrors({ general: error.message });
    }
  });

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setIdentifier('');
    setPassword('');
    setLoginErrors({});
    setSuccessMsg('');
  };

  const handleSwitchMode = (mode) => {
    setViewMode(mode);
    setLoginErrors({});
    setStErrors({});
    setFaErrors({});
    setSuccessMsg('');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!identifier.trim()) {
      if (role === 'student') {
        newErrors.identifier = 'Enrollment number is required.';
      } else {
        newErrors.identifier = 'Username is required.';
      }
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setLoginErrors(newErrors);
      return;
    }

    loginMutation.mutate({
      role,
      identifier: identifier.trim(),
      password
    });
  };

  const handleRegisterStudent = (e) => {
    e.preventDefault();
    const errs = {};

    if (!stName.trim()) errs.name = 'Student name is required.';
    if (!stEnrollment.trim()) {
      errs.enrollment = 'Enrollment number is required.';
    }

    if (!stEmail.trim()) {
      errs.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stEmail.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!stCourse) errs.course = 'Please select a course.';
    if (!stSemester) errs.semester = 'Please select a semester.';
    if (!stDepartment) errs.department = 'Please select a department.';
    if (!stPassword) errs.password = 'Password is required.';

    if (Object.keys(errs).length > 0) {
      setStErrors(errs);
      setSuccessMsg('');
      return;
    }

    studentRegMutation.mutate({
      name: stName.trim(),
      enrollment: stEnrollment.trim(),
      email: stEmail.trim(),
      course: stCourse,
      semester: stSemester,
      department: stDepartment,
      password: stPassword
    });
  };

  const handleRegisterFaculty = (e) => {
    e.preventDefault();
    const errs = {};

    if (!faName.trim()) errs.name = 'Faculty name is required.';
    if (!faUsername.trim()) {
      errs.username = 'Username is required.';
    }

    if (!faEmail.trim()) {
      errs.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(faEmail.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!faDepartment) errs.department = 'Please select a department.';
    if (!faSemester) errs.semester = 'Please select a semester.';
    if (!faClassSection.trim()) errs.classSection = 'Class / Section is required.';
    if (!faAssignedSubject.trim()) errs.assignedSubject = 'Assigned / Elective Subject is required.';
    if (!faPassword) errs.password = 'Password is required.';

    if (Object.keys(errs).length > 0) {
      setFaErrors(errs);
      setSuccessMsg('');
      return;
    }

    facultyRegMutation.mutate({
      name: faName.trim(),
      username: faUsername.trim(),
      email: faEmail.trim(),
      department: faDepartment,
      semester: faSemester,
      classSection: faClassSection.trim(),
      assignedSubject: faAssignedSubject.trim(),
      password: faPassword
    });
  };

  const getLabel = () => {
    if (role === 'student') return 'Enrollment Number';
    if (role === 'teacher') return 'Username / Name';
    return 'Username';
  };

  const getPlaceholder = () => {
    if (role === 'student') return 'Enter enrollment number';
    if (role === 'teacher') return 'Enter username or name';
    return 'Enter admin username';
  };

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Dot Grid */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#4f46e5 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-indigo-950/5 border border-gray-100 p-8 sm:p-10 relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold text-xs">
            <GraduationCap size={16} />
            <span>Campus AI</span>
          </div>
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl text-center">
            {successMsg}
          </div>
        )}

        {viewMode === 'login' ? (
          <>
            {/* Heading */}
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h1>
              <p className="text-gray-500 text-sm mt-1.5">Sign in to your Campus AI account</p>
            </div>

            {/* Role Segmented Toggle */}
            <div className="bg-gray-100/80 p-1 rounded-2xl flex gap-1 mb-6">
              <button
                type="button"
                onClick={() => handleRoleChange('student')}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                  role === 'student'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('teacher')}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                  role === 'teacher'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Faculty
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                  role === 'admin'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Administration
              </button>
            </div>

            {/* General Error Banner */}
            {loginErrors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-red-500" />
                <span>{loginErrors.general}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} noValidate className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  {getLabel()}
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (loginErrors.identifier || loginErrors.general) {
                      setLoginErrors({});
                    }
                  }}
                  placeholder={getPlaceholder()}
                  className={`w-full px-4 py-3 rounded-xl border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                    loginErrors.identifier
                      ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                      : 'border-gray-200 focus:ring-indigo-500/20 focus:border-indigo-600'
                  }`}
                />
                {loginErrors.identifier && (
                  <p className="text-xs text-red-500 font-medium mt-1">{loginErrors.identifier}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-gray-700">Password</label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (loginErrors.password || loginErrors.general) {
                        setLoginErrors({});
                      }
                    }}
                    placeholder="Enter your password"
                    className={`w-full px-4 py-3 rounded-xl border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all pr-10 ${
                      loginErrors.password
                        ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                        : 'border-gray-200 focus:ring-indigo-500/20 focus:border-indigo-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {loginErrors.password && (
                  <p className="text-xs text-red-500 font-medium mt-1">{loginErrors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 mt-2"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Login to Dashboard</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center space-y-2">
              <p className="text-xs text-gray-500">Need an account?</p>
              <div className="flex justify-center gap-4 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => handleSwitchMode('reg_student')}
                  className="text-indigo-600 hover:underline"
                >
                  Register as Student
                </button>
                <span className="text-gray-300">•</span>
                <button
                  type="button"
                  onClick={() => handleSwitchMode('reg_faculty')}
                  className="text-indigo-600 hover:underline"
                >
                  Register as Faculty
                </button>
              </div>
            </div>
          </>
        ) : viewMode === 'reg_student' ? (
          <>
            {/* Student Registration Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Student Registration</h1>
              <p className="text-gray-500 text-xs mt-1">Create your student account</p>
            </div>

            {/* General Error Banner */}
            {stErrors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-red-500" />
                <span>{stErrors.general}</span>
              </div>
            )}

            <form onSubmit={handleRegisterStudent} noValidate className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Student Name *</label>
                <input
                  type="text"
                  value={stName}
                  onChange={(e) => {
                    setStName(e.target.value);
                    if (stErrors.name || stErrors.general) setStErrors({});
                  }}
                  placeholder="Enter full name"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                    stErrors.name ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:ring-indigo-500/20'
                  }`}
                />
                {stErrors.name && <p className="text-xs text-red-500 font-medium mt-1">{stErrors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Enrollment Number *</label>
                <input
                  type="text"
                  value={stEnrollment}
                  onChange={(e) => {
                    setStEnrollment(e.target.value);
                    if (stErrors.enrollment || stErrors.general) setStErrors({});
                  }}
                  placeholder="e.g. STU2024001"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                    stErrors.enrollment ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:ring-indigo-500/20'
                  }`}
                />
                {stErrors.enrollment && <p className="text-xs text-red-500 font-medium mt-1">{stErrors.enrollment}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={stEmail}
                  onChange={(e) => {
                    setStEmail(e.target.value);
                    if (stErrors.email || stErrors.general) setStErrors({});
                  }}
                  placeholder="Enter email address"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                    stErrors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:ring-indigo-500/20'
                  }`}
                />
                {stErrors.email && <p className="text-xs text-red-500 font-medium mt-1">{stErrors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Course *</label>
                  <select
                    value={stCourse}
                    onChange={(e) => {
                      setStCourse(e.target.value);
                      if (stErrors.course || stErrors.general) setStErrors({});
                    }}
                    className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-xs font-medium text-gray-800 focus:outline-none ${
                      stErrors.course ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Select Course</option>
                    <option value="AIML">AIML</option>
                    <option value="Cyber Security">Cyber Security</option>
                    <option value="All Departments">All Departments</option>
                  </select>
                  {stErrors.course && <p className="text-xs text-red-500 font-medium mt-1">{stErrors.course}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Semester *</label>
                  <select
                    value={stSemester}
                    onChange={(e) => {
                      setStSemester(e.target.value);
                      if (stErrors.semester || stErrors.general) setStErrors({});
                    }}
                    className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-xs font-medium text-gray-800 focus:outline-none ${
                      stErrors.semester ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Select Semester</option>
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                    <option value="Semester 3">Semester 3</option>
                    <option value="Semester 4">Semester 4</option>
                    <option value="Semester 5">Semester 5</option>
                    <option value="Semester 6">Semester 6</option>
                    <option value="Semester 7">Semester 7</option>
                    <option value="Semester 8">Semester 8</option>
                  </select>
                  {stErrors.semester && <p className="text-xs text-red-500 font-medium mt-1">{stErrors.semester}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Department *</label>
                <select
                  value={stDepartment}
                  onChange={(e) => {
                    setStDepartment(e.target.value);
                    if (stErrors.department || stErrors.general) setStErrors({});
                  }}
                  className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-xs font-medium text-gray-800 focus:outline-none ${
                    stErrors.department ? 'border-red-500' : 'border-gray-200'
                  }`}
                >
                  <option value="">Select Department</option>
                  {DEPARTMENT_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {stErrors.department && <p className="text-xs text-red-500 font-medium mt-1">{stErrors.department}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  value={stPassword}
                  onChange={(e) => {
                    setStPassword(e.target.value);
                    if (stErrors.password || stErrors.general) setStErrors({});
                  }}
                  placeholder="Create password"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                    stErrors.password ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:ring-indigo-500/20'
                  }`}
                />
                {stErrors.password && <p className="text-xs text-red-500 font-medium mt-1">{stErrors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={studentRegMutation.isPending}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-xs rounded-xl transition-all shadow-sm mt-2 flex items-center justify-center gap-2"
              >
                {studentRegMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Registering Student...</span>
                  </>
                ) : (
                  <span>Register Student</span>
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                ← Back to Login
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Faculty Registration Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Faculty Registration</h1>
              <p className="text-gray-500 text-xs mt-1">Create your faculty account</p>
            </div>

            {/* General Error Banner */}
            {faErrors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-red-500" />
                <span>{faErrors.general}</span>
              </div>
            )}

            <form onSubmit={handleRegisterFaculty} noValidate className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Faculty Name *</label>
                <input
                  type="text"
                  value={faName}
                  onChange={(e) => {
                    setFaName(e.target.value);
                    if (faErrors.name || faErrors.general) setFaErrors({});
                  }}
                  placeholder="Enter full name"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                    faErrors.name ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:ring-indigo-500/20'
                  }`}
                />
                {faErrors.name && <p className="text-xs text-red-500 font-medium mt-1">{faErrors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Username *</label>
                <input
                  type="text"
                  value={faUsername}
                  onChange={(e) => {
                    setFaUsername(e.target.value);
                    if (faErrors.username || faErrors.general) setFaErrors({});
                  }}
                  placeholder="Create username"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                    faErrors.username ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:ring-indigo-500/20'
                  }`}
                />
                {faErrors.username && <p className="text-xs text-red-500 font-medium mt-1">{faErrors.username}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={faEmail}
                  onChange={(e) => {
                    setFaEmail(e.target.value);
                    if (faErrors.email || faErrors.general) setFaErrors({});
                  }}
                  placeholder="Enter email address"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                    faErrors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:ring-indigo-500/20'
                  }`}
                />
                {faErrors.email && <p className="text-xs text-red-500 font-medium mt-1">{faErrors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Department / Course *</label>
                <select
                  value={faDepartment}
                  onChange={(e) => {
                    const newDept = e.target.value;
                    setFaDepartment(newDept);
                    setFaSemester(''); // Reset dependent semester selection
                    setFaAssignedSubject(''); // Reset dependent subject selection
                    if (faErrors.department || faErrors.general) setFaErrors({});
                  }}
                  className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-xs font-medium text-gray-800 focus:outline-none ${
                    faErrors.department ? 'border-red-500' : 'border-gray-200'
                  }`}
                >
                  <option value="">Select Department / Course</option>
                  {DEPARTMENT_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {faErrors.department && <p className="text-xs text-red-500 font-medium mt-1">{faErrors.department}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Semester *</label>
                  <select
                    value={faSemester}
                    disabled={!faDepartment}
                    onChange={(e) => {
                      const newSem = e.target.value;
                      setFaSemester(newSem);
                      setFaAssignedSubject(''); // Reset dependent subject selection on semester change
                      if (faErrors.semester || faErrors.general) setFaErrors({});
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all focus:outline-none ${
                      !faDepartment
                        ? 'bg-gray-100/70 border-gray-200 text-gray-400 cursor-not-allowed'
                        : faErrors.semester
                        ? 'bg-gray-50 border-red-500 text-gray-800'
                        : 'bg-gray-50 border-gray-200 text-gray-800'
                    }`}
                  >
                    <option value="">
                      {!faDepartment ? '-- Select Course first --' : '-- Select Semester --'}
                    </option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={String(sem)}>Semester {sem}</option>
                    ))}
                  </select>
                  {faErrors.semester && <p className="text-xs text-red-500 font-medium mt-1">{faErrors.semester}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Class / Section *</label>
                  <input
                    type="text"
                    value={faClassSection}
                    onChange={(e) => {
                      setFaClassSection(e.target.value);
                      if (faErrors.classSection || faErrors.general) setFaErrors({});
                    }}
                    placeholder="e.g. A or Section A"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                      faErrors.classSection ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:ring-indigo-500/20'
                    }`}
                  />
                  {faErrors.classSection && <p className="text-xs text-red-500 font-medium mt-1">{faErrors.classSection}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Assigned / Elective Subject *</label>
                <div className="relative">
                  <select
                    value={faAssignedSubject}
                    onChange={(e) => {
                      setFaAssignedSubject(e.target.value);
                      if (faErrors.assignedSubject || faErrors.general) setFaErrors({});
                    }}
                    disabled={isSubjectsLoading || !faDepartment || !faSemester}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 ${
                      faErrors.assignedSubject
                        ? 'border-red-500 focus:ring-red-500/20'
                        : 'border-gray-200 focus:ring-indigo-500/20'
                    } ${isSubjectsLoading || !faDepartment || !faSemester ? 'opacity-70 cursor-not-allowed bg-gray-100/70' : ''}`}
                  >
                    <option value="">
                      {!faDepartment
                        ? '-- Select Department / Course first --'
                        : !faSemester
                        ? '-- Select Semester first --'
                        : isSubjectsLoading
                        ? `Loading ${faDepartment} (Sem ${faSemester}) subjects...`
                        : `-- Select Assigned Subject (${faDepartment} - Sem ${faSemester}) --`}
                    </option>
                    {Array.isArray(subjects) && subjects.length > 0 ? (
                      subjects.map((subj) => {
                        const sName = subj.name || subj.subjectName || subj.title || '';
                        const sCode = subj.code || subj.subjectCode || '';
                        return (
                          <option key={subj._id || subj.id || sName} value={sName}>
                            {sName} {sCode ? `(${sCode})` : ''} {subj.dept ? `— ${subj.dept}` : ''}
                          </option>
                        );
                      })
                    ) : (
                      !isSubjectsLoading && faDepartment && faSemester && (
                        <option value="" disabled>No subjects available for {faDepartment} (Sem {faSemester})</option>
                      )
                    )}
                  </select>
                  {isSubjectsLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Loader2 size={14} className="animate-spin text-gray-400" />
                    </div>
                  )}
                </div>
                {faErrors.assignedSubject && <p className="text-xs text-red-500 font-medium mt-1">{faErrors.assignedSubject}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  value={faPassword}
                  onChange={(e) => {
                    setFaPassword(e.target.value);
                    if (faErrors.password || faErrors.general) setFaErrors({});
                  }}
                  placeholder="Create password"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                    faErrors.password ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:ring-indigo-500/20'
                  }`}
                />
                {faErrors.password && <p className="text-xs text-red-500 font-medium mt-1">{faErrors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={facultyRegMutation.isPending}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-xs rounded-xl transition-all shadow-sm mt-2 flex items-center justify-center gap-2"
              >
                {facultyRegMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Registering Faculty...</span>
                  </>
                ) : (
                  <span>Register Faculty</span>
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                ← Back to Login
              </button>
            </div>
          </>
        )}
      </div>

      <footer className="mt-8 text-xs text-gray-400 text-center">
        © 2024 Campus AI. Academic Hub.
      </footer>
    </div>
  );
}
