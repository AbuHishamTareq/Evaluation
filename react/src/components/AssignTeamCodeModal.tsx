/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { X, Search, Trash2, Plus, RefreshCw, Hospital } from "lucide-react";
import api from "../axios";
import { toast } from "../hooks/use-toast";

interface TeamBasedCode {
    id: number;
    code: string;
    name: string;
}

interface AssignTeamCodeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    center: {
        id: number;
        label: string;
        phc_moh_code: string;
        codes?: Array<{ label: string; name: string }>;
    } | null;
    onAssignmentComplete: () => void;
}

export function AssignTeamCodeModal({
    open,
    onOpenChange,
    center,
    onAssignmentComplete,
}: AssignTeamCodeModalProps) {
    const [teamBasedCodes, setTeamBasedCodes] = useState<TeamBasedCode[]>([]);
    const [selectedCodes, setSelectedCodes] = useState<TeamBasedCode[]>([]);
    const [currentlyAssignedCodes, setCurrentlyAssignedCodes] = useState<TeamBasedCode[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredCodes, setFilteredCodes] = useState<TeamBasedCode[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingAssigned, setIsLoadingAssigned] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch team-based codes when modal opens
    useEffect(() => {
        if (open && center) {
            fetchTeamBasedCodes();
            fetchCurrentlyAssignedCodes();
        }
    }, [open, center]);

    // Filter codes based on search term
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredCodes(teamBasedCodes);
        } else {
            const filtered = teamBasedCodes.filter(
                (code) =>
                    code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    code.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredCodes(filtered);
        }
    }, [searchTerm, teamBasedCodes]);

    // Initialize selected codes when currently assigned codes are loaded
    useEffect(() => {
        setSelectedCodes([...currentlyAssignedCodes]);
    }, [currentlyAssignedCodes]);

    const fetchTeamBasedCodes = async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/api/centers/team-based-codes");
            setTeamBasedCodes(response.data);
        } catch (error) {
            console.error("Failed to fetch team-based codes:", error);
            toast({
                title: "Error",
                description: "Failed to fetch team-based codes.",
                backgroundColor: "bg-red-600",
                color: "text-white",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCurrentlyAssignedCodes = async () => {
        if (!center) return;
        
        setIsLoadingAssigned(true);
        try {
            // Fetch currently assigned team-based codes for this center
            const response = await api.get(`/api/centers/${center.id}/team-codes`);
            setCurrentlyAssignedCodes(response.data || []);
        } catch (error) {
            console.error("Failed to fetch currently assigned codes:", error);
            // Fallback to using center.codes if API call fails
            if (center.codes && teamBasedCodes.length > 0) {
                const fallbackCodes = teamBasedCodes.filter((tbc) =>
                    center.codes?.some((cc) => cc.label === tbc.code)
                );
                setCurrentlyAssignedCodes(fallbackCodes);
            }
        } finally {
            setIsLoadingAssigned(false);
        }
    };

    const handleCodeSelect = (code: TeamBasedCode) => {
        const isAlreadySelected = selectedCodes.some((sc) => sc.id === code.id);

        if (isAlreadySelected) {
            setSelectedCodes(selectedCodes.filter((sc) => sc.id !== code.id));
        } else {
            setSelectedCodes([...selectedCodes, code]);
        }
    };

    const handleRemoveCode = (codeId: number) => {
        setSelectedCodes(selectedCodes.filter((sc) => sc.id !== codeId));
    };

    const handleRemoveAllCodes = () => {
        setSelectedCodes([]);
    };

    const handleResetToOriginal = () => {
        setSelectedCodes([...currentlyAssignedCodes]);
    };

    const handleSubmit = async () => {
        if (!center) return;

        setIsSubmitting(true);
        try {
            const teamCodeIds = selectedCodes.map((code) => code.id);

            await api.post(`/api/centers/${center.id}/assign-team-codes`, {
                team_code_ids: teamCodeIds,
            });

            toast({
                title: "Success",
                description: "Team codes assigned successfully!",
                backgroundColor: "bg-green-600",
                color: "text-white",
            });

            // Update currently assigned codes to reflect the new state
            setCurrentlyAssignedCodes([...selectedCodes]);
            
            onAssignmentComplete();
            onOpenChange(false);
        } catch (error: any) {
            console.error("Failed to assign team codes:", error);
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to assign team codes.",
                backgroundColor: "bg-red-600",
                color: "text-white",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setSearchTerm("");
        // Reset to originally assigned codes when closing
        setSelectedCodes([...currentlyAssignedCodes]);
        onOpenChange(false);
    };

    // Check if there are changes from the original assignment
    const hasChanges = () => {
        if (selectedCodes.length !== currentlyAssignedCodes.length) return true;
        return !selectedCodes.every(sc => 
            currentlyAssignedCodes.some(cac => cac.id === sc.id)
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal>
            <DialogContent
                onInteractOutside={(e) => e.preventDefault()}
                className="sm:max-w-[900px] border-cyan-200 bg-gradient-to-br from-cyan-100 to-blue-400 pt-6"
            >
                <DialogHeader className="border-b border-cyan-200 pb-4">
                    <DialogTitle className="text-cyan-800 text-xl font-semibold">
                        Manage Team-Based Codes Assignment
                    </DialogTitle>
                    <DialogDescription className="text-cyan-600">
                        View, add, or remove team-based codes for the selected PHC center
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[70vh] overflow-y-auto py-4 space-y-4 pr-2 scrollbar-thin scrollbar-thumb-cyan-300 scrollbar-track-cyan-100">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column - Center Info and Currently Assigned Codes */}
                        <div className="space-y-4">
                            {/* Center Information */}
                            <div className="bg-white/50 p-4 rounded-lg border border-cyan-200">
                                <Label className="text-sm font-medium text-cyan-800">PHC Center</Label>
                                <div className="mt-1">
                                    <p className="text-lg font-semibold text-gray-800">
                                        {center?.label || "N/A"}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Code: {center?.phc_moh_code || "N/A"}
                                    </p>
                                </div>
                            </div>

                            {/* Currently Assigned Team-Based Codes */}
                            <div className="bg-white/70 p-4 rounded-lg border border-cyan-200">
                                <div className="flex items-center justify-between mb-3">
                                    <Label className="text-sm font-medium text-cyan-800">
                                        Currently Assigned TBCs ({currentlyAssignedCodes.length})
                                    </Label>
                                    {isLoadingAssigned && (
                                        <RefreshCw className="w-4 h-4 animate-spin text-cyan-600" />
                                    )}
                                </div>
                                
                                {isLoadingAssigned ? (
                                    <div className="text-center py-4 text-gray-500">
                                        Loading assigned codes...
                                    </div>
                                ) : currentlyAssignedCodes.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <div className="mb-2">
                                            <Hospital className="w-8 h-8 mx-auto text-gray-400" />
                                        </div>
                                        <p className="text-sm">No team-based codes currently assigned</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            This center has no TBCs assigned yet
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {currentlyAssignedCodes.map((code) => (
                                            <div
                                                key={code.id}
                                                className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                                            >
                                                <div className="flex-1">
                                                    <p className="font-medium text-green-900">{code.code}</p>
                                                </div>
                                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                    Assigned
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Selected Team-Based Codes (New Selection) */}
                            <div className="bg-white/70 p-4 rounded-lg border border-cyan-200">
                                <div className="flex items-center justify-between mb-3">
                                    <Label className="text-sm font-medium text-cyan-800">
                                        New Selection ({selectedCodes.length})
                                        {hasChanges() && (
                                            <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                                Modified
                                            </span>
                                        )}
                                    </Label>
                                    <div className="flex gap-2">
                                        {hasChanges() && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleResetToOriginal}
                                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300"
                                            >
                                                <RefreshCw className="w-4 h-4 mr-1" />
                                                Reset
                                            </Button>
                                        )}
                                        {selectedCodes.length > 0 && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleRemoveAllCodes}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                                            >
                                                <Trash2 className="w-4 h-4 mr-1" />
                                                Remove All
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                
                                {selectedCodes.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <div className="mb-2">
                                            <Plus className="w-8 h-8 mx-auto text-gray-400" />
                                        </div>
                                        <p className="text-sm">No team-based codes selected</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Select codes from the available list to assign them to this center
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {selectedCodes.map((code) => {
                                            const isOriginallyAssigned = currentlyAssignedCodes.some(cac => cac.id === code.id);
                                            return (
                                                <div
                                                    key={code.id}
                                                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                                                        isOriginallyAssigned 
                                                            ? "bg-green-50 border-green-200" 
                                                            : "bg-blue-50 border-blue-200 hover:bg-blue-100"
                                                    }`}
                                                >
                                                    <div className="flex-1">
                                                        <p className={`font-medium ${
                                                            isOriginallyAssigned ? "text-green-900" : "text-blue-900"
                                                        }`}>
                                                            {code.code}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {isOriginallyAssigned && (
                                                            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                                                Current
                                                            </Badge>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveCode(code.id)}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-100"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Search and Available Codes */}
                        <div className="space-y-4">
                            {/* Search Input */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-cyan-800">
                                    Search Available Team-Based Codes
                                </Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        type="text"
                                        placeholder="Search by code or name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 bg-white border-cyan-200 focus:border-cyan-400"
                                    />
                                </div>
                            </div>

                            {/* Available Codes List */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-cyan-800">
                                    Available Team-Based Codes
                                </Label>
                                <div className="border border-cyan-200 rounded-lg bg-white max-h-96 overflow-y-auto">
                                    {isLoading ? (
                                        <div className="p-4 text-center text-gray-500">
                                            Loading team-based codes...
                                        </div>
                                    ) : filteredCodes.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500">
                                            {searchTerm ? "No codes found matching your search" : "No team-based codes available"}
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-200">
                                            {filteredCodes.map((code) => {
                                                const isSelected = selectedCodes.some((sc) => sc.id === code.id);
                                                const isOriginallyAssigned = currentlyAssignedCodes.some(cac => cac.id === code.id);
                                                return (
                                                    <div
                                                        key={code.id}
                                                        className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                                                            isSelected ? "bg-blue-50 border-l-4 border-blue-500" : ""
                                                        }`}
                                                        onClick={() => handleCodeSelect(code)}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <p className="font-medium text-gray-900">
                                                                    {code.code}
                                                                </p>
                                                                <p className="text-sm text-gray-600">
                                                                    {code.name}
                                                                </p>
                                                            </div>
                                                            <div className="ml-2 flex items-center gap-2">
                                                                {isOriginallyAssigned && (
                                                                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                                                        Assigned
                                                                    </Badge>
                                                                )}
                                                                <div className={isSelected ? "text-blue-600" : "text-gray-400"}>
                                                                    {isSelected ? (
                                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                        </svg>
                                                                    ) : (
                                                                        <Plus className="w-5 h-5" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 mt-4 pt-4 border-t border-cyan-200">
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className="bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl"
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        type="button"
                        className={`shadow-lg hover:shadow-xl text-white ${
                            hasChanges() 
                                ? "bg-green-500 hover:bg-green-600" 
                                : "bg-gray-400 cursor-not-allowed"
                        }`}
                        onClick={handleSubmit}
                        disabled={isSubmitting || !hasChanges()}
                    >
                        {isSubmitting ? "Saving..." : hasChanges() ? `Save Changes (${selectedCodes.length} codes)` : "No Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}