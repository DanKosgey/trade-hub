
import React, { useState, useRef } from 'react';
import { TradeRule } from '../types';
import { 
  Plus, Trash2, Edit2, CheckCircle, ArrowDown, 
  Save, X, Zap, RefreshCw, Settings, PlayCircle, GripVertical 
} from 'lucide-react';

interface RuleBuilderProps {
  rules: TradeRule[];
  onAdd: (rule: TradeRule) => void;
  onUpdate: (id: string, updates: Partial<TradeRule>) => void;
  onDelete: (id: string) => void;
  onReorder: (rules: TradeRule[]) => void;
}

const RuleBuilder: React.FC<RuleBuilderProps> = ({ rules, onAdd, onUpdate, onDelete, onReorder }) => {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editType, setEditType] = useState<'buy' | 'sell'>('buy');
  
  // Drag & Drop Refs
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  
  // Simulation State
  const [testScenario, setTestScenario] = useState('');
  const [simulatedResult, setSimulatedResult] = useState<'approved' | 'rejected' | 'warning' | null>(null);

  const activeRules = rules.filter(r => r.type === activeTab);

  const handleStartEdit = (rule: TradeRule) => {
    setEditingId(rule.id);
    setEditText(rule.text);
    setEditType(rule.type);
  };

  const handleSaveEdit = () => {
    if (editingId) {
      onUpdate(editingId, { text: editText, type: editType });
      setEditingId(null);
      
      if (editType !== activeTab) {
        setActiveTab(editType);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleAddNew = () => {
    const newRule: TradeRule = {
      id: Date.now().toString(),
      text: 'New validation criteria...',
      type: activeTab,
      required: true
    };
    onAdd(newRule);
    setEditingId(newRule.id);
    setEditText(newRule.text);
    setEditType(activeTab);
  };

  const toggleRequired = (rule: TradeRule) => {
    onUpdate(rule.id, { required: !rule.required });
  };

  // --- Drag & Drop Handlers ---
  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    const dragIndex = dragItem.current;
    const dragOverIndex = dragOverItem.current;

    if (dragIndex === null || dragOverIndex === null || dragIndex === dragOverIndex) {
        dragItem.current = null;
        dragOverItem.current = null;
        return;
    }

    // Reorder the active subset
    const newActiveRules = [...activeRules];
    const draggedItemContent = newActiveRules[dragIndex];
    newActiveRules.splice(dragIndex, 1);
    newActiveRules.splice(dragOverIndex, 0, draggedItemContent);

    // Merge back with the inactive rules (keep inactive ones at the end or separate, order doesn't matter for them)
    const otherRules = rules.filter(r => r.type !== activeTab);
    
    // Update global state
    onReorder([...newActiveRules, ...otherRules]);

    // Reset refs
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const runSimulation = () => {
    if (!testScenario) return;
    
    const scenarioLower = testScenario.toLowerCase();
    const ruleMatches = activeRules.map(r => {
        const keywords = r.text.toLowerCase().split(' ').filter(w => w.length > 3);
        const matchCount = keywords.filter(k => scenarioLower.includes(k)).length;
        return { rule: r, passed: matchCount >= 1 }; 
    });

    const allRequiredPassed = ruleMatches.every(r => !r.rule.required || r.passed);
    
    if (allRequiredPassed) {
        setSimulatedResult('approved');
    } else {
        setSimulatedResult('rejected');
    }
  };

  return (
    <div className="text-white h-full flex flex-col pb-10">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="h-8 w-8 text-purple-500" /> 
            Protocol Logic Engine
          </h1>
          <p className="text-gray-400 mt-1">Visually design and prioritize the brain of your AI Trade Assistant.</p>
        </div>
        <div className="flex bg-gray-800 p-1 rounded-lg border border-gray-700">
            <button 
                onClick={() => setActiveTab('buy')}
                className={`px-6 py-2 rounded-md text-sm font-bold transition ${activeTab === 'buy' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'text-gray-400 hover:text-white'}`}
            >
                Long Setups (BUY)
            </button>
            <button 
                onClick={() => setActiveTab('sell')}
                className={`px-6 py-2 rounded-md text-sm font-bold transition ${activeTab === 'sell' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-gray-400 hover:text-white'}`}
            >
                Short Setups (SELL)
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
        {/* Logic Flow Builder */}
        <div className="lg:col-span-2 bg-trade-dark border border-gray-700 rounded-2xl p-8 relative overflow-hidden flex flex-col">
             {/* Background Grid */}
             <div className="absolute inset-0 opacity-10 pointer-events-none" 
                style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
             </div>

             <div className="relative z-10 flex-1 flex flex-col items-center max-w-2xl mx-auto w-full">
                
                {/* Start Node */}
                <div className="mb-8">
                    <div className="bg-gray-800 border-2 border-gray-600 rounded-full px-8 py-3 font-bold text-gray-300 shadow-lg flex items-center gap-2">
                        <PlayCircle className="h-5 w-5" /> Trade Signal Detected
                    </div>
                    <div className="h-8 w-0.5 bg-gray-600 mx-auto"></div>
                    <ArrowDown className="h-4 w-4 text-gray-600 mx-auto -mt-1" />
                </div>

                {/* Rules List */}
                <div className="w-full space-y-4">
                    {activeRules.map((rule, index) => (
                        <div 
                            key={rule.id} 
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragEnter={() => handleDragEnter(index)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => e.preventDefault()}
                            className="relative group cursor-move"
                        >
                            {/* Connecting Line */}
                            {index !== activeRules.length - 1 && (
                                <div className="absolute left-1/2 top-full h-4 w-0.5 bg-gray-700 -ml-[1px] z-0"></div>
                            )}

                            <div className={`relative z-10 bg-gray-900 border rounded-xl p-4 shadow-xl transition-all duration-300 ${
                                rule.required 
                                    ? 'border-l-4 border-l-red-500 border-y-gray-700 border-r-gray-700' 
                                    : 'border-l-4 border-l-yellow-500 border-y-gray-700 border-r-gray-700'
                            } hover:shadow-2xl hover:border-gray-500`}>
                                {editingId === rule.id ? (
                                    <div className="flex flex-col gap-3 cursor-default" onMouseDown={e => e.stopPropagation()}>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="text" 
                                                autoFocus
                                                value={editText}
                                                onChange={(e) => setEditText(e.target.value)}
                                                className="flex-1 bg-black border border-gray-600 rounded px-3 py-2 outline-none focus:border-purple-500"
                                            />
                                        </div>
                                        
                                        <div className="flex justify-between items-center border-t border-gray-800 pt-2 mt-1">
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className="text-gray-500 text-xs font-bold uppercase">Rule Type:</span>
                                                <div className="flex gap-1 bg-gray-950 p-1 rounded border border-gray-800">
                                                    <button 
                                                        onClick={() => setEditType('buy')}
                                                        className={`px-3 py-1 rounded text-[10px] font-bold transition ${editType === 'buy' ? 'bg-green-500/20 text-green-400' : 'text-gray-500 hover:text-gray-300'}`}
                                                    >
                                                        BUY
                                                    </button>
                                                    <button 
                                                        onClick={() => setEditType('sell')}
                                                        className={`px-3 py-1 rounded text-[10px] font-bold transition ${editType === 'sell' ? 'bg-red-500/20 text-red-400' : 'text-gray-500 hover:text-gray-300'}`}
                                                    >
                                                        SELL
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button onClick={handleCancelEdit} className="px-3 py-1.5 bg-gray-800 text-gray-400 rounded hover:text-white text-xs">Cancel</button>
                                                <button onClick={handleSaveEdit} className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-500 flex items-center gap-1 text-xs font-bold">
                                                    <Save className="h-3 w-3" /> Save
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            {/* Drag Handle */}
                                            <div className="cursor-move text-gray-600 hover:text-gray-400">
                                                <GripVertical className="h-5 w-5" />
                                            </div>
                                            
                                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center bg-gray-800 font-mono text-xs text-gray-500`}>
                                                {index + 1}
                                            </div>
                                            <span className="font-medium text-gray-200">{rule.text}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => toggleRequired(rule)}
                                                onMouseDown={e => e.stopPropagation()}
                                                className={`text-xs font-bold px-2 py-1 rounded border ${
                                                    rule.required 
                                                        ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20' 
                                                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/20'
                                                }`}
                                                title="Toggle Strictness"
                                            >
                                                {rule.required ? 'CRITICAL' : 'GUIDELINE'}
                                            </button>
                                            <button 
                                              onClick={() => handleStartEdit(rule)} 
                                              onMouseDown={e => e.stopPropagation()}
                                              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                                            >
                                              <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button 
                                              onClick={() => onDelete(rule.id)} 
                                              onMouseDown={e => e.stopPropagation()}
                                              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Add New Button */}
                    <div className="flex justify-center pt-2">
                        <button 
                            onClick={handleAddNew}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 border-dashed rounded-lg text-gray-400 hover:text-white transition"
                        >
                            <Plus className="h-4 w-4" /> Add Logic Node
                        </button>
                    </div>
                </div>

                {/* Final Outcome Node */}
                <div className="mt-8 text-center w-full">
                    <ArrowDown className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-xl">
                            <div className="font-bold text-green-400 mb-1">PASSED</div>
                            <p className="text-xs text-gray-400">Trade Approved</p>
                        </div>
                        <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-xl">
                            <div className="font-bold text-red-400 mb-1">FAILED</div>
                            <p className="text-xs text-gray-400">Trade Rejected</p>
                        </div>
                    </div>
                </div>

             </div>
        </div>

        {/* Simulation Panel */}
        <div className="bg-trade-dark border border-gray-700 rounded-2xl p-6 flex flex-col">
            <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-400" /> Simulation Lab
            </h3>
            <p className="text-sm text-gray-400 mb-6">Test your rule logic against hypothetical scenarios before publishing to students.</p>

            <div className="flex-1 flex flex-col gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Mock Student Input</label>
                    <textarea 
                        className="w-full h-32 bg-black border border-gray-600 rounded-xl p-3 text-white outline-none focus:border-purple-500 resize-none"
                        placeholder={`Describe a ${activeTab} setup scenario to test if your rules catch it...`}
                        value={testScenario}
                        onChange={(e) => setTestScenario(e.target.value)}
                    />
                </div>
                
                <button 
                    onClick={runSimulation}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition"
                >
                    <RefreshCw className="h-4 w-4" /> Run Test
                </button>

                {/* Simulation Results */}
                {simulatedResult && (
                    <div className={`mt-4 p-4 rounded-xl border animate-in fade-in slide-in-from-bottom-2 ${
                        simulatedResult === 'approved' 
                            ? 'bg-green-500/10 border-green-500/30' 
                            : 'bg-red-500/10 border-red-500/30'
                    }`}>
                        <div className="flex items-center gap-3 mb-2">
                            {simulatedResult === 'approved' 
                                ? <CheckCircle className="h-6 w-6 text-green-500" />
                                : <X className="h-6 w-6 text-red-500" />
                            }
                            <span className={`font-bold text-lg ${
                                simulatedResult === 'approved' ? 'text-green-400' : 'text-red-400'
                            }`}>
                                {simulatedResult === 'approved' ? 'TRADE APPROVED' : 'TRADE BLOCKED'}
                            </span>
                        </div>
                        <p className="text-xs text-gray-400">
                            Based on keyword analysis of your current {activeTab.toUpperCase()} logic stack.
                        </p>
                    </div>
                )}
            </div>

            <div className="mt-8 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                <h4 className="font-bold text-sm text-gray-300 mb-2">Stats</h4>
                <div className="flex justify-between text-xs text-gray-400">
                    <span>Active Rules:</span>
                    <span className="text-white font-mono">{activeRules.length}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Critical Checkpoints:</span>
                    <span className="text-red-400 font-mono">{activeRules.filter(r => r.required).length}</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RuleBuilder;
