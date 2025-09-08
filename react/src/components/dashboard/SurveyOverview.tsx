import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Users, FileText, Clock, TrendingUp } from "lucide-react";

const SurveyOverview = () => {
  const stats = [
    {
      title: "Total Evaluations",
      value: "2,847",
      change: "+12.5%",
      changeType: "positive",
      icon: Users,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Active Evaluations",
      value: "24",
      change: "+3",
      changeType: "positive",
      icon: FileText,
      color: "from-emerald-500 to-emerald-600"
    },
    {
      title: "Ended Evaluations",
      value: "4.2m",
      change: "-0.8m",
      changeType: "positive",
      icon: Clock,
      color: "from-amber-500 to-amber-600"
    },
    {
      title: "Completed Evaluations",
      value: "87.5%",
      change: "+5.2%",
      changeType: "positive",
      icon: TrendingUp,
      color: "from-purple-500 to-purple-600"
    }
  ];

  return (
    <>
      {stats.map((stat, index) => (
        <Card 
          key={stat.title} 
          className="animate-fade-in hover-scale transition-all duration-300 hover:shadow-lg border-0 shadow-sm"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              {stat.title}
            </CardTitle>
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
              <stat.icon className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {stat.value}
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className={`text-xs ${
                  stat.changeType === 'positive' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {stat.change}
              </Badge>
              <span className="text-xs text-slate-500">from last month</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
};

export default SurveyOverview;