import React, { useState, useRef } from 'react';
import Layout from '../../components/Layout';
import { User, Bell, Shield, Palette, Link2, Save, CheckCircle2, Camera, UploadCloud, AlertCircle, Loader2 } from 'lucide-react';
import { DEPARTMENT_OPTIONS } from '../../constants/departments';
import authService from '../../services/authService';

export default function TeacherSettings({ currentUser, setCurrentUser }) {
  const [tab, setTab] = useState('Account');

  // Account State
  const [name, setName] = useState(currentUser?.name || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [department, setDepartment] = useState(
    DEPARTMENT_OPTIONS.includes(currentUser?.department) ? currentUser.department : 'AIML'
  );
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
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
      setSuccess('Faculty profile picture uploaded to Cloudinary and updated successfully!');
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

  // Preference states
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [assignmentAlerts, setAssignmentAlerts] = useState(true);
  const [profileVisible, setProfileVisible] = useState(true);
  const [theme, setTheme] = useState('Light');

  const handleSaveAccount = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Faculty name is required.');
      setSuccess('');
      return;
    }
    if (!email.trim()) {
      setError('Faculty email is required.');
      setSuccess('');
      return;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      setSuccess('');
      return;
    }

    if (setCurrentUser) {
      const updatedUser = {
        ...currentUser,
        name: name.trim(),
        username: username.trim() || currentUser?.username,
        email: email.trim(),
        department
      };
      delete updatedUser.password;
      setCurrentUser(updatedUser);
    }

    setError('');
    setSuccess('Faculty profile and settings updated successfully!');
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setSuccess('Faculty preferences saved successfully!');
  };

  return (
    <Layout role="teacher" currentUser={currentUser}>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your faculty account preferences and course notifications.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Nav */}
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
                  setError('');
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

        {/* Form Panel */}
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
                <h2 className="text-xl font-bold text-gray-900">Faculty Account Details</h2>
                <p className="text-xs text-gray-500 mt-1">Update your profile photo, name, email, department, and credentials.</p>
              </div>

              {/* Profile Picture Upload Section */}
              <div className="p-5 mb-6 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shadow-md ring-4 ring-white">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Faculty Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{(name || currentUser?.name || 'F').charAt(0).toUpperCase()}</span>
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
                    <h3 className="text-sm font-bold text-gray-900">Faculty Profile Picture</h3>
                    <span className="text-[11px] font-medium text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full w-fit mx-auto sm:mx-0">
                      Formats: .png, .jpg, .jpeg
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Upload an avatar image for your faculty profile. Strictly accepts <span className="font-semibold text-gray-700">.png, .jpg, and .jpeg</span> formats up to 5MB.
                  </p>

                  {/* Strict File Input element accepting only .png, .jpg, .jpeg */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="teacher-avatar-file-input"
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

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); if (error) setError(''); }}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Faculty Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-xs font-medium text-gray-800 focus:outline-none ${
                      error ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {error && <p className="text-xs text-red-500 font-medium mt-1">{error}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
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

              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-end">
                <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5">
                  <Save size={15} /> Save Faculty Account
                </button>
              </div>
            </form>
          )}

          {tab === 'Notifications' && (
            <form onSubmit={handleSavePreferences}>
              <div className="border-b border-gray-100 pb-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900">Faculty Notification Preferences</h2>
                <p className="text-xs text-gray-500 mt-1">Configure email alerts for student submissions and announcements.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Department Email Alerts</h4>
                    <p className="text-[11px] text-gray-500">Receive departmental circulars via email.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Assignment Submission Alerts</h4>
                    <p className="text-[11px] text-gray-500">Get notified when students submit assignments.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={assignmentAlerts}
                    onChange={(e) => setAssignmentAlerts(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-end">
                <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5">
                  <Save size={15} /> Save Notification Preferences
                </button>
              </div>
            </form>
          )}

          {tab === 'Privacy & Security' && (
            <form onSubmit={handleSavePreferences}>
              <div className="border-b border-gray-100 pb-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900">Privacy & Security</h2>
                <p className="text-xs text-gray-500 mt-1">Manage visibility settings for your faculty profile.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Faculty Directory Visibility</h4>
                    <p className="text-[11px] text-gray-500">Show your profile in student directory.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={profileVisible}
                    onChange={(e) => setProfileVisible(e.target.checked)}
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
                <p className="text-xs text-gray-500 mt-1">Customize your faculty dashboard theme.</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {['Light', 'Dark', 'System'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setTheme(m)}
                    className={`p-4 rounded-xl border text-xs font-bold text-center transition-all ${
                      theme === m
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {m} Mode
                  </button>
                ))}
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
                <p className="text-xs text-gray-500 mt-1">Connect third-party teaching tools.</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Google Classroom / Workspace</h4>
                  <p className="text-[11px] text-gray-500">Sync assignments and rosters.</p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-lg">Connected</span>
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
