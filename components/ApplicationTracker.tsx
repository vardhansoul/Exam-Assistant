

import React, { useState, useEffect, useCallback } from 'react';
import { getApplicationRecords, saveApplicationRecord, deleteApplicationRecord } from '../utils/tracking';
import type { ApplicationRecord, User } from '../types';
import Card from './Card';
import Button from './Button';
import Input from './Input';

interface ApplicationTrackerProps {
    user: User | null;
}

const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({ user }) => {
  const [records, setRecords] = useState<ApplicationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [examName, setExamName] = useState('');
  const [registrationId, setRegistrationId] = useState('');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('');
  
  const uid = user?.uid || null;

  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    const fetchedRecords = await getApplicationRecords(uid);
    setRecords(fetchedRecords);
    setIsLoading(false);
  }, [uid]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim() || !registrationId.trim()) return;
    await saveApplicationRecord({ examName, registrationId, password, notes }, uid);
    await fetchRecords(); // Re-fetch to get the latest list
    setExamName(''); setRegistrationId(''); setPassword(''); setNotes('');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      await deleteApplicationRecord(id, uid);
      await fetchRecords(); // Re-fetch
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Application Tracker</h2>
          <p className="text-slate-500 mt-2">Securely save your application details {user ? "to your account" : "locally on your device"}.</p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg text-sm text-yellow-800">
            <strong>Privacy Note:</strong> All data is stored {user ? "in your secure cloud profile" : "only on your device. Clearing browser data will delete these records"}.
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                 <Card>
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Add New Record</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input id="examName" label="Exam Name" value={examName} onChange={(e) => setExamName(e.target.value)} required />
                        <Input id="regId" label="Registration ID / Roll No." value={registrationId} onChange={(e) => setRegistrationId(e.target.value)} required />
                        <Input id="password" label="Password / DOB" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <div>
                           <label htmlFor="notes" className="block text-sm font-medium text-slate-700">Notes</label>
                           <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"></textarea>
                        </div>
                        <Button type="submit" className="w-full !py-2.5">Save Record</Button>
                    </form>
                </Card>
            </div>
            <div className="lg:col-span-2">
                 <h3 className="text-lg font-bold text-slate-800 mb-4">Saved Applications</h3>
                {isLoading ? <p>Loading...</p> : records.length === 0 ? (
                  <p className="text-slate-500 text-center bg-white p-6 rounded-xl border border-slate-200">No saved records found.</p>
                ) : (
                  <div className="space-y-4">
                    {records.map(record => (
                      <div key={record.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-teal-700">{record.examName}</h4>
                            <p className="text-sm text-slate-600 mt-1 break-all"><span className="font-semibold">ID/Roll:</span> {record.registrationId}</p>
                            {record.password && <p className="text-sm text-slate-600 break-all"><span className="font-semibold">Password:</span> {record.password}</p>}
                            {record.notes && <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap"><span className="font-semibold">Notes:</span><br/>{record.notes}</p>}
                          </div>
                          <button onClick={() => handleDelete(record.id)} className="p-2 rounded-full hover:bg-red-100 text-slate-500 hover:text-red-600 transition">
                              Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default ApplicationTracker;