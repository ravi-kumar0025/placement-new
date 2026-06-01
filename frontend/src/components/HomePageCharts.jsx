import React from 'react';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    ComposedChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    RadialBarChart,
    RadialBar
} from 'recharts';
import useTheme from '../hooks/useTheme';

// --- Sample Live State Data ---
const mockLiveState = {
    academicYears: [
        {
            year: "2021-22",
            stats: [
                { program: "B.Tech", average: 25.5, median: 20.0, highest: 61.3, placedPercentage: 92 },
                { program: "M.Tech", average: 18.2, median: 15.5, highest: 45.0, placedPercentage: 81 },
                { program: "M.Sc", average: 12.5, median: 10.0, highest: 28.0, placedPercentage: 70 }
            ]
        },
        {
            year: "2022-23",
            stats: [
                { program: "B.Tech", average: 28.5, median: 24.0, highest: 82.0, placedPercentage: 94 },
                { program: "M.Tech", average: 20.1, median: 18.0, highest: 52.0, placedPercentage: 85 },
                { program: "M.Sc", average: 14.1, median: 12.5, highest: 35.0, placedPercentage: 75 }
            ]
        },
        {
            year: "2023-24", // Current
            stats: [
                { program: "B.Tech", average: 29.5, median: 25.0, highest: 85.0, placedPercentage: 96 },
                { program: "M.Tech", average: 21.5, median: 19.5, highest: 55.0, placedPercentage: 88 },
                { program: "M.Sc", average: 15.0, median: 13.0, highest: 40.0, placedPercentage: 80 }
            ]
        }
    ],
    sectors: [
        { name: "Software / IT", count: 85, color: "#475569" }, // Slate 600
        { name: "Core Engineering", count: 40, color: "#64748b" }, // Slate 500
        { name: "Fintech & Analytics", count: 35, color: "#94a3b8" }, // Slate 400
        { name: "Consulting", count: 15, color: "#cbd5e1" }, // Slate 300
        { name: "Others", count: 10, color: "#e2e8f0" } // Slate 200
    ],
    overallMetrics: {
        totalCompaniesVisited: 185,
        overallPlacementPercentage: 93.5
    }
};

// "Human" Light Theme Gradient Colors
const COLORS = {
    BTech: 'url(#lightSage)',
    MTech: 'url(#lightCoral)',
    MSc: 'url(#lightSlate)',
    Line: '#475569', // Slate 600 for trend line
};

