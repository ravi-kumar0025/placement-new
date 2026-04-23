import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Plus, Check, X, Edit3, Trash2, Tag, Calendar, MessageSquare, AlertCircle } from 'lucide-react';

const BRANCH_OPTIONS = ['CSE', 'EE', 'ME', 'CE', 'CBE'];
const PROGRAM_OPTIONS = ['B.Tech', 'M.Tech', 'M.Sc'];
const EVENT_TYPES = ['internship', 'placement_drive', 'workshop'];

export default function CompanyEvents() {
    const { token } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    // Modal State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'placement_drive',
        targetPrograms: [],
        targetBranches: [],
        targetYears: [],
    });
    const [formLoading, setFormLoading] = useState(false);

    // Action State
    const [feedback, setFeedback] = useState({});

    useEffect(() => {
        fetchEvents();
    }, [token]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/api/company/events', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEvents(data.events || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (eventId, action) => {
        try {
            await api.put(`/api/company/events/${eventId}/action`, {
                action,
                companyFeedback: feedback[eventId] || ''
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchEvents();
            if (action === 'request_change') {
                setFeedback({ ...feedback, [eventId]: '' });
            }
        } catch (err) {
            console.error('Failed to action', err);
            alert('Failed to perform action.');
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            await api.post('/api/company/events/request', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowModal(false);
            setFormData({
                title: '',
                description: '',
                type: 'placement_drive',
                targetPrograms: [],
                targetBranches: [],
                targetYears: [],
            });
            fetchEvents();
        } catch (err) {
            console.error('Failed to request event', err);
            alert('Failed to request event.');
        } finally {
            setFormLoading(false);
        }
    };

    const toggleArray = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(value) 
                ? prev[field].filter(v => v !== value)
                : [...prev[field], value]
        }));
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'published': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300';
            case 'pending_company_approval': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300';
            case 'pending_announcement_admin':
            case 'pending_admin': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    const formatStatus = (s) => s.replace(/_/g, ' ').toUpperCase();

    return (
        <div className="space-y-6 animate-[fade-in-up_0.5s_ease-out]">
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-800">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Manage Events</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Track and negotiate details for your upcoming drives.</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-transform active:scale-95"
                >
                    <Plus size={20} /> Request New Event
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : events.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-100 dark:border-slate-800 text-center text-slate-500 flex flex-col items-center gap-4">
                    <Calendar size={48} className="text-slate-300 dark:text-slate-700" />
                    <p className="text-lg font-medium text-slate-600 dark:text-slate-300">No events requested yet.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {events.map(event => (
                        <div key={event._id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden group hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{event.title}</h2>
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${getStatusStyle(event.status)}`}>
                                                {formatStatus(event.status)}
                                            </span>
                                        </div>
                                        <div className="flex gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                                            <span className="flex items-center gap-1.5"><Tag size={16}/> {event.type.replace('_', ' ').toUpperCase()}</span>
                                        </div>
                                    </div>
                                    {event.startDate && (
                                        <div className="text-right">
                                            <p className="text-xs uppercase font-bold text-slate-400">Allotted Dates</p>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">
                                                {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                                    {event.description}
                                </p>

                                {(event.adminNotes || event.companyFeedback) && (
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-3 mb-6 border border-slate-100 dark:border-slate-800">
                                        {event.adminNotes && (
                                            <div>
                                                <p className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase flex items-center gap-1"><MessageSquare size={12}/> Admin Notes</p>
                                                <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{event.adminNotes}</p>
                                            </div>
                                        )}
                                        {event.companyFeedback && (
                                            <div>
                                                <p className="text-xs font-black text-orange-600 dark:text-orange-400 uppercase flex items-center gap-1"><MessageSquare size={12}/> Your Feedback</p>
                                                <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{event.companyFeedback}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {event.status === 'pending_company_approval' && (
                                    <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-6">
                                        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                                            <AlertCircle className="text-amber-500"/> Action Required: Verify Timings
                                        </h3>
                                        <div className="flex flex-col sm:flex-row gap-3 items-end">
                                            <div className="flex-1 w-full relative">
                                                <input 
                                                    type="text" 
                                                    placeholder="Reason for change or cancellation (Required for modification)"
                                                    value={feedback[event._id] || ''}
                                                    onChange={e => setFeedback({...feedback, [event._id]: e.target.value})}
                                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                />
                                            </div>
                                            <div className="flex gap-2 w-full sm:w-auto shrink-0">
                                                <button onClick={() => handleAction(event._id, 'approve')} className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl font-bold transition-transform active:scale-95 shadow-lg shadow-emerald-500/20">
                                                    <Check size={18}/> Accept
                                                </button>
                                                <button onClick={() => handleAction(event._id, 'request_change')} className="flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-4 py-3 rounded-xl font-bold transition-transform active:scale-95 shadow-lg shadow-amber-500/20">
                                                    <Edit3 size={18}/> Modify
                                                </button>
                                                <button onClick={() => handleAction(event._id, 'cancel')} className="flex items-center justify-center gap-1.5 bg-slate-200 hover:bg-red-600 hover:text-white text-slate-700 px-4 py-3 rounded-xl font-bold transition-colors active:scale-95">
                                                    <Trash2 size={18}/> Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Request Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-100 dark:border-slate-800 overflow-hidden">
                        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">Request New Event</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="overflow-y-auto px-8 py-6 flex-1">
                            <form id="event-form" onSubmit={handleCreateEvent} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Job Title</label>
                                    <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow" placeholder="e.g. Software Development Engineer" />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Type</label>
                                        <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none capitalize font-semibold tracking-wide cursor-pointer transition-shadow">
                                            {EVENT_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Job Description</label>
                                    <textarea required rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow" placeholder="Detailed specs and requirements..." />
                                </div>

                                <div className="grid gap-6 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Target Programs</label>
                                        <div className="flex flex-wrap gap-2">
                                            {PROGRAM_OPTIONS.map(p => (
                                                <button type="button" key={p} onClick={() => toggleArray('targetPrograms', p)} className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${formData.targetPrograms.includes(p) ? 'bg-blue-600 text-white border-transparent' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400'}`}>
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Target Branches</label>
                                        <div className="flex flex-wrap gap-2">
                                            {BRANCH_OPTIONS.map(b => (
                                                <button type="button" key={b} onClick={() => toggleArray('targetBranches', b)} className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${formData.targetBranches.includes(b) ? 'bg-indigo-600 text-white border-transparent' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400'}`}>
                                                    {b}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-end gap-3 rounded-b-3xl">
                            <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition">Cancel</button>
                            <button type="submit" form="event-form" disabled={formLoading} className="px-6 py-2.5 rounded-xl font-black text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100">
                                {formLoading ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
