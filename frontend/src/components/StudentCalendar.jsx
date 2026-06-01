import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { AnimatePresence } from 'framer-motion';
import {
    X, Briefcase, Megaphone, MonitorPlay,
    Calendar as CalendarIcon, CheckCircle2, ExternalLink, Clock, MapPin, Loader2, AlertTriangle
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
    format, parse, startOfWeek, getDay, locales,
});

// ─── Color Engine ─────────────────────────────────────────────────────
// Assigns a background color to an event based on status and application state.
const COLORS = {
    APPLIED: '#4ade80',      // Light green — student already applied
    PAST: '#9ca3af',         // Grey — event ended
    ACTIVE: '#16a34a',       // Dark green — event happening right now
    UPCOMING: '#3b82f6',     // Blue — event in the future
    ANNOUNCEMENT: '#f59e0b', // Amber — announcements
};

function getEventColor(event, userEmail) {
    if (event.type === 'announcement') return COLORS.ANNOUNCEMENT;

    const now = new Date();
    const endDate = new Date(event.rawEnd);
    const startDate = new Date(event.rawStart);

    // Highest priority: student has applied
    const applied = event.appliedStudents?.includes(userEmail);
    if (applied) return COLORS.APPLIED;

    // Past
    if (endDate < now) return COLORS.PAST;

    // Active (today is between start and end, inclusive)
    if (startDate <= now && now <= endDate) return COLORS.ACTIVE;

    // Upcoming
    return COLORS.UPCOMING;
}

