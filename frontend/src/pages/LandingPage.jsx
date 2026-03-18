import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, MapPin, Mail, Phone, ExternalLink, LayoutDashboard, Home, Briefcase, Code, BarChart2, Menu, X } from 'lucide-react';
import HomePageCharts from '../components/HomePageCharts';
import logo from '../assets/logo.png';
import DevelopersRibbon from '../components/DevelopersRibbon';
import ThemeToggle from '../components/ThemeToggle';
import HeroEcosystem from '../components/HeroEcosystem';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, token, logout } = useAuth();
    return (
        <div className="min-h-screen flex flex-col font-sans bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100 transition-all duration-300 dark:bg-slate-950/85 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-14 items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-lg p-1 flex items-center justify-center shadow-sm ring-1 ring-blue-100 dark:bg-slate-900 dark:ring-slate-700">
                                <img src={logo} alt="IIT Patna logo" className="w-full h-full object-contain" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-lg font-bold text-gray-900 tracking-tight dark:text-slate-100 hidden lg:block whitespace-nowrap">Training & Placement</span>
                                <span className="text-lg font-bold text-gray-900 tracking-tight dark:text-slate-100 lg:hidden">TPC</span>
                                <span className="text-xs font-medium text-blue-600">IIT Patna</span>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
                            <a href="#" className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 font-medium transition-colors dark:text-slate-300 group" title="Home">
                                <Home className="w-5 h-5 lg:hidden" />
                                <span className="hidden lg:block">Home</span>
                            </a>
                            <Link to="/past-recruiters" className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 font-medium transition-colors dark:text-slate-300 group" title="Past Recruiters">
                                <Briefcase className="w-5 h-5 lg:hidden" />
                                <span className="hidden lg:block">Past Recruiters</span>
                            </Link>
                            <Link to="/developers" className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 font-medium transition-colors dark:text-slate-300 group" title="Developers">
                                <Code className="w-5 h-5 lg:hidden" />
                                <span className="hidden lg:block">Developers</span>
                            </Link>
                            <a href="#stats" className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 font-medium transition-colors dark:text-slate-300 group" title="Statistics">
                                <BarChart2 className="w-5 h-5 lg:hidden" />
                                <span className="hidden lg:block">Statistics</span>
                            </a>
                            <a href="#contact" className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 font-medium transition-colors dark:text-slate-300 group" title="Contact">
                                <Phone className="w-5 h-5 lg:hidden" />
                                <span className="hidden lg:block">Contact</span>
                            </a>
                            <div className="h-6 w-px bg-gray-200 dark:bg-slate-700"></div>
                            <ThemeToggle />
                            {user ? (
                                <Link to={`/dashboard/${user.role}`} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2">
                                    <LayoutDashboard size={18} />
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">Log in</Link>
                                    <Link to="/login" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                                        Portal Access
                                    </Link>
                                </>
                            )}
                        </div>
                        <div className="md:hidden flex items-center gap-4">
                            <ThemeToggle />
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="text-gray-600 hover:text-blue-600 focus:outline-none dark:text-slate-300"
                            >
                                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 shadow-xl dark:bg-slate-950 dark:border-slate-800">
                        <div className="px-4 pt-4 pb-6 space-y-4">
                            <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-600 hover:text-blue-600 font-medium dark:text-slate-300">Home</a>
                            <Link to="/past-recruiters" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-600 hover:text-blue-600 font-medium dark:text-slate-300">Past Recruiters</Link>
                            <Link to="/developers" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-600 hover:text-blue-600 font-medium dark:text-slate-300">Developers</Link>
                            <a href="#stats" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-600 hover:text-blue-600 font-medium dark:text-slate-300">Statistics</a>
                            <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-600 hover:text-blue-600 font-medium dark:text-slate-300">Contact</a>
                            <div className="w-full h-px bg-gray-200 dark:bg-slate-800 my-4"></div>
                            {token ? (
                                <>
                                    <Link to="/dashboard" className="block w-full text-center bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all shadow-md hover:shadow-lg">
                                        Go to Dashboard
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="block w-full text-center text-red-500 font-semibold hover:bg-red-50 px-6 py-3 rounded-lg transition-colors"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="block text-blue-600 font-semibold mb-4 text-center">Log in</Link>
                                    <Link to="/login" className="block w-full text-center bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all shadow-md hover:shadow-lg">
                                        Portal Access
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section - Light Mode Editorial */}
            <HeroEcosystem user={user} />

            {/* MESSAGE FROM THE TPC SECTION */}
            <section className="w-screen bg-blue-50/50 py-32 border-y border-blue-100/50 relative left-1/2 right-1/2 -mx-[50vw] dark:bg-slate-900 dark:border-slate-800">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h3 className="text-blue-900 font-bold tracking-widest uppercase text-sm mb-8 dark:text-blue-300">
                        Words from the Training & Placement Cell
                    </h3>
                    <div className="font-serif text-xl md:text-2xl text-gray-800 leading-relaxed space-y-8 text-justify md:text-center italic dark:text-slate-200">
                        <p>
                            "The Indian Institute of Technology Patna stands as a beacon of academic rigor and technical prowess. Our curriculum is meticulously designed not just to impart knowledge, but to forge analytical thinkers capable of solving the complex challenges of tomorrow."
                        </p>
                        <p>
                            "We take immense pride in our students, who consistently demonstrate exceptional aptitude and a relentless drive for innovation. The strong, enduring relationships we maintain with global industry leaders are a testament to the unparalleled quality of talent nurtured within these walls."
                        </p>
                        <p className="text-lg text-gray-600 mt-6 font-sans not-italic font-medium dark:text-slate-400">
                            — Professor In-Charge, Training & Placement Cell
                        </p>
                    </div>
                </div>
            </section>
            {/* Statistics Section */}
            <section id="stats" className="w-full bg-white relative dark:bg-slate-950">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
                <HomePageCharts />
            </section>

            <DevelopersRibbon />

            {/* Footer */}
            <footer id="contact" className="bg-slate-900 pt-16 pb-8 text-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-white rounded-lg p-1 flex items-center justify-center shadow-sm ring-1 ring-white/20">
                                    <img src={logo} alt="IIT Patna logo" className="w-full h-full object-contain" />
                                </div>
                                <h3 className="text-2xl font-bold tracking-tight">TPC IIT Patna</h3>
                            </div>
                            <p className="mt-4 text-slate-400 font-light leading-relaxed">
                                Bridging the gap between academic brilliance and industry excellence.
                                Creating leaders of tomorrow.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold mb-6 text-white border-b border-white/10 pb-2 inline-block">Contact</h4>
                            <ul className="space-y-4 text-slate-400 text-sm">
                                <li className="flex items-start gap-3">
                                    <MapPin size={18} className="text-blue-400 mt-1 flex-shrink-0" />
                                    <span>Training and Placement Cell,<br />Admin Block, IIT Patna,<br />Bihta, Bihar - 801106</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Mail size={18} className="text-blue-400" />
                                    <a href="mailto:tpc@iitp.ac.in" className="hover:text-blue-400 transition-colors">tpc@iitp.ac.in</a>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Phone size={18} className="text-blue-400" />
                                    <span>+91-6115-233091</span>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold mb-6 text-white border-b border-white/10 pb-2 inline-block">Quick Links</h4>
                            <ul className="space-y-3 text-sm text-slate-400">
                                <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2"><BookOpen size={14} /> Student Guidelines</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2"><BookOpen size={14} /> Company Brochure</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2"><BookOpen size={14} /> Placement Policy</a></li>
                                <li>
                                    {user ? (
                                        <Link to={`/dashboard/${user.role}`} className="text-blue-400 hover:text-blue-300 font-medium transition-colors mt-2 inline-block">Dashboard &rarr;</Link>
                                    ) : (
                                        <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors mt-2 inline-block">Login Portal &rarr;</Link>
                                    )}
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-16 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
                        <p>&copy; {new Date().getFullYear()} Training and Placement Cell, IIT Patna. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
