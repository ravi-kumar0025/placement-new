import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import {
    Search,
    Filter,
    AlertTriangle,
    Download,
    ChevronRight,
    GraduationCap,
    Calendar as CalendarIcon,
    Tag,
    ArrowLeft,
    User,
    Mail,
    Hash,
    Phone,
    Building2,
    FileText,
    ExternalLink,
    Star,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BRANCH_OPTIONS = ['CSE', 'EE', 'ME', 'CE', 'CBE'];
const PROGRAM_OPTIONS = ['B.Tech', 'M.Tech', 'M.Sc'];

const EVENT_TYPE_STYLES = {
    internship: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
    placement_drive: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-900',
    workshop: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900',
};

const PROGRAM_STYLES = {
    'B.Tech': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-800',
    'M.Tech': 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/40 dark:text-violet-200 dark:border-violet-800',
    'M.Sc': 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800',
};

const STATUS_STYLES = {
    verified: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-900',
    pending: 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-300 dark:bg-yellow-950/30 dark:border-yellow-900',
    rejected: 'text-red-600 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950/30 dark:border-red-900',
    unsubmitted: 'text-slate-500 bg-slate-50 border-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700',
};

const TABLE_HEADERS = ['Candidate', 'Roll No', 'Program / Branch', 'CGPA', 'Action'];

const formatEventType = (type) => (type || 'event').replaceAll('_', ' ');

function InfoRow({ icon, label, value, mono = false }) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-slate-400 dark:text-slate-500 shrink-0">{icon}</span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-28 shrink-0">{label}</span>
            <span className={`text-sm text-slate-800 dark:text-slate-200 font-medium truncate ${mono ? 'font-mono tracking-wide' : ''}`}>
                {value || '-'}
            </span>
        </div>
    );
}

