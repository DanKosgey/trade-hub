import React, { useState, useEffect } from 'react';
import { User, CourseModule } from '../../types';
import { 
  LayoutDashboard, Users, Layers, PieChart as PieIcon, 
  FileText, BookOpen, Zap, DollarSign, CreditCard, BarChart3, ShieldAlert 
} from 'lucide-react';
import { useAdminPortal } from './AdminPortalContext';
import AdminHeader from './AdminHeader';
import AdminNavigation from './AdminNavigation';
import OverviewTab from './tabs/OverviewTab';
import DirectoryTab from './tabs/DirectoryTab';
import TradesTab from './tabs/TradesTab';
import AnalyticsTab from './tabs/AnalyticsTab';
import ApplicationsTab from './tabs/ApplicationsTab';
import ContentTab from './tabs/ContentTab';
import RulesTab from './tabs/RulesTab';
import JournalTab from './tabs/JournalTab';
import AdminAnalyticsTab from './tabs/AdminAnalyticsTab';
import SettingsTab from './tabs/SettingsTab';

interface AdminPortalProps {
  courses: CourseModule[];
  initialTab?: string;
  user: User;
}

const AdminPortal: React.FC<AdminPortalProps> = ({ courses, initialTab = 'overview', user }) => {
  const { activeTab, setActiveTab } = useAdminPortal();

  // Set initial tab from URL or prop
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl && isValidTab(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    } else if (initialTab && isValidTab(initialTab)) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Update URL when tab changes
  useEffect(() => {
    const url = new URL(window.location as any);
    url.searchParams.set('tab', activeTab);
    window.history.replaceState({}, '', url);
  }, [activeTab]);

  const isValidTab = (tab: string): tab is typeof activeTab => {
    return [
      'overview', 'directory', 'trades', 'analytics', 'applications', 
      'content', 'rules', 'journal', 'admin-analytics', 'settings'
    ].includes(tab);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'directory':
        return <DirectoryTab />;
      case 'trades':
        return <TradesTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'applications':
        return <ApplicationsTab />;
      case 'content':
        return <ContentTab user={user} courses={courses} />;
      case 'rules':
        return <RulesTab user={user} />;
      case 'journal':
        return <JournalTab user={user} />;
      case 'admin-analytics':
        return <AdminAnalyticsTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <OverviewTab />;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Command Center', icon: LayoutDashboard },
    { id: 'directory', label: 'Directory', icon: Users },
    { id: 'trades', label: 'Trade Analysis', icon: Layers },
    { id: 'analytics', label: 'Analytics', icon: PieIcon },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'content', label: 'Content Mgmt', icon: BookOpen },
    { id: 'rules', label: 'Rule Engine', icon: Zap },
    { id: 'journal', label: 'My Trades', icon: DollarSign },
    { id: 'admin-analytics', label: 'Admin Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: CreditCard },
  ];

  return (
    <div className="space-y-8 text-white min-h-screen bg-gradient-to-br from-gray-900 to-black p-6 md:p-8">
      <AdminHeader />
      <AdminNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="animate-slide-up">
        {renderActiveTab()}
      </div>
    </div>
  );
};

export default AdminPortal;