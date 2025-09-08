import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useLanguage } from '../hooks/useLanguage';

const ContactSection = () => {
  const { t } = useLanguage()
  return (
    <section id="contact" className="py-20 bg-gradient-to-b from-health-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-health-800 mb-6">
            { t('contact.title') }
          </h2>
          <p className="text-xl text-health-600 max-w-3xl mx-auto">
            { t('contact.description') }
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Information */}
          <div className="animate-slide-in-up">
            <h3 className="text-2xl font-bold text-health-800 mb-8">{ t('contact.info') }</h3>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-health-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                  <Mail className="w-6 h-6 text-health-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-health-800 mb-1">{ t('contact.email') }</h4>
                  <p className="text-health-600">contact@healthcluster.com</p>
                  <p className="text-health-600">partnerships@healthcluster.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-health-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                  <Phone className="w-6 h-6 text-health-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-health-800 mb-1">{ t('contact.phone') }</h4>
                  <p className="text-health-600">+1 (555) 123-4567</p>
                  <p className="text-health-600">+1 (555) 987-6543</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-health-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                  <MapPin className="w-6 h-6 text-health-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-health-800 mb-1">{ t('contact.address') }</h4>
                  <p className="text-health-600">123 Healthcare Drive</p>
                  <p className="text-health-600">Medical District, MD 12345</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-health-600 to-health-700 rounded-2xl text-white">
              <h4 className="text-lg font-semibold mb-2">{ t('contact.officeHours') }</h4>
              <p className="text-health-100">{ t('contact.officeHoursDesc') }</p>
              <p className="text-health-100">{ t('contact.emergencySupport') }</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-health-200">
              <h3 className="text-2xl font-bold text-health-800 mb-6">{ t('contact.sendMessage') }</h3>
              
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-health-700 mb-2">
                      { t('contact.firstName') }
                    </label>
                    <Input placeholder={ t('contact.firstNamePlaceholder') } className="border-health-200 focus:border-health-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-health-700 mb-2">
                      { t('contact.lastName') }
                    </label>
                    <Input placeholder={ t('contact.lastNamePlaceholder') } className="border-health-200 focus:border-health-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-health-700 mb-2">
                    { t('contact.email') }
                  </label>
                  <Input type="email" placeholder={ t('contact.emailPlaceholder') } className="border-health-200 focus:border-health-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-health-700 mb-2">
                    { t('contact.subject') }
                  </label>
                  <Input placeholder={ t('contact.subjectPlaceholder') } className="border-health-200 focus:border-health-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-health-700 mb-2">
                    { t('contact.message') }
                  </label>
                  <Textarea 
                    placeholder={ t('contact.messagePlaceholder') }
                    rows={5}
                    className="border-health-200 focus:border-health-500"
                  />
                </div>

                <Button className="w-full bg-health-600 hover:bg-health-700 text-white group">
                  { t('contact.messageBtn') }
                  <Send className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;