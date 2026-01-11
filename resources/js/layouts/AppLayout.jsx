import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, FolderKanban, Settings, LogOut, ChevronDown, Building2, Users, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Workspaces', href: '/workspaces', icon: Building2 },
];

const adminNavigation = [
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Roles', href: '/roles', icon: ShieldCheck },
];

const AppLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
                    <Link to="/dashboard" className="text-xl font-bold text-zinc-900 dark:text-white">
                        Mandor<span className="text-orange-600">.</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-500'
                                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                                }`}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        );
                    })}

                    {/* Admin Section */}
                    <div className="pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-700">
                        <p className="px-3 mb-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                            Administration
                        </p>
                        {adminNavigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-500'
                                            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                                    }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.name}
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
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                <span className="text-sm font-semibold text-orange-600 dark:text-orange-500">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1 text-left">
                                <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                                    {user?.name}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                                    {user?.email}
                                </p>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {userMenuOpen && (
                            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg overflow-hidden">
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
            <main className="pl-64">
                <div className="min-h-screen">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AppLayout;
