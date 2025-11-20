import React, { useState } from 'react';
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import AITradeAssistant from './components/AITradeAssistant';
import TradeJournal from './components/TradeJournal';
import AdminPortal from './components/AdminPortal';
import RuleBuilder from './components/RuleBuilder';
import CourseBuilder from './components/CourseBuilder';
import EliteApplicationForm from './components/EliteApplicationForm';
import QuizPlayer from './components/QuizPlayer';
import CommunityHub from './components/CommunityHub';
import CourseManagementSystem from './components/enhanced/CourseManagementSystem';
import { User, UserRole, CourseModule, TradeRule, TradeEntry, MentorshipApplication, StudentProfile } from './types';
import { Lock, Settings, GraduationCap, BarChart, Bot, PlayCircle, CheckSquare, FileText, ArrowRight, ShieldAlert } from 'lucide-react';
import { supabase } from './supabase/client';

// --- MOCK DATA ---

// Mock Classroom Data for Admin Portal
const MOCK_STUDENTS: StudentProfile[] = [
  {
    id: 's1', name: 'Dan Student', email: 'dan@student.com', tier: 'professional', joinedDate: '2025-09-10',
    status: 'active',
    stats: { winRate: 65, totalPnL: 1250, tradesCount: 42, avgRiskReward: 2.1, currentDrawdown: 3.2 },
    recentTrades: [
      { id: 't1', pair: 'EURUSD', type: 'buy', entryPrice: 1.08, stopLoss: 1.07, takeProfit: 1.1, status: 'win', validationResult: 'approved', notes: 'Clean break', date: '2025-10-24', pnl: 450 },
      { id: 't2', pair: 'US30', type: 'sell', entryPrice: 34000, stopLoss: 34100, takeProfit: 33500, status: 'loss', validationResult: 'warning', notes: 'Forced entry', date: '2025-10-23', pnl: -200 }
    ]
  },
  {
    id: 's2', name: 'Sarah Jenkins', email: 'sarah.j@gmail.com', tier: 'elite', joinedDate: '2025-08-15',
    status: 'active',
    stats: { winRate: 72, totalPnL: 5800, tradesCount: 89, avgRiskReward: 3.5, currentDrawdown: 1.5 },
    recentTrades: [
      { id: 't3', pair: 'XAUUSD', type: 'buy', entryPrice: 1950, stopLoss: 1945, takeProfit: 1970, status: 'win', validationResult: 'approved', notes: 'Gold liquidity sweep', date: '2025-10-24', pnl: 1200 }
    ]
  },
  {
    id: 's3', name: 'Mike Ross', email: 'mike.r@law.com', tier: 'professional', joinedDate: '2025-10-01',
    status: 'at-risk',
    stats: { winRate: 35, totalPnL: -2100, tradesCount: 15, avgRiskReward: 1.1, currentDrawdown: 18.5 },
    recentTrades: [
      { id: 't4', pair: 'BTCUSD', type: 'buy', entryPrice: 65000, stopLoss: 64000, takeProfit: 68000, status: 'loss', validationResult: 'rejected', notes: 'FOMO buy at top', date: '2025-10-24', pnl: -800 },
      { id: 't5', pair: 'ETHUSD', type: 'buy', entryPrice: 3500, stopLoss: 3400, takeProfit: 3800, status: 'loss', validationResult: 'rejected', notes: 'Revenge trade', date: '2025-10-24', pnl: -600 }
    ]
  },
  {
    id: 's4', name: 'Jessica Pearson', email: 'jessica@firm.com', tier: 'elite', joinedDate: '2025-07-20',
    status: 'active',
    stats: { winRate: 55, totalPnL: 890, tradesCount: 22, avgRiskReward: 2.8, currentDrawdown: 4.0 },
    recentTrades: []
  },
  {
    id: 's5', name: 'Harvey Specter', email: 'harvey@closer.com', tier: 'foundation', joinedDate: '2025-10-05',
    status: 'inactive',
    stats: { winRate: 0, totalPnL: 0, tradesCount: 0, avgRiskReward: 0, currentDrawdown: 0 },
    recentTrades: []
  }
];

