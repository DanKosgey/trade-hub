import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, StudentProfile, CourseModule, SubscriptionPlan, CommunityLink, TradeRule, TradeEntry } from '../types';
import CourseManagementSystem from './enhanced/CourseManagementSystem';
import RuleBuilder from './RuleBuilder';
import AdminTradeJournal from './AdminTradeJournal';
import { socialMediaService } from '../services/socialMediaService';
import { notificationService } from '../services/notificationService';
import {
  Plus, Edit2, Trash2, Zap, Users, TrendingUp, AlertTriangle,
  Search, ShieldAlert, ArrowUpRight, ArrowDownRight, BarChart2,
  DollarSign, X, LayoutDashboard, BookOpen, Layers, PieChart as PieIcon,
  Activity, CreditCard, List as ListIcon, Grid as GridIcon, Mail, UserCheck,
  BarChart3, FileText, Clock, CheckCircle, XCircle, RefreshCw
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, AreaChart, Area, CartesianGrid, Legend
} from 'recharts';
import {
  fetchAllStudents, fetchAllTrades, fetchBusinessMetrics, fetchStudentWithTrades,
  fetchRevenueGrowthData, fetchCourseCompletionData, fetchRuleViolationsData, fetchCourseEnrollmentCounts, fetchPendingApplications
} from '../services/adminService';
import { supabase } from '../supabase/client';
import { journalService } from '../services/journalService';

