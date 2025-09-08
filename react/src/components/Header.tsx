import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage'
import LanguageSwitcher from '../components/LanguageSwitcher';
import { NavLink } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, language } = useLanguage();

  const navItems = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.services'), to: '#services' },
    { label: t('nav.about'), to: '#about' },
    { label: t('nav.contact'), to: '#contact' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-health-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className='flex items-center space-x-3'>
            <NavLink to={'/'}>
              {
                language === 'ar' ?
                  (
                    <img
                      src="/images/logo-left.png"
                      alt="Health Cluster Logo"
                      className="w-full h-20 animate-pulse-slow"
                    />
                  ) : (
                    <img
                      src="/images/logo-right.png"
                      alt="Health Cluster Logo"
                      className="w-full h-20 animate-pulse-slow"
                    />
                  )
              }
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <nav className={`hidden md:flex items-center ${language === 'ar' ? 'space-x-reverse space-x-8' : 'space-x-8'}`}>
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className="text-health-700 hover:text-health-500 transition-colors duration-300 font-medium"
              >
                {item.label}
              </NavLink>
            ))}
            <LanguageSwitcher />
            <NavLink
              to="/login"
              className="bg-health-600 hover:bg-health-700 text-white w-fit px-4 py-2 rounded-lg inline-block text-center"
            >
              {t('nav.login')}
            </NavLink>
            <NavLink
              to="/survey"
              className="bg-health-600 hover:bg-health-700 text-white w-fit px-4 py-2 rounded-lg inline-block text-center"
            >
              {t('nav.getStarted')}
            </NavLink>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-health-700" />
            ) : (
              <Menu className="w-6 h-6 text-health-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-health-200">
            <div className={`flex flex-col space-y-4 pt-4 ${language === 'ar' ? 'items-end' : 'items-start'}`}>
              {navItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className="text-health-700 hover:text-health-500 transition-colors duration-300 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="py-2">
                <LanguageSwitcher />
              </div>
              <NavLink
                to="/login"
                className="bg-health-600 hover:bg-health-700 text-white w-fit px-4 py-2 rounded-lg inline-block text-center"
              >
                {t('nav.login')}
              </NavLink>
              <NavLink
                to="/survey"
                className="bg-health-600 hover:bg-health-700 text-white w-fit px-4 py-2 rounded-lg inline-block text-center"
              >
                {t('nav.getStarted')}
              </NavLink>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;