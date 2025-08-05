import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authThunks';
import { toast } from 'react-hot-toast';
import { 
  FaBars, FaTimes, FaUserCircle, FaSignOutAlt, FaSignInAlt, 
  FaUserPlus, FaSearch, FaCompass, FaBookmark, FaChartBar,
  FaBell, FaCog, FaHome, FaPlus, FaEye, FaUserShield
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';

const UnifiedNavigation = ({ variant = 'default' }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  // Add navigation state management
  const [activeSection, setActiveSection] = useState('home');
  const [navigationHistory, setNavigationHistory] = useState([]);

  const updateActiveSection = (section) => {
    setActiveSection(section);
    setNavigationHistory(prev => [...prev, section]);
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  // Determine if we're on a home page (transparent background)
  const isHomePage = location.pathname === '/' || location.pathname === '/about' || location.pathname === '/contact';
  const shouldUseTransparent = isHomePage && !isScrolled;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      shouldUseTransparent
        ? 'bg-transparent'
        : isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' 
          : 'bg-white/80 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          
          {/* Logo and Brand */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 group"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="relative">
              <Logo className="h-10 w-10 lg:h-12 lg:w-12" color={shouldUseTransparent ? "white" : "#1a3a63"} />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
            </div>
            <div className="flex flex-col">
              <span className={`text-xl lg:text-2xl font-bold ${
                shouldUseTransparent 
                  ? 'text-white' 
                  : 'bg-gradient-to-r from-[#1a3a63] to-[#2d5a8a] bg-clip-text text-transparent'
              }`}>
                Cardly
              </span>
              <span className={`text-xs ${shouldUseTransparent ? 'text-gray-300' : 'text-gray-500'} hidden sm:block`}>
                Digital Networking
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <NavLink 
              to="/" 
              className={({ isActive }) => `
                px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2
                ${isActive 
                  ? 'bg-gradient-to-r from-[#1a3a63] to-[#2d5a8a] text-white shadow-lg' 
                  : shouldUseTransparent
                    ? 'text-white hover:text-gray-200 hover:bg-white/10'
                    : 'text-gray-700 hover:text-[#1a3a63] hover:bg-gray-50'
                }
              `}
            >
              <FaHome className="w-4 h-4" />
              <span>Home</span>
            </NavLink>
            
            <NavLink 
              to="/discover" 
              className={({ isActive }) => `
                px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2
                ${isActive 
                  ? 'bg-gradient-to-r from-[#1a3a63] to-[#2d5a8a] text-white shadow-lg' 
                  : shouldUseTransparent
                    ? 'text-white hover:text-gray-200 hover:bg-white/10'
                    : 'text-gray-700 hover:text-[#1a3a63] hover:bg-gray-50'
                }
              `}
            >
              <FaCompass className="w-4 h-4" />
              <span>Discover</span>
            </NavLink>

            {isAuthenticated && (
              <>
                <NavLink 
                  to="/search" 
                  className={({ isActive }) => `
                    px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2
                    ${isActive 
                      ? 'bg-gradient-to-r from-[#1a3a63] to-[#2d5a8a] text-white shadow-lg' 
                      : 'text-gray-700 hover:text-[#1a3a63] hover:bg-gray-50'
                    }
                  `}
                >
                  <FaSearch className="w-4 h-4" />
                  <span>Search</span>
                </NavLink>
                
                <NavLink 
                  to="/cards" 
                  className={({ isActive }) => `
                    px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2
                    ${isActive 
                      ? 'bg-gradient-to-r from-[#1a3a63] to-[#2d5a8a] text-white shadow-lg' 
                      : 'text-gray-700 hover:text-[#1a3a63] hover:bg-gray-50'
                    }
                  `}
                >
                  <span>My Cards</span>
                </NavLink>
                
                <NavLink 
                  to="/cards/add" 
                  className={({ isActive }) => `
                    px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2
                    ${isActive 
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg' 
                      : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                    }
                  `}
                >
                  <FaPlus className="w-4 h-4" />
                  <span>Create</span>
                </NavLink>
                
                <NavLink 
                  to="/library" 
                  className={({ isActive }) => `
                    px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2
                    ${isActive 
                      ? 'bg-gradient-to-r from-[#1a3a63] to-[#2d5a8a] text-white shadow-lg' 
                      : 'text-gray-700 hover:text-[#1a3a63] hover:bg-gray-50'
                    }
                  `}
                >
                  <FaBookmark className="w-4 h-4" />
                  <span>Library</span>
                </NavLink>
              </>
            )}
          </div>

          {/* Right Side - User Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <NavLink 
                  to="/dashboard" 
                  className={({ isActive }) => `
                    px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2
                    ${isActive 
                      ? 'bg-gradient-to-r from-[#1a3a63] to-[#2d5a8a] text-white shadow-lg' 
                      : 'text-gray-700 hover:text-[#1a3a63] hover:bg-gray-50'
                    }
                  `}
                >
                  <FaChartBar className="w-4 h-4" />
                  <span>Dashboard</span>
                </NavLink>

                {/* User Menu */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:text-[#1a3a63] hover:bg-gray-50 transition-all duration-200">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#1a3a63] to-[#2d5a8a] rounded-full flex items-center justify-center">
                      <FaUserCircle className="w-5 h-5 text-white" />
                    </div>
                    <span>{user?.name || user?.username || 'User'}</span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                    <div className="py-2">
                      <NavLink 
                        to="/profile" 
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <FaUserCircle className="w-4 h-4" />
                        <span>Profile</span>
                      </NavLink>
                      <NavLink 
                        to="/access-requests" 
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <FaUserShield className="w-4 h-4" />
                        <span>Access Requests</span>
                      </NavLink>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 w-full text-left"
                      >
                        <FaSignOutAlt className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <NavLink 
                  to="/about" 
                  className={({ isActive }) => `
                    px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-[#1a3a63] to-[#2d5a8a] text-white shadow-lg' 
                      : shouldUseTransparent
                        ? 'text-white hover:text-gray-200 hover:bg-white/10'
                        : 'text-gray-700 hover:text-[#1a3a63] hover:bg-gray-50'
                    }
                  `}
                >
                  <span>About</span>
                </NavLink>
                
                <NavLink 
                  to="/contact" 
                  className={({ isActive }) => `
                    px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-[#1a3a63] to-[#2d5a8a] text-white shadow-lg' 
                      : shouldUseTransparent
                        ? 'text-white hover:text-gray-200 hover:bg-white/10'
                        : 'text-gray-700 hover:text-[#1a3a63] hover:bg-gray-50'
                    }
                  `}
                >
                  <span>Contact</span>
                </NavLink>
                
                <NavLink 
                  to="/login" 
                  className={({ isActive }) => `
                    px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2
                    ${isActive 
                      ? 'bg-gradient-to-r from-[#1a3a63] to-[#2d5a8a] text-white shadow-lg' 
                      : shouldUseTransparent
                        ? 'text-white hover:text-gray-200 hover:bg-white/10'
                        : 'text-gray-700 hover:text-[#1a3a63] hover:bg-gray-50'
                    }
                  `}
                >
                  <FaSignInAlt className="w-4 h-4" />
                  <span>Login</span>
                </NavLink>
                
                <NavLink 
                  to="/register" 
                  className="px-6 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-[#1a3a63] to-[#2d5a8a] text-white hover:from-[#2d5a8a] hover:to-[#1a3a63] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
                >
                  <FaUserPlus className="w-4 h-4" />
                  <span>Get Started</span>
                </NavLink>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-lg transition-all duration-200 ${
                shouldUseTransparent
                  ? 'text-white hover:text-gray-200 hover:bg-white/10'
                  : 'text-gray-600 hover:text-[#1a3a63] hover:bg-gray-50'
              }`}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden"
            >
              <div className="px-4 py-6 space-y-4 bg-white/95 backdrop-blur-md border-t border-gray-100 rounded-b-2xl shadow-xl">
                {/* Mobile Navigation Links */}
                <NavLink 
                  to="/" 
                  className={({ isActive }) => `
                    flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-[#1a3a63] to-[#2d5a8a] text-white shadow-lg' 
                      : 'text-gray-700 hover:text-[#1a3a63] hover:bg-gray-50'
                    }
                  `}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FaHome className="w-5 h-5" />
                  <span>Home</span>
                </NavLink>
                
                <NavLink 
                  to="/discover" 
                  className={({ isActive }) => `
                    flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-[#1a3a63] to-[#2d5a8a] text-white shadow-lg' 
                      : 'text-gray-700 hover:text-[#1a3a63] hover:bg-gray-50'
                    }
                  `}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FaCompass className="w-5 h-5" />
                  <span>Discover</span>
                </NavLink>

                {isAuthenticated ? (
                  <>
                    <NavLink 
                      to="/search" 
                      className={({ isActive }) => `
                        flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200
                        ${isActive 
                          ? 'bg-gradient-to-r from-[#1a3a63] to-[#2d5a8a] text-white shadow-lg' 
                          : 'text-gray-700 hover:text-[#1a3a63] hover:bg-gray-50'
                        }
                      `}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FaSearch className="w-5 h-5" />
                      <span>Search</span>
                    </NavLink>
                    
                    <NavLink 
                      to="/cards" 
                      className={({ isActive }) => `
                        flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200
                        ${isActive 
                          ? 'bg-gradient-to-r from-[#1a3a63] to-[#2d5a8a] text-white shadow-lg' 
                          : 'text-gray-700 hover:text-[#1a3a63] hover:bg-gray-50'
                        }
                      `}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span>My Cards</span>
                    </NavLink>
                    
                    <NavLink 
                      to="/cards/add" 
                      className={({ isActive }) => `
                        flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200
                        ${isActive 
                          ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg' 
                          : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                        }
                      `}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FaPlus className="w-5 h-5" />
                      <span>Create Card</span>
                    </NavLink>
                    
                    <NavLink 
                      to="/library" 
                      className={({ isActive }) => `
                        flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200
                        ${isActive 
                          ? 'bg-gradient-to-r from-[#1a3a63] to-[#2d5a8a] text-white shadow-lg' 
                          : 'text-gray-700 hover:text-[#1a3a63] hover:bg-gray-50'
                        }
                      `}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FaBookmark className="w-5 h-5" />
                      <span>Library</span>
                    </NavLink>
                    
                    <NavLink 
                      to="/dashboard" 
                      className={({ isActive }) => `
                        flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200
                        ${isActive 
                          ? 'bg-gradient-to-r from-[#1a3a63] to-[#2d5a8a] text-white shadow-lg' 
                          : 'text-gray-700 hover:text-[#1a3a63] hover:bg-gray-50'
                        }
                      `}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FaChartBar className="w-5 h-5" />
                      <span>Dashboard</span>
                    </NavLink>
                    
                    <NavLink 
                      to="/profile" 
                      className={({ isActive }) => `
                        flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200
                        ${isActive 
                          ? 'bg-gradient-to-r from-[#1a3a63] to-[#2d5a8a] text-white shadow-lg' 
                          : 'text-gray-700 hover:text-[#1a3a63] hover:bg-gray-50'
                        }
                      `}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FaUserCircle className="w-5 h-5" />
                      <span>Profile</span>
                    </NavLink>
                    
                    <NavLink 
                      to="/access-requests" 
                      className={({ isActive }) => `
                        flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200
                        ${isActive 
                          ? 'bg-gradient-to-r from-[#1a3a63] to-[#2d5a8a] text-white shadow-lg' 
                          : 'text-gray-700 hover:text-[#1a3a63] hover:bg-gray-50'
                        }
                      `}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FaUserShield className="w-5 h-5" />
                      <span>Access Requests</span>
                    </NavLink>
                    
                    <button 
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 transition-all duration-200 w-full text-left"
                    >
                      <FaSignOutAlt className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink 
                      to="/about" 
                      className={({ isActive }) => `
                        flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200
                        ${isActive 
                          ? 'bg-gradient-to-r from-[#1a3a63] to-[#2d5a8a] text-white shadow-lg' 
                          : 'text-gray-700 hover:text-[#1a3a63] hover:bg-gray-50'
                        }
                      `}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span>About</span>
                    </NavLink>
                    
                    <NavLink 
                      to="/contact" 
                      className={({ isActive }) => `
                        flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200
                        ${isActive 
                          ? 'bg-gradient-to-r from-[#1a3a63] to-[#2d5a8a] text-white shadow-lg' 
                          : 'text-gray-700 hover:text-[#1a3a63] hover:bg-gray-50'
                        }
                      `}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span>Contact</span>
                    </NavLink>
                    
                    <NavLink 
                      to="/login" 
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-[#1a3a63] hover:bg-gray-50 transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FaSignInAlt className="w-5 h-5" />
                      <span>Login</span>
                    </NavLink>
                    
                    <NavLink 
                      to="/register" 
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium bg-gradient-to-r from-[#1a3a63] to-[#2d5a8a] text-white hover:from-[#2d5a8a] hover:to-[#1a3a63] transition-all duration-200 shadow-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FaUserPlus className="w-5 h-5" />
                      <span>Get Started</span>
                    </NavLink>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default UnifiedNavigation; 