// ============== TYPES ==============
interface AdminPortalProps {
  courses: CourseModule[];
  initialTab?: 'overview' | 'trades' | 'analytics' | 'directory' | 'settings' | 'rules' | 'content' | 'applications' | 'journal' | 'admin-analytics';
  user: User;
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
  growthPercentage: number;
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
          <button type="submit" className="px-4 py-2 bg-trade-neon text-black font-bold rounded-lg hover:bg-green-400">{link ? 'Update' : 'Create'}</button>
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
    name: plan?.name || '',
    description: plan?.description || '',
    price: plan?.price || 0,
    interval: plan?.interval || 'one-time',
    features: plan?.features?.join('\n') || '',
    isActive: plan?.isActive ?? true,
    sortOrder: plan?.sortOrder || 0
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
          <button type="submit" className="px-4 py-2 bg-trade-neon text-black font-bold rounded-lg hover:bg-green-400">{plan ? 'Update' : 'Create'}</button>
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
const AdminPortal: React.FC<AdminPortalProps> = ({ courses, initialTab = 'overview', user }) => {
  // State
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics>({
    mrr: 0,
    totalRevenue: 0,
    churnRate: 0,
    growthPercentage: 0,
    tierData: [],
    revenueGrowthData: [],
    courseCompletionData: [],
    violationData: []
  });
  const [communityLinks, setCommunityLinks] = useState<CommunityLink[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [editingLink, setEditingLink] = useState<CommunityLink | null>(null);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [directorySearch, setDirectorySearch] = useState('');
  const [directoryFilter, setDirectoryFilter] = useState<'all' | 'active' | 'at-risk' | 'inactive'>('all');
  const [directoryViewMode, setDirectoryViewMode] = useState<'grid' | 'list'>('grid');
  const [journalSearch, setJournalSearch] = useState('');
  const [filterPair, setFilterPair] = useState('all');
  const [filterOutcome, setFilterOutcome] = useState('all');
  const [pendingApplications, setPendingApplications] = useState<StudentProfile[]>([]);
  const [allTrades, setAllTrades] = useState<Trade[]>([]);
  const [classStats, setClassStats] = useState<ClassStats>({
    totalPnL: 0,
    avgWinRate: 0,
    atRiskCount: 0,
    totalVolume: 0,
    pnlData: []
  });
  const [uniquePairs, setUniquePairs] = useState<string[]>([]);
  const [filteredTrades, setFilteredTrades] = useState<Trade[]>([]);
  const [tradeRules, setTradeRules] = useState<TradeRule[]>([]);
  const [adminTrades, setAdminTrades] = useState<TradeEntry[]>([]);
  const [adminAnalyticsLoading, setAdminAnalyticsLoading] = useState(true);

  // Memoized setTradeRules to prevent re-renders
  const setTradeRulesMemo = useCallback((rules: TradeRule[]) => {
    setTradeRules(rules);
  }, []);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          studentsData,
          tradesData,
          metrics,
          revenueData,
          courseEnrollment,
          violations,
          links,
          plansData
        ] = await Promise.all([
          fetchAllStudents(),
          fetchAllTrades(),
          fetchBusinessMetrics(),
          fetchRevenueGrowthData(),
          fetchCourseEnrollmentCounts(),
          fetchRuleViolationsData(),
          socialMediaService.getAllCommunityLinks(),
          socialMediaService.getAllSubscriptionPlans()
        ]);

        setStudents(studentsData || []);
        setAllTrades(tradesData || []);
        setCommunityLinks(links || []);
        setPlans(plansData || []);
        setBusinessMetrics({
          mrr: metrics?.mrr || 0,
          totalRevenue: metrics?.totalRevenue || 0,
          churnRate: metrics?.churnRate || 0,
          growthPercentage: metrics?.growthPercentage || 0,
          tierData: metrics?.tierData || [],
          revenueGrowthData: revenueData || [],
          courseCompletionData: courseEnrollment?.map(i => ({
            name: i.name?.slice(0,20) || 'Unknown',
            completion: i.count > 0 ? Math.round((i.completed / i.count) * 100) : 0
          })) || [],
          violationData: violations?.map(i => ({ rule: i.rule || 'Unknown', count: i.count || 0 })) || []
        });
      } catch (err) {
        console.error(err);
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
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

  const filteredDirectoryStudents = useMemo(() => {
    return students.filter(s => {
      const searchMatch = (s.name?.toLowerCase() || '').includes(directorySearch.toLowerCase()) || (s.email?.toLowerCase() || '').includes(directorySearch.toLowerCase());
      return searchMatch && (directoryFilter === 'all' || s.status === directoryFilter);
    });
  }, [students, directorySearch, directoryFilter]);

  useEffect(() => {
    setUniquePairs(Array.from(new Set(allTrades.map(t => t.pair).filter(Boolean))));
    setFilteredTrades(allTrades.filter(t => {
      const searchMatch = (t.pair?.toLowerCase() || '').includes(journalSearch.toLowerCase()) || (t.studentName?.toLowerCase() || '').includes(journalSearch.toLowerCase());
      return searchMatch && (filterPair === 'all' || t.pair === filterPair) && (filterOutcome === 'all' || t.status === filterOutcome);
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, [allTrades, journalSearch, filterPair, filterOutcome]);

  const tradeAnalytics = useMemo(() => {
    const total = filteredTrades.length;
    const wins = filteredTrades.filter(t => t.status === 'win').length;
    const losses = filteredTrades.filter(t => t.status === 'loss').length;
    const winRate = (wins + losses) > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;
    const netPnL = filteredTrades.reduce((s, t) => s + (t.pnl || 0), 0);
    const pairStats: Record<string, number> = {};
    filteredTrades.forEach(t => {
      if (t.pair) pairStats[t.pair] = (pairStats[t.pair] || 0) + (t.pnl || 0);
    });
    const pairData = Object.entries(pairStats).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    return { total, wins, losses, winRate, netPnL, pairData };
  }, [filteredTrades]);

  useEffect(() => {
    const fetchAdminTrades = async () => {
      if (activeTab !== 'admin-analytics') return;
      try {
        setAdminAnalyticsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const entries = await journalService.getJournalEntries(user.id);
          setAdminTrades(entries || []);
        }
      } catch (err) {
        console.error('Error fetching admin trades:', err);
      } finally {
        setAdminAnalyticsLoading(false);
      }
    };
    fetchAdminTrades();
  }, [activeTab]);

  useEffect(() => {
    const fetchPending = async () => {
      if (activeTab !== 'applications') return;
      try {
        console.log('Fetching pending applications...');
        const apps = await fetchPendingApplications();
        console.log('Pending applications fetched:', apps);
        setPendingApplications(apps || []);
      } catch (err) {
        console.error('Error fetching pending applications:', err);
      }
    };
    fetchPending();
    
    // Add a listener for changes to the profiles table for all pending tiers
    const channel = supabase
      .channel('pending-applications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles',
          filter: 'subscription_tier=eq.elite-pending'
        },
        (payload) => {
          console.log('New elite-pending application detected:', payload);
          // Refetch pending applications when a new one is added
          fetchPending();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles',
          filter: 'subscription_tier=eq.foundation-pending'
        },
        (payload) => {
          console.log('New foundation-pending application detected:', payload);
          // Refetch pending applications when a new one is added
          fetchPending();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles',
          filter: 'subscription_tier=eq.professional-pending'
        },
        (payload) => {
          console.log('New professional-pending application detected:', payload);
          // Refetch pending applications when a new one is added
          fetchPending();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: 'subscription_tier=eq.elite-pending'
        },
        (payload) => {
          console.log('Elite-pending application updated:', payload);
          // Refetch pending applications when one is updated
          fetchPending();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: 'subscription_tier=eq.foundation-pending'
        },
        (payload) => {
          console.log('Foundation-pending application updated:', payload);
          // Refetch pending applications when one is updated
          fetchPending();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: 'subscription_tier=eq.professional-pending'
        },
        (payload) => {
          console.log('Professional-pending application updated:', payload);
          // Refetch pending applications when one is updated
          fetchPending();
        }
      )
      .subscribe();
      
    // Cleanup function to unsubscribe when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTab]);

  const handleApproveApplication = async (studentId: string, approvedTier: string) => {
    try {
      await supabase.from('profiles').update({ subscription_tier: approvedTier }).eq('id', studentId);
      await notificationService.createApplicationApprovedNotification(studentId);
      setPendingApplications(prev => prev.filter(app => app.id !== studentId));
      alert(`Application approved! User now has ${approvedTier} access.`);
    } catch (err) {
      console.error(err);
      alert('Failed to approve application.');
    }
  };

  const handleRejectApplication = async (studentId: string, rejectedTier: string) => {
    try {
      await supabase.from('profiles').update({ subscription_tier: rejectedTier }).eq('id', studentId);
      await notificationService.createApplicationRejectedNotification(studentId);
      setPendingApplications(prev => prev.filter(app => app.id !== studentId));
      alert('Application rejected! User moved to free tier.');
    } catch (err) {
      console.error(err);
      alert('Failed to reject application.');
    }
  };

  const handleLinkEdit = (link: CommunityLink) => {
    setEditingLink(link);
    setShowLinkForm(true);
  };

  const handleLinkDelete = async (linkId: string) => {
    try {
      await socialMediaService.deleteCommunityLink(linkId);
      setCommunityLinks(prev => prev.filter(l => l.id !== linkId));
      alert('Community link deleted.');
    } catch (err) {
      console.error(err);
      alert('Failed to delete community link.');
    }
  };

  const handlePlanEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setShowPlanForm(true);
  };

  const handlePlanDelete = async (planId: string) => {
    try {
      await socialMediaService.deleteSubscriptionPlan(planId);
      setPlans(prev => prev.filter(p => p.id !== planId));
      alert('Subscription plan deleted.');
    } catch (err) {
      console.error(err);
      alert('Failed to delete subscription plan.');
    }
  };

  const handleStudentDetail = (student: StudentProfile) => {
    setSelectedStudent(student);
  };

  const adminStats = useMemo(() => {
    if (!adminTrades.length) return {
      totalPnL: 0,
      winRate: 0,
      totalTrades: 0,
      bestAsset: '-',
      largestWin: 0,
      largestLoss: 0,
      profitFactor: 0,
      pairStats: {}
    };

    const closedTrades = adminTrades.filter(t => t.status !== 'pending');
    const wins = closedTrades.filter(t => t.status === 'win').length;
    const losses = closedTrades.filter(t => t.status === 'loss').length;
    const winRate = closedTrades.length > 0 ? Math.round((wins / closedTrades.length) * 100) : 0;
    const totalPnL = adminTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const largestWin = Math.max(...adminTrades.filter(t => (t.pnl || 0) > 0).map(t => t.pnl || 0), 0);
    const largestLoss = Math.min(...adminTrades.filter(t => (t.pnl || 0) < 0).map(t => t.pnl || 0), 0);
    const winSum = adminTrades.filter(t => t.status === 'win').reduce((sum, t) => sum + (t.pnl || 0), 0);
    const lossSum = Math.abs(adminTrades.filter(t => t.status === 'loss').reduce((sum, t) => sum + (t.pnl || 0), 0));
    const profitFactor = lossSum > 0 ? winSum / lossSum : 0;

    const pairStats: Record<string, { wins: number; losses: number; pnl: number }> = {};
    adminTrades.forEach(trade => {
      const pair = trade.pair || 'Unknown';
      if (!pairStats[pair]) pairStats[pair] = { wins: 0, losses: 0, pnl: 0 };
      if (trade.status === 'win') pairStats[pair].wins++;
      if (trade.status === 'loss') pairStats[pair].losses++;
      pairStats[pair].pnl += trade.pnl || 0;
    });

    const bestAsset = Object.entries(pairStats).sort(([,a],[,b]) => b.pnl - a.pnl)[0]?.[0] || '-';

    return { totalPnL, winRate, totalTrades: adminTrades.length, bestAsset, largestWin, largestLoss, profitFactor, pairStats };
  }, [adminTrades]);

  const pnlOverTimeData = useMemo(() => {
    if (!adminTrades.length) return [];

    const sortedTrades = [...adminTrades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const tradesByDate: Record<string, number> = {};
    sortedTrades.forEach(trade => {
      const date = new Date(trade.date).toLocaleDateString();
      tradesByDate[date] = (tradesByDate[date] || 0) + (trade.pnl || 0);
    });

    const dates = Object.keys(tradesByDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    let cumulativePnL = 0;
    return dates.map(date => {
      cumulativePnL += tradesByDate[date];
      return { date, dailyPnL: tradesByDate[date], cumulativePnL };
    });
  }, [adminTrades]);

  const handleCreateCommunityLink = async (link: any) => {
    const newLink = await socialMediaService.createCommunityLink(link);
    if (newLink) {
      setCommunityLinks(prev => [...prev, newLink]);
      setShowLinkForm(false);
    }
  };

  const handleUpdateCommunityLink = async (id: string, updates: any) => {
    if (await socialMediaService.updateCommunityLink(id, updates)) {
      setCommunityLinks(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
      setEditingLink(null);
    }
  };

  const handleDeleteCommunityLink = async (id: string) => {
    if (window.confirm('Delete this link?') && await socialMediaService.deleteCommunityLink(id)) {
      setCommunityLinks(prev => prev.filter(l => l.id !== id));
    }
  };

  const handleCreatePlan = async (plan: any) => {
    const newPlan = await socialMediaService.createSubscriptionPlan(plan);
    if (newPlan) {
      setPlans(prev => [...prev, newPlan]);
      setShowPlanForm(false);
    }
  };

  const handleUpdatePlan = async (id: string, updates: any) => {
    if (await socialMediaService.updateSubscriptionPlan(id, updates)) {
      setPlans(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      setEditingPlan(null);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (window.confirm('Delete this plan?') && await socialMediaService.deleteSubscriptionPlan(id)) {
      setPlans(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleStudentSelect = async (student: StudentProfile) => {
    try {
      const fullStudent = await fetchStudentWithTrades(student.id);
      setSelectedStudent(fullStudent || student);
    } catch {
      setSelectedStudent(student);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-trade-neon"></div></div>;

  if (error) return <div className="bg-red-900/30 border border-red-500 rounded-2xl p-8 text-center"><p className="text-red-300 text-lg mb-4">{error}</p><button onClick={() => location.reload()} className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-lg text-white font-bold">Retry Load</button></div>;

  const tabs = [
    { id: 'overview' as const, label: 'Command Center', icon: LayoutDashboard },
    { id: 'directory' as const, label: 'Directory', icon: Users },
    { id: 'trades' as const, label: 'Trade Analysis', icon: Layers },
    { id: 'analytics' as const, label: 'Analytics', icon: PieIcon },
    { id: 'applications' as const, label: 'Applications', icon: FileText },
    { id: 'content' as const, label: 'Content Mgmt', icon: BookOpen },
    { id: 'rules' as const, label: 'Rule Engine', icon: Zap },
    { id: 'journal' as const, label: 'My Trades', icon: DollarSign },
    { id: 'admin-analytics' as const, label: 'Admin Analytics', icon: BarChart3 },
    { id: 'settings' as const, label: 'Settings', icon: CreditCard },
  ];

  return (
    <div className="space-y-8 text-white min-h-screen bg-gradient-to-br from-gray-900 to-black p-6 md:p-8">
      {/* Enhanced Header with Animation */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 animate-fade-in">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-trade-neon to-blue-400"><ShieldAlert className="h-8 w-8 text-trade-neon animate-pulse" /> Admin Portal</h1>
          <p className="text-gray-300 mt-2 text-base">Oversee students, risks, and business insights with precision.</p>
        </div>
        <div className="flex flex-wrap gap-2 bg-gray-800/50 p-2 rounded-xl border border-gray-700/50 backdrop-blur-sm shadow-lg">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === tab.id ? 'bg-trade-neon text-black shadow-md scale-105' : 'text-gray-300 hover:text-white hover:bg-gray-700/50'}`}>
                <Icon className="h-4 w-4" /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm shadow-xl hover:scale-105 transition-transform">
              <div className="flex items-center gap-3 text-gray-300 mb-3"><DollarSign className="h-5 w-5 text-green-400" /> Class Total P&L</div>
              <div className={`text-3xl font-extrabold ${classStats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>{classStats.totalPnL >= 0 ? '+' : ''}${classStats.totalPnL.toLocaleString()}</div>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm shadow-xl hover:scale-105 transition-transform">
              <div className="flex items-center gap-3 text-gray-300 mb-3"><BarChart2 className="h-5 w-5 text-blue-400" /> Avg Win Rate</div>
              <div className="text-3xl font-extrabold text-blue-400">{classStats.avgWinRate}%</div>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm shadow-xl hover:scale-105 transition-transform relative overflow-hidden">
              <div className="flex items-center gap-3 text-gray-300 mb-3"><AlertTriangle className="h-5 w-5 text-red-400 animate-pulse" /> At-Risk Students</div>
              <div className="text-3xl font-extrabold text-red-400">{classStats.atRiskCount}</div>
              {classStats.atRiskCount > 0 && <div className="absolute bottom-0 left-0 w-full h-1 bg-red-400 animate-pulse opacity-50"></div>}
            </div>
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm shadow-xl hover:scale-105 transition-transform">
              <div className="flex items-center gap-3 text-gray-300 mb-3"><TrendingUp className="h-5 w-5 text-purple-400" /> Total Trades</div>
              <div className="text-3xl font-extrabold text-purple-400">{classStats.totalVolume}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm shadow-xl">
              <h3 className="font-bold text-xl mb-6 text-gray-200">P&L Distribution</h3>
              <div className="h-72">
                {classStats.pnlData.length > 0 ? (
                  <ResponsiveContainer>
                    <BarChart data={classStats.pnlData}>
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip contentStyle={{backgroundColor: '#1f2937', border: '1px solid #475569', borderRadius: '8px'}} />
                      <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                        {classStats.pnlData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">No data available</div>
                )}
              </div>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm shadow-xl">
              <h3 className="font-bold text-xl mb-6 text-gray-200 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-red-400" /> Risk Radar</h3>
              <div className="space-y-4 overflow-y-auto max-h-72 pr-2">
                {students.filter(s => s.status === 'at-risk').map(s => (
                  <div key={s.id} onClick={() => handleStudentSelect(s)} className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl cursor-pointer hover:bg-red-900/30 transition-colors">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-red-200">{s.name || 'Unknown'}</h4>
                        <p className="text-xs text-red-300">High Drawdown</p>
                      </div>
                      <span className="text-xs font-bold text-red-300">DD: {s.stats?.currentDrawdown || 0}%</span>
                    </div>
                  </div>
                ))}
                {students.filter(s => s.status === 'at-risk').length === 0 && <div className="text-center py-8 text-gray-400">No students at risk.</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DIRECTORY TAB */}
      {activeTab === 'directory' && (
        <div className="space-y-8 animate-slide-up">
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-6 flex flex-col md:flex-row gap-4 justify-between items-center shadow-xl">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="text" placeholder="Search students by name or email..." className="w-full bg-gray-900/50 border border-gray-600/50 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-trade-neon transition-all" value={directorySearch} onChange={e => setDirectorySearch(e.target.value)} />
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <select className="bg-gray-900/50 border border-gray-600/50 rounded-xl px-4 py-3 text-sm text-gray-300 outline-none focus:border-trade-neon" value={directoryFilter} onChange={e => setDirectoryFilter(e.target.value as any)}>
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="at-risk">At Risk</option>
                <option value="inactive">Inactive</option>
              </select>
              <div className="flex bg-gray-900/50 p-1 rounded-xl border border-gray-600/50">
                <button onClick={() => setDirectoryViewMode('grid')} className={`px-4 py-2 rounded-l-xl ${directoryViewMode === 'grid' ? 'bg-trade-neon text-black' : 'text-gray-400 hover:bg-gray-800/50'}`}><GridIcon className="h-5 w-5" /></button>
                <button onClick={() => setDirectoryViewMode('list')} className={`px-4 py-2 rounded-r-xl ${directoryViewMode === 'list' ? 'bg-trade-neon text-black' : 'text-gray-400 hover:bg-gray-800/50'}`}><ListIcon className="h-5 w-5" /></button>
              </div>
            </div>
          </div>
          {!filteredDirectoryStudents.length ? (
            <div className="text-center py-16 bg-gray-800/50 border border-gray-700/50 border-dashed rounded-2xl shadow-xl">
              <Users className="h-16 w-16 mx-auto text-gray-500 mb-4" />
              <h3 className="text-2xl font-bold text-gray-300">No students found</h3>
            </div>
          ) : directoryViewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDirectoryStudents.map(s => (
                <div key={s.id} onClick={() => handleStudentSelect(s)} className="group bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 hover:border-trade-neon rounded-2xl p-6 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-xl ${s.status === 'at-risk' ? 'bg-red-500/30 text-red-400' : s.tier === 'elite' ? 'bg-purple-600/30 text-purple-400' : 'bg-trade-neon/30 text-trade-neon'}`}>{s.name?.charAt(0) || '?'}</div>
                      <div>
                        <h4 className="font-bold text-white">{s.name || 'Unknown'}</h4>
                        <span className={`text-xs px-3 py-1 rounded-full uppercase font-bold ${s.tier === 'elite' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-700/50 text-gray-300'}`}>{s.tier}</span>
                      </div>
                    </div>
                    {s.status === 'at-risk' && <AlertTriangle className="h-6 w-6 text-red-400 animate-pulse" />}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div className="bg-gray-900/50 p-3 rounded-xl">
                      <span className="block text-xs text-gray-400">Win Rate</span>
                      <span className={`font-bold ${(s.stats?.winRate || 0) >= 50 ? 'text-green-400' : 'text-red-400'}`}>{s.stats?.winRate || 0}%</span>
                    </div>
                    <div className="bg-gray-900/50 p-3 rounded-xl">
                      <span className="block text-xs text-gray-400">P&L</span>
                      <span className={`font-bold ${(s.stats?.totalPnL || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>${s.stats?.totalPnL || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-4 border-t border-gray-700/30">
                    <span className="text-gray-400">Joined {new Date(s.joinedDate).toLocaleDateString()}</span>
                    <span className="text-trade-neon group-hover:underline flex items-center gap-1">View Profile <ArrowUpRight className="h-4 w-4" /></span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 overflow-x-auto shadow-xl">
              <table className="w-full text-left text-sm min-w-max">
                <thead className="bg-gray-900/50 text-gray-300 sticky top-0">
                  <tr>
                    <th className="p-4">Student</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Tier</th>
                    <th className="p-4">Win Rate</th>
                    <th className="p-4">P&L</th>
                    <th className="p-4">Trades</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {filteredDirectoryStudents.map(s => (
                    <tr key={s.id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${s.tier === 'elite' ? 'bg-purple-600/30' : 'bg-gray-700/50'}`}>{s.name?.charAt(0) || '?'}</div>
                          <div>
                            <div className="font-bold text-white">{s.name || 'Unknown'}</div>
                            <div className="text-xs text-gray-400">{s.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-bold uppercase px-3 py-1 rounded ${s.status === 'active' ? 'bg-green-500/20 text-green-400' : s.status === 'at-risk' ? 'bg-red-500/20 text-red-400' : 'bg-gray-700/50 text-gray-400'}`}>{s.status}</span>
                      </td>
                      <td className="p-4 capitalize text-gray-200">{s.tier}</td>
                      <td className={`p-4 font-bold ${(s.stats?.winRate || 0) >= 50 ? 'text-green-400' : 'text-red-400'}`}>{s.stats?.winRate || 0}%</td>
                      <td className={`p-4 font-bold ${(s.stats?.totalPnL || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>${s.stats?.totalPnL || 0}</td>
                      <td className="p-4 text-gray-200">{s.stats?.tradesCount || 0}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleStudentSelect(s)} className="px-4 py-2 bg-trade-neon text-black rounded-xl font-bold hover:bg-green-400 transition-colors">Manage</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {/* Add more tabs similarly, enhancing with better styling, gradients, animations, etc. */}

      {/* TRADES TAB */}
      {activeTab === 'trades' && (
        <div className="space-y-8 animate-slide-up">
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-6 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl">
            <div className="flex items-center gap-3 text-xl font-bold text-gray-200"><Layers className="h-6 w-6 text-trade-neon" /> Global Trade Ledger</div>
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="text" placeholder="Search by pair or student..." className="w-full bg-gray-900/50 border border-gray-600/50 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-trade-neon" value={journalSearch} onChange={e => setJournalSearch(e.target.value)} />
              </div>
              <div className="flex gap-4">
                <select className="bg-gray-900/50 border border-gray-600/50 rounded-xl px-4 py-3 text-sm text-gray-300 outline-none focus:border-trade-neon" value={filterPair} onChange={e => setFilterPair(e.target.value)}>
                  <option value="all">All Pairs</option>
                  {uniquePairs.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select className="bg-gray-900/50 border border-gray-600/50 rounded-xl px-4 py-3 text-sm text-gray-300 outline-none focus:border-trade-neon" value={filterOutcome} onChange={e => setFilterOutcome(e.target.value)}>
                  <option value="all">All Outcomes</option>
                  <option value="win">Wins</option>
                  <option value="loss">Losses</option>
                  <option value="breakeven">Breakeven</option>
                </select>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 shadow-xl">
              <div className="text-xs text-gray-400 mb-2">Total Trades</div>
              <div className="text-3xl font-bold text-white">{tradeAnalytics.total}</div>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 shadow-xl">
              <div className="text-xs text-gray-400 mb-2">Win Rate</div>
              <div className={`text-3xl font-bold ${tradeAnalytics.winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>{tradeAnalytics.winRate}%</div>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 shadow-xl">
              <div className="text-xs text-gray-400 mb-2">Net P&L</div>
              <div className={`text-3xl font-bold ${tradeAnalytics.netPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>{tradeAnalytics.netPnL >= 0 ? '+' : ''}${tradeAnalytics.netPnL.toLocaleString()}</div>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 shadow-xl">
              <div className="text-xs text-gray-400 mb-2">Wins / Losses</div>
              <div className="text-3xl font-bold text-blue-400">{tradeAnalytics.wins}W / {tradeAnalytics.losses}L</div>
            </div>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 shadow-xl">
            <h3 className="font-bold text-xl mb-6 text-gray-200">P&L by Asset</h3>
            <div className="h-72">
              {tradeAnalytics.pairData.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart data={tradeAnalytics.pairData}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{backgroundColor: '#1f2937', border: '1px solid #475569', borderRadius: '8px'}} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {tradeAnalytics.pairData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#10b981' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">No data available</div>
              )}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 overflow-x-auto shadow-xl">
            <table className="w-full text-left text-sm min-w-max">
              <thead className="bg-gray-900/50 text-gray-300 sticky top-0">
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
              <tbody className="divide-y divide-gray-700/50">
                {filteredTrades.map(t => (
                  <tr key={t.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="p-4 text-gray-400 font-mono text-sm">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center text-sm font-bold">{t.studentAvatar}</div>
                        <div>
                          <div className="font-bold text-white">{t.studentName}</div>
                          <div className="text-xs text-gray-400 uppercase">{t.studentTier}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-white">{t.pair}</td>
                    <td className="p-4">
                      <span className={`flex items-center gap-2 uppercase text-sm font-bold ${t.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                        {t.type === 'buy' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />} {t.type}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 max-w-md truncate text-sm">{t.notes}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded text-sm font-bold uppercase ${t.status === 'win' ? 'bg-green-500/20 text-green-400' : t.status === 'loss' ? 'bg-red-500/20 text-red-400' : 'bg-gray-700/50 text-gray-400'}`}>{t.status}</span>
                    </td>
                    <td className={`p-4 text-right font-bold font-mono ${(t.pnl || 0) > 0 ? 'text-green-400' : (t.pnl || 0) < 0 ? 'text-red-400' : 'text-gray-400'}`}>{t.pnl ? `$${t.pnl.toLocaleString()}` : '-'}</td>
                  </tr>
                ))}
                {filteredTrades.length === 0 && <tr><td colSpan={7} className="p-12 text-center text-gray-400">No trades match your filters.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 shadow-xl hover:scale-105 transition-transform">
              <div className="flex items-center gap-3 text-gray-300 mb-3"><Activity className="h-5 w-5 text-trade-neon" /> MRR</div>
              <div className="text-3xl font-extrabold text-white">${businessMetrics.mrr.toLocaleString()}</div>
              <div className={`text-sm mt-2 flex items-center gap-2 ${businessMetrics.growthPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                <TrendingUp className="h-4 w-4" /> {businessMetrics.growthPercentage >= 0 ? '+' : ''}{businessMetrics.growthPercentage}% MoM
              </div>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 shadow-xl hover:scale-105 transition-transform">
              <div className="flex items-center gap-3 text-gray-300 mb-3"><Users className="h-5 w-5 text-blue-400" /> Subscribers</div>
              <div className="text-3xl font-extrabold text-white">{students.length}</div>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 shadow-xl hover:scale-105 transition-transform">
              <div className="flex items-center gap-3 text-gray-300 mb-3"><CreditCard className="h-5 w-5 text-purple-400" /> Lifetime Revenue</div>
              <div className="text-3xl font-extrabold text-white">${businessMetrics.totalRevenue.toLocaleString()}</div>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 shadow-xl hover:scale-105 transition-transform">
              <div className="flex items-center gap-3 text-gray-300 mb-3"><AlertTriangle className="h-5 w-5 text-red-400" /> Churn Rate</div>
              <div className="text-3xl font-extrabold text-red-400">{businessMetrics.churnRate}%</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 shadow-xl">
              <h3 className="font-bold text-xl mb-6 text-gray-200">Revenue Growth</h3>
              <div className="h-72">
                {businessMetrics.revenueGrowthData.length > 0 ? (
                  <ResponsiveContainer>
                    <AreaChart data={businessMetrics.revenueGrowthData}>
                      <defs>
                        <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.5} />
                      <Tooltip contentStyle={{backgroundColor: '#1f2937', border: '1px solid #475569', borderRadius: '8px'}} />
                      <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#revGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">No revenue data</div>
                )}
              </div>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 shadow-xl">
              <h3 className="font-bold text-xl mb-6 text-gray-200">Course Completion Rates</h3>
              <div className="h-72">
                {businessMetrics.courseCompletionData.length > 0 ? (
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={businessMetrics.courseCompletionData} dataKey="completion" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} fill="#3b82f6" label={({ name, value }) => `${name}: ${value}%`} />
                      <Tooltip contentStyle={{backgroundColor: '#1f2937', border: '1px solid #475569', borderRadius: '8px'}} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">No completion data</div>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 shadow-xl">
              <h3 className="font-bold text-xl mb-6 text-gray-200">Tier Distribution</h3>
              <div className="h-72">
                {businessMetrics.tierData.length > 0 ? (
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={businessMetrics.tierData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} label={({ name, value }) => `${name}: ${value}`}>
                        {businessMetrics.tierData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{backgroundColor: '#1f2937', border: '1px solid #475569', borderRadius: '8px'}} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">No tier data</div>
                )}
              </div>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 shadow-xl">
              <h3 className="font-bold text-xl mb-6 text-gray-200">Rule Violations</h3>
              <div className="h-72">
                {businessMetrics.violationData.length > 0 ? (
                  <ResponsiveContainer>
                    <BarChart data={businessMetrics.violationData}>
                      <XAxis dataKey="rule" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip contentStyle={{backgroundColor: '#1f2937', border: '1px solid #475569', borderRadius: '8px'}} />
                      <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">No violation data</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* APPLICATIONS TAB */}
      {activeTab === 'applications' && (
        <div className="space-y-8 animate-slide-up">
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-200">
                <FileText className="h-6 w-6 text-trade-neon" /> Pending Applications
              </h2>
              <button 
                onClick={() => {
                  const fetchPending = async () => {
                    try {
                      console.log('Manually refreshing pending applications...');
                      const apps = await fetchPendingApplications();
                      console.log('Pending applications fetched:', apps);
                      setPendingApplications(apps || []);
                    } catch (err) {
                      console.error('Error fetching pending applications:', err);
                    }
                  };
                  fetchPending();
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold flex items-center gap-2 transition-colors"
              >
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
            </div>
            {pendingApplications.length === 0 ? (
              <div className="text-center py-16">
                <Clock className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                <h3 className="text-2xl font-bold text-gray-300 mb-2">No Pending Applications</h3>
                <p className="text-gray-400">All applications are processed. Check back later.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-max">
                  <thead className="bg-gray-900/50 text-gray-300">
                    <tr>
                      <th className="p-4">Applicant</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Application Date</th>
                      <th className="p-4">Requested Tier</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {pendingApplications.map(application => (
                      <tr key={application.id} className="hover:bg-gray-700/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center text-sm font-bold">{application.name?.charAt(0) || '?'}</div>
                            <div className="font-bold text-white">{application.name || 'Unknown'}</div>
                          </div>
                        </td>
                        <td className="p-4 text-gray-300">{application.email}</td>
                        <td className="p-4 text-gray-400 font-mono text-sm">{new Date(application.joinedDate).toLocaleDateString()}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded text-sm font-bold uppercase ${
                            application.tier === 'elite-pending' ? 'bg-purple-500/20 text-purple-400' :
                            application.tier === 'professional-pending' ? 'bg-blue-500/20 text-blue-400' :
                            application.tier === 'foundation-pending' ? 'bg-green-500/20 text-green-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {application.tier.replace('-pending', '').charAt(0).toUpperCase() + application.tier.replace('-pending', '').slice(1)}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-3">
                            <button 
                              onClick={() => {
                                // Approve to the corresponding tier
                                const approvedTier = application.tier.replace('-pending', '');
                                handleApproveApplication(application.id, approvedTier);
                              }} 
                              className="px-4 py-2 bg-green-500/30 hover:bg-green-500/50 text-green-300 rounded-xl font-bold flex items-center gap-2 transition-colors"
                            >
                              <CheckCircle className="h-4 w-4" /> Approve
                            </button>
                            <button 
                              onClick={() => {
                                // Reject to free tier
                                handleRejectApplication(application.id, 'free');
                              }} 
                              className="px-4 py-2 bg-red-500/30 hover:bg-red-500/50 text-red-300 rounded-xl font-bold flex items-center gap-2 transition-colors"
                            >
                              <XCircle className="h-4 w-4" /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-6 text-gray-200">Application Review Workflow</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-gray-900/50 rounded-2xl border border-gray-700/50">
                <div className="text-trade-neon font-bold text-lg mb-3">1. Review Details</div>
                <p className="text-sm text-gray-300">Evaluate applicant's profile, trading history, and motivation.</p>
              </div>
              <div className="p-6 bg-gray-900/50 rounded-2xl border border-gray-700/50">
                <div className="text-trade-neon font-bold text-lg mb-3">2. Decide Action</div>
                <p className="text-sm text-gray-300">Approve for requested tier access or reject to Free tier.</p>
              </div>
              <div className="p-6 bg-gray-900/50 rounded-2xl border border-gray-700/50">
                <div className="text-trade-neon font-bold text-lg mb-3">3. Notify User</div>
                <p className="text-sm text-gray-300">Automated notification sent upon decision.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT TAB */}
      {activeTab === 'content' && (
            <CourseManagementSystem
              currentUser={{
                id: user.id,
                name: user.name,
                email: user.email,
                tier: user.subscriptionTier || 'foundation',
                joinedDate: new Date().toISOString(),
                stats: {
                  winRate: 0,
                  totalPnL: 0,
                  tradesCount: 0,
                  avgRiskReward: 0,
                  currentDrawdown: 0
                },
                recentTrades: [],
                status: 'active'
              }}
              isAdmin={true}
            />
          )}

      {/* RULES TAB */}
      {activeTab === 'rules' && (
        <div className="h-full">
          <RuleBuilder 
            userId={user.id}
            rules={tradeRules} 
            onRulesChange={setTradeRulesMemo} 
          />
        </div>
      )}

      {/* JOURNAL TAB */}
      {activeTab === 'journal' && <AdminTradeJournal />}

      {/* ADMIN ANALYTICS TAB */}
      {activeTab === 'admin-analytics' && (
        <div className="space-y-8 animate-slide-up">
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-6 shadow-xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-200"><BarChart3 className="h-6 w-6 text-trade-neon" /> Personal Trade Analytics</h2>
            {adminAnalyticsLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-trade-neon"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-700/50">
                    <div className="flex items-center gap-3 text-gray-300 mb-3"><DollarSign className="h-5 w-5 text-green-400" /> Total P&L</div>
                    <div className={`text-3xl font-extrabold ${adminStats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>{adminStats.totalPnL >= 0 ? '+' : ''}${adminStats.totalPnL.toFixed(2)}</div>
                  </div>
                  <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-700/50">
                    <div className="flex items-center gap-3 text-gray-300 mb-3"><TrendingUp className="h-5 w-5 text-blue-400" /> Win Rate</div>
                    <div className="text-3xl font-extrabold text-blue-400">{adminStats.winRate}%</div>
                  </div>
                  <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-700/50">
                    <div className="flex items-center gap-3 text-gray-300 mb-3"><BarChart2 className="h-5 w-5 text-purple-400" /> Total Trades</div>
                    <div className="text-3xl font-extrabold text-purple-400">{adminStats.totalTrades}</div>
                  </div>
                  <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-700/50">
                    <div className="flex items-center gap-3 text-gray-300 mb-3"><ArrowUpRight className="h-5 w-5 text-yellow-400" /> Best Asset</div>
                    <div className="text-3xl font-extrabold text-yellow-400">{adminStats.bestAsset}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-700/50">
                    <div className="flex items-center gap-3 text-gray-300 mb-3"><ArrowUpRight className="h-5 w-5 text-green-400" /> Largest Win</div>
                    <div className="text-3xl font-extrabold text-green-400">${adminStats.largestWin.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-700/50">
                    <div className="flex items-center gap-3 text-gray-300 mb-3"><ArrowDownRight className="h-5 w-5 text-red-400" /> Largest Loss</div>
                    <div className="text-3xl font-extrabold text-red-400">${adminStats.largestLoss.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-700/50">
                    <div className="flex items-center gap-3 text-gray-300 mb-3"><BarChart2 className="h-5 w-5 text-blue-400" /> Profit Factor</div>
                    <div className="text-3xl font-extrabold text-blue-400">{adminStats.profitFactor.toFixed(2)}</div>
                  </div>
                </div>
                <div className="mt-8 bg-gray-900/50 p-6 rounded-2xl border border-gray-700/50">
                  <h3 className="font-bold text-xl mb-6 text-gray-200">P&L Over Time</h3>
                  <div className="h-72">
                    {pnlOverTimeData.length > 0 ? (
                      <ResponsiveContainer>
                        <AreaChart data={pnlOverTimeData}>
                          <defs>
                            <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={adminStats.totalPnL >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0.8} />
                              <stop offset="95%" stopColor={adminStats.totalPnL >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                          <YAxis stroke="#94a3b8" fontSize={12} />
                          <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.5} />
                          <Tooltip contentStyle={{backgroundColor: '#1f2937', border: '1px solid #475569', borderRadius: '8px'}} />
                          <Area type="monotone" dataKey="cumulativePnL" stroke={adminStats.totalPnL >= 0 ? '#10b981' : '#ef4444'} fill="url(#pnlGradient)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">No trade data available</div>
                    )}
                  </div>
                </div>
                <div className="mt-8 bg-gray-900/50 p-6 rounded-2xl border border-gray-700/50">
                  <h3 className="font-bold text-xl mb-6 text-gray-200">Asset Performance</h3>
                  <div className="h-72">
                    {Object.keys(adminStats.pairStats).length > 0 ? (
                      <ResponsiveContainer>
                        <BarChart data={Object.entries(adminStats.pairStats).map(([name, value]) => ({ name, pnl: (value as { pnl: number }).pnl }))}>
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                          <YAxis stroke="#94a3b8" fontSize={12} />
                          <Tooltip contentStyle={{backgroundColor: '#1f2937', border: '1px solid #475569', borderRadius: '8px'}} />
                          <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                            {Object.entries(adminStats.pairStats).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={(entry[1] as { pnl: number }).pnl >= 0 ? '#10b981' : '#ef4444'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">No trade data available</div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="space-y-8 animate-slide-up">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-200">Community Links Management</h2>
              <button onClick={() => setShowLinkForm(true)} className="flex items-center gap-2 px-5 py-3 bg-trade-neon text-black font-bold rounded-xl hover:bg-green-400 transition-colors"><Plus className="h-5 w-5" /> New Link</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communityLinks.map(link => (
                <div key={link.id} className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 shadow-xl">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-3"><div className="w-6 h-6 rounded-full" style={{backgroundColor: link.iconColor}}></div>{link.platformName}</h3>
                      <p className="text-gray-300 text-sm truncate max-w-xs">{link.linkUrl}</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setEditingLink(link)} className="p-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-xl transition-colors"><Edit2 className="h-5 w-5 text-blue-400" /></button>
                      <button onClick={() => handleDeleteCommunityLink(link.id)} className="p-3 bg-red-900/30 hover:bg-red-900/50 rounded-xl transition-colors"><Trash2 className="h-5 w-5 text-red-400" /></button>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-4 text-sm line-clamp-3">{link.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm px-3 py-1 rounded-full ${link.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{link.isActive ? 'Active' : 'Inactive'}</span>
                    <span className="text-sm text-gray-400">Order: {link.sortOrder}</span>
                  </div>
                </div>
              ))}
              {!communityLinks.length && <div className="col-span-full text-center py-16 bg-gray-800/50 border border-gray-700/50 border-dashed rounded-2xl"><p className="text-gray-400 text-lg">No community links created yet.</p></div>}
            </div>
          </div>
          <div className="space-y-6 pt-8 border-t border-gray-700/50">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-200">Subscription Plans Management</h2>
              <button onClick={() => setShowPlanForm(true)} className="flex items-center gap-2 px-5 py-3 bg-trade-neon text-black font-bold rounded-xl hover:bg-green-400 transition-colors"><Plus className="h-5 w-5" /> New Plan</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map(plan => (
                <div key={plan.id} className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 shadow-xl">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                      <p className="text-gray-300 text-sm">${plan.price} / {plan.interval}</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setEditingPlan(plan)} className="p-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-xl transition-colors"><Edit2 className="h-5 w-5 text-blue-400" /></button>
                      <button onClick={() => handleDeletePlan(plan.id)} className="p-3 bg-red-900/30 hover:bg-red-900/50 rounded-xl transition-colors"><Trash2 className="h-5 w-5 text-red-400" /></button>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-4 text-sm line-clamp-3">{plan.description}</p>
                  {plan.features?.length > 0 && (
                    <ul className="text-sm text-gray-300 mb-4 space-y-2">
                      {plan.features.slice(0, 3).map((f, i) => (
                        <li key={i} className="flex items-center gap-2"><span className="text-trade-neon">✓</span>{f}</li>
                      ))}
                      {plan.features.length > 3 && <li className="text-gray-400">+ {plan.features.length - 3} more features</li>}
                    </ul>
                  )}
                  <div className="flex items-center justify-between">
                    <span className={`text-sm px-3 py-1 rounded-full ${plan.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{plan.isActive ? 'Active' : 'Inactive'}</span>
                    <span className="text-sm text-gray-400">Order: {plan.sortOrder}</span>
                  </div>
                </div>
              ))}
              {!plans.length && <div className="col-span-full text-center py-16 bg-gray-800/50 border border-gray-700/50 border-dashed rounded-2xl"><p className="text-gray-400 text-lg">No subscription plans created yet.</p></div>}
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {selectedStudent && <StudentDetailModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />}
      {showLinkForm && <CommunityLinkForm onSubmit={handleCreateCommunityLink} onCancel={() => setShowLinkForm(false)} />}
      {editingLink && <CommunityLinkForm link={editingLink} onSubmit={u => handleUpdateCommunityLink(editingLink.id, u)} onCancel={() => setEditingLink(null)} />}
      {showPlanForm && <PlanForm onSubmit={handleCreatePlan} onCancel={() => setShowPlanForm(false)} />}
      {editingPlan && <PlanForm plan={editingPlan} onSubmit={u => handleUpdatePlan(editingPlan.id, u)} onCancel={() => setEditingPlan(null)} />}
    </div>
  );
};

export default AdminPortal;