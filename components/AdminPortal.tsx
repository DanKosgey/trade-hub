import React, { useState, useEffect } from 'react';
import { StudentProfile, CourseModule, SubscriptionPlan, PlanFeature, CommunityLink, TradeRule } from '../types';
import CourseManagementSystem from './enhanced/CourseManagementSystem';
import RuleBuilder from './RuleBuilder';
import { socialMediaService } from '../services/socialMediaService';
import { Plus, Edit2, Trash2, Save, Zap } from 'lucide-react';
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
import { 
  fetchAllStudents, 
  fetchAllTrades, 
  fetchBusinessMetrics, 
  fetchStudentWithTrades,
  fetchComprehensiveAnalytics,
  fetchRevenueGrowthData,
  fetchCourseCompletionData,
  fetchRuleViolationsData
} from '../services/adminService';

interface AdminPortalProps {
  courses: CourseModule[];
  initialTab?: 'overview' | 'trades' | 'analytics' | 'directory' | 'settings' | 'rules';
}

const AdminPortal: React.FC<AdminPortalProps> = ({ courses, initialTab = 'overview' }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'trades' | 'analytics' | 'directory' | 'settings' | 'rules'>(initialTab);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  
  // Data state
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // --- Overview State ---
  const [classStats, setClassStats] = useState({
    totalPnL: 0,
    avgWinRate: 0,
    atRiskCount: 0,
    totalVolume: 0,
    pnlData: [] as { name: string; pnl: number; color: string }[]
  });

  // --- Student Directory State ---
  const [directorySearch, setDirectorySearch] = useState('');
  const [directoryViewMode, setDirectoryViewMode] = useState<'grid' | 'list'>('grid');
  const [directoryFilter, setDirectoryFilter] = useState<'all' | 'active' | 'at-risk' | 'inactive'>('all');

  // --- Trade Journal State ---
  const [journalSearch, setJournalSearch] = useState('');
  const [filterPair, setFilterPair] = useState('all');
  const [filterOutcome, setFilterOutcome] = useState('all');
  const [allTrades, setAllTrades] = useState<any[]>([]);
  const [filteredTrades, setFilteredTrades] = useState<any[]>([]);
  const [uniquePairs, setUniquePairs] = useState<string[]>([]);

  // --- Business Analytics ---
  const [businessMetrics, setBusinessMetrics] = useState({
    mrr: 0,
    totalRevenue: 0,
    churnRate: 0,
    tierData: [] as { name: string; value: number; color: string }[],
    revenueGrowthData: [] as { month: string; revenue: number }[],
    courseCompletionData: [] as { name: string; completion: number }[],
    violationData: [] as { rule: string; count: number }[]
  });

  // --- Community Links ---
  const [communityLinks, setCommunityLinks] = useState<CommunityLink[]>([]);
  const [editingCommunityLink, setEditingCommunityLink] = useState<CommunityLink | null>(null);
  const [showCommunityLinkForm, setShowCommunityLinkForm] = useState(false);

  // --- Trade Rules ---
  const [tradeRules, setTradeRules] = useState<TradeRule[]>([
    { id: '1', text: 'Has price taken liquidity from previous day low?', type: 'buy', required: true },
    { id: '2', text: 'Is there an unmitigated Fair Value Gap below current price?', type: 'buy', required: true },
    { id: '3', text: 'Has market structure broken to the upside (MSS)?', type: 'buy', required: true },
    { id: '4', text: 'Is your risk-to-reward ratio at least 1:2?', type: 'buy', required: true },
    { id: '5', text: 'Has price taken liquidity from previous day high?', type: 'sell', required: true },
    { id: '6', text: 'Is there an unmitigated Fair Value Gap above current price?', type: 'sell', required: true },
  ]);

  // Sync initialTab prop changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Fetch data when component mounts or tab changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      console.log('Fetching data for AdminPortal...');
      
      try {
        // Fetch all students
        console.log('Fetching all students...');
        const studentData = await fetchAllStudents();
        console.log('Students data:', studentData);
        setStudents(studentData);
        
        // Fetch all trades
        console.log('Fetching all trades...');
        const tradeData = await fetchAllTrades();
        console.log('Trades data:', tradeData);
        setAllTrades(tradeData);
        
        // Fetch business metrics
        console.log('Fetching business metrics...');
        const metrics = await fetchBusinessMetrics();
        console.log('Business metrics:', metrics);
        
        // Fetch analytics data
        console.log('Fetching analytics data...');
        const revenueGrowthData = await fetchRevenueGrowthData();
        console.log('Revenue growth data:', revenueGrowthData);
        
        const courseCompletionData = await fetchCourseCompletionData();
        console.log('Course completion data:', courseCompletionData);
        
        const violationData = await fetchRuleViolationsData();
        console.log('Violation data:', violationData);
        
        // Fetch community links
        console.log('Fetching community links...');
        const communityLinksData = await socialMediaService.getAllCommunityLinks();
        console.log('Community links data:', communityLinksData);
        setCommunityLinks(communityLinksData);
        
        const processedMetrics = {
          ...metrics,
          revenueGrowthData: revenueGrowthData && revenueGrowthData.length > 0 
            ? revenueGrowthData 
            : [
                { month: 'Jan 2023', revenue: 0 },
                { month: 'Feb 2023', revenue: 0 },
                { month: 'Mar 2023', revenue: 0 },
                { month: 'Apr 2023', revenue: 0 },
                { month: 'May 2023', revenue: 0 },
                { month: 'Jun 2023', revenue: 0 }
              ],
          courseCompletionData: courseCompletionData && courseCompletionData.length > 0
            ? courseCompletionData.map(item => ({
                name: item.name && item.name.length > 20 ? item.name.substring(0, 20) + '...' : (item.name || 'Unknown Module'),
                completion: item.completion || 0
              }))
            : [
                { name: 'No data available', completion: 0 }
              ],
          violationData: violationData && violationData.length > 0
            ? violationData.map(item => ({
                rule: item.rule || 'Unknown Rule',
                count: item.count || 0
              }))
            : [
                { rule: 'No violations recorded', count: 0 }
              ]
        };
        
        console.log('Processed business metrics:', processedMetrics);
        setBusinessMetrics(processedMetrics);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update class stats when students change
  useEffect(() => {
    const totalPnL = students.reduce((acc, s) => acc + s.stats.totalPnL, 0);
    const avgWinRate = Math.round(students.reduce((acc, s) => acc + s.stats.winRate, 0) / (students.length || 1)) || 0;
    const atRiskCount = students.filter(s => s.status === 'at-risk').length;
    const totalVolume = students.reduce((acc, s) => acc + s.stats.tradesCount, 0);

    // Chart Data: P&L Distribution
    const pnlData = students.map(s => ({
      name: s.name ? s.name.split(' ')[0] : 'Unknown',
      pnl: s.stats.totalPnL,
      color: s.stats.totalPnL >= 0 ? '#10b981' : '#ef4444'
    })).sort((a, b) => b.pnl - a.pnl);

    setClassStats({ totalPnL, avgWinRate, atRiskCount, totalVolume, pnlData });
  }, [students]);

  // Update filtered students for directory
  const filteredDirectoryStudents = students.filter(s => {
    const matchesSearch = (s.name && s.name.toLowerCase().includes(directorySearch.toLowerCase())) || 
                         (s.email && s.email.toLowerCase().includes(directorySearch.toLowerCase()));
    const matchesFilter = directoryFilter === 'all' || s.status === directoryFilter;
    return matchesSearch && matchesFilter;
  });

  // Update unique pairs and filtered trades when trades change
  useEffect(() => {
    // Get unique pairs
    const pairs = Array.from(new Set(allTrades.map(t => t.pair)));
    setUniquePairs(pairs);
    
    // Filter trades
    const filtered = allTrades.filter(t => {
      const matchesSearch = 
        (t.pair && t.pair.toLowerCase().includes(journalSearch.toLowerCase())) ||
        (t.studentName && t.studentName.toLowerCase().includes(journalSearch.toLowerCase())) ||
        (t.notes && t.notes.toLowerCase().includes(journalSearch.toLowerCase()));
      
      const matchesPair = filterPair === 'all' || (t.pair && t.pair === filterPair);
      const matchesOutcome = filterOutcome === 'all' || (t.status && t.status === filterOutcome);

      return matchesSearch && matchesPair && matchesOutcome;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setFilteredTrades(filtered);
  }, [allTrades, journalSearch, filterPair, filterOutcome]);

  // Community Links Settings Component
  const CommunityLinksSettings: React.FC = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Community Links Management</h2>
          <button 
            onClick={() => setShowCommunityLinkForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-trade-neon text-black font-bold rounded-lg hover:bg-green-400 transition"
          >
            <Plus className="h-4 w-4" /> Add New Link
          </button>
        </div>

        {/* Community Link Form Modal */}
        {showCommunityLinkForm && (
          <CommunityLinkForm 
            onSubmit={handleCreateCommunityLink}
            onCancel={() => setShowCommunityLinkForm(false)}
          />
        )}

        {/* Edit Community Link Form Modal */}
        {editingCommunityLink && (
          <CommunityLinkForm 
            link={editingCommunityLink}
            onSubmit={(updates) => handleUpdateCommunityLink(editingCommunityLink.id, updates)}
            onCancel={() => setEditingCommunityLink(null)}
          />
        )}

        {/* Community Links List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communityLinks.map(link => (
            <div key={link.id} className="bg-trade-dark border border-gray-700 rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: link.iconColor }}></div>
                    {link.platformName}
                  </h3>
                  <p className="text-gray-400 text-sm">{link.linkUrl}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setEditingCommunityLink(link)}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteCommunityLink(link.id)}
                    className="p-2 bg-red-900/50 hover:bg-red-900/70 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-gray-300 mb-4">{link.description}</p>
              
              <div className="flex items-center justify-between">
                <span className={`text-sm px-2 py-1 rounded-full ${link.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {link.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="text-sm text-gray-500">Order: {link.sortOrder}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

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
      isActive: link?.isActive !== undefined ? link.isActive : true,
      sortOrder: link?.sortOrder || 0
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const linkData = {
        ...formData
      };
      onSubmit(linkData);
    };

    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
        <div 
          className="bg-trade-dark border border-gray-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h3 className="font-bold text-lg">{link ? 'Edit Community Link' : 'Create New Community Link'}</h3>
            <button 
              onClick={onCancel}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-4 space-y-4 flex-1 overflow-y-auto max-h-[70vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Platform Name</label>
                <input
                  type="text"
                  value={formData.platformName}
                  onChange={e => setFormData({...formData, platformName: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:border-trade-neon outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Platform Key</label>
                <input
                  type="text"
                  value={formData.platformKey}
                  onChange={e => setFormData({...formData, platformKey: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:border-trade-neon outline-none"
                  required
                  placeholder="e.g., telegram, whatsapp, tiktok"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Link URL</label>
              <input
                type="url"
                value={formData.linkUrl}
                onChange={e => setFormData({...formData, linkUrl: e.target.value})}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:border-trade-neon outline-none"
                required
                placeholder="https://example.com/community"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Description</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:border-trade-neon outline-none h-24"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Icon Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.iconColor}
                    onChange={e => setFormData({...formData, iconColor: e.target.value})}
                    className="w-10 h-10 border border-gray-600 rounded bg-gray-700"
                  />
                  <input
                    type="text"
                    value={formData.iconColor}
                    onChange={e => setFormData({...formData, iconColor: e.target.value})}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:border-trade-neon outline-none"
                    placeholder="#000000"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Sort Order</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={e => setFormData({...formData, sortOrder: Number(e.target.value)})}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:border-trade-neon outline-none"
                  required
                  min="0"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={e => setFormData({...formData, isActive: e.target.checked})}
                className="h-4 w-4 text-trade-neon focus:ring-trade-neon border-gray-600 rounded bg-gray-700"
              />
              <label htmlFor="isActive" className="text-sm text-gray-300">Active Link</label>
            </div>
          </form>
          
          <div className="p-4 border-t border-gray-700 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-4 py-2 bg-trade-neon text-black font-bold rounded-lg hover:bg-green-400"
            >
              {link ? 'Update Link' : 'Create Link'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Subscription Plan Settings Component
  const SubscriptionPlanSettings: React.FC = () => {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [features, setFeatures] = useState<PlanFeature[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
    const [editingFeature, setEditingFeature] = useState<PlanFeature | null>(null);
    const [showPlanForm, setShowPlanForm] = useState(false);
    const [showFeatureForm, setShowFeatureForm] = useState(false);

    useEffect(() => {
      fetchPlans();
    }, []);

    const fetchPlans = async () => {
      try {
        setLoading(true);
        const allPlans = await socialMediaService.getAllSubscriptionPlans();
        setPlans(allPlans);
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setLoading(false);
      }
    };

    const handleCreatePlan = async (plan: Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const newPlan = await socialMediaService.createSubscriptionPlan(plan);
        if (newPlan) {
          setPlans([...plans, newPlan]);
          setShowPlanForm(false);
        }
      } catch (error) {
        console.error('Error creating plan:', error);
      }
    };

    const handleUpdatePlan = async (id: string, updates: Partial<SubscriptionPlan>) => {
      try {
        const success = await socialMediaService.updateSubscriptionPlan(id, updates);
        if (success) {
          setPlans(plans.map(plan => plan.id === id ? { ...plan, ...updates } as SubscriptionPlan : plan));
          setEditingPlan(null);
        }
      } catch (error) {
        console.error('Error updating plan:', error);
      }
    };

    const handleDeletePlan = async (id: string) => {
      if (window.confirm('Are you sure you want to delete this plan?')) {
        try {
          const success = await socialMediaService.deleteSubscriptionPlan(id);
          if (success) {
            setPlans(plans.filter(plan => plan.id !== id));
          }
        } catch (error) {
          console.error('Error deleting plan:', error);
        }
      }
    };

    const handleCreateFeature = async (feature: Omit<PlanFeature, 'id' | 'createdAt'>) => {
      try {
        const newFeature = await socialMediaService.createPlanFeature(feature);
        if (newFeature) {
          setFeatures([...features, newFeature]);
          setShowFeatureForm(false);
        }
      } catch (error) {
        console.error('Error creating feature:', error);
      }
    };

    const handleUpdateFeature = async (id: string, updates: Partial<PlanFeature>) => {
      try {
        const success = await socialMediaService.updatePlanFeature(id, updates);
        if (success) {
          setFeatures(features.map(feature => feature.id === id ? { ...feature, ...updates } as PlanFeature : feature));
          setEditingFeature(null);
        }
      } catch (error) {
        console.error('Error updating feature:', error);
      }
    };

    const handleDeleteFeature = async (id: string) => {
      if (window.confirm('Are you sure you want to delete this feature?')) {
        try {
          const success = await socialMediaService.deletePlanFeature(id);
          if (success) {
            setFeatures(features.filter(feature => feature.id !== id));
          }
        } catch (error) {
          console.error('Error deleting feature:', error);
        }
      }
    };

    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-trade-neon"></div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Subscription Plan Management</h2>
          <button 
            onClick={() => setShowPlanForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-trade-neon text-black font-bold rounded-lg hover:bg-green-400 transition"
          >
            <Plus className="h-4 w-4" /> Add New Plan
          </button>
        </div>

        {/* Plan Form Modal */}
        {showPlanForm && (
          <PlanForm 
            onSubmit={handleCreatePlan}
            onCancel={() => setShowPlanForm(false)}
          />
        )}

        {/* Edit Plan Form Modal */}
        {editingPlan && (
          <PlanForm 
            plan={editingPlan}
            onSubmit={(updates) => handleUpdatePlan(editingPlan.id, updates)}
            onCancel={() => setEditingPlan(null)}
          />
        )}

        {/* Plans List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div key={plan.id} className="bg-trade-dark border border-gray-700 rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-gray-400 text-sm">${plan.price} ({plan.interval})</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setEditingPlan(plan)}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeletePlan(plan.id)}
                    className="p-2 bg-red-900/50 hover:bg-red-900/70 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-gray-300 mb-4">{plan.description}</p>
              
              <div className="flex items-center justify-between">
                <span className={`text-sm px-2 py-1 rounded-full ${plan.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {plan.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="text-sm text-gray-500">Order: {plan.sortOrder}</span>
              </div>
            </div>
          ))}
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
      isActive: plan?.isActive !== undefined ? plan.isActive : true,
      sortOrder: plan?.sortOrder || 0
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const planData = {
        ...formData,
        features: formData.features.split('\n').filter(f => f.trim() !== ''),
        price: Number(formData.price)
      };
      onSubmit(planData);
    };

    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
        <div 
          className="bg-trade-dark border border-gray-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h3 className="font-bold text-lg">{plan ? 'Edit Plan' : 'Create New Plan'}</h3>
            <button 
              onClick={onCancel}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-4 space-y-4 flex-1 overflow-y-auto max-h-[70vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Plan Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:border-trade-neon outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Price ($)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:border-trade-neon outline-none"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Description</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:border-trade-neon outline-none h-24"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Interval</label>
                <select
                  value={formData.interval}
                  onChange={e => setFormData({...formData, interval: e.target.value as any})}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:border-trade-neon outline-none"
                >
                  <option value="one-time">One-time</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Sort Order</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={e => setFormData({...formData, sortOrder: Number(e.target.value)})}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:border-trade-neon outline-none"
                  required
                  min="0"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Features (one per line)</label>
              <textarea
                value={formData.features}
                onChange={e => setFormData({...formData, features: e.target.value})}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:border-trade-neon outline-none h-32"
                placeholder="Enter one feature per line"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={e => setFormData({...formData, isActive: e.target.checked})}
                className="h-4 w-4 text-trade-neon focus:ring-trade-neon border-gray-600 rounded bg-gray-700"
              />
              <label htmlFor="isActive" className="text-sm text-gray-300">Active Plan</label>
            </div>
          </form>
          
          <div className="p-4 border-t border-gray-700 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-4 py-2 bg-trade-neon text-black font-bold rounded-lg hover:bg-green-400"
            >
              {plan ? 'Update Plan' : 'Create Plan'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Community Links Management
  const handleCreateCommunityLink = async (link: Omit<CommunityLink, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newLink = await socialMediaService.createCommunityLink(link);
      if (newLink) {
        setCommunityLinks([...communityLinks, newLink]);
        setShowCommunityLinkForm(false);
      }
    } catch (error) {
      console.error('Error creating community link:', error);
    }
  };

  const handleUpdateCommunityLink = async (id: string, updates: Partial<CommunityLink>) => {
    try {
      const success = await socialMediaService.updateCommunityLink(id, updates);
      if (success) {
        setCommunityLinks(communityLinks.map(link => link.id === id ? { ...link, ...updates } as CommunityLink : link));
        setEditingCommunityLink(null);
      }
    } catch (error) {
      console.error('Error updating community link:', error);
    }
  };

  const handleDeleteCommunityLink = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this community link?')) {
      try {
        const success = await socialMediaService.deleteCommunityLink(id);
        if (success) {
          setCommunityLinks(communityLinks.filter(link => link.id !== id));
        }
      } catch (error) {
        console.error('Error deleting community link:', error);
      }
    }
  };

  // Rule Engine Handlers
  const handleAddRule = (rule: TradeRule) => {
    setTradeRules(prev => [...prev, rule]);
  };

  const handleUpdateRule = (id: string, updates: Partial<TradeRule>) => {
    setTradeRules(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const handleDeleteRule = (id: string) => {
    setTradeRules(prev => prev.filter(r => r.id !== id));
  };

  const handleReorderRules = (newRules: TradeRule[]) => {
    setTradeRules(newRules);
  };

  // Calculate trade analytics
  const tradeAnalytics = (() => {
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
  })();

  // Handle student selection with detailed data
  const handleStudentSelect = async (student: StudentProfile) => {
    try {
      const detailedStudent = await fetchStudentWithTrades(student.id);
      if (detailedStudent) {
        setSelectedStudent(detailedStudent);
      } else {
        setSelectedStudent(student);
      }
    } catch (err) {
      console.error('Error fetching student details:', err);
      setSelectedStudent(student);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-trade-neon"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
        <p className="text-red-200">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white"
        >
          Retry
        </button>
      </div>
    );
  }

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
        
        <div className="flex flex-wrap gap-2 pb-2 md:pb-0 min-h-[40px] bg-gray-900/50 p-2 rounded-lg border border-gray-700">
          {[
            { id: 'overview', label: 'Command Center', icon: LayoutDashboard },
            { id: 'directory', label: 'Directory', icon: Users },
            { id: 'trades', label: 'Trade Analysis', icon: Layers },
            { id: 'analytics', label: 'Analytics', icon: PieIcon },
            { id: 'content', label: 'Content Mgmt', icon: BookOpen },
            { id: 'rules', label: 'Rule Engine', icon: Zap },
            { id: 'settings', label: 'Settings', icon: CreditCard },
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
                    <Icon className="h-4 w-4" /> 
                    <span className={activeTab === tab.id ? "underline decoration-trade-neon decoration-2 underline-offset-4" : ""}>
                      {tab.label}
                    </span>
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
              <div className="h-64 w-full" style={{minHeight: '200px'}}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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
                        <h4 className="font-bold text-red-200">{student.name || 'Unknown Student'}</h4>
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
                                      {student.name ? student.name.charAt(0) : '?'}
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-white">{student.name || 'Unknown Student'}</h4>
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
                                        {student.name ? student.name.charAt(0) : '?'}
                                    </div>
                                    <div>
                                        <div>{student.name || 'Unknown Student'}</div>
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
             <div className="h-64 w-full" style={{minHeight: '200px'}}>
               <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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
                   ${businessMetrics.mrr ? businessMetrics.mrr.toLocaleString() : '0'}
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
                   {students ? students.length : 0}
                 </div>
              </div>

              <div className="bg-trade-dark p-6 rounded-xl border border-gray-700">
                 <div className="flex items-center gap-2 text-gray-400 mb-2">
                   <CreditCard className="h-4 w-4" /> Lifetime Revenue
                 </div>
                 <div className="text-3xl font-bold text-white">
                   ${(businessMetrics.totalRevenue ? businessMetrics.totalRevenue : 0).toLocaleString()}
                 </div>
                 <div className="text-xs text-gray-500 mt-1">Projected EOY</div>
              </div>

              <div className="bg-trade-dark p-6 rounded-xl border border-gray-700">
                 <div className="flex items-center gap-2 text-gray-400 mb-2">
                   <ArrowDownRight className="h-4 w-4 text-red-500" /> Churn Rate
                 </div>
                 <div className="text-3xl font-bold text-red-400">
                   {businessMetrics.churnRate ? businessMetrics.churnRate : 0}%
                 </div>
                 <div className="text-xs text-gray-500 mt-1">Industry Avg: 5.5%</div>
              </div>
           </div>

           {/* Charts Grid */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-trade-dark p-6 rounded-xl border border-gray-700">
                 <h3 className="font-bold text-lg mb-6">Revenue Trajectory</h3>
                 <div className="h-64" style={{minHeight: '200px'}}>
                    {businessMetrics.revenueGrowthData && businessMetrics.revenueGrowthData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No revenue data available
                      </div>
                    )}
                 </div>
              </div>

              <div className="bg-trade-dark p-6 rounded-xl border border-gray-700">
                 <h3 className="font-bold text-lg mb-6">Student Tiers</h3>
                 <div className="h-64" style={{minHeight: '200px'}}>
                    {businessMetrics.tierData && businessMetrics.tierData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No tier data available
                      </div>
                    )}
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-trade-dark p-6 rounded-xl border border-gray-700">
                 <h3 className="font-bold text-lg mb-6">Course Completion Rate</h3>
                 <div className="h-64" style={{minHeight: '200px'}}>
                    {businessMetrics.courseCompletionData && businessMetrics.courseCompletionData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No course data available
                      </div>
                    )}
                 </div>
              </div>

              <div className="bg-trade-dark p-6 rounded-xl border border-gray-700">
                 <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-red-400" /> Top AI Rule Violations
                 </h3>
                 <div className="h-64" style={{minHeight: '200px'}}>
                    {businessMetrics.violationData && businessMetrics.violationData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No violation data available
                      </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* ================= CONTENT MANAGEMENT TAB ================= */}
      {activeTab === 'content' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CourseManagementSystem 
            currentUser={{
              id: '00000000-0000-0000-0000-000000000000',
              name: 'Admin User',
              email: 'admin@example.com',
              tier: 'elite',
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
        </div>
      )}

      {/* ================= SETTINGS TAB ================= */}
      {activeTab === 'settings' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <SubscriptionPlanSettings />
          <CommunityLinksSettings />
        </div>
      )}

      {/* ================= RULE ENGINE TAB ================= */}
      {activeTab === 'rules' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <RuleBuilder
            rules={tradeRules}
            onAdd={handleAddRule}
            onUpdate={handleUpdateRule}
            onDelete={handleDeleteRule}
            onReorder={handleReorderRules}
          />
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
                            {selectedStudent.name ? selectedStudent.name.charAt(0) : '?'}
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
