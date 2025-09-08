import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Clock, User, Star } from "lucide-react";

const RecentResponses = () => {
  const recentResponses = [
    {
      id: 1,
      survey: "Customer Service Feedback",
      respondent: "Sarah Johnson",
      timestamp: "2 minutes ago",
      rating: 5,
      status: "completed"
    },
    {
      id: 2,
      survey: "Product Experience Survey",
      respondent: "Mike Chen",
      timestamp: "5 minutes ago",
      rating: 4,
      status: "completed"
    },
    {
      id: 3,
      survey: "Website Usability Study",
      respondent: "Anonymous",
      timestamp: "12 minutes ago",
      rating: 3,
      status: "partial"
    },
    {
      id: 4,
      survey: "Brand Awareness Survey",
      respondent: "Emily Davis",
      timestamp: "18 minutes ago",
      rating: 5,
      status: "completed"
    },
    {
      id: 5,
      survey: "Employee Satisfaction",
      respondent: "John Smith",
      timestamp: "25 minutes ago",
      rating: 4,
      status: "completed"
    }
  ];

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          Recent Responses
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        </CardTitle>
        <CardDescription className="text-sm md:text-base">
          Latest survey submissions and feedback
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <div className="space-y-3 md:space-y-4">
          {recentResponses.map((response, index) => (
            <div 
              key={response.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors animate-slide-in-right gap-3 sm:gap-4"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-slate-900 text-sm md:text-base truncate">{response.survey}</h4>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs md:text-sm text-slate-500">
                    <span className="truncate">{response.respondent}</span>
                    <span className="hidden sm:inline">•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      {response.timestamp}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-3">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{response.rating}</span>
                </div>
                <Badge 
                  variant={response.status === 'completed' ? 'default' : 'secondary'}
                  className={`text-xs ${
                    response.status === 'completed' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-orange-100 text-orange-700'
                  }`}
                >
                  {response.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentResponses;