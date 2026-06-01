import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Clock, XCircle, UploadCloud, FileText } from 'lucide-react';

export default function StudentVerificationForm() {
    const { token, user, updateUser } = useAuth();
    const [status, setStatus] = useState('unsubmitted'); // or loading
    const [formData, setFormData] = useState({
        fullName: user?.name || user?.fullName || '',
        rollNumber: user?.rollNumber || '',
        phoneNumber: '',
        cgpa: '',
        currentYearOfStudy: user?.currentYearOfStudy || '',
    });
    const [idCard, setIdCard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Fetch the user's current status on mount.
    useEffect(() => {
        if (user?.verificationStatus) {
            setStatus(user.verificationStatus);
        } else {
            setStatus('unsubmitted');
        }
        setLoading(false);
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setIdCard(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!idCard) {
            setError("Institute ID card is required.");
            return;
        }

        if (!formData.fullName || !formData.rollNumber) {
            setError("Full Name and Roll Number are required.");
            return;
        }

        setSubmitting(true);
        setError(null);

        const data = new FormData();
        data.append('fullName', formData.fullName);
        data.append('rollNumber', formData.rollNumber);
        data.append('phoneNumber', formData.phoneNumber);
        data.append('cgpa', formData.cgpa);
        if (formData.currentYearOfStudy) {
            data.append('currentYearOfStudy', formData.currentYearOfStudy);
        }
        data.append('idCard', idCard);

        try {
            await api.post('/api/student/verify', data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setStatus('pending');
            updateUser({
                name: formData.fullName,
                fullName: formData.fullName,
                rollNumber: formData.rollNumber,
                verificationStatus: 'pending'
            });
        } catch (err) {
            console.error('Submit Error:', err);
            setError(err.response?.data?.message || 'Failed to submit verification request.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 animate-[fade-in-up_0.4s_ease-out] dark:bg-slate-900 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2 dark:text-slate-100">
                <CheckCircle className="text-blue-600" /> Verify Your Identity
            </h2>

            {status === 'pending' && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-xl flex items-center flex-col text-center space-y-3 dark:bg-amber-950/40 dark:border-amber-800/60 dark:text-amber-300">
                    <Clock size={48} className="text-amber-500" />
                    <h3 className="text-lg font-bold">Under Review by TPC</h3>
                    <p className="text-sm">Your application has been received and is currently being processed by the administrators. Please check back later.</p>
                </div>
            )}

            {status === 'verified' && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-xl flex items-center flex-col text-center space-y-3 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-300">
                    <CheckCircle size={48} className="text-emerald-500" />
                    <h3 className="text-lg font-bold">Verification Complete</h3>
                    <p className="text-sm">You have been successfully verified and now have full access to the TPC portal opportunities.</p>
                </div>
            )}

            {status === 'rejected' && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-xl flex items-center flex-col text-center space-y-3 dark:bg-red-950/40 dark:border-red-800/60 dark:text-red-300">
                    <XCircle size={48} className="text-red-500" />
                    <h3 className="text-lg font-bold">Verification Failed</h3>
                    <p className="text-sm">Your application was rejected or you are not eligible. Please contact the TPC administration for further details.</p>
                    <button onClick={() => setStatus('unsubmitted')} className="px-4 py-2 mt-2 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition">
                        Re-Submit Application
                    </button>
                </div>
            )}

            {status === 'unsubmitted' && (
                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/60">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="Enter your full name" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Roll Number</label>
                            <input type="text" name="rollNumber" value={formData.rollNumber} onChange={handleChange} required placeholder="e.g. 2401CS01" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                            <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required placeholder="+91 9876543210" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Current CGPA</label>
                            <input type="number" step="0.01" min="0" max="10" name="cgpa" value={formData.cgpa} onChange={handleChange} required placeholder="e.g. 8.75" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Current Year of Study</label>
                        <select name="currentYearOfStudy" value={formData.currentYearOfStudy} onChange={handleChange} required className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
                            <option value="" disabled>Select Current Year</option>
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                            <option value="5th Year">5th Year</option>
                        </select>
                    </div>

                    <div className="space-y-2 pt-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 dark:text-slate-300">
                            <FileText size={16} className="text-slate-400" /> Institute ID Card
                        </label>
                        <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-8 hover:bg-slate-50 transition-colors flex justify-center items-center flex-col group dark:border-slate-600 dark:hover:bg-slate-800/50">
                            <input type="file" accept="image/jpeg, image/png, image/jpg" onChange={handleFileChange} required className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            <UploadCloud size={40} className="text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                            <p className="text-sm font-semibold text-slate-700">
                                {idCard ? idCard.name : 'Click to upload or drag and drop'}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</p>
                        </div>
                    </div>

                    <button type="submit" disabled={submitting} className={`w-full py-3 rounded-lg font-bold text-white shadow-md transition-all ${submitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'}`}>
                        {submitting ? 'Submitting Application...' : 'Submit Verification'}
                    </button>
                </form>
            )}
        </div>
    );
}
