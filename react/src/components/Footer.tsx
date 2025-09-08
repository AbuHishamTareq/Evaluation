import { useLanguage } from '../hooks/useLanguage';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-health-800 text-white py-14">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <img
                src="/images/colored-logo.png"
                alt="Health Cluster Logo"
                className="w-16 h-16 ml-2"
              />
              <span className="text-xl font-bold">{ t('ahsa.title') }</span>
            </div>
            <p className="text-health-200 leading-relaxed mb-4">
              {t('footer.tagline')}
            </p>
            <div className="flex items-center space-x-2 text-health-300">
              <Heart className="w-4 h-4 ml-2" />
              <span className="text-sm">{t('footer.madeWithCare')}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">{t('footer.quickLinks')}</h3>
            <ul className="space-y-3">
              <li><a href="#home" className="text-health-200 hover:text-white transition-colors">{t('nav.home')}</a></li>
              <li><a href="#services" className="text-health-200 hover:text-white transition-colors">{t('nav.services')}</a></li>
              <li><a href="#about" className="text-health-200 hover:text-white transition-colors">{t('nav.about')}</a></li>
              <li><a href="#contact" className="text-health-200 hover:text-white transition-colors">{t('nav.contact')}</a></li>
              <li><a href="#policy" className="text-health-200 hover:text-white transition-colors">{t('nav.privacy')}</a></li>
              <li><a href="#terms" className="text-health-200 hover:text-white transition-colors">{t('nav.terms')}</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6">{t('footer.ourServices')}</h3>
            <ul className="space-y-3">
              <li><span className="text-health-200">{t('services.healthMonitoring')}</span></li>
              <li><span className="text-health-200">{t('services.aiDiagnostics')}</span></li>
              <li><span className="text-health-200">{t('services.dataSecurity')}</span></li>
              <li><span className="text-health-200">{t('services.rapidResponse')}</span></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">{t('footer.contactUs')}</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-health-400 ml-2" />
                <span className="text-health-200 text-sm">contact@healthcluster.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-health-400 ml-2" />
                <span className="text-health-200 text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-health-400 ml-2" />
                <span className="text-health-200 text-sm">123 Healthcare Drive, MD 12345</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-health-700 mt-12 pt-8 text-center">
          <p className="text-health-300">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;