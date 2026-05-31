import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, KeyRound, ChevronRight, Loader2, House } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

export default function Signup() {
    // Base Fields
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('student');
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');

    // Status
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Student Fields
    const [fullName, setFullName] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const [department, setDepartment] = useState('');
    const [program, setProgram] = useState('B.Tech');
    const [graduationYear, setGraduationYear] = useState('');
    const [currentYearOfStudy, setCurrentYearOfStudy] = useState('');

    // Company Fields
    const [companyName, setCompanyName] = useState('');
    const [companyEmail, setCompanyEmail] = useState('');
    const [companyWebsite, setCompanyWebsite] = useState('');
    const [HRContactName, setHRContactName] = useState('');
    const [HRContactEmail, setHRContactEmail] = useState('');

    // Admin Fields
    const [adminType, setAdminType] = useState('announcement_admin');

    const { user, login } = useAuth();
    const navigate = useNavigate();

    if (user) {
        return <Navigate to={`/dashboard/${user.role}`} replace />;
    }

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        let payload = { email, role };

        if (role === 'student') {
            payload = { ...payload, fullName, rollNumber, department, program, graduationYear: Number(graduationYear), currentYearOfStudy };
        } else if (role === 'company') {
            payload = { ...payload, companyName, companyEmail, companyWebsite, HRContactName, HRContactEmail };
        } else if (role === 'admin') {
            payload = { ...payload, fullName, adminType };
        }

        try {
            await api.post('/api/auth/signup', payload);
            setOtpSent(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await api.post('/api/auth/verify-otp', { email, otp });
            login(data.token, data.user);
            navigate('/dashboard/' + data.user.role);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Helper for input styles
    const inputStyle = "block w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all shadow-sm bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400 dark:hover:bg-slate-800";
    const labelStyle = "block text-sm font-semibold text-slate-700 mb-2 dark:text-slate-200";

    return (
        <div className="min-h-screen bg-transparent flex items-center justify-center p-4 selection:bg-blue-100 selection:text-blue-900 dark:bg-transparent dark:selection:bg-slate-700 dark:selection:text-slate-100">
            <div className="fixed top-4 right-4 z-20 flex items-center gap-2">
                <ThemeToggle />
                <Link
                    to="/"
                    className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-slate-200 text-slate-700 px-3 py-2 rounded-xl shadow-sm hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors dark:bg-slate-900/90 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                    <House size={16} />
                    <span className="text-sm font-semibold">Home</span>
                </Link>
            </div>
            <div className="absolute top-0 w-full h-1/2 bg-blue-900/5 inset-0 -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="max-w-md w-full">
                <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-100 animate-[fade-in-up_0.5s_ease-out] dark:bg-slate-900 dark:ring-slate-700">
                    <div className="text-center mb-10">
                        <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-blue-100 transform -rotate-3 hover:rotate-0 transition-transform">
                            <ShieldCheck size={32} strokeWidth={1.5} />
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight dark:text-slate-100">Welcome to TPC</h2>
                        <p className="mt-3 text-slate-500 font-medium dark:text-slate-400">Passwordless portal access for IITP</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50/80 border border-red-100 text-red-600 text-sm flex items-start gap-3 animate-pulse dark:bg-red-950/40 dark:border-red-900 dark:text-red-300">
                            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {!otpSent ? (
                        <form onSubmit={handleRequestOtp} className="space-y-5">
                            <div>
                                <label className={labelStyle}>Account Type</label>
                                <select value={role} onChange={(e) => setRole(e.target.value)} className={inputStyle + " cursor-pointer appearance-none"}>
                                    <option value="student">Student</option>
                                    <option value="company">Company</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div>
                                <label className={labelStyle}>Login Email</label>
                                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputStyle} placeholder="you@example.com" />
                            </div>

                            {/* Dynamic Fields */}
                            {role === 'student' && (
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 dark:text-slate-500">Student Profile</h3>
                                    <input required type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} className={inputStyle} />
                                    <input required type="text" placeholder="Roll Number" value={rollNumber} onChange={e => setRollNumber(e.target.value)} className={inputStyle} />
                                    <input required type="text" placeholder="Department (e.g., CSE)" value={department} onChange={e => setDepartment(e.target.value)} className={inputStyle} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <select required value={program} onChange={e => setProgram(e.target.value)} className={inputStyle}>
                                            <option value="B.Tech">B.Tech</option>
                                            <option value="M.Tech">M.Tech</option>
                                            <option value="M.Sc">M.Sc</option>
                                        </select>
                                        <input required type="number" placeholder="Grad Year" value={graduationYear} onChange={e => setGraduationYear(e.target.value)} className={inputStyle} />
                                    </div>
                                    <select required value={currentYearOfStudy} onChange={e => setCurrentYearOfStudy(e.target.value)} className={inputStyle}>
                                        <option value="" disabled>Select Current Year of Study</option>
                                        <option value="1st Year">1st Year</option>
                                        <option value="2nd Year">2nd Year</option>
                                        <option value="3rd Year">3rd Year</option>
                                        <option value="4th Year">4th Year</option>
                                        <option value="5th Year">5th Year</option>
                                    </select>
                                </div>
                            )}

                            {role === 'company' && (
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 dark:text-slate-500">Company Details</h3>
                                    <input required type="text" placeholder="Company Name" value={companyName} onChange={e => setCompanyName(e.target.value)} className={inputStyle} />
                                    <input required type="email" placeholder="Company Display Email" value={companyEmail} onChange={e => setCompanyEmail(e.target.value)} className={inputStyle} />
                                    <input required type="text" placeholder="Company Website" value={companyWebsite} onChange={e => setCompanyWebsite(e.target.value)} className={inputStyle} />
                                    <input required type="text" placeholder="HR Contact Name" value={HRContactName} onChange={e => setHRContactName(e.target.value)} className={inputStyle} />
                                    <input required type="email" placeholder="HR Contact Email" value={HRContactEmail} onChange={e => setHRContactEmail(e.target.value)} className={inputStyle} />
                                </div>
                            )}

                            {role === 'admin' && (
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 dark:text-slate-500">Admin Profile</h3>
                                    <input required type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} className={inputStyle} />
                                    <select required value={adminType} onChange={e => setAdminType(e.target.value)} className={inputStyle}>
                                        <option value="announcement_admin">Announcement Admin</option>
                                        <option value="student_admin">Student Admin</option>
                                        <option value="super_admin">Super Admin</option>
                                    </select>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-4 flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md shadow-blue-500/20 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Request One-Time Password'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100 mb-6 dark:bg-blue-950/40 dark:border-blue-900">
                                <p className="text-sm text-blue-800 font-medium dark:text-blue-200">OTP sent to <br /><strong>{email}</strong></p>
                                <button type="button" onClick={() => setOtpSent(false)} className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-bold uppercase tracking-wider underline underline-offset-4">
                                    Go Back
                                </button>
                            </div>

                            <div>
                                <label className={labelStyle}>Enter 6-digit OTP</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <KeyRound className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all shadow-sm text-center tracking-[0.5em] text-lg font-bold bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:bg-slate-800"
                                        placeholder="••••••"
                                        maxLength={6}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md shadow-blue-500/20 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none group"
                            >
                                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                                    <>Secure Login <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                                )}
                            </button>
                        </form>
                    )}

                    <div className="mt-6 pt-6 border-t border-slate-100 text-center dark:border-slate-800">
                        <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors dark:text-slate-300">
                            Already have an account? <span className="text-blue-600 underline underline-offset-4 pointer-events-none">Log in</span>
                        </Link>
                    </div>
                </div>

                <div className="mt-8 text-center text-sm text-slate-500 flex items-center justify-center gap-2 dark:text-slate-400">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    Protected by institutional-grade security
                </div>
            </div>
        </div>
    );
}
