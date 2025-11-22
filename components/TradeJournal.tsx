import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TradeEntry, TradeOutcome, TradeValidationStatus, User } from '../types';
import { journalService } from '../services/journalService';
import { supabase } from '../supabase/client';
import { 
  Plus, Search, Filter, ArrowUpRight, ArrowDownRight, MoreHorizontal, 
  Calendar, DollarSign, Smile, Frown, Meh, Save, X, Upload, Image as ImageIcon, 
  Trash2, Eye, ArrowUpDown, ChevronDown, Loader2
} from 'lucide-react';

interface TradeJournalProps {
  user: User;
}

const EMOTIONS = ['Confident', 'Anxious', 'FOMO', 'Patient', 'Revenge', 'Disciplined'];

type SortOption = 'date' | 'pnl';
type SortDirection = 'asc' | 'desc';

const TradeJournal: React.FC<TradeJournalProps> = ({ user }) => {
  const [entries, setEntries] = useState<TradeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // --- Filtering & Sorting State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'sell'>('all');
  const [filterOutcome, setFilterOutcome] = useState<'all' | 'win' | 'loss' | 'breakeven' | 'pending'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: SortOption; direction: SortDirection }>({
    key: 'date',
    direction: 'desc'
  });

  // Form State
  const [formData, setFormData] = useState<Partial<TradeEntry>>({
    pair: 'EURUSD',
    type: 'buy',
    status: 'pending',
    validationResult: 'none',
    emotions: [],
    date: new Date().toISOString().split('T')[0]
  });

  // Fetch real journal entries
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoading(true);
        const entriesData = await journalService.getJournalEntries(user.id);
        setEntries(entriesData);
      } catch (err) {
        console.error('Error fetching journal entries:', err);
        setError('Failed to load journal entries');
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();

    // Set up real-time subscription for journal entries
    const channel = supabase
      .channel('journal-entries-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'journal_entries',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          // Add new entry to the list
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
            screenshotUrl: payload.new.screenshot_url
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
          // Update existing entry
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
            screenshotUrl: payload.new.screenshot_url
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
          // Remove deleted entry
          setEntries(prev => prev.filter(entry => entry.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.id]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      pair: 'EURUSD',
      type: 'buy',
      status: 'pending',
      validationResult: 'none',
      emotions: [],
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newEntryData: Omit<TradeEntry, 'id'> = {
        pair: formData.pair || 'EURUSD',
        type: formData.type || 'buy',
        entryPrice: Number(formData.entryPrice) || 0,
        stopLoss: Number(formData.stopLoss) || 0,
        takeProfit: Number(formData.takeProfit) || 0,
        exitPrice: formData.exitPrice ? Number(formData.exitPrice) : undefined,
        status: formData.status || 'pending',
        validationResult: formData.validationResult || 'none',
        notes: formData.notes || '',
        date: formData.date || new Date().toISOString(),
        emotions: formData.emotions || [],
        pnl: formData.pnl ? Number(formData.pnl) : undefined,
        screenshotUrl: formData.screenshotUrl
      };

      const result = await journalService.createJournalEntry(newEntryData, user.id);
      if (result) {
        // The real-time subscription will automatically update the entries list
        handleCloseModal();
      } else {
        setError('Failed to create journal entry');
      }
    } catch (err) {
      console.error('Error creating journal entry:', err);
      setError('Failed to create journal entry');
    }
  };

  const toggleEmotion = (emotion: string) => {
    setFormData(prev => {
      const current = prev.emotions || [];
      return current.includes(emotion)
        ? { ...prev, emotions: current.filter(e => e !== emotion) }
        : { ...prev, emotions: [...current, emotion] };
    });
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

  // --- Logic: Filter & Sort Entries ---
  const processedEntries = useMemo(() => {
    // 1. Filter
    const filtered = entries.filter(entry => {
      const matchesSearch = (entry.pair && entry.pair.toLowerCase().includes(searchTerm.toLowerCase())) || 
                            (entry.notes && entry.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = filterType === 'all' || (entry.type && entry.type === filterType);
      const matchesOutcome = filterOutcome === 'all' || (entry.status && entry.status === filterOutcome);
      return matchesSearch && matchesType && matchesOutcome;
    });

    // 2. Sort
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

  // --- Logic: Calculate Stats based on FILTERED view ---
  const stats = useMemo(() => {
    const total = processedEntries.length;
    const wins = processedEntries.filter(e => e.status === 'win').length;
    const losses = processedEntries.filter(e => e.status === 'loss').length;
    const winRate = total > 0 && (wins + losses) > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;
    const totalPnL = processedEntries.reduce((acc, curr) => acc + (curr.pnl || 0), 0);
    
    return { total, winRate, totalPnL };
  }, [processedEntries]);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-trade-neon" />
          <p className="mt-2 text-gray-400">Loading journal entries...</p>
        </div>
      </div>
    );
  }

  // Error state
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
    <div className="text-white space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Trade Journal</h1>
          <p className="text-gray-400">Track your performance and psychology.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-trade-accent hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-lg shadow-trade-accent/20"
        >
          <Plus className="h-5 w-5" /> New Entry
        </button>
      </div>

      {/* Dynamic Stats Overview (updates based on filters) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-trade-dark p-5 rounded-xl border border-gray-700 transition-all duration-300">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            Win Rate <span className="text-[10px] bg-gray-800 px-1 rounded">Filtered</span>
          </div>
          <div className={`text-3xl font-bold ${stats.winRate >= 50 ? 'text-green-400' : 'text-yellow-400'}`}>
            {stats.winRate}%
          </div>
        </div>
        <div className="bg-trade-dark p-5 rounded-xl border border-gray-700 transition-all duration-300">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            Net P&L <span className="text-[10px] bg-gray-800 px-1 rounded">Filtered</span>
          </div>
          <div className={`text-3xl font-bold ${stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${stats.totalPnL}
          </div>
        </div>
        <div className="bg-trade-dark p-5 rounded-xl border border-gray-700">
          <div className="text-gray-400 text-sm mb-1">Trades Found</div>
          <div className="text-3xl font-bold text-white">{stats.total}</div>
        </div>
      </div>

      {/* Controls Bar: Search, Filter, Sort */}
      <div className="bg-trade-dark rounded-xl border border-gray-700 p-4 flex flex-col md:flex-row gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1 w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search pairs, notes..." 
              className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-trade-accent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
             <select 
                className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none focus:border-trade-accent"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
             >
                <option value="all">All Types</option>
                <option value="buy">Buys Only</option>
                <option value="sell">Sells Only</option>
             </select>

             <select 
                className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none focus:border-trade-accent"
                value={filterOutcome}
                onChange={(e) => setFilterOutcome(e.target.value as any)}
             >
                <option value="all">All Outcomes</option>
                <option value="win">Wins</option>
                <option value="loss">Losses</option>
                <option value="breakeven">Breakeven</option>
             </select>
          </div>

          {/* Sort Actions */}
          <div className="flex gap-2 w-full md:w-auto">
            <button 
                onClick={() => handleSort('date')}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm border transition ${
                  sortConfig.key === 'date' 
                    ? 'bg-trade-accent/10 border-trade-accent text-trade-accent' 
                    : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'
                }`}
            >
               <Calendar className="h-4 w-4" /> Date 
               {sortConfig.key === 'date' && (
                 <ArrowUpDown className={`h-3 w-3 ml-1 transition-transform ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} />
               )}
            </button>

            <button 
                onClick={() => handleSort('pnl')}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm border transition ${
                  sortConfig.key === 'pnl' 
                    ? 'bg-trade-accent/10 border-trade-accent text-trade-accent' 
                    : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'
                }`}
            >
               <DollarSign className="h-4 w-4" /> P&L
               {sortConfig.key === 'pnl' && (
                 <ArrowUpDown className={`h-3 w-3 ml-1 transition-transform ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} />
               )}
            </button>
          </div>
      </div>

      {/* Data Table */}
      <div className="bg-trade-dark rounded-xl border border-gray-700 overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[800px]">
          <thead className="bg-gray-800 text-gray-400">
            <tr>
              <th className="p-4 font-medium whitespace-nowrap">Date</th>
              <th className="p-4 font-medium">Pair</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium">Setup Notes</th>
              <th className="p-4 font-medium text-center">Chart</th>
              <th className="p-4 font-medium">AI Check</th>
              <th className="p-4 font-medium text-right">P&L</th>
              <th className="p-4 font-medium text-center">Outcome</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {processedEntries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-800/50 transition group">
                <td className="p-4 text-gray-300 font-mono text-xs">
                  {new Date(entry.date).toLocaleDateString()}
                </td>
                <td className="p-4 font-bold text-white">{entry.pair}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase flex items-center gap-1 w-fit ${
                    entry.type === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {entry.type === 'buy' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {entry.type}
                  </span>
                </td>
                <td className="p-4 text-gray-400 max-w-xs truncate" title={entry.notes}>
                  {entry.notes || <span className="text-gray-600 italic">No notes</span>}
                </td>
                <td className="p-4 text-center">
                  {entry.screenshotUrl ? (
                    <button 
                      onClick={() => setPreviewImage(entry.screenshotUrl!)}
                      className="text-gray-400 hover:text-trade-accent transition p-1.5 rounded-lg hover:bg-gray-700 bg-gray-800/50 border border-gray-700"
                      title="View Chart"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </button>
                  ) : (
                    <span className="text-gray-700">-</span>
                  )}
                </td>
                <td className="p-4">
                  {entry.validationResult === 'approved' && <span className="text-green-400 text-xs border border-green-500/30 bg-green-500/10 px-2 py-1 rounded flex items-center gap-1 w-fit"><CheckCircleIcon /> Approved</span>}
                  {entry.validationResult === 'warning' && <span className="text-yellow-400 text-xs border border-yellow-500/30 bg-yellow-500/10 px-2 py-1 rounded flex items-center gap-1 w-fit"><AlertIcon /> Warning</span>}
                  {entry.validationResult === 'rejected' && <span className="text-red-400 text-xs border border-red-500/30 bg-red-500/10 px-2 py-1 rounded flex items-center gap-1 w-fit"><XCircleIcon /> Rejected</span>}
                  {entry.validationResult === 'none' && <span className="text-gray-600 text-xs">-</span>}
                </td>
                <td className={`p-4 text-right font-mono font-bold ${
                  entry.pnl && entry.pnl > 0 ? 'text-green-400' : 
                  entry.pnl && entry.pnl < 0 ? 'text-red-400' : 'text-gray-500'
                }`}>
                  {entry.pnl ? (entry.pnl > 0 ? `+$${entry.pnl}` : `$${entry.pnl}`) : '-'}
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                        entry.status === 'win' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 
                        entry.status === 'loss' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 
                        entry.status === 'breakeven' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`}></span>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <button className="text-gray-600 hover:text-white transition opacity-0 group-hover:opacity-100">
                    <MoreHorizontal className="h-4 w-4" />
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

      {/* Add Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-trade-dark border border-gray-700 rounded-2xl w-full max-w-2xl shadow-2xl my-8 animate-in fade-in zoom-in duration-200">
            <form onSubmit={handleSubmit}>
              <div className="flex justify-between items-center p-6 border-b border-gray-700 bg-gray-800/50 rounded-t-2xl">
                <h2 className="text-xl font-bold text-white">Log New Trade</h2>
                <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-white">
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {/* Top Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="col-span-1">
                    <label className="block text-xs text-gray-400 mb-1">Pair</label>
                    <input 
                      type="text" 
                      required
                      className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-trade-accent outline-none uppercase font-bold"
                      value={formData.pair}
                      onChange={e => setFormData({...formData, pair: e.target.value.toUpperCase()})}
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs text-gray-400 mb-1">Date</label>
                    <input 
                      type="date" 
                      required
                      className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-trade-accent outline-none"
                      value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-400 mb-1">Direction</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className={`flex-1 py-2 rounded font-bold text-sm flex items-center justify-center gap-2 border transition ${formData.type === 'buy' ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-gray-900 border-gray-600 text-gray-500 hover:bg-gray-800'}`}
                        onClick={() => setFormData({...formData, type: 'buy'})}
                      >
                        <ArrowUpRight className="h-4 w-4" /> BUY
                      </button>
                      <button
                        type="button"
                        className={`flex-1 py-2 rounded font-bold text-sm flex items-center justify-center gap-2 border transition ${formData.type === 'sell' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-gray-900 border-gray-600 text-gray-500 hover:bg-gray-800'}`}
                        onClick={() => setFormData({...formData, type: 'sell'})}
                      >
                        <ArrowDownRight className="h-4 w-4" /> SELL
                      </button>
                    </div>
                  </div>
                </div>

                {/* Prices */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-800/30 p-4 rounded-lg border border-gray-700">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Entry Price</label>
                    <input 
                      type="number" step="0.00001"
                      className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white outline-none focus:border-blue-500"
                      value={formData.entryPrice}
                      onChange={e => setFormData({...formData, entryPrice: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Stop Loss</label>
                    <input 
                      type="number" step="0.00001"
                      className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white outline-none text-red-400 focus:border-red-500"
                      value={formData.stopLoss}
                      onChange={e => setFormData({...formData, stopLoss: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Take Profit</label>
                    <input 
                      type="number" step="0.00001"
                      className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white outline-none text-green-400 focus:border-green-500"
                      value={formData.takeProfit}
                      onChange={e => setFormData({...formData, takeProfit: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Exit Price</label>
                    <input 
                      type="number" step="0.00001"
                      className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white outline-none"
                      value={formData.exitPrice || ''}
                      onChange={e => setFormData({...formData, exitPrice: Number(e.target.value)})}
                    />
                  </div>
                </div>

                {/* Outcome & PnL */}
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="block text-xs text-gray-400 mb-1">Outcome</label>
                    <select 
                      className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white outline-none"
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value as TradeOutcome})}
                    >
                      <option value="pending">Pending / Open</option>
                      <option value="win">Win</option>
                      <option value="loss">Loss</option>
                      <option value="breakeven">Breakeven</option>
                    </select>
                   </div>
                   <div>
                    <label className="block text-xs text-gray-400 mb-1">Realized P&L ($)</label>
                    <input 
                      type="number"
                      placeholder="0.00"
                      className={`w-full bg-gray-900 border border-gray-600 rounded p-2 outline-none font-bold ${
                        (formData.pnl || 0) > 0 ? 'text-green-400' : (formData.pnl || 0) < 0 ? 'text-red-400' : 'text-white'
                      }`}
                      value={formData.pnl || ''}
                      onChange={e => setFormData({...formData, pnl: Number(e.target.value)})}
                    />
                   </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Setup Notes</label>
                  <textarea 
                    rows={3}
                    className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white outline-none resize-none focus:border-trade-accent"
                    placeholder="Describe your confluence (e.g., 15m FVG, Liquidity Sweep...)"
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                  />
                </div>

                {/* Screenshot Upload */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2">Chart Screenshot</label>
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
                                className="bg-gray-900/80 p-2 rounded text-white hover:text-trade-accent"
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
                        <div className="bg-gray-700 p-3 rounded-full inline-flex mb-3">
                          <Upload className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-300 font-medium">Click to upload chart</p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Emotions */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2">Emotional State</label>
                  <div className="flex flex-wrap gap-2">
                    {EMOTIONS.map(emo => (
                      <button
                        key={emo}
                        type="button"
                        onClick={() => toggleEmotion(emo)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition border ${
                          formData.emotions?.includes(emo) 
                            ? 'bg-blue-500 text-white border-blue-500' 
                            : 'bg-gray-800 text-gray-400 border-gray-600 hover:border-gray-400'
                        }`}
                      >
                        {emo}
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Validation (Read Only) */}
                {formData.validationResult && formData.validationResult !== 'none' && (
                   <div className="bg-gray-900 p-3 rounded border border-gray-700 flex items-center justify-between">
                      <span className="text-sm text-gray-400">AI Verification Status</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                        formData.validationResult === 'approved' ? 'bg-green-500/20 text-green-400' :
                        formData.validationResult === 'rejected' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {formData.validationResult}
                      </span>
                   </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-700 flex justify-end gap-3 bg-gray-800/50 rounded-b-2xl">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-trade-accent hover:bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 transition shadow-lg shadow-blue-900/20"
                >
                  <Save className="h-4 w-4" /> Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Tiny Helper Components for Icons
const CheckCircleIcon = () => <div className="h-3 w-3 rounded-full border border-current flex items-center justify-center"><div className="h-1.5 w-2 border-b border-r border-current rotate-45 -mt-0.5"></div></div>;
const AlertIcon = () => <div className="h-3 w-3 rounded-full border border-current flex items-center justify-center text-[8px] font-bold">!</div>;
const XCircleIcon = () => <div className="h-3 w-3 rounded-full border border-current flex items-center justify-center text-[8px]">x</div>;

export default TradeJournal;