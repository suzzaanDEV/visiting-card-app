import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaGithub, 
  FaHeart, FaArrowUp, FaEnvelope, FaPhone, FaMapMarkerAlt 
} from 'react-icons/fa';
import Logo from './Logo';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gradient-to-br from-[#1a3a63] via-[#2d5a8a] to-[#1a3a63] text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <Logo className="h-10 w-10" color="white" />
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  Cardly
                </h3>
                <p className="text-sm text-gray-300">Digital Networking</p>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed mb-6">
              Revolutionizing the way professionals connect and share their information. 
              Create, share, and manage your digital business cards with ease.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://github.com/suzzaanDEV" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/20 transition-all duration-200 group"
                aria-label="GitHub"
              >
                <FaGithub className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/20 transition-all duration-200 group"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/20 transition-all duration-200 group"
                aria-label="Twitter"
              >
                <FaTwitter className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/about" 
                  className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2 group"
                >
                  <span className="w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/discover" 
                  className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2 group"
                >
                  <span className="w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  <span>Discover Cards</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/cards" 
                  className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2 group"
                >
                  <span className="w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  <span>My Cards</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/library" 
                  className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2 group"
                >
                  <span className="w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  <span>Library</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/contact" 
                  className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2 group"
                >
                  <span className="w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  <span>Contact Us</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/help" 
                  className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2 group"
                >
                  <span className="w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  <span>Help Center</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy" 
                  className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2 group"
                >
                  <span className="w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2 group"
                >
                  <span className="w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  <span>Terms of Service</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Get in Touch</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <FaEnvelope className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm text-gray-300">Email</p>
                  <a 
                    href="mailto:sznghimire61@gmail.com" 
                    className="text-white hover:text-gray-200 transition-colors duration-200"
                  >
                    sznghimire61@gmail.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <FaGithub className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm text-gray-300">GitHub</p>
                  <a 
                    href="https://github.com/suzzaanDEV" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white hover:text-gray-200 transition-colors duration-200"
                  >
                    @suzzaanDEV
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-sm text-gray-300">
                              <span>&copy; {currentYear} Cardly. All rights reserved.</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Made with</span>
              <FaHeart className="w-4 h-4 text-red-400" />
              <span className="hidden sm:inline">by Suzan Ghimire</span>
            </div>
            
            <button
              onClick={scrollToTop}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl text-sm font-medium text-white hover:bg-white/20 transition-all duration-200 group"
              aria-label="Scroll to top"
            >
              <FaArrowUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform duration-200" />
              <span>Back to Top</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;