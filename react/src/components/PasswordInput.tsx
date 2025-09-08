import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useLanguage } from '../hooks/useLanguage';
import type { PasswordInputProps } from '../types/types';

const PasswordInput = ({
  value,
  onChange,
  placeholder = "Password",
  className,
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const { language } = useLanguage();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const iconPosition = language === 'ar' ? 'left-0' : 'right-0';
  const inputPadding = language === 'ar' ? 'pl-12' : 'pr-12';

  return (
    <div className="relative">
      <Input
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`transition-all duration-300 focus:scale-[1.02] ${inputPadding} ${className}`}
        required
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={`absolute top-0 h-full px-3 py-2 hover:bg-transparent ${iconPosition}`}
        onClick={togglePasswordVisibility}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
        ) : (
          <Eye className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
        )}
      </Button>
    </div>
  );
};

export default PasswordInput;