import { Globe } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useLanguage } from '../hooks/useLanguage';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-2">
      <Globe className="w-4 h-4 text-health-600 ml-2" />
      <div className="flex rounded-lg border border-health-200 overflow-hidden">
        <Button
          variant={language === 'en' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 text-xs rounded-none ${
            language === 'en' 
              ? 'bg-health-600 text-white' 
              : 'text-health-600 hover:bg-health-50'
          }`}
        >
          EN
        </Button>
        <Button
          variant={language === 'ar' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setLanguage('ar')}
          className={`px-3 py-1 text-xs rounded-none ${
            language === 'ar' 
              ? 'bg-health-600 text-white' 
              : 'text-health-600 hover:bg-health-50'
          }`}
        >
          العربية
        </Button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;