import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile } from '../firebase';
import { getSpecificErrorMessage } from '../utils/errors';
import type { User, UserProfile as UserProfileType, Notification } from '../types';
import { JOB_ROLES } from '../constants';
import Card from './Card';
import Button from './Button';
import Input from './Input';
import Select from './Select';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

interface UserProfileProps {
    user: User | null;
    setNotification: (notification: Notification | null) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, setNotification }) => {
    const [profile, setProfile] = useState<UserProfileType>({
        dob: '', college: '', school: '', course: '', place: '', gender: '', interestedJobs: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            setIsLoading(false);
            setError("You must be logged in to view your profile.");
            return;
        }

        const fetchProfile = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const profileData = await getUserProfile(user.uid);
                if (profileData) {
                    setProfile(profileData);
                }
            } catch (err) {
                setError(getSpecificErrorMessage(err));
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSaving(true);
        setError(null);
        try {
            // This function saves the profile data securely to the user's document in the cloud (Firebase Firestore).
            await updateUserProfile(user.uid, profile);
            setNotification({ type: 'success', message: 'Profile updated successfully!' });
        } catch (err) {
            setError(getSpecificErrorMessage(err));
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <Card className="text-center"><LoadingSpinner /></Card>;
    }
    
    return (
        <div className="max-w-3xl mx-auto">
            <Card>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">My Profile</h2>
                <ErrorMessage message={error} />
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Input label="Date of Birth" name="dob" type="date" value={profile.dob} onChange={handleChange} />
                        <Input label="Gender" name="gender" value={profile.gender} onChange={handleChange} placeholder="e.g., Male, Female, Other" />
                        <Input label="City/Town" name="place" value={profile.place} onChange={handleChange} placeholder="e.g., Delhi" />
                        <Select 
                            label="Target Job Role" 
                            name="interestedJobs" 
                            value={profile.interestedJobs} 
                            onChange={handleChange} 
                            options={JOB_ROLES} 
                            placeholder="Select your target role"
                        />
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Input label="Latest School Attended" name="school" value={profile.school} onChange={handleChange} />
                        <Input label="Latest College/University" name="college" value={profile.college} onChange={handleChange} />
                     </div>
                     <Input label="Course/Stream" name="course" value={profile.course} onChange={handleChange} placeholder="e.g., B.Tech in CS, B.A. in History" />
                    <div className="text-right pt-4">
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default UserProfile;