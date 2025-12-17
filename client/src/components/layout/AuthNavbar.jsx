import { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, User, Settings, LogOut, UserCircle, Menu, Radio } from 'lucide-react';
import { authService } from '../../services/auth';
import { userService } from '../../services/music';
import toast from 'react-hot-toast';
import { MobileMenuContext } from './MainLayout';
import SessionDialog from '../session/SessionDialog';
import { Button } from '../ui/button';

export default function AuthNavbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenu = useContext(MobileMenuContext);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await userService.getProfile();
      if (response.success) {
        setUser(response.user);
      }
    } catch (error) {
      // Silently handle auth errors - user will be redirected by RequireAuth if needed
      if (error.response?.status !== 401) {
        console.error('Failed to fetch user profile:', error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast.success('Logged out successfully');
      navigate('/auth/login');
    } catch (error) {
      toast.error('Failed to logout');
      console.error('Logout error:', error);
    }
  };

  const handleProfileClick = () => {
    setShowDropdown(false);
    navigate('/profile');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className='w-full flex justify-between items-center mb-4 sm:mb-6 md:mb-8 px-2'>
      {/* Left Side: Mobile Menu + Navigation */}
      <div className='flex items-center gap-2 sm:gap-3'>
        {/* Hamburger Menu - Mobile Only */}
        {mobileMenu && (
          <button
            onClick={mobileMenu.toggleMobileMenu}
            className='md:hidden w-10 h-10 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center transition-all shadow-sm border border-gray-200 hover:border-gray-300'
            aria-label="Toggle menu"
          >
            <Menu className='w-5 h-5 text-gray-600' />
          </button>
        )}

        {/* Navigation Arrows */}
        <button
          onClick={() => navigate(-1)}
          className='w-10 h-10 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center transition-all shadow-sm border border-gray-200 hover:border-gray-300'
        >
          <ChevronLeft className='w-5 h-5 text-gray-600' />
        </button>
        <button
          onClick={() => navigate(1)}
          className='w-10 h-10 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center transition-all shadow-sm border border-gray-200 hover:border-gray-300'
        >
          <ChevronRight className='w-5 h-5 text-gray-600' />
        </button>

        {/* Listening Party Button */}
        <SessionDialog
          trigger={
            <Button
              variant="outline"
              className="gap-2 bg-white hover:bg-emerald-50 border-emerald-200 text-emerald-700 hover:text-emerald-800 shadow-sm"
            >
              <Radio className="w-4 h-4" />
              <span className="hidden sm:inline font-semibold">Listening Party</span>
            </Button>
          }
        />
      </div>

      {/* User Menu */}
      <div className='flex items-center gap-3 relative' ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className='flex items-center gap-3 hover:bg-gray-50 rounded-full pl-2 pr-4 py-2 transition-all border border-transparent hover:border-gray-200'
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className='w-9 h-9 rounded-full object-cover ring-2 ring-gray-100'
            />
          ) : (
            <div className='w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-sm'>
              {getInitials(user?.name)}
            </div>
          )}
          <span className='text-sm font-semibold text-gray-900 hidden sm:block'>
            {user?.name || 'User'}
          </span>
        </button>

        {/* Dropdown Menu - Minimal */}
        {showDropdown && (
          <div className='absolute top-12 right-0 w-56 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 border border-gray-200'>
            {/* User Info */}
            <div className='px-4 py-4 border-b border-gray-100'>
              <div className='flex items-center gap-3'>
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className='w-10 h-10 rounded-full object-cover'
                  />
                ) : (
                  <div className='w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-semibold'>
                    {getInitials(user?.name)}
                  </div>
                )}
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-semibold text-gray-900 truncate'>
                    {user?.name || 'User'}
                  </p>
                  <p className='text-xs text-gray-500 truncate'>
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className='py-2'>
              <button
                onClick={handleProfileClick}
                className='w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3'
              >
                <UserCircle className='w-5 h-5 text-gray-400' />
                <span>Profile</span>
              </button>

              <button
                onClick={() => {
                  setShowDropdown(false);
                  navigate('/settings');
                }}
                className='w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3'
              >
                <Settings className='w-5 h-5 text-gray-400' />
                <span>Settings</span>
              </button>

              <div className='border-t border-gray-100 my-2'></div>

              <button
                onClick={handleLogout}
                className='w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3'
              >
                <LogOut className='w-5 h-5' />
                <span>Log out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
