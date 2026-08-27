import { Outlet } from 'react-router-dom';
import UnifiedNavigation from './UnifiedNavigation';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-950">
      <UnifiedNavigation />
      <main className="flex-1 pt-14 lg:pt-16 pb-16 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
