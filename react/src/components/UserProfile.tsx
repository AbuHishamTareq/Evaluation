import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Button } from "../components/ui/button";
import { User, Settings, LogOut, Bell, HelpCircle } from "lucide-react";
import { useApp } from "../hooks/useApp";
import api from "../axios";
import { useToast } from "../hooks/use-toast";
import { useLanguage } from "../hooks/useLanguage";

export function UserProfile() {
  const { user, setUser } = useApp();
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const handleProfileClick = () => {
    console.log("Profile clicked");
  };

  const handleSettingsClick = () => {
    console.log("Settings clicked");
  };

  const handleNotificationsClick = () => {
    console.log("Notifications clicked");
  };

  const handleHelpClick = () => {
    console.log("Help clicked");
  };

  const handleLogoutClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    const response = await api.post('/api/logout', {lang: language});

    setUser(null);

    toast({
      title: t("logout.title"),
      description: response.data?.message,
      backgroundColor: "bg-green-600",
      color: "text-white"
    });
  };

  const getInitialsFromFullName = (fullName?: string): string => {
    if (!fullName) return "??";
    const names = fullName.trim().split(" ").filter(Boolean);
    const first = names[0]?.[0] || "";
    const last = names[names.length - 1]?.[0] || "";
    return (first + last).toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-blue-100/50 transition-colors">
          <Avatar className="h-9 w-9 ring-2 ring-blue-200 ring-offset-2 hover:ring-blue-300 transition-all">
            <AvatarImage src="/placeholder.svg" alt="User Avatar" />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-medium">
              {getInitialsFromFullName(user?.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white/95 backdrop-blur-sm border border-blue-100 shadow-lg" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-slate-900">{user?.name}</p>
            <p className="text-xs leading-none text-slate-500">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-blue-100" />
        <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer hover:bg-blue-50 transition-colors">
          <User className="mr-2 h-4 w-4 text-blue-600" />
          <span className="text-slate-700">Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSettingsClick} className="cursor-pointer hover:bg-blue-50 transition-colors">
          <Settings className="mr-2 h-4 w-4 text-blue-600" />
          <span className="text-slate-700">Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleNotificationsClick} className="cursor-pointer hover:bg-blue-50 transition-colors">
          <Bell className="mr-2 h-4 w-4 text-blue-600" />
          <span className="text-slate-700">Notifications</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleHelpClick} className="cursor-pointer hover:bg-blue-50 transition-colors">
          <HelpCircle className="mr-2 h-4 w-4 text-blue-600" />
          <span className="text-slate-700">Help & Support</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-blue-100" />
        <DropdownMenuItem onClick={(e) => handleLogoutClick(e)} className="cursor-pointer hover:bg-red-50 transition-colors text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}