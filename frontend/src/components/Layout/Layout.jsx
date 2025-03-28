import { Outlet } from 'react-router-dom';
import UnifiedNavigation from './UnifiedNavigation';
import Footer from './Footer';
import { useState } from 'react';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <UnifiedNavigation />
      <main className="flex-grow pt-16 lg:pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
