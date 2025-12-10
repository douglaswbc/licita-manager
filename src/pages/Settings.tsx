import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save } from 'lucide-react';
import { mockService } from '../src/services/mockData';
import { Settings as SettingsType } from '../types';

const Settings: React.FC = () => {
  const { register, handleSubmit, setValue } = useForm<SettingsType>();

  useEffect(() => {
    mockService.getSettings().then(data => {
      Object.entries(data).forEach(([key, value]) => {
        setValue(key as keyof SettingsType, value);
      });
    });
  }, [setValue]);

  const onSubmit = async (data: SettingsType) => {
    await mockService.saveSettings(data);
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900">Settings & Templates</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* General */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">General Configuration</h2>
          <div className="max-w-md">
            <label className="block text-sm font-medium text-slate-700 mb-1">Sender Email Address</label>
            <input 
              {...register('email_sender')}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
             <p className="text-xs text-slate-500 mt-1">This address will appear in the "From" field.</p>
          </div>
        </div>

        {/* Reminder Template */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">Automatic Reminder Template</h2>
          <div className="space-y-4">
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Subject</label>
              <input 
                {...register('reminder_subject')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Body</label>
              <textarea 
                {...register('reminder_body')}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
              />
               <p className="text-xs text-slate-500 mt-1">Variables available: {'{title}'}, {'{date}'}, {'{client}'}.</p>
            </div>
          </div>
        </div>

        {/* Summary Template */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">Bid Summary Template</h2>
          <div className="space-y-4">
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Subject</label>
              <input 
                {...register('summary_subject')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Body</label>
              <textarea 
                {...register('summary_body')}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
              />
              <p className="text-xs text-slate-500 mt-1">Variables available: {'{title}'}, {'{link}'}.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors font-semibold shadow-sm"
          >
            <Save size={20} /> Save Settings
          </button>
        </div>

      </form>
    </div>
  );
};

export default Settings;