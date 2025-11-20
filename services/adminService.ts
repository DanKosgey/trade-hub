import { supabase } from '../supabase/client';
import { StudentProfile, CourseModule, TradeEntry } from '../types';

// Function to fetch all students with their stats for admin portal
export const fetchAllStudents = async (): Promise<StudentProfile[]> => {
  try {
    // Using RPC to call our custom function
    const { data, error } = await supabase.rpc('get_all_students_for_admin');
    
    if (error) throw error;
    
    // Transform the data to match StudentProfile interface
    return data.map((student: any) => ({
      id: student.id,
      name: student.name,
      email: student.email,
      tier: student.tier,
      joinedDate: student.joined_date,
      status: student.status,
      stats: {
        winRate: student.win_rate || 0,
        totalPnL: student.total_pnl || 0,
        tradesCount: student.trades_count || 0,
        avgRiskReward: student.avg_risk_reward || 0,
        currentDrawdown: student.current_drawdown || 0
      },
      recentTrades: [] // Will be populated separately if needed
    }));
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};

// Function to fetch all trades with student info for admin portal
export const fetchAllTrades = async (): Promise<(TradeEntry & { studentId: string; studentName: string; studentTier: string })[]> => {
  try {
    // Using RPC to call our custom function
    const { data, error } = await supabase.rpc('get_all_trades_for_admin');
    
    if (error) throw error;
    
    // Transform the data to match TradeEntry interface
    return data.map((trade: any) => ({
      id: trade.id,
      pair: trade.pair,
      type: trade.type,
      entryPrice: trade.entry_price,
      stopLoss: trade.stop_loss,
      takeProfit: trade.take_profit,
      status: trade.status,
      validationResult: trade.validation_result,
      notes: trade.notes,
      date: trade.date,
      pnl: trade.pnl,
      studentId: trade.user_id,
      studentName: trade.student_name,
      studentTier: trade.student_tier
    }));
  } catch (error) {
    console.error('Error fetching trades:', error);
    throw error;
  }
};

// Function to fetch business metrics
export const fetchBusinessMetrics = async () => {
  try {
    // Using RPC to call our custom function
    const { data, error } = await supabase.rpc('get_business_metrics');
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      const metrics = data[0];
      return {
        mrr: metrics.mrr || 0,
        totalRevenue: metrics.total_revenue || 0,
        churnRate: metrics.churn_rate || 0,
        tierData: [
          { name: 'Foundation', value: metrics.foundation_count || 0, color: '#94a3b8' },
          { name: 'Professional', value: metrics.professional_count || 0, color: '#00ff94' },
          { name: 'Elite', value: metrics.elite_count || 0, color: '#a855f7' }
        ]
      };
    }
    
    return {
      mrr: 0,
      totalRevenue: 0,
      churnRate: 0,
      tierData: [
        { name: 'Foundation', value: 0, color: '#94a3b8' },
        { name: 'Professional', value: 0, color: '#00ff94' },
        { name: 'Elite', value: 0, color: '#a855f7' }
      ]
    };
  } catch (error) {
    console.error('Error fetching business metrics:', error);
    throw error;
  }
};

