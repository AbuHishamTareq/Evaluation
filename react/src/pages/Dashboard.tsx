import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { BarChart3, PieChart, TrendingUp, Users, Download, Filter, Calendar, Target } from "lucide-react";
import SurveyOverview from "../components/dashboard/SurveyOverview";
import ResponsesChart from "../components/dashboard/ResponsesChart";
import SatisfactionChart from "../components/dashboard/SatisfactionChart";
import DemographicsChart from "../components/dashboard/GraphicsChart";
import RecentResponses from "../components/dashboard/RecentResponses";
import Header from "../components/dashboard/Header";

const Dashboard = () => {
    return (
        <Header title="Dashboard">
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                <div className="container mx-auto p-3 sm:p-4 md:p-6 max-w-full">
                    {/* Page Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 md:mb-8 gap-4">
                        <div className="space-y-2">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                                Survey Analytics Overview
                            </h1>
                            <p className="text-slate-600 text-sm sm:text-base md:text-lg">Real-time insights and comprehensive data analysis</p>
                            <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-3">
                                <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200 transition-colors text-xs">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                    Live Data
                                </Badge>
                                <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 transition-colors text-xs">
                                    <Calendar className="w-3 h-3 mr-2" />
                                    <span className="hidden sm:inline">Last Updated: </span>2 mins ago
                                </Badge>
                                <Badge className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200 transition-colors text-xs">
                                    <Target className="w-3 h-3 mr-2" />
                                    <span className="hidden sm:inline">98.5% Data Quality</span>
                                    <span className="sm:hidden">98.5%</span>
                                </Badge>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3">
                            <Button variant="outline" size="sm" className="border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all text-xs sm:text-sm">
                                <Filter className="w-4 h-4 mr-2 text-blue-600" />
                                Filter
                            </Button>
                            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all text-xs sm:text-sm">
                                <Download className="w-4 h-4 mr-2" />
                                Export Report
                            </Button>
                        </div>
                    </div>

                    {/* Overview Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                        <SurveyOverview />
                    </div>

                    {/* Main Dashboard */}
                    <Tabs defaultValue="overview" className="space-y-4 md:space-y-6">
                        <div className="overflow-x-auto">
                            <TabsList className="grid w-full grid-cols-4 lg:w-fit bg-white/70 backdrop-blur-sm border border-blue-100 shadow-sm min-w-fit">
                                <TabsTrigger value="overview" className="flex items-center gap-1 md:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white transition-all text-xs sm:text-sm px-2 md:px-3">
                                    <BarChart3 className="w-3 h-3 md:w-4 md:h-4" />
                                    <span className="hidden sm:inline">Overview</span>
                                </TabsTrigger>
                                <TabsTrigger value="responses" className="flex items-center gap-1 md:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white transition-all text-xs sm:text-sm px-2 md:px-3">
                                    <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                                    <span className="hidden sm:inline">Responses</span>
                                </TabsTrigger>
                                <TabsTrigger value="satisfaction" className="flex items-center gap-1 md:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white transition-all text-xs sm:text-sm px-2 md:px-3">
                                    <PieChart className="w-3 h-3 md:w-4 md:h-4" />
                                    <span className="hidden sm:inline">Satisfaction</span>
                                </TabsTrigger>
                                <TabsTrigger value="demographics" className="flex items-center gap-1 md:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white transition-all text-xs sm:text-sm px-2 md:px-3">
                                    <Users className="w-3 h-3 md:w-4 md:h-4" />
                                    <span className="hidden sm:inline">Demographics</span>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="overview" className="space-y-4 md:space-y-6">
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
                                <ResponsesChart />
                                <SatisfactionChart />
                            </div>
                            <RecentResponses />
                        </TabsContent>

                        <TabsContent value="responses" className="space-y-4 md:space-y-6">
                            <div className="grid grid-cols-1 gap-4 md:gap-6">
                                <ResponsesChart />
                                <Card className="animate-fade-in border-green-200 bg-gradient-to-br from-white to-green-50/50 shadow-lg hover:shadow-xl transition-all">
                                    <CardHeader className="border-b border-green-100 bg-gradient-to-r from-green-50 to-emerald-50">
                                        <CardTitle className="text-green-800 flex items-center gap-2 text-lg md:text-xl">
                                            <TrendingUp className="w-5 h-5" />
                                            Response Rate Analysis
                                        </CardTitle>
                                        <CardDescription className="text-green-600 text-sm md:text-base">
                                            Detailed breakdown of survey completion rates across all campaigns
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-4 md:pt-6">
                                        <div className="space-y-4 md:space-y-6">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-slate-700">Overall Completion Rate</span>
                                                <Badge className="bg-green-100 text-green-800 border-green-200 font-semibold">87.5%</Badge>
                                            </div>
                                            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                                                <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full animate-[scale-in_0.8s_ease-out] w-[87.5%] shadow-inner"></div>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                                                    <p className="text-xl md:text-2xl font-bold text-green-700">2,847</p>
                                                    <p className="text-sm text-green-600">Completed</p>
                                                </div>
                                                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-100">
                                                    <p className="text-xl md:text-2xl font-bold text-orange-700">407</p>
                                                    <p className="text-sm text-orange-600">Incomplete</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="satisfaction" className="space-y-4 md:space-y-6">
                            <SatisfactionChart />
                        </TabsContent>

                        <TabsContent value="demographics" className="space-y-4 md:space-y-6">
                            <DemographicsChart />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </Header>
    );
};

export default Dashboard;