/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, type FormEvent } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Search } from "lucide-react";
import api from "../axios";
import { toast } from "../hooks/use-toast";

interface TbcAssignmentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: any;
    onSuccess: () => void;
}

interface Tbc {
    id: number;
    code: string;
    name: string;
    center_id: string;
}

export function TbcAssignmentModal({
    open,
    onOpenChange,
    user,
    onSuccess,
}: TbcAssignmentModalProps) {
    const [tbcs, setTbcs] = useState<Tbc[]>([]);
    const [filteredTbcs, setFilteredTbcs] = useState<Tbc[]>([]);
    const [selectedTbc, setSelectedTbc] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch TBCs when modal opens and user has a center
    useEffect(() => {
        if (open && user?.centers?.[0]?.name) {
            fetchTbcs(user.centers[0].name);
        }
    }, [open, user]);

    // Filter TBCs based on search term
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredTbcs(tbcs);
        } else {
            const filtered = tbcs.filter(
                (tbc) =>
                    tbc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    tbc.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredTbcs(filtered);
        }
    }, [searchTerm, tbcs]);

    // Reset form when modal closes
    useEffect(() => {
        if (!open) {
            setSelectedTbc("");
            setSearchTerm("");
            setTbcs([]);
            setFilteredTbcs([]);
        }
    }, [open]);

    const fetchTbcs = async (centerId: string) => {
        setIsLoading(true);
        try {
            const response = await api.get(`/api/centers/${centerId}/tbcs`);
            setTbcs(response.data.tbcs);
            setFilteredTbcs(response.data.tbcs);
        } catch (error: any) {
            console.error("Failed to fetch TBCs:", error);
            toast({
                title: "Error",
                description: "Failed to load team-based codes for this center.",
                backgroundColor: "bg-red-600",
                color: "text-white",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!selectedTbc) {
            toast({
                title: "Error",
                description: "Please select a team-based code to assign.",
                backgroundColor: "bg-red-600",
                color: "text-white",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await api.put(`/api/users/${user.id}/assign-tbc`, {
                tbc_code: selectedTbc,
            });

            toast({
                title: "Success",
                description: "Team-based code assigned successfully.",
                backgroundColor: "bg-green-600",
                color: "text-white",
            });

            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error("Failed to assign TBC:", error);
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to assign team-based code.",
                backgroundColor: "bg-red-600",
                color: "text-white",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal>
            <DialogContent 
                onInteractOutside={(e) => e.preventDefault()} 
                className="sm:max-w-[600px] border-cyan-200 bg-gradient-to-br from-cyan-100 to-blue-400"
            >
                <form onSubmit={handleSubmit}>
                    <DialogHeader className="border-b border-cyan-200 pb-4">
                        <DialogTitle className="text-cyan-800 text-xl font-semibold">
                            Assign Team-Based Code
                        </DialogTitle>
                        <DialogDescription className="text-cyan-600">
                            Assign a team-based code to the selected user based on their center.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2 bg-transparent scrollbar-thin scrollbar-thumb-cyan-300 scrollbar-track-cyan-100">
                        {/* User Information */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="user-name" className="text-cyan-800 font-medium">
                                    User Name
                                </Label>
                                <Input
                                    id="user-name"
                                    value={user?.name || ""}
                                    readOnly
                                    className="bg-white/70 border-cyan-300 text-cyan-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="center-name" className="text-cyan-800 font-medium">
                                    Center Name
                                </Label>
                                <Input
                                    id="center-name"
                                    value={user?.centers?.[0]?.label || "No center assigned"}
                                    readOnly
                                    className="bg-white/70 border-cyan-300 text-cyan-900"
                                />
                            </div>
                        </div>

                        {/* TBC Selection with Search */}
                        <div className="space-y-2">
                            <Label htmlFor="select-tbc" className="text-cyan-800 font-medium">
                                Select Team-Based Code
                            </Label>
                            {isLoading ? (
                                <div className="text-cyan-600 text-sm">Loading team-based codes...</div>
                            ) : (
                                <Select value={selectedTbc} onValueChange={setSelectedTbc}>
                                    <SelectTrigger className="bg-white/70 border-cyan-300 text-cyan-900">
                                        <SelectValue placeholder="Select a team-based code" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-cyan-300" onPointerDownOutside={(e) => e.preventDefault()}>
                                        <div className="relative mb-2">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-600 h-4 w-4" />
                                            <Input
                                                id="search-tbc"
                                                placeholder="Search by code or name..."
                                                value={searchTerm}
                                                onChange={(e) => {
                                                    setSearchTerm(e.target.value);
                                                    e.stopPropagation();
                                                }}
                                                className="pl-10 bg-white/70 border-cyan-300 text-cyan-900 placeholder:text-cyan-600"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                        {filteredTbcs.length === 0 ? (
                                            <div className="text-cyan-600 text-sm px-2 py-1">
                                                {tbcs.length === 0 
                                                    ? "No team-based codes available for this center." 
                                                    : "No team-based codes match your search."}
                                            </div>
                                        ) : (
                                            filteredTbcs.map((tbc) => (
                                                <SelectItem 
                                                    key={tbc.id} 
                                                    value={tbc.code}
                                                    className="text-cyan-900 hover:bg-cyan-50"
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{tbc.code}</span>
                                                    </div>
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        {/* Current TBC (if any) */}
                        {user?.tbc && (
                            <div className="space-y-2">
                                <Label className="text-cyan-800 font-medium">
                                    Current Team-Based Code
                                </Label>
                                <Input
                                    value={user.tbc}
                                    readOnly
                                    className="bg-yellow-100/70 border-yellow-300 text-yellow-900"
                                />
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2 mt-4 pt-4 border-t border-cyan-200">
                        <DialogClose asChild>
                            <Button 
                                type="button" 
                                variant="outline" 
                                className="bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                        </DialogClose>

                        <Button
                            type="submit"
                            className="bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl"
                            disabled={isSubmitting || !selectedTbc}
                        >
                            {isSubmitting ? "Assigning..." : "Assign TBC"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