// Function to fetch comprehensive analytics data
export const fetchComprehensiveAnalytics = async () => {
  try {
    console.log('Fetching comprehensive analytics...');
    const { data, error } = await supabase.rpc('get_comprehensive_analytics');
    
    if (error) {
      console.error('RPC Error in fetchComprehensiveAnalytics:', error);
      throw error;
    }
    
    console.log('Comprehensive analytics data:', data);
    
    if (data && data.length > 0) {
      const analytics = data[0];
      return {
        totalStudents: parseInt(analytics.total_students) || 0,
        activeStudents: parseInt(analytics.active_students) || 0,
        atRiskStudents: parseInt(analytics.at_risk_students) || 0,
        totalRevenue: analytics.total_revenue || 0,
        mrr: analytics.mrr || 0,
        churnRate: analytics.churn_rate || 0,
        avgWinRate: analytics.avg_win_rate || 0,
        totalTrades: parseInt(analytics.total_trades) || 0,
        totalPnL: analytics.total_pnl || 0
      };
    }
    
    return {
      totalStudents: 0,
      activeStudents: 0,
      atRiskStudents: 0,
      totalRevenue: 0,
      mrr: 0,
      churnRate: 0,
      avgWinRate: 0,
      totalTrades: 0,
      totalPnL: 0
    };
  } catch (error: any) {
    console.error('Error fetching comprehensive analytics:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    throw error;
  }
};

// Function to fetch revenue growth data
export const fetchRevenueGrowthData = async () => {
  try {
    console.log('Fetching revenue growth data...');
    const { data, error } = await supabase.rpc('get_revenue_growth_data');
    
    if (error) {
      console.error('RPC Error in fetchRevenueGrowthData:', error);
      throw error;
    }
    
    console.log('Revenue growth data:', data);
    
    // Convert to the format expected by the UI
    return data.map((item: any) => ({
      month: item.month_year || 'Unknown',
      revenue: parseFloat(item.revenue) || 0
    }));
  } catch (error: any) {
    console.error('Error fetching revenue growth data:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    // Return empty array as fallback
    return [];
  }
};

// Function to fetch course completion data
export const fetchCourseCompletionData = async () => {
  try {
    console.log('Fetching course completion data...');
    const { data, error } = await supabase.rpc('get_course_completion_data');
    
    if (error) {
      console.error('RPC Error in fetchCourseCompletionData:', error);
      throw error;
    }
    
    console.log('Course completion data:', data);
    
    return data.map((item: any) => ({
      moduleId: item.module_id || '',
      name: item.module_title || 'Unknown Module',
      completion: parseFloat(item.completion_rate) || 0,
      totalStudents: parseInt(item.total_students) || 0,
      completedStudents: parseInt(item.completed_students) || 0
    }));
  } catch (error: any) {
    console.error('Error fetching course completion data:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    // Return empty array as fallback
    return [];
  }
};

// Function to fetch rule violations data
export const fetchRuleViolationsData = async () => {
  try {
    console.log('Fetching rule violations data...');
    const { data, error } = await supabase.rpc('get_rule_violations_data');
    
    if (error) {
      console.error('RPC Error in fetchRuleViolationsData:', error);
      throw error;
    }
    
    console.log('Rule violations data:', data);
    
    return data.map((item: any) => ({
      rule: item.rule_name || 'Unknown Rule',
      count: parseInt(item.violation_count) || 0
    }));
  } catch (error: any) {
    console.error('Error fetching rule violations data:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    // Return empty array as fallback
    return [];
  }
};

// Function to fetch a specific student with their recent trades
export const fetchStudentWithTrades = async (studentId: string): Promise<StudentProfile | null> => {
  try {
    // First get the student profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', studentId)
      .single();
    
    if (profileError) throw profileError;
    if (!profileData) return null;
    
    // Get student stats
    const { data: statsData, error: statsError } = await supabase.rpc('get_student_stats', { user_id: studentId });
    
    if (statsError) throw statsError;
    
    const stats = statsData && statsData.length > 0 ? statsData[0] : {
      win_rate: 0,
      total_pnl: 0,
      trades_count: 0,
      avg_risk_reward: 0,
      current_drawdown: 0
    };
    
    // Get recent trades for this student
    const { data: tradesData, error: tradesError } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', studentId)
      .order('date', { ascending: false })
      .limit(10); // Limit to recent 10 trades
    
    if (tradesError) throw tradesError;
    
    // Transform trades data
    const recentTrades: TradeEntry[] = tradesData.map((trade: any) => ({
      id: trade.id,
      pair: trade.pair,
      type: trade.type,
      entryPrice: trade.entry_price,
      stopLoss: trade.stop_loss,
      takeProfit: trade.take_profit,
      status: trade.status,
      validationResult: trade.validation_result,
      notes: trade.notes,
      date: trade.date,
      pnl: trade.pnl
    }));
    
    // Determine student status based on stats
    let status: 'active' | 'at-risk' | 'inactive' = 'active';
    if (stats.win_rate < 40) {
      status = 'at-risk';
    } else if (stats.trades_count === 0) {
      status = 'inactive';
    }
    
    return {
      id: profileData.id,
      name: profileData.full_name,
      email: profileData.email,
      tier: profileData.subscription_tier,
      joinedDate: profileData.joined_date,
      status,
      stats: {
        winRate: stats.win_rate || 0,
        totalPnL: stats.total_pnl || 0,
        tradesCount: stats.trades_count || 0,
        avgRiskReward: stats.avg_risk_reward || 0,
        currentDrawdown: stats.current_drawdown || 0
      },
      recentTrades
    };
  } catch (error) {
    console.error('Error fetching student with trades:', error);
    throw error;
  }
};

// Function to fetch course enrollment trends
export const fetchCourseEnrollmentTrends = async (days: number = 30) => {
  try {
    console.log('Fetching course enrollment trends...');
    const { data, error } = await supabase.rpc('get_course_enrollment_trends', { days });
    
    if (error) {
      console.error('RPC Error in fetchCourseEnrollmentTrends:', error);
      throw error;
    }
    
    console.log('Course enrollment trends data:', data);
    
    return data.map((item: any) => ({
      date: item.date || 'Unknown',
      enrollments: parseInt(item.enrollments) || 0,
      completions: parseInt(item.completions) || 0
    }));
  } catch (error: any) {
    console.error('Error fetching course enrollment trends:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    // Return empty array as fallback
    return [];
  }
};

// Function to fetch module completion rates
export const fetchModuleCompletionRates = async () => {
  try {
    console.log('Fetching module completion rates...');
    const { data, error } = await supabase.rpc('get_module_completion_rates');
    
    if (error) {
      console.error('RPC Error in fetchModuleCompletionRates:', error);
      throw error;
    }
    
    console.log('Module completion rates data:', data);
    
    return data.map((item: any) => ({
      courseId: item.course_id || '',
      name: item.course_title || 'Unknown Course',
      completion: parseFloat(item.completion_rate) || 0,
      total: parseInt(item.total_modules) || 0,
      completed: parseInt(item.completed_modules) || 0
    }));
  } catch (error: any) {
    console.error('Error fetching module completion rates:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    // Return empty array as fallback
    return [];
  }
};

// Function to fetch course enrollment counts
export const fetchCourseEnrollmentCounts = async () => {
  try {
    console.log('Fetching course enrollment counts...');
    const { data, error } = await supabase.rpc('get_course_enrollment_counts');
    
    if (error) {
      console.error('RPC Error in fetchCourseEnrollmentCounts:', error);
      throw error;
    }
    
    console.log('Course enrollment counts data:', data);
    
    return data.map((item: any) => ({
      courseId: item.course_id || '',
      name: item.course_title || 'Unknown Course',
      count: parseInt(item.total_enrollments) || 0,
      completed: parseInt(item.completed_enrollments) || 0
    }));
  } catch (error: any) {
    console.error('Error fetching course enrollment counts:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    // Return empty array as fallback
    return [];
  }
};

// Function to fetch course difficulty distribution
export const fetchCourseDifficultyDistribution = async () => {
  try {
    console.log('Fetching course difficulty distribution...');
    const { data, error } = await supabase.rpc('get_course_difficulty_distribution');
    
    if (error) {
      console.error('RPC Error in fetchCourseDifficultyDistribution:', error);
      throw error;
    }
    
    console.log('Course difficulty distribution data:', data);
    
    return data.map((item: any) => ({
      name: item.level ? item.level.charAt(0).toUpperCase() + item.level.slice(1) : 'Unknown',
      value: parseInt(item.count) || 0
    }));
  } catch (error: any) {
    console.error('Error fetching course difficulty distribution:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    // Return empty array as fallback
    return [];
  }
};

// Function to fetch content type distribution
export const fetchContentTypeDistribution = async () => {
  try {
    console.log('Fetching content type distribution...');
    const { data, error } = await supabase.rpc('get_content_type_distribution');
    
    if (error) {
      console.error('RPC Error in fetchContentTypeDistribution:', error);
      throw error;
    }
    
    console.log('Content type distribution data:', data);
    
    return data.map((item: any) => ({
      name: item.content_type ? item.content_type.charAt(0).toUpperCase() + item.content_type.slice(1) : 'Unknown',
      value: parseInt(item.count) || 0
    }));
  } catch (error: any) {
    console.error('Error fetching content type distribution:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    // Return empty array as fallback
    return [];
  }
};
