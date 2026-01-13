import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import { useTranslation } from 'react-i18next';

const Register = () => {
    const { t } = useTranslation();
    const { login } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // CSRF cookie is handled by the api instance interceptor or implicitly
            await api.get('/sanctum/csrf-cookie');
            await api.post('/register', {
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });
            // Auto login after register
            await login({ email, password });
        } catch (err) {
            setError(err.response?.data?.message || t('auth.register.failed'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{t('auth.register.title')}</h2>
                <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-sm">{t('auth.register.subtitle')}</p>
            </div>
            
            {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2" role="alert">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-circle"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 text-sm font-medium mb-2" htmlFor="name">
                        {t('auth.fields.name')}
                    </label>
                    <input
                        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400"
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 text-sm font-medium mb-2" htmlFor="email">
                        {t('auth.fields.email')}
                    </label>
                    <input
                        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400"
                        id="email"
                        type="email"
                        placeholder={t('auth.fields.placeholder_email')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 text-sm font-medium mb-2" htmlFor="password">
                         {t('auth.fields.password')}
                    </label>
                    <input
                        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400"
                        id="password"
                        type="password"
                        placeholder={t('auth.fields.placeholder_password')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 text-sm font-medium mb-2" htmlFor="password_confirmation">
                        {t('auth.fields.confirm_password')}
                    </label>
                    <input
                        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400"
                        id="password_confirmation"
                        type="password"
                        placeholder={t('auth.fields.placeholder_password')}
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        required
                    />
                </div>
                
                <button
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>{t('auth.register.submitting')}</span>
                        </>
                    ) : (
                        t('auth.register.submit')
                    )}
                </button>

                <div className="mt-6 text-center text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">{t('auth.register.has_account')} </span>
                    <Link to="/login" className="font-semibold text-orange-600 hover:text-orange-500 dark:text-orange-500 dark:hover:text-orange-400 transition-colors">
                         {t('auth.register.signin')}
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default Register;
