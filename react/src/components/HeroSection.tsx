import { ArrowRight, Heart, Users, Stethoscope } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useLanguage } from '../hooks/useLanguage';


const HeroSection = () => {
  const { t, language } = useLanguage();

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-health-50 via-white to-health-100">
        <div className="absolute top-20 left-10 w-32 h-32 bg-health-200 rounded-full opacity-30 animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-health-300 rounded-full opacity-40 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-health-200 rounded-full opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="container mx-auto px-4 py-40 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className={`text-center lg:text-${language === 'ar' ? 'right' : 'left'} animate-slide-in-up`}>
            <h1 className="text-5xl lg:text-6xl font-bold text-health-800 mb-6 leading-tight">
              {t('hero.title1')}
              <span className="text-health-600 block">{t('hero.title2')}</span>
            </h1>
            <p className="text-xl text-health-700 mb-8 leading-relaxed">
              {t('hero.description')}
            </p>
            <div className={`flex flex-col sm:flex-row gap-4 justify-center lg:justify-${language === 'ar' ? 'end' : 'start'}`}>
              <Button size="lg" className="bg-health-600 hover:bg-health-700 text-white group">
                {t('hero.joinCluster')}
                <ArrowRight className={`${language === 'ar' ? 'mr-2 rotate-180' : 'ml-2'} w-5 h-5 group-hover:translate-x-1 transition-transform`} />
              </Button>
              <Button size="lg" variant="outline" className="border-health-600 text-health-600 hover:bg-health-50">
                {t('hero.learnMore')}
              </Button>
            </div>
          </div>

          {/* Enhanced Animated Icons */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in hover:scale-105 transform-gpu">
                <Heart className="w-12 h-12 text-health-500 mb-4 transition-all duration-300 hover:scale-110 hover:text-health-600" />
                <h3 className="text-lg font-semibold text-health-800 mb-2">{t('hero.patientCare')}</h3>
                <p className="text-health-600">{t('hero.patientCareDesc')}</p>
              </div>
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in hover:scale-105 transform-gpu" style={{ animationDelay: '0.2s' }}>
                <Users className="w-12 h-12 text-health-500 mb-4 transition-all duration-300 hover:scale-110 hover:text-health-600" />
                <h3 className="text-lg font-semibold text-health-800 mb-2">{t('hero.collaboration')}</h3>
                <p className="text-health-600">{t('hero.collaborationDesc')}</p>
              </div>
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in hover:scale-105 transform-gpu" style={{ animationDelay: '0.4s' }}>
                <Stethoscope className="w-12 h-12 text-health-500 mb-4 transition-all duration-300 hover:scale-110 hover:text-health-600" />
                <h3 className="text-lg font-semibold text-health-800 mb-2">{t('hero.innovation')}</h3>
                <p className="text-health-600">{t('hero.innovationDesc')}</p>
              </div>
              <div className="bg-gradient-to-br from-health-500 to-health-600 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in hover:scale-105 transform-gpu" style={{ animationDelay: '0.6s' }}>
                <div className="text-white">
                  <div className="text-3xl font-bold mb-2 transition-all duration-300 hover:scale-110">500+</div>
                  <div className="text-health-100">{t('hero.partners')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;