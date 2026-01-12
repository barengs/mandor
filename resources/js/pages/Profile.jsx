import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { User, Mail, Lock, Save, AlertCircle, CheckCircle } from 'lucide-react';

const Profile = () => {
    const { user, refetchUser } = useAuth();
    const queryClient = useQueryClient();
    
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });
    
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    const updateProfile = useMutation({
        mutationFn: async (data) => {
            const { data: response } = await api.put('/profile', data);
            return response;
        },
        onSuccess: (data) => {
            setSuccessMessage('Profile updated successfully!');
            setErrors({});
            setFormData(prev => ({
                ...prev,
                current_password: '',
                new_password: '',
                new_password_confirmation: '',
            }));
            refetchUser();
            setTimeout(() => setSuccessMessage(''), 3000);
        },
        onError: (error) => {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({ general: error.response?.data?.message || 'Failed to update profile' });
            }
            setSuccessMessage('');
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});
        
        const submitData = {
            name: formData.name,
            email: formData.email,
        };
        
        if (formData.new_password) {
            submitData.current_password = formData.current_password;
            submitData.new_password = formData.new_password;
            submitData.new_password_confirmation = formData.new_password_confirmation;
        }
        
        updateProfile.mutate(submitData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Profile Settings</h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                    Manage your account information and password
                </p>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <p className="text-green-700 dark:text-green-300">{successMessage}</p>
                </div>
            )}

            {/* Error Message */}
            {errors.general && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <p className="text-red-700 dark:text-red-300">{errors.general}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Info Card */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                        Profile Information
                    </h2>
                    
                    <div className="space-y-4">
                        {/* Avatar */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                <span className="text-2xl font-bold text-orange-600 dark:text-orange-500">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <p className="font-medium text-zinc-900 dark:text-white">{user?.name}</p>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">{user?.email}</p>
                            </div>
                        </div>

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name[0]}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email[0]}</p>}
                        </div>
                    </div>
                </div>

                {/* Password Card */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                        Change Password
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                        Leave blank if you don't want to change password
                    </p>
                    
                    <div className="space-y-4">
                        {/* Current Password */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Current Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                <input
                                    type="password"
                                    name="current_password"
                                    value={formData.current_password}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                            {errors.current_password && <p className="mt-1 text-sm text-red-500">{errors.current_password[0]}</p>}
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                <input
                                    type="password"
                                    name="new_password"
                                    value={formData.new_password}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                            {errors.new_password && <p className="mt-1 text-sm text-red-500">{errors.new_password[0]}</p>}
                        </div>

                        {/* Confirm New Password */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                <input
                                    type="password"
                                    name="new_password_confirmation"
                                    value={formData.new_password_confirmation}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={updateProfile.isPending}
                        className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-medium rounded-lg transition-colors"
                    >
                        <Save className="w-4 h-4" />
                        {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Profile;
