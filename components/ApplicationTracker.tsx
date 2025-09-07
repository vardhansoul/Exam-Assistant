import React, { useState, useEffect } from 'react';
import { getApplicationRecords, saveApplicationRecord, deleteApplicationRecord } from '../utils/tracking';
import type { ApplicationRecord } from '../types';
import Card from './Card';
import Button from './Button';

const ApplicationTracker: React.FC = () => {
  const [records, setRecords] = useState<ApplicationRecord[]>([]);
  const [examName, setExamName] = useState('');
  const [registrationId, setRegistrationId] = useState('');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setRecords(getApplicationRecords());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim() || !registrationId.trim()) {
      alert('Exam Name and Registration ID are required.');
      return;
    }
    saveApplicationRecord({ examName, registrationId, password, notes });
    setRecords(getApplicationRecords()); // Refresh list
    // Clear form
    setExamName('');
    setRegistrationId('');
    setPassword('');
    setNotes('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      deleteApplicationRecord(id);
      setRecords(getApplicationRecords()); // Refresh list
    }
  };

  return (
    <Card>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Application Tracker</h2>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 3.01-1.742 3.01H4.42c-1.53 0-2.493-1.676-1.743-3.01l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Important Privacy Notice</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>All data you enter here is stored **only on your device** in your browser's local storage. It is **never** sent to any server. Clearing your browser's cache or data will permanently delete all saved records.</p>
            </div>
          </div>
        </div>
      </div>

      <Card className="bg-slate-50 mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Add New Application</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="examName" className="block text-sm font-medium text-gray-700">Exam Name</label>
            <input type="text" id="examName" value={examName} onChange={e => setExamName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div>
            <label htmlFor="regId" className="block text-sm font-medium text-gray-700">Registration ID / Roll Number</label>
            <input type="text" id="regId" value={registrationId} onChange={e => setRegistrationId(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password / Date of Birth</label>
            <input type="text" id="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
            <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
          </div>
          <div className="text-right">
            <Button type="submit">Save Record</Button>
          </div>
        </form>
      </Card>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Saved Applications</h3>
        {records.length === 0 ? (
          <p className="text-gray-500">You have no saved application records.</p>
        ) : (
          <div className="space-y-4">
            {records.map(record => (
              <div key={record.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-indigo-700">{record.examName}</h4>
                    <p className="text-sm text-gray-600 mt-1"><span className="font-semibold">ID/Roll:</span> {record.registrationId}</p>
                    {record.password && <p className="text-sm text-gray-600"><span className="font-semibold">Password:</span> {record.password}</p>}
                    {record.notes && <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap"><span className="font-semibold">Notes:</span> {record.notes}</p>}
                  </div>
                  <Button onClick={() => handleDelete(record.id)} variant="secondary" className="px-2 py-1 text-xs">Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ApplicationTracker;
