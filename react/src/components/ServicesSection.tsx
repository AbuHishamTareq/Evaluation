import { Activity, Brain, Shield, Zap, Users, Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useLanguage } from '../hooks/useLanguage';

const ServicesSection = () => {
  const { t } = useLanguage();

  const services = [
    {
      icon: Activity,
      title: t('services.healthMonitoring'),
      description: t('services.healthMonitoringDesc'),
      color: "text-health-500"
    },
    {
      icon: Brain,
      title: t('services.aiDiagnostics'),
      description: t('services.aiDiagnosticsDesc'),
      color: "text-health-600"
    },
    {
      icon: Shield,
      title: t('services.dataSecurity'),
      description: t('services.dataSecurityDesc'),
      color: "text-health-700"
    },
    {
      icon: Zap,
      title: t('services.rapidResponse'),
      description: t('services.rapidResponseDesc'),
      color: "text-health-500"
    },
    {
      icon: Users,
      title: t('services.teamCollaboration'),
      description: t('services.teamCollaborationDesc'),
      color: "text-health-600"
    },
    {
      icon: Globe,
      title: t('services.globalNetwork'),
      description: t('services.globalNetworkDesc'),
      color: "text-health-700"
    }
  ];

  return (
    <section id="services" className="py-20 bg-gradient-to-b from-white to-health-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-health-800 mb-6">
            { t('services.title') }
          </h2>
          <p className="text-xl text-health-600 max-w-3xl mx-auto">
            { t('services.description') }
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card 
              key={service.title}
              className="group hover:shadow-xl transition-all duration-300 border-health-200 hover:border-health-400 hover:-translate-y-2 animate-slide-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-health-100 rounded-full flex items-center justify-center group-hover:bg-health-200 transition-colors duration-300">
                  <service.icon className={`w-8 h-8 ${service.color}`} />
                </div>
                <CardTitle className="text-xl text-health-800 group-hover:text-health-600 transition-colors duration-300">
                  {service.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-health-600 text-center leading-relaxed">
                  {service.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-health-600 to-health-700 rounded-2xl p-8 text-white animate-fade-in">
            <h3 className="text-2xl font-bold mb-4">{ t('services.readyToJoin') }</h3>
            <p className="text-health-100 mb-6 max-w-2xl mx-auto">
              { t('services.readyToJoinDesc') }
            </p>
            <button className="bg-white text-health-600 px-8 py-3 rounded-lg font-semibold hover:bg-health-50 transition-colors duration-300">
              { t('services.getStartedToday') }
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;