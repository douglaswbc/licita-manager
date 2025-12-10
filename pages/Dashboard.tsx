import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockService } from '../services/mockData';
import { Bid, BidStatus } from '../types';
import { format, differenceInDays, parseISO } from 'date-fns';
import { AlertCircle, TrendingUp, CheckCircle, Clock } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockService.getBids().then((data) => {
      setBids(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;

  const pendingBids = bids.filter(b => b.status === BidStatus.PENDING).length;
  const wonBids = bids.filter(b => b.status === BidStatus.WON).length;
  const totalBids = bids.length;
  
  // Deadlines within 5 days
  const upcomingDeadlines = bids.filter(b => {
    const days = differenceInDays(parseISO(b.date), new Date());
    return days >= 0 && days <= 5 && b.status === BidStatus.PENDING;
  });

  const chartData = [
    { name: 'Pending', value: pendingBids, fill: '#EAB308' },
    { name: 'Won', value: wonBids, fill: '#22C55E' },
    { name: 'Lost', value: bids.filter(b => b.status === BidStatus.LOST).length, fill: '#EF4444' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Bids</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{totalBids}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <TrendingUp size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Pending Decisions</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{pendingBids}</p>
          </div>
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
            <Clock size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Bids Won</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{wonBids}</p>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <CheckCircle size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Bid Status Overview</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#F1F5F9' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <AlertCircle size={20} className="text-orange-500" />
            Upcoming Deadlines (Next 5 Days)
          </h2>
          {upcomingDeadlines.length === 0 ? (
            <p className="text-slate-500">No urgent deadlines pending.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    <th className="pb-3">Title</th>
                    <th className="pb-3">Due Date</th>
                    <th className="pb-3">Days Left</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {upcomingDeadlines.map(bid => {
                    const days = differenceInDays(parseISO(bid.date), new Date());
                    return (
                      <tr key={bid.id} className="border-t border-slate-100">
                        <td className="py-3 font-medium text-slate-900">{bid.title}</td>
                        <td className="py-3 text-slate-500">{format(parseISO(bid.date), 'dd/MM/yyyy')}</td>
                        <td className="py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {days} days
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;