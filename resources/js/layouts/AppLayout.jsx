import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { LayoutDashboard, FolderKanban, Settings, LogOut, ChevronDown, Building2, Users, ShieldCheck, Bell, MessageSquare, UserCircle, Hash, PanelLeft, PanelLeftClose } from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

const AppLayout = ({ children }) => {
    const { t } = useTranslation();

    const navigation = useMemo(() => [
        { name: t('layout.sidebar.dashboard'), href: '/dashboard', icon: LayoutDashboard },
        { name: t('layout.sidebar.workspaces'), href: '/workspaces', icon: Building2 },
    ], [t]);

    const adminNavigation = useMemo(() => [
        { name: t('layout.sidebar.users'), href: '/users', icon: Users },
        { name: t('layout.sidebar.roles'), href: '/roles', icon: ShieldCheck },
    ], [t]);

    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    // Initialize collapsed state from localStorage
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const stored = localStorage.getItem('sidebarCollapsed');
        return stored === 'true';
    });
    const notifRef = useRef(null);
    const userDropdownRef = useRef(null);

    // Fetch notifications
    const { data: notifData } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const { data } = await api.get('/notifications');
            return data;
        },
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    // Persist collapsed state
    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    }, [isCollapsed]);

    // Close notification dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
            if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
                setUserDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        toast.success('You have been logged out');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            {/* Sidebar */}
            <aside 
                className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 ease-in-out ${
                    isCollapsed ? 'w-20' : 'w-64'
                }`}
            >
                {/* Logo & Toggle */}
                <div className={`h-16 flex items-center border-b border-zinc-200 dark:border-zinc-800 px-4 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                    {!isCollapsed && (
                        <Link to="/dashboard" className="text-xl font-bold text-zinc-900 dark:text-white truncate">
                            Mandor<span className="text-orange-600">.</span>
                        </Link>
                    )}
                    {isCollapsed && (
                        <Link to="/dashboard" className="text-xl font-bold text-zinc-900 dark:text-white">
                            M<span className="text-orange-600">.</span>
                        </Link>
                    )}
                    
                    <button 
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors ${isCollapsed ? 'absolute right-[calc(50%-14px)] top-[64px] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm z-50' : ''}`}
                    >
                         {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-5 h-5" />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-3 space-y-1">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                title={isCollapsed ? item.name : ''}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-500'
                                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                                } ${isCollapsed ? 'justify-center' : ''}`}
                            >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                {!isCollapsed && <span>{item.name}</span>}
                            </Link>
                        );
                    })}

                    {/* Admin Section */}
                    <div className="pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-700">
                        {!isCollapsed && (
                            <p className="px-3 mb-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                                {t('layout.sidebar.administration')}
                            </p>
                        )}
                        {isCollapsed && (
                            <div className="w-full h-px bg-transparent mb-2"></div>
                        )}
                        {adminNavigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    title={isCollapsed ? item.name : ''}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-500'
                                            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                                    } ${isCollapsed ? 'justify-center' : ''}`}
                                >
                                    <item.icon className="w-5 h-5 flex-shrink-0" />
                                    {!isCollapsed && <span>{item.name}</span>}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* User Menu */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="relative">
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                        >
                            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-semibold text-orange-600 dark:text-orange-500">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            {!isCollapsed && (
                                <>
                                    <div className="flex-1 text-left min-w-0">
                                        <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                                            {user?.name}
                                        </p>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                                            {user?.email}
                                        </p>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                                </>
                            )}
                        </button>

                        {userMenuOpen && (
                            <div className={`absolute bottom-full mb-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg overflow-hidden ${isCollapsed ? 'left-10 w-48' : 'left-0 right-0'}`}>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'pl-20' : 'pl-64'}`}>
                {/* Top Navbar */}
                <header className="sticky top-0 z-40 h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 flex items-center justify-end gap-4">
                    <LanguageSwitcher />
                    {/* Notifications */}
                    <div className="relative" ref={notifRef}>
                        <button
                            onClick={() => setNotifOpen(!notifOpen)}
                            className="relative p-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                            <Bell className="w-5 h-5" />
                            {notifData?.unread_count > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    {notifData.unread_count > 9 ? '9+' : notifData.unread_count}
                                </span>
                            )}
                        </button>

                        {/* Notification Dropdown */}
                        {notifOpen && (
                            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg overflow-hidden">
                                <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
                                    <h3 className="font-semibold text-zinc-900 dark:text-white">{t('layout.navbar.notifications')}</h3>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifData?.data?.length > 0 ? (
                                        notifData.data.map((notif) => (
                                            <div
                                                key={notif.id}
                                                className="px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 border-b border-zinc-100 dark:border-zinc-700 last:border-0"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`p-1.5 rounded ${
                                                        notif.type === 'chat' 
                                                            ? 'bg-green-100 dark:bg-green-900/30' 
                                                            : 'bg-blue-100 dark:bg-blue-900/30'
                                                    }`}>
                                                        {notif.type === 'chat' ? (
                                                            <Hash className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                        ) : (
                                                            <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-zinc-900 dark:text-white">
                                                            <span className="font-medium">{notif.user.name}</span>
                                                            {notif.type === 'chat' ? ` ${t('layout.navbar.sent_message')} ` : ` ${t('layout.navbar.commented_on')} `}
                                                            <span className="font-medium">{notif.context}</span>
                                                        </p>
                                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 truncate">
                                                            "{notif.content}"
                                                        </p>
                                                        <p className="text-xs text-zinc-400 mt-1">{notif.time_ago}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                                            {t('layout.navbar.no_notifications')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User Info with Dropdown */}
                    <div className="relative pl-4 border-l border-zinc-200 dark:border-zinc-700" ref={userDropdownRef}>
                        <button
                            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                            className="flex items-center gap-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg p-2 transition-colors"
                        >
                            <div className="text-right">
                                <p className="text-sm font-medium text-zinc-900 dark:text-white">{user?.name}</p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">{user?.email}</p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                <span className="text-sm font-semibold text-orange-600 dark:text-orange-500">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* User Dropdown Menu */}
                        {userDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg overflow-hidden z-50">
                                <Link
                                    to="/profile"
                                    onClick={() => setUserDropdownOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                                >
                                    <UserCircle className="w-4 h-4" />
                                    {t('layout.navbar.profile_settings')}
                                </Link>
                                <div className="border-t border-zinc-200 dark:border-zinc-700"></div>
                                <button
                                    onClick={() => {
                                        setUserDropdownOpen(false);
                                        handleLogout();
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    {t('layout.navbar.logout')}
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                <div className="min-h-[calc(100vh-4rem)]">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AppLayout;
