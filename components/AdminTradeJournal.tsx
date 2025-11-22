import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TradeEntry, TradeOutcome, TradeValidationStatus } from '../types';
import { journalService } from '../services/journalService';
import { supabase } from '../supabase/client';
import { 
  Plus, Search, Filter, ArrowUpRight, ArrowDownRight, MoreHorizontal, 
  Calendar, DollarSign, Smile, Frown, Meh, Save, X, Upload, Image as ImageIcon, 
  Trash2, Eye, ArrowUpDown, ChevronDown, Loader2, Download, FileText, ChevronRight,
  CheckCircle, AlertCircle, XCircle, BarChart3, TrendingUp, TrendingDown,
  Activity, Target, Zap, Award, Flame, Anchor
} from 'lucide-react';

const STRATEGIES = ['Breakout', 'Pullback', 'Trend Following', 'Mean Reversion', 'News Trade', 'Scalping', 'Swing Trade'];
const TIME_FRAMES = ['1M', '5M', '15M', '30M', '1H', '4H', 'Daily', 'Weekly'];
const MARKET_CONDITIONS = ['Trending', 'Ranging', 'Volatile', 'Consolidating', 'News Event'];
const TRADE_SOURCES = ['Demo', 'Live', 'Paper'];

type SortOption = 'date' | 'pnl';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'journal' | 'analytics';

const AdminTradeJournal: React.FC = () => {
  const [entries, setEntries] = useState<TradeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('analytics');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingEntry, setEditingEntry] = useState<TradeEntry | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'sell'>('all');
  const [filterOutcome, setFilterOutcome] = useState<'all' | 'win' | 'loss' | 'breakeven' | 'pending'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: SortOption; direction: SortDirection }>({
    key: 'date',
    direction: 'desc'
  });

  const [formData, setFormData] = useState<Partial<TradeEntry>>({
    pair: 'EURUSD',
    type: 'buy',
    status: 'pending',
    validationResult: 'none',
    emotions: [],
    date: new Date().toISOString().split('T')[0],
    strategy: '',
    timeFrame: '',
    marketCondition: '',
    confidenceLevel: 5,
    riskAmount: undefined,
    positionSize: undefined,
    tradeDuration: '',
    tags: [],
    tradeSource: 'demo',
    screenshotUrl: '',
    exitPrice: undefined,
    pnl: undefined
  });

  // Fetch real journal entries
  useEffect(() => {
    let channel: any = null;

    const fetchEntries = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const entriesData = await journalService.getJournalEntries(user.id);
          setEntries(entriesData);
        }
      } catch (err) {
        console.error('Error fetching journal entries:', err);
        setError('Failed to load journal entries');
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();

    // Real-time subscription
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel('admin-journal-entries-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'journal_entries',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const newEntry: TradeEntry = {
              id: payload.new.id,
              pair: payload.new.pair,
              type: payload.new.type,
              entryPrice: payload.new.entry_price,
              stopLoss: payload.new.stop_loss,
              takeProfit: payload.new.take_profit,
              exitPrice: payload.new.exit_price,
              status: payload.new.status,
              validationResult: payload.new.validation_result,
              notes: payload.new.notes,
              date: payload.new.date,
              emotions: payload.new.emotions,
              pnl: payload.new.pnl,
              screenshotUrl: payload.new.screenshot_url,
              strategy: payload.new.strategy,
              timeFrame: payload.new.time_frame,
              marketCondition: payload.new.market_condition,
              confidenceLevel: payload.new.confidence_level,
              riskAmount: payload.new.risk_amount,
              positionSize: payload.new.position_size,
              tradeDuration: payload.new.trade_duration,
              tags: payload.new.tags,
              adminNotes: payload.new.admin_notes,
              adminReviewStatus: payload.new.admin_review_status,
              reviewTimestamp: payload.new.review_timestamp,
              mentorId: payload.new.mentor_id,
              sessionId: payload.new.session_id,
              tradeSource: payload.new.trade_source
            };
            setEntries(prev => [newEntry, ...prev]);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'journal_entries',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const updatedEntry: TradeEntry = {
              id: payload.new.id,
              pair: payload.new.pair,
              type: payload.new.type,
              entryPrice: payload.new.entry_price,
              stopLoss: payload.new.stop_loss,
              takeProfit: payload.new.take_profit,
              exitPrice: payload.new.exit_price,
              status: payload.new.status,
              validationResult: payload.new.validation_result,
              notes: payload.new.notes,
              date: payload.new.date,
              emotions: payload.new.emotions,
              pnl: payload.new.pnl,
              screenshotUrl: payload.new.screenshot_url,
              strategy: payload.new.strategy,
              timeFrame: payload.new.time_frame,
              marketCondition: payload.new.market_condition,
              confidenceLevel: payload.new.confidence_level,
              riskAmount: payload.new.risk_amount,
              positionSize: payload.new.position_size,
              tradeDuration: payload.new.trade_duration,
              tags: payload.new.tags,
              adminNotes: payload.new.admin_notes,
              adminReviewStatus: payload.new.admin_review_status,
              reviewTimestamp: payload.new.review_timestamp,
              mentorId: payload.new.mentor_id,
              sessionId: payload.new.session_id,
              tradeSource: payload.new.trade_source
            };
            setEntries(prev => prev.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry));
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'journal_entries',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            setEntries(prev => prev.filter(entry => entry.id !== payload.old.id));
          }
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEntry(null);
    setFormData({
      pair: 'EURUSD',
      type: 'buy',
      status: 'pending',
      validationResult: 'none',
      emotions: [],
      date: new Date().toISOString().split('T')[0],
      strategy: '',
      timeFrame: '',
      marketCondition: '',
      confidenceLevel: 5,
      riskAmount: undefined,
      positionSize: undefined,
      tradeDuration: '',
      tags: [],
      tradeSource: 'demo',
      screenshotUrl: '',
      exitPrice: undefined,
      pnl: undefined
    });
  };

  const handleEditEntry = (entry: TradeEntry) => {
    setEditingEntry(entry);
    setFormData(entry);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let status = formData.status || 'pending';
      const pnl = formData.pnl ? Number(formData.pnl) : undefined;
      
      if (pnl !== undefined) {
        if (pnl > 0) {
          status = 'win';
        } else if (pnl < 0) {
          status = 'loss';
        } else {
          status = 'breakeven';
        }
      }

      const entryData: Omit<TradeEntry, 'id'> = {
        pair: formData.pair || 'EURUSD',
        type: formData.type || 'buy',
        entryPrice: Number(formData.entryPrice) || 0,
        stopLoss: Number(formData.stopLoss) || 0,
        takeProfit: Number(formData.takeProfit) || 0,
        exitPrice: formData.exitPrice ? Number(formData.exitPrice) : undefined,
        status: status as TradeOutcome,
        validationResult: formData.validationResult || 'none',
        notes: formData.notes || '',
        date: formData.date || new Date().toISOString(),
        emotions: formData.emotions || [],
        pnl: pnl,
        screenshotUrl: formData.screenshotUrl || undefined,
        strategy: formData.strategy || undefined,
        timeFrame: formData.timeFrame || undefined,
        marketCondition: formData.marketCondition || undefined,
        confidenceLevel: formData.confidenceLevel,
        riskAmount: formData.riskAmount ? Number(formData.riskAmount) : undefined,
        positionSize: formData.positionSize ? Number(formData.positionSize) : undefined,
        tradeDuration: formData.tradeDuration || undefined,
        tags: formData.tags || undefined,
        tradeSource: formData.tradeSource || 'demo'
      };

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not authenticated');
        return;
      }

      if (editingEntry) {
        const success = await journalService.updateJournalEntry(editingEntry.id, entryData);
        if (success) {
          handleCloseModal();
        } else {
          setError('Failed to update journal entry');
        }
      } else {
        const result = await journalService.createJournalEntry(entryData, user.id);
        if (result) {
          handleCloseModal();
        } else {
          setError('Failed to create journal entry');
        }
      }
    } catch (err) {
      console.error('Error saving journal entry:', err);
      setError('Failed to save journal entry');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, screenshotUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setFormData(prev => ({ ...prev, screenshotUrl: undefined }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSort = (key: SortOption) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const processedEntries = useMemo(() => {
    const filtered = entries.filter(entry => {
      const matchesSearch = (entry.pair && entry.pair.toLowerCase().includes(searchTerm.toLowerCase())) || 
                            (entry.notes && entry.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (entry.strategy && entry.strategy.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = filterType === 'all' || (entry.type && entry.type === filterType);
      const matchesOutcome = filterOutcome === 'all' || (entry.status && entry.status === filterOutcome);
      return matchesSearch && matchesType && matchesOutcome;
    });

    return filtered.sort((a, b) => {
      let aValue: any = a[sortConfig.key];
      let bValue: any = b[sortConfig.key];

      if (sortConfig.key === 'date') {
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
      } else if (sortConfig.key === 'pnl') {
        aValue = a.pnl || 0;
        bValue = b.pnl || 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [entries, searchTerm, filterType, filterOutcome, sortConfig]);

  const stats = useMemo(() => {
    const total = processedEntries.length;
    const wins = processedEntries.filter(e => e.status === 'win').length;
    const losses = processedEntries.filter(e => e.status === 'loss').length;
    const breakeven = processedEntries.filter(e => e.status === 'breakeven').length;
    const closedTrades = wins + losses + breakeven;
    const winRate = closedTrades > 0 ? Math.round((wins / closedTrades) * 100) : 0;
    const totalPnL = processedEntries.reduce((acc, curr) => acc + (curr.pnl || 0), 0);
    const avgPnL = closedTrades > 0 ? (totalPnL / closedTrades).toFixed(2) : 0;
    const largestWin = Math.max(...processedEntries.filter(e => e.pnl && e.pnl > 0).map(e => e.pnl || 0), 0);
    const largestLoss = Math.min(...processedEntries.filter(e => e.pnl && e.pnl < 0).map(e => e.pnl || 0), 0);
    const winSum = processedEntries.filter(e => e.status === 'win').reduce((a, c) => a + (c.pnl || 0), 0);
    const lossSum = Math.abs(processedEntries.filter(e => e.status === 'loss').reduce((a, c) => a + (c.pnl || 0), 0));
    const profitFactor = lossSum > 0 ? (winSum / lossSum).toFixed(2) : 'N/A';
    
    const strategyStats: Record<string, { wins: number; losses: number; pnl: number }> = {};
    processedEntries.forEach(e => {
      const strategy = e.strategy || 'Unknown';
      if (!strategyStats[strategy]) {
        strategyStats[strategy] = { wins: 0, losses: 0, pnl: 0 };
      }
      if (e.status === 'win') strategyStats[strategy].wins++;
      if (e.status === 'loss') strategyStats[strategy].losses++;
      strategyStats[strategy].pnl += e.pnl || 0;
    });

    const timeFrameStats: Record<string, { wins: number; losses: number; total: number }> = {};
    processedEntries.forEach(e => {
      const tf = e.timeFrame || 'Unknown';
      if (!timeFrameStats[tf]) {
        timeFrameStats[tf] = { wins: 0, losses: 0, total: 0 };
      }
      timeFrameStats[tf].total++;
      if (e.status === 'win') timeFrameStats[tf].wins++;
      if (e.status === 'loss') timeFrameStats[tf].losses++;
    });

    const pairStats: Record<string, { wins: number; losses: number; pnl: number; total: number }> = {};
    processedEntries.forEach(e => {
      const pair = e.pair || 'Unknown';
      if (!pairStats[pair]) {
        pairStats[pair] = { wins: 0, losses: 0, pnl: 0, total: 0 };
      }
      pairStats[pair].total++;
      if (e.status === 'win') pairStats[pair].wins++;
      if (e.status === 'loss') pairStats[pair].losses++;
      pairStats[pair].pnl += e.pnl || 0;
    });

    return { total, wins, losses, breakeven, winRate, totalPnL, avgPnL, largestWin, largestLoss, profitFactor, strategyStats, timeFrameStats, pairStats, closedTrades };
  }, [processedEntries]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="mt-2 text-gray-400">Loading journal entries...</p>
        </div>
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
    <div className="text-white space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Trade Journal</h1>
          <p className="text-gray-400">Track your trading performance and analytics</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={() => setViewMode('analytics')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
              viewMode === 'analytics' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <BarChart3 className="h-4 w-4" /> Analytics
          </button>
          <button 
            onClick={() => setViewMode('journal')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
              viewMode === 'journal' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <FileText className="h-4 w-4" /> Journal
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <Plus className="h-5 w-5" /> New Entry
          </button>
        </div>
      </div>

      {/* Analytics View */}
      {viewMode === 'analytics' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-yellow-500/10 to-gray-900 p-6 rounded-xl border border-yellow-500/20 hover:border-yellow-500/50 transition transform hover:scale-105">
              <div className="flex items-center justify-between mb-2">
                <div className="text-gray-400 text-sm font-medium">Win Rate</div>
                <Award className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="text-4xl font-bold text-yellow-400">{stats.winRate}%</div>
              <div className="text-xs text-gray-500 mt-3">{stats.wins} Wins / {stats.losses} Losses</div>
            </div>

            <div className={`bg-gradient-to-br ${stats.totalPnL >= 0 ? 'from-green-500/10' : 'from-red-500/10'} to-gray-900 p-6 rounded-xl border ${stats.totalPnL >= 0 ? 'border-green-500/20 hover:border-green-500/50' : 'border-red-500/20 hover:border-red-500/50'} transition transform hover:scale-105`}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-gray-400 text-sm font-medium">Total P&L</div>
                <TrendingUp className={`h-5 w-5 ${stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`} />
              </div>
              <div className={`text-4xl font-bold ${stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${stats.totalPnL.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 mt-3">Avg: ${stats.avgPnL}</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-gray-900 p-6 rounded-xl border border-purple-500/20 hover:border-purple-500/50 transition transform hover:scale-105">
              <div className="flex items-center justify-between mb-2">
                <div className="text-gray-400 text-sm font-medium">Profit Factor</div>
                <Zap className="h-5 w-5 text-purple-400" />
              </div>
              <div className="text-4xl font-bold text-purple-400">{stats.profitFactor}</div>
              <div className="text-xs text-gray-500 mt-3">Wins to Losses Ratio</div>
            </div>

            <div className="bg-gradient-to-br from-cyan-500/10 to-gray-900 p-6 rounded-xl border border-cyan-500/20 hover:border-cyan-500/50 transition transform hover:scale-105">
              <div className="flex items-center justify-between mb-2">
                <div className="text-gray-400 text-sm font-medium">Total Trades</div>
                <Activity className="h-5 w-5 text-cyan-400" />
              </div>
              <div className="text-4xl font-bold text-cyan-400">{stats.total}</div>
              <div className="text-xs text-gray-500 mt-3">{stats.closedTrades} Closed</div>
            </div>
          </div>

          {/* Win/Loss Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-900/20 to-gray-900 p-6 rounded-xl border border-green-500/30 hover:border-green-400/50 transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <ArrowUpRight className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold">Largest Win</h3>
              </div>
              <div className="text-3xl font-bold text-green-400">${stats.largestWin.toFixed(2)}</div>
              <div className="text-sm text-gray-500 mt-2">Best performing trade</div>
            </div>

            <div className="bg-gradient-to-br from-red-900/20 to-gray-900 p-6 rounded-xl border border-red-500/30 hover:border-red-400/50 transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-500/20 rounded-lg">
                  <ArrowDownRight className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold">Largest Loss</h3>
              </div>
              <div className="text-3xl font-bold text-red-400">-${Math.abs(stats.largestLoss).toFixed(2)}</div>
              <div className="text-sm text-gray-500 mt-2">Worst performing trade</div>
            </div>
          </div>

          {/* Strategy Performance */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-400" /> Strategy Performance
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.strategyStats).sort((a, b) => b[1].pnl - a[1].pnl).map(([strategy, data]) => (
                <div key={strategy} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-blue-500/30 transition group">
                  <div className="flex-1">
                    <div className="font-semibold text-white group-hover:text-blue-400 transition">{strategy}</div>
                    <div className="text-sm text-gray-400">{data.wins}W / {data.losses}L</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-24 bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-500" 
                        style={{ width: `${Math.min((Math.abs(data.pnl) / Math.abs(stats.totalPnL) * 100) || 0, 100)}%` }}
                      />
                    </div>
                    <div className={`text-lg font-bold w-24 text-right ${data.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${data.pnl.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Time Frame & Pair Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Anchor className="h-5 w-5 text-cyan-400" /> Currency Pair Stats
              </h3>
              <div className="space-y-2">
                {Object.entries(stats.pairStats).sort((a, b) => b[1].pnl - a[1].pnl).slice(0, 6).map(([pair, data]) => (
                  <div key={pair} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-cyan-500/30 transition">
                    <div className="flex-1">
                      <span className="text-gray-300 font-mono font-bold">{pair}</span>
                      <span className="text-gray-500 text-xs ml-2">({data.total}T • {data.wins}W • {data.losses}L)</span>
                    </div>
                    <div className={`text-sm font-bold ${data.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${data.pnl.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Journal View */}
      {viewMode === 'journal' && (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-500/10 to-gray-900 p-5 rounded-xl border border-blue-500/20">
              <div className="text-gray-400 text-sm mb-2 flex items-center gap-2"><Award className="h-4 w-4" /> Win Rate</div>
              <div className={`text-3xl font-bold ${stats.winRate >= 50 ? 'text-green-400' : 'text-yellow-400'}`}>
                {stats.winRate}%
              </div>
            </div>
            <div className={`bg-gradient-to-br ${stats.totalPnL >= 0 ? 'from-green-500/10' : 'from-red-500/10'} to-gray-900 p-5 rounded-xl border ${stats.totalPnL >= 0 ? 'border-green-500/20' : 'border-red-500/20'}`}>
              <div className="text-gray-400 text-sm mb-2 flex items-center gap-2"><DollarSign className="h-4 w-4" /> Net P&L</div>
              <div className={`text-3xl font-bold ${stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${stats.totalPnL.toFixed(2)}
              </div>
            </div>
            <div className="bg-gradient-to-br from-cyan-500/10 to-gray-900 p-5 rounded-xl border border-cyan-500/20">
              <div className="text-gray-400 text-sm mb-2 flex items-center gap-2"><Activity className="h-4 w-4" /> Total Trades</div>
              <div className="text-3xl font-bold text-white">{stats.total}</div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 flex flex-col md:flex-row gap-4 items-center backdrop-blur-sm">
            <div className="relative flex-1 w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search pairs, notes, strategies..." 
                className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-blue-400 transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
              <select 
                className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none focus:border-blue-400 transition"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
              >
                <option value="all">All Types</option>
                <option value="buy">Buys Only</option>
                <option value="sell">Sells Only</option>
              </select>

              <select 
                className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none focus:border-blue-400 transition"
                value={filterOutcome}
                onChange={(e) => setFilterOutcome(e.target.value as any)}
              >
                <option value="all">All Outcomes</option>
                <option value="win">Wins</option>
                <option value="loss">Losses</option>
                <option value="breakeven">Breakeven</option>
              </select>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <button 
                onClick={() => handleSort('date')}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm border transition ${
                  sortConfig.key === 'date' 
                    ? 'bg-blue-600/20 border-blue-500 text-blue-400' 
                    : 'bg-gray-900 border-gray-600 text-gray-400 hover:bg-gray-800'
                }`}
              >
                <Calendar className="h-4 w-4" /> Date
              </button>

              <button 
                onClick={() => handleSort('pnl')}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm border transition ${
                  sortConfig.key === 'pnl' 
                    ? 'bg-blue-600/20 border-blue-500 text-blue-400' 
                    : 'bg-gray-900 border-gray-600 text-gray-400 hover:bg-gray-800'
                }`}
              >
                <DollarSign className="h-4 w-4" /> P&L
              </button>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden overflow-x-auto backdrop-blur-sm">
            <table className="w-full text-left text-sm min-w-[900px]">
              <thead className="bg-gray-900/80 text-gray-400 border-b border-gray-700">
                <tr>
                  <th className="p-4 font-semibold whitespace-nowrap">Date</th>
                  <th className="p-4 font-semibold">Pair</th>
                  <th className="p-4 font-semibold">Type</th>
                  <th className="p-4 font-semibold">Strategy</th>
                  <th className="p-4 font-semibold">Setup Notes</th>
                  <th className="p-4 font-semibold text-center">Chart</th>
                  <th className="p-4 font-semibold text-right">P&L</th>
                  <th className="p-4 font-semibold text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {processedEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-700/30 transition group">
                    <td className="p-4 text-gray-300 font-mono text-xs">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-bold text-white group-hover:text-blue-400 transition">{entry.pair}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase flex items-center gap-1 w-fit ${
                        entry.type === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {entry.type === 'buy' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {entry.type}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 text-sm">{entry.strategy || '-'}</td>
                    <td className="p-4 text-gray-400 max-w-xs truncate text-sm" title={entry.notes}>
                      {entry.notes || <span className="text-gray-600 italic">No notes</span>}
                    </td>
                    <td className="p-4 text-center">
                      {entry.screenshotUrl ? (
                        <button 
                          onClick={() => setPreviewImage(entry.screenshotUrl!)}
                          className="text-gray-400 hover:text-blue-400 transition p-1.5 rounded-lg hover:bg-gray-700 bg-gray-800/50 border border-gray-700"
                          title="View Chart"
                        >
                          <ImageIcon className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="text-gray-700">-</span>
                      )}
                    </td>
                    <td className={`p-4 text-right font-mono font-bold text-sm ${
                      entry.pnl && entry.pnl > 0 ? 'text-green-400' : 
                      entry.pnl && entry.pnl < 0 ? 'text-red-400' : 'text-gray-500'
                    }`}>
                      {entry.pnl ? (entry.pnl > 0 ? `+${entry.pnl}` : `${entry.pnl}`) : '-'}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center">
                        <span className={`w-3 h-3 rounded-full ${
                          entry.status === 'win' ? 'bg-green-500 shadow-lg shadow-green-500/50' : 
                          entry.status === 'loss' ? 'bg-red-500 shadow-lg shadow-red-500/50' : 
                          entry.status === 'breakeven' ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50' : 'bg-gray-500'
                        }`}></span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleEditEntry(entry)}
                        className="text-gray-400 hover:text-blue-400 transition p-1.5 rounded-lg hover:bg-gray-700 inline-block"
                        title="Edit Entry"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                          <path d="m15 5 4 4"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
                {processedEntries.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <Search className="h-8 w-8 mb-3 opacity-50" />
                        <p className="text-lg font-medium">No trades found</p>
                        <p className="text-sm">Try adjusting your filters or search term.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 text-gray-400 hover:text-white p-2"
            >
              <X className="h-8 w-8" />
            </button>
            <img 
              src={previewImage} 
              alt="Trade Preview" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg border border-gray-700 shadow-2xl" 
            />
          </div>
        </div>
      )}

      {/* Add/Edit Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl shadow-2xl my-8">
            <form onSubmit={handleSubmit}>
              <div className="flex justify-between items-center p-6 border-b border-gray-700 bg-gray-800/50">
                <h2 className="text-xl font-bold text-white">
                  {editingEntry ? 'Edit Trade Entry' : 'Log New Trade'}
                </h2>
                <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-white">
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-semibold">Pair</label>
                    <input 
                      type="text" 
                      required
                      className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white focus:border-blue-400 outline-none uppercase font-bold"
                      value={formData.pair}
                      onChange={e => setFormData({...formData, pair: e.target.value.toUpperCase()})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-semibold">Date</label>
                    <input 
                      type="date" 
                      required
                      className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white focus:border-blue-400 outline-none"
                      value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-400 mb-1 font-semibold">Direction</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className={`flex-1 py-2 rounded font-bold text-sm flex items-center justify-center gap-2 border transition ${formData.type === 'buy' ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'}`}
                        onClick={() => setFormData({...formData, type: 'buy'})}
                      >
                        <ArrowUpRight className="h-4 w-4" /> BUY
                      </button>
                      <button
                        type="button"
                        className={`flex-1 py-2 rounded font-bold text-sm flex items-center justify-center gap-2 border transition ${formData.type === 'sell' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'}`}
                        onClick={() => setFormData({...formData, type: 'sell'})}
                      >
                        <ArrowDownRight className="h-4 w-4" /> SELL
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-800/30 p-4 rounded-lg border border-gray-700">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-semibold">Entry Price</label>
                    <input type="number" step="0.00001" className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white outline-none focus:border-blue-400" value={formData.entryPrice || ''} onChange={e => setFormData({...formData, entryPrice: e.target.value ? Number(e.target.value) : undefined})} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-semibold">Stop Loss</label>
                    <input type="number" step="0.00001" className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-red-400 outline-none focus:border-red-400" value={formData.stopLoss || ''} onChange={e => setFormData({...formData, stopLoss: e.target.value ? Number(e.target.value) : undefined})} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-semibold">Take Profit</label>
                    <input type="number" step="0.00001" className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-green-400 outline-none focus:border-green-400" value={formData.takeProfit || ''} onChange={e => setFormData({...formData, takeProfit: e.target.value ? Number(e.target.value) : undefined})} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-semibold">Exit Price</label>
                    <input type="number" step="0.00001" className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white outline-none focus:border-blue-400" value={formData.exitPrice || ''} onChange={e => setFormData({...formData, exitPrice: e.target.value ? Number(e.target.value) : undefined})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-semibold">Outcome</label>
                    <select className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white outline-none focus:border-blue-400" value={formData.status || 'pending'} onChange={e => setFormData({...formData, status: e.target.value as TradeOutcome})}>
                      <option value="pending">Pending</option>
                      <option value="win">Win</option>
                      <option value="loss">Loss</option>
                      <option value="breakeven">Breakeven</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-semibold">P&L ($)</label>
                    <input type="number" placeholder="0.00" className={`w-full bg-gray-800 border border-gray-600 rounded p-2 outline-none font-bold focus:border-blue-400 ${(formData.pnl || 0) > 0 ? 'text-green-400' : (formData.pnl || 0) < 0 ? 'text-red-400' : 'text-white'}`} value={formData.pnl || ''} onChange={e => setFormData({...formData, pnl: e.target.value ? Number(e.target.value) : undefined})} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1 font-semibold">Setup Notes</label>
                  <textarea rows={3} className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white outline-none resize-none focus:border-blue-400" placeholder="Describe your trade setup..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
                </div>

                <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-800/30 hover:bg-gray-800/50 transition relative">
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  
                  {formData.screenshotUrl ? (
                    <div className="relative w-full group">
                      <img 
                        src={formData.screenshotUrl} 
                        alt="Trade Setup" 
                        className="w-full h-48 object-contain rounded-lg bg-black/50" 
                      />
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          type="button"
                          onClick={() => setPreviewImage(formData.screenshotUrl!)}
                          className="bg-gray-900/80 p-2 rounded text-white hover:text-blue-400"
                          title="View Fullscreen"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          type="button"
                          onClick={clearImage}
                          className="bg-red-500/80 p-2 rounded text-white hover:bg-red-600"
                          title="Remove Image"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="text-center cursor-pointer w-full py-4"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-300">Click to upload chart screenshot</p>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-semibold">Strategy</label>
                    <select className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white focus:border-blue-400 outline-none" value={formData.strategy || ''} onChange={e => setFormData({...formData, strategy: e.target.value})}>
                      <option value="">Select Strategy</option>
                      {STRATEGIES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-semibold">Time Frame</label>
                    <select className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white focus:border-blue-400 outline-none" value={formData.timeFrame || ''} onChange={e => setFormData({...formData, timeFrame: e.target.value})}>
                      <option value="">Select Time Frame</option>
                      {TIME_FRAMES.map(tf => <option key={tf} value={tf}>{tf}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-semibold">Market Condition</label>
                    <select className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white focus:border-blue-400 outline-none" value={formData.marketCondition || ''} onChange={e => setFormData({...formData, marketCondition: e.target.value})}>
                      <option value="">Select Condition</option>
                      {MARKET_CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-semibold">Confidence: {formData.confidenceLevel}/10</label>
                    <input type="range" min="1" max="10" value={formData.confidenceLevel || 5} onChange={e => setFormData({...formData, confidenceLevel: Number(e.target.value)})} className="w-full" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-semibold">Risk Amount ($)</label>
                    <input type="number" step="0.01" className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white outline-none focus:border-blue-400" value={formData.riskAmount || ''} onChange={e => setFormData({...formData, riskAmount: e.target.value ? Number(e.target.value) : undefined})} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-semibold">Position Size</label>
                    <input type="number" step="0.01" className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white outline-none focus:border-blue-400" value={formData.positionSize || ''} onChange={e => setFormData({...formData, positionSize: e.target.value ? Number(e.target.value) : undefined})} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-semibold">Trade Duration</label>
                    <input type="text" placeholder="e.g., PT30M" className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white outline-none focus:border-blue-400" value={formData.tradeDuration || ''} onChange={e => setFormData({...formData, tradeDuration: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-semibold">Trade Source</label>
                    <select className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white focus:border-blue-400 outline-none" value={formData.tradeSource || 'demo'} onChange={e => setFormData({...formData, tradeSource: e.target.value as any})}>
                      {TRADE_SOURCES.map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-700 flex justify-end gap-3 bg-gray-800/50">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-gray-400 hover:text-white transition">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition">
                  <Save className="h-4 w-4" /> 
                  {editingEntry ? 'Update Entry' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTradeJournal; 