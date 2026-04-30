import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

type Section = 'home' | 'products' | 'contact';

function App() {
  const { user, loading } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [scrollTo, setScrollTo] = useState<Section | null>(null);

  const handleNavigate = (section: Section) => {
    setActiveSection(section);
    setScrollTo(section);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-theme flex items-center justify-center">
        <div className="text-body">Loading…</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Admin routes */}
        <Route
          path="/admin"
          element={user ? <AdminDashboard /> : <AdminLogin />}
        />
        <Route
          path="/admin/login"
          element={user ? <Navigate to="/admin" /> : <AdminLogin />}
        />

        {/* Consumer routes */}
        <Route
          path="/*"
          element={
            <div className="flex flex-col min-h-screen bg-theme">
              <Header activeSection={activeSection} onNavigate={handleNavigate} />
              <main className="flex-1">
                <Home
                  scrollTo={scrollTo}
                  onScrolled={() => setScrollTo(null)}
                />
              </main>
              <Footer />
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
