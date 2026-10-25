import React, { useState, useEffect } from 'react';
import { BookOpen, GraduationCap, Loader2, AlertCircle } from 'lucide-react';
import subjectService from '../../services/subjectService';

/**
 * Cascading / Dependent Dropdown Component:
 * Select Course -> Fetches and updates Subjects dropdown for that course dynamically.
 * API Endpoint: GET /api/subjects?course=CyberSecurity
 */
export default function CourseSubjectDropdown({
  selectedCourse = '',
  selectedSubject = '',
  onCourseChange,
  onSubjectChange,
  courses = ['AIML', 'Cyber Security'],
  courseLabel = 'Course / Department',
  subjectLabel = 'Subject',
  isRequired = true,
  className = ''
}) {
  const [course, setCourse] = useState(selectedCourse);
  const [subject, setSubject] = useState(selectedSubject);
  const [subjectsList, setSubjectsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  // Sync internal state if external props change
  useEffect(() => {
    setCourse(selectedCourse);
  }, [selectedCourse]);

  useEffect(() => {
    setSubject(selectedSubject);
  }, [selectedSubject]);

  // Fetch subjects dynamically whenever the selected course changes
  useEffect(() => {
    if (!course) {
      setSubjectsList([]);
      setSubject('');
      return;
    }

    let isMounted = true;
    const fetchFilteredSubjects = async () => {
      try {
        setIsLoading(true);
        setFetchError('');
        // Calls GET /api/subjects?course=CyberSecurity
        const data = await subjectService.getSubjectsByCourse(course);
        if (isMounted) {
          const list = Array.isArray(data) ? data : [];
          setSubjectsList(list);

          // If the currently selected subject does not belong to the new course, reset it
          const stillValid = list.some(
            (s) => (s._id === subject || s.id === subject || s.name === subject)
          );
          if (!stillValid) {
            setSubject('');
            if (onSubjectChange) onSubjectChange('', null);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error(`Error loading subjects for course ${course}:`, err);
          setFetchError('Failed to load subjects for the selected course.');
          setSubjectsList([]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchFilteredSubjects();

    return () => {
      isMounted = false;
    };
  }, [course]);

  // Course onChange Handler
  const handleCourseChange = (e) => {
    const newCourse = e.target.value;
    setCourse(newCourse);
    setSubject(''); // Reset subject selection on course change

    if (onCourseChange) {
      onCourseChange(newCourse);
    }
    if (onSubjectChange) {
      onSubjectChange('', null);
    }
  };

  // Subject onChange Handler
  const handleSubjectChange = (e) => {
    const newSubjectId = e.target.value;
    setSubject(newSubjectId);

    const foundSubject = subjectsList.find(
      (s) => (s._id || s.id) === newSubjectId || s.name === newSubjectId
    ) || null;

    if (onSubjectChange) {
      onSubjectChange(newSubjectId, foundSubject);
    }
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {/* 1. Course Selection Dropdown */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
          <GraduationCap size={15} className="text-indigo-600" />
          {courseLabel} {isRequired && <span className="text-red-500">*</span>}
        </label>
        <select
          value={course}
          onChange={handleCourseChange}
          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
        >
          <option value="">-- Select Course --</option>
          {courses.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Dependent Subject Dropdown */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <BookOpen size={15} className="text-purple-600" />
            {subjectLabel} {isRequired && <span className="text-red-500">*</span>}
          </span>
          {isLoading && (
            <span className="text-[10px] text-indigo-600 flex items-center gap-1 font-medium">
              <Loader2 size={12} className="animate-spin" /> Loading subjects...
            </span>
          )}
        </label>
        <select
          value={subject}
          onChange={handleSubjectChange}
          disabled={!course || isLoading}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
            !course || isLoading
              ? 'bg-gray-100/70 border-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-50 border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600'
          }`}
        >
          {!course ? (
            <option value="">-- Select a course first --</option>
          ) : isLoading ? (
            <option value="">Fetching {course} subjects...</option>
          ) : subjectsList.length === 0 ? (
            <option value="">No subjects found for {course}</option>
          ) : (
            <>
              <option value="">-- Select Subject ({course}) --</option>
              {subjectsList.map((s) => {
                const sId = s._id || s.id || s.name;
                const sName = s.name || s.title || s.subjectName;
                const sCode = s.code ? `(${s.code})` : '';
                const sType = s.type ? `• ${s.type}` : '';
                return (
                  <option key={sId} value={sId}>
                    {sName} {sCode} {sType}
                  </option>
                );
              })}
            </>
          )}
        </select>

        {fetchError && (
          <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle size={12} /> {fetchError}
          </p>
        )}
      </div>
    </div>
  );
}
