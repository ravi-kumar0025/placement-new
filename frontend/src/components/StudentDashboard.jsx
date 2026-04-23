import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';


import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import './StudentDashboard.css';
import { Calendar as CalendarIcon, Megaphone, Clock, Briefcase, AlertTriangle } from 'lucide-react';

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

export default function StudentDashboard() {
    const { token, user } = useAuth();
    const [events, setEvents] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [viewedIds, setViewedIds] = useState(new Set());
    const [currentDate, setCurrentDate] = useState(new Date());

    const isPendingOrUnsubmitted = user?.verificationStatus === 'pending' || user?.verificationStatus === 'unsubmitted';

    // ±2 months navigation bounds (relative to today, computed once)
    const today = useMemo(() => new Date(), []);
    const minMonth = useMemo(() => new Date(today.getFullYear(), today.getMonth() - 2, 1), [today]);
    const maxMonth = useMemo(() => new Date(today.getFullYear(), today.getMonth() + 2, 1), [today]);

    const isAtMin = currentDate.getFullYear() === minMonth.getFullYear() && currentDate.getMonth() === minMonth.getMonth();
    const isAtMax = currentDate.getFullYear() === maxMonth.getFullYear() && currentDate.getMonth() === maxMonth.getMonth();

    const goToPrev = () => {
        if (isAtMin) return;
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const goToNext = () => {
        if (isAtMax) return;
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const goToToday = () => setCurrentDate(new Date());

    useEffect(() => {
        if (token && user) {
            fetchEvents();
            fetchAnnouncements();
        }
    }, [token, user?.department]);

    const fetchEvents = async () => {
        try {
            const { data } = await api.get('/api/student/events', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const formattedEvents = data.events.map(e => ({
                id: e._id,
                title: e.title,
                start: new Date(e.startDate || e.date),
                end: new Date(e.endDate || new Date(new Date(e.startDate || e.date).getTime() + 60 * 60 * 1000)),
                type: e.type,
                description: e.description,
                targetAudience: e.targetAudience,
                targetBranches: e.targetBranches || [],
                createdBy: e.createdBy,
            }));
            setEvents(formattedEvents);
        } catch (err) {
            console.error("Error fetching events:", err);
        }
    };

    const fetchAnnouncements = async () => {
        try {
            // Fetch all announcements — no filtering on the client
            const { data } = await api.get(
                '/api/student/announcements',
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAnnouncements(data.announcements);
        } catch (err) {
            console.error("Error fetching announcements:", err);
        }
    };

    const eventStyleGetter = (event) => {
        const isViewed = viewedIds.has(event.id || event.title);


        if (event.type === 'announcement') {
            const bg = isViewed ? '#fbbf24' : '#f59e0b';
            return {
                className: 'rbc-event-announcement',
                style: {
                    backgroundColor: bg,
                    color: '#fff',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                    opacity: isViewed ? 0.75 : 1,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
                }
            };
        }


        let color = isViewed ? '#93c5fd' : '#3b82f6';
        if (event.type === 'internship') color = isViewed ? '#6ee7b7' : '#10b981';
        if (event.type === 'placement_drive') color = isViewed ? '#c4b5fd' : '#8b5cf6';

        return {
            style: {
                color,
                backgroundColor: 'transparent',
                border: 'none',
                boxShadow: 'none',
                padding: 0,
                opacity: isViewed ? 0.55 : 1,
            }
        };
    };


    const calendarEvents = [
        ...announcements.map(a => {
            const eventDate = new Date(a.editedAt || a.createdAt);
            return {
                id: a._id,
                title: a.isEdited ? `✎ ${a.title}` : a.title,
                start: eventDate,
                end: new Date(eventDate.getTime() + 60 * 60 * 1000),
                type: a.type || 'announcement',
                description: a.content || a.description,
                targetAudience: a.targetAudience,
                targetBranches: a.targetBranches || [],
                isEdited: a.isEdited,
                createdBy: a.createdBy,
            };
        })
    ];

    const handleSelectEvent = (event) => {

        const idx = announcements.findIndex(a => a._id === event.id);
        setSelectedEvent(event);
        setSelectedIndex(idx >= 0 ? idx : null);
        setViewedIds(prev => new Set([...prev, event.id || event.title]));
    };

    const goToPrevAnnouncement = () => {
        if (selectedIndex === null || selectedIndex <= 0) return;
        const newIndex = selectedIndex - 1;
        const a = announcements[newIndex];
        const eventDate = new Date(a.editedAt || a.createdAt);
        const ev = {
            id: a._id, title: a.title,
            start: eventDate,
            end: new Date(eventDate.getTime() + 60 * 60 * 1000),
            type: a.type || 'announcement',
            description: a.content || a.description,
            targetAudience: a.targetAudience,
            targetBranches: a.targetBranches || [],
            isEdited: a.isEdited,
            createdBy: a.createdBy,
        };
        setSelectedEvent(ev);
        setSelectedIndex(newIndex);
        setViewedIds(prev => new Set([...prev, a._id]));
    };

    const goToNextAnnouncement = () => {
        if (selectedIndex === null || selectedIndex >= announcements.length - 1) return;
        const newIndex = selectedIndex + 1;
        const a = announcements[newIndex];
        const eventDate = new Date(a.editedAt || a.createdAt);
        const ev = {
            id: a._id, title: a.title,
            start: eventDate,
            end: new Date(eventDate.getTime() + 60 * 60 * 1000),
            type: a.type || 'announcement',
            description: a.content || a.description,
            targetAudience: a.targetAudience,
            targetBranches: a.targetBranches || [],
            isEdited: a.isEdited,
            createdBy: a.createdBy,
        };
        setSelectedEvent(ev);
        setSelectedIndex(newIndex);
        setViewedIds(prev => new Set([...prev, a._id]));
    };

    const closeDetails = () => {
        setSelectedEvent(null);
        setSelectedIndex(null);
    };

    if (isPendingOrUnsubmitted) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center max-w-md mx-auto animate-[fade-in-up_0.5s_ease-out]">
                <div className="w-20 h-20 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-yellow-100 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900">
                    <AlertTriangle size={36} strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                    {user?.verificationStatus === 'unsubmitted' ? 'Verification Required' : 'Account Under Review'}
                </h2>
                <p className="text-slate-500 dark:text-slate-300 mb-8 leading-relaxed">
                    {user?.verificationStatus === 'unsubmitted'
                        ? 'You must send a verification request from the "Verify Yourself" tab. Once verified by the TPC, you will be able to access your dashboard timeline.'
                        : 'Your student profile is currently being verified by the Training and Placement Cell. Access to your dashboard timeline will be granted once verified.'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-[fade-in-up_0.5s_ease-out]">
            <div className="flex justify-between items-center bg-white/95 p-6 rounded-2xl shadow-[0_10px_30px_-18px_rgba(15,23,42,0.45)] border border-slate-100 backdrop-blur-sm dark:bg-slate-900/90 dark:border-slate-700/70 dark:shadow-[0_14px_32px_-18px_rgba(2,6,23,0.8)]">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2 dark:text-slate-100">
                        Welcome back, {user?.name || user?.email?.split('@')[0]}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 dark:text-slate-300">Here is your timeline for upcoming opportunities.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Calendar Area */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-[0_12px_32px_-20px_rgba(15,23,42,0.5)] border border-slate-100 flex flex-col backdrop-blur-sm">
                    {/* Header: title */}
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-3">
                        <CalendarIcon className="text-blue-500" /> Event Calendar
                    </h2>
                    {/* Toolbar row: buttons left, month centred */}
                    <div className="relative flex items-center mb-4 pb-4 border-b border-slate-100">
                        {/* Left — nav buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={goToPrev}
                                disabled={isAtMin}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                            >
                                ‹ Back
                            </button>
                            <button
                                onClick={goToToday}
                                className="px-3 py-1.5 rounded-lg border border-blue-300 bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition-colors shadow-sm"
                            >
                                Today
                            </button>
                            <button
                                onClick={goToNext}
                                disabled={isAtMax}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                            >
                                Next ›
                            </button>
                        </div>
                        {/* Centre — month label (absolute so it doesn't push buttons) */}
                        <span className="absolute left-1/2 -translate-x-1/2 text-sm font-bold text-slate-700 pointer-events-none">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </span>
                    </div>
                    <div className="flex-1 min-h-[500px] calendar-wrapper calendar-color-lock">
                        <style>{`
                            /* --- Base --- */
                            .rbc-calendar { font-family: 'Inter', sans-serif; }
                            .calendar-wrapper .rbc-calendar,
                            .calendar-wrapper .rbc-month-view,
                            .calendar-wrapper .rbc-time-view,
                            .calendar-wrapper .rbc-time-header-content,
                            .calendar-wrapper .rbc-time-content,
                            .calendar-wrapper .rbc-time-gutter,
                            .calendar-wrapper .rbc-month-row,
                            .calendar-wrapper .rbc-row-bg,
                            .calendar-wrapper .rbc-day-bg {
                                background: #ffffff !important;
                            }
                            .rbc-header { padding: 10px; font-weight: 700; text-transform: uppercase; font-size: 0.72rem; color: #475569; border-bottom: 1px solid #e2e8f0; }

                            /* --- Date cell numbers as circles --- */
                            .rbc-date-cell { text-align: center; padding: 4px 0; }
                            .rbc-date-cell button, .rbc-date-cell a {
                                display: inline-flex;
                                align-items: center;
                                justify-content: center;
                                width: 30px;
                                height: 30px;
                                border-radius: 50%;
                                font-size: 0.82rem;
                                font-weight: 500;
                                color: #1e293b;
                                transition: background 0.15s;
                                text-decoration: none;
                            }
                            .rbc-date-cell button:hover, .rbc-date-cell a:hover { background: #e2e8f0; }
                            /* Today date number — plain, no circle */
                            .rbc-now .rbc-button-link, .rbc-now button, .rbc-now a {
                                background: transparent !important;
                                color: #1d4ed8 !important;
                                font-weight: 800 !important;
                            }
                            /* Today's full cell — top-to-bottom blue gradient */
                            .rbc-today { background: linear-gradient(to bottom, #eff6ff 0%, #93c5fd 100%) !important; }
                            .rbc-off-range-bg { background-color: #e8edf4; }
                            /* Current month cells */
                            .rbc-month-view .rbc-day-bg {
                                background-color: #ffffff;
                            }
                            /* Today's cell — top-to-bottom blue gradient */
                            .rbc-month-view .rbc-today {
                                background: linear-gradient(to bottom, #eff6ff 0%, #93c5fd 100%) !important;
                            }
                            /* Prev / next month cells — noticeably darker */
                            .rbc-month-view .rbc-off-range-bg {
                                background-color: #f3f5f8;
                                border-radius: 12px;
                            }
                            .rbc-off-range .rbc-date-cell a,
                            .rbc-off-range .rbc-button-link,
                            .rbc-off-range button {
                                color: #64748b;
                                opacity: 1;
                            }

                            /* --- Events: dot style by default, solid box for announcements --- */
                            .rbc-month-view .rbc-event {
                                padding: 0 !important;
                                background: transparent !important;
                                border: none !important;
                                box-shadow: none !important;
                                min-height: unset !important;
                            }
                            /* Announcements override: solid amber box */
                            .rbc-month-view .rbc-event[data-type="announcement"],
                            .rbc-month-view .rbc-event.rbc-event-announcement {
                                background: #f59e0b !important;
                                border-radius: 6px !important;
                                padding: 1px 6px !important;
                                box-shadow: 0 1px 3px rgba(0,0,0,0.15) !important;
                            }
                            .rbc-month-view .rbc-event-content {
                                display: flex;
                                align-items: center;
                                gap: 5px;
                                padding: 2px 4px;
                                font-size: 0.72rem;
                                font-weight: 600;
                                white-space: nowrap;
                                overflow: hidden;
                                text-overflow: ellipsis;
                                color: #1e293b;
                            }
                            /* Colored dot before title — month view only (not for announcement boxes) */
                            .rbc-month-view .rbc-event-content::before {
                                content: '';
                                display: inline-block;
                                min-width: 9px;
                                height: 9px;
                                border-radius: 50%;
                                background: currentColor;
                                flex-shrink: 0;
                            }
                            /* Announcement box: no dot, white text */
                            .rbc-month-view .rbc-event.rbc-event-announcement .rbc-event-content::before {
                                display: none;
                            }
                            .rbc-month-view .rbc-event.rbc-event-announcement .rbc-event-content {
                                color: #fff !important;
                                font-weight: 700;
                            }
                            .rbc-event-label { display: none; }
                            .rbc-selected { outline: none !important; }

                            /* --- "+N more" link --- */
                            .rbc-show-more {
                                font-size: 0.7rem;
                                color: #1d4ed8;
                                font-weight: 700;
                                padding-left: 6px;
                                background: none;
                            }

                            .calendar-wrapper .rbc-toolbar .rbc-toolbar-label {
                                color: #0f172a !important;
                                font-weight: 700;
                            }
                            .calendar-wrapper .rbc-toolbar button {
                                color: #334155 !important;
                                background: #ffffff !important;
                                border-color: #cbd5e1 !important;
                                font-weight: 600;
                            }
                            .calendar-wrapper .rbc-toolbar button:hover,
                            .calendar-wrapper .rbc-toolbar button:focus-visible {
                                color: #1e293b !important;
                                background: #f8fafc !important;
                            }
                            .calendar-wrapper .rbc-toolbar button.rbc-active {
                                background: #f1f5f9 !important;
                                color: #0f172a !important;
                            }

                            /* --- Popup overlay stays as rounded rectangle pills --- */
                            .rbc-overlay {
                                border-radius: 12px;
                                box-shadow: 0 8px 30px rgba(0,0,0,0.14);
                                border: 1px solid #e2e8f0;
                                padding: 8px;
                                z-index: 100;
                                background: #fff;
                            }
                            .rbc-overlay-header {
                                font-size: 0.72rem;
                                font-weight: 700;
                                color: #64748b;
                                text-transform: uppercase;
                                letter-spacing: 0.05em;
                                padding: 4px 6px 8px;
                                border-bottom: 1px solid #f1f5f9;
                                margin-bottom: 4px;
                            }
                            .rbc-overlay .rbc-event {
                                border-radius: 6px !important;
                                padding: 5px 10px !important;
                                margin-bottom: 4px;
                                background: #3b82f6 !important;
                                color: #fff;
                            }
                            .rbc-overlay .rbc-event-content {
                                font-size: 0.78rem;
                                font-weight: 500;
                                color: #fff !important;
                            }
                            .rbc-overlay .rbc-event-content::before { display: none; }

                            /* --- Grid lines --- */
                            .rbc-month-row { border-color: #f1f5f9; }
                            .rbc-day-bg + .rbc-day-bg { border-color: #f1f5f9; }
                            .rbc-month-view { border-color: #f1f5f9; border-radius: 8px; }
                        `}</style>
                        <BigCalendar
                            localizer={localizer}
                            events={calendarEvents}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: 500 }}
                            date={currentDate}
                            onNavigate={() => { }}
                            eventPropGetter={eventStyleGetter}
                            views={['month']}
                            defaultView="month"
                            toolbar={false}
                            popup={true}
                            onSelectEvent={handleSelectEvent}
                        />
                    </div>
                </div>

                {/* Announcements / Details Sidebar */}
                <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col h-full dark:bg-slate-900/90 dark:border-slate-700/70 dark:shadow-[0_18px_36px_-20px_rgba(2,6,23,0.9)]">

                    {selectedEvent ? (
                        <>
                            {/* Panel header ─ title left, nav pill + close right */}
                            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-5 dark:border-slate-700">
                                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 dark:text-slate-100">
                                    <Briefcase size={16} className="text-indigo-500 dark:text-indigo-300" /> Event Details
                                </h2>
                                <div className="flex items-center gap-2">
                                    {/* Compact nav pill */}
                                    {announcements.length > 1 && (
                                        <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg px-1 py-0.5">
                                            <button
                                                onClick={goToNextAnnouncement}
                                                disabled={selectedIndex === null || selectedIndex >= announcements.length - 1}
                                                title="Older"
                                                className="p-1 rounded transition-colors text-slate-500 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                            </button>

                                            <button
                                                onClick={goToPrevAnnouncement}
                                                disabled={selectedIndex === null || selectedIndex <= 0}
                                                title="Newer"
                                                className="p-1 rounded transition-colors text-slate-500 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                                            </button>
                                        </div>
                                    )}
                                    {/* Close */}
                                    <button
                                        onClick={closeDetails}
                                        className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-red-500 dark:hover:bg-slate-800 dark:text-slate-500 dark:hover:text-red-300"
                                        title="Close"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                                <div>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-600 mb-2 dark:bg-slate-800 dark:text-slate-300">
                                        {selectedEvent.type ? selectedEvent.type.replace('_', ' ') : 'Event'}
                                    </span>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2 dark:text-slate-100">{selectedEvent.title}</h3>
                                    <div className="flex flex-col gap-1 text-sm text-slate-500 mb-4 dark:text-slate-300">
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} className="text-slate-400 dark:text-slate-500" />
                                            <span>{new Date(selectedEvent.start).toLocaleString()}</span>
                                            {selectedEvent.isEdited && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800/60">
                                                    Edited
                                                </span>
                                            )}
                                        </div>
                                        {selectedEvent.createdBy && (
                                            <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 1 0-16 0" /></svg>
                                                <span>By <span className="font-semibold text-slate-600 dark:text-slate-300">{selectedEvent.createdBy?.fullName || selectedEvent.createdBy?.email || 'Admin'}</span></span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 dark:bg-slate-800/80 dark:border-slate-700">
                                    <h4 className="font-semibold text-slate-800 text-sm mb-2 dark:text-slate-100">Description</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap dark:text-slate-300">
                                        {selectedEvent.description || selectedEvent.content || "No detailed description provided."}
                                    </p>
                                </div>

                                {/* Target metadata */}
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 dark:bg-slate-800/80 dark:border-slate-700 space-y-2">
                                    <h4 className="font-semibold text-slate-800 text-sm mb-1 dark:text-slate-100">Broadcast To</h4>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Audience:</span>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                                            {selectedEvent.targetAudience === 'all' ? 'All Programs' : (selectedEvent.targetAudience || 'All Programs').toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-2 flex-wrap">
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-0.5">Branches:</span>
                                        {selectedEvent.targetBranches && selectedEvent.targetBranches.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {selectedEvent.targetBranches.map((b, i) => (
                                                    <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">{b}</span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">All Branches</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4 dark:text-slate-100 dark:border-slate-700">
                                <Megaphone className="text-amber-500 dark:text-amber-300" /> Recent Announcements
                            </h2>
                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar flex-1">
                                {announcements.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400 font-medium text-sm dark:text-slate-500">No new announcements for your branch.</div>
                                ) : (
                                    announcements.map((a, idx) => (
                                        <div
                                            key={a._id}
                                            onClick={() => handleSelectEvent({
                                                id: a._id,
                                                title: a.title,
                                                start: new Date(a.editedAt || a.createdAt),
                                                end: new Date(new Date(a.editedAt || a.createdAt).getTime() + 60 * 60 * 1000),
                                                type: a.type || 'announcement',
                                                description: a.content || a.description,
                                                targetAudience: a.targetAudience,
                                                targetBranches: a.targetBranches || [],
                                                isEdited: a.isEdited,
                                                createdBy: a.createdBy,
                                            })}
                                            className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-blue-50 hover:border-blue-100 transition-colors group cursor-pointer dark:border-slate-700 dark:bg-slate-800/70 dark:hover:bg-slate-800 dark:hover:border-blue-800"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-white border shadow-sm group-hover:border-blue-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:group-hover:border-blue-700">
                                                        {a.type ? a.type.replace('_', ' ') : 'Announcement'}
                                                    </span>
                                                    {a.isEdited && (
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800/60">
                                                            Edited
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-slate-400 font-medium flex items-center gap-1 dark:text-slate-500"><Clock size={12} />{new Date(a.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-blue-700 transition-colors dark:text-slate-100 dark:group-hover:text-blue-300">{a.title}</h3>
                                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed dark:text-slate-300">{a.content || a.description}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