function getStatusLabel(event, userEmail) {
    if (event.type === 'announcement') return { text: 'Announcement', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' };
    const now = new Date();
    const endDate = new Date(event.rawEnd);
    const startDate = new Date(event.rawStart);
    const applied = event.appliedStudents?.includes(userEmail);

    if (applied) return { text: '✓ Applied', bg: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' };
    if (endDate < now) return { text: 'Ended', bg: 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400' };
    if (startDate <= now && now <= endDate) return { text: 'Active Now', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' };
    return { text: 'Upcoming', bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' };
}

// ─── Main Component ───────────────────────────────────────────────────
const StudentCalendar = () => {
    const { user, token } = useAuth();
    const userEmail = user?.email || '';
    const authToken = token || localStorage.getItem('jwtToken');

    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [applyingId, setApplyingId] = useState(null);
    const [applySuccess, setApplySuccess] = useState({});
    const [currentDate, setCurrentDate] = useState(new Date());

    const isPendingOrUnsubmitted = user?.verificationStatus === 'pending' || user?.verificationStatus === 'unsubmitted';

    // ±2 months navigation bounds (relative to today, computed once)
    const today = useMemo(() => new Date(), []);
    const minMonth = useMemo(() => new Date(today.getFullYear(), today.getMonth() - 2, 1), [today]);
    const maxMonth = useMemo(() => new Date(today.getFullYear(), today.getMonth() + 2, 1), [today]);

    // Returns true if the viewed month equals the (year, month) of the given boundary
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

    const fetchCalendar = useCallback(async () => {
        try {
            if (!authToken) throw new Error('No authentication token found');

            const response = await api.get('/api/student/calendar', {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            const formattedEvents = response.data.calendar.map(ev => {
                const startDate = new Date(ev.start);
                const endDate = ev.end ? new Date(ev.end) : new Date(startDate.getTime() + 60 * 60 * 1000);
                // For multi-day events in react-big-calendar month view, add 1 day to end so it shows the full range
                const calendarEnd = new Date(endDate);
                if (calendarEnd.toDateString() !== startDate.toDateString()) {
                    calendarEnd.setDate(calendarEnd.getDate() + 1);
                }
                return {
                    ...ev,
                    start: startDate,
                    end: calendarEnd,
                    rawStart: ev.start,
                    rawEnd: ev.end || ev.start,
                    appliedStudents: ev.appliedStudents || [],
                };
            });
            setEvents(formattedEvents);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch calendar:', err);
            setError('Could not load calendar data.');
            setLoading(false);
        }
    }, [authToken]);

    useEffect(() => {
        fetchCalendar();
    }, [fetchCalendar]);

    const handleSelectEvent = (event) => {
        const idx = events.findIndex(e => e.id === event.id || e.title === event.title);
        setSelectedEvent(event);
        setSelectedIndex(idx >= 0 ? idx : null);
    };

    const closeDrawer = () => {
        setSelectedEvent(null);
        setSelectedIndex(null);
    };

    const goPrevEvent = () => {
        if (selectedIndex === null || selectedIndex <= 0) return;
        const newIndex = selectedIndex - 1;
        setSelectedEvent(events[newIndex]);
        setSelectedIndex(newIndex);
    };

    const goNextEvent = () => {
        if (selectedIndex === null || selectedIndex >= events.length - 1) return;
        const newIndex = selectedIndex + 1;
        setSelectedEvent(events[newIndex]);
        setSelectedIndex(newIndex);
    };

    const handleApply = async (eventId) => {
        try {
            setApplyingId(eventId);
            const response = await api.patch(
                `/api/events/${eventId}/apply`,
                {},
                { headers: { Authorization: `Bearer ${authToken}` } }
            );

            if (response.status === 200) {
                // Optimistically update the local state
                setEvents(prev => prev.map(ev => {
                    if (ev.id === eventId) {
                        const updated = {
                            ...ev,
                            appliedStudents: [...(ev.appliedStudents || []), userEmail]
                        };
                        // Also update the selected event so the pane re-renders
                        setSelectedEvent(updated);
                        return updated;
                    }
                    return ev;
                }));
                setApplySuccess(prev => ({ ...prev, [eventId]: true }));
            }
        } catch (err) {
            console.error('Apply failed:', err);
            alert(err.response?.data?.message || 'Failed to record application. Please try again.');
        } finally {
            setApplyingId(null);
        }
    };

    const getEventIcon = (type) => {
        switch (type) {
            case 'internship': return <Briefcase className="w-5 h-5" />;
            case 'placement_drive': return <Briefcase className="w-5 h-5" />;
            case 'announcement': return <Megaphone className="w-5 h-5" />;
            case 'workshop': return <MonitorPlay className="w-5 h-5" />;
            default: return <CalendarIcon className="w-5 h-5" />;
        }
    };

    const eventPropGetter = (event) => {
        const color = getEventColor(event, userEmail);
        return {
            style: {
                backgroundColor: color,
                borderRadius: '6px',
                opacity: 0.9,
                color: 'white',
                border: '0px',
                display: 'block',
                fontWeight: '600',
                fontSize: '0.8rem',
                padding: '2px 6px',
            }
        };
    };

    // ─── Render ───────────────────────────────────────────────────
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
                        ? 'You must send a verification request from the "Verify Yourself" tab. Once verified by the TPC, you will be able to view and apply to events on the placement calendar.'
                        : 'Your student profile is currently being verified by the Training and Placement Cell. Access to the placement calendar and applications will be granted once verified.'}
                </p>
            </div>
        );
    }

    if (loading) return (
        <div className="flex items-center justify-center h-[70vh]">
            <div className="flex flex-col items-center gap-3 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="text-sm font-medium">Loading calendar...</span>
            </div>
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center h-[70vh]">
            <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-200 max-w-md text-center">
                <p className="font-semibold">{error}</p>
                <button onClick={fetchCalendar} className="mt-3 text-sm underline hover:text-red-900">Try Again</button>
            </div>
        </div>
    );

    const now = new Date();
    const isEventActionable = selectedEvent && selectedEvent.type !== 'announcement' && (() => {
        const endDate = new Date(selectedEvent.rawEnd);
        const startDate = new Date(selectedEvent.rawStart);
        return endDate >= now || (startDate <= now && now <= endDate);
    })();
    const hasApplied = selectedEvent?.appliedStudents?.includes(userEmail);

    return (
        <div className="h-[calc(100vh-110px)]">
            <div className="flex h-full w-full overflow-hidden bg-white rounded-xl relative border border-slate-200 shadow-sm">
                {/* ─── Calendar Grid ─── */}
                <motion.div
                    animate={{ width: selectedEvent ? '68%' : '100%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="calendar-color-lock student-calendar-surface flex flex-col h-full bg-white"
                    style={{ colorScheme: 'light' }}
                >
                    {/* ─── Legend row ─── */}
                    <div className="flex items-center gap-4 flex-wrap px-4 pt-3 pb-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Legend:</span>
                        {[
                            { color: COLORS.APPLIED, label: 'Applied' },
                            { color: COLORS.ACTIVE, label: 'Active' },
                            { color: COLORS.UPCOMING, label: 'Upcoming' },
                            { color: COLORS.PAST, label: 'Past' },
                            { color: COLORS.ANNOUNCEMENT, label: 'Announcement' },
                        ].map(item => (
                            <div key={item.label} className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                                <span className="text-xs text-slate-600 font-medium">{item.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* ─── Toolbar: buttons left, month centred ─── */}
                    <div className="relative flex items-center px-4 py-2 border-b border-slate-100">
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
                        <span className="absolute left-1/2 -translate-x-1/2 text-sm font-bold text-slate-700 pointer-events-none">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </span>
                    </div>
                    <style>{`
                        /* Force light-theme for every internal rbc element —
                           overrides the global color-scheme:dark cascade */
                        .student-calendar-surface,
                        .student-calendar-surface .rbc-calendar,
                        .student-calendar-surface .rbc-month-view,
                        .student-calendar-surface .rbc-month-row,
                        .student-calendar-surface .rbc-row-bg,
                        .student-calendar-surface .rbc-day-bg,
                        .student-calendar-surface .rbc-row-content,
                        .student-calendar-surface .rbc-month-header,
                        .student-calendar-surface .rbc-header {
                            background-color: #ffffff !important;
                            border-color: #e2e8f0 !important;
                        }
                        .student-calendar-surface .rbc-off-range-bg {
                            background-color: #f8fafc !important;
                        }
                        .student-calendar-surface .rbc-today {
                            background-color: #eff6ff !important;
                        }
                        .student-calendar-surface .rbc-toolbar button {
                            color: #374151 !important;
                            background-color: #ffffff !important;
                            border-color: #d1d5db !important;
                        }
                        .student-calendar-surface .rbc-toolbar button:hover,
                        .student-calendar-surface .rbc-toolbar button.rbc-active {
                            background-color: #f1f5f9 !important;
                            color: #1e293b !important;
                        }
                        .student-calendar-surface .rbc-toolbar .rbc-toolbar-label {
                            color: #1e293b;
                            font-weight: 700;
                        }
                        .student-calendar-surface .rbc-header {
                            color: #334155;
                            font-weight: 700;
                        }
                        .student-calendar-surface .rbc-date-cell .rbc-button-link,
                        .student-calendar-surface .rbc-date-cell button,
                        .student-calendar-surface .rbc-date-cell a {
                            color: #334155 !important;
                            font-weight: 600;
                            opacity: 1;
                        }
                        .student-calendar-surface .rbc-off-range .rbc-button-link,
                        .student-calendar-surface .rbc-off-range .rbc-date-cell button,
                        .student-calendar-surface .rbc-off-range .rbc-date-cell a {
                            color: #64748b !important;
                            opacity: 0.95;
                        }
                        .student-calendar-surface .rbc-show-more {
                            color: #3b82f6 !important;
                        }
                    `}</style>
                    <div className="flex-1 overflow-hidden">
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: '100%' }}
                            date={currentDate}
                            onNavigate={() => { }}
                            onSelectEvent={handleSelectEvent}
                            eventPropGetter={eventPropGetter}
                            views={['month']}
                            defaultView="month"
                            toolbar={false}
                            popup={true}
                        />
                    </div>
                </motion.div>

                {/* ─── Details Pane (32%) ─── */}
                <AnimatePresence>
                    {selectedEvent && (
                        <motion.div
                            initial={{ x: '100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="absolute right-0 top-0 w-[32%] h-full bg-white shadow-2xl border-l border-gray-200 overflow-y-auto dark:bg-slate-900 dark:border-slate-700"
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-white z-10 p-5 pb-3 border-b border-slate-100 dark:bg-slate-900 dark:border-slate-700">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-300">
                                        {getEventIcon(selectedEvent.type)}
                                        <span className="font-semibold uppercase text-xs tracking-wider">
                                            {selectedEvent.type.replace('_', ' ')}
                                        </span>
                                    </div>
                                    {/* Prev / Next / Close controls */}
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={goPrevEvent}
                                            disabled={selectedIndex === null || selectedIndex <= 0}
                                            title="Previous event"
                                            className="p-1.5 rounded-full transition-colors text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed dark:hover:bg-slate-800 dark:hover:text-slate-200"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                        </button>

                                        <button
                                            onClick={goNextEvent}
                                            disabled={selectedIndex === null || selectedIndex >= events.length - 1}
                                            title="Next event"
                                            className="p-1.5 rounded-full transition-colors text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed dark:hover:bg-slate-800 dark:hover:text-slate-200"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                                        </button>
                                        <button
                                            onClick={closeDrawer}
                                            className="ml-1 p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600 dark:hover:bg-slate-800 dark:text-slate-500 dark:hover:text-slate-300"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5 space-y-5">
                                {/* Title + Status Badge */}
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 leading-tight mb-2 dark:text-slate-100">
                                        {selectedEvent.title}
                                    </h2>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {(() => {
                                            const status = getStatusLabel(selectedEvent, userEmail);
                                            return (
                                                <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${status.bg}`}>
                                                    {status.text}
                                                </span>
                                            );
                                        })()}
                                        {selectedEvent.extendedProps?.isEdited && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800/60">
                                                Edited
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Dates */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                        <CalendarIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                        <div>
                                            <span className="font-medium">Start:</span>{' '}
                                            {format(new Date(selectedEvent.rawStart), 'PPP')}
                                        </div>
                                    </div>
                                    {selectedEvent.rawEnd && selectedEvent.rawEnd !== selectedEvent.rawStart && (
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                            <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                            <div>
                                                <span className="font-medium">End:</span>{' '}
                                                {format(new Date(selectedEvent.rawEnd), 'PPP')}
                                            </div>
                                        </div>
                                    )}
                                    {selectedEvent.extendedProps?.deadline && (
                                        <div className="mt-2 p-2.5 bg-red-50 text-red-700 rounded-lg text-xs border border-red-100 font-medium dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/60">
                                            ⏰ Deadline: {format(new Date(selectedEvent.extendedProps.deadline), 'PPP')}
                                        </div>
                                    )}
                                    {/* Author */}
                                    {selectedEvent.extendedProps?.createdBy && (
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 1 0-16 0" /></svg>
                                            <span>By <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedEvent.extendedProps.createdBy?.fullName || selectedEvent.extendedProps.createdBy?.email || 'Admin'}</span></span>
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 dark:text-slate-500">Description</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed dark:text-slate-300">
                                        {selectedEvent.extendedProps?.description || selectedEvent.extendedProps?.content || 'No description provided.'}
                                    </p>
                                </div>

                                {/* Target Branches */}
                                {selectedEvent.extendedProps?.targetBranches?.length > 0 && (
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 dark:text-slate-500">Target Branches</h3>
                                        <div className="flex flex-wrap gap-1.5">
                                            {selectedEvent.extendedProps.targetBranches.map((branch, i) => (
                                                <span key={i} className="bg-slate-100 text-slate-700 text-xs font-medium px-2 py-0.5 rounded-full border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
                                                    {branch}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Links */}
                                {selectedEvent.extendedProps?.links?.length > 0 && (
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 dark:text-slate-500">Links</h3>
                                        <div className="space-y-1.5">
                                            {selectedEvent.extendedProps.links.map((link, i) => (
                                                <a
                                                    key={i}
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                    {link.label || link.url}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ─── Apply CTA ─── */}
                                {selectedEvent.type !== 'announcement' && (
                                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
                                        {hasApplied || applySuccess[selectedEvent.id] ? (
                                            <div className="flex items-center gap-2 bg-green-50 text-green-700 p-3.5 rounded-xl border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/60">
                                                <CheckCircle2 className="w-5 h-5 text-green-500 dark:text-green-400" />
                                                <span className="font-semibold text-sm">Application Recorded</span>
                                            </div>
                                        ) : isEventActionable ? (
                                            <div className="space-y-3">
                                                <p className="text-sm text-slate-600 font-medium dark:text-slate-300">
                                                    Have you applied to this opportunity?
                                                </p>
                                                <button
                                                    onClick={() => handleApply(selectedEvent.id)}
                                                    disabled={applyingId === selectedEvent.id}
                                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                >
                                                    {applyingId === selectedEvent.id ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                            Recording...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle2 className="w-4 h-4" />
                                                            Yes, I Applied
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="bg-gray-50 text-gray-500 p-3.5 rounded-xl border border-gray-200 text-sm text-center dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                                                This event has ended.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default StudentCalendar;
