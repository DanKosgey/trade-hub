import React, { createContext, useContext, useState, useEffect } from 'react';
import { StudentProfile, SubscriptionPlan, CommunityLink } from '../../types';
import { 
  fetchAllStudents as fetchAllStudentsService, 
  fetchAllTrades as fetchAllTradesService, 
  fetchBusinessMetrics as fetchBusinessMetricsService, 
  fetchPendingApplications as fetchPendingApplicationsService,
  fetchRevenueGrowthData as fetchRevenueGrowthDataService, 
  fetchCourseEnrollmentCounts as fetchCourseEnrollmentCountsService, 
  fetchRuleViolationsData as fetchRuleViolationsDataService,
  fetchStudentPenalties as fetchStudentPenaltiesService
} from '../../services/adminService';
import { socialMediaService } from '../../services/socialMediaService';

type AdminTab = 
  | 'overview' 
  | 'directory' 
  | 'trades' 
  | 'analytics' 
  | 'applications' 
  | 'content' 
  | 'rules' 
  | 'journal' 
  | 'admin-analytics' 
  | 'settings';

interface AdminPortalContextType {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  refreshData: () => void;
  isRefreshing: boolean;
  // Data states
  students: StudentProfile[];
  trades: any[];
  pendingApplications: StudentProfile[];
  communityLinks: CommunityLink[];
  plans: SubscriptionPlan[];
  businessMetrics: any;
  revenueGrowthData: any[];
  courseEnrollmentData: any[];
  ruleViolationsData: any[];
  studentPenaltiesData: any[];
  loading: boolean;
  error: string | null;
  // Data fetching functions
  fetchStudents: () => Promise<void>;
  fetchTrades: () => Promise<void>;
  refreshPendingApplications: () => Promise<void>;
  fetchCommunityLinks: () => Promise<void>;
  fetchPlans: () => Promise<void>;
  fetchBusinessMetrics: () => Promise<void>;
  fetchRevenueGrowthData: () => Promise<void>;
  fetchCourseEnrollmentData: () => Promise<void>;
  fetchRuleViolationsData: () => Promise<void>;
  fetchStudentPenaltiesData: () => Promise<void>;
}

const AdminPortalContext = createContext<AdminPortalContextType | undefined>(undefined);

