import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Save, Loader2, UploadCloud, UserCircle } from 'lucide-react';
import { API_BASE_URL } from '../api';

export default function EditProfile() {
    const { user, token } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Form states
    const [formData, setFormData] = useState({});
    const [resumeFile, setResumeFile] = useState(null);
    const [profilePicFile, setProfilePicFile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const data = await res.json();
                if (res.ok) {
                    setProfile(data.user);
                    setFormData(data.user);
                } else {
                    setError('Failed to load profile.');
                }
            } catch (err) {
                setError('Error connecting to Server.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [token]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (!profile) {
        return <div className="text-red-500">Profile data could not be loaded.</div>;
    }

    const isVerified = profile.verificationStatus === 'verified' || profile.role === 'admin';

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setResumeFile(e.target.files[0]);
        }
    };

    const handleProfilePicChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setProfilePicFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        setError('');

        try {
            let endpoint = '';
            let bodyData;
            let headers = { Authorization: `Bearer ${token}` };

            if (user.role === 'student') {
                endpoint = `${API_BASE_URL}/api/student/profile`;
                const fd = new FormData();
                if (formData.phoneNumber) fd.append('phoneNumber', formData.phoneNumber);
                if (formData.currentYearOfStudy) fd.append('currentYearOfStudy', formData.currentYearOfStudy);
                if (resumeFile) fd.append('resume', resumeFile);
                if (profilePicFile) fd.append('profilePicture', profilePicFile);
                bodyData = fd;
            } else if (user.role === 'company') {
                endpoint = `${API_BASE_URL}/api/company/profile`;
                const fd = new FormData();
                if (formData.companyWebsite) fd.append('companyWebsite', formData.companyWebsite);
                if (formData.HRContactName) fd.append('HRContactName', formData.HRContactName);
                if (formData.HRContactEmail) fd.append('HRContactEmail', formData.HRContactEmail);
                if (formData.contactNumber) fd.append('contactNumber', formData.contactNumber);
                if (profilePicFile) fd.append('profilePicture', profilePicFile);
                // No 'Content-Type' header needed for FormData; the browser sets it automatically
                delete headers['Content-Type']; 
                bodyData = fd;
            } else if (user.role === 'admin') {
                endpoint = `${API_BASE_URL}/api/admin/profile`;
                const fd = new FormData();
                if (profilePicFile) fd.append('profilePicture', profilePicFile);
                bodyData = fd;
            }

            const res = await fetch(endpoint, {
                method: 'PUT',
                headers,
                body: bodyData,
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(data.message || 'Profile updated successfully.');
                if (data.student) setProfile(data.student);
                if (data.company) setProfile(data.company);
                if (data.admin) setProfile(data.admin);
            } else {
                setError(data.message || 'Error updating profile.');
            }
        } catch (err) {
            setError('Server connection error.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-700">
            <h1 className="text-2xl font-bold text-slate-800 mb-6 dark:text-slate-100">Edit Profile</h1>

            {!isVerified && (
                <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-start gap-3 dark:bg-amber-950/40 dark:border-amber-800/60 dark:text-amber-300">
                    <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                        <h3 className="font-semibold">Verification Required</h3>
                        <p className="text-sm mt-1">
                            Editing is restricted until TPC verification is complete. You can view your current data below, but cannot make changes.
                        </p>
                    </div>
                </div>
            )}

            {message && <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/60">{message}</div>}
            {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/60">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* ---------- PROFILE PICTURE UPLOAD ---------- */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-24 h-24 mb-3 rounded-full bg-slate-50 overflow-hidden border-2 border-slate-100 flex items-center justify-center dark:bg-slate-800 dark:border-slate-700">
                        {profile.profilePicture ? (
                            <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <UserCircle className="w-full h-full text-slate-300 dark:text-slate-600" />
                        )}
                    </div>
                    <label className={`cursor-pointer text-sm font-semibold transition-colors ${!isVerified && user.role !== 'admin' ? 'text-slate-400 pointer-events-none' : 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'}`}>
                        <span>{profilePicFile ? profilePicFile.name : 'Change Profile Picture'}</span>
                        <input type="file" className="sr-only" onChange={handleProfilePicChange} accept="image/*" disabled={!isVerified && user.role !== 'admin'} />
                    </label>
                </div>

                {/* ---------- STUDENT FIELDS ---------- */}
                {user.role === 'student' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="Full Name" name="fullName" value={profile.fullName} disabled />
                            <InputField label="Roll Number" name="rollNumber" value={profile.rollNumber} disabled />
                            <InputField label="Program" name="program" value={profile.program} disabled />
                            <InputField label="Department / Branch" name="department" value={profile.department} disabled />
                            <InputField label="Graduation Year" name="graduationYear" value={profile.graduationYear} disabled />
                            <InputField label="CGPA / CPI" name="cgpa" value={profile.cgpa || 'Pending'} disabled />

                            <InputField
                                label="Phone Number"
                                name="phoneNumber"
                                value={formData.phoneNumber || ''}
                                onChange={handleInputChange}
                                disabled={!isVerified}
                            />

                            <InputField label="Current Year of Study" name="currentYearOfStudy" value={profile.currentYearOfStudy || ''} disabled />
                        </div>

                        {/* Resume Upload Box */}
                        <div className="col-span-1 md:col-span-2 mt-4">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Resume Upload</label>
                            <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl transition-colors ${!isVerified ? 'bg-slate-50 border-slate-200 opacity-70' : 'border-blue-200 hover:border-blue-400 bg-blue-50/30'}`}>
                                <div className="space-y-1 text-center flex flex-col items-center">
                                    <UploadCloud className={`mx-auto h-10 w-10 ${!isVerified ? 'text-slate-400' : 'text-blue-500'}`} />
                                    <div className="flex text-sm text-slate-600">
                                        <label htmlFor="resume-upload" className={`relative cursor-pointer rounded-md font-medium focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 ${!isVerified ? 'text-slate-500 pointer-events-none' : 'text-blue-600 hover:text-blue-500'}`}>
                                            <span>Upload a new file</span>
                                            <input id="resume-upload" name="resume" type="file" className="sr-only" onChange={handleFileChange} disabled={!isVerified} accept=".pdf,.doc,.docx" />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-slate-500">PDF, DOC up to 5MB</p>
                                    {resumeFile && <p className="text-sm text-green-600 font-medium mt-2">Selected: {resumeFile.name}</p>}
                                    {profile.resumeLink && !resumeFile && (
                                        <p className="text-sm text-blue-600 font-medium mt-2">
                                            <a href={profile.resumeLink} target="_blank" rel="noreferrer" className="underline hover:text-blue-800">View Current Resume</a>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* ---------- COMPANY FIELDS ---------- */}
                {user.role === 'company' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="Company Name" name="companyName" value={profile.companyName} disabled />
                            <InputField label="Official Email" name="companyEmail" value={profile.companyEmail} disabled />

                            <InputField
                                label="Company Website"
                                name="companyWebsite"
                                value={formData.companyWebsite || ''}
                                onChange={handleInputChange}
                                disabled={!isVerified}
                            />
                            <InputField
                                label="Contact Number"
                                name="contactNumber"
                                value={formData.contactNumber || ''}
                                onChange={handleInputChange}
                                disabled={!isVerified}
                            />
                            <InputField
                                label="HR Representative Name"
                                name="HRContactName"
                                value={formData.HRContactName || ''}
                                onChange={handleInputChange}
                                disabled={!isVerified}
                            />
                            <InputField
                                label="HR Contact Email"
                                name="HRContactEmail"
                                value={formData.HRContactEmail || ''}
                                onChange={handleInputChange}
                                disabled={!isVerified}
                            />
                        </div>
                    </>
                )}

                {/* ---------- ADMIN FIELDS ---------- */}
                {user.role === 'admin' && (
                    <>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <InputField label="Full Name" name="fullName" value={profile.fullName} disabled />
                            <InputField label="Email Address" name="email" value={profile.email} disabled />
                            <InputField label="Admin Role" name="adminType" value={profile.adminType?.replace('_', ' ').toUpperCase()} disabled />
                        </div>
                        <p className="text-sm text-slate-500 mt-4">Note: Admins cannot currently modify their own profile data (other than their profile picture). Super Admins can manage roles using the "Assign Powers" menu.</p>
                    </>
                )}

                <div className="pt-6 border-t border-slate-100 flex justify-end dark:border-slate-700">
                    <button
                        type="submit"
                        disabled={(!isVerified && user.role !== 'admin') || saving}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all shadow-sm ${(!isVerified && user.role !== 'admin') || saving
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500'
                            : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md active:scale-[0.98]'
                            }`}
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        <span>{saving ? 'Saving Changes...' : 'Save Profile Details'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}

// Reusable Input Field
const InputField = ({ label, name, value, onChange, disabled }) => {
    return (
        <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 dark:text-slate-300">{label}</label>
            <input
                type="text"
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`w-full px-4 py-2.5 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100 ${disabled
                    ? 'bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed dark:bg-slate-800/80 dark:text-slate-400 dark:border-slate-700'
                    : 'bg-white border-slate-300 hover:border-slate-400 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:hover:border-slate-500'
                    }`}
            />
        </div>
    );
};
