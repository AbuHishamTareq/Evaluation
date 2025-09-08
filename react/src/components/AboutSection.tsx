import { useLanguage } from '../hooks/useLanguage';
import { CheckCircle, Target, Eye, Heart } from 'lucide-react';

const AboutSection = () => {
  const { t } = useLanguage()
  const features = [
    t('about.feature1'),
    t('about.feature2'),
    t('about.feature3'),
    t('about.feature4'),
    t('about.feature5'),
    t('about.feature6')
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="animate-slide-in-up">
            <h2 className="text-4xl lg:text-5xl font-bold text-health-800 mb-6">
              { t('about.title') }
            </h2>
            <p className="text-lg text-health-600 mb-8 leading-relaxed">
              { t('about.description') }
            </p>
            
            <div className="grid gap-4 mb-8">
              {features.map((feature, index) => (
                <div 
                  key={feature}
                  className="flex items-center space-x-3 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CheckCircle className="w-5 h-5 text-health-500 flex-shrink-0 ml-2" />
                  <span className="text-health-700">{feature}</span>
                </div>
              ))}
            </div>

            <button className="bg-health-600 hover:bg-health-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300">
              { t('about.learnMoreAboutUs') }
            </button>
          </div>

          {/* Values Cards */}
          <div className="grid gap-6">
            <div className="bg-gradient-to-r from-health-500 to-health-600 rounded-2xl p-6 text-white animate-float">
              <Target className="w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold mb-2">{ t('about.mission') }</h3>
              <p className="text-health-100">
                { t('about.missionDesc') }
              </p>
            </div>
            
            <div className="bg-white border-2 border-health-200 rounded-2xl p-6 animate-float" style={{ animationDelay: '1s' }}>
              <Eye className="w-8 h-8 text-health-600 mb-4" />
              <h3 className="text-xl font-bold text-health-800 mb-2">{ t('about.vision') }</h3>
              <p className="text-health-600">
                { t('about.visionDesc') }
              </p>
            </div>
            
            <div className="bg-health-100 rounded-2xl p-6 animate-float" style={{ animationDelay: '2s' }}>
              <Heart className="w-8 h-8 text-health-600 mb-4" />
              <h3 className="text-xl font-bold text-health-800 mb-2">{ t('about.values') }</h3>
              <p className="text-health-600">
                { t('about.valuesDesc') }
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;