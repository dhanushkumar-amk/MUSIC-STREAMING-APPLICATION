import React from 'react';
import { LogOut, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Navbar = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('adminAuth');
      toast.success('Logged out successfully');
      navigate('/login');
      if (onLogout) onLogout();
    }
  };

  return (
    <div className='navbar w-full border-b-2 border-gray-800 px-4 sm:px-12 py-3 sm:py-4'>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Menu className="w-6 h-6 sm:hidden text-gray-700" />
          <p className='text-base sm:text-lg font-semibold text-gray-800'>Admin Panel</p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm sm:text-base"
        >
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Navbar;
