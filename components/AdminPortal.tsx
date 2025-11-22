import React, { useState, useEffect, useCallback } from 'react';
import { StudentProfile, CourseModule, SubscriptionPlan, PlanFeature, CommunityLink, TradeRule } from '../types';
import CourseManagementSystem from './enhanced/CourseManagementSystem';
import RuleBuilder from './RuleBuilder';
import { socialMediaService } from '../services/socialMediaService';
import { 
  Plus, Edit2, Trash2, Zap, Users, TrendingUp, AlertTriangle, 
  Search, ShieldAlert, ArrowUpRight, ArrowDownRight, BarChart2, 
  DollarSign, X, LayoutDashboard, BookOpen, Layers, PieChart as PieIcon, 
  Activity, CreditCard, List as ListIcon, Grid as GridIcon, Mail, UserCheck 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  PieChart, Pie, AreaChart, Area, CartesianGrid, Legend 
} from 'recharts';
import { 
  fetchAllStudents, fetchAllTrades, fetchBusinessMetrics, fetchStudentWithTrades,
  fetchRevenueGrowthData, fetchCourseCompletionData, fetchRuleViolationsData, fetchCourseEnrollmentCounts 
} from '../services/adminService';

// ============== TYPES ==============
interface AdminPortalProps {
  courses: CourseModule[];
  initialTab?: 'overview' | 'trades' | 'analytics' | 'directory' | 'settings' | 'rules' | 'content';
}

interface ClassStats {
  totalPnL: number;
  avgWinRate: number;
  atRiskCount: number;
  totalVolume: number;
  pnlData: { name: string; pnl: number; color: string }[];
}

interface BusinessMetrics {
  mrr: number;
  totalRevenue: number;
  churnRate: number;
  tierData: { name: string; value: number; color: string }[];
  revenueGrowthData: { month: string; revenue: number }[];
  courseCompletionData: { name: string; completion: number }[];
  violationData: { rule: string; count: number }[];
}

interface Trade {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  studentTier: string;
  pair: string;
  type: 'buy' | 'sell';
  date: string;
  status: 'win' | 'loss' | 'breakeven';
  pnl: number;
  notes: string;
}

// ============== SUB-COMPONENTS ==============

// Community Link Form Component
const CommunityLinkForm: React.FC<{ 
  link?: CommunityLink;
  onSubmit: (link: Omit<CommunityLink, 'id' | 'createdAt' | 'updatedAt'> | Partial<CommunityLink>) => void;
  onCancel: () => void;
}> = ({ link, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    platformName: link?.platformName || '',
    platformKey: link?.platformKey || '',
    linkUrl: link?.linkUrl || '',
    description: link?.description || '',
    iconColor: link?.iconColor || '#000000',
    isActive: link?.isActive ?? true,
    sortOrder: link?.sortOrder || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-trade-dark border border-gray-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h3 className="font-bold text-lg">{link ? 'Edit Community Link' : 'Create New Community Link'}</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-white"><X className="h-6 w-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4 flex-1 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Platform Name</label>
              <input type="text" value={formData.platformName} onChange={e => setFormData({...formData, platformName: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:border-trade-neon outline-none" required />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Platform Key</label>
              <input type="text" value={formData.platformKey} onChange={e => setFormData({...formData, platformKey: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:border-trade-neon outline-none" required placeholder="e.g., telegram" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Link URL</label>
            <input type="url" value={formData.linkUrl} onChange={e => setFormData({...formData, linkUrl: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:border-trade-neon outline-none" required />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Description</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:border-trade-neon outline-none h-24" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Icon Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={formData.iconColor} onChange={e => setFormData({...formData, iconColor: e.target.value})} className="w-10 h-10 border border-gray-600 rounded bg-gray-700 cursor-pointer" />
                <input type="text" value={formData.iconColor} onChange={e => setFormData({...formData, iconColor: e.target.value})} className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:border-trade-neon outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Sort Order</label>
              <input type="number" value={formData.sortOrder} onChange={e => setFormData({...formData, sortOrder: Number(e.target.value)})} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:border-trade-neon outline-none" required min="0" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="linkIsActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="h-4 w-4" />
            <label htmlFor="linkIsActive" className="text-sm text-gray-300">Active Link</label>
          </div>
        </form>
        <div className="p-4 border-t border-gray-700 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-bold">Cancel</button>
          <button type="submit" onClick={handleSubmit} className="px-4 py-2 bg-trade-neon text-black font-bold rounded-lg hover:bg-green-400">{link ? 'Update' : 'Create'}</button>
        </div>
      </div>
    </div>
  );
};

// Plan Form Component
const PlanForm: React.FC<{ 
  plan?: SubscriptionPlan;
  onSubmit: (plan: Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'> | Partial<SubscriptionPlan>) => void;
  onCancel: () => void;
}> = ({ plan, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: plan?.name || '', description: plan?.description || '', price: plan?.price || 0,
    interval: plan?.interval || 'one-time', features: plan?.features?.join('\n') || '',
    isActive: plan?.isActive ?? true, sortOrder: plan?.sortOrder || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, features: formData.features.split('\n').filter(f => f.trim()), price: Number(formData.price) });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-trade-dark border border-gray-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h3 className="font-bold text-lg">{plan ? 'Edit Plan' : 'Create New Plan'}</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-white"><X className="h-6 w-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4 flex-1 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Plan Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white outline-none" required />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Price ($)</label>
              <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white outline-none" required min="0" step="0.01" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Description</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white outline-none h-24" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Interval</label>
              <select value={formData.interval} onChange={e => setFormData({...formData, interval: e.target.value as 'one-time'|'monthly'|'yearly'})} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white outline-none">
                <option value="one-time">One-time</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Sort Order</label>
              <input type="number" value={formData.sortOrder} onChange={e => setFormData({...formData, sortOrder: Number(e.target.value)})} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white outline-none" required min="0" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Features (one per line)</label>
            <textarea value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white outline-none h-32" placeholder="Enter one feature per line" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="planIsActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="h-4 w-4" />
            <label htmlFor="planIsActive" className="text-sm text-gray-300">Active Plan</label>
          </div>
        </form>
        <div className="p-4 border-t border-gray-700 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-bold">Cancel</button>
          <button type="submit" onClick={handleSubmit} className="px-4 py-2 bg-trade-neon text-black font-bold rounded-lg hover:bg-green-400">{plan ? 'Update' : 'Create'}</button>
        </div>
      </div>
    </div>
  );
};

// Student Detail Modal
const StudentDetailModal: React.FC<{ student: StudentProfile; onClose: () => void; }> = ({ student, onClose }) => (
  <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
    <div className="bg-trade-dark border border-gray-700 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
      <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-xl ${student.status === 'at-risk' ? 'bg-red-500/20 text-red-500' : student.tier === 'elite' ? 'bg-purple-600 text-white' : 'bg-trade-accent/20 text-trade-accent'}`}>
            {student.name?.charAt(0) || '?'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{student.name || 'Unknown'}</h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">{student.email}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${student.status === 'active' ? 'bg-green-500/20 text-green-400' : student.status === 'at-risk' ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-400'}`}>{student.status}</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white p-2"><X className="h-6 w-6" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <span className="text-xs text-gray-400">Win Rate</span>
            <div className={`text-2xl font-bold ${(student.stats?.winRate||0) >= 50 ? 'text-green-400' : 'text-red-400'}`}>{student.stats?.winRate||0}%</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <span className="text-xs text-gray-400">Total P&L</span>
            <div className={`text-2xl font-bold ${(student.stats?.totalPnL||0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>${(student.stats?.totalPnL||0).toLocaleString()}</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <span className="text-xs text-gray-400">Trades</span>
            <div className="text-2xl font-bold text-white">{student.stats?.tradesCount||0}</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <span className="text-xs text-gray-400">Avg R:R</span>
            <div className="text-2xl font-bold text-white">1:{student.stats?.avgRiskReward||0}</div>
          </div>
        </div>
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><BarChart2 className="h-5 w-5 text-gray-400" /> Recent Trades</h3>
        <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[600px]">
            <thead className="bg-gray-900 text-gray-400"><tr><th className="p-4">Date</th><th className="p-4">Pair</th><th className="p-4">Type</th><th className="p-4 text-center">Outcome</th><th className="p-4 text-right">P&L</th></tr></thead>
            <tbody className="divide-y divide-gray-700">
              {student.recentTrades?.length ? student.recentTrades.map(t => (
                <tr key={t.id} className="hover:bg-gray-700/50">
                  <td className="p-4 text-gray-300">{new Date(t.date).toLocaleDateString()}</td>
                  <td className="p-4 font-bold">{t.pair}</td>
                  <td className="p-4"><span className={`flex items-center gap-1 uppercase text-xs font-bold ${t.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>{t.type === 'buy' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}{t.type}</span></td>
                  <td className="p-4 text-center"><span className={`px-2 py-1 rounded text-xs font-bold uppercase ${t.status === 'win' ? 'bg-green-500/20 text-green-400' : t.status === 'loss' ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-400'}`}>{t.status}</span></td>
                  <td className={`p-4 text-right font-bold font-mono ${(t.pnl||0) > 0 ? 'text-green-400' : (t.pnl||0) < 0 ? 'text-red-400' : 'text-gray-400'}`}>{t.pnl ? `$${t.pnl.toLocaleString()}` : '-'}</td>
                </tr>
              )) : <tr><td colSpan={5} className="p-8 text-center text-gray-500">No trades recorded.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <div className="p-4 border-t border-gray-700 bg-gray-800 flex justify-between gap-3">
        <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium flex items-center gap-2"><Mail className="h-4 w-4" /> Message</button>
        <div className="flex gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium">Close</button>
          <button className="px-4 py-2 bg-trade-accent hover:bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2"><UserCheck className="h-4 w-4" /> Actions</button>
        </div>
      </div>
    </div>
  </div>
);

// ============== MAIN COMPONENT ==============
const AdminPortal: React.FC<AdminPortalProps> = ({ courses, initialTab = 'overview' }) => {
  const [activeTab, setActiveTab] = useState<'overview'|'trades'|'analytics'|'directory'|'settings'|'rules'|'content'>(initialTab);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classStats, setClassStats] = useState<ClassStats>({ totalPnL: 0, avgWinRate: 0, atRiskCount: 0, totalVolume: 0, pnlData: [] });
  const [directorySearch, setDirectorySearch] = useState('');
  const [directoryViewMode, setDirectoryViewMode] = useState<'grid'|'list'>('grid');
  const [directoryFilter, setDirectoryFilter] = useState<'all'|'active'|'at-risk'|'inactive'>('all');
  const [journalSearch, setJournalSearch] = useState('');
  const [filterPair, setFilterPair] = useState('all');
  const [filterOutcome, setFilterOutcome] = useState('all');
  const [allTrades, setAllTrades] = useState<Trade[]>([]);
  const [filteredTrades, setFilteredTrades] = useState<Trade[]>([]);
  const [uniquePairs, setUniquePairs] = useState<string[]>([]);
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics>({ mrr: 0, totalRevenue: 0, churnRate: 0, tierData: [], revenueGrowthData: [], courseCompletionData: [], violationData: [] });
  const [communityLinks, setCommunityLinks] = useState<CommunityLink[]>([]);
  const [editingCommunityLink, setEditingCommunityLink] = useState<CommunityLink | null>(null);
  const [showCommunityLinkForm, setShowCommunityLinkForm] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [tradeRules, setTradeRules] = useState<TradeRule[]>([]);

  // Memoize the setTradeRules function to prevent unnecessary re-renders
  const setTradeRulesMemo = useCallback((rules: TradeRule[]) => {
    setTradeRules(rules);
  }, []);

  useEffect(() => { setActiveTab(initialTab); }, [initialTab]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [studentsData, tradesData, metrics, revenueData, courseEnrollment, violations, links, plansData] = await Promise.all([
          fetchAllStudents(), fetchAllTrades(), fetchBusinessMetrics(), fetchRevenueGrowthData(),
          fetchCourseEnrollmentCounts(), fetchRuleViolationsData(), socialMediaService.getAllCommunityLinks(), socialMediaService.getAllSubscriptionPlans()
        ]);
        setStudents(studentsData || []);
        setAllTrades(tradesData || []);
        setCommunityLinks(links || []);
        setPlans(plansData || []);
        setBusinessMetrics({
          mrr: metrics?.mrr || 0, totalRevenue: metrics?.totalRevenue || 0, churnRate: metrics?.churnRate || 0, tierData: metrics?.tierData || [],
          revenueGrowthData: revenueData?.length ? revenueData : [{month:'Jan',revenue:0},{month:'Feb',revenue:0},{month:'Mar',revenue:0}],
          courseCompletionData: courseEnrollment?.length ? courseEnrollment.map(i => ({ name: i.name?.slice(0,20) || 'Unknown', completion: i.count > 0 ? Math.round((i.completed/i.count)*100) : 0 })) : [{name:'No data',completion:0}],
          violationData: violations?.length ? violations.map(i => ({ rule: i.rule || 'Unknown', count: i.count || 0 })) : [{rule:'None',count:0}]
        });
      } catch (err) { console.error(err); setError('Failed to load data.'); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!students.length) return;
    const totalPnL = students.reduce((a, s) => a + (s.stats?.totalPnL || 0), 0);
    const avgWinRate = Math.round(students.reduce((a, s) => a + (s.stats?.winRate || 0), 0) / students.length) || 0;
    const atRiskCount = students.filter(s => s.status === 'at-risk').length;
    const totalVolume = students.reduce((a, s) => a + (s.stats?.tradesCount || 0), 0);
    const pnlData = students.map(s => ({ name: s.name?.split(' ')[0] || '?', pnl: s.stats?.totalPnL || 0, color: (s.stats?.totalPnL || 0) >= 0 ? '#10b981' : '#ef4444' })).sort((a, b) => b.pnl - a.pnl);
    setClassStats({ totalPnL, avgWinRate, atRiskCount, totalVolume, pnlData });
  }, [students]);

  const filteredDirectoryStudents = students.filter(s => {
    const search = (s.name?.toLowerCase().includes(directorySearch.toLowerCase())) || (s.email?.toLowerCase().includes(directorySearch.toLowerCase()));
    return search && (directoryFilter === 'all' || s.status === directoryFilter);
  });

  useEffect(() => {
    setUniquePairs(Array.from(new Set(allTrades.map(t => t.pair).filter(Boolean))));
    setFilteredTrades(allTrades.filter(t => {
      const search = t.pair?.toLowerCase().includes(journalSearch.toLowerCase()) || t.studentName?.toLowerCase().includes(journalSearch.toLowerCase());
      return search && (filterPair === 'all' || t.pair === filterPair) && (filterOutcome === 'all' || t.status === filterOutcome);
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, [allTrades, journalSearch, filterPair, filterOutcome]);

  const tradeAnalytics = (() => {
    const total = filteredTrades.length, wins = filteredTrades.filter(t => t.status === 'win').length, losses = filteredTrades.filter(t => t.status === 'loss').length;
    const winRate = (wins + losses) > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;
    const netPnL = filteredTrades.reduce((s, t) => s + (t.pnl || 0), 0);
    const pairStats: Record<string, number> = {};
    filteredTrades.forEach(t => { if (t.pair) pairStats[t.pair] = (pairStats[t.pair] || 0) + (t.pnl || 0); });
    return { total, wins, losses, winRate, netPnL, pairData: Object.entries(pairStats).map(([n, v]) => ({ name: n, value: v })).sort((a, b) => b.value - a.value) };
  })();

  const handleCreateCommunityLink = async (link: any) => { const n = await socialMediaService.createCommunityLink(link); if (n) { setCommunityLinks(p => [...p, n]); setShowCommunityLinkForm(false); } };
  const handleUpdateCommunityLink = async (id: string, u: any) => { if (await socialMediaService.updateCommunityLink(id, u)) { setCommunityLinks(p => p.map(l => l.id === id ? { ...l, ...u } : l)); setEditingCommunityLink(null); } };
  const handleDeleteCommunityLink = async (id: string) => { if (window.confirm('Delete?') && await socialMediaService.deleteCommunityLink(id)) setCommunityLinks(p => p.filter(l => l.id !== id)); };
  const handleCreatePlan = async (plan: any) => { const n = await socialMediaService.createSubscriptionPlan(plan); if (n) { setPlans(p => [...p, n]); setShowPlanForm(false); } };
  const handleUpdatePlan = async (id: string, u: any) => { if (await socialMediaService.updateSubscriptionPlan(id, u)) { setPlans(p => p.map(l => l.id === id ? { ...l, ...u } : l)); setEditingPlan(null); } };
  const handleDeletePlan = async (id: string) => { if (window.confirm('Delete?') && await socialMediaService.deleteSubscriptionPlan(id)) setPlans(p => p.filter(l => l.id !== id)); };
  const handleStudentSelect = async (student: StudentProfile) => { try { setSelectedStudent(await fetchStudentWithTrades(student.id) || student); } catch { setSelectedStudent(student); } };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-trade-neon"></div></div>;
  if (error) return <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center"><p className="text-red-200">{error}</p><button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white">Retry</button></div>;

  const tabs = [
    { id: 'overview', label: 'Command Center', icon: LayoutDashboard },
    { id: 'directory', label: 'Directory', icon: Users },
    { id: 'trades', label: 'Trade Analysis', icon: Layers },
    { id: 'analytics', label: 'Analytics', icon: PieIcon },
    { id: 'content', label: 'Content Mgmt', icon: BookOpen },
    { id: 'rules', label: 'Rule Engine', icon: Zap },
    { id: 'settings', label: 'Settings', icon: CreditCard },
  ] as const;

  return (
    <div className="space-y-6 md:space-y-8 text-white pb-10">
      {/* Header & Tabs */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3"><ShieldAlert className="h-6 w-6 md:h-8 md:w-8 text-trade-neon" /> Admin Portal</h1>
          <p className="text-gray-400 mt-1 text-sm md:text-base">Manage students, risk, and aggregated data.</p>
        </div>
        <div className="flex flex-wrap gap-2 pb-2 md:pb-0 min-h-[40px] bg-gray-900/50 p-2 rounded-lg border border-gray-700">
          {tabs.map(tab => { const Icon = tab.icon; return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition whitespace-nowrap ${activeTab === tab.id ? 'bg-gray-700 text-white shadow-lg ring-1 ring-gray-600' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
              <Icon className="h-4 w-4" /><span className={activeTab === tab.id ? "underline decoration-trade-neon decoration-2 underline-offset-4" : ""}>{tab.label}</span>
            </button>
          ); })}
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-trade-dark p-5 md:p-6 rounded-xl border border-gray-700">
              <div className="flex items-center gap-2 text-gray-400 mb-2 text-sm"><DollarSign className="h-4 w-4" /> Class Total P&L</div>
              <div className={`text-2xl md:text-3xl font-bold ${classStats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>{classStats.totalPnL >= 0 ? '+' : ''}${classStats.totalPnL.toLocaleString()}</div>
            </div>
            <div className="bg-trade-dark p-5 md:p-6 rounded-xl border border-gray-700">
              <div className="flex items-center gap-2 text-gray-400 mb-2 text-sm"><BarChart2 className="h-4 w-4" /> Avg Win Rate</div>
              <div className="text-2xl md:text-3xl font-bold text-blue-400">{classStats.avgWinRate}%</div>
            </div>
            <div className="bg-trade-dark p-5 md:p-6 rounded-xl border border-gray-700 relative overflow-hidden">
              <div className="flex items-center gap-2 text-gray-400 mb-2 text-sm"><AlertTriangle className="h-4 w-4 text-red-500" /> At-Risk Students</div>
              <div className="text-2xl md:text-3xl font-bold text-red-500">{classStats.atRiskCount}</div>
              {classStats.atRiskCount > 0 && <div className="absolute bottom-0 left-0 w-full h-1 bg-red-500 animate-pulse"></div>}
            </div>
            <div className="bg-trade-dark p-5 md:p-6 rounded-xl border border-gray-700">
              <div className="flex items-center gap-2 text-gray-400 mb-2 text-sm"><TrendingUp className="h-4 w-4" /> Total Trades</div>
              <div className="text-2xl md:text-3xl font-bold text-purple-400">{classStats.totalVolume}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-trade-dark p-6 rounded-xl border border-gray-700">
              <h3 className="font-bold text-lg mb-6">P&L Distribution</h3>
              <div className="h-64 w-full" style={{minHeight: '200px'}}>{classStats.pnlData.length > 0 ? <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}><BarChart data={classStats.pnlData}><XAxis dataKey="name" stroke="#64748b" fontSize={12} /><YAxis stroke="#64748b" fontSize={12} /><Tooltip cursor={{fill:'#1e293b'}} contentStyle={{backgroundColor:'#0f172a',border:'1px solid #334155',borderRadius:'8px'}} /><Bar dataKey="pnl" radius={[4,4,0,0]}>{classStats.pnlData.map((e,i) => <Cell key={i} fill={e.color} />)}</Bar></BarChart></ResponsiveContainer> : <div className="flex items-center justify-center h-full text-gray-500">No data available</div>}</div>
            </div>
            <div className="bg-trade-dark p-6 rounded-xl border border-gray-700 flex flex-col">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>Risk Radar</h3>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 max-h-[250px]">
                {students.filter(s => s.status === 'at-risk').length ? students.filter(s => s.status === 'at-risk').map(s => (
                  <div key={s.id} onClick={() => handleStudentSelect(s)} className="p-3 bg-red-900/10 border border-red-500/30 rounded-lg cursor-pointer hover:bg-red-900/20">
                    <div className="flex justify-between items-start"><div><h4 className="font-bold text-red-200">{s.name || 'Unknown'}</h4><p className="text-xs text-red-400/70">High Drawdown</p></div><span className="text-xs font-mono font-bold text-red-400">DD: {s.stats?.currentDrawdown || 0}%</span></div>
                  </div>
                )) : <div className="text-center py-8 text-gray-500"><ShieldAlert className="h-8 w-8 mx-auto mb-2 opacity-50" />No students flagged.</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DIRECTORY TAB */}
      {activeTab === 'directory' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-trade-dark rounded-xl border border-gray-700 p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-72"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" /><input type="text" placeholder="Search students..." className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-trade-accent" value={directorySearch} onChange={e => setDirectorySearch(e.target.value)} /></div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <select className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none" value={directoryFilter} onChange={e => setDirectoryFilter(e.target.value as any)}><option value="all">All</option><option value="active">Active</option><option value="at-risk">At Risk</option><option value="inactive">Inactive</option></select>
              <div className="flex bg-gray-800 p-1 rounded-lg border border-gray-600">
                <button onClick={() => setDirectoryViewMode('grid')} className={`p-2 rounded ${directoryViewMode === 'grid' ? 'bg-gray-600 text-white' : 'text-gray-400'}`}><GridIcon className="h-4 w-4" /></button>
                <button onClick={() => setDirectoryViewMode('list')} className={`p-2 rounded ${directoryViewMode === 'list' ? 'bg-gray-600 text-white' : 'text-gray-400'}`}><ListIcon className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
          {!filteredDirectoryStudents.length ? <div className="text-center py-16 bg-trade-dark border border-gray-700 border-dashed rounded-xl"><Users className="h-12 w-12 mx-auto text-gray-600 mb-4" /><h3 className="text-lg font-bold text-gray-400">No students found</h3></div>
          : directoryViewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDirectoryStudents.map(s => (
                <div key={s.id} onClick={() => handleStudentSelect(s)} className="group bg-trade-dark hover:bg-gray-800 border border-gray-700 hover:border-trade-accent rounded-xl p-5 cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg ${s.status === 'at-risk' ? 'bg-red-500/20 text-red-500' : s.tier === 'elite' ? 'bg-purple-600 text-white' : 'bg-trade-accent/20 text-trade-accent'}`}>{s.name?.charAt(0) || '?'}</div>
                      <div><h4 className="font-bold text-white">{s.name || 'Unknown'}</h4><span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${s.tier === 'elite' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-700 text-gray-400'}`}>{s.tier}</span></div>
                    </div>
                    {s.status === 'at-risk' && <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                    <div className="bg-gray-900/50 p-2 rounded"><span className="block text-xs text-gray-500">Win Rate</span><span className={`font-bold ${(s.stats?.winRate||0) >= 50 ? 'text-green-400' : 'text-red-400'}`}>{s.stats?.winRate||0}%</span></div>
                    <div className="bg-gray-900/50 p-2 rounded"><span className="block text-xs text-gray-500">P&L</span><span className={`font-bold ${(s.stats?.totalPnL||0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>${s.stats?.totalPnL||0}</span></div>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-700/50"><span className="text-gray-500">Joined {new Date(s.joinedDate).toLocaleDateString()}</span><span className="text-trade-accent group-hover:underline flex items-center gap-1">View <ArrowUpRight className="h-3 w-3" /></span></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-trade-dark rounded-xl border border-gray-700 overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[800px]">
                <thead className="bg-gray-800 text-gray-400"><tr><th className="p-4">Student</th><th className="p-4">Status</th><th className="p-4">Tier</th><th className="p-4">Win Rate</th><th className="p-4">P&L</th><th className="p-4">Trades</th><th className="p-4 text-right">Actions</th></tr></thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredDirectoryStudents.map(s => (
                    <tr key={s.id} className="hover:bg-gray-800/50">
                      <td className="p-4"><div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${s.tier === 'elite' ? 'bg-purple-600 text-white' : 'bg-gray-700'}`}>{s.name?.charAt(0)||'?'}</div><div><div className="font-bold">{s.name||'Unknown'}</div><div className="text-xs text-gray-500">{s.email}</div></div></div></td>
                      <td className="p-4"><span className={`text-xs font-bold uppercase px-2 py-1 rounded ${s.status === 'active' ? 'bg-green-500/10 text-green-400' : s.status === 'at-risk' ? 'bg-red-500/10 text-red-400' : 'bg-gray-700 text-gray-400'}`}>{s.status}</span></td>
                      <td className="p-4 capitalize text-gray-300">{s.tier}</td>
                      <td className={`p-4 font-bold ${(s.stats?.winRate||0) >= 50 ? 'text-green-400' : 'text-red-400'}`}>{s.stats?.winRate||0}%</td>
                      <td className={`p-4 font-bold ${(s.stats?.totalPnL||0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>${s.stats?.totalPnL||0}</td>
                      <td className="p-4 text-gray-300">{s.stats?.tradesCount||0}</td>
                      <td className="p-4 text-right"><button onClick={() => handleStudentSelect(s)} className="px-3 py-1.5 bg-gray-700 hover:bg-trade-accent rounded-lg text-xs font-bold">Manage</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TRADES TAB */}
      {activeTab === 'trades' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-trade-dark rounded-xl border border-gray-700 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-bold"><BookOpen className="h-5 w-5 text-trade-accent" /> Global Ledger</div>
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" /><input type="text" placeholder="Search..." className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-9 pr-4 py-2 text-sm outline-none" value={journalSearch} onChange={e => setJournalSearch(e.target.value)} /></div>
              <div className="flex gap-2">
                <select className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none" value={filterPair} onChange={e => setFilterPair(e.target.value)}><option value="all">All Pairs</option>{uniquePairs.map(p => <option key={p} value={p}>{p}</option>)}</select>
                <select className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none" value={filterOutcome} onChange={e => setFilterOutcome(e.target.value)}><option value="all">All</option><option value="win">Wins</option><option value="loss">Losses</option><option value="breakeven">BE</option></select>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-trade-dark p-4 rounded-xl border border-gray-700"><div className="text-xs text-gray-400 mb-1">Trades</div><div className="text-2xl font-bold">{tradeAnalytics.total}</div></div>
            <div className="bg-trade-dark p-4 rounded-xl border border-gray-700"><div className="text-xs text-gray-400 mb-1">Win Rate</div><div className={`text-2xl font-bold ${tradeAnalytics.winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>{tradeAnalytics.winRate}%</div></div>
            <div className="bg-trade-dark p-4 rounded-xl border border-gray-700"><div className="text-xs text-gray-400 mb-1">Net P&L</div><div className={`text-2xl font-bold ${tradeAnalytics.netPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>{tradeAnalytics.netPnL >= 0 ? '+' : ''}${tradeAnalytics.netPnL.toLocaleString()}</div></div>
            <div className="bg-trade-dark p-4 rounded-xl border border-gray-700"><div className="text-xs text-gray-400 mb-1">W/L</div><div className="text-2xl font-bold text-blue-400">{tradeAnalytics.wins}W / {tradeAnalytics.losses}L</div></div>
          </div>
          <div className="bg-trade-dark p-6 rounded-xl border border-gray-700">
            <h3 className="font-bold text-lg mb-6">P&L by Asset</h3>
            <div className="h-64" style={{minHeight: '200px'}}>{tradeAnalytics.pairData.length > 0 ? <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}><BarChart data={tradeAnalytics.pairData}><XAxis dataKey="name" stroke="#64748b" fontSize={12} /><YAxis stroke="#64748b" fontSize={12} /><Tooltip cursor={{fill:'#1e293b'}} contentStyle={{backgroundColor:'#0f172a',border:'1px solid #334155',borderRadius:'8px'}} /><Bar dataKey="value" name="P&L" radius={[4,4,0,0]}>{tradeAnalytics.pairData.map((e,i) => <Cell key={i} fill={e.value >= 0 ? '#10b981' : '#ef4444'} />)}</Bar></BarChart></ResponsiveContainer> : <div className="flex items-center justify-center h-full text-gray-500">No data available</div>}</div>
          </div>
          <div className="bg-trade-dark rounded-xl border border-gray-700 overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[800px]">
              <thead className="bg-gray-800 text-gray-400"><tr><th className="p-4">Date</th><th className="p-4">Student</th><th className="p-4">Pair</th><th className="p-4">Type</th><th className="p-4">Notes</th><th className="p-4 text-center">Result</th><th className="p-4 text-right">P&L</th></tr></thead>
              <tbody className="divide-y divide-gray-700">
                {filteredTrades.length ? filteredTrades.map((t,i) => (
                  <tr key={`${t.id}-${i}`} className="hover:bg-gray-800/50">
                    <td className="p-4 text-gray-400 font-mono text-xs">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="p-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">{t.studentAvatar}</div><div><div className="font-bold text-white">{t.studentName}</div><div className="text-[10px] text-gray-500 uppercase">{t.studentTier}</div></div></div></td>
                    <td className="p-4 font-bold text-white">{t.pair}</td>
                    <td className="p-4"><span className={`flex items-center gap-1 uppercase text-xs font-bold ${t.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>{t.type === 'buy' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}{t.type}</span></td>
                    <td className="p-4 text-gray-400 max-w-xs truncate text-xs">{t.notes}</td>
                    <td className="p-4 text-center"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${t.status === 'win' ? 'bg-green-500/20 text-green-400' : t.status === 'loss' ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-400'}`}>{t.status}</span></td>
                    <td className={`p-4 text-right font-bold font-mono ${(t.pnl||0) > 0 ? 'text-green-400' : (t.pnl||0) < 0 ? 'text-red-400' : 'text-gray-500'}`}>{t.pnl ? (t.pnl > 0 ? `+${t.pnl}` : `${t.pnl}`) : '-'}</td>
                  </tr>
                )) : <tr><td colSpan={7} className="p-12 text-center text-gray-500">No trades match filters.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-trade-dark p-6 rounded-xl border border-gray-700">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Activity className="h-4 w-4 text-trade-neon" /> MRR
              </div>
              <div className="text-3xl font-bold text-white">${businessMetrics.mrr.toLocaleString()}</div>
              <div className="text-xs text-green-400 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +{Math.max(0, Math.min(100, Math.round((businessMetrics.mrr / Math.max(1, businessMetrics.totalRevenue - businessMetrics.mrr)) * 100)))}%
              </div>
            </div>
            <div className="bg-trade-dark p-6 rounded-xl border border-gray-700">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Users className="h-4 w-4" /> Subscribers
              </div>
              <div className="text-3xl font-bold text-white">{students.length}</div>
            </div>
            <div className="bg-trade-dark p-6 rounded-xl border border-gray-700">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <CreditCard className="h-4 w-4" /> Lifetime Revenue
              </div>
              <div className="text-3xl font-bold text-white">${businessMetrics.totalRevenue.toLocaleString()}</div>
            </div>
            <div className="bg-trade-dark p-6 rounded-xl border border-gray-700">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <ArrowDownRight className="h-4 w-4 text-red-500" /> Churn
              </div>
              <div className="text-3xl font-bold text-red-400">{businessMetrics.churnRate.toFixed(1)}%</div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-trade-dark p-6 rounded-xl border border-gray-700">
              <h3 className="font-bold text-lg mb-6">Revenue Trajectory</h3>
              <div className="h-64" style={{minHeight: '200px'}}>{businessMetrics.revenueGrowthData.length ? <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}><AreaChart data={businessMetrics.revenueGrowthData}><defs><linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00ff94" stopOpacity={0.3}/><stop offset="95%" stopColor="#00ff94" stopOpacity={0}/></linearGradient></defs><XAxis dataKey="month" stroke="#64748b" fontSize={12} /><YAxis stroke="#64748b" fontSize={12} /><CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} /><Tooltip contentStyle={{backgroundColor:'#0f172a',border:'1px solid #334155',borderRadius:'8px'}} /><Area type="monotone" dataKey="revenue" stroke="#00ff94" fillOpacity={1} fill="url(#colorRev)" /></AreaChart></ResponsiveContainer> : <div className="flex items-center justify-center h-full text-gray-500">No data</div>}</div>
            </div>
            <div className="bg-trade-dark p-6 rounded-xl border border-gray-700">
              <h3 className="font-bold text-lg mb-6">Student Tiers</h3>
              <div className="h-64" style={{minHeight: '200px'}}>{businessMetrics.tierData.length ? <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}><PieChart><Pie data={businessMetrics.tierData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{businessMetrics.tierData.map((e,i) => <Cell key={i} fill={e.color} stroke="none" />)}</Pie><Tooltip contentStyle={{backgroundColor:'#0f172a',border:'1px solid #334155',borderRadius:'8px'}} /><Legend verticalAlign="bottom" height={36} /></PieChart></ResponsiveContainer> : <div className="flex items-center justify-center h-full text-gray-500">No data</div>}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-trade-dark p-6 rounded-xl border border-gray-700">
              <h3 className="font-bold text-lg mb-6">Course Completion</h3>
              <div className="h-64" style={{minHeight: '200px'}}>{businessMetrics.courseCompletionData.length ? <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}><BarChart layout="vertical" data={businessMetrics.courseCompletionData}><XAxis type="number" stroke="#64748b" fontSize={12} /><YAxis dataKey="name" type="category" width={120} stroke="#64748b" fontSize={11} /><Tooltip cursor={{fill:'#1e293b'}} contentStyle={{backgroundColor:'#0f172a',border:'1px solid #334155',borderRadius:'8px'}} /><Bar dataKey="completion" fill="#3b82f6" radius={[0,4,4,0]} barSize={20} name="% Complete" /></BarChart></ResponsiveContainer> : <div className="flex items-center justify-center h-full text-gray-500">No data</div>}</div>
            </div>
            <div className="bg-trade-dark p-6 rounded-xl border border-gray-700">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-red-400" /> Rule Violations</h3>
              <div className="h-64" style={{minHeight: '200px'}}>{businessMetrics.violationData.length ? <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}><BarChart data={businessMetrics.violationData}><XAxis dataKey="rule" stroke="#64748b" fontSize={10} /><YAxis stroke="#64748b" fontSize={12} /><Tooltip cursor={{fill:'#1e293b'}} contentStyle={{backgroundColor:'#0f172a',border:'1px solid #334155',borderRadius:'8px'}} /><Bar dataKey="count" fill="#ef4444" radius={[4,4,0,0]} name="Violations" /></BarChart></ResponsiveContainer> : <div className="flex items-center justify-center h-full text-gray-500">No data</div>}</div>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT TAB */}
      {activeTab === 'content' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CourseManagementSystem currentUser={{ id: '00000000-0000-0000-0000-000000000000', name: 'Admin', email: 'admin@example.com', tier: 'elite', joinedDate: new Date().toISOString(), stats: { winRate: 0, totalPnL: 0, tradesCount: 0, avgRiskReward: 0, currentDrawdown: 0 }, recentTrades: [], status: 'active' }} isAdmin={true} />
        </div>
      )}

      {/* RULES TAB */}
      {activeTab === 'rules' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <RuleBuilder 
            userId="00000000-0000-0000-0000-000000000000" 
            rules={tradeRules} 
            onRulesChange={setTradeRulesMemo} 
          />
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Community Links */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Community Links</h2>
              <button onClick={() => setShowCommunityLinkForm(true)} className="flex items-center gap-2 px-4 py-2 bg-trade-neon text-black font-bold rounded-lg hover:bg-green-400"><Plus className="h-4 w-4" /> Add Link</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communityLinks.map(link => (
                <div key={link.id} className="bg-trade-dark border border-gray-700 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div><h3 className="text-xl font-bold flex items-center gap-2"><div className="w-4 h-4 rounded-full" style={{backgroundColor: link.iconColor}}></div>{link.platformName}</h3><p className="text-gray-400 text-sm truncate max-w-[200px]">{link.linkUrl}</p></div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingCommunityLink(link)} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => handleDeleteCommunityLink(link.id)} className="p-2 bg-red-900/50 hover:bg-red-900/70 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-4 text-sm line-clamp-2">{link.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm px-2 py-1 rounded-full ${link.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{link.isActive ? 'Active' : 'Inactive'}</span>
                    <span className="text-sm text-gray-500">Order: {link.sortOrder}</span>
                  </div>
                </div>
              ))}
              {!communityLinks.length && <div className="col-span-full text-center py-12 bg-trade-dark border border-gray-700 border-dashed rounded-xl"><p className="text-gray-500">No community links yet.</p></div>}
            </div>
          </div>
          {/* Subscription Plans */}
          <div className="space-y-6 pt-8 border-t border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Subscription Plans</h2>
              <button onClick={() => setShowPlanForm(true)} className="flex items-center gap-2 px-4 py-2 bg-trade-neon text-black font-bold rounded-lg hover:bg-green-400"><Plus className="h-4 w-4" /> Add Plan</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map(plan => (
                <div key={plan.id} className="bg-trade-dark border border-gray-700 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div><h3 className="text-xl font-bold">{plan.name}</h3><p className="text-gray-400 text-sm">${plan.price} ({plan.interval})</p></div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingPlan(plan)} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => handleDeletePlan(plan.id)} className="p-2 bg-red-900/50 hover:bg-red-900/70 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-4 text-sm line-clamp-2">{plan.description}</p>
                  {plan.features?.length > 0 && <ul className="text-xs text-gray-400 mb-4 space-y-1">{plan.features.slice(0,3).map((f,i) => <li key={i} className="flex items-center gap-2"><span className="text-trade-neon">✓</span>{f}</li>)}{plan.features.length > 3 && <li className="text-gray-500">+{plan.features.length - 3} more</li>}</ul>}
                  <div className="flex items-center justify-between">
                    <span className={`text-sm px-2 py-1 rounded-full ${plan.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{plan.isActive ? 'Active' : 'Inactive'}</span>
                    <span className="text-sm text-gray-500">Order: {plan.sortOrder}</span>
                  </div>
                </div>
              ))}
              {!plans.length && <div className="col-span-full text-center py-12 bg-trade-dark border border-gray-700 border-dashed rounded-xl"><p className="text-gray-500">No plans yet.</p></div>}
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {selectedStudent && <StudentDetailModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />}
      {showCommunityLinkForm && <CommunityLinkForm onSubmit={handleCreateCommunityLink} onCancel={() => setShowCommunityLinkForm(false)} />}
      {editingCommunityLink && <CommunityLinkForm link={editingCommunityLink} onSubmit={u => handleUpdateCommunityLink(editingCommunityLink.id, u)} onCancel={() => setEditingCommunityLink(null)} />}
      {showPlanForm && <PlanForm onSubmit={handleCreatePlan} onCancel={() => setShowPlanForm(false)} />}
      {editingPlan && <PlanForm plan={editingPlan} onSubmit={u => handleUpdatePlan(editingPlan.id, u)} onCancel={() => setEditingPlan(null)} />}
    </div>
  );
};

export default AdminPortal;