import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Clock, XCircle, Building2 } from 'lucide-react';

export default function CompanyVerificationForm() {
    const { token, user, updateUser } = useAuth();
    const [status, setStatus] = useState('unsubmitted');
    const [formData, setFormData] = useState({
        companyName: user?.companyName || '',
        companyEmail: user?.companyEmail || user?.email || '',
        companyWebsite: user?.companyWebsite || '',
        HRContactName: user?.HRContactName || '',
        HRContactEmail: user?.HRContactEmail || '',
        contactNumber: user?.contactNumber || '',
    });
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.companyName || !formData.companyEmail || !formData.HRContactName) {
            setError("Company Name, Email, and HR Contact Name are required.");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            await api.post('/api/company/verify', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            setStatus('pending');
            updateUser({
                companyName: formData.companyName,
                companyEmail: formData.companyEmail,
                verificationStatus: 'pending'
            });
        } catch (err) {
            console.error('Submit Error:', err);
            setError(err.response?.data?.message || 'Failed to submit company verification request.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 animate-[fade-in-up_0.4s_ease-out]">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <CheckCircle className="text-blue-600" /> Verify Your Company
            </h2>

            {status === 'pending' && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-xl flex items-center flex-col text-center space-y-3">
                    <Clock size={48} className="text-amber-500" />
                    <h3 className="text-lg font-bold">Under Review by TPC</h3>
                    <p className="text-sm">Your company profile has been submitted and is currently being reviewed by the administration. This process usually takes up to 48 working hours.</p>
                </div>
            )}

            {status === 'verified' && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-xl flex items-center flex-col text-center space-y-3">
                    <CheckCircle size={48} className="text-emerald-500" />
                    <h3 className="text-lg font-bold">Verification Complete</h3>
                    <p className="text-sm">Your company has been successfully verified. You now have full access to the student database and placement portal.</p>
                </div>
            )}

            {status === 'rejected' && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-xl flex items-center flex-col text-center space-y-3">
                    <XCircle size={48} className="text-red-500" />
                    <h3 className="text-lg font-bold">Verification Failed</h3>
                    <p className="text-sm">Your application was rejected. Please ensure all details are accurate or contact the TPC administration for further assistance.</p>
                    <button onClick={() => setStatus('unsubmitted')} className="px-4 py-2 mt-2 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition">
                        Re-Submit Application
                    </button>
                </div>
            )}

            {status === 'unsubmitted' && (
                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-1"><Building2 size={16} /> Company Name</label>
                            <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} required placeholder="e.g. Google, Microsoft" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Company Website</label>
                            <input type="url" name="companyWebsite" value={formData.companyWebsite} onChange={handleChange} placeholder="https://www.example.com" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Company Email (Official)</label>
                            <input type="email" name="companyEmail" value={formData.companyEmail} onChange={handleChange} required placeholder="hr@company.com" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-slate-100 mt-2">
                        <div className="col-span-1 md:col-span-2">
                            <h4 className="text-sm font-bold text-slate-800">Primary HR Contact Details</h4>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">HR Name</label>
                            <input type="text" name="HRContactName" value={formData.HRContactName} onChange={handleChange} required placeholder="Full Name" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">HR Email</label>
                            <input type="email" name="HRContactEmail" value={formData.HRContactEmail} onChange={handleChange} required placeholder="name@company.com" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Contact Number</label>
                            <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} placeholder="+91 9876543210" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                        </div>
                    </div>

                    <button type="submit" disabled={submitting} className={`w-full py-3 mt-4 rounded-lg font-bold text-white shadow-md transition-all ${submitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'}`}>
                        {submitting ? 'Submitting Verification...' : 'Submit Verification Request'}
                    </button>
                </form>
            )}
        </div>
    );
}
