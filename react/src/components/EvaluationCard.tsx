/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from "react"
//import EvaluationCardItem from "./EvaluationCardItem"
import api from "../axios";
import { useApp } from "../hooks/useApp";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Building, CalendarDays, FileText, MapPin, Search, User } from "lucide-react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import Header from "./dashboard/Header";
import { Badge } from "./ui/badge";
import { useToast } from "../hooks/use-toast";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import slugify from "slugify";

interface Zone {
    label: string;
    name: string;
}

interface Center {
    label: string;
    name: string;
    zone_id: string;
}

interface Section {
    en_label: string;
    name: string;
}

interface Evaluation {
    title: string;
    name: string;
    section_id: string;
}

interface Survey {
    id: number;
    zoneName: string;
    centerName: string;
    evaluationSubject: string;
    evaluatorName: string;
    submittedDate: Date;
    status: string;
    completionPercentage: number;
    score: number;
}

const EvaluationCard = () => {
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [selectedEvaluation, setSelectedEvaluation] = useState("");
    const [zones, setZones] = useState<Zone[]>([]);
    const [selectedZone, setSelectedZone] = useState("");
    const [centers, setCenters] = useState<Center[]>([]);
    const [filteredCenters, setFilteredCenters] = useState<Center[]>([]);
    const [selectedCenter, setSelectedCenter] = useState("");
    const [sections, setSections] = useState<Section[]>([]);
    const [selectedSection, setSelectedSection] = useState("");
    const [filteredEvaluations, setFilteredEvaluations] = useState<Evaluation[]>([]);
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const { user, loading: userLoading } = useApp();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;


    // Search states
    const [zoneSearch, setZoneSearch] = useState("");
    const [centerSearch, setCenterSearch] = useState("");
    const [sectionSearch, setSectionSearch] = useState("");
    const [evaluationSearch, setEvaluationSearch] = useState("");
    const [tableSearch, setTableSearch] = useState("");

    // Loading states
    const [loadingCenters, setLoadingCenters] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);

    const currentDate = format(new Date(), "PPP");

    const fetchCenterSurveyResponse = async () => {
        let res;

        if (user?.center_id) {
            res = await api.get('/api/evaluations/getAllSurveyForCenter', {
                params: {
                    center_id: user.center_id,
                }
            });
        } else {
            res = await api.get('/api/evaluations/getAllSurvey');
        }

        setSurveys(res.data.surveys);
    }

    const fetchFormData = async () => {
        try {
            const res = await api.get('/api/evaluations/getFormData');
            setZones(res.data.zones);
            setCenters(res.data.centers);
            setFilteredCenters(res.data.centers);
            setSections(res.data.sections);
            setEvaluations(res.data.evaluations);
            setFilteredEvaluations(res.data.evaluations);
            setDataLoaded(true);

            // Handle user with center_id
            if (res.data.user?.center_id) {
                const userCenter = res.data.centers.find((c: Center) => c.name === res.data.user.center_id);
                if (userCenter) {
                    setSelectedCenter(userCenter.name);
                    setSelectedZone(userCenter.zone_id);
                }
            }

        } catch (e: unknown) {
            if (e instanceof Error) {
                console.log(e.message);
            } else {
                console.log("An unknown error occurred.");
            }
        }
    }

    // Fetch centers when zone changes
    const fetchCentersByZone = async (zoneName: string) => {
        if (!zoneName) {
            setFilteredCenters(centers);
            return;
        }

        setLoadingCenters(true);
        try {
            const res = await api.get(`/api/evaluations/centers-by-zone?zone=${zoneName}`);
            setFilteredCenters(res.data.centers);
        } catch (e: unknown) {
            console.error("Error fetching centers:", e);
            setFilteredCenters([]);
        } finally {
            setLoadingCenters(false);
        }
    }

    // Fetch evaluations when section changes
    const fetchEvaluationsBySection = async (sectionName: string) => {
        if (!sectionName) {
            setFilteredEvaluations(evaluations);
            return;
        }

        try {
            const res = await api.get(`/api/evaluations/evaluations-by-section?section=${sectionName}`);
            setFilteredEvaluations(res.data.evaluations);
        } catch (e: unknown) {
            console.error("Error fetching evaluations:", e);
            setFilteredEvaluations([]);
        }
    }

    const filteredEvaluationsTable = useMemo(() => {
        return surveys.filter(evaluation => {
            const searchLower = tableSearch.toLowerCase();
            return (
                evaluation.zoneName.toLowerCase().includes(searchLower) ||
                evaluation.centerName.toLowerCase().includes(searchLower) ||
                evaluation.evaluationSubject.toLowerCase().includes(searchLower) ||
                evaluation.evaluatorName.toLowerCase().includes(searchLower) ||
                evaluation.status.toLowerCase().includes(searchLower)
            );
        });
    }, [surveys, tableSearch]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredEvaluationsTable.slice(start, end);
    }, [filteredEvaluationsTable, currentPage]);


    // Initial data fetch after user data is loaded
    useEffect(() => {
        if (!userLoading) {
            fetchFormData();
            fetchCenterSurveyResponse();
        }
    }, [userLoading]);

    // Set user's center and zone when data is loaded and user has center_id
    useEffect(() => {
        if (dataLoaded && user?.center_id && centers.length > 0) {
            const userCenter = centers.find(c => c.name === user.center_id);
            if (userCenter) {
                setSelectedCenter(userCenter.name);
                setSelectedZone(userCenter.zone_id);
            }
        }
    }, [dataLoaded, user, centers]);

    // Handle zone selection change
    useEffect(() => {
        if (selectedZone && !user?.center_id) {
            fetchCentersByZone(selectedZone);
            // Reset center selection when zone changes (unless user has center_id)
            setSelectedCenter("");
        }
    }, [selectedZone, user?.center_id]);

    // Handle section selection change
    useEffect(() => {
        if (selectedSection) {
            fetchEvaluationsBySection(selectedSection);
            // Reset evaluation selection when section changes
            setSelectedEvaluation("");
        }
    }, [selectedSection]);

    // Auto-select evaluation when section changes and there's only one evaluation
    useEffect(() => {
        if (selectedSection && filteredEvaluations.length === 1) {
            setSelectedEvaluation(filteredEvaluations[0].name);
        } else {
            setSelectedEvaluation('');
        }
    }, [selectedSection, filteredEvaluations]);

    const handleSubmit = async (e: React.FormEvent, setErrors?: (errors: Record<string, string[]>) => void) => {
        e.preventDefault();

        try {
            const res = await api.post('/api/evaluations/centerSurveyResponse/create', {
                center: selectedCenter,
                evaluation: selectedEvaluation,
            });

            const responseId = res.data?.response?.id;

            toast({
                title: "Success",
                description: res.data?.message || "Evaluation started successfully.",
                backgroundColor: "bg-green-600",
                color: "text-white",
                variant: "default",
            });

            if (responseId) {
                navigate(
                    `/evaluations/${selectedSection}/${selectedEvaluation}?responseId=${encodeURIComponent(
                        String(responseId)
                    )}`
                );
            } else {
                // fallback if no ID returned
                navigate(`/evaluations/${selectedSection}/${selectedEvaluation}`);
            }

        } catch (error: unknown) {
            const axiosError = error as AxiosError<any>;


            if (axiosError.response?.status === 422 && setErrors) {
                setErrors(axiosError.response.data.errors);
            } else {
                toast({
                    title: "Error",
                    description: axiosError.response?.data?.message || "An unexpected error occurred.",
                    backgroundColor: "bg-red-600",
                    color: "text-white",
                    variant: "destructive",
                });
            }
        }
    };


    // Filtered data based on search
    const searchFilteredZones = useMemo(() => {
        return zones.filter((zone) =>
            zone.label.toLowerCase().includes(zoneSearch.toLowerCase())
        );
    }, [zones, zoneSearch]);

    const searchFilteredCenters = useMemo(() => {
        return filteredCenters.filter((center) =>
            center.label.toLowerCase().includes(centerSearch.toLowerCase())
        );
    }, [filteredCenters, centerSearch]);

    const searchFilteredSections = useMemo(() => {
        return sections.filter((section) =>
            section.en_label.toLowerCase().includes(sectionSearch.toLowerCase())
        );
    }, [sections, sectionSearch]);

    const searchFilteredEvaluations = useMemo(() => {
        return filteredEvaluations.filter((evaluation) =>
            evaluation.title.toLowerCase().includes(evaluationSearch.toLowerCase())
        );
    }, [filteredEvaluations, evaluationSearch]);

    // Check if user has center_id (should disable zone and center selection)
    const hasUserCenter = Boolean(user?.center_id);

    // Find zone and center labels for display
    const selectedZoneLabel = useMemo(() => {
        const zone = zones.find(z => z.name === selectedZone);
        return zone?.label || "Select a zone";
    }, [selectedZone, zones]);

    const selectedCenterLabel = useMemo(() => {
        const center = centers.find(c => c.name === selectedCenter);
        return center?.label || "Select a Primary Health Care";
    }, [selectedCenter, centers]);

    const ongoingSurvey = useMemo(() => {
        if (!selectedEvaluation || !selectedSection || surveys.length === 0) return null;

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        return surveys.find((survey) => {
            const surveyDate = new Date(survey.submittedDate);
            const surveyYear = surveyDate.getFullYear();
            const surveyMonth = surveyDate.getMonth() + 1;

            console.log(slugify(survey.evaluationSubject, { lower: true, strict: true }));

            return (
                slugify(survey.centerName, { lower: true, strict: true }) === selectedCenter &&
                slugify(survey.evaluationSubject, { lower: true, strict: true }) === selectedEvaluation &&
                surveyYear === currentYear &&
                surveyMonth === currentMonth &&
                (survey.status === "started" || survey.status === "in-progress")
            );
        });
    }, [surveys, selectedEvaluation, selectedSection, selectedCenter]);


    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800 hover:bg-green-100";
            case "in-progress":
                return "bg-blue-100 text-blue-800 hover:bg-blue-100";
            case "ended":
                return "bg-red-600 text-white hover:bg-red-600";
            default:
                return "bg-muted text-muted-foreground";
        }
    };

    return (
        <Header title="Evaluation Forms">
            <div className="min-h-screen bg-background py-6 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <img
                            src="../images/logo.png"
                            alt="Logo"
                            className="w-16 h-16 mx-auto mb-4"
                        />
                        <h1 className="text-3xl font-bold text-foreground">Evaluation Management System</h1>
                        <p className="text-muted-foreground">Manage and track evaluations across all zones and centers</p>
                    </div>

                    {/* Form Section */}
                    <Card className="shadow-lg border-border">
                        <CardHeader className="bg-sky-800 text-primary-foreground">
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Evaluation Form
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="evaluator" className="flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Evaluator Name
                                    </Label>
                                    <Input
                                        id="evaluator"
                                        value={user?.name || ""}
                                        className="border-input"
                                        disabled
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        Zone
                                    </Label>
                                    <div className="relative">
                                        {hasUserCenter ? (
                                            <Input
                                                value={selectedZoneLabel}
                                                className="border-input bg-muted cursor-not-allowed"
                                                disabled
                                            />
                                        ) : (
                                            <Select
                                                value={selectedZone}
                                                onValueChange={setSelectedZone}
                                            >
                                                <SelectTrigger className="border-input">
                                                    <SelectValue placeholder="Select a zone" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <div className="p-2 border-b border-border">
                                                        <div className="relative">
                                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                                            <Input
                                                                placeholder="Search zones..."
                                                                value={zoneSearch}
                                                                onChange={(e) => setZoneSearch(e.target.value)}
                                                                className="pl-10 h-8 border-0 bg-muted/50 focus-visible:ring-1 focus-visible:ring-ring"
                                                            />
                                                        </div>
                                                    </div>
                                                    {searchFilteredZones.length > 0 ? (
                                                        searchFilteredZones.map((zone) => (
                                                            <SelectItem key={zone.name} value={zone.name} className="animate-fade-in">
                                                                {zone.label}
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <div className="p-2 text-sm text-muted-foreground text-center">
                                                            No zones found
                                                        </div>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Building className="w-4 h-4" />
                                        Primary Health Care (PHC)
                                    </Label>
                                    <div className="relative">
                                        {hasUserCenter ? (
                                            <Input
                                                value={selectedCenterLabel}
                                                className="border-input bg-muted cursor-not-allowed"
                                                disabled
                                            />
                                        ) : (
                                            <Select
                                                value={selectedCenter}
                                                onValueChange={setSelectedCenter}
                                                disabled={loadingCenters}
                                            >
                                                <SelectTrigger className={`border-input ${loadingCenters ? 'bg-muted cursor-not-allowed' : ''}`}>
                                                    <SelectValue placeholder={loadingCenters ? "Loading centers..." : "Select a Primary Health Care"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <div className="p-2 border-b border-border">
                                                        <div className="relative">
                                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                                            <Input
                                                                placeholder="Search Primary Health Care..."
                                                                value={centerSearch}
                                                                onChange={(e) => setCenterSearch(e.target.value)}
                                                                className="pl-10 h-8 border-0 bg-muted/50 focus-visible:ring-1 focus-visible:ring-ring"
                                                            />
                                                        </div>
                                                    </div>
                                                    {searchFilteredCenters.length > 0 ? (
                                                        searchFilteredCenters.map((center) => (
                                                            <SelectItem key={center.name} value={center.name} className="animate-fade-in">
                                                                {center.label}
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <div className="p-2 text-sm text-muted-foreground text-center">
                                                            {loadingCenters ? "Loading..." : "No centers found"}
                                                        </div>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Section
                                    </Label>
                                    <div className="relative">
                                        <Select value={selectedSection} onValueChange={setSelectedSection}>
                                            <SelectTrigger className="border-input">
                                                <SelectValue placeholder="Select Section" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <div className="p-2 border-b border-border">
                                                    <div className="relative">
                                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                                        <Input
                                                            placeholder="Search Sections..."
                                                            value={sectionSearch}
                                                            onChange={(e) => setSectionSearch(e.target.value)}
                                                            className="pl-10 h-8 border-0 bg-muted/50 focus-visible:ring-1 focus-visible:ring-ring"
                                                        />
                                                    </div>
                                                </div>
                                                {searchFilteredSections.length > 0 ? (
                                                    searchFilteredSections.map((section) => (
                                                        <SelectItem key={section.name} value={section.name} className="animate-fade-in">
                                                            {section.en_label}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <div className="p-2 text-sm text-muted-foreground text-center">
                                                        No forms found
                                                    </div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Evaluation Form
                                    </Label>
                                    <div className="relative">
                                        <Select
                                            value={selectedEvaluation}
                                            onValueChange={setSelectedEvaluation}
                                            disabled
                                        >
                                            <SelectTrigger className='border-input'>
                                                <SelectValue placeholder="Evaluation Form" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <div className="p-2 border-b border-border">
                                                    <div className="relative">
                                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                                        <Input
                                                            placeholder="Search Forms..."
                                                            value={evaluationSearch}
                                                            onChange={(e) => setEvaluationSearch(e.target.value)}
                                                            className="pl-10 h-8 border-0 bg-muted/50 focus-visible:ring-1 focus-visible:ring-ring"
                                                        />
                                                    </div>
                                                </div>
                                                {searchFilteredEvaluations.length > 0 ? (
                                                    searchFilteredEvaluations.map((form) => (
                                                        <SelectItem key={form.name} value={form.name} className="animate-fade-in">
                                                            {form.title}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <div className="p-2 text-sm text-muted-foreground text-center">
                                                        "No forms found"
                                                    </div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <CalendarDays className="w-4 h-4" />
                                        Start Date
                                    </Label>
                                    <Input
                                        value={currentDate}
                                        disabled
                                        className="bg-muted border-input"
                                    />
                                </div>

                                <div className="flex items-end">
                                    <Button type="submit" className="w-full bg-sky-800 hover:bg-sky-800/90 text-primary-foreground">
                                        {ongoingSurvey ? "Continue Evaluation" : "Start Evaluation"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Table Section */}
                    <Card className="shadow-lg border-border">
                        <CardHeader className="bg-sky-600 text-accent-foreground">
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Evaluation History
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            {/* Table Search */}
                            <div className="mb-4">
                                <div className="relative max-w-sm">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                    <Input
                                        placeholder="Search Keyword..."
                                        value={tableSearch}
                                        onChange={(e) => setTableSearch(e.target.value)}
                                        className="pl-10 border-input"
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardContent className="p-0">
                            {filteredEvaluationsTable.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                                    <p className="text-lg">No Evaluation Form Found</p>
                                    <p className="text-sm">Try adjusting your search criteria</p>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-border">
                                                    {(user?.roles.includes('super-admin') || user?.roles.includes('admin')) && (
                                                        <>
                                                            <TableHead className="font-bold">Zone Name</TableHead>
                                                            <TableHead className="font-bold">Center Name</TableHead>
                                                        </>
                                                    )}
                                                    <TableHead className="font-bold">Evaluation Subject</TableHead>
                                                    <TableHead className="font-bold">Evaluator Name</TableHead>
                                                    <TableHead className="font-bold">Started Date</TableHead>
                                                    <TableHead className="font-bold">Status</TableHead>
                                                    <TableHead className="font-bold">Overall Score</TableHead>
                                                    <TableHead className="font-bold">Progression</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {paginatedData.map((evaluation) => (
                                                    <TableRow key={evaluation.id} className="border-border hover:bg-muted/50">
                                                        {(user?.roles.includes('super-admin') || user?.roles.includes('admin')) && (
                                                            <>
                                                                <TableCell className="font-medium">{evaluation.zoneName}</TableCell>
                                                                <TableCell>{evaluation.centerName}</TableCell>
                                                            </>
                                                        )}
                                                        <TableCell>{evaluation.evaluationSubject}</TableCell>
                                                        <TableCell>{evaluation.evaluatorName}</TableCell>
                                                        <TableCell>{format(new Date(evaluation.submittedDate), "PPP")}</TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant="secondary"
                                                                className={getStatusColor(evaluation.status)}
                                                            >
                                                                {evaluation.status
                                                                    .replace('-', ' ')
                                                                    .split(' ')
                                                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                                    .join(' ')}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center">{evaluation.score}</TableCell>
                                                        <TableCell className="text-center">{Math.round(evaluation.completionPercentage)}%</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Pagination Controls */}
                                    <div className="flex justify-between items-center px-4 py-3 border-t border-border">
                                        <p className="text-sm text-muted-foreground">
                                            Page {currentPage} of {Math.ceil(filteredEvaluationsTable.length / itemsPerPage)}
                                        </p>
                                        <div className="space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={currentPage === 1}
                                                onClick={() => setCurrentPage((prev) => prev - 1)}
                                            >
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={currentPage === Math.ceil(filteredEvaluationsTable.length / itemsPerPage)}
                                                onClick={() => setCurrentPage((prev) => prev + 1)}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Header>
    )
}

export default EvaluationCard
