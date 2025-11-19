
export type UserRole = 'admin' | 'student' | 'pending';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  subscriptionTier: 'foundation' | 'professional' | 'elite' | 'elite-pending' | null;
  progress: number;
}

export interface TradeRule {
  id: string;
  text: string;
  type: 'buy' | 'sell';
  required: boolean;
}

export type TradeOutcome = 'win' | 'loss' | 'breakeven' | 'pending';
export type TradeValidationStatus = 'approved' | 'warning' | 'rejected' | 'none';

export interface TradeEntry {
  id: string;
  pair: string;
  type: 'buy' | 'sell';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  exitPrice?: number;
  status: TradeOutcome;
  validationResult: TradeValidationStatus;
  notes: string;
  date: string;
  emotions?: string[]; // e.g., 'confident', 'fomo', 'anxious'
  pnl?: number;        // Realized P&L
  screenshotUrl?: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
}

export interface Quiz {
  id: string;
  questions: QuizQuestion[];
  passingScore?: number; // Percentage
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  completed: boolean;
  locked: boolean;
  content?: string; // Video ID or text content
  contentType?: 'video' | 'text';
  quiz?: Quiz;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface MentorshipApplication {
  fullName: string;
  email: string;
  discordId: string;
  experienceYears: string;
  currentCapital: string;
  biggestStruggle: string;
  motivation: string; // Why they want to join
  commitmentAgreement: boolean;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  tier: 'foundation' | 'professional' | 'elite';
  joinedDate: string;
  stats: {
    winRate: number;
    totalPnL: number;
    tradesCount: number;
    avgRiskReward: number;
    currentDrawdown: number; // Percentage
  };
  recentTrades: TradeEntry[];
  status: 'active' | 'at-risk' | 'inactive';
}
