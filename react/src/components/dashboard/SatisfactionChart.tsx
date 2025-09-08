import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../../components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const SatisfactionChart = () => {
  const data = [
    { name: "Very Satisfied", value: 45, color: "#10B981" },
    { name: "Satisfied", value: 30, color: "#3B82F6" },
    { name: "Neutral", value: 15, color: "#F59E0B" },
    { name: "Dissatisfied", value: 7, color: "#EF4444" },
    { name: "Very Dissatisfied", value: 3, color: "#8B5CF6" }
  ];

  const chartConfig = {
    satisfaction: {
      label: "Satisfaction Level"
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          Customer Satisfaction
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </CardTitle>
        <CardDescription className="text-sm md:text-base">
          Overall satisfaction ratings from recent surveys
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-4 md:gap-6">
          <ChartContainer config={chartConfig} className="h-48 sm:h-56 md:h-64 flex-1 min-w-0">
            <div className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    animationDuration={1000}
                    animationBegin={200}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartContainer>

          <div className="space-y-2 md:space-y-3 flex-1 w-full lg:w-auto">
            {data.map((item, index) => (
              <div 
                key={item.name} 
                className="flex items-center justify-between p-2 md:p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors animate-slide-in-right"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                  <div 
                    className="w-3 h-3 md:w-4 md:h-4 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-xs sm:text-sm font-medium text-slate-700 truncate">
                    {item.name}
                  </span>
                </div>
                <span className="text-sm md:text-lg font-bold text-slate-900 ml-2">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SatisfactionChart;
