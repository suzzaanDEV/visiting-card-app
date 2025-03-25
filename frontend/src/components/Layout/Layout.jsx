import { Outlet } from 'react-router-dom';
import UnifiedNavigation from './UnifiedNavigation';
import Footer from './Footer';

const Layout = () => {
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
