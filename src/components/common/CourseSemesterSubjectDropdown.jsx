import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, GraduationCap, Layers, Loader2, AlertCircle } from 'lucide-react';
import subjectService from '../../services/subjectService';

/**
 * Global 3-Level Dependent Cascading Dropdown:
 * Course -> Semester -> Subject
 * 
 * - Dropdown 1: Select Course (AIML, Cyber Security, etc.)
 * - Dropdown 2: Select Semester (Enabled only after Course is selected. Resets on Course change.)
 * - Dropdown 3: Select Subject (Dynamically fetches subjects matching BOTH Course & Semester.
 *                                Enabled only after Course & Semester are selected.
 *                                Resets on Course or Semester change.)
 */
export default function CourseSemesterSubjectDropdown({
  selectedCourse = '',
  selectedSemester = '',
  selectedSubject = '',
  onCourseChange,
  onSemesterChange,
  onSubjectChange,
  onChange, // Unified callback: ({ course, semester, subject, subjectObj }) => void
  courses = ['AIML', 'Cyber Security'],
  semesters = [1, 2, 3, 4, 5, 6, 7, 8],
  courseLabel = 'Course / Department',
  semesterLabel = 'Semester',
  subjectLabel = 'Subject',
  isRequired = true,
  disabled = false,
  layout = 'grid', // 'grid' | 'row' | 'stacked'
  size = 'md', // 'sm' | 'md'
  subjectValueField = 'name', // 'name' | '_id'
  includeAllCourses = false,
  allCoursesLabel = 'All Departments',
  placeholderCourse = '-- Select Course --',
  placeholderSemester = '-- Select Semester --',
  placeholderSubject = '-- Select Subject --',
  className = ''
}) {
  const [course, setCourse] = useState(selectedCourse || '');
  const [semester, setSemester] = useState(selectedSemester ? String(selectedSemester) : '');
  const [subject, setSubject] = useState(selectedSubject || '');
  const [subjectsList, setSubjectsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  // Keep track of internal updates to prevent infinite loops with external synchronization
  const lastEmittedRef = useRef({ course: selectedCourse, semester: selectedSemester, subject: selectedSubject });

  // Sync internal state when external props change
  useEffect(() => {
    if (selectedCourse !== undefined && selectedCourse !== course) {
      setCourse(selectedCourse || '');
    }
  }, [selectedCourse]);

  useEffect(() => {
    const semStr = selectedSemester ? String(selectedSemester) : '';
    if (semStr !== semester) {
      setSemester(semStr);
    }
  }, [selectedSemester]);

  useEffect(() => {
    if (selectedSubject !== undefined && selectedSubject !== subject) {
      setSubject(selectedSubject || '');
    }
  }, [selectedSubject]);

  // Fetch subjects dynamically whenever Course OR Semester changes
  useEffect(() => {
    // Both Course and Semester MUST be chosen to fetch subjects
    if (!course || !semester) {
      setSubjectsList([]);
      setIsLoading(false);
      setFetchError('');
      return;
    }

    let isMounted = true;
    const fetchFilteredSubjects = async () => {
      try {
        setIsLoading(true);
        setFetchError('');

        // Clean semester parameter (e.g. "Semester 3" -> "3")
        const semClean = String(semester).replace(/\D/g, '') || semester;
        const data = await subjectService.getSubjectsByCourseAndSemester(course, semClean);

        if (isMounted) {
          const list = Array.isArray(data) ? data : [];
          setSubjectsList(list);

          // Validate if currently selected subject still belongs to the fetched list
          if (subject) {
            const stillValid = list.some((s) => {
              const sId = s._id || s.id;
              const sName = s.name || s.title || s.subjectName;
              return sId === subject || sName === subject;
            });

            if (!stillValid) {
              setSubject('');
              if (onSubjectChange) onSubjectChange('', null);
              if (onChange) {
                onChange({ course, semester, subject: '', subjectObj: null });
              }
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error(`Error loading subjects for course ${course} & semester ${semester}:`, err);
          setFetchError('Failed to load subjects for selected course & semester.');
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
  }, [course, semester]);

  // 1. Course Change Handler
  const handleCourseChange = (e) => {
    const newCourse = e.target.value;
    setCourse(newCourse);
    // Requirement 2: Reset Dropdown 2 (Semester) and Dropdown 3 (Subject) automatically
    setSemester('');
    setSubject('');
    setSubjectsList([]);
    setFetchError('');

    lastEmittedRef.current = { course: newCourse, semester: '', subject: '' };

    if (onCourseChange) onCourseChange(newCourse);
    if (onSemesterChange) onSemesterChange('');
    if (onSubjectChange) onSubjectChange('', null);
    if (onChange) {
      onChange({ course: newCourse, semester: '', subject: '', subjectObj: null });
    }
  };

  // 2. Semester Change Handler
  const handleSemesterChange = (e) => {
    const newSem = e.target.value;
    setSemester(newSem);
    // Requirement 2: Reset Dropdown 3 (Subject) automatically
    setSubject('');
    setFetchError('');

    lastEmittedRef.current = { course, semester: newSem, subject: '' };

    if (onSemesterChange) onSemesterChange(newSem);
    if (onSubjectChange) onSubjectChange('', null);
    if (onChange) {
      onChange({ course, semester: newSem, subject: '', subjectObj: null });
    }
  };

  // 3. Subject Change Handler
  const handleSubjectChange = (e) => {
    const val = e.target.value;
    setSubject(val);

    const foundSubject = subjectsList.find((s) => {
      const sId = s._id || s.id;
      const sName = s.name || s.title || s.subjectName;
      return sId === val || sName === val;
    }) || null;

    lastEmittedRef.current = { course, semester, subject: val };

    if (onSubjectChange) onSubjectChange(val, foundSubject);
    if (onChange) {
      onChange({ course, semester, subject: val, subjectObj: foundSubject });
    }
  };

  // Helper styles based on size
  const inputPadding = size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2.5 text-xs sm:text-sm';
  const labelText = size === 'sm' ? 'text-[11px]' : 'text-xs';

  const containerClasses =
    layout === 'stacked'
      ? 'space-y-3.5'
      : layout === 'row'
      ? 'flex flex-col sm:flex-row items-stretch sm:items-center gap-3'
      : 'grid grid-cols-1 md:grid-cols-3 gap-3.5';

  return (
    <div className={`${containerClasses} ${className}`}>
      {/* -------------------------------------------------------------
          DROPDOWN 1: SELECT COURSE
          ------------------------------------------------------------- */}
      <div className="flex-1">
        <label className={`block ${labelText} font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5`}>
          <GraduationCap size={15} className="text-indigo-600 shrink-0" />
          <span>{courseLabel}</span>
          {isRequired && <span className="text-red-500">*</span>}
        </label>
        <select
          value={course}
          onChange={handleCourseChange}
          disabled={disabled}
          className={`w-full ${inputPadding} bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all ${
            disabled ? 'opacity-60 cursor-not-allowed bg-gray-100' : ''
          }`}
        >
          <option value="">{placeholderCourse}</option>
          {includeAllCourses && <option value="All Departments">{allCoursesLabel}</option>}
          {courses.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* -------------------------------------------------------------
          DROPDOWN 2: SELECT SEMESTER (Enabled only after Course selected)
          ------------------------------------------------------------- */}
      <div className="flex-1">
        <label className={`block ${labelText} font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5`}>
          <Layers size={15} className="text-purple-600 shrink-0" />
          <span>{semesterLabel}</span>
          {isRequired && <span className="text-red-500">*</span>}
        </label>
        <select
          value={semester}
          onChange={handleSemesterChange}
          disabled={disabled || !course}
          className={`w-full ${inputPadding} rounded-xl border font-medium transition-all ${
            disabled || !course
              ? 'bg-gray-100/70 border-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-50 border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600'
          }`}
        >
          {!course ? (
            <option value="">-- Select course first --</option>
          ) : (
            <>
              <option value="">{placeholderSemester}</option>
              {semesters.map((s) => {
                const sNum = String(s).replace(/\D/g, '') || s;
                return (
                  <option key={s} value={String(sNum)}>
                    Semester {sNum}
                  </option>
                );
              })}
            </>
          )}
        </select>
      </div>

      {/* -------------------------------------------------------------
          DROPDOWN 3: SELECT SUBJECT (Dynamically fetches on Course & Semester)
          ------------------------------------------------------------- */}
      <div className="flex-1">
        <label className={`block ${labelText} font-semibold text-gray-700 mb-1.5 flex items-center justify-between`}>
          <span className="flex items-center gap-1.5">
            <BookOpen size={15} className="text-emerald-600 shrink-0" />
            <span>{subjectLabel}</span>
            {isRequired && <span className="text-red-500">*</span>}
          </span>
          {isLoading && (
            <span className="text-[10px] text-indigo-600 flex items-center gap-1 font-medium">
              <Loader2 size={12} className="animate-spin" /> Loading...
            </span>
          )}
        </label>
        <select
          value={subject}
          onChange={handleSubjectChange}
          disabled={disabled || !course || !semester || isLoading}
          className={`w-full ${inputPadding} rounded-xl border font-medium transition-all truncate ${
            disabled || !course || !semester || isLoading
              ? 'bg-gray-100/70 border-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-50 border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600'
          }`}
        >
          {!course ? (
            <option value="">-- Select course first --</option>
          ) : !semester ? (
            <option value="">-- Select semester first --</option>
          ) : isLoading ? (
            <option value="">Fetching subjects for {course} (Sem {semester})...</option>
          ) : subjectsList.length === 0 ? (
            <option value="">No subjects found for {course} - Sem {semester}</option>
          ) : (
            <>
              <option value="">{placeholderSubject}</option>
              {subjectsList.map((s) => {
                const sId = s._id || s.id;
                const sName = s.name || s.title || s.subjectName || '';
                const sVal = subjectValueField === '_id' ? (sId || sName) : sName;
                const sCode = s.code ? `(${s.code})` : '';
                const sType = s.type ? `• ${s.type}` : '';
                return (
                  <option key={sId || sName} value={sVal}>
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
