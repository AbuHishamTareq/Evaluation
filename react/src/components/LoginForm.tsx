import React, { useState, type FormEvent } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import PasswordInput from './PasswordInput';
import { Lock, Mail, User } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { NavLink } from 'react-router-dom';
import api from '../axios';
import { useApp } from '../hooks/useApp';
import type { AxiosError } from 'axios';
import { type ErrorResponseData } from '../types/types'

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const { fetchUser } = useApp();
  const iconPosition = language === 'ar' ? 'right-3' : 'left-3';
  const inputPadding = language === 'ar' ? 'pr-10' : 'pl-10';

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // ✅ First: get CSRF cookie from Sanctum
      await api.get("/sanctum/csrf-cookie");

      // ✅ Then: attempt login
      await api.post("/api/login", {
        email,
        password,
        remember: rememberMe,
        lang: language,
      });

      // Fetch user info after login
      await fetchUser();

      toast({
        title: t("login.success"),
        description: `${t("login.welcome")}! ${rememberMe ? t("login.rememberMsg") : ""
          }`,
        backgroundColor: "bg-green-600",
        color: "text-white",
      });
    } catch (err) {
      const error = err as AxiosError<ErrorResponseData>;
      const responseData = error.response?.data;

      toast({
        title: t("login.failed"),
        description: responseData?.error,
        backgroundColor: "bg-red-600",
        color: "text-white",
      });

      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: t('reset.sent'),
        description: t('reset.sentMsg'),
        backgroundColor: "bg-green-600",
        color: "text-white"
      });
      setShowForgotPassword(false);
    }, 1500);
  };

  if (showForgotPassword) {
    return (
      <Card className="w-full max-w-md mx-auto backdrop-blur-lg bg-white/80 border-0 shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
        <CardHeader className="space-y-1 text-center">
          <div className="w-16 h-16 bg-gradient-aqua rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
            {t('reset.title')}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {t('reset.message')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <Mail
                  className={`absolute top-3 h-4 w-4 text-muted-foreground z-10 ${iconPosition}`}
                />
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('login.enterEmail')}
                  className={`${inputPadding} transition-all duration-300 focus:scale-[1.02]`}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-aqua hover:shadow-lg hover:scale-[1.02] transition-all duration-300 font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('reset.sending')}...
                </div>
              ) : (
                t('reset.link')
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-sm text-muted-foreground hover:text-white transition-colors"
              onClick={() => setShowForgotPassword(false)}
            >
              {t('reset.back')}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto backdrop-blur-lg bg-white/80 border-0 shadow-2xl animate-in slide-in-from-bottom-4 duration-500" >
      <CardHeader className="space-y-1 text-center">
        <div className="w-16 h-16 bg-gradient-aqua rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
          <User className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
          {t('login.welcome')}
        </CardTitle>
        <CardDescription className="text-gray-600">
          {t('login.message')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <div className="relative">
              <Mail
                className={`absolute top-3 h-4 w-4 text-muted-foreground z-10 ${iconPosition}`}
              />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('login.enterEmail')}
                className={`${inputPadding} transition-all duration-300 focus:scale-[1.02]`}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Lock
                className={`absolute top-3 h-4 w-4 text-muted-foreground z-10 ${iconPosition}`}
              />
              <PasswordInput
                value={password}
                onChange={setPassword}
                placeholder={t('login.password')}
                className={inputPadding}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary ml-2"
              />
              <Label
                htmlFor="remember"
                className="text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors"
              >
                {t('login.remember')}
              </Label>
            </div>
            <NavLink
              type="button"
              to=''
              className="text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors"
              onClick={() => setShowForgotPassword(true)}
            >
              {t('login.forget')}
            </NavLink>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-aqua hover:shadow-lg hover:scale-[1.02] transition-all duration-300 font-semibold text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t('nav.login')}...
              </div>
            ) : (
              t('nav.login')
            )}
          </Button>
        </form>
      </CardContent>
    </Card >
  );
};

export default LoginForm;