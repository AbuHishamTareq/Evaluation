import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../../components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";

const ResponsesChart = () => {
  const data = [
    { month: "Jan", responses: 186, completed: 165 },
    { month: "Feb", responses: 305, completed: 285 },
    { month: "Mar", responses: 437, completed: 398 },
    { month: "Apr", responses: 543, completed: 475 },
    { month: "May", responses: 689, completed: 625 },
    { month: "Jun", responses: 789, completed: 710 },
    { month: "Jul", responses: 895, completed: 825 },
    { month: "Aug", responses: 945, completed: 875 },
    { month: "Sep", responses: 1123, completed: 1045 },
    { month: "Oct", responses: 1287, completed: 1198 },
    { month: "Nov", responses: 1456, completed: 1356 },
    { month: "Dec", responses: 1623, completed: 1523 }
  ];

  const chartConfig = {
    responses: {
      label: "Total Responses",
      color: "#3B82F6"
    },
    completed: {
      label: "Completed",
      color: "#10B981"
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          Monthly Survey Responses
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        </CardTitle>
        <CardDescription className="text-sm md:text-base">
          Track survey engagement and completion rates over time
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <ChartContainer config={chartConfig} className="h-[320px] sm:h-72 md:h-80 w-full">
          <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="responsesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  className="text-slate-500 text-xs"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  className="text-slate-500 text-xs"
                  tick={{ fontSize: 12 }}
                  width={50}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="responses"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="url(#responsesGradient)"
                  animationDuration={1500}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="#10B981"
                  strokeWidth={2}
                  fill="url(#completedGradient)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ResponsesChart;