export const AdminPortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Data states
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [pendingApplications, setPendingApplications] = useState<StudentProfile[]>([]);
  const [communityLinks, setCommunityLinks] = useState<CommunityLink[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [businessMetrics, setBusinessMetrics] = useState<any>({});
  const [revenueGrowthData, setRevenueGrowthData] = useState<any[]>([]);
  const [courseEnrollmentData, setCourseEnrollmentData] = useState<any[]>([]);
  const [ruleViolationsData, setRuleViolationsData] = useState<any[]>([]);
  const [studentPenaltiesData, setStudentPenaltiesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load active tab from localStorage on initial render
  useEffect(() => {
    const savedTab = localStorage.getItem('adminPortalActiveTab');
    if (savedTab && isValidTab(savedTab)) {
      setActiveTab(savedTab);
    }
  }, []);

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('adminPortalActiveTab', activeTab);
  }, [activeTab]);

  const isValidTab = (tab: string): tab is AdminTab => {
    return [
      'overview', 'directory', 'trades', 'analytics', 'applications', 
      'content', 'rules', 'journal', 'admin-analytics', 'settings'
    ].includes(tab);
  };

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [
        studentsData,
        tradesData,
        pendingAppsData,
        linksData,
        plansData,
        metricsData,
        revenueData,
        enrollmentData,
        violationsData,
        penaltiesData
      ] = await Promise.all([
        fetchAllStudentsService(),
        fetchAllTradesService(),
        fetchPendingApplicationsService(),
        socialMediaService.getAllCommunityLinks(),
        socialMediaService.getAllSubscriptionPlans(),
        fetchBusinessMetricsService(),
        fetchRevenueGrowthDataService(),
        fetchCourseEnrollmentCountsService(),
        fetchRuleViolationsDataService(),
        fetchStudentPenaltiesService()
      ]);

      setStudents(studentsData || []);
      setTrades(tradesData || []);
      setPendingApplications(pendingAppsData || []);
      setCommunityLinks(linksData || []);
      setPlans(plansData || []);
      setBusinessMetrics(metricsData || {});
      setRevenueGrowthData(revenueData || []);
      setCourseEnrollmentData(enrollmentData || []);
      setRuleViolationsData(violationsData || []);
      setStudentPenaltiesData(penaltiesData || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  // Individual fetch functions
  const fetchStudents = async () => {
    try {
      const studentsData = await fetchAllStudentsService();
      setStudents(studentsData || []);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const fetchTrades = async () => {
    try {
      const tradesData = await fetchAllTradesService();
      setTrades(tradesData || []);
    } catch (err) {
      console.error('Error fetching trades:', err);
    }
  };

  const refreshPendingApplications = async () => {
    try {
      const pendingAppsData = await fetchPendingApplicationsService();
      setPendingApplications(pendingAppsData || []);
    } catch (err) {
      console.error('Error fetching pending applications:', err);
    }
  };

  const fetchCommunityLinks = async () => {
    try {
      const linksData = await socialMediaService.getAllCommunityLinks();
      setCommunityLinks(linksData || []);
    } catch (err) {
      console.error('Error fetching community links:', err);
    }
  };

  const fetchPlans = async () => {
    try {
      const plansData = await socialMediaService.getAllSubscriptionPlans();
      setPlans(plansData || []);
    } catch (err) {
      console.error('Error fetching subscription plans:', err);
    }
  };

  const fetchBusinessMetrics = async () => {
    try {
      const metricsData = await fetchBusinessMetricsService();
      setBusinessMetrics(metricsData || {});
    } catch (err) {
      console.error('Error fetching business metrics:', err);
    }
  };

  const fetchRevenueGrowthData = async () => {
    try {
      const revenueData = await fetchRevenueGrowthDataService();
      setRevenueGrowthData(revenueData || []);
    } catch (err) {
      console.error('Error fetching revenue growth data:', err);
    }
  };

  const fetchCourseEnrollmentData = async () => {
    try {
      const enrollmentData = await fetchCourseEnrollmentCountsService();
      setCourseEnrollmentData(enrollmentData || []);
    } catch (err) {
      console.error('Error fetching course enrollment data:', err);
    }
  };

  const fetchRuleViolationsData = async () => {
    try {
      const violationsData = await fetchRuleViolationsDataService();
      setRuleViolationsData(violationsData || []);
    } catch (err) {
      console.error('Error fetching rule violations data:', err);
    }
  };

  const fetchStudentPenaltiesData = async () => {
    try {
      const penaltiesData = await fetchStudentPenaltiesService();
      setStudentPenaltiesData(penaltiesData || []);
    } catch (err) {
      console.error('Error fetching student penalties data:', err);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  return (
    <AdminPortalContext.Provider value={{ 
      activeTab, 
      setActiveTab, 
      refreshData, 
      isRefreshing,
      // Data states
      students,
      trades,
      pendingApplications,
      communityLinks,
      plans,
      businessMetrics,
      revenueGrowthData,
      courseEnrollmentData,
      ruleViolationsData,
      studentPenaltiesData,
      loading,
      error,
      // Data fetching functions
      fetchStudents,
      fetchTrades,
      refreshPendingApplications,
      fetchCommunityLinks,
      fetchPlans,
      fetchBusinessMetrics,
      fetchRevenueGrowthData,
      fetchCourseEnrollmentData,
      fetchRuleViolationsData,
      fetchStudentPenaltiesData
    }}>
      {children}
    </AdminPortalContext.Provider>
  );
};

export const useAdminPortal = () => {
  const context = useContext(AdminPortalContext);
  if (context === undefined) {
    throw new Error('useAdminPortal must be used within an AdminPortalProvider');
  }
  return context;
};

export default AdminPortalContext;