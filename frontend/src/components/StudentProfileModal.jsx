import React from 'react';
import {
    X, User, Mail, Hash, BookOpen, GraduationCap,
    Phone, Building2, Award, FileText, ExternalLink, Star
} from 'lucide-react';

const PROGRAM_COLORS = {
    'B.Tech': 'bg-blue-100 text-blue-800 border-blue-200',
    'M.Tech': 'bg-violet-100 text-violet-800 border-violet-200',
    'M.Sc': 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

const STATUS_COLORS = {
    verified: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    rejected: 'text-red-600 bg-red-50 border-red-200',
    unsubmitted: 'text-slate-500 bg-slate-50 border-slate-200',
};

export default function StudentProfileModal({ student, onClose }) {
    if (!student) return null;

    const cgpaColor = student.cgpa >= 8.5
        ? 'text-emerald-600'
        : student.cgpa >= 7.0
            ? 'text-blue-600'
            : 'text-slate-700';

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
        >
            {/* Modal card */}
            <div
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-[fade-in-up_0.25s_ease-out]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header banner */}
                <div className="h-24 bg-gradient-to-r from-blue-600 to-violet-600 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Avatar */}
                <div className="px-6 pb-6">
                    <div className="flex items-end gap-4 -mt-10 mb-4">
                        <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden text-blue-600 shrink-0">
                            {student.profilePicture ? (
                                <img src={student.profilePicture} alt={`${student.fullName || 'Student'} Profile`} className="w-full h-full object-cover" />
                            ) : (
                                <User size={36} strokeWidth={1.5} />
                            )}
                        </div>
                        <div className="pb-1">
                            <h2 className="text-xl font-bold text-slate-900 leading-tight">
                                {student.fullName || student.name || '—'}
                            </h2>
                            <div className="flex items-center gap-2 flex-wrap mt-1">
                                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${PROGRAM_COLORS[student.program] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                    {student.program}
                                </span>
                                <span className="text-xs text-slate-500 font-medium">
                                    {student.department || student.branch || ''}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* CGPA highlight */}
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 mb-5">
                        <Star size={20} className="text-yellow-400 fill-yellow-400 shrink-0" />
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-0.5">CGPA</p>
                            <p className={`text-2xl font-extrabold ${cgpaColor}`}>
                                {student.cgpa != null ? Number(student.cgpa).toFixed(2) : 'N/A'}
                                <span className="text-sm font-semibold text-slate-400 ml-1">/ 10</span>
                            </p>
                        </div>
                    </div>

                    {/* Detail grid */}
                    <div className="space-y-3 mb-5">
                        <InfoRow icon={<Mail size={15} />} label="Email" value={student.email} />
                        <InfoRow icon={<Hash size={15} />} label="Roll Number" value={student.rollNumber} mono />
                        <InfoRow icon={<GraduationCap size={15} />} label="Grad. Year" value={student.graduationYear} />
                        <InfoRow icon={<Building2 size={15} />} label="Institute" value={student.institute || 'IIT Patna'} />
                        {student.phoneNumber && (
                            <InfoRow icon={<Phone size={15} />} label="Phone" value={student.phoneNumber} />
                        )}
                        {student.verificationStatus && (
                            <div className="flex items-center gap-3">
                                <span className="text-slate-400 shrink-0"><Award size={15} /></span>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 w-28 shrink-0">Status</span>
                                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border capitalize ${STATUS_COLORS[student.verificationStatus] || ''}`}>
                                    {student.verificationStatus}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Resume button */}
                    {student.resumeLink ? (
                        <a
                            href={student.resumeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition shadow shadow-blue-500/25"
                        >
                            <FileText size={17} />
                            View Resume
                            <ExternalLink size={14} className="opacity-70" />
                        </a>
                    ) : (
                        <div className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-400 font-semibold py-2.5 rounded-xl border border-slate-200 cursor-not-allowed select-none">
                            <FileText size={17} />
                            No Resume Uploaded
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function InfoRow({ icon, label, value, mono = false }) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-slate-400 shrink-0">{icon}</span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 w-28 shrink-0">{label}</span>
            <span className={`text-sm text-slate-800 font-medium truncate ${mono ? 'font-mono tracking-wide' : ''}`}>
                {value || '—'}
            </span>
        </div>
    );
}
