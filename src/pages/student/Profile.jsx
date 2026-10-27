import React, { useState, useRef } from 'react';
import Layout from '../../components/Layout';
import { Mail, Award, UserCheck, Camera, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import authService from '../../services/authService';

export default function StudentProfile({ currentUser, setCurrentUser }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState(null); // { type: 'success' | 'error', message: '' }
  const fileInputRef = useRef(null);

  if (!currentUser) {
    return (
      <Layout role="student" currentUser={currentUser}>
        <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center text-gray-500 shadow-sm">
          <p className="text-base font-semibold text-gray-700">User information not available.</p>
        </div>
      </Layout>
    );
  }

  const role = currentUser.role || 'student';
  const name = currentUser.name || '';
  const email = currentUser.email || '';
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U';

  const handleAvatarSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type (.png, .jpg, .jpeg)
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const validExtensions = ['.png', '.jpg', '.jpeg'];
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExt)) {
      setUploadFeedback({
        type: 'error',
        message: 'Invalid format! Please upload a .png, .jpg, or .jpeg image.'
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadFeedback({
        type: 'error',
        message: 'File size exceeds 5MB limit. Please choose a smaller image.'
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadFeedback(null);
      const res = await authService.updateProfilePicture(file);
      const newAvatarUrl = res.avatarUrl || res.user?.avatar;

      const updatedUser = res.user || {
        ...currentUser,
        avatar: newAvatarUrl
      };

      if (setCurrentUser) {
        setCurrentUser(updatedUser);
      }

      setUploadFeedback({
        type: 'success',
        message: 'Profile picture updated successfully!'
      });

      setTimeout(() => setUploadFeedback(null), 4000);
    } catch (err) {
      console.error('Failed to upload profile picture:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to upload profile picture to Cloudinary.';
      setUploadFeedback({
        type: 'error',
        message: msg
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const renderAvatarCircle = () => (
    <div className="relative group shrink-0">
      <div className="w-28 h-28 rounded-full border-4 border-white bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-md overflow-hidden relative">
        {currentUser?.avatar ? (
          <img
            src={currentUser.avatar}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-white">
            <Loader2 className="animate-spin" size={24} />
            <span className="text-[10px] font-semibold mt-1">Uploading...</span>
          </div>
        )}
      </div>

      {/* Camera button overlay to trigger file upload */}
      <button
        type="button"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        title="Upload new profile picture"
        className="absolute bottom-1 right-1 p-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-full shadow-lg border-2 border-white transition-all cursor-pointer disabled:opacity-50"
      >
        <Camera size={15} />
      </button>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarSelect}
        accept=".png,.jpg,.jpeg,image/png,image/jpeg"
        className="hidden"
      />
    </div>
  );

  if (role === 'faculty' || role === 'teacher') {
    const username = currentUser.username || '';
    const department = currentUser.department || '';

    return (
      <Layout role="teacher" currentUser={currentUser}>
        {uploadFeedback && (
          <div
            className={`mb-4 p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all ${
              uploadFeedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {uploadFeedback.type === 'success' ? (
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle size={16} className="shrink-0 text-rose-600" />
            )}
            <span>{uploadFeedback.message}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm mb-8">
          <div className="h-44 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 relative">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          </div>

          <div className="px-8 pb-6 relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16">
            <div className="flex items-end gap-5">
              {renderAvatarCircle()}
              <div className="mb-1">
                <h1 className="text-2xl font-extrabold text-gray-900">{name}</h1>
                <p className="text-xs text-gray-500 font-medium">
                  👨‍🏫 Faculty • {department}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100 flex items-center gap-1">
                <UserCheck size={14} /> Faculty Member
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="text-indigo-600" size={20} /> Faculty Overview
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
                  <span className="text-xs font-semibold text-gray-500">Department</span>
                  <span className="text-xl font-extrabold text-gray-900 block mt-2">{department}</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
                  <span className="text-xs font-semibold text-gray-500">Username</span>
                  <span className="text-xl font-extrabold text-indigo-600 block mt-2">{username}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm mb-4">Faculty Information</h3>
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-gray-400 block mb-0.5 uppercase tracking-wider text-[10px] font-bold">FULL NAME</span>
                  <span className="font-bold text-gray-800">{name}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5 uppercase tracking-wider text-[10px] font-bold">USERNAME</span>
                  <span className="font-bold text-gray-800">{username}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5 uppercase tracking-wider text-[10px] font-bold">FACULTY EMAIL</span>
                  <a href={`mailto:${email}`} className="font-semibold text-indigo-600 hover:underline flex items-center gap-1.5">
                    <Mail size={13} /> {email}
                  </a>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5 uppercase tracking-wider text-[10px] font-bold">DEPARTMENT</span>
                  <span className="font-semibold text-gray-800">{department}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (role === 'admin') {
    return (
      <Layout role="admin" currentUser={currentUser}>
        <div className="bg-white rounded-2xl border border-gray-200/80 p-8 shadow-sm max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md overflow-hidden">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt="Admin" className="w-full h-full object-cover" />
              ) : (
                'AD'
              )}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Administrator</h1>
              <p className="text-xs text-indigo-600 font-semibold mt-0.5">Role: Administration</p>
            </div>
          </div>
          <div className="space-y-4 text-xs pt-4 border-t border-gray-100">
            <div>
              <span className="text-gray-400 block mb-0.5 uppercase tracking-wider text-[10px] font-bold">NAME</span>
              <span className="font-bold text-gray-800 text-sm">Administrator</span>
            </div>
            <div>
              <span className="text-gray-400 block mb-0.5 uppercase tracking-wider text-[10px] font-bold">ADMIN EMAIL</span>
              <span className="font-semibold text-indigo-600">admin@college.edu</span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Student Profile
  const enrollment = currentUser.enrollment || '';
  const course = currentUser.course || '';
  const semester = currentUser.semester || '';

  return (
    <Layout role="student" currentUser={currentUser}>
      {uploadFeedback && (
        <div
          className={`mb-4 p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all ${
            uploadFeedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {uploadFeedback.type === 'success' ? (
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle size={16} className="shrink-0 text-rose-600" />
          )}
          <span>{uploadFeedback.message}</span>
        </div>
      )}

      {/* Banner */}
      <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm mb-8">
        <div className="h-44 bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-700 relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        </div>

        <div className="px-8 pb-6 relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16">
          <div className="flex items-end gap-5">
            {renderAvatarCircle()}
            <div className="mb-1">
              <h1 className="text-2xl font-extrabold text-gray-900">{name}</h1>
              <p className="text-xs text-gray-500 font-medium">
                🎓 {course} • {semester}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
              Good Standing
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Academic Overview */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="text-indigo-600" size={20} /> Academic Overview
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
                <span className="text-xs font-semibold text-gray-500">Registered Course</span>
                <span className="text-xl font-extrabold text-gray-900 block mt-2">{course}</span>
                <span className="text-[11px] text-gray-400 block mt-1">{semester}</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
                <span className="text-xs font-semibold text-gray-500">Enrollment Status</span>
                <span className="text-xl font-extrabold text-emerald-600 block mt-2">Active Student</span>
                <span className="text-[11px] text-gray-400 block mt-1">Full-Time Status</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-6">
          {/* Personal Info Card */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 text-sm mb-4">Personal Information</h3>
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-gray-400 block mb-0.5 uppercase tracking-wider text-[10px] font-bold">FULL NAME</span>
                <span className="font-bold text-gray-800">{name}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5 uppercase tracking-wider text-[10px] font-bold">ENROLLMENT NO</span>
                <span className="font-bold text-gray-800">{enrollment}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5 uppercase tracking-wider text-[10px] font-bold">UNIVERSITY EMAIL</span>
                <a href={`mailto:${email}`} className="font-semibold text-indigo-600 hover:underline flex items-center gap-1.5">
                  <Mail size={13} /> {email}
                </a>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5 uppercase tracking-wider text-[10px] font-bold">COURSE</span>
                <span className="font-semibold text-gray-800">{course}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5 uppercase tracking-wider text-[10px] font-bold">SEMESTER</span>
                <span className="font-semibold text-gray-800">{semester}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
