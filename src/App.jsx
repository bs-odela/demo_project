import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import LearnerDashboard from './pages/LearnerDashboard';
import DeveloperDashboard from './pages/DeveloperDashboard';
import CoursePlayer from './pages/CoursePlayer';
import CourseConsumptionPlayer from './pages/CourseConsumptionPlayer';
import { authService } from './lib/auth';

const ProtectedRoute = ({ children, allowedRole }) => {
  const user = authService.getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/" replace />;
  return children;
};

function NavigationHeader() {
  const location = useLocation();
  const [user, setUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    setUser(authService.getCurrentUser());
  }, [location.pathname]);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <header className="p-4 bg-white shadow-sm flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <img src="/logo.jpg" alt="Guru Chela Logo" className="h-10 w-10 sm:h-12 sm:w-12 object-cover object-center rounded-full flex-shrink-0 border-2 border-primary-100 shadow-sm" />
        <Link to={user ? (user.role === 'Developer' ? '/developer' : '/learner') : "/"} className="text-lg sm:text-xl font-bold text-primary-600 hidden sm:block">Padhai with Guru Chela</Link>
      </div>
      <nav className="flex gap-4 items-center">
        {user ? (
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-sm text-gray-600 font-medium hidden md:block">Hi, {user.username}</span>
            <Link to={user.role === 'Developer' ? '/developer' : '/learner'} className="text-sm sm:text-base hover:text-primary-600 transition-colors font-medium">Dashboard</Link>
            <button onClick={handleLogout} className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-xs sm:text-sm">Logout</button>
          </div>
        ) : (
          <>
            <Link to="/" className="hover:text-primary-600 transition-colors font-medium text-sm sm:text-base">Home</Link>
            <Link to="/login" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm">Login</Link>
          </>
        )}
      </nav>
    </header>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
        <NavigationHeader />

        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/course/:courseId" element={
              <ProtectedRoute allowedRole="Learner">
                <CoursePlayer />
              </ProtectedRoute>
            } />
            <Route path="/course/:courseId/learn" element={
              <ProtectedRoute allowedRole="Learner">
                <CourseConsumptionPlayer />
              </ProtectedRoute>
            } />
            <Route path="/learner/*" element={
              <ProtectedRoute allowedRole="Learner">
                <LearnerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/developer/*" element={
              <ProtectedRoute allowedRole="Developer">
                <DeveloperDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
