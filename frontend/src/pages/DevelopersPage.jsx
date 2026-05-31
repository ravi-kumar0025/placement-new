import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { Github, Linkedin, LayoutDashboard, Home, Briefcase, Code, BarChart2, Phone, Menu, X } from 'lucide-react';
import api from '../api';
import ThemeToggle from '../components/ThemeToggle';
import logo from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';

// Framer Motion Variants for Staggered Entrance
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 250,
            damping: 20
        }
    }
};

const MotionDiv = motion.div;

const DeveloperCard = ({ member, index }) => {
    // Explicit organic staggered offsets as requested
    // Card 0: 0px, Card 1: 40px, Card 2: -20px 
    const getOffset = (idx) => {
        const mod = idx % 3;
        if (mod === 0) return 'lg:translate-y-0';
        if (mod === 1) return 'lg:translate-y-[40px]';
        if (mod === 2) return 'lg:-translate-y-[20px]';
        return '';
    };

    const organicOffset = getOffset(index);

    return (
        <MotionDiv variants={itemVariants} className={`w - full ${organicOffset} `}>
            <Tilt
                tiltMaxAngleX={10}
                tiltMaxAngleY={10}
                perspective={1000}
                scale={1.05}
                transitionSpeed={1500}
                gyroscope={true}
                glareEnable={true}
                glareMaxOpacity={0.15}
                glareColor="#ffffff"
                glarePosition="bottom"
                className="w-full rounded-[2rem]"
            >
                <div className="relative w-full min-h-[360px] rounded-[2rem] overflow-hidden group border border-slate-200 border-t-[4px] border-t-sky-500 bg-[#F3F4F6] shadow-[0_16px_32px_-22px_rgba(15,23,42,0.38)] dark:bg-slate-900 dark:border-slate-700 dark:border-t-cyan-400">
                    <div
                        className="relative w-full min-h-[356px] flex flex-col items-center px-5 py-8 pb-20 rounded-[1.9rem] bg-transparent border-0 shadow-none transition-all duration-500 overflow-hidden"
                    >
                        {/* Profile Image */}
                        <div className="relative w-28 h-28 mb-5 z-10">
                            <img
                                src={member.image}
                                alt={member.name}
                                className="w-full h-full rounded-full object-cover shadow-[0_4px_20px_-4px_rgba(0,0,0,0.15)] relative z-10 bg-slate-100 border border-gray-100 dark:border-slate-700 dark:bg-slate-800"
                            />
                        </div>

                        {/* Typography - Light Formal Theme */}
                        <div className="text-center z-10 relative mb-6 flex-grow">
                            <h3 className="text-xl font-bold font-sans text-gray-900 tracking-tight mb-1 dark:text-slate-100">
                                {member.name}
                            </h3>
                            <p className="text-sm font-medium text-gray-500 mb-3 dark:text-slate-400">
                                {member.role}
                            </p>
                            <span className="text-xs text-blue-600 font-medium bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full inline-block dark:bg-cyan-950/50 dark:border-cyan-800 dark:text-cyan-200">
                                {member.specialTag}
                            </span>
                        </div>

                        {/* Floating Social Slide-Up on Hover */}
                        <div className="absolute bottom-6 flex gap-4 opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out z-20">
                            <a
                                href={member.githubUrl}
                                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-white hover:bg-gray-900 hover:border-gray-900 hover:-translate-y-1 shadow-md transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                            >
                                <Github size={18} />
                            </a>
                            <a
                                href={member.linkedinUrl}
                                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-white hover:bg-[#0A66C2] hover:border-[#0A66C2] hover:-translate-y-1 shadow-md transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                            >
                                <Linkedin size={18} />
                            </a>
                        </div>
                    </div>
                </div>
            </Tilt>
        </MotionDiv>
    );
};

export default function DevelopersPage() {
    const [developers, setDevelopers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, token, logout } = useAuth();

    useEffect(() => {
        const fetchDevelopers = async () => {
            try {
                const response = await api.get('/api/developers');
                setDevelopers(response.data);
            } catch (error) {
                console.error('Failed to fetch developers:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDevelopers();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-cyan-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent font-sans pb-32 overflow-hidden relative">

            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100 transition-all duration-300 dark:bg-slate-950/85 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-14 items-center">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-lg p-1 flex items-center justify-center shadow-sm ring-1 ring-blue-100 dark:bg-slate-900 dark:ring-slate-700">
                                <img src={logo} alt="IIT Patna logo" className="w-full h-full object-contain" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-lg font-bold text-gray-900 tracking-tight dark:text-slate-100 hidden lg:block whitespace-nowrap">Training & Placement</span>
                                <span className="text-lg font-bold text-gray-900 tracking-tight dark:text-slate-100 lg:hidden">TPC</span>
                                <span className="text-xs font-medium text-blue-600">IIT Patna</span>
                            </div>
                        </Link>
                        <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
                            <Link to="/" className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 font-medium transition-colors dark:text-slate-300 group" title="Home">
                                <Home className="w-5 h-5 lg:hidden" />
                                <span className="hidden lg:block">Home</span>
                            </Link>
                            <Link to="/past-recruiters" className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 font-medium transition-colors dark:text-slate-300 group" title="Past Recruiters">
                                <Briefcase className="w-5 h-5 lg:hidden" />
                                <span className="hidden lg:block">Past Recruiters</span>
                            </Link>
                            <Link to="/developers" className="flex items-center gap-1.5 text-blue-600 font-medium transition-colors group" title="Developers">
                                <Code className="w-5 h-5 lg:hidden" />
                                <span className="hidden lg:block">Developers</span>
                            </Link>
                            <Link to="/#stats" className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 font-medium transition-colors dark:text-slate-300 group" title="Statistics">
                                <BarChart2 className="w-5 h-5 lg:hidden" />
                                <span className="hidden lg:block">Statistics</span>
                            </Link>
                            <Link to="/#contact" className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 font-medium transition-colors dark:text-slate-300 group" title="Contact">
                                <Phone className="w-5 h-5 lg:hidden" />
                                <span className="hidden lg:block">Contact</span>
                            </Link>
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
                            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-600 hover:text-blue-600 font-medium dark:text-slate-300">Home</Link>
                            <Link to="/past-recruiters" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-600 hover:text-blue-600 font-medium dark:text-slate-300">Past Recruiters</Link>
                            <Link to="/developers" onClick={() => setIsMobileMenuOpen(false)} className="block text-blue-600 font-medium">Developers</Link>
                            <Link to="/#stats" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-600 hover:text-blue-600 font-medium dark:text-slate-300">Statistics</Link>
                            <Link to="/#contact" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-600 hover:text-blue-600 font-medium dark:text-slate-300">Contact</Link>
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

            <div className="pt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Header Setup */}
                <MotionDiv
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-32"
                >
                    <div className="inline-block px-4 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-gray-600 font-bold tracking-widest uppercase text-xs mb-8 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                        The Core Team
                    </div>
                    <h1 className="text-5xl md:text-6xl font-serif text-gray-900 tracking-tight mb-6 dark:text-slate-100">
                        Meet the Developers
                    </h1>
                    <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed dark:text-slate-400">
                        The engineering minds and designers forging the premier digital recruitment platform for the Indian Institute of Technology Patna.
                    </p>
                </MotionDiv>

                {/* Asymmetrical Staggered Onyx Grid */}
                <MotionDiv
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 lg:gap-y-20"
                >
                    {developers.map((member, index) => (
                        <DeveloperCard key={member._id || member.name} member={member} index={index} />
                    ))}
                </MotionDiv>

            </div>
        </div>
    );
}
