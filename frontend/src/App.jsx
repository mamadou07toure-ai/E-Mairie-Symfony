import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'sonner';

// Pages
import Welcome from './pages/Welcome';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import AgentLayout from './layouts/AgentLayout';
import CitizenLayout from './layouts/CitizenLayout';

// Dashboards
import AdminDashboard from './pages/Admin/Dashboard';
import AgentDashboard from './pages/Agent/Dashboard';
import CitoyenDashboard from './pages/Citoyen/Dashboard';

import CreateDemande from './pages/Citoyen/Demandes/Create';
import IndexDemande from './pages/Citoyen/Demandes/Index';
import ShowDemande from './pages/Citoyen/Demandes/Show';

import CitoyenMessages from './pages/Citoyen/Messages';
import CitoyenNotifications from './pages/Citoyen/Notifications';
import CitoyenSettings from './pages/Citoyen/Settings';

import AgentIndexDemande from './pages/Agent/Demandes/Index';
import AgentShowDemande from './pages/Agent/Demandes/Show';

import AdminUsers from './pages/Admin/Users/Index';
import AdminStats from './pages/Admin/Stats';
import AdminSettings from './pages/Admin/Settings';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Chargement...</div>;
    if (!user) return <Navigate to="/login" replace />;
    
    // Simplistic role check for mock
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to their respective dashboard
        if (user.role === 'administrateur') return <Navigate to="/admin/dashboard" replace />;
        if (user.role === 'agent') return <Navigate to="/agent/dashboard" replace />;
        return <Navigate to="/citoyen/dashboard" replace />;
    }
    
    return children;
};

function App() {
  return (
    <AuthProvider>
        <Router>
            <Toaster position="top-right" richColors />
            <div className="min-h-screen bg-mairie-bg text-slate-900 font-sans">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Welcome />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    {/* Admin Routes */}
                    <Route path="/admin" element={
                        <ProtectedRoute allowedRoles={['administrateur']}>
                            <AdminLayout />
                        </ProtectedRoute>
                    }>
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="demandes" element={<AgentIndexDemande apiBase="/admin" />} /> {/* Reusing Agent table for Admin */}
                        <Route path="demandes/:uuid" element={<AgentShowDemande apiBase="/admin" />} /> {/* Reusing Agent view for Admin */}
                        <Route path="stats" element={<AdminStats />} />
                        <Route path="settings" element={<AdminSettings />} />
                        <Route path="" element={<Navigate to="dashboard" replace />} />
                    </Route>

                    {/* Agent Routes */}
                    <Route path="/agent" element={
                        <ProtectedRoute allowedRoles={['agent']}>
                            <AgentLayout />
                        </ProtectedRoute>
                    }>
                        <Route path="dashboard" element={<AgentDashboard />} />
                        <Route path="demandes" element={<AgentIndexDemande />} />
                        <Route path="demandes/:uuid" element={<AgentShowDemande />} />
                        <Route path="assignations" element={<AgentIndexDemande />} /> {/* Can be same component handling query params */}
                        <Route path="" element={<Navigate to="dashboard" replace />} />
                    </Route>

                    {/* Citoyen Routes */}
                    <Route path="/citoyen" element={
                        <ProtectedRoute allowedRoles={['citoyen']}>
                            <CitizenLayout />
                        </ProtectedRoute>
                    }>
                        <Route path="dashboard" element={<CitoyenDashboard />} />
                        <Route path="demandes" element={<IndexDemande />} />
                        <Route path="demandes/create" element={<CreateDemande />} />
                        <Route path="demandes/:uuid" element={<ShowDemande />} />
                        <Route path="messages" element={<CitoyenMessages />} />
                        <Route path="notifications" element={<CitoyenNotifications />} />
                        <Route path="settings" element={<CitoyenSettings />} />
                        <Route path="" element={<Navigate to="dashboard" replace />} />
                    </Route>

                    {/* Legacy/Fallback route for generic dashboard login redirect */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            {/* The ProtectedRoute will redirect based on role if no allowedRoles is passed but we handle it manually here just in case */}
                            <RoleBasedRedirect />
                        </ProtectedRoute>
                    } />
                </Routes>
            </div>
        </Router>
    </AuthProvider>
  )
}

const RoleBasedRedirect = () => {
    const { user } = useAuth();
    if (user?.role === 'administrateur') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'agent') return <Navigate to="/agent/dashboard" replace />;
    return <Navigate to="/citoyen/dashboard" replace />;
}

export default App
