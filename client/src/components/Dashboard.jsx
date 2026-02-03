import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeadStats } from '../api/client';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await getLeadStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatValue = (key, defaultValue = '0') => {
    if (loading) return '...';
    return stats?.[key]?.toLocaleString() || defaultValue;
  };

  const statCards = [
    { 
      label: 'Total Leads', 
      getValue: () => getStatValue('total', '0'),
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
    },
    { 
      label: 'New Leads (7 days)', 
      getValue: () => getStatValue('newLeads', '0'),
      icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'
    },
    { 
      label: 'Converted', 
      getValue: () => getStatValue('converted', '0'),
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    { 
      label: 'Success Rate', 
      getValue: () => {
        if (loading) return '...';
        const total = stats?.total || 0;
        const converted = stats?.converted || 0;
        if (total === 0) return '0%';
        return ((converted / total) * 100).toFixed(1) + '%';
      },
      icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <header className="flex items-end justify-between pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-500">Welcome back! Here's what's happening with your leads.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchStats}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button 
            onClick={() => navigate('/dashboard/analytics')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            View Analytics
          </button>
          <button 
            onClick={() => navigate('/dashboard/create-job')}
            className="px-4 py-2 text-sm font-bold text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors shadow-sm shadow-gray-900/10 cursor-pointer"
          >
            New Campaign
          </button>
        </div>
      </header>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="group bg-white rounded-2xl p-5 border border-gray-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:border-gray-300/80 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 group-hover:text-gray-900 group-hover:bg-gray-100 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">{stat.label}</span>
              </div>
            </div>
            
            <div className="flex items-baseline justify-between mt-2">
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{stat.getValue()}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Lead Sources */}
      {stats && stats.bySource && Object.keys(stats.bySource).length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-6">Leads by Source</h3>
            <div className="space-y-4">
              {Object.entries(stats.bySource).map(([source, count]) => (
                <div key={source} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{source}</span>
                  <span className="text-sm font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-6">Leads by Status</h3>
            <div className="space-y-4">
              {Object.entries(stats.byStatus || {}).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{status}</span>
                  <span className="text-sm font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && stats && stats.total === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[300px] flex flex-col items-center justify-center p-8">
          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads yet</h3>
          <p className="text-sm text-gray-500 mb-6 text-center max-w-md">
            Start by creating a scraping job to collect job listings and convert them into leads.
          </p>
          <button 
            onClick={() => navigate('/dashboard/create-job')}
            className="px-6 py-3 text-sm font-bold text-white bg-gray-900 rounded-lg hover:bg-black transition-colors shadow-lg shadow-gray-900/20"
          >
            Create Your First Campaign
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
