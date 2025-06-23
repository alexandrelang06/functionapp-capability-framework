import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, Home, Plus, ClipboardList, ShieldAlert, Settings, HelpCircle, LogOut } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useAuth } from '../contexts/AuthContext';
import { AdminLogin } from './AdminLogin';

export function Navigation() {
  const { isAdmin, isSuperAdmin, setRole } = useUser();
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  
  const handleAdminLogin = (role: 'admin' | 'superadmin') => {
    setShowAdminLogin(false);
    setRole(role);
    navigate('/admin');
  };
  
  const handleLogout = async () => {
    try {
      await signOut();
      window.location.reload(); // Reload the page to trigger auto sign-in
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  return (
    <nav className="bg-gradient-to-r from-primary to-secondary text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-4">
            <BarChart3 className="h-10 w-10 text-white" />
            <span className="font-bree text-xl">IT Capability Framework</span>
          </Link>
          
          <div className="flex items-center space-x-6">
            <NavLink to="/" icon={<Home className="h-5 w-5 text-white" />} text="Home" active={location.pathname === '/'} />
            <NavLink to="/new-assessment" icon={<Plus className="h-5 w-5 text-white" />} text="New Assessment" active={location.pathname === '/new-assessment'} />
            <NavLink to="/assessments" icon={<ClipboardList className="h-5 w-5 text-white" />} text="Assessments" active={location.pathname.startsWith('/assessments')} />
            <NavLink to="/faq" icon={<HelpCircle className="h-5 w-5 text-white" />} text="FAQ" active={location.pathname === '/faq'} />
            {(isAdmin || isSuperAdmin) && (
              <>
                <NavLink 
                  to="/framework" 
                  icon={<Settings className="h-5 w-5 text-white" />} 
                  text="Framework Management" 
                  active={location.pathname === '/framework'} 
                />
                <Link to="/admin" className="flex items-center space-x-2 hover:text-gold transition-colors">
                  <ShieldAlert className="h-5 w-5" />
                  <span>Admin Panel</span>
                </Link>
              </>
            )}
            {!isSuperAdmin ? (
              <button 
                onClick={() => setShowAdminLogin(true)}
                className="flex items-center space-x-2 hover:text-gold transition-colors"
              >
                <ShieldAlert className="h-5 w-5" />
                <span>Admin</span>
              </button>
            ) : (
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 hover:text-gold transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Déconnexion</span>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {showAdminLogin && (
        <AdminLogin 
          onLogin={handleAdminLogin} 
          onClose={() => setShowAdminLogin(false)} 
        />
      )}
    </nav>
  );
}

function NavLink({ to, icon, text, active }: { to: string; icon: React.ReactNode; text: string; active: boolean }) {
  return (
    <Link to={to} className={`flex items-center space-x-2 transition-colors ${active ? 'text-white/80' : 'hover:text-white/80'}`}>
      {icon}
      <span>{text}</span>
    </Link>
  );
}