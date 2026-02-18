
import React, { useEffect } from 'react';
import { ViewMode } from './types';
import { Layout } from './components/Layout';
import { AuthScreens } from './components/AuthScreens';
import { SaaSScreens } from './components/SaaSScreens';
import { PublicBooking } from './components/PublicBooking';
import { DesignSystemShowcase } from './components/DesignSystemShowcase';
import { SuperAdminPanel } from './components/SuperAdminPanel';
import { useAppContext } from './context/AppContext';
import { supabase } from './utils/supabaseClient';


const App: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    appointments,
    services,
    businessSettings,
    isDarkMode,
    toggleTheme,
    currentTheme,
    changeTheme,
    addAppointment
  } = useAppContext();

  // Check session, URL params, and listen for auth changes
  useEffect(() => {
    // Check URL params FIRST for public/admin access
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    if (viewParam === 'public') {
      setCurrentView(ViewMode.PUBLIC_SERVICE);
      return; // Don't check session for public views
    } else if (viewParam === 'admin') {
      setCurrentView(ViewMode.ADMIN_LOGIN);
      return;
    }

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        if (currentView === ViewMode.LOGIN || currentView === ViewMode.SIGNUP) {
          setCurrentView(ViewMode.DASHBOARD);
        }
      } else {
        // Only force login if we are in a protected area
        const publicViews = [
          ViewMode.LOGIN,
          ViewMode.SIGNUP,
          ViewMode.ADMIN_LOGIN,
          ViewMode.VERIFY_EMAIL,
          ViewMode.ONBOARDING_1,
          ViewMode.ONBOARDING_2,
          ViewMode.ONBOARDING_3
        ];

        const isPublicView = publicViews.includes(currentView) || currentView.startsWith('PUBLIC');

        if (!isPublicView) {
          setCurrentView(ViewMode.LOGIN);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        if (currentView === ViewMode.LOGIN || currentView === ViewMode.SIGNUP) {
          setCurrentView(ViewMode.DASHBOARD);
        }
      } else {
        // Don't redirect if we're on a public/auth view
        const safeViews = [
          ViewMode.LOGIN,
          ViewMode.SIGNUP,
          ViewMode.VERIFY_EMAIL,
          ViewMode.ADMIN_LOGIN,
          ViewMode.ONBOARDING_1,
          ViewMode.ONBOARDING_2,
          ViewMode.ONBOARDING_3
        ];
        const isSafeView = safeViews.includes(currentView) || currentView.startsWith('PUBLIC');
        if (!isSafeView) {
          setCurrentView(ViewMode.LOGIN);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [currentView, setCurrentView]);


  // -- RENDER LOGIC --

  // 1. DESIGN SYSTEM (Dev only)
  if (currentView === ViewMode.DESIGN_SYSTEM) {
    return (
      <div className="p-8 bg-brand-surface min-h-screen transition-colors duration-300">
        <div className="fixed top-4 right-4 flex gap-2 z-50">
          <button onClick={toggleTheme} className="bg-brand-text text-brand-bg px-4 py-2 rounded-full shadow-lg">
            {isDarkMode ? 'Light' : 'Dark'}
          </button>
          <button onClick={() => changeTheme(currentTheme === 'default' ? 'aurora' : 'default')} className="bg-brand-primary text-white px-4 py-2 rounded-full shadow-lg">
            Theme: {currentTheme}
          </button>
        </div>
        <DesignSystemShowcase />
      </div>
    );
  }

  // 2. ADMIN PANEL (God Mode)
  if (currentView === ViewMode.ADMIN_LOGIN || currentView === ViewMode.ADMIN_DASHBOARD) {
    return (
      <SuperAdminPanel
        view={currentView}
        onNavigate={setCurrentView}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />
    );
  }

  // 3. AUTH & ONBOARDING (No Sidebar)
  if (
    currentView === ViewMode.LOGIN ||
    currentView === ViewMode.SIGNUP ||
    currentView === ViewMode.VERIFY_EMAIL ||
    currentView.startsWith('ONBOARDING')
  ) {
    return <AuthScreens view={currentView} onNavigate={setCurrentView} />;
  }

  // 4. PUBLIC BOOKING FLOW (No Sidebar, Distinct Layout, Shared Data)
  if (currentView.startsWith('PUBLIC')) {
    return (
      <PublicBooking
        view={currentView}
        onNavigate={setCurrentView}
        services={services}
        appointments={appointments}
        businessSettings={businessSettings}
        onBookingComplete={addAppointment}
      />
    );
  }

  // 5. SAAS INTERNAL APP (With Sidebar, Shared Data)
  return (
    <Layout
      currentView={currentView}
      onNavigate={setCurrentView}
      isDarkMode={isDarkMode}
      toggleTheme={toggleTheme}
    >
      <SaaSScreens
        view={currentView}
        onNavigate={setCurrentView}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        currentTheme={currentTheme}
        changeTheme={changeTheme}
      />
    </Layout>
  );
};


export default App;
