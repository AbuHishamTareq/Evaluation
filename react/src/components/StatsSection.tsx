import { useLanguage } from '../hooks/useLanguage';
import { TrendingUp, Users, Award, MapPin } from 'lucide-react';


const StatsSection = () => {
  const { t } = useLanguage();

  const stats = [
    {
      icon: Users,
      number: "10,000+",
      label: t('stats.professionals'),
      description: t('stats.professionalsDesc')
    },
    {
      icon: MapPin,
      number: "50+",
      label: t('stats.countries'),
      description: t('stats.countriesDesc')
    },
    {
      icon: Award,
      number: "95%",
      label: t('stats.successRate'),
      description: t('stats.successRateDesc')
    },
    {
      icon: TrendingUp,
      number: "24/7",
      label: t('stats.support'),
      description: t('stats.supportDesc')
    }
  ];

  return (
    <section className="py-20 bg-health-600">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={stat.label}
              className="text-center text-white animate-slide-in-up"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl lg:text-5xl font-bold mb-2 animate-pulse-slow">
                {stat.number}
              </div>
              <div className="text-xl font-semibold mb-2 text-health-100">
                {stat.label}
              </div>
              <div className="text-health-200">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;