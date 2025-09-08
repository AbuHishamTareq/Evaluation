import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../../components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

const GraphicsChart = () => {
  const ageData = [
    { range: "18-24", count: 245, percentage: 15 },
    { range: "25-34", count: 523, percentage: 32 },
    { range: "35-44", count: 412, percentage: 25 },
    { range: "45-54", count: 289, percentage: 18 },
    { range: "55+", count: 165, percentage: 10 }
  ];

  const genderData = [
    { category: "Female", count: 847, percentage: 52 },
    { category: "Male", count: 723, percentage: 44 },
    { category: "Other", count: 65, percentage: 4 }
  ];

  const chartConfig = {
    count: {
      label: "Count",
      color: "#3B82F6"
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      <Card className="animate-fade-in">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg md:text-xl">Age Distribution</CardTitle>
          <CardDescription className="text-sm md:text-base">
            Survey responses by age groups
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <ChartContainer config={chartConfig} className="h-[320px] md:h-64">
            <div className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                  <XAxis
                    dataKey="range"
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
                    width={40}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="count"
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="animate-fade-in">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg md:text-xl">Gender Distribution</CardTitle>
          <CardDescription className="text-sm md:text-base">
            Survey responses by gender
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <div className="space-y-3 md:space-y-4">
            {genderData.map((item, index) => (
              <div
                key={item.category}
                className="space-y-2 animate-slide-in-right"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{item.category}</span>
                  <span className="text-slate-500">{item.count} ({item.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${item.percentage}%`,
                      animationDelay: `${index * 0.2 + 0.5}s`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GraphicsChart;