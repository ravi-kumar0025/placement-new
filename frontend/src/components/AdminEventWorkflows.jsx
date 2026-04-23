import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Calendar, CheckCircle, ChevronDown, Check, Clock, X, MessageSquare } from 'lucide-react';

export default function AdminEventWorkflows() {
    const { user, token } = useAuth();
    
    const canDoAnnouncement = user.adminType === 'super_admin' || user.adminType === 'announcement_admin';
    const canDoAdminVerify = user.adminType === 'super_admin' || user.adminType === 'student_admin';

    const [activeTab, setActiveTab] = useState(canDoAnnouncement ? 'announcement' : 'admin');
    
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const [allotModal, setAllotModal] = useState({ show: false, eventId: null });
    const [dates, setDates] = useState({ startDate: '', endDate: '', deadline: '', adminNotes: '' });

    const [verifyModal, setVerifyModal] = useState({ show: false, eventId: null });
    const [verifyNotes, setVerifyNotes] = useState('');

    useEffect(() => {
        fetchWorkflowEvents();
    }, [activeTab, token]);

    const fetchWorkflowEvents = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'announcement' 
                ? '/api/admin/events/workflow/pending-announcement' 
                : '/api/admin/events/workflow/pending-admin';
            
            const { data } = await api.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEvents(data.events || []);
        } catch (err) {
            console.error('Failed to fetch workflow events', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAllotSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/api/admin/events/workflow/${allotModal.eventId}/allot-timing`, dates, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllotModal({ show: false, eventId: null });
            fetchWorkflowEvents();
            setDates({ startDate: '', endDate: '', deadline: '', adminNotes: '' });
        } catch (err) {
            console.error(err);
            alert('Failed to allot timing.');
        }
    };

    const handleVerifySubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/api/admin/events/workflow/${verifyModal.eventId}/verify-timing`, { adminNotes: verifyNotes }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVerifyModal({ show: false, eventId: null });
            fetchWorkflowEvents();
            setVerifyNotes('');
        } catch (err) {
            console.error(err);
            alert('Failed to verify event.');
        }
    };

    return (
        <div className="space-y-6 animate-[fade-in-up_0.5s_ease-out]">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-800">
                <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Clock className="text-blue-600 dark:text-blue-400" /> Event Workflows
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Review, allot dates, and verify event proposals from companies.</p>

                {user.adminType === 'super_admin' && (
                    <div className="flex gap-4 mt-6">
                        <button onClick={() => setActiveTab('announcement')} className={`px-5 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'announcement' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                            Needs Date Allocation
                        </button>
                        <button onClick={() => setActiveTab('admin')} className={`px-5 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'admin' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                            Needs Final Verification
                        </button>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : events.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-100 dark:border-slate-800 text-center text-slate-500 flex flex-col items-center gap-4">
                    <CheckCircle size={48} className="text-emerald-400 dark:text-emerald-600" />
                    <p className="text-lg font-medium text-slate-600 dark:text-slate-300">All caught up! No pending events in this queue.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {events.map((event) => (
                        <div key={event._id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-shadow">
                            <div className="flex-1 space-y-3">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{event.title}</h2>
                                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1 uppercase tracking-wide">
                                        Company: {event.companyRef?.companyName || 'Unknown'} <span className="lowercase font-normal text-slate-500">({event.companyRef?.companyEmail})</span>
                                    </p>
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <p className="font-bold mb-1 uppercase text-xs tracking-wider text-slate-400">Description</p>
                                    {event.description}
                                </div>
                                {(event.adminNotes || event.companyFeedback) && (
                                    <div className="flex flex-col gap-2 mt-4">
                                        {event.adminNotes && <div className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 p-3 rounded-lg border border-blue-100 dark:border-blue-900"><strong className="flex items-center gap-1"><MessageSquare size={12}/> Admin Notes:</strong> {event.adminNotes}</div>}
                                        {event.companyFeedback && <div className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-3 rounded-lg border border-amber-100 dark:border-amber-900"><strong className="flex items-center gap-1"><MessageSquare size={12}/> Company Feedback:</strong> {event.companyFeedback}</div>}
                                    </div>
                                )}
                            </div>

                            <div className="w-full md:w-64 shrink-0 flex flex-col items-start md:items-end gap-4 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
                                {activeTab === 'announcement' ? (
                                    <div className="w-full flex flex-col gap-3">
                                        <div className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800 w-full text-center">Awaiting Dates</div>
                                        <button onClick={() => setAllotModal({ show: true, eventId: event._id })} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition-transform active:scale-95 flex justify-center items-center gap-2">
                                            <Calendar size={18}/> Allot Dates
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-full flex flex-col gap-3">
                                        <div className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-700 dark:text-slate-300 text-right">
                                            <p className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 mb-1">Proposed Dates</p>
                                            <p><span className="font-semibold text-slate-900 dark:text-slate-100">{new Date(event.startDate).toLocaleDateString()}</span> - <span className="font-semibold text-slate-900 dark:text-slate-100">{new Date(event.endDate).toLocaleDateString()}</span></p>
                                        </div>
                                        <button onClick={() => setVerifyModal({ show: true, eventId: event._id })} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-emerald-500/30 transition-transform active:scale-95 flex justify-center items-center gap-2">
                                            <Check size={18}/> Verify & Pass
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Allot Dates Modal */}
            {allotModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-6 border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Allot Academics Dates</h2>
                            <button onClick={() => setAllotModal({ show: false, eventId: null })} className="text-slate-400 hover:bg-slate-100 p-2 rounded-full"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleAllotSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Start Date</label>
                                <input required type="date" value={dates.startDate} onChange={e => setDates({...dates, startDate: e.target.value})} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-950 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">End Date</label>
                                <input required type="date" value={dates.endDate} onChange={e => setDates({...dates, endDate: e.target.value})} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-950 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Application Deadline</label>
                                <input required type="date" value={dates.deadline} onChange={e => setDates({...dates, deadline: e.target.value})} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-950 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Admin Notes (Optional)</label>
                                <textarea rows={2} value={dates.adminNotes} onChange={e => setDates({...dates, adminNotes: e.target.value})} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-950 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Notes for next steps..."></textarea>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 text-lg rounded-xl mt-4">Confirm Dates</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Verify Modal */}
            {verifyModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-6 border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Verify Event</h2>
                            <button onClick={() => setVerifyModal({ show: false, eventId: null })} className="text-slate-400 hover:bg-slate-100 p-2 rounded-full"><X size={20}/></button>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">You are confirming the allotted dates and event structure. Once verified, this gets sent back to the Company for final approval.</p>
                        <form onSubmit={handleVerifySubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Pass Notes to Company (Optional)</label>
                                <textarea rows={3} value={verifyNotes} onChange={e => setVerifyNotes(e.target.value)} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-950 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Please check the scheduled dates..."></textarea>
                            </div>
                            <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 text-lg rounded-xl mt-4">Verify & Pass to Company</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
