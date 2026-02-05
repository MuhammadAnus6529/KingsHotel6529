import React, { useState, useMemo, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, useLocation } from 'react-router-dom';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import SplashScreen from './components/SplashScreen';

// Pages
import Home from './pages/Home';
import RoomDetail from './pages/RoomDetail';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';

// 1. Layout Component to handle Conditional Navbar & Page Padding
const Layout = ({ user, setUser }) => {
  const location = useLocation();
  
  // Hide navbar on auth-specific pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <>
      {!isAuthPage && <Navbar user={user} setUser={setUser} />}
      <div style={{ 
        padding: isAuthPage ? '0' : '0px', // No padding on auth pages for full-screen bg
        width: '100%',
        margin: '0 auto' 
      }}>
        <Outlet /> 
      </div>
    </>
  );
};

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState(null);

  // Sync user from LocalStorage on mount safely
  useEffect(() => {
    try {
      const saved = localStorage.getItem('user');
      if (saved) {
        // Parse safely
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setUser(parsed);
        } else {
          // Clear bad data
          localStorage.removeItem('user');
        }
      }
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      localStorage.removeItem('user'); // Remove corrupted data
      setUser(null);
    }
  }, []);

  // 2. Define Routes with useMemo for performance
  const router = useMemo(() => createBrowserRouter([
    {
      path: "/",
      element: <Layout user={user} setUser={setUser} />,
      children: [
        { path: "/", element: <Home user={user} /> },
        { path: "/room/:id", element: <RoomDetail user={user} /> },
        { path: "/login", element: <Login setUser={setUser} /> },
        { path: "/signup", element: <Signup /> },
        { 
          path: "/my-bookings", 
          element: (
            <ProtectedRoute isAdminRoute={false} user={user}>
              <MyBookings user={user} />
            </ProtectedRoute>
          ) 
        },
        { 
          path: "/admin", 
          element: (
            <ProtectedRoute isAdminRoute={true} user={user}>
              <AdminDashboard user={user} />
            </ProtectedRoute>
          ) 
        },
      ]
    }
  ]), [user]);

  // 3. Conditional Rendering: Splash Screen vs Main App
  return (
    <>
      {showSplash ? (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      ) : (
        <RouterProvider router={router} />
      )}
    </>
  );
}

export default App;
