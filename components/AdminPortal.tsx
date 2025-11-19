
import React, { useState, useMemo, useEffect } from 'react';
import { StudentProfile, CourseModule } from '../types';
import { 
  Users, TrendingUp, AlertTriangle, Search, Eye, ShieldAlert, 
  ArrowUpRight, ArrowDownRight, BarChart2, DollarSign, X,
  LayoutDashboard, BookOpen, Layers, PieChart as PieIcon, Activity, CreditCard, 
  List as ListIcon, Grid as GridIcon, MoreHorizontal, Mail, UserCheck
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  PieChart, Pie, AreaChart, Area, CartesianGrid, Legend
} from 'recharts';

interface AdminPortalProps {
  students: StudentProfile[];
  courses: CourseModule[];
  initialTab?: 'overview' | 'trades' | 'analytics' | 'directory';
}

const AdminPortal: React.FC<AdminPortalProps> = ({ students, courses, initialTab = 'overview' }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'trades' | 'analytics' | 'directory'>(initialTab);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  
  // Sync initialTab prop changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // --- Overview State ---
  // (Removed studentSearch from here, moving dedicated search to Directory)

  // --- Student Directory State ---
  const [directorySearch, setDirectorySearch] = useState('');
  const [directoryViewMode, setDirectoryViewMode] = useState<'grid' | 'list'>('grid');
  const [directoryFilter, setDirectoryFilter] = useState<'all' | 'active' | 'at-risk' | 'inactive'>('all');

  // --- Trade Journal State ---
  const [journalSearch, setJournalSearch] = useState('');
  const [filterPair, setFilterPair] = useState('all');
  const [filterOutcome, setFilterOutcome] = useState('all');

  // --- Aggregate Analytics (Overview) ---
  const classStats = useMemo(() => {
    const totalPnL = students.reduce((acc, s) => acc + s.stats.totalPnL, 0);
    const avgWinRate = Math.round(students.reduce((acc, s) => acc + s.stats.winRate, 0) / students.length) || 0;
    const atRiskCount = students.filter(s => s.status === 'at-risk').length;
    const totalVolume = students.reduce((acc, s) => acc + s.stats.tradesCount, 0);

    // Chart Data: P&L Distribution
    const pnlData = students.map(s => ({
      name: s.name.split(' ')[0],
      pnl: s.stats.totalPnL,
      color: s.stats.totalPnL >= 0 ? '#10b981' : '#ef4444'
    })).sort((a, b) => b.pnl - a.pnl);

    return { totalPnL, avgWinRate, atRiskCount, totalVolume, pnlData };
  }, [students]);

  // --- Filtered Students for Directory ---
  const filteredDirectoryStudents = useMemo(() => {
    return students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(directorySearch.toLowerCase()) || 
                             s.email.toLowerCase().includes(directorySearch.toLowerCase());
        const matchesFilter = directoryFilter === 'all' || s.status === directoryFilter;
        return matchesSearch && matchesFilter;
    });
  }, [students, directorySearch, directoryFilter]);

  // --- Aggregate Analytics (Trade Journal) ---
  const allTrades = useMemo(() => {
    return students.flatMap(s => s.recentTrades.map(t => ({
      ...t,
      studentId: s.id,
      studentName: s.name,
      studentTier: s.tier,
      studentAvatar: s.name.charAt(0)
    })));
  }, [students]);

  const uniquePairs = useMemo(() => Array.from(new Set(allTrades.map(t => t.pair))), [allTrades]);

  const filteredTrades = useMemo(() => {
    return allTrades.filter(t => {
      const matchesSearch = 
        t.pair.toLowerCase().includes(journalSearch.toLowerCase()) ||
        t.studentName.toLowerCase().includes(journalSearch.toLowerCase()) ||
        (t.notes && t.notes.toLowerCase().includes(journalSearch.toLowerCase()));
      
      const matchesPair = filterPair === 'all' || t.pair === filterPair;
      const matchesOutcome = filterOutcome === 'all' || t.status === filterOutcome;

      return matchesSearch && matchesPair && matchesOutcome;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allTrades, journalSearch, filterPair, filterOutcome]);

  const tradeAnalytics = useMemo(() => {
    const total = filteredTrades.length;
    const wins = filteredTrades.filter(t => t.status === 'win').length;
    const losses = filteredTrades.filter(t => t.status === 'loss').length;
    const winRate = total > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;
    const netPnL = filteredTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);

    const pairStats: Record<string, number> = {};
    filteredTrades.forEach(t => {
      pairStats[t.pair] = (pairStats[t.pair] || 0) + (t.pnl || 0);
    });

    const pairData = Object.entries(pairStats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return { total, wins, losses, winRate, netPnL, pairData };
  }, [filteredTrades]);

  // --- Business Analytics ---
  const businessMetrics = useMemo(() => {
    const PRICES = { foundation: 47, professional: 97, elite: 297 };
    let mrr = 0;
    const tierCounts = { foundation: 0, professional: 0, elite: 0 };

    students.forEach(s => {
      if (s.tier) {
        tierCounts[s.tier]++;
        mrr += PRICES[s.tier] || 0;
      }
    });

    const totalRevenue = mrr * 12;
    const churnRate = 4.2;
    const tierData = [
      { name: 'Foundation', value: tierCounts.foundation, color: '#94a3b8' },
      { name: 'Professional', value: tierCounts.professional, color: '#00ff94' },
      { name: 'Elite', value: tierCounts.elite, color: '#a855f7' },
    ];
    const revenueGrowthData = [
      { month: 'May', revenue: mrr * 0.6 },
      { month: 'Jun', revenue: mrr * 0.72 },
      { month: 'Jul', revenue: mrr * 0.85 },
      { month: 'Aug', revenue: mrr * 0.92 },
      { month: 'Sep', revenue: mrr * 0.98 },
      { month: 'Oct', revenue: mrr },
    ];
    const courseCompletionData = courses.map(c => ({
        name: c.title.length > 20 ? c.title.substring(0, 20) + '...' : c.title,
        completion: Math.floor(Math.random() * (95 - 40 + 1) + 40)
    }));
    const violationData = [
        { rule: 'Trading Against Trend', count: 142 },
        { rule: 'No FVG Identified', count: 98 },
        { rule: 'Risk > 2% Account', count: 87 },
        { rule: 'Early Entry (No Close)', count: 65 },
        { rule: 'Trading News Event', count: 45 },
    ];

    return { mrr, totalRevenue, churnRate, tierData, revenueGrowthData, courseCompletionData, violationData };
  }, [students, courses]);


  return (
    <div className="space-y-6 md:space-y-8 text-white pb-10">
      {/* Header & Tabs */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <ShieldAlert className="h-6 w-6 md:h-8 md:w-8 text-trade-neon" /> 
            Admin Portal
          </h1>
          <p className="text-gray-400 mt-1 text-sm md:text-base">Manage students, risk, and aggregated data.</p>
        </div>
        
        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 md:pb-0">
          {[
            { id: 'overview', label: 'Command Center', icon: LayoutDashboard },
            { id: 'directory', label: 'Directory', icon: Users },
            { id: 'trades', label: 'Trade Analysis', icon: Layers },
            { id: 'analytics', label: 'Analytics', icon: PieIcon },
          ].map(tab => {
             const Icon = tab.icon;
             return (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition whitespace-nowrap ${
                    activeTab === tab.id 
                        ? 'bg-gray-700 text-white shadow-lg ring-1 ring-gray-600' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                >
                    <Icon className="h-4 w-4" /> {tab.label}
                </button>
             );
          })}
        </div>
      </div>

      {/* ================= OVERVIEW TAB ================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Top Level Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-trade-dark p-5 md:p-6 rounded-xl border border-gray-700">
              <div className="flex items-center gap-2 text-gray-400 mb-2 text-sm">
                <DollarSign className="h-4 w-4" /> Class Total P&L
              </div>
              <div className={`text-2xl md:text-3xl font-bold ${classStats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {classStats.totalPnL >= 0 ? '+' : ''}${classStats.totalPnL.toLocaleString()}
              </div>
            </div>

            <div className="bg-trade-dark p-5 md:p-6 rounded-xl border border-gray-700">
              <div className="flex items-center gap-2 text-gray-400 mb-2 text-sm">
                <BarChart2 className="h-4 w-4" /> Avg Win Rate
              </div>
              <div className="text-2xl md:text-3xl font-bold text-blue-400">
                {classStats.avgWinRate}%
              </div>
            </div>

            <div className="bg-trade-dark p-5 md:p-6 rounded-xl border border-gray-700 relative overflow-hidden">
              <div className="flex items-center gap-2 text-gray-400 mb-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-red-500" /> At-Risk Students
              </div>
              <div className="text-2xl md:text-3xl font-bold text-red-500">
                {classStats.atRiskCount}
              </div>
              {classStats.atRiskCount > 0 && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-red-500 animate-pulse"></div>
              )}
            </div>

            <div className="bg-trade-dark p-5 md:p-6 rounded-xl border border-gray-700">
              <div className="flex items-center gap-2 text-gray-400 mb-2 text-sm">
                <TrendingUp className="h-4 w-4" /> Total Trades Taken
              </div>
              <div className="text-2xl md:text-3xl font-bold text-purple-400">
                {classStats.totalVolume}
              </div>
            </div>
          </div>

          {/* Analytics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Leaderboard Chart */}
            <div className="lg:col-span-2 bg-trade-dark p-6 rounded-xl border border-gray-700">
              <h3 className="font-bold text-lg mb-6">Classroom P&L Distribution</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classStats.pnlData}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickMargin={10} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip 
                      cursor={{fill: '#1e293b'}}
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                    />
                    <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                      {classStats.pnlData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Risk Radar List */}
            <div className="bg-trade-dark p-6 rounded-xl border border-gray-700 flex flex-col">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  Risk Radar
              </h3>
              <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2 max-h-[250px] lg:max-h-none">
                {students.filter(s => s.status === 'at-risk').map(student => (
                  <div key={student.id} onClick={() => setSelectedStudent(student)} className="p-3 bg-red-900/10 border border-red-500/30 rounded-lg cursor-pointer hover:bg-red-900/20 transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-red-200">{student.name}</h4>
                        <p className="text-xs text-red-400/70">High Drawdown Detected</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-red-400">
                        DD: {student.stats.currentDrawdown}%
                      </span>
                    </div>
                  </div>
                ))}
                {students.filter(s => s.status === 'at-risk').length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <ShieldAlert className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        No students currently flagged.
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= DIRECTORY TAB ================= */}
      {activeTab === 'directory' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           {/* Directory Controls */}
           <div className="bg-trade-dark rounded-xl border border-gray-700 p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
               <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input 
                    type="text"
                    placeholder="Search students..."
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-trade-accent"
                    value={directorySearch}
                    onChange={(e) => setDirectorySearch(e.target.value)}
                  />
               </div>

               <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
                  <select 
                    className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none focus:border-trade-accent"
                    value={directoryFilter}
                    onChange={(e) => setDirectoryFilter(e.target.value as any)}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="at-risk">At Risk</option>
                    <option value="inactive">Inactive</option>
                  </select>

                  <div className="flex bg-gray-800 p-1 rounded-lg border border-gray-600">
                      <button 
                        onClick={() => setDirectoryViewMode('grid')}
                        className={`p-2 rounded ${directoryViewMode === 'grid' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        title="Grid View"
                      >
                          <GridIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => setDirectoryViewMode('list')}
                        className={`p-2 rounded ${directoryViewMode === 'list' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        title="List View"
                      >
                          <ListIcon className="h-4 w-4" />
                      </button>
                  </div>
               </div>
           </div>

           {/* Directory Content */}
           {filteredDirectoryStudents.length === 0 ? (
              <div className="text-center py-16 bg-trade-dark border border-gray-700 border-dashed rounded-xl">
                 <Users className="h-12 w-12 mx-auto text-gray-600 mb-4" />
                 <h3 className="text-lg font-bold text-gray-400">No students found</h3>
                 <p className="text-gray-500">Try adjusting search or filters</p>
              </div>
           ) : directoryViewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDirectoryStudents.map(student => (
                      <div 
                        key={student.id} 
                        onClick={() => setSelectedStudent(student)}
                        className="group bg-trade-dark hover:bg-gray-800 border border-gray-700 hover:border-trade-accent rounded-xl p-5 transition cursor-pointer relative overflow-hidden"
                      >
                          <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-3">
                                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg ${
                                      student.status === 'at-risk' ? 'bg-red-500/20 text-red-500' : 
                                      student.tier === 'elite' ? 'bg-purple-600 text-white' :
                                      'bg-trade-accent/20 text-trade-accent'
                                  }`}>
                                      {student.name.charAt(0)}
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-white">{student.name}</h4>
                                      <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
                                          student.tier === 'elite' ? 'bg-purple-500/20 text-purple-400' : 
                                          student.tier === 'professional' ? 'bg-trade-neon/10 text-trade-neon' : 'bg-gray-700 text-gray-400'
                                      }`}>
                                          {student.tier}
                                      </span>
                                  </div>
                              </div>
                              <div className="flex gap-2">
                                 {student.status === 'at-risk' && <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />}
                              </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                              <div className="bg-gray-900/50 p-2 rounded">
                                  <span className="block text-xs text-gray-500">Win Rate</span>
                                  <span className={`font-bold ${student.stats.winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>{student.stats.winRate}%</span>
                              </div>
                              <div className="bg-gray-900/50 p-2 rounded">
                                  <span className="block text-xs text-gray-500">Net P&L</span>
                                  <span className={`font-bold ${student.stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                      {student.stats.totalPnL >= 0 ? '+' : ''}${student.stats.totalPnL}
                                  </span>
                              </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-700/50">
                              <span className="text-gray-500">Joined {new Date(student.joinedDate).toLocaleDateString()}</span>
                              <span className="text-trade-accent group-hover:underline flex items-center gap-1">View Profile <ArrowUpRight className="h-3 w-3" /></span>
                          </div>
                      </div>
                  ))}
              </div>
           ) : (
              <div className="bg-trade-dark rounded-xl border border-gray-700 overflow-hidden overflow-x-auto">
                 <table className="w-full text-left text-sm min-w-[800px]">
                    <thead className="bg-gray-800 text-gray-400">
                        <tr>
                            <th className="p-4">Student</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Tier</th>
                            <th className="p-4">Win Rate</th>
                            <th className="p-4">Net P&L</th>
                            <th className="p-4">Trades</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {filteredDirectoryStudents.map(student => (
                            <tr key={student.id} className="hover:bg-gray-800/50 transition group">
                                <td className="p-4 font-bold text-white flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                        student.tier === 'elite' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
                                    }`}>
                                        {student.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div>{student.name}</div>
                                        <div className="text-xs text-gray-500 font-normal">{student.email}</div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                                        student.status === 'active' ? 'bg-green-500/10 text-green-400' :
                                        student.status === 'at-risk' ? 'bg-red-500/10 text-red-400 animate-pulse' :
                                        'bg-gray-700 text-gray-400'
                                    }`}>
                                        {student.status}
                                    </span>
                                </td>
                                <td className="p-4 capitalize text-gray-300">{student.tier}</td>
                                <td className={`p-4 font-bold ${student.stats.winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                                    {student.stats.winRate}%
                                </td>
                                <td className={`p-4 font-bold ${student.stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    ${student.stats.totalPnL}
                                </td>
                                <td className="p-4 text-gray-300">{student.stats.tradesCount}</td>
                                <td className="p-4 text-right">
                                    <button 
                                        onClick={() => setSelectedStudent(student)}
                                        className="px-3 py-1.5 bg-gray-700 hover:bg-trade-accent hover:text-white rounded-lg text-xs font-bold transition"
                                    >
                                        Manage
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
              </div>
           )}
        </div>
      )}

      {/* ================= TRADE ANALYSIS TAB ================= */}
      {activeTab === 'trades' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Controls Bar */}
          <div className="bg-trade-dark rounded-xl border border-gray-700 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
             <div className="flex items-center gap-2 text-lg font-bold w-full md:w-auto">
                <BookOpen className="h-5 w-5 text-trade-accent" /> Global Ledger
             </div>

             <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
               {/* Search */}
               <div className="relative w-full md:w-64">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                 <input 
                   type="text" 
                   placeholder="Search student, pair..." 
                   className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-trade-accent"
                   value={journalSearch}
                   onChange={(e) => setJournalSearch(e.target.value)}
                 />
               </div>

               {/* Filters */}
               <div className="flex gap-2 overflow-x-auto w-full md:w-auto no-scrollbar">
                   <select 
                      className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none focus:border-trade-accent"
                      value={filterPair}
                      onChange={(e) => setFilterPair(e.target.value)}
                   >
                      <option value="all">All Pairs</option>
                      {uniquePairs.map(pair => <option key={pair} value={pair}>{pair}</option>)}
                   </select>

                   <select 
                      className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none focus:border-trade-accent"
                      value={filterOutcome}
                      onChange={(e) => setFilterOutcome(e.target.value)}
                   >
                      <option value="all">All Outcomes</option>
                      <option value="win">Wins</option>
                      <option value="loss">Losses</option>
                      <option value="breakeven">Breakeven</option>
                   </select>
               </div>
             </div>
          </div>

          {/* Aggregate Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-trade-dark p-4 md:p-5 rounded-xl border border-gray-700">
               <div className="text-xs text-gray-400 mb-1">Trades in View</div>
               <div className="text-2xl font-bold">{tradeAnalytics.total}</div>
            </div>
            <div className="bg-trade-dark p-4 md:p-5 rounded-xl border border-gray-700">
               <div className="text-xs text-gray-400 mb-1">Win Rate (Filtered)</div>
               <div className={`text-2xl font-bold ${tradeAnalytics.winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                 {tradeAnalytics.winRate}%
               </div>
            </div>
            <div className="bg-trade-dark p-4 md:p-5 rounded-xl border border-gray-700">
               <div className="text-xs text-gray-400 mb-1">Net P&L (Filtered)</div>
               <div className={`text-2xl font-bold ${tradeAnalytics.netPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                 {tradeAnalytics.netPnL >= 0 ? '+' : ''}${tradeAnalytics.netPnL.toLocaleString()}
               </div>
            </div>
             <div className="bg-trade-dark p-4 md:p-5 rounded-xl border border-gray-700">
               <div className="text-xs text-gray-400 mb-1">Win / Loss Ratio</div>
               <div className="text-xl md:text-2xl font-bold text-blue-400">
                 {tradeAnalytics.wins}W / {tradeAnalytics.losses}L
               </div>
            </div>
          </div>

          {/* Performance Charts */}
          <div className="bg-trade-dark p-6 rounded-xl border border-gray-700">
             <h3 className="font-bold text-lg mb-6">P&L Performance by Asset (Aggregated)</h3>
             <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={tradeAnalytics.pairData}>
                   <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickMargin={10} />
                   <YAxis stroke="#64748b" fontSize={12} />
                   <Tooltip 
                     cursor={{fill: '#1e293b'}}
                     contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                   />
                   <Bar dataKey="value" name="Net P&L" radius={[4, 4, 0, 0]}>
                     {tradeAnalytics.pairData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#10b981' : '#ef4444'} />
                     ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </div>

          {/* Global Journal Table */}
          <div className="bg-trade-dark rounded-xl border border-gray-700 overflow-hidden overflow-x-auto">
             <table className="w-full text-left text-sm min-w-[800px]">
               <thead className="bg-gray-800 text-gray-400">
                 <tr>
                   <th className="p-4">Date</th>
                   <th className="p-4">Student</th>
                   <th className="p-4">Pair</th>
                   <th className="p-4">Type</th>
                   <th className="p-4">Notes</th>
                   <th className="p-4 text-center">Result</th>
                   <th className="p-4 text-right">P&L</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-700">
                 {filteredTrades.map((trade, idx) => (
                   <tr key={`${trade.studentId}-${trade.id}-${idx}`} className="hover:bg-gray-800/50 transition">
                     <td className="p-4 text-gray-400 font-mono text-xs">{new Date(trade.date).toLocaleDateString()}</td>
                     <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">
                            {trade.studentAvatar}
                          </div>
                          <div>
                            <div className="font-bold text-white">{trade.studentName}</div>
                            <div className="text-[10px] text-gray-500 uppercase">{trade.studentTier}</div>
                          </div>
                        </div>
                     </td>
                     <td className="p-4 font-bold text-white">{trade.pair}</td>
                     <td className="p-4">
                        <span className={`flex items-center gap-1 uppercase text-xs font-bold ${trade.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                           {trade.type === 'buy' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                           {trade.type}
                        </span>
                     </td>
                     <td className="p-4 text-gray-400 max-w-xs truncate text-xs">{trade.notes}</td>
                     <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                            trade.status === 'win' ? 'bg-green-500/20 text-green-400' : 
                            trade.status === 'loss' ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-400'
                        }`}>
                            {trade.status}
                        </span>
                     </td>
                     <td className={`p-4 text-right font-bold font-mono ${
                        (trade.pnl || 0) > 0 ? 'text-green-400' : (trade.pnl || 0) < 0 ? 'text-red-400' : 'text-gray-500'
                     }`}>
                        {trade.pnl ? (trade.pnl > 0 ? `+$${trade.pnl}` : `$${trade.pnl}`) : '-'}
                     </td>
                   </tr>
                 ))}
                 {filteredTrades.length === 0 && (
                   <tr>
                     <td colSpan={7} className="p-12 text-center text-gray-500">
                       No trades match your filters.
                     </td>
                   </tr>
                 )}
               </tbody>
             </table>
          </div>
        </div>
      )}

      {/* ================= PLATFORM ANALYTICS TAB ================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           {/* KPI Cards */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-trade-dark p-6 rounded-xl border border-gray-700">
                 <div className="flex items-center gap-2 text-gray-400 mb-2">
                   <Activity className="h-4 w-4 text-trade-neon" /> Monthly Recurring Rev
                 </div>
                 <div className="text-3xl font-bold text-white">
                   ${businessMetrics.mrr.toLocaleString()}
                 </div>
                 <div className="text-xs text-green-400 mt-1 flex items-center gap-1">
                   <TrendingUp className="h-3 w-3" /> +12% vs last month
                 </div>
              </div>
              
              <div className="bg-trade-dark p-6 rounded-xl border border-gray-700">
                 <div className="flex items-center gap-2 text-gray-400 mb-2">
                   <Users className="h-4 w-4" /> Active Subscribers
                 </div>
                 <div className="text-3xl font-bold text-white">
                   {students.length}
                 </div>
              </div>

              <div className="bg-trade-dark p-6 rounded-xl border border-gray-700">
                 <div className="flex items-center gap-2 text-gray-400 mb-2">
                   <CreditCard className="h-4 w-4" /> Lifetime Revenue
                 </div>
                 <div className="text-3xl font-bold text-white">
                   ${(businessMetrics.totalRevenue).toLocaleString()}
                 </div>
                 <div className="text-xs text-gray-500 mt-1">Projected EOY</div>
              </div>

              <div className="bg-trade-dark p-6 rounded-xl border border-gray-700">
                 <div className="flex items-center gap-2 text-gray-400 mb-2">
                   <ArrowDownRight className="h-4 w-4 text-red-500" /> Churn Rate
                 </div>
                 <div className="text-3xl font-bold text-red-400">
                   {businessMetrics.churnRate}%
                 </div>
                 <div className="text-xs text-gray-500 mt-1">Industry Avg: 5.5%</div>
              </div>
           </div>

           {/* Charts Grid */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-trade-dark p-6 rounded-xl border border-gray-700">
                 <h3 className="font-bold text-lg mb-6">Revenue Trajectory</h3>
                 <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={businessMetrics.revenueGrowthData}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00ff94" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#00ff94" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} />
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#00ff94" fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              <div className="bg-trade-dark p-6 rounded-xl border border-gray-700">
                 <h3 className="font-bold text-lg mb-6">Student Tiers</h3>
                 <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={businessMetrics.tierData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {businessMetrics.tierData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                            />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-trade-dark p-6 rounded-xl border border-gray-700">
                 <h3 className="font-bold text-lg mb-6">Course Completion Rate</h3>
                 <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={businessMetrics.courseCompletionData}>
                            <XAxis type="number" stroke="#64748b" fontSize={12} />
                            <YAxis dataKey="name" type="category" width={120} stroke="#64748b" fontSize={11} />
                            <Tooltip 
                                cursor={{fill: '#1e293b'}}
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                            />
                            <Bar dataKey="completion" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} name="% Completed" />
                        </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              <div className="bg-trade-dark p-6 rounded-xl border border-gray-700">
                 <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-red-400" /> Top AI Rule Violations
                 </h3>
                 <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={businessMetrics.violationData}>
                            <XAxis dataKey="rule" stroke="#64748b" fontSize={10} tickMargin={10} />
                            <YAxis stroke="#64748b" fontSize={12} />
                            <Tooltip 
                                cursor={{fill: '#1e293b'}}
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                            />
                            <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} name="Violations Detected" />
                        </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Student Inspector Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedStudent(null)}>
            <div 
                className="bg-trade-dark border border-gray-700 w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden" 
                onClick={e => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-700 flex justify-between items-start bg-gray-800">
                    <div className="flex items-center gap-4">
                         <div className="h-12 w-12 bg-gradient-to-br from-trade-accent to-blue-700 rounded-full flex items-center justify-center text-xl font-bold text-white">
                            {selectedStudent.name.charAt(0)}
                         </div>
                         <div>
                            <h2 className="text-2xl font-bold text-white">{selectedStudent.name}</h2>
                            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 text-sm text-gray-400">
                                <div className="flex items-center gap-1"><Mail className="h-3 w-3" /> {selectedStudent.email}</div>
                                <span className="hidden md:inline">•</span>
                                <span className="uppercase text-trade-accent font-bold">{selectedStudent.tier} Member</span>
                            </div>
                         </div>
                    </div>
                    <button onClick={() => setSelectedStudent(null)} className="text-gray-400 hover:text-white bg-gray-700 p-2 rounded-lg">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Key Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                            <span className="text-xs text-gray-400">Win Rate</span>
                            <div className="text-2xl font-bold text-white">{selectedStudent.stats.winRate}%</div>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                            <span className="text-xs text-gray-400">Total P&L</span>
                            <div className={`text-2xl font-bold ${selectedStudent.stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                ${selectedStudent.stats.totalPnL}
                            </div>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                            <span className="text-xs text-gray-400">Trades</span>
                            <div className="text-2xl font-bold text-white">{selectedStudent.stats.tradesCount}</div>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                            <span className="text-xs text-gray-400">Avg R:R</span>
                            <div className="text-2xl font-bold text-white">1:{selectedStudent.stats.avgRiskReward}</div>
                        </div>
                    </div>

                    {/* Recent Journal Entries Table */}
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <BarChart2 className="h-5 w-5 text-gray-400" /> Recent Trades
                    </h3>
                    <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 overflow-x-auto">
                        <table className="w-full text-sm text-left min-w-[600px]">
                            <thead className="bg-gray-900 text-gray-400 font-medium">
                                <tr>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Pair</th>
                                    <th className="p-4">Type</th>
                                    <th className="p-4 text-center">Outcome</th>
                                    <th className="p-4 text-right">P&L</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {selectedStudent.recentTrades.map(trade => (
                                    <tr key={trade.id} className="hover:bg-gray-700/50">
                                        <td className="p-4 text-gray-300">{new Date(trade.date).toLocaleDateString()}</td>
                                        <td className="p-4 font-bold">{trade.pair}</td>
                                        <td className="p-4">
                                            <span className={`flex items-center gap-1 uppercase text-xs font-bold ${trade.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                                                {trade.type === 'buy' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                                {trade.type}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                                trade.status === 'win' ? 'bg-green-500/20 text-green-400' : 
                                                trade.status === 'loss' ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-400'
                                            }`}>
                                                {trade.status}
                                            </span>
                                        </td>
                                        <td className={`p-4 text-right font-bold font-mono ${
                                            trade.pnl && trade.pnl > 0 ? 'text-green-400' : trade.pnl && trade.pnl < 0 ? 'text-red-400' : 'text-gray-400'
                                        }`}>
                                            {trade.pnl ? `$${trade.pnl}` : '-'}
                                        </td>
                                    </tr>
                                ))}
                                {selectedStudent.recentTrades.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-500">No trades recorded yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                {/* Modal Footer */}
                <div className="p-4 border-t border-gray-700 bg-gray-800 flex justify-end gap-3">
                    <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition">
                        Close
                    </button>
                    <button className="px-4 py-2 bg-trade-accent hover:bg-blue-600 text-white rounded-lg font-medium shadow-lg shadow-blue-900/20 flex items-center gap-2">
                        <UserCheck className="h-4 w-4" /> Account Actions
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;