// Light Theme Custom Tooltip
const ComplexTooltip = ({ active, payload, label, isDark }) => {
    if (active && payload && payload.length) {
        return (
            <div className={`backdrop-blur-md border p-4 rounded-xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] font-sans ${isDark ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-gray-100'}`}>
                <p className={`font-bold mb-3 pb-2 border-b ${isDark ? 'text-slate-100 border-slate-700' : 'text-gray-900 border-gray-100'}`}>{label} Academic Year</p>
                <div className="space-y-4">
                    {payload.map((entry, index) => {
                        if (entry.dataKey === 'yoyGrowth') {
                            return (
                                <div key={index} className={`flex items-center justify-between gap-6 pt-2 border-t mt-2 ${isDark ? 'border-slate-700' : 'border-gray-50'}`}>
                                    <span className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                        <div className="w-2 h-2 rounded-full bg-slate-600" />
                                        YoY Growth
                                    </span>
                                    <span className={`font-bold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>+{entry.value}%</span>
                                </div>
                            );
                        }

                        const progKey = entry.dataKey.replace('_avg', '');
                        const avg = entry.payload[`${progKey}_avg`];
                        const med = entry.payload[`${progKey}_med`];
                        const high = entry.payload[`${progKey}_high`];

                        return (
                            <div key={index} className="flex flex-col gap-1.5">
                                <span className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>
                                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: entry.color === COLORS.BTech ? 'linear-gradient(to right, #86efac, #4ade80)' : entry.color === COLORS.MTech ? 'linear-gradient(to right, #fca5a5, #f87171)' : '#cbd5e1' }} />
                                    {entry.name.replace('_avg', '')}
                                </span>
                                <div className={`pl-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs font-mono p-2 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-gray-50/50 border-gray-100 text-gray-600'}`}>
                                    <span>Avg:</span>
                                    <span className={`font-semibold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{avg} LPA</span>
                                    <span>Median:</span>
                                    <span className={`font-semibold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{med} LPA</span>
                                    <span>Highest:</span>
                                    <span className={`font-bold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{high} LPA</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
    return null;
};

export default function EditorialPlacementCharts({ data = mockLiveState }) {
    const { isDark } = useTheme();
    const axisColor = isDark ? '#cbd5e1' : '#64748b';
    const gridColor = isDark ? '#334155' : '#f1f5f9';
    const tooltipBg = isDark ? '#0f172a' : '#ffffff';
    const tooltipBorder = isDark ? '#334155' : '#e2e8f0';
    const tooltipText = isDark ? '#e2e8f0' : '#0f172a';
    const cursorFill = isDark ? '#1e293b' : '#f8fafc';
    const lineColor = isDark ? '#cbd5e1' : COLORS.Line;
    const legendTextColor = isDark ? '#e2e8f0' : '#334155';
    const tooltipContentStyle = {
        backgroundColor: tooltipBg,
        border: `1px solid ${tooltipBorder}`,
        borderRadius: '8px',
        color: tooltipText,
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
    };
    const tooltipItemStyle = { color: tooltipText };
    const tooltipLabelStyle = { color: tooltipText, fontWeight: 600 };

    // 1. Process Bar Data
    const barData = data.academicYears.map((yearObj, i, arr) => {
        const flat = { name: yearObj.year };
        let currentOverallAvg = 0;
        yearObj.stats.forEach(s => {
            flat[`${s.program}_avg`] = s.average;
            flat[`${s.program}_med`] = s.median;
            flat[`${s.program}_high`] = s.highest;
            currentOverallAvg += s.average;
        });
        currentOverallAvg = currentOverallAvg / yearObj.stats.length;

        if (i === 0) {
            flat.yoyGrowth = 0;
        } else {
            let prevOverallAvg = 0;
            arr[i - 1].stats.forEach(s => prevOverallAvg += s.average);
            prevOverallAvg = prevOverallAvg / arr[i - 1].stats.length;
            flat.yoyGrowth = Number((((currentOverallAvg - prevOverallAvg) / prevOverallAvg) * 100).toFixed(1));
        }
        return flat;
    });

    // 2. Process Gauge Data
    const currentYearStats = data.academicYears[data.academicYears.length - 1].stats;
    const gaugeData = currentYearStats.map(s => ({
        name: s.program,
        value: s.placedPercentage,
        fill: s.program === "B.Tech" ? '#4ade80' : s.program === "M.Tech" ? '#f87171' : '#94a3b8'
    }));

    return (
        <div id="stats" className="w-full bg-[#F9FAFB] font-sans dark:bg-slate-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 space-y-32">

                {/* --- ROW A: Salary Trends (Text Left, Graph Right) --- */}
                <div className="flex flex-col lg:flex-row items-center gap-16">

                    <div className="w-full lg:w-5/12 space-y-6">
                        <div className="inline-block border-b-2 border-gray-900 pb-1 text-sm font-bold tracking-widest uppercase text-gray-500 dark:border-slate-300 dark:text-slate-400">
                            Compensation Metrics
                        </div>
                        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight dark:text-slate-100">
                            A Steady Climb in Global Compensation
                        </h2>
                        <p className="text-lg text-gray-600 font-light leading-relaxed dark:text-slate-400">
                            Our graduates continue to secure highly competitive remuneration packages. The sustained Year-over-Year (YoY) growth—averaging 12% across programs—reflects robust industry confidence in IIT Patna's academic rigor.
                        </p>
                        <div className="pt-4 flex gap-8">
                            <div>
                                <p className="text-4xl font-black text-gray-900 dark:text-slate-100">{data.overallMetrics.totalCompaniesVisited}+</p>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-widest mt-1 dark:text-slate-400">Global Partners</p>
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-7/12 flex justify-center lg:justify-end">
                        <div className="w-full max-w-xl bg-white p-6 rounded-2xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-gray-100 dark:bg-slate-900 dark:border-slate-700">
                            <div className="h-80 w-full mb-6 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={barData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="lightSage" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#86efac" stopOpacity={1} />
                                                <stop offset="95%" stopColor="#4ade80" stopOpacity={0.9} />
                                            </linearGradient>
                                            <linearGradient id="lightCoral" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#fca5a5" stopOpacity={1} />
                                                <stop offset="95%" stopColor="#f87171" stopOpacity={0.9} />
                                            </linearGradient>
                                            <linearGradient id="lightSlate" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#cbd5e1" stopOpacity={1} />
                                                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.9} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 12, fontWeight: 500 }} dy={10} />
                                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 12 }} />
                                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 12, fontWeight: 600 }} />
                                        <Tooltip content={<ComplexTooltip isDark={isDark} />} cursor={{ fill: cursorFill }} />

                                        <Bar yAxisId="left" dataKey="B.Tech_avg" name="B.Tech" fill={COLORS.BTech} radius={[4, 4, 0, 0]} barSize={28} />
                                        <Bar yAxisId="left" dataKey="M.Tech_avg" name="M.Tech" fill={COLORS.MTech} radius={[4, 4, 0, 0]} barSize={28} />
                                        <Bar yAxisId="left" dataKey="M.Sc_avg" name="M.Sc" fill={COLORS.MSc} radius={[4, 4, 0, 0]} barSize={28} />
                                        <Line yAxisId="right" type="monotone" dataKey="yoyGrowth" stroke={lineColor} strokeWidth={3} dot={{ r: 5, fill: '#fff', stroke: lineColor, strokeWidth: 2 }} activeDot={{ r: 7, fill: lineColor }} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="text-sm text-gray-500 italic px-2 border-l-2 border-gray-200 dark:text-slate-400 dark:border-slate-700">
                                <span className="font-semibold">Insight:</span> The consistent rise in Median packages across all programs highlights the increasing baseline quality of offers, independent of highest-package outliers.
                            </p>
                        </div>
                    </div>
                </div>


                {/* --- ROW B: Placement Rates (Graph Left, Text Right) --- */}
                <div className="flex flex-col-reverse lg:flex-row items-center gap-16">

                    <div className="w-full lg:w-6/12 flex justify-center lg:justify-start">
                        <div className="w-full max-w-lg bg-white p-6 rounded-2xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col items-center dark:bg-slate-900 dark:border-slate-700">
                            <div className="h-72 w-full mb-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadialBarChart
                                        cx="50%" cy="50%"
                                        innerRadius="40%" outerRadius="100%"
                                        barSize={18}
                                        data={gaugeData}
                                        startAngle={180} endAngle={-180}
                                    >
                                        <RadialBar
                                            minAngle={15}
                                            background={{ fill: isDark ? '#334155' : '#f1f5f9' }}
                                            clockWise
                                            dataKey="value"
                                            cornerRadius={10}
                                        />
                                        <Tooltip
                                            formatter={(value, name) => [`${value}% Placed`, name]}
                                            contentStyle={tooltipContentStyle}
                                            itemStyle={tooltipItemStyle}
                                            labelStyle={tooltipLabelStyle}
                                        />
                                        <Legend
                                            iconSize={10}
                                            layout="horizontal"
                                            verticalAlign="bottom"
                                            wrapperStyle={{ fontSize: '13px', color: legendTextColor, paddingTop: '15px' }}
                                            formatter={(value) => <span style={{ color: legendTextColor }}>{value}</span>}
                                        />
                                    </RadialBarChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="text-sm text-gray-500 italic px-2 border-l-2 border-gray-200 dark:text-slate-400 dark:border-slate-700">
                                <span className="font-semibold">Insight:</span> The B.Tech placement rate holds strong at 96%, with M.Tech post-graduates following aggressively behind.
                            </p>
                        </div>
                    </div>

                    <div className="w-full lg:w-5/12 space-y-6">
                        <div className="inline-block border-b-2 border-gray-900 pb-1 text-sm font-bold tracking-widest uppercase text-gray-500 dark:border-slate-300 dark:text-slate-400">
                            Conversion Efficacy
                        </div>
                        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight dark:text-slate-100">
                            Near-Universal Placement Success
                        </h2>
                        <p className="text-lg text-gray-600 font-light leading-relaxed dark:text-slate-400">
                            We take pride in our 93.5% overall placement conversion rate. The Training and Placement Cell works relentlessly to match every eligible candidate with roles that align with their technical expertise and career trajectory.
                        </p>
                    </div>
                </div>

                {/* --- ROW C: Sector Dominance (Text Left, Graph Right) --- */}
                <div className="flex flex-col lg:flex-row items-center gap-16">

                    <div className="w-full lg:w-5/12 space-y-6">
                        <div className="inline-block border-b-2 border-gray-900 pb-1 text-sm font-bold tracking-widest uppercase text-gray-500 dark:border-slate-300 dark:text-slate-400">
                            Industry Footprint
                        </div>
                        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight dark:text-slate-100">
                            Leading the IT & Analytics Frontier
                        </h2>
                        <p className="text-lg text-gray-600 font-light leading-relaxed dark:text-slate-400">
                            Software and IT logic sectors continue to dominate the recruitment landscape, absorbing over 40% of our candidate pool. Notably, Core Engineering roles maintain a strong, vital presence for our specialized domain students.
                        </p>
                    </div>

                    <div className="w-full lg:w-6/12 flex justify-center lg:justify-end">
                        <div className="w-full max-w-lg bg-white p-6 rounded-2xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-gray-100 dark:bg-slate-900 dark:border-slate-700">
                            <div className="h-64 w-full mb-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Tooltip
                                            formatter={(value) => [`${value} Companies`, 'Recruiters']}
                                            contentStyle={tooltipContentStyle}
                                            itemStyle={tooltipItemStyle}
                                            labelStyle={tooltipLabelStyle}
                                        />
                                        <Pie
                                            data={data.sectors}
                                            cx="50%" cy="50%"
                                            innerRadius={50} outerRadius={75}
                                            paddingAngle={4}
                                            dataKey="count"
                                            stroke="none"
                                            label={({ cx, cy, midAngle, outerRadius, percent, name }) => {
                                                const RADIAN = Math.PI / 180;
                                                const radius = outerRadius * 1.35;
                                                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                                const y = cy + radius * Math.sin(-midAngle * RADIAN);

                                                return (
                                                    <text x={x} y={y} fill={isDark ? '#cbd5e1' : '#475569'} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="11" fontWeight="600">
                                                        {name} ({(percent * 100).toFixed(0)}%)
                                                    </text>
                                                );
                                            }}
                                        >
                                            {data.sectors.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="text-sm text-gray-500 italic px-2 border-l-2 border-gray-200 dark:text-slate-400 dark:border-slate-700">
                                <span className="font-semibold">Insight:</span> A marked surge in FinTech specific hiring pushed the Analytics sector representation dramatically upwards this year.
                            </p>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
