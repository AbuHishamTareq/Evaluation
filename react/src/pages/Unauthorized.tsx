
import { ShieldX, Home, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

const Unauthorized = () => {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-cyan-50 via-blue-50 to-brand-cyan-100 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-brand-cyan-300 rounded-full opacity-30 animate-float"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-blue-400 rounded-full opacity-25 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-32 w-20 h-20 bg-brand-cyan-400 rounded-full opacity-25 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-blue-300 rounded-full opacity-20 animate-float" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <Card className="w-full max-w-md relative z-10 border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="p-4 rounded-full bg-gradient-to-br from-brand-cyan-500 to-blue-600 shadow-lg">
              <ShieldX className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-4 mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-cyan-600 to-blue-700 bg-clip-text text-transparent">
              Access Denied
            </h1>
            <div className="space-y-2">
              <p className="text-lg text-gray-700 font-medium">
                401 - Unauthorized
              </p>
              <p className="text-gray-600 leading-relaxed">
                You don't have permission to access this resource. Please check your credentials or contact an administrator.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handleGoHome}
              className="w-full bg-gradient-to-r from-brand-cyan-500 to-blue-600 hover:from-brand-cyan-600 hover:to-blue-700 text-white font-medium py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Button>
            
            <Button 
              onClick={handleGoBack}
              variant="outline"
              className="w-full border-2 border-brand-cyan-400 text-brand-cyan-700 hover:bg-brand-cyan-50 hover:border-brand-cyan-500 font-medium py-3 rounded-lg transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help? Contact support for assistance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Unauthorized;