const MOCK_RULES: TradeRule[] = [
  { id: '1', text: 'Has price taken liquidity from previous day low?', type: 'buy', required: true },
  { id: '2', text: 'Is there an unmitigated Fair Value Gap below current price?', type: 'buy', required: true },
  { id: '3', text: 'Has market structure broken to the upside (MSS)?', type: 'buy', required: true },
  { id: '4', text: 'Is your risk-to-reward ratio at least 1:2?', type: 'buy', required: true },
  { id: '5', text: 'Has price taken liquidity from previous day high?', type: 'sell', required: true },
  { id: '6', text: 'Is there an unmitigated Fair Value Gap above current price?', type: 'sell', required: true },
];

const MOCK_COURSES: CourseModule[] = [
  { id: '1', title: 'Market Structure & CRT', description: 'Understanding the foundation.', duration: '45m', level: 'beginner', completed: true, locked: false, contentType: 'video', content: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
  {
    id: '2', title: 'Fair Value Gaps Mastery', description: 'Identifying high probability gaps.', duration: '60m', level: 'intermediate', completed: false, locked: false, contentType: 'text', content: '## Fair Value Gaps\n\nAn FVG is a 3-candle pattern...',
    quiz: {
      id: 'q2',
      passingScore: 70,
      questions: [
        { id: '2a', text: 'What is the minimum number of candles required to form an FVG?', options: ['2 Candles', '3 Candles', '5 Candles', '1 Candle'], correctOptionIndex: 1 },
        { id: '2b', text: 'For a Bullish FVG, the gap exists between:', options: ['Candle 1 Low and Candle 3 High', 'Candle 1 High and Candle 3 Low', 'Candle 2 High and Candle 2 Low', 'None of the above'], correctOptionIndex: 1 },
        { id: '2c', text: 'An FVG is considered "mitigated" when:', options: ['Price touches the gap', 'Price closes above the gap', 'Price never returns', 'The gap is too small'], correctOptionIndex: 0 },
      ]
    }
  },
  { id: '3', title: 'Liquidity Concepts', description: 'Where are the stops?', duration: '55m', level: 'intermediate', completed: false, locked: true, contentType: 'video' },
  { id: '4', title: 'Advanced Executions', description: 'Precision entries.', duration: '90m', level: 'advanced', completed: false, locked: true, contentType: 'video' },
];

const INITIAL_ENTRIES: TradeEntry[] = [
  {
    id: '101', pair: 'EURUSD', type: 'buy', entryPrice: 1.0850, stopLoss: 1.0820, takeProfit: 1.0910,
    status: 'win', pnl: 320, validationResult: 'approved', notes: 'Clean CRT setup off 1H FVG.', date: '2025-10-10', emotions: ['Confident']
  },
  {
    id: '102', pair: 'GBPUSD', type: 'sell', entryPrice: 1.2100, stopLoss: 1.2130, takeProfit: 1.2040,
    status: 'loss', pnl: -150, validationResult: 'warning', notes: 'Entered too early, missed the sweep.', date: '2025-10-12', emotions: ['FOMO', 'Anxious']
  },
  {
    id: '103', pair: 'NAS100', type: 'buy', entryPrice: 14500, stopLoss: 14450, takeProfit: 14650,
    status: 'win', pnl: 450, validationResult: 'approved', notes: 'News play, waited for displacement.', date: '2025-10-14', emotions: ['Disciplined']
  },
  {
    id: '105', pair: 'US30', type: 'buy', entryPrice: 33000, stopLoss: 32900, takeProfit: 33200,
    status: 'win', pnl: 600, validationResult: 'approved', notes: 'Perfect retest of order block.', date: '2025-10-18', emotions: ['Flow']
  }
];

const MOCK_USER_ELITE_PENDING: User = {
  id: '2',
  name: 'Pending Applicant',
  email: 'applicant@test.com',
  role: 'student',
  subscriptionTier: 'elite-pending',
  progress: 0
};

// --- APP COMPONENT ---

type AppViewState = 'landing' | 'login' | 'portal' | 'application';

function App() {
  // App Logic State
  const [viewState, setViewState] = useState<AppViewState>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [portalView, setPortalView] = useState('dashboard'); // Internal view within layout
  const [activeLesson, setActiveLesson] = useState<CourseModule | null>(null);
  const [lessonTab, setLessonTab] = useState<'content' | 'quiz'>('content');

  // Data State
  const [journalEntries, setJournalEntries] = useState<TradeEntry[]>(INITIAL_ENTRIES);
  const [draftJournalEntry, setDraftJournalEntry] = useState<Partial<TradeEntry> | null>(null);
  const [tradeRules, setTradeRules] = useState<TradeRule[]>(MOCK_RULES);
  const [courses, setCourses] = useState<CourseModule[]>(MOCK_COURSES);

  // --- SUPABASE AUTH ---
  React.useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email!);
        setViewState('portal');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email!);
        setViewState('portal');
      } else {
        setUser(null);
        setViewState('landing');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, email: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        console.log('Profile found:', data);
        setUser({
          id: data.id,
          name: data.full_name || email.split('@')[0],
          email: email,
          role: data.role as any,
          subscriptionTier: data.subscription_tier as any,
          progress: 0
        });

        // Set default view based on Role
        if (data.role === 'admin') {
          setPortalView('admin-dashboard');
        } else {
          setPortalView('dashboard');
        }
      } else {
        console.error('No profile found for user:', userId);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // --- HANDLERS ---

  const handleNavigationRequest = (tier: 'free' | 'foundation' | 'professional' | 'elite') => {
    if (tier === 'elite') {
      setViewState('application');
    } else {
      // For Free/Foundation/Pro, we send them to Login/Register logic
      // For this demo, we go straight to the login screen
      setViewState('login');
    }
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setViewState('portal');

    // Set default view based on Role
    if (loggedInUser.role === 'admin') {
      setPortalView('admin-dashboard');
    } else {
      setPortalView('dashboard');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setViewState('landing');
    setPortalView('dashboard');
  };

  const handleApplicationSubmit = (data: MentorshipApplication) => {
    const applicantUser: User = {
      ...MOCK_USER_ELITE_PENDING,
      name: data.fullName,
      email: data.email
    };
    // Auto-login as the pending user
    setUser(applicantUser);
    setViewState('portal');
    setPortalView('dashboard');
  };

  // Journal Handlers
  const handleAddJournalEntry = (entry: TradeEntry) => {
    setJournalEntries(prev => [entry, ...prev]);
  };

  const handleLogTradeFromAI = (tradeData: Partial<TradeEntry>) => {
    setDraftJournalEntry(tradeData);
    setPortalView('journal');
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

  // Course Builder Handlers
  const handleAddCourse = (module: CourseModule) => {
    setCourses(prev => [...prev, module]);
  };

  const handleUpdateCourse = (id: string, updates: Partial<CourseModule>) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleDeleteCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const handleStartLesson = (module: CourseModule) => {
    setActiveLesson(module);
    setLessonTab('content');
    setPortalView('lesson');
  };

  const handleQuizCompletion = (moduleId: string, score: number, passed: boolean) => {
    if (passed) {
      handleUpdateCourse(moduleId, { completed: true });
      // Optional: Show toast notification or celebration logic here
    }
  };

  // --- RENDER LOGIC ---

  if (viewState === 'landing') {
    return <LandingPage onSelectTier={handleNavigationRequest} />;
  }

  if (viewState === 'application') {
    return (
      <EliteApplicationForm
        onSubmit={handleApplicationSubmit}
        onCancel={() => setViewState('landing')}
      />
    );
  }

  if (viewState === 'login') {
    return (
      <LoginPage
        onBack={() => setViewState('landing')}
      />
    );
  }

  // Authenticated Portal View
  if (user) {
    const renderContent = () => {
      // --- ACCESS CONTROL CHECK ---
      if (user.role !== 'admin' && portalView.startsWith('admin-')) {
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in fade-in zoom-in duration-300">
            <div className="bg-red-500/10 p-6 rounded-full mb-6 border border-red-500/20">
              <ShieldAlert className="h-12 w-12 text-red-500" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Unauthorized Access</h2>
            <p className="text-gray-400 max-w-md mb-8">
              You do not have permission to view this area. This incident has been logged.
            </p>
            <button
              onClick={() => setPortalView('dashboard')}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition border border-gray-700"
            >
              Return to Dashboard
            </button>
          </div>
        );
      }

      // --- ADMIN VIEWS ---
      if (user.role === 'admin') {
        switch (portalView) {
          case 'admin-dashboard':
            return <AdminPortal courses={courses} initialTab="overview" />;
          case 'admin-students':
            return <AdminPortal courses={courses} initialTab="directory" />;
          case 'admin-trades':
            return <AdminPortal courses={courses} initialTab="trades" />;
          case 'admin-analytics':
            return <AdminPortal courses={courses} initialTab="analytics" />;
          case 'admin-rules':
            return (
              <RuleBuilder
                rules={tradeRules}
                onAdd={handleAddRule}
                onUpdate={handleUpdateRule}
                onDelete={handleDeleteRule}
                onReorder={handleReorderRules}
              />
            );
          case 'admin-content':
            // Map User to StudentProfile for CourseManagementSystem
            const adminProfile: StudentProfile = {
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
            };
            
            return (
              <CourseManagementSystem
                currentUser={adminProfile}
                isAdmin={true}
              />
            );
          default:
            return (
              <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
                <Settings className="h-12 w-12 mb-4 text-gray-700" />
                <h2 className="text-2xl font-bold mb-2 text-white">Module Under Construction</h2>
                <p>The {portalView} is being built by the engineering team.</p>
              </div>
            );
        }
      }

      // --- STUDENT VIEWS ---
      switch (portalView) {
        case 'dashboard':
          return (
            <Dashboard
              user={user}
              courses={courses}
              trades={journalEntries}
              onContinueCourse={() => setPortalView('courses')}
            />
          );
        case 'ai':
          // Access Control: Only Professional and Elite tiers can access AI
          const hasAccess = user.subscriptionTier === 'professional' || user.subscriptionTier === 'elite';

          if (!hasAccess) {
            return (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-lg mx-auto animate-in fade-in zoom-in duration-300">
                <div className="bg-gray-800 p-6 rounded-full mb-6 relative">
                  <Lock className="h-12 w-12 text-gray-500" />
                  <div className="absolute -top-1 -right-1 bg-trade-neon/20 text-trade-neon text-xs font-bold px-2 py-1 rounded-full border border-trade-neon/50">PRO</div>
                </div>

                <h2 className="text-3xl font-bold text-white mb-4">Professional Feature</h2>

                {user.subscriptionTier === 'elite-pending' ? (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-xl text-yellow-200 max-w-md">
                    <p className="font-bold mb-2 text-lg">Application Under Review</p>
                    <p className="text-sm opacity-80">
                      Your application for the Elite Mentorship is currently being processed by our team.
                      Access to the AI Assistant will be unlocked upon approval.
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-400 mb-8 text-lg leading-relaxed">
                      The AI Trade Assistant is exclusively available to <span className="text-trade-neon font-bold">Professional</span> and <span className="text-purple-500 font-bold">Elite</span> members.
                    </p>

                    <div className="space-y-3 w-full max-w-sm text-left">
                      <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 flex gap-4 items-center">
                        <div className="bg-trade-neon/10 p-2 rounded-lg text-trade-neon"><Bot className="h-5 w-5" /></div>
                        <div>
                          <div className="text-white font-bold text-sm">AI Trade Guard</div>
                          <p className="text-xs text-gray-500">Real-time setup validation</p>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 flex gap-4 items-center">
                        <div className="bg-purple-500/10 p-2 rounded-lg text-purple-400"><BarChart className="h-5 w-5" /></div>
                        <div>
                          <div className="text-white font-bold text-sm">Advanced Analytics</div>
                          <p className="text-xs text-gray-500">Performance breakdown by pair</p>
                        </div>
                      </div>
                    </div>

                    <button className="mt-8 w-full max-w-sm py-4 bg-trade-neon text-black font-black text-lg rounded-xl hover:bg-green-400 transition shadow-lg shadow-trade-neon/20">
                      Upgrade to Professional
                    </button>
                  </>
                )}
              </div>
            );
          }

          return (
            <AITradeAssistant
              userRules={tradeRules}
              onLogTrade={handleLogTradeFromAI}
            />
          );
        case 'journal':
          return (
            <TradeJournal
              entries={journalEntries}
              onAddEntry={handleAddJournalEntry}
              draftEntry={draftJournalEntry}
              onClearDraft={() => setDraftJournalEntry(null)}
            />
          );
        case 'courses':
          // Map User to StudentProfile for CourseManagementSystem
          const studentProfile: StudentProfile = {
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
          };
          
          return (
            <CourseManagementSystem
              currentUser={studentProfile}
              isAdmin={false}
            />
          );

        case 'lesson':
          if (!activeLesson) return <div>Lesson not found</div>;

          return (
            <div className="max-w-4xl mx-auto text-white pb-10">
              <button
                onClick={() => setPortalView('courses')}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition"
              >
                ← Back to Curriculum
              </button>

              <div className="flex items-center gap-4 mb-6 border-b border-gray-800">
                <button
                  onClick={() => setLessonTab('content')}
                  className={`px-4 py-3 font-bold text-sm border-b-2 transition ${lessonTab === 'content'
                    ? 'border-trade-accent text-white'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                    }`}
                >
                  Lesson Content
                </button>
                {activeLesson.quiz && (
                  <button
                    onClick={() => setLessonTab('quiz')}
                    className={`px-4 py-3 font-bold text-sm border-b-2 transition flex items-center gap-2 ${lessonTab === 'quiz'
                      ? 'border-trade-accent text-white'
                      : 'border-transparent text-gray-500 hover:text-gray-300'
                      }`}
                  >
                    <CheckSquare className="h-4 w-4" /> Quiz
                  </button>
                )}
              </div>

              <div className="bg-black border border-gray-800 rounded-2xl overflow-hidden shadow-2xl mb-8 min-h-[500px]">
                {lessonTab === 'content' ? (
                  <>
                    {activeLesson.contentType === 'video' ? (
                      <div className="aspect-video bg-gray-900 flex items-center justify-center relative">
                        {/* Mock Video Player UI */}
                        <div className="absolute inset-0 flex items-center justify-center group">
                          <PlayCircle className="h-20 w-20 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition duration-300 cursor-pointer" />
                        </div>
                        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent p-4">
                          <div className="flex justify-between items-end">
                            <div>
                              <h2 className="font-bold text-lg">{activeLesson.title}</h2>
                              <p className="text-sm text-gray-300">Chapter 1: Fundamentals</p>
                            </div>
                            <span className="text-xs font-mono bg-black/50 px-2 py-1 rounded border border-white/10">
                              {activeLesson.duration}
                            </span>
                          </div>
                          <div className="w-full h-1 bg-gray-700 mt-4 rounded-full overflow-hidden">
                            <div className="w-1/3 h-full bg-trade-neon"></div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-12 bg-trade-dark min-h-[400px]">
                        <h2 className="text-3xl font-bold mb-8">{activeLesson.title}</h2>
                        <div className="prose prose-invert max-w-none">
                          {/* Simple markdown-like rendering for demo */}
                          {activeLesson.content?.split('\n').map((line, i) => {
                            if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold mb-4 text-white">{line.substring(2)}</h1>;
                            if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mb-3 text-white mt-8">{line.substring(3)}</h2>;
                            if (line.trim() === '') return <br key={i} />;
                            return <p key={i} className="text-gray-300 leading-relaxed mb-4">{line}</p>;
                          })}
                          {!activeLesson.content && (
                            <div className="text-center text-gray-500 py-10">
                              <div className="mb-4">No text content available for this module.</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-8 bg-trade-dark h-full">
                    {activeLesson.quiz ? (
                      <QuizPlayer
                        quiz={activeLesson.quiz}
                        onComplete={(score, passed) => handleQuizCompletion(activeLesson.id, score, passed)}
                        onRetake={() => { }}
                      />
                    ) : (
                      <div className="text-center p-12 text-gray-500">No quiz available for this module.</div>
                    )}
                  </div>
                )}
              </div>

              {lessonTab === 'content' && (
                <div className="flex justify-between items-center bg-trade-dark p-6 rounded-xl border border-gray-800">
                  <div>
                    <h3 className="font-bold text-lg mb-1">Lesson Complete?</h3>
                    <p className="text-sm text-gray-400">
                      {activeLesson.quiz ? "Take the quiz to complete this module." : "Mark this module as finished to unlock the next chapter."}
                    </p>
                  </div>
                  {activeLesson.quiz ? (
                    <button
                      onClick={() => setLessonTab('quiz')}
                      className="px-8 py-3 bg-trade-accent hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition flex items-center gap-2"
                    >
                      Proceed to Quiz <ArrowRight className="h-5 w-5" />
                    </button>
                  ) : (
                    <button className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg shadow-green-900/20 transition flex items-center gap-2">
                      Complete & Continue →
                    </button>
                  )}
                </div>
              )}
            </div>
          );

        case 'community':
          return <CommunityHub />;
        default:
          return <div>View Not Found</div>;
      }
    };

    return (
      <Layout
        user={user}
        currentView={portalView}
        onChangeView={setPortalView}
        onLogout={handleLogout}
      >
        {renderContent()}
      </Layout>
    );
  }

  return null; // Should not reach here
}

export default App;
