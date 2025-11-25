import React, { useState, useEffect } from 'react';
import { useAdminPortal } from '../AdminPortalContext';
import { StudentProfile } from '../../../types';
import { notificationService } from '../../../services/notificationService';
import { supabase } from '../../../supabase/client';
import { 
  FileText, Clock, CheckCircle, XCircle, RefreshCw, 
  Users, Search, Filter, Eye, Edit2, Trash2 
} from 'lucide-react';

const ApplicationsTab: React.FC = () => {
  const { isRefreshing, refreshData, pendingApplications, loading, refreshPendingApplications } = useAdminPortal();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('all');

  useEffect(() => {
    // Set up real-time subscription for profile changes
    const channel = supabase
      .channel('pending-applications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles',
          filter: 'subscription_tier=eq.elite-pending'
        },
        (payload) => {
          console.log('New elite-pending application detected:', payload);
          refreshPendingApplications();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles',
          filter: 'subscription_tier=eq.foundation-pending'
        },
        (payload) => {
          console.log('New foundation-pending application detected:', payload);
          refreshPendingApplications();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles',
          filter: 'subscription_tier=eq.professional-pending'
        },
        (payload) => {
          console.log('New professional-pending application detected:', payload);
          refreshPendingApplications();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: 'subscription_tier=eq.elite-pending'
        },
        (payload) => {
          console.log('Elite-pending application updated:', payload);
          refreshPendingApplications();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: 'subscription_tier=eq.foundation-pending'
        },
        (payload) => {
          console.log('Foundation-pending application updated:', payload);
          refreshPendingApplications();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: 'subscription_tier=eq.professional-pending'
        },
        (payload) => {
          console.log('Professional-pending application updated:', payload);
          refreshPendingApplications();
        }
      )
      .subscribe();
      
    // Cleanup function to unsubscribe when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshPendingApplications]);

  const handleApproveApplication = async (studentId: string, approvedTier: string) => {
    try {
      await supabase.from('profiles').update({ subscription_tier: approvedTier }).eq('id', studentId);
      await notificationService.createApplicationApprovedNotification(studentId);
      refreshPendingApplications();
      alert(`Application approved! User now has ${approvedTier} access.`);
    } catch (err) {
      console.error(err);
      alert('Failed to approve application.');
    }
  };

  const handleRejectApplication = async (studentId: string, rejectedTier: string) => {
    try {
      await supabase.from('profiles').update({ subscription_tier: rejectedTier }).eq('id', studentId);
      await notificationService.createApplicationRejectedNotification(studentId);
      refreshPendingApplications();
      alert('Application rejected! User moved to free tier.');
    } catch (err) {
      console.error(err);
      alert('Failed to reject application.');
    }
  };

  const filteredApplications = pendingApplications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterTier === 'all' || app.tier === filterTier;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-trade-neon"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-200">
            <FileText className="h-6 w-6 text-trade-neon" /> Pending Applications
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search applications..."
                className="pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-trade-neon outline-none w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <select
                className="pl-10 pr-8 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-trade-neon outline-none appearance-none w-full"
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
              >
                <option value="all">All Tiers</option>
                <option value="elite-pending">Elite</option>
                <option value="professional-pending">Professional</option>
                <option value="foundation-pending">Foundation</option>
              </select>
            </div>
            
            <button 
              onClick={refreshPendingApplications}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} /> 
              Refresh
            </button>
          </div>
        </div>
        
        {filteredApplications.length === 0 ? (
          <div className="text-center py-16">
            <Clock className="h-16 w-16 mx-auto text-gray-500 mb-4" />
            <h3 className="text-2xl font-bold text-gray-300 mb-2">No Pending Applications</h3>
            <p className="text-gray-400">All applications are processed. Check back later.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-max">
              <thead className="bg-gray-900/50 text-gray-300">
                <tr>
                  <th className="p-4">Applicant</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Application Date</th>
                  <th className="p-4">Requested Tier</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filteredApplications.map(application => (
                  <tr key={application.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center text-sm font-bold">
                          {application.name?.charAt(0) || '?'}
                        </div>
                        <div className="font-bold text-white">{application.name || 'Unknown'}</div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">{application.email}</td>
                    <td className="p-4 text-gray-400 font-mono text-sm">
                      {application.joinedDate ? new Date(application.joinedDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded text-sm font-bold uppercase ${
                        application.tier === 'elite-pending' ? 'bg-purple-500/20 text-purple-400' :
                        application.tier === 'professional-pending' ? 'bg-blue-500/20 text-blue-400' :
                        application.tier === 'foundation-pending' ? 'bg-green-500/20 text-green-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {application.tier.replace('-pending', '').charAt(0).toUpperCase() + application.tier.replace('-pending', '').slice(1)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => {
                            const approvedTier = application.tier.replace('-pending', '');
                            handleApproveApplication(application.id, approvedTier);
                          }} 
                          className="px-4 py-2 bg-green-500/30 hover:bg-green-500/50 text-green-300 rounded-xl font-bold flex items-center gap-2 transition-colors"
                        >
                          <CheckCircle className="h-4 w-4" /> Approve
                        </button>
                        <button 
                          onClick={() => {
                            handleRejectApplication(application.id, 'free');
                          }} 
                          className="px-4 py-2 bg-red-500/30 hover:bg-red-500/50 text-red-300 rounded-xl font-bold flex items-center gap-2 transition-colors"
                        >
                          <XCircle className="h-4 w-4" /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-6 shadow-xl">
        <h3 className="text-xl font-bold mb-6 text-gray-200">Application Review Workflow</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-gray-900/50 rounded-2xl border border-gray-700/50">
            <div className="text-trade-neon font-bold text-lg mb-3">1. Review Details</div>
            <p className="text-sm text-gray-300">Evaluate applicant's profile, trading history, and motivation.</p>
          </div>
          <div className="p-6 bg-gray-900/50 rounded-2xl border border-gray-700/50">
            <div className="text-trade-neon font-bold text-lg mb-3">2. Decide Action</div>
            <p className="text-sm text-gray-300">Approve for requested tier access or reject to Free tier.</p>
          </div>
          <div className="p-6 bg-gray-900/50 rounded-2xl border border-gray-700/50">
            <div className="text-trade-neon font-bold text-lg mb-3">3. Notify User</div>
            <p className="text-sm text-gray-300">Automated notification sent upon decision.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationsTab;