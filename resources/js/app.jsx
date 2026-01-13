import './bootstrap';
import './i18n'; // Import i18n config
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Layouts
import GuestLayout from './layouts/GuestLayout';
import AppLayout from './layouts/AppLayout';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import WorkspaceList from './pages/workspaces/WorkspaceList';
import WorkspaceDetail from './pages/workspaces/WorkspaceDetail';
import WorkspaceMembers from './pages/workspaces/WorkspaceMembers';
import ProjectBoard from './pages/projects/ProjectBoard';
import UserManagement from './pages/users/UserManagement';
import UserDetail from './pages/users/UserDetail';
import RoleManagement from './pages/users/RoleManagement';
import Profile from './pages/Profile';
import ProjectReport from './components/ProjectReport';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }) => {
    const { user, isLoading } = useAuth();
    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950"><div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full"></div></div>;
    if (!user) return <Navigate to="/login" />;
    return <AppLayout>{children}</AppLayout>;
};

const GuestRoute = ({ children }) => {
    const { user, isLoading } = useAuth();
    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950"><div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full"></div></div>;
    if (user) return <Navigate to="/dashboard" />;
    return children;
};

const router = createBrowserRouter([
    {
        path: '/',
        element: <LandingPage />,
    },
    {
        path: '/login',
        element: <GuestRoute><GuestLayout><Login /></GuestLayout></GuestRoute>,
    },
    {
        path: '/register',
        element: <GuestRoute><GuestLayout><Register /></GuestLayout></GuestRoute>,
    },
    {
        path: '/dashboard',
        element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
    },
    {
        path: '/workspaces',
        element: <ProtectedRoute><WorkspaceList /></ProtectedRoute>,
    },
    {
        path: '/workspaces/:id',
        element: <ProtectedRoute><WorkspaceDetail /></ProtectedRoute>,
    },
    {
        path: '/workspaces/:id/members',
        element: <ProtectedRoute><WorkspaceMembers /></ProtectedRoute>,
    },
    {
        path: '/projects/:id',
        element: <ProtectedRoute><ProjectBoard /></ProtectedRoute>,
    },
    {
        path: '/projects/:id/report',
        element: <ProtectedRoute><ProjectReport /></ProtectedRoute>,
    },
    {
        path: '/users',
        element: <ProtectedRoute><UserManagement /></ProtectedRoute>,
    },
    {
        path: '/users/:id',
        element: <ProtectedRoute><UserDetail /></ProtectedRoute>,
    },
    {
        path: '/roles',
        element: <ProtectedRoute><RoleManagement /></ProtectedRoute>,
    },
    {
        path: '/profile',
        element: <ProtectedRoute><Profile /></ProtectedRoute>,
    },
]);

ReactDOM.createRoot(document.getElementById('app')).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <RouterProvider router={router} />
                <Toaster 
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#18181b',
                            color: '#fff',
                        },
                        success: {
                            iconTheme: {
                                primary: '#f97316',
                                secondary: '#fff',
                            },
                        },
                    }}
                />
            </AuthProvider>
        </QueryClientProvider>
    </React.StrictMode>
);