function StudentProfile({ student, onBack }) {
    const cgpaValue = student.cgpa != null ? Number(student.cgpa).toFixed(2) : 'N/A';
    const cgpaColor = student.cgpa >= 8.5 ? 'text-emerald-600 dark:text-emerald-300' : student.cgpa >= 7 ? 'text-blue-600 dark:text-blue-300' : 'text-slate-700 dark:text-slate-200';
    const statusStyle = STATUS_STYLES[student.verificationStatus] || STATUS_STYLES.unsubmitted;

    return (
        <div className="space-y-6 animate-[fade-in-up_0.3s_ease-out]">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-blue-600 dark:text-blue-300 font-semibold hover:text-blue-800 dark:hover:text-blue-200 transition-colors bg-blue-50 dark:bg-blue-950/30 px-4 py-2 rounded-xl border border-blue-100 dark:border-blue-900"
            >
                <ArrowLeft size={18} /> Back to Applicants List
            </button>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="px-8 pb-8 pt-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                        <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-900 border-4 border-white dark:border-slate-900 shadow-lg flex items-center justify-center overflow-hidden text-blue-600 dark:text-blue-300 shrink-0">
                            {student.profilePicture ? (
                                <img src={student.profilePicture} alt={`${student.fullName || 'Student'} Profile`} className="w-full h-full object-cover" />
                            ) : (
                                <User size={44} strokeWidth={1.5} />
                            )}
                        </div>
                        <div className="pb-1">
                            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
                                {student.fullName || student.name || '-'}
                            </h2>
                            <div className="flex items-center gap-2 flex-wrap mt-1">
                                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${PROGRAM_STYLES[student.program] || 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'}`}>
                                    {student.program || 'N/A'}
                                </span>
                                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                    {student.department || student.branch || ''}
                                </span>
                                {student.institute && (
                                    <span className="text-sm text-slate-400 dark:text-slate-500">- {student.institute}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 flex flex-col gap-4">
                            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-4">
                                <Star size={22} className="text-yellow-400 fill-yellow-400 shrink-0" />
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">CGPA</p>
                                    <p className={`text-3xl font-extrabold ${cgpaColor}`}>
                                        {cgpaValue}
                                        <span className="text-sm font-semibold text-slate-400 dark:text-slate-500 ml-1">/ 10</span>
                                    </p>
                                </div>
                            </div>

                            {student.verificationStatus && (
                                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-4">
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Verification</p>
                                    <span className={`text-sm font-bold px-3 py-1 rounded-full border capitalize ${statusStyle}`}>
                                        {student.verificationStatus}
                                    </span>
                                </div>
                            )}

                            {student.resumeLink ? (
                                <a
                                    href={student.resumeLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition shadow shadow-blue-500/25"
                                >
                                    <FileText size={18} />
                                    View Resume
                                    <ExternalLink size={14} className="opacity-70" />
                                </a>
                            ) : (
                                <div className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-semibold py-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-not-allowed select-none">
                                    <FileText size={18} />
                                    No Resume Uploaded
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-5 space-y-4">
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-3">
                                Personal Information
                            </h3>
                            <InfoRow icon={<Mail size={16} />} label="Email" value={student.email} />
                            <InfoRow icon={<Hash size={16} />} label="Roll Number" value={student.rollNumber} mono />
                            <InfoRow icon={<GraduationCap size={16} />} label="Program" value={student.program} />
                            <InfoRow icon={<Building2 size={16} />} label="Department" value={student.department || student.branch} />
                            <InfoRow icon={<CalendarIcon size={16} />} label="Grad. Year" value={student.graduationYear} />
                            <InfoRow icon={<Building2 size={16} />} label="Institute" value={student.institute || 'IIT Patna'} />
                            {student.phoneNumber && <InfoRow icon={<Phone size={16} />} label="Phone" value={student.phoneNumber} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CompanyDashboard() {
    const { user, token } = useAuth();

    const [students, setStudents] = useState([]);
    const [companyEvents, setCompanyEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [eventsLoading, setEventsLoading] = useState(true);

    const [cgpa, setCgpa] = useState('');
    const [branch, setBranch] = useState([]);
    const [program, setProgram] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);

    const fetchCompanyEvents = useCallback(async () => {
        setEventsLoading(true);
        try {
            const { data } = await api.get('/api/company/events', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCompanyEvents(data.events || []);
        } catch (err) {
            console.error('Failed to fetch company events', err);
        } finally {
            setEventsLoading(false);
        }
    }, [token]);

    const fetchStudents = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/api/company/students', {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    cgpa: cgpa || undefined,
                    branch: branch.length ? branch.join(',') : undefined,
                    program: program.length ? program.join(',') : undefined,
                    eventId: selectedEventId || undefined,
                },
            });
            setStudents(data.students || []);
        } catch (err) {
            console.error('Failed to fetch students', err);
        } finally {
            setLoading(false);
        }
    }, [token, cgpa, branch, program, selectedEventId]);

    useEffect(() => {
        if (user?.verificationStatus === 'verified') {
            fetchCompanyEvents();
        }
    }, [user?.verificationStatus, fetchCompanyEvents]);

    useEffect(() => {
        if (user?.verificationStatus === 'verified') {
            fetchStudents();
        }
    }, [user?.verificationStatus, fetchStudents]);

    const selectedEvent = useMemo(
        () => companyEvents.find((e) => e._id === selectedEventId),
        [companyEvents, selectedEventId]
    );

    const toggleFilter = (setter, state, value) => {
        setter(state.includes(value) ? state.filter((item) => item !== value) : [...state, value]);
    };

    const clearAll = () => {
        setCgpa('');
        setBranch([]);
        setProgram([]);
        setSelectedEventId('');
    };

    const hasFilters = Boolean(cgpa || branch.length || program.length || selectedEventId);

    const exportToPDF = () => {
        if (students.length === 0) return;

        const doc = new jsPDF();

        // Header Setup
        doc.setFillColor(30, 58, 138); // blue-900 baseline
        doc.rect(0, 0, doc.internal.pageSize.width, 35, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('IIT Patna TPC - Applicants Database', 14, 22);

        // Title context based on filter
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        let contextText = 'All Applicants';
        if (selectedEventId) {
            const ev = companyEvents.find(e => e._id === selectedEventId);
            if (ev) contextText = `Event: ${ev.title} (${ev.type.replace('_', ' ')})`;
        }

        const timestamp = new Date().toLocaleString();
        doc.text(contextText, 14, 45);
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${timestamp} | Total: ${students.length}`, 14, 52);

        // Map data to AutoTable Format
        const tableColumn = ["Roll No", "Name", "Email", "Program / Branch", "CGPA"];
        const tableRows = students.map(student => [
            student.rollNumber || '—',
            student.fullName || student.name || '—',
            student.email,
            `${student.program} - ${student.department || student.branch || ''}`,
            student.cgpa != null ? Number(student.cgpa).toFixed(2) : 'N/A'
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 58,
            theme: 'striped',
            headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
            bodyStyles: { textColor: 50 },
            alternateRowStyles: { fillColor: [248, 250, 252] },
        });

        doc.save(`Applicants_List_${new Date().getTime()}.pdf`);
    };

    if (user?.verificationStatus === 'pending' || user?.verificationStatus === 'unsubmitted') {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center max-w-md mx-auto animate-[fade-in-up_0.5s_ease-out]">
                <div className="w-20 h-20 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-yellow-100 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900">
                    <AlertTriangle size={36} strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Account Under Review</h2>
                <p className="text-slate-500 dark:text-slate-300 mb-8 leading-relaxed">
                    Your company profile is currently being verified by the IIT Patna TPC Administration.
                    Access to applicant data will be granted once verified (usually within 48 hours).
                </p>
                <button className="text-blue-600 dark:text-blue-300 font-semibold hover:text-blue-800 dark:hover:text-blue-200 flex items-center gap-1 transition-colors bg-blue-50 dark:bg-blue-950/30 px-4 py-2 rounded-lg border border-blue-100 dark:border-blue-900">
                    Contact Support <ChevronRight size={16} />
                </button>
            </div>
        );
    }

    if (selectedStudent) {
        return <StudentProfile student={selectedStudent} onBack={() => setSelectedStudent(null)} />;
    }

    return (
        <div className="space-y-6 animate-[fade-in-up_0.5s_ease-out]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-700">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <GraduationCap className="text-blue-600 dark:text-blue-300" size={28} />
                        Applicants Database
                    </h1>
                    <p className="text-slate-500 dark:text-slate-300 text-sm mt-1">
                        Review candidates who applied to your events -
                        <span className="font-semibold text-slate-700 dark:text-slate-100"> {students.length} found</span>
                    </p>
                </div>
                <button
                    onClick={exportToPDF}
                    disabled={students.length === 0 || loading || eventsLoading}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${students.length === 0 || loading || eventsLoading
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20'
                        }`}
                >
                    <Download size={18} /> Export List
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-700 h-fit lg:sticky lg:top-24">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-4">
                        <Filter size={20} className="text-blue-500 dark:text-blue-300" /> Advanced Filters
                    </h3>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                                <CalendarIcon size={13} /> Event
                            </label>
                            {eventsLoading ? (
                                <div className="h-9 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                            ) : companyEvents.length === 0 ? (
                                <p className="text-xs text-slate-400 dark:text-slate-500 italic bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                                    No events posted yet.
                                </p>
                            ) : (
                                <select
                                    value={selectedEventId}
                                    onChange={(e) => setSelectedEventId(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                                >
                                    <option value="">All my events (combined)</option>
                                    {companyEvents.map((event) => (
                                        <option key={event._id} value={event._id}>
                                            {event.title} - {formatEventType(event.type)}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {selectedEvent && (
                                <div className={`mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${EVENT_TYPE_STYLES[selectedEvent.type] || 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'}`}>
                                    <Tag size={11} /> {selectedEvent.title}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-3 uppercase tracking-wider">
                                Min CGPA: <span className="text-blue-600 dark:text-blue-300">{cgpa || 'Any'}</span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="10"
                                step="0.5"
                                value={cgpa}
                                onChange={(e) => setCgpa(e.target.value)}
                                className="w-full accent-blue-600 bg-slate-200 rounded-lg appearance-none cursor-pointer h-2"
                            />
                            <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                                <span>0</span><span>5</span><span>10</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-3 uppercase tracking-wider">Program</label>
                            <div className="space-y-2">
                                {PROGRAM_OPTIONS.map((value) => (
                                    <label key={value} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                            checked={program.includes(value)}
                                            onChange={() => toggleFilter(setProgram, program, value)}
                                        />
                                        <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 font-medium">{value}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-3 uppercase tracking-wider">Branch</label>
                            <div className="space-y-2">
                                {BRANCH_OPTIONS.map((value) => (
                                    <label key={value} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                            checked={branch.includes(value)}
                                            onChange={() => toggleFilter(setBranch, branch, value)}
                                        />
                                        <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 font-medium">{value}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {hasFilters && (
                            <button
                                onClick={clearAll}
                                className="w-full py-2 text-sm text-red-600 dark:text-red-300 font-semibold bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 rounded-xl border border-red-100 dark:border-red-900 transition-colors"
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-700 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400 dark:text-slate-500 animate-pulse font-medium">
                            Loading applicants...
                        </div>
                    ) : students.length === 0 ? (
                        <div className="p-16 text-center text-slate-500 dark:text-slate-300 flex flex-col items-center gap-3">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center border border-slate-100 dark:border-slate-700">
                                <Search size={28} className="text-slate-300 dark:text-slate-500" />
                            </div>
                            <p className="text-lg font-semibold text-slate-700 dark:text-slate-100">
                                {selectedEventId ? 'No applicants found for this event.' : 'No applicants yet across your events.'}
                            </p>
                            <p className="text-sm text-slate-400 dark:text-slate-500">
                                Students appear here once they apply to your posted events.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                <thead className="bg-slate-50/80 dark:bg-slate-800/70">
                                    <tr>
                                        {TABLE_HEADERS.map((header) => (
                                            <th key={header} scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-900/90 divide-y divide-slate-100 dark:divide-slate-800">
                                    {students.map((student) => (
                                        <tr key={student._id} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/70 transition-colors group cursor-pointer">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                                                    {student.fullName || student.name || '-'}
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">{student.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 font-mono tracking-wide">
                                                {student.rollNumber || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full mr-2 border ${PROGRAM_STYLES[student.program] || 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'}`}>
                                                    {student.program || 'N/A'}
                                                </span>
                                                <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                                                    {student.department || student.branch || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`text-sm font-bold ${student.cgpa >= 8.5 ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-200'}`}>
                                                    {student.cgpa != null ? Number(student.cgpa).toFixed(2) : 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-300 font-bold">
                                                <button
                                                    onClick={() => setSelectedStudent(student)}
                                                    className="hover:text-blue-900 dark:hover:text-blue-200 hover:underline transition-colors"
                                                >
                                                    View Profile
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
