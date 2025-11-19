import React, { useState } from 'react';
import { LayoutDashboard, GraduationCap, Bot, BookOpen, Users, LogOut, Settings, ShieldAlert, Menu, X } from 'lucide-react';
import { User } from '../types';
import NavigationButtons from './NavigationButtons';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onChangeView: (view: string) => void;
  onLogout: () => void;
  user: User;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onChangeView, onLogout, user }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (viewId: string) => {
    onChangeView(viewId);
    setIsMobileMenuOpen(false);
  };
  
  const handleRefresh = () => {
    window.location.reload();
  };
  
  // Strict separation of portals
  let menuItems = [];

  if (user.role === 'admin') {
    menuItems = [
      { id: 'admin-dashboard', label: 'Command Center', icon: ShieldAlert },
      { id: 'admin-students', label: 'Student Directory', icon: Users },
      { id: 'admin-content', label: 'Course Manager', icon: GraduationCap },
      { id: 'admin-rules', label: 'Rule Engine', icon: Settings },
    ];
  } else {
    // Student Menu
    menuItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'courses', label: 'Courses', icon: GraduationCap },
      { id: 'ai', label: 'AI Assistant', icon: Bot, premium: true },
      { id: 'journal', label: 'Journal', icon: BookOpen },
      { id: 'community', label: 'Community', icon: Users },
    ];
  }

  return (
    <div className="flex min-h-screen bg-trade-black relative">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-trade-dark/90 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2 text-white font-bold text-lg">
           <span className={`w-2 h-6 rounded-sm ${user.role === 'admin' ? 'bg-purple-500' : 'bg-trade-accent'}`}></span>
           Mbauni <span className="text-trade-neon">Protocol</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-400 hover:text-white transition"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-trade-dark border-r border-gray-800 flex-shrink-0 flex flex-col transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static
        ${isMobileMenuOpen ? 'translate-x-0 pt-16 md:pt-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-gray-800 hidden md:block">
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className={`w-2 h-6 rounded-sm ${user.role === 'admin' ? 'bg-purple-500' : 'bg-trade-accent'}`}></span>
            {user.role === 'admin' ? 'Admin Portal' : 'Mbauni Protocol'}
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm font-medium ${
                  isActive 
                    ? user.role === 'admin' 
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        : 'bg-trade-accent/10 text-trade-accent border border-trade-accent/20' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {item.label}
                {item.premium && (
                  <span className="ml-auto text-[10px] bg-gradient-to-r from-purple-500 to-pink-500 text-white px-1.5 py-0.5 rounded font-bold">
                    PRO
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${user.role === 'admin' ? 'bg-purple-600' : 'bg-gray-600'}`}>
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate capitalize">{user.role} Account</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm px-2 py-2 transition"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen pt-16 md:pt-0 w-full">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <NavigationButtons onRefresh={handleRefresh} />
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;