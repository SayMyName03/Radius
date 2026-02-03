import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeadStats } from '../api/client';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from './ui/chart';

const AnalyticsDashboard = () => {
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

  // Generate mock time-series data for demonstration
  // In production, this should come from the backend with actual historical data
  const generateTimeSeriesData = () => {
    const days = 30;
    const data = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate realistic-looking data based on current stats
      const totalLeads = stats?.total || 0;
      const baseValue = Math.floor(totalLeads / days);
      const variance = Math.floor(Math.random() * baseValue * 0.5);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date.toISOString(),
        newLeads: Math.max(0, baseValue + variance - Math.floor(Math.random() * variance)),
        contacted: Math.max(0, Math.floor((baseValue + variance) * 0.6)),
        responded: Math.max(0, Math.floor((baseValue + variance) * 0.3)),
        converted: Math.max(0, Math.floor((baseValue + variance) * 0.1)),
      });
    }
    
    return data;
  };

  const generateSourceData = () => {
    if (!stats?.bySource) return [];
    return Object.entries(stats.bySource).map(([source, count]) => ({
      source: source.charAt(0).toUpperCase() + source.slice(1),
      leads: count,
    }));
  };

  const generateStatusData = () => {
    if (!stats?.byStatus) return [];
    return Object.entries(stats.byStatus).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count: count,
    }));
  };

  const timeSeriesData = stats ? generateTimeSeriesData() : [];
  const sourceData = stats ? generateSourceData() : [];
  const statusData = stats ? generateStatusData() : [];

  const getStatValue = (key, defaultValue = '0') => {
    if (loading) return '...';
    return stats?.[key]?.toLocaleString() || defaultValue;
  };

  const statCards = [
    { 
      label: 'Total Leads', 
      getValue: () => getStatValue('total', '0'),
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    { 
      label: 'New (7 days)', 
      getValue: () => getStatValue('newLeads', '0'),
      icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    { 
      label: 'Converted', 
      getValue: () => getStatValue('converted', '0'),
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    { 
      label: 'Conversion Rate', 
      getValue: () => {
        if (loading) return '...';
        const total = stats?.total || 0;
        const converted = stats?.converted || 0;
        if (total === 0) return '0%';
        return ((converted / total) * 100).toFixed(1) + '%';
      },
      icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
  ];

  const leadsChartConfig = {
    newLeads: {
      label: "New Leads",
      color: "hsl(142, 76%, 36%)",
    },
    contacted: {
      label: "Contacted",
      color: "hsl(221, 83%, 53%)",
    },
    responded: {
      label: "Responded",
      color: "hsl(262, 83%, 58%)",
    },
    converted: {
      label: "Converted",
      color: "hsl(25, 95%, 53%)",
    },
  };

  const sourceChartConfig = {
    leads: {
      label: "Leads",
      color: "hsl(221, 83%, 53%)",
    },
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <header className="flex items-end justify-between pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Analytics Dashboard</h1>
          <p className="mt-2 text-sm text-gray-500">Track your lead generation performance and trends</p>
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
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{stat.getValue()}</h3>
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      {!loading && stats && stats.total > 0 && (
        <>
          {/* Lead Activity Over Time - Area Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Lead Activity (Last 30 Days)</h3>
              <p className="text-sm text-gray-500 mt-1">Track your lead generation and conversion funnel</p>
            </div>
            
            <ChartContainer config={leadsChartConfig} className="h-[400px] w-full">
              <AreaChart
                data={timeSeriesData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="fillNewLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-newLeads)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-newLeads)" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="fillContacted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-contacted)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-contacted)" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="fillResponded" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-responded)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-responded)" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="fillConverted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-converted)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-converted)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value}
                  className="text-xs"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-xs"
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Area
                  dataKey="converted"
                  type="monotone"
                  fill="url(#fillConverted)"
                  fillOpacity={0.4}
                  stroke="var(--color-converted)"
                  strokeWidth={2}
                  stackId="a"
                />
                <Area
                  dataKey="responded"
                  type="monotone"
                  fill="url(#fillResponded)"
                  fillOpacity={0.4}
                  stroke="var(--color-responded)"
                  strokeWidth={2}
                  stackId="a"
                />
                <Area
                  dataKey="contacted"
                  type="monotone"
                  fill="url(#fillContacted)"
                  fillOpacity={0.4}
                  stroke="var(--color-contacted)"
                  strokeWidth={2}
                  stackId="a"
                />
                <Area
                  dataKey="newLeads"
                  type="monotone"
                  fill="url(#fillNewLeads)"
                  fillOpacity={0.4}
                  stroke="var(--color-newLeads)"
                  strokeWidth={2}
                  stackId="a"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </div>

          {/* Two Column Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Leads by Source - Bar Chart */}
            {sourceData.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Leads by Source</h3>
                  <p className="text-sm text-gray-500 mt-1">Distribution across different sources</p>
                </div>
                
                <ChartContainer config={sourceChartConfig} className="h-[300px] w-full">
                  <BarChart
                    data={sourceData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis
                      dataKey="source"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      className="text-xs"
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      className="text-xs"
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar
                      dataKey="leads"
                      fill="var(--color-leads)"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </div>
            )}

            {/* Leads by Status - List View */}
            {statusData.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Leads by Status</h3>
                  <p className="text-sm text-gray-500 mt-1">Current lead pipeline breakdown</p>
                </div>
                <div className="space-y-4">
                  {statusData.map((item, index) => {
                    const total = stats.total || 1;
                    const percentage = ((item.count / total) * 100).toFixed(1);
                    const colors = [
                      'bg-blue-500',
                      'bg-green-500',
                      'bg-yellow-500',
                      'bg-purple-500',
                      'bg-red-500',
                    ];
                    const bgColors = [
                      'bg-blue-50',
                      'bg-green-50',
                      'bg-yellow-50',
                      'bg-purple-50',
                      'bg-red-50',
                    ];
                    
                    return (
                      <div key={item.status} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                            <span className="text-sm font-medium text-gray-700">{item.status}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500">{percentage}%</span>
                            <span className="text-sm font-semibold text-gray-900 min-w-[3rem] text-right">
                              {item.count}
                            </span>
                          </div>
                        </div>
                        <div className={`h-2 rounded-full ${bgColors[index % bgColors.length]} overflow-hidden`}>
                          <div
                            className={`h-full ${colors[index % colors.length]} transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && stats && stats.total === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[400px] flex flex-col items-center justify-center p-8">
          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No analytics data yet</h3>
          <p className="text-sm text-gray-500 mb-6 text-center max-w-md">
            Start by creating a scraping job to collect leads and see your analytics come to life.
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

export default AnalyticsDashboard;
