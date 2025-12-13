import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from './pages/Dashboard/Dashboard';
import Stats from './pages/Stats/Stats';
import AddSong from './pages/AddSong/AddSong';
import ListSong from './pages/ListSong/ListSong';
import AddAlbum from './pages/AddAlbum/AddAlbum';
import ListAlbum from './pages/ListAlbum/ListAlbum';
import UserManagement from './pages/UserManagement/UserManagement';
import AdminLogin from './pages/AdminLogin/AdminLogin';
import Sidebar from './components/Sidebar/Sidebar';
import Navbar from './components/Navbar/Navbar';

export const url = 'http://localhost:4000';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('adminAuth') === 'true';
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const authStatus = localStorage.getItem('adminAuth') === 'true';
    setIsAuthenticated(authStatus);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <>
      <ToastContainer />
      <Routes>
        {/* Login Route */}
        <Route path="/login" element={<AdminLogin />} />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className='flex items-start min-h-screen'>
                <Sidebar />
                <div className='flex-1 h-screen overflow-y-scroll bg-[#F3FFF7]'>
                  <Navbar onLogout={handleLogout} />
                  <div className="pt-8 pl-5 sm:pt-12 sm:pl-12">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/stats" element={<Stats />} />
                      <Route path="/add-song" element={<AddSong />} />
                      <Route path="/list-songs" element={<ListSong />} />
                      <Route path="/add-album" element={<AddAlbum />} />
                      <Route path="/list-albums" element={<ListAlbum />} />
                      <Route path="/users" element={<UserManagement />} />
                    </Routes>
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;
