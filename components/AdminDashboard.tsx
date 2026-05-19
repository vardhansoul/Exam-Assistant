
import React, { useState, useEffect, useMemo } from 'react';
import type { User, FullUserProfile } from '../types';
import { 
    listenToUsers, 
    listenToActivityLog,  
    deleteUserDocument, 
    adminCreateUser, 
    toggleUserBlockStatus, 
    ensureAdminPermissions
} from '../firebase';
import { ADMIN_EMAILS } from '../constants';
import Button from './Button';
import Card from './Card';
import Input from './Input';
import LoadingSpinner from './LoadingSpinner';

// --- Icons ---
const UserPlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3.75 19.5a6.96 6.96 0 0013.5 0v-.25h-3.375c-1.275 0-2.506-.312-3.6-.872A14.993 14.993 0 0112 15.75c-2.52 0-4.873.99-6.6 2.658m-3-12h13.5" />
    </svg>
);

const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);

const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ShieldExclamationIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
    </svg>
);

interface AdminDashboardProps {
    user: User | null;
    onSignOut: () => void;
    setAppMode: (mode: 'user' | 'admin') => void;
}

const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Never';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatDateTime = (timestamp: any) => {
    if (!timestamp) return 'Never';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};



const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onSignOut, setAppMode }) => {
    const [users, setUsers] = useState<FullUserProfile[]>([]);
    const [activityLog, setActivityLog] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    
    // UI States
    const [activeTab, setActiveTab] = useState<'users' | 'activity' | 'settings'>('users');
    const [showAddUser, setShowAddUser] = useState(false);
    const [selectedUser, setSelectedUser] = useState<FullUserProfile | null>(null);
    
    // Create User Form
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserName, setNewUserName] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [isCreatingUser, setIsCreatingUser] = useState(false);

    useEffect(() => {
        // Init: Ensure permissions are robust
        if (user?.uid) ensureAdminPermissions(user.uid).catch(() => {});

        const unsubscribeUsers = listenToUsers((data) => {
            setUsers(data);
            setIsLoading(false);
        });
        
        const unsubscribeLogs = listenToActivityLog(setActivityLog);

        return () => {
            unsubscribeUsers();
            unsubscribeLogs();
        };
    }, [user?.uid]);

    const filteredUsers = useMemo(() => {
        const lowerTerm = searchTerm.toLowerCase();
        return users.filter(u => 
            (u.displayName?.toLowerCase() || '').includes(lowerTerm) ||
            (u.email?.toLowerCase() || '').includes(lowerTerm)
        );
    }, [users, searchTerm]);

    const getUserName = (uid: string) => {
        if (!uid) return 'System/Anonymous';
        const foundUser = users.find(u => u.uid === uid);
        return foundUser?.displayName || (uid === 'guest' ? 'Guest' : 'Unknown User');
    };

    // --- Actions ---

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUserEmail || !newUserName || !newUserPassword) return;
        if (newUserPassword.length < 6) {
            alert("Password must be at least 6 characters.");
            return;
        }

        setIsCreatingUser(true);
        try {
            await adminCreateUser(newUserEmail, newUserPassword, newUserName, false);
            setShowAddUser(false);
            setNewUserEmail('');
            setNewUserName('');
            setNewUserPassword('');
            alert("User created successfully!");
        } catch (e: any) {
            alert(`Error: ${e.message}`);
        } finally {
            setIsCreatingUser(false);
        }
    };

    const handleToggleBlock = async (uid: string, currentStatus: boolean) => {
        if (window.confirm(`Are you sure you want to ${currentStatus ? 'UNBLOCK' : 'BLOCK'} this user?`)) {
            try {
                await toggleUserBlockStatus(uid, !currentStatus);
                // If viewing this user, update local state visually
                if (selectedUser?.uid === uid) {
                    setSelectedUser(prev => prev ? ({ ...prev, isBlocked: !currentStatus }) : null);
                }
            } catch (error) {
                console.error("Failed to toggle user block status:", error);
                alert("Failed to update user status. Please check permissions.");
            }
        }
    };

    const handleDeleteUser = async (uid: string) => {
        if (window.confirm("WARNING: This will permanently delete the user's data from the database. This action cannot be undone. Continue?")) {
            try {
                await deleteUserDocument(uid);
                if (selectedUser?.uid === uid) setSelectedUser(null);
            } catch (error) {
                console.error("Failed to delete user:", error);
                alert("Failed to delete user. Please check permissions.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-200">
            {/* Top Navigation Bar */}
            <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-2 rounded-lg text-white">
                            <ShieldExclamationIcon className="w-6 h-6" />
                        </div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Super Admin Console</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-semibold">{user?.displayName}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Super Admin</p>
                        </div>
                        <Button onClick={() => setAppMode('user')} variant="outline" className="!py-2 !px-4 text-sm">
                            Switch to App
                        </Button>
                        <Button onClick={onSignOut} variant="secondary" className="!py-2 !px-4 text-sm">
                            Sign Out
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="flex items-center p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none">
                        <div className="p-3 bg-white/20 rounded-full mr-4">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Total Users</p>
                            <h3 className="text-3xl font-bold">{users.length}</h3>
                        </div>
                    </Card>
                    <Card className="flex items-center p-6 border-l-4 border-l-amber-500">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full mr-4 text-amber-600 dark:text-amber-400">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Recent Activities</p>
                            <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{activityLog.length}</h3>
                        </div>
                    </Card>
                </div>

                {/* Tabs & Content */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden min-h-[600px] flex flex-col">
                    <div className="flex border-b border-slate-200 dark:border-slate-700 px-6 pt-4 gap-6 overflow-x-auto">
                        {['users', 'activity', 'settings'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`pb-4 px-2 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors whitespace-nowrap ${
                                    activeTab === tab 
                                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' 
                                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                                }`}
                            >
                                {tab === 'activity' ? 'Activity Log' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="p-6 flex-grow flex flex-col">
                        {/* Users Tab */}
                        {activeTab === 'users' && (
                            <>
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                                    <div className="relative w-full sm:w-96">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <SearchIcon className="w-5 h-5" />
                                        </div>
                                        <input 
                                            type="text" 
                                            placeholder="Search by name or email..." 
                                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <Button onClick={() => setShowAddUser(true)} className="flex items-center gap-2 !py-2.5">
                                        <UserPlusIcon className="w-5 h-5" /> Add User
                                    </Button>
                                </div>

                                <div className="overflow-x-auto flex-grow rounded-lg border border-slate-200 dark:border-slate-700">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                                            <tr>
                                                <th className="px-6 py-4">User</th>
                                                <th className="px-6 py-4">Joined / Last Login</th>
                                                <th className="px-6 py-4">Role</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                                            {isLoading ? (
                                                <tr><td colSpan={5} className="px-6 py-12 text-center"><LoadingSpinner /></td></tr>
                                            ) : filteredUsers.length === 0 ? (
                                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No users found.</td></tr>
                                            ) : (
                                                filteredUsers.map(u => (
                                                    <tr key={u.uid} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-lg">
                                                                    {u.displayName ? u.displayName.charAt(0).toUpperCase() : 'U'}
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-slate-900 dark:text-slate-100">{u.displayName || 'Unknown'}</p>
                                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 space-y-1">
                                                            <div className="flex items-center gap-2 text-xs">
                                                                <span className="font-semibold w-12">Joined:</span> 
                                                                {formatDate(u.createdAt)}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs">
                                                                <span className="font-semibold w-12">Active:</span> 
                                                                {formatDate(u.lastLogin)}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {ADMIN_EMAILS.some(e => e.toLowerCase() === u.email?.toLowerCase()) ? (
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">Super Admin</span>
                                                            ) : (
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">User</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {u.isBlocked ? (
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">Blocked</span>
                                                            ) : (
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Active</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button onClick={() => setSelectedUser(u)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors" title="View Details">
                                                                    <EyeIcon className="w-5 h-5" />
                                                                </button>
                                                                <button onClick={() => handleToggleBlock(u.uid, !!u.isBlocked)} className={`p-2 rounded-full transition-colors ${u.isBlocked ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-slate-400 hover:text-orange-600 hover:bg-orange-50'}`} title={u.isBlocked ? "Unblock User" : "Block User"}>
                                                                    <ShieldExclamationIcon className="w-5 h-5" />
                                                                </button>
                                                                <button onClick={() => handleDeleteUser(u.uid)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Delete User">
                                                                    <TrashIcon className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}

                        {/* Activity Tab */}
                        {activeTab === 'activity' && (
                            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Time</th>
                                            <th className="px-6 py-4">User</th>
                                            <th className="px-6 py-4">Action</th>
                                            <th className="px-6 py-4">Context</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                                        {activityLog.map((log, i) => (
                                            <tr key={log.id || i}>
                                                <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{formatDateTime(log.timestamp)}</td>
                                                <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{getUserName(log.uid)}</td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{log.description}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-mono">{log.type}</span>
                                                </td>
                                            </tr>
                                        ))}
                                        {activityLog.length === 0 && <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500">No recent activity.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Settings Tab */}
                        {activeTab === 'settings' && (
                            <div className="max-w-2xl mx-auto w-full space-y-8">
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Settings</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">No settings available at this time.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Modals */}
            
            {/* Create User Modal */}
            {showAddUser && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Create New User</h3>
                            <button onClick={() => setShowAddUser(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>
                        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                            <Input label="Full Name" value={newUserName} onChange={e => setNewUserName(e.target.value)} required />
                            <Input label="Email" type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} required />
                            <Input label="Password" type="text" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} required placeholder="Min 6 chars" />
                            <div className="pt-4">
                                <Button type="submit" className="w-full !py-3" disabled={isCreatingUser}>
                                    {isCreatingUser ? 'Creating...' : 'Create Account'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* User Details Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold">
                                    {selectedUser.displayName ? selectedUser.displayName.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{selectedUser.displayName}</h3>
                                    <p className="text-sm text-slate-500">{selectedUser.email}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedUser(null)} className="p-2 bg-slate-200 dark:bg-slate-700 rounded-full hover:bg-slate-300 transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                                    <p className="text-xs text-slate-500 uppercase font-bold">Status</p>
                                    <p className={`font-bold ${selectedUser.isBlocked ? 'text-red-600' : 'text-green-600'}`}>
                                        {selectedUser.isBlocked ? 'Blocked' : 'Active'}
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                                    <p className="text-xs text-slate-500 uppercase font-bold">Logins</p>
                                    <p className="font-bold text-slate-800 dark:text-slate-200">{selectedUser.loginCount || 0}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-100 pb-1">Profile Details</h4>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between"><span className="text-slate-500">Gender:</span> <span className="font-medium">{selectedUser.profile?.gender || '-'}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-500">DOB:</span> <span className="font-medium">{selectedUser.profile?.dob || '-'}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-500">Location:</span> <span className="font-medium">{selectedUser.profile?.place || '-'}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-500">Target Job:</span> <span className="font-medium text-indigo-600">{selectedUser.profile?.interestedJobs || '-'}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-500">College:</span> <span className="font-medium">{selectedUser.profile?.college || '-'}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-500">Course:</span> <span className="font-medium">{selectedUser.profile?.course || '-'}</span></div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-100 pb-1">System Info</h4>
                                <div className="space-y-2 text-sm">
                                    <p><span className="text-slate-500">UID:</span> <span className="font-mono text-xs bg-slate-100 px-1 rounded">{selectedUser.uid}</span></p>
                                    <p><span className="text-slate-500">Created:</span> {formatDate(selectedUser.createdAt)}</p>
                                    <p><span className="text-slate-500">Current Focus:</span> {selectedUser.currentFocus || 'None'}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                            <Button onClick={() => handleToggleBlock(selectedUser.uid, !!selectedUser.isBlocked)} variant={selectedUser.isBlocked ? 'success' : 'danger'}>
                                {selectedUser.isBlocked ? 'Unblock Account' : 'Block Account'}
                            </Button>
                            <Button onClick={() => setSelectedUser(null)} variant="secondary">Close</Button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
                @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
