import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, CheckCircle2, Layout, MessageSquare, Zap, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const LandingPage = () => {
    const { user } = useAuth();
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans">
            {/* Navbar */}
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-zinc-100 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <span className="text-2xl font-bold tracking-tight">
                                Mandor<span className="text-orange-600">.</span>
                            </span>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-sm font-medium text-zinc-600 hover:text-orange-600 transition-colors">{t('nav.features')}</a>
                            <a href="#solutions" className="text-sm font-medium text-zinc-600 hover:text-orange-600 transition-colors">{t('nav.solutions')}</a>
                            <a href="#pricing" className="text-sm font-medium text-zinc-600 hover:text-orange-600 transition-colors">{t('nav.pricing')}</a>
                        </div>
                        <div className="flex items-center space-x-4">
                            <LanguageSwitcher />
                            {user ? (
                                <Link
                                    to="/dashboard"
                                    className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
                                >
                                    {t('nav.dashboard')}
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="text-sm font-medium text-zinc-600 hover:text-orange-600 transition-colors"
                                    >
                                        {t('nav.login')}
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors shadow-sm hover:shadow"
                                    >
                                        {t('nav.signup')}
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
                    <div className="mx-auto max-w-3xl">
                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 mb-6 leading-tight">
                            {t('hero.headline')}
                        </h1>
                        <p className="text-xl text-zinc-500 mb-10 max-w-2xl mx-auto leading-relaxed">
                            {t('hero.subheadline')}
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                to="/register"
                                className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white bg-orange-600 rounded-xl hover:bg-orange-700 transition-all shadow-lg hover:shadow-orange-200 transform hover:-translate-y-0.5"
                            >
                                {t('hero.cta_primary')}
                            </Link>
                            <Link
                                to="/login"
                                className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-zinc-700 bg-zinc-100 rounded-xl hover:bg-zinc-200 transition-all"
                            >
                                {t('hero.cta_secondary')}
                            </Link>
                        </div>
                        <p className="mt-6 text-sm text-zinc-400">
                            {t('hero.free_forever')}
                        </p>
                    </div>
                </div>
                
                {/* Abstract Visual/Mockup Placeholder */}
                <div className="mt-16 relative max-w-5xl mx-auto px-4">
                    <div className="relative rounded-2xl bg-zinc-900 p-2 shadow-2xl ring-1 ring-zinc-900/10">
                         <div className="rounded-xl bg-zinc-800 aspect-[16/9] overflow-hidden flex items-center justify-center border border-zinc-700/50">
                            {/* Simple generic dashboard representation */}
                            <div className="w-full h-full bg-zinc-900 p-6 flex gap-6">
                                <div className="w-64 h-full bg-zinc-800/50 rounded-lg border border-zinc-700/50 hidden md:block"></div>
                                <div className="flex-1 h-full bg-zinc-800/50 rounded-lg border border-zinc-700/50 p-4">
                                     <div className="w-1/3 h-8 bg-zinc-700/50 rounded mb-6"></div>
                                     <div className="space-y-4">
                                         <div className="h-24 w-full bg-orange-500/10 border border-orange-500/20 rounded-lg"></div>
                                         <div className="h-24 w-full bg-zinc-700/30 border border-zinc-700/50 rounded-lg"></div>
                                         <div className="h-24 w-full bg-zinc-700/30 border border-zinc-700/50 rounded-lg"></div>
                                     </div>
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-zinc-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-base font-semibold text-orange-600 uppercase tracking-wide">
                           {t('features.section_title')}
                        </h2>
                        <h3 className="mt-2 text-3xl font-bold text-zinc-900 sm:text-4xl">
                            {t('features.section_subtitle')}
                        </h3>
                        <p className="mt-4 text-lg text-zinc-500">
                            {t('features.section_desc')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 hover:border-orange-100 hover:shadow-md transition-all">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                                <Layout className="w-6 h-6 text-orange-600" />
                            </div>
                            <h4 className="text-xl font-bold text-zinc-900 mb-3">{t('features.views_title')}</h4>
                            <p className="text-zinc-500 leading-relaxed">
                                {t('features.views_desc')}
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 hover:border-orange-100 hover:shadow-md transition-all">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                                <MessageSquare className="w-6 h-6 text-blue-600" />
                            </div>
                            <h4 className="text-xl font-bold text-zinc-900 mb-3">{t('features.chat_title')}</h4>
                            <p className="text-zinc-500 leading-relaxed">
                                {t('features.chat_desc')}
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 hover:border-orange-100 hover:shadow-md transition-all">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                                <Zap className="w-6 h-6 text-green-600" />
                            </div>
                            <h4 className="text-xl font-bold text-zinc-900 mb-3">{t('features.automation_title')}</h4>
                            <p className="text-zinc-500 leading-relaxed">
                                {t('features.automation_desc')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

             {/* Values Section */}
             <section className="py-24 bg-white border-t border-zinc-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-zinc-900 mb-6">
                                {t('values.title')}
                            </h2>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <CheckCircle2 className="w-6 h-6 text-orange-600 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold text-zinc-900">{t('values.task_mgmt_title')}</h4>
                                        <p className="text-zinc-500 mt-1">{t('values.task_mgmt_desc')}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <CheckCircle2 className="w-6 h-6 text-orange-600 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold text-zinc-900">{t('values.collab_title')}</h4>
                                        <p className="text-zinc-500 mt-1">{t('values.collab_desc')}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <CheckCircle2 className="w-6 h-6 text-orange-600 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold text-zinc-900">{t('values.secure_title')}</h4>
                                        <p className="text-zinc-500 mt-1">{t('values.secure_desc')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-orange-100 to-orange-50 rounded-3xl transform rotate-3"></div>
                            <div className="relative bg-zinc-900 rounded-2xl shadow-xl p-8 transform -rotate-2 border border-zinc-800">
                                {/* Abstract UI Element representing security/speed */}
                                <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-4">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                    <div className="text-zinc-500 text-xs">mandor-app.exe</div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between bg-zinc-800 p-4 rounded-lg border border-zinc-700">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                                                <Shield className="w-4 h-4 text-orange-500" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-white">Project Alpha</div>
                                                <div className="text-xs text-zinc-400">Security Audit</div>
                                            </div>
                                        </div>
                                        <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">Completed</span>
                                    </div>
                                    <div className="flex items-center justify-between bg-zinc-800 p-4 rounded-lg border border-zinc-700">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                <Zap className="w-4 h-4 text-blue-500" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-white">Sprint Velocity</div>
                                                <div className="text-xs text-zinc-400">Team Performance</div>
                                            </div>
                                        </div>
                                        <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400">+24%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-zinc-100 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div className="col-span-1 md:col-span-2">
                            <span className="text-2xl font-bold tracking-tight">
                                Mandor<span className="text-orange-600">.</span>
                            </span>
                            <p className="mt-4 text-zinc-500 text-sm max-w-xs">
                                {t('footer.desc')}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-zinc-900 mb-4">{t('footer.product')}</h4>
                            <ul className="space-y-2 text-sm text-zinc-500">
                                <li><a href="#" className="hover:text-orange-600">{t('nav.features')}</a></li>
                                <li><a href="#" className="hover:text-orange-600">{t('nav.pricing')}</a></li>
                                <li><a href="#" className="hover:text-orange-600">Enterprise</a></li>
                                <li><a href="#" className="hover:text-orange-600">Security</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-zinc-900 mb-4">{t('footer.company')}</h4>
                            <ul className="space-y-2 text-sm text-zinc-500">
                                <li><a href="#" className="hover:text-orange-600">About Us</a></li>
                                <li><a href="#" className="hover:text-orange-600">Careers</a></li>
                                <li><a href="#" className="hover:text-orange-600">Blog</a></li>
                                <li><a href="#" className="hover:text-orange-600">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center text-sm text-zinc-400">
                        <p>© 2024 Mandor Inc. {t('footer.rights')}</p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <a href="#" className="hover:text-zinc-600">{t('footer.privacy')}</a>
                            <a href="#" className="hover:text-zinc-600">{t('footer.terms')}</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
