import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCog } from 'lucide-react';
import { Outlet } from 'react-router-dom';

export default function AdminDashboard() {
    const { user } = useAuth();

    return (
        <div className="space-y-8 animate-[fade-in-up_0.5s_ease-out]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/90 p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100/80 backdrop-blur-sm dark:bg-slate-900/85 dark:border-slate-700/70 dark:shadow-[0_18px_36px_-20px_rgba(2,6,23,0.9)]">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2 dark:text-slate-100">
                        <UserCog className="text-blue-600 dark:text-blue-400" size={28} />
                        Administrator Console
                    </h1>
                    <div className="mt-2 flex items-center gap-2">
                        <span className="px-2.5 py-1 text-xs font-bold rounded bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">Role</span>
                        <span className="px-2.5 py-1 text-xs font-bold rounded bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wider dark:bg-blue-950/70 dark:text-blue-200 dark:border-blue-800">{user?.adminType?.replace('_', ' ')}</span>
                    </div>
                </div>
            </div>

            <div className="pt-2">
                <Outlet />
            </div>
        </div>
    );
}
