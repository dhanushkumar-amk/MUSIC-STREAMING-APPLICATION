import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import Landing from "./pages/Landing"
import AuthLayout from "./pages/auth/AuthLayout"
import LoginPage from "./pages/auth/LoginPage"
import RegisterPage from "./pages/auth/RegisterPage"
import VerifyOTPPage from "./pages/auth/OTPVerifyPage"
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage"
import ResetPasswordPage from "./pages/auth/ResetPasswordPage"
import LibraryPage from "./pages/LibraryPage"
import SearchPage from "./pages/SearchPage"
import HomePage from "./pages/HomePage"
import AlbumsPage from "./pages/AlbumsPage"
import PlaylistsPage from "./pages/PlaylistsPage"
import ProfilePage from "./pages/ProfilePage"
import RequireAuth from "./components/auth/RequireAuth"
import MainLayout from "./components/layout/MainLayout"
import { PlayerProvider } from "./context/PlayerContext"

const App = () => {
  return (
    <BrowserRouter>
      <PlayerProvider>
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
            <Route path="/" element={<Landing />} />

            {/* Protected Routes */}
            <Route element={
                <RequireAuth>
                    <MainLayout />
                </RequireAuth>
            }>
                <Route path="/home" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/albums" element={<AlbumsPage />} />
                <Route path="/playlists" element={<PlaylistsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/collection" element={<LibraryPage />} />
                <Route path="/collection/tracks" element={<LibraryPage />} />
                <Route path="/collection/active" element={<LibraryPage />} />
                <Route path="/library" element={<LibraryPage />} />
            </Route>

            {/* Auth Routes */}
            <Route path="/auth" element={<AuthLayout />}>
                <Route index element={<Navigate to="/auth/login" replace />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="verify" element={<VerifyOTPPage />} />
                <Route path="forgot-password" element={<ForgotPasswordPage />} />
                <Route path="reset-password" element={<ResetPasswordPage />} />
            </Route>
        </Routes>
      </PlayerProvider>
    </BrowserRouter>
  )
}

export default App
