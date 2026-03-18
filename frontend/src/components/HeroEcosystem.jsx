import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Shield, Clock, PieChart, Settings, GraduationCap, Cloud, FileText, Key, BarChart3 } from 'lucide-react';

export default function HeroEcosystem({ user }) {
    return (
        <section className="relative pt-32 pb-20 overflow-hidden bg-[#F9FAFB] dark:bg-slate-950 font-sans border-b border-gray-200 dark:border-slate-800 transition-colors duration-300">
            {/* Background glow effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="text-center max-w-4xl mx-auto mb-16 animate-[fade-in-up_1s_ease-out]">
                    <div className="text-xs font-bold tracking-[0.2em] text-gray-500 dark:text-slate-500 uppercase mb-6 flex items-center justify-center gap-4">
                        <span className="w-8 h-px bg-gray-300 dark:bg-slate-700"></span>
                        ENTERPRISE RECRUITMENT MANAGEMENT SYSTEM
                        <span className="w-8 h-px bg-gray-300 dark:bg-slate-700"></span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-extrabold text-[#111827] dark:text-[#F8FAFC] leading-[1.15] mb-6 tracking-tight font-serif">
                        Unify and Simplify Campus Placements with Centralized Workflows
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                        Our platform seamlessly connects students, recruiters, and TPC staff, automating recruitment
                        workflows and delivering personalized placement experiences through a central, secure hub.
                    </p>
                </div>

                {/* Ecosystem Visualization */}
                <div className="relative flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-8 mb-20 mt-12 animate-[fade-in-up_1.2s_ease-out_both] animation-delay-200">

                    {/* SVG Connecting Lines (Visible only on LG+) */}
                    <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[200px] hidden lg:block pointer-events-none z-0" viewBox="0 0 800 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Left to Center paths */}
                        <path d="M 150 100 C 250 100 250 60 350 60" stroke="url(#gradientLeft)" strokeWidth="4" strokeLinecap="round" className="dark:opacity-80 drop-shadow-md" />
                        <path d="M 150 100 C 250 100 250 140 350 140" stroke="url(#gradientLeft)" strokeWidth="4" strokeLinecap="round" className="dark:opacity-80 drop-shadow-md" />
                        {/* Right to Center paths */}
                        <path d="M 650 100 C 550 100 550 60 450 60" stroke="url(#gradientRight)" strokeWidth="4" strokeLinecap="round" className="dark:opacity-80 drop-shadow-md" />
                        <path d="M 650 100 C 550 100 550 140 450 140" stroke="url(#gradientRight)" strokeWidth="4" strokeLinecap="round" className="dark:opacity-80 drop-shadow-md" />
                        <defs>
                            <linearGradient id="gradientLeft" x1="150" y1="100" x2="350" y2="100" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#3b82f6" stopOpacity="0.8" />
                                <stop offset="1" stopColor="#06b6d4" stopOpacity="0" />
                            </linearGradient>
                            <linearGradient id="gradientRight" x1="650" y1="100" x2="450" y2="100" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#10b981" stopOpacity="0.8" />
                                <stop offset="1" stopColor="#06b6d4" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Left Column: UI Card */}
                    <div className="w-full max-w-[340px] lg:w-[320px] bg-white dark:bg-[#151B2B] rounded-2xl shadow-xl dark:shadow-2xl border border-gray-200 dark:border-slate-800 p-5 z-10 relative">
                        <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-3 mb-5">
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                Verify Applicants <GraduationCap size={16} className="text-gray-500" />
                            </h3>
                            <span className="text-xs text-gray-400 dark:text-gray-500">Progress</span>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-[13px] mb-1.5">
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">Verify 5000+ Student Profiles</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-emerald-500 h-1.5 rounded-full w-[60%] shadow-[0_0_10px_rgba(16,185,129,0.5)] dark:shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                                </div>
                                <div className="text-right text-[11px] text-gray-500 dark:text-gray-400 font-semibold mt-1.5">60%</div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[13px] mb-1.5">
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">Approve 185+ Company Docs</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-blue-500 h-1.5 rounded-full w-[60%] shadow-[0_0_10px_rgba(59,130,246,0.5)] dark:shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                                </div>
                                <div className="text-right text-[11px] text-gray-500 dark:text-gray-400 font-semibold mt-1.5">60%</div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[13px] mb-1.5">
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">Approve 3 Admin Tiers</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-orange-500 h-1.5 rounded-full w-[70%] shadow-[0_0_10px_rgba(249,115,22,0.5)] dark:shadow-[0_0_8px_rgba(249,115,22,0.8)]"></div>
                                </div>
                                <div className="text-right text-[11px] text-gray-500 dark:text-gray-400 font-semibold mt-1.5">70%</div>
                            </div>
                        </div>
                    </div>

                    {/* Center Column: Hub */}
                    <div className="relative w-full max-w-[340px] lg:w-[320px] h-[340px] lg:h-[320px] flex items-center justify-center z-10 shrink-0 mx-auto">

                        {/* Custom Animation Styles */}
                        <style>{`
                            @keyframes float-slow {
                                0%, 100% { transform: translateY(0px); }
                                50% { transform: translateY(-8px); }
                            }
                            @keyframes float-slow-delayed {
                                0%, 100% { transform: translateY(0px); }
                                50% { transform: translateY(8px); }
                            }
                            .animate-float-slow {
                                animation: float-slow 4s ease-in-out infinite;
                            }
                            .animate-float-delayed {
                                animation: float-slow-delayed 5s ease-in-out infinite;
                            }
                        `}</style>

                        {/* Glowing Connectors */}
                        <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none stroke-blue-500/30 dark:stroke-blue-400/30 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" overflow="visible">
                            {/* Top Left -> Center */}
                            <line x1="15%" y1="15%" x2="50%" y2="50%" strokeWidth="1.5" strokeDasharray="4 4" className="animate-[pulse_3s_ease-in-out_infinite]" />
                            {/* Top Right -> Center */}
                            <line x1="85%" y1="15%" x2="50%" y2="50%" strokeWidth="1.5" strokeDasharray="4 4" className="animate-[pulse_4s_ease-in-out_infinite]" />
                            {/* Bottom Left -> Center */}
                            <line x1="15%" y1="85%" x2="50%" y2="50%" strokeWidth="1.5" strokeDasharray="4 4" className="animate-[pulse_5s_ease-in-out_infinite]" />
                            {/* Bottom Right -> Center */}
                            <line x1="85%" y1="85%" x2="50%" y2="50%" strokeWidth="1.5" strokeDasharray="4 4" className="animate-[pulse_2s_ease-in-out_infinite]" />
                        </svg>

                        {/* External Ambient Glows for Dark mode behind hub */}
                        <div className="hidden dark:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-600/20 blur-[60px] rounded-full z-0"></div>

                        {/* Main Hub Glowing Hexagon-ish (rotated square) */}
                        <div className="absolute z-20 m-auto w-[130px] h-[130px] bg-gradient-to-br from-blue-600 to-cyan-400 dark:from-slate-700 dark:to-slate-800 rounded-3xl rotate-45 flex items-center justify-center shadow-[0_0_80px_rgba(59,130,246,0.6)] dark:shadow-[0_0_80px_rgba(59,130,246,0.25)] overflow-hidden border-2 border-white/20 dark:border-slate-600/50 backdrop-blur-sm transition-transform hover:scale-105 duration-500">
                            {/* Dark theme explicit orange/blue glow overlay within hub */}
                            <div className="absolute inset-0 bg-blue-500/10 dark:bg-cyan-500/20 mix-blend-overlay"></div>
                            {/* Glass reflection overlay */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-white/5 -translate-x-1/2 -rotate-45"></div>

                            <div className="-rotate-45 flex flex-col items-center">
                                <div className="w-12 h-10 flex items-center justify-center mb-1 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
                                    <GraduationCap className="text-white w-9 h-9" strokeWidth={1.5} />
                                </div>
                                <span className="text-white font-bold text-[12px] text-center leading-tight tracking-wide drop-shadow-md">Placement<br />Hub</span>
                            </div>

                            {/* Inner glow border imitation */}
                            <div className="absolute inset-1 rounded-[20px] border border-white/30 dark:border-blue-400/50 pointer-events-none"></div>
                        </div>

                        {/* Floating Nodes */}
                        {/* Node 1: Top Left */}
                        <div className="absolute top-0 left-0 -translate-x-2 -translate-y-2 lg:-translate-x-6 lg:-translate-y-6 bg-white/95 dark:bg-[#1A2235]/95 backdrop-blur-sm p-3 rounded-2xl shadow-[0_10px_30px_rgba(59,130,246,0.15)] dark:shadow-[0_0_25px_rgba(59,130,246,0.15)] border border-blue-100/50 dark:border-blue-900/50 flex flex-col items-center justify-center gap-1.5 w-[94px] h-[94px] z-30 animate-float-slow group cursor-default">
                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/60 shadow-inner">
                                <GraduationCap size={20} />
                            </div>
                            <span className="text-[10px] font-bold text-gray-700 dark:text-gray-200 text-center uppercase tracking-wider">Profile Verif.</span>
                        </div>

                        {/* Node 2: Top Right */}
                        <div className="absolute top-0 right-0 translate-x-2 -translate-y-2 lg:translate-x-6 lg:-translate-y-6 bg-white/95 dark:bg-[#1A2235]/95 backdrop-blur-sm p-3 rounded-2xl shadow-[0_10px_30px_rgba(20,184,166,0.15)] dark:shadow-[0_0_25px_rgba(20,184,166,0.15)] border border-teal-100/50 dark:border-teal-900/50 flex flex-col items-center justify-center gap-1.5 w-[94px] h-[94px] z-30 animate-float-delayed group cursor-default">
                            <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-900/40 flex items-center justify-center text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-800/60 shadow-inner">
                                <PieChart size={20} />
                            </div>
                            <span className="text-[10px] font-bold text-gray-700 dark:text-gray-200 text-center uppercase tracking-wider">Dashboards</span>
                        </div>

                        {/* Node 3: Bottom Left */}
                        <div className="absolute bottom-0 left-0 -translate-x-2 translate-y-2 lg:-translate-x-6 lg:translate-y-6 bg-white/95 dark:bg-[#1A2235]/95 backdrop-blur-sm p-3 rounded-2xl shadow-[0_10px_30px_rgba(249,115,22,0.15)] dark:shadow-[0_0_25px_rgba(249,115,22,0.15)] border border-orange-100/50 dark:border-orange-900/50 flex flex-col items-center justify-center gap-1.5 w-[94px] h-[94px] z-30 animate-float-delayed group cursor-default">
                            <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/40 flex items-center justify-center text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-800/60 shadow-inner">
                                <Settings size={20} />
                            </div>
                            <span className="text-[10px] font-bold text-gray-700 dark:text-gray-200 text-center uppercase tracking-wider">Admin Sync</span>
                        </div>

                        {/* Node 4: Bottom Right */}
                        <div className="absolute bottom-0 right-0 translate-x-2 translate-y-2 lg:translate-x-6 lg:translate-y-6 bg-white/95 dark:bg-[#1A2235]/95 backdrop-blur-sm p-3 rounded-2xl shadow-[0_10px_30px_rgba(34,197,94,0.15)] dark:shadow-[0_0_25px_rgba(34,197,94,0.15)] border border-green-100/50 dark:border-green-900/50 flex flex-col items-center justify-center gap-1.5 w-[94px] h-[94px] z-30 animate-float-slow group cursor-default">
                            <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/40 flex items-center justify-center text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800/60 shadow-inner">
                                <Clock size={20} />
                            </div>
                            <span className="text-[10px] font-bold text-gray-700 dark:text-gray-200 text-center uppercase tracking-wider">Event Sync</span>
                        </div>
                    </div>

                    {/* Right Column: Calendar Card */}
                    <div className="relative w-full max-w-[340px] lg:w-[320px] bg-white dark:bg-[#151B2B] rounded-2xl shadow-xl dark:shadow-2xl border border-gray-200 dark:border-slate-800 p-5 z-10 mt-8 lg:mt-0 pb-12 lg:pb-5">
                        <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-3 mb-5">
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                Multi-day Visual Calendar <Clock size={16} className="text-gray-500" />
                            </h3>
                        </div>

                        {/* Fake Calendar UI */}
                        <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg border border-gray-200 dark:border-slate-700/60 overflow-hidden text-[11px] text-gray-500 dark:text-gray-400 mb-6 lg:mb-8 font-medium">
                            <div className="flex justify-between px-3 py-2 border-b border-gray-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/80 text-gray-700 dark:text-gray-300">
                                <span>May 10</span>
                                <span className="bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs">Today</span>
                            </div>
                            <div className="flex text-center border-b border-gray-200 dark:border-slate-700/60 bg-white/50 dark:bg-slate-800/30 text-[10px]">
                                <div className="flex-1 py-1.5 opacity-60">Su</div>
                                <div className="flex-1 py-1.5 opacity-60">Mo</div>
                                <div className="flex-1 py-1.5 opacity-60">Tu</div>
                                <div className="flex-1 py-1.5 opacity-60">We</div>
                                <div className="flex-1 py-1.5 text-blue-600 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-900/20">Th</div>
                                <div className="flex-1 py-1.5 opacity-60">Fr</div>
                                <div className="flex-1 py-1.5 opacity-60">Sa</div>
                            </div>
                            <div className="flex flex-col bg-white dark:bg-slate-800/50">
                                <div className="flex relative h-8 border-b border-gray-100 dark:border-slate-700/40">
                                    <div className="absolute left-[14%] top-1 bottom-1 w-[57%] bg-green-100 dark:bg-green-900/30 border-l-[3px] border-green-500 rounded-r text-[10px] px-2 text-green-700 dark:text-green-300 flex items-center font-medium shadow-sm truncate backdrop-blur-sm">Day 1: JO Uploads (Company Y)</div>
                                </div>
                                <div className="flex relative h-8">
                                    <div className="absolute left-[14%] top-1 bottom-1 w-[80%] bg-blue-100 dark:bg-blue-900/30 border-l-[3px] border-blue-500 rounded-r text-[10px] px-2 text-blue-700 dark:text-blue-300 flex items-center font-medium shadow-sm truncate backdrop-blur-sm">Day 2: TPC Announcements Sync</div>
                                </div>
                            </div>
                        </div>

                        {/* Overlapping Tech Stack Card */}
                        <div className="absolute -bottom-16 lg:-bottom-20 -right-2 lg:-right-8 w-[280px] bg-white/95 dark:bg-[#1A2235]/95 backdrop-blur-xl rounded-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] border border-gray-200/60 dark:border-slate-700/60 p-4 z-20">
                            <h4 className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-3 tracking-wide uppercase">Portal Platform</h4>
                            <div className="flex items-center justify-between px-1">
                                <div className="flex flex-col items-center gap-1.5 group cursor-default">
                                    <div className="w-11 h-11 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl flex items-center justify-center text-blue-500 group-hover:-translate-y-1 transition-transform shadow-sm">
                                        <Cloud size={20} className="dark:text-blue-400" />
                                    </div>
                                    <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400">Cloudinary</span>
                                </div>
                                <div className="flex flex-col items-center gap-1.5 group cursor-default">
                                    <div className="w-11 h-11 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl flex items-center justify-center text-red-500 group-hover:-translate-y-1 transition-transform shadow-sm">
                                        <div className="font-bold text-lg font-mono">JS</div>
                                    </div>
                                    <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400">jsPDF</span>
                                </div>
                                <div className="flex flex-col items-center gap-1.5 group cursor-default">
                                    <div className="w-11 h-11 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl flex items-center justify-center text-purple-600 group-hover:-translate-y-1 transition-transform shadow-sm">
                                        <Key size={18} className="dark:text-purple-400" />
                                    </div>
                                    <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400">JWT</span>
                                </div>
                                <div className="flex flex-col items-center gap-1.5 group cursor-default">
                                    <div className="w-11 h-11 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl flex items-center justify-center text-emerald-500 group-hover:-translate-y-1 transition-transform shadow-sm">
                                        <BarChart3 size={20} className="dark:text-emerald-400" />
                                    </div>
                                    <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400">Recharts</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-20 lg:mt-24 mb-12 text-center relative z-20">
                    {user ? (
                        <Link to={`/dashboard/${user.role}`} className="w-full sm:w-auto min-w-[240px] bg-[#2563EB] hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold text-[17px] shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                            Go to Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link to="/login" className="w-full sm:w-auto min-w-[240px] bg-[#2563EB] hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold text-[17px] shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-slate-950">
                                Login as Recruiter
                            </Link>
                            <Link to="/login" className="w-full sm:w-auto min-w-[240px] bg-[#111827] hover:bg-black dark:bg-[#0891B2] dark:hover:bg-cyan-500 text-white px-8 py-4 rounded-full font-semibold text-[17px] shadow-lg dark:shadow-cyan-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group">
                                Login as Student
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">
                                    <path d="M1 13L13 1M13 1H4M13 1V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </Link>
                        </>
                    )}
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-[13px] sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mt-2 pb-8">
                    <div className="flex items-center gap-2">
                        <Check size={16} className="text-[#3b82f6]" strokeWidth={3} />
                        <span>Role-Based Security (RBAC)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Check size={16} className="text-[#3b82f6]" strokeWidth={3} />
                        <span>Automated Workflows</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Check size={16} className="text-[#3b82f6]" strokeWidth={3} />
                        <span>Interactive Dashboards</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Check size={16} className="text-[#3b82f6]" strokeWidth={3} />
                        <span>Sub-Millisecond Speed</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
