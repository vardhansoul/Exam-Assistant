

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { db, serverTimestamp, query, collection, orderBy, getDocs, updateDoc, doc, initializeApp, getAuth, createUserWithEmailAndPassword, updateProfile, signOut, deleteApp, setDoc, firebaseConfig } from '../firebase';
import type { UserProfile } from '../types';
import Card from './Card';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import Input from './Input';
import Badge from './Badge';
import Switch from './Switch';


// --- Reusable Tabs Component ---
const Tabs: React.FC<{ tabs: { id: string, label: string }[], activeTab: string, setActiveTab: (id: string) => void }> = ({ tabs, activeTab, setActiveTab }) => (
    <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                        activeTab === tab.id
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm transition-colors`}
                >
                    {tab.label}
                </button>
            ))}
        </nav>
    </div>
);


const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async (showLoading = true) => {
        if (showLoading) setIsLoading(true);
        setError(null);
        try {
            const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(usersQuery);
            const userList = snapshot.docs.map(doc => {
                const data = doc.data();
                // Ensure id is explicitly cast to UserProfile
                return { ...data, uid: doc.id } as UserProfile;
            });
            setUsers(userList);
        } catch (err) {
            setError("Failed to fetch users. Check console for details.");
            console.error(err);
        } finally {
            if (showLoading) setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'management', label: 'User Management' },
        { id: 'create', label: 'Create User' },
    ];
    
    return (
        <div className="max-w-6xl mx-auto space-y-6">
             <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

            {error && <p className="text-red-600 bg-red-100 p-3 rounded-md text-center">{error}</p>}

            {isLoading ? <div className="py-10"><LoadingSpinner/></div> : (
                 <div className="mt-6">
                    {activeTab === 'overview' && <OverviewTab users={users} />}
                    {activeTab === 'management' && <UserManagementTab users={users} setUsers={setUsers} refreshUsers={fetchUsers} />}
                    {activeTab === 'create' && <CreateUserTab onUserCreated={() => fetchUsers(false)} />}
                </div>
            )}
        </div>
    );
};


// --- Overview Tab Component ---
const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center">
            <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-800">{value}</p>
            </div>
        </div>
    </div>
);

const OverviewTab: React.FC<{ users: UserProfile[] }> = ({ users }) => {
    const stats = useMemo(() => ({
        totalUsers: users.length,
        admins: users.filter(u => u.role === 'admin').length,
        apiAccess: users.filter(u => u.hasApiAccess).length,
    }), [users]);

    const recentUsers = useMemo(() => users.slice(0, 5), [users]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
                <StatCard title="Total Users" value={stats.totalUsers} />
                <StatCard title="Admins" value={stats.admins} />
                <StatCard title="API Access Enabled" value={stats.apiAccess} />
            </div>
            <div className="lg:col-span-2">
                <Card>
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Signups</h3>
                    <div className="space-y-3">
                        {recentUsers.length > 0 ? recentUsers.map(user => (
                             <div key={user.uid} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-slate-800">{user.name}</p>
                                    <p className="text-sm text-slate-500">{user.email}</p>
                                </div>
                                <p className="text-xs text-slate-400">
                                    {user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        )) : <p className="text-center text-slate-500 py-8">No recent users.</p>}
                    </div>
                </Card>
            </div>
        </div>
    );
};

// --- User Management Tab Component ---
const UserManagementTab: React.FC<{ users: UserProfile[]; setUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>; refreshUsers: (showLoading?: boolean) => void }> = ({ users, setUsers, refreshUsers }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleToggleAccess = async (uid: string, currentAccess: boolean) => {
        setUsers(prevUsers => prevUsers.map(user => user.uid === uid ? { ...user, hasApiAccess: !currentAccess } : user));
        try {
            await updateDoc(doc(db, 'users', uid), { hasApiAccess: !currentAccess });
        } catch (err) {
            alert(`Failed to update access for user ${uid}. Reverting change.`);
            setUsers(prevUsers => prevUsers.map(user => user.uid === uid ? { ...user, hasApiAccess: currentAccess } : user));
        }
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Card>
             <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">User Management</h2>
                    <p className="text-sm text-slate-500">Manage user access to AI features.</p>
                </div>
                 <div className="flex items-center gap-4">
                    <Input id="search" label="" type="text" placeholder="Search users..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    <Button onClick={() => refreshUsers()} variant="secondary" className="!p-2.5 !rounded-lg" title="Refresh users">
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Registered</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">API Access</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {filteredUsers.map(user => (
                            <tr key={user.uid}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-slate-900">{user.name}</div>
                                    <div className="text-sm text-slate-500 truncate" title={user.email}>{user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {user.role === 'admin' ? <Badge variant="success">Admin</Badge> : <Badge>User</Badge>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                    {user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Switch
                                        checked={user.hasApiAccess}
                                        onChange={() => handleToggleAccess(user.uid, user.hasApiAccess)}
                                        disabled={user.role === 'admin'}
                                        aria-label={`API Access for ${user.name}`}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             {filteredUsers.length === 0 && <p className="text-center text-slate-500 py-8">No users found.</p>}
        </Card>
    );
};

// --- Create User Tab Component ---
const CreateUserTab: React.FC<{ onUserCreated: () => void }> = ({ onUserCreated }) => {
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        setMessage(null);

        const tempAppName = `temp-user-creation-${Date.now()}`;
        let tempApp;
        try {
            tempApp = initializeApp(firebaseConfig, tempAppName);
        } catch (error) {
            setMessage({ type: 'error', text: "Failed to initialize temporary app for user creation." });
            setIsCreating(false);
            return;
        }
        
        const tempAuth = getAuth(tempApp);

        try {
            const userCredential = await createUserWithEmailAndPassword(tempAuth, newEmail, newPassword);
            const user = userCredential.user;
            if (user) {
                await updateProfile(user, { displayName: newName });
                await setDoc(doc(db, 'users', user.uid), {
                    uid: user.uid,
                    email: user.email,
                    name: newName,
                    role: 'user',
                    hasApiAccess: true, // Default to true
                    createdAt: serverTimestamp(),
                });
                setMessage({ type: 'success', text: 'User created successfully!' });
                setNewName(''); setNewEmail(''); setNewPassword('');
                onUserCreated();
            } else { throw new Error("User object not returned from creation."); }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            if (tempAuth.currentUser) await signOut(tempAuth);
            await deleteApp(tempApp);
            setIsCreating(false);
            setTimeout(() => setMessage(null), 5000);
        }
    };

    return (
        <Card>
            <h2 className="text-xl font-bold text-slate-800 mb-4">Create New User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
                <Input id="newName" label="Full Name" type="text" value={newName} onChange={(e) => setNewName(e.target.value)} required disabled={isCreating} />
                <Input id="newEmail" label="Email Address" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required disabled={isCreating}/>
                <Input id="newPassword" label="Password (min. 6 characters)" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required disabled={isCreating} />
                <Button type="submit" disabled={isCreating} className="w-full !py-2.5">
                    {isCreating ? 'Creating...' : 'Create User'}
                </Button>
                {message && (
                    <p className={`p-3 rounded-md text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </p>
                )}
            </form>
        </Card>
    );
};


export default AdminDashboard;