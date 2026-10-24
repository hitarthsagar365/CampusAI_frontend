import React, { useState, useRef } from 'react';
import Layout from '../../components/Layout';
import { User, Bell, Shield, Palette, Link2, Save, CheckCircle2, Camera, UploadCloud, AlertCircle, Loader2 } from 'lucide-react';
import { DEPARTMENT_OPTIONS } from '../../constants/departments';
import authService from '../../services/authService';

export default function StudentSettings({ currentUser, setCurrentUser }) {
  const [tab, setTab] = useState('Account');

  // Account State
  const [name, setName] = useState(currentUser?.name || '');
  const [enrollment, setEnrollment] = useState(currentUser?.enrollment || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [course, setCourse] = useState(currentUser?.course || 'MCA');
  const [semester, setSemester] = useState(currentUser?.semester || 'Semester 1');
  const [department, setDepartment] = useState(
    DEPARTMENT_OPTIONS.includes(currentUser?.department) ? currentUser.department : 'AIML'
  );
  const [language, setLanguage] = useState('English (US)');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  // Profile Picture Upload State
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentUser?.avatar || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict validation for .png, .jpg, .jpeg
    const validExtensions = ['png', 'jpg', 'jpeg'];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const validMimes = ['image/png', 'image/jpeg', 'image/jpg'];

    if (!validExtensions.includes(fileExt) || !validMimes.includes(file.type)) {
      setUploadError('Invalid format! Strictly only .png, .jpg, and .jpeg files are accepted.');
      setSelectedFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds 5MB limit. Please choose a smaller image.');
      setSelectedFile(null);
      return;
    }

    setUploadError('');
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleUploadAvatar = async () => {
    if (!selectedFile) {
      setUploadError('Please select a .png, .jpg, or .jpeg image first.');
      return;
    }

    setIsUploading(true);
    setUploadError('');
    setSuccess('');

    try {
      const response = await authService.updateProfilePicture(selectedFile);
      const newAvatarUrl = response.avatarUrl || response.user?.avatar;

      if (setCurrentUser) {
        setCurrentUser(response.user || {
          ...currentUser,
          avatar: newAvatarUrl
        });
      }

      setPreviewUrl(newAvatarUrl);
      setSelectedFile(null);
      setSuccess('Profile picture uploaded to Cloudinary and updated successfully!');
    } catch (err) {
      console.error('Failed to upload profile picture:', err);
      const message = err.response?.data?.message || err.message || 'Failed to upload image to Cloudinary.';
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(currentUser?.avatar || '');
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Notifications State
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [assignmentReminders, setAssignmentReminders] = useState(true);
  const [announcementAlerts, setAnnouncementAlerts] = useState(true);

  // Privacy State
  const [profileVisible, setProfileVisible] = useState(true);
  const [showEmailPublicly, setShowEmailPublicly] = useState(false);

  // Appearance State
  const [theme, setTheme] = useState('Light');

  // Linked Apps State
  const [googleLinked, setGoogleLinked] = useState(true);
  const [githubLinked, setGithubLinked] = useState(false);

  const handleSaveAccount = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!name.trim()) newErrors.name = 'Full name is required.';
    if (!email.trim()) {
      newErrors.email = 'Primary email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!course) newErrors.course = 'Please select a course.';
    if (!semester) newErrors.semester = 'Please select a semester.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSuccess('');
      return;
    }

    if (setCurrentUser) {
      const updatedUser = {
        ...currentUser,
        name: name.trim(),
        enrollment: enrollment.trim(),
        email: email.trim(),
        course,
        semester,
        department
      };
      delete updatedUser.password;
      setCurrentUser(updatedUser);
    }

    setErrors({});
    setSuccess('Student profile and settings updated successfully!');
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setSuccess('Preferences saved successfully!');
  };

  return (
    <Layout role="student" currentUser={currentUser}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your student profile, notifications, and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sub-Nav */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-3 shadow-sm space-y-1 h-fit">
          {[
            { name: 'Account', icon: User },
            { name: 'Notifications', icon: Bell },
            { name: 'Privacy & Security', icon: Shield },
            { name: 'Appearance', icon: Palette },
            { name: 'Linked Apps', icon: Link2 }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  setTab(item.name);
                  setSuccess('');
                  setErrors({});
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  tab === item.name
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={16} className={tab === item.name ? 'text-indigo-600' : 'text-gray-400'} />
                {item.name}
              </button>
            );
          })}
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200/80 p-8 shadow-sm">
          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{success}</span>
            </div>
          )}

          {tab === 'Account' && (
            <form onSubmit={handleSaveAccount} noValidate>
              <div className="border-b border-gray-100 pb-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900">Student Account & Profile Details</h2>
                <p className="text-xs text-gray-500 mt-1">Update your profile photo, registered name, email, course, and semester.</p>
              </div>

              {/* Profile Picture Upload Section */}
              <div className="p-5 mb-6 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shadow-md ring-4 ring-white">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Student Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{(name || currentUser?.name || 'S').charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="absolute bottom-0 right-0 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg border-2 border-white transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
                    title="Change Profile Picture"
                  >
                    <Camera size={14} />
                  </button>
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <h3 className="text-sm font-bold text-gray-900">Profile Picture</h3>
                    <span className="text-[11px] font-medium text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full w-fit mx-auto sm:mx-0">
                      Formats: .png, .jpg, .jpeg
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Upload an avatar image for your student portal. Strictly accepts <span className="font-semibold text-gray-700">.png, .jpg, and .jpeg</span> formats up to 5MB.
                  </p>

                  {/* Strict File Input element accepting only .png, .jpg, .jpeg */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="student-avatar-file-input"
                    accept=".png, .jpg, .jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {uploadError && (
                    <div className="mt-2.5 p-2.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center gap-1.5 text-left">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  <div className="mt-3.5 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-3.5 py-1.5 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Browse Image
                    </button>

                    {selectedFile && (
                      <button
                        type="button"
                        onClick={handleUploadAvatar}
                        disabled={isUploading}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 size={13} className="animate-spin" />
                            <span>Uploading to Cloudinary...</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud size={13} />
                            <span>Upload Picture</span>
                          </>
                        )}
                      </button>
                    )}

                    {selectedFile && !isUploading && (
                      <button
                        type="button"
                        onClick={handleCancelSelection}
                        className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 font-medium"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  {selectedFile && (
                    <p className="text-[11px] text-indigo-600 mt-2 font-medium">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Student Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors({ ...errors, name: '' });
                    }}
                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 ${
                      errors.name ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:ring-indigo-500/20'
                    }`}
                  />
                  {errors.name && <p className="text-xs text-red-500 font-medium mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Enrollment Number</label>
                  <input
                    type="text"
                    value={enrollment}
                    onChange={(e) => setEnrollment(e.target.value)}
                    placeholder="e.g. MCA001"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Primary Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 ${
                      errors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:ring-indigo-500/20'
                    }`}
                  />
                  {errors.email && <p className="text-xs text-red-500 font-medium mt-1">{errors.email}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Course *</label>
                    <select
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none"
                    >
                      <option value="AIML">AIML</option>
                      <option value="Cyber Security">Cyber Security</option>
                      <option value="All Departments">All Departments</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Semester *</label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none"
                    >
                      <option value="Semester 1">Semester 1</option>
                      <option value="Semester 2">Semester 2</option>
                      <option value="Semester 3">Semester 3</option>
                      <option value="Semester 4">Semester 4</option>
                      <option value="Semester 5">Semester 5</option>
                      <option value="Semester 6">Semester 6</option>
                      <option value="Semester 7">Semester 7</option>
                      <option value="Semester 8">Semester 8</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Department *</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none"
                    >
                      {DEPARTMENT_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none"
                  >
                    <option value="English (US)">English (US)</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <Save size={15} /> Save Changes
                </button>
              </div>
            </form>
          )}

          {tab === 'Notifications' && (
            <form onSubmit={handleSavePreferences}>
              <div className="border-b border-gray-100 pb-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900">Notification Preferences</h2>
                <p className="text-xs text-gray-500 mt-1">Configure alerts for course updates and assignments.</p>
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Email Notifications</h4>
                    <p className="text-[11px] text-gray-500">Receive important announcements via email.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotifs}
                    onChange={(e) => setEmailNotifs(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Assignment Reminders</h4>
                    <p className="text-[11px] text-gray-500">Get reminders before assignment due dates.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={assignmentReminders}
                    onChange={(e) => setAssignmentReminders(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Announcement Alerts</h4>
                    <p className="text-[11px] text-gray-500">Instant alerts for new campus announcements.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={announcementAlerts}
                    onChange={(e) => setAnnouncementAlerts(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-end">
                <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5">
                  <Save size={15} /> Save Notification Settings
                </button>
              </div>
            </form>
          )}

          {tab === 'Privacy & Security' && (
            <form onSubmit={handleSavePreferences}>
              <div className="border-b border-gray-100 pb-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900">Privacy & Security</h2>
                <p className="text-xs text-gray-500 mt-1">Manage visibility settings for your student profile.</p>
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Profile Visibility</h4>
                    <p className="text-[11px] text-gray-500">Allow faculty and peers to view your academic profile.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={profileVisible}
                    onChange={(e) => setProfileVisible(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Public Email</h4>
                    <p className="text-[11px] text-gray-500">Show email address on class directory.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={showEmailPublicly}
                    onChange={(e) => setShowEmailPublicly(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-end">
                <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5">
                  <Save size={15} /> Save Privacy Settings
                </button>
              </div>
            </form>
          )}

          {tab === 'Appearance' && (
            <form onSubmit={handleSavePreferences}>
              <div className="border-b border-gray-100 pb-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900">Appearance</h2>
                <p className="text-xs text-gray-500 mt-1">Customize visual theme and interface preferences.</p>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-semibold text-gray-700">Theme Mode</label>
                <div className="grid grid-cols-3 gap-4">
                  {['Light', 'Dark', 'System'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setTheme(mode)}
                      className={`p-4 rounded-xl border text-xs font-bold text-center transition-all ${
                        theme === mode
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {mode} Mode
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-end">
                <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5">
                  <Save size={15} /> Apply Theme
                </button>
              </div>
            </form>
          )}

          {tab === 'Linked Apps' && (
            <form onSubmit={handleSavePreferences}>
              <div className="border-b border-gray-100 pb-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900">Linked Applications</h2>
                <p className="text-xs text-gray-500 mt-1">Connect third-party academic accounts.</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Google Workspace</h4>
                    <p className="text-[11px] text-gray-500">Connected as {email || 'student@college.edu'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGoogleLinked(!googleLinked)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${
                      googleLinked ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    {googleLinked ? 'Connected' : 'Connect'}
                  </button>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">GitHub Education</h4>
                    <p className="text-[11px] text-gray-500">Repository integration for assignments.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGithubLinked(!githubLinked)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${
                      githubLinked ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    {githubLinked ? 'Connected' : 'Connect'}
                  </button>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-end">
                <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5">
                  <Save size={15} /> Save Integrations
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}
