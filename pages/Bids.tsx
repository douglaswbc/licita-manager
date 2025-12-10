import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, ExternalLink, MoreHorizontal, FileText, Send } from 'lucide-react';
import { mockService } from '../services/mockData';
import { Bid, BidStatus, Client } from '../types';
import Modal from '../components/Modal';
import { format, parseISO } from 'date-fns';

const StatusBadge = ({ status }: { status: BidStatus }) => {
  const styles = {
    [BidStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    [BidStatus.WON]: 'bg-green-100 text-green-800 border-green-200',
    [BidStatus.LOST]: 'bg-red-100 text-red-800 border-red-200',
  };
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
      {status}
    </span>
  );
};

const Bids: React.FC = () => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  
  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [editingBid, setEditingBid] = useState<Bid | null>(null);
  const [summaryBid, setSummaryBid] = useState<Bid | null>(null);

  const { register, handleSubmit, reset, setValue, watch } = useForm<Bid>();
  const summaryForm = useForm<{ summary_link: string }>();

  const loadData = async () => {
    const [bidsData, clientsData] = await Promise.all([
      mockService.getBids(),
      mockService.getClients()
    ]);
    setBids(bidsData);
    setClients(clientsData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openFormModal = (bid?: Bid) => {
    if (bid) {
      setEditingBid(bid);
      setValue('title', bid.title);
      setValue('client_id', bid.client_id);
      setValue('date', bid.date.substring(0, 10)); // Format for input date
      setValue('link_docs', bid.link_docs);
      setValue('status', bid.status);
    } else {
      setEditingBid(null);
      reset({ title: '', status: BidStatus.PENDING, link_docs: '' });
      setValue('date', new Date().toISOString().substring(0, 10));
    }
    setIsFormModalOpen(true);
  };

  const openSummaryModal = (bid: Bid) => {
    setSummaryBid(bid);
    summaryForm.setValue('summary_link', bid.summary_link || '');
    setIsSummaryModalOpen(true);
  };

  const onFormSubmit = async (data: any) => {
    const payload = {
      ...data,
      id: editingBid ? editingBid.id : undefined,
      // Ensure date is ISO
      date: new Date(data.date).toISOString(),
    };
    await mockService.saveBid(payload);
    await loadData();
    setIsFormModalOpen(false);
  };

  const onSummarySubmit = async (data: { summary_link: string }) => {
    if (!summaryBid) return;
    
    // Simulate sending email
    await new Promise(r => setTimeout(r, 800));
    
    const updatedBid = {
      ...summaryBid,
      summary_link: data.summary_link,
      summary_sent_at: new Date().toISOString(),
    };
    
    await mockService.saveBid(updatedBid);
    await loadData();
    setIsSummaryModalOpen(false);
    alert('Summary saved and email notification sent!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Bid Solicitations</h1>
        <button 
          onClick={() => openFormModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium text-sm"
        >
          <Plus size={16} /> New Bid
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700">Date</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Title</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Client</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Docs</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bids.map((bid) => {
                const client = clients.find(c => c.id === bid.client_id);
                return (
                  <tr key={bid.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                      {format(parseISO(bid.date), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 text-slate-900 font-medium">{bid.title}</td>
                    <td className="px-6 py-4 text-slate-600">{client?.company || 'Unknown'}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={bid.status} />
                    </td>
                    <td className="px-6 py-4">
                      {bid.link_docs && (
                        <a 
                          href={bid.link_docs} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                        >
                          View <ExternalLink size={12} />
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openSummaryModal(bid)}
                          title="Send Summary"
                          className={`p-2 rounded-lg transition-colors ${bid.summary_sent_at ? 'text-green-600 bg-green-50' : 'text-slate-400 hover:text-purple-600 hover:bg-purple-50'}`}
                        >
                          <Send size={16} />
                        </button>
                        <button 
                          onClick={() => openFormModal(bid)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal 
        isOpen={isFormModalOpen} 
        onClose={() => setIsFormModalOpen(false)}
        title={editingBid ? 'Edit Bid' : 'New Bid Solicitation'}
      >
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input 
              {...register('title', { required: true })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. City Bridge Construction"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Client</label>
              <select 
                {...register('client_id', { required: true })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="">Select Client...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.company}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Deadline</label>
              <input 
                type="date"
                {...register('date', { required: true })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Documents Link</label>
            <input 
              {...register('link_docs')}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select 
              {...register('status')}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value={BidStatus.PENDING}>Pending</option>
              <option value={BidStatus.WON}>Won</option>
              <option value={BidStatus.LOST}>Lost</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => setIsFormModalOpen(false)}
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Save Bid
            </button>
          </div>
        </form>
      </Modal>

      {/* Summary Modal */}
      <Modal 
        isOpen={isSummaryModalOpen} 
        onClose={() => setIsSummaryModalOpen(false)}
        title="Send Bid Summary"
      >
        <form onSubmit={summaryForm.handleSubmit(onSummarySubmit)} className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
             <p className="text-sm text-slate-600">
               <span className="font-semibold">Client:</span> {clients.find(c => c.id === summaryBid?.client_id)?.company}
             </p>
             <p className="text-sm text-slate-600">
               <span className="font-semibold">Bid:</span> {summaryBid?.title}
             </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Summary Document Link</label>
            <div className="relative">
              <FileText className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input 
                {...summaryForm.register('summary_link', { required: true })}
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="https://drive.google.com/..."
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              This link will be included in the email sent to the client.
            </p>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => setIsSummaryModalOpen(false)}
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
            >
              <Send size={16} /> Send Email
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Bids;