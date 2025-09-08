/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import Header from '../components/dashboard/Header';
import CustomTable from '../components/CustomTable';
import { TbcsTableConfig } from '../config/tables/tbc-table';
import api from '../axios';
import { CustomModelForm } from '../components/CustomModelForm';
import { TbcsModelFormConfig } from '../config/forms/tbc-model-form';
import { toast } from '../hooks/use-toast';
import { useApp } from '../hooks/useApp';
import { ChevronDown, Download, FileText, Hospital, Printer, Search, Upload } from 'lucide-react';
import { Input } from '../components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Button } from '../components/ui/button';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { hasPermission } from '../lib/authorization';
import { useReactToPrint } from 'react-to-print';
import ExcelJS from "exceljs";
import { saveAs } from 'file-saver';

const Domain = () => {
    const [tbcs, setTbcs] = useState<any[]>([]);
    const [center, setCenter] = useState([]);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
    });
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [modelOpen, setModelOpen] = useState(false);
    const [mode, setMode] = useState<'create' | 'view' | 'edit'>('create');
    const [selectedCenter, setSelectedCenter] = useState<any>(null);
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [isImportOpen, setIsImportOpen] = useState(false);

    const { refresh, user } = useApp();

    const userName = user?.name ?? undefined;
    const userRole = user?.roles?.[0] ?? undefined;

    const userPermissions = user?.permissions ?? [];

    const canPrint = hasPermission(`print-tbc`, userPermissions);
    const canExport = hasPermission(`export-tbc`, userPermissions);
    const canImport = hasPermission(`import-tbc`, userPermissions);

    const printRef = useRef<HTMLDivElement>(null);
    const [allTbcs, setAllTbcs] = useState<any[]>([]);
    const [isLoadingAll, setIsLoadingAll] = useState(false);

    // Fetch all users data for printing - Fixed version
    const fetchAllTbcsForPrint = async (): Promise<any[]> => {
        try {
            const res = await api.get(`/api/tbcs`, {
                params: {
                    page: 1,
                    per_page: -1, // Use -1 to get all records as per backend fix
                    search: search,
                    sort_by: sortBy,
                    sort_dir: sortDir,
                },
            });

            const fetchedTbcs = res.data.tbcs.data;
            return fetchedTbcs;
        } catch (error) {
            console.error('Failed to fetch all tbcs:', error);
            toast({
                title: "Error",
                description: "Failed to fetch all tbcs data.",
                backgroundColor: "bg-red-600",
                color: "text-white",
                variant: "destructive",
            });
            return [];
        }
    };

    // Custom print handler that ensures data is loaded
    const handlePrintClick = async () => {
        setIsLoadingAll(true);

        try {
            // Fetch all users and wait for the result
            const fetchedTbcs = await fetchAllTbcsForPrint();

            if (fetchedTbcs.length === 0) {
                toast({
                    title: "Warning",
                    description: "No tbcs found to print.",
                    backgroundColor: "bg-yellow-600",
                    color: "text-white",
                });
                return;
            }

            // Update state with fetched users
            setAllTbcs(fetchedTbcs);

            // Wait for state to update and component to re-render
            await new Promise(resolve => {
                setTimeout(() => {
                    resolve(undefined);
                }, 500); // Increased delay to ensure state update
            });

            // Now trigger the print
            if (!printRef.current) alert("Ref is null!");
            handlePrint();

        } catch (error) {
            console.error('Print preparation failed:', error);
            toast({
                title: "Error",
                description: "Failed to prepare data for printing.",
                backgroundColor: "bg-red-600",
                color: "text-white",
                variant: "destructive",
            });
        } finally {
            setIsLoadingAll(false);
        }
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'All Tbcs Report',
        onAfterPrint: () => {
            setAllTbcs([]);
        },
    });

    // Import state
    const [isImporting, setIsImporting] = useState(false);

    // Enhanced import handler
    const handleImport = async (file: File) => {
        if (!file) return;

        // Validate file type
        const allowedTypes = [
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];

        if (!allowedTypes.includes(file.type)) {
            toast({
                title: "Error",
                description: "Please upload a CSV or Excel file.",
                backgroundColor: "bg-red-600",
                color: "text-white",
                variant: "destructive",
            });
            return;
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            toast({
                title: "Error",
                description: "File size must be less than 10MB.",
                backgroundColor: "bg-red-600",
                color: "text-white",
                variant: "destructive",
            });
            return;
        }

        setIsImporting(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/api/tbcs/import', formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const result = response.data;

            // Show success message with statistics
            let message = `Import completed! ${result.imported_count} users imported successfully.`;
            if (result.skipped_count > 0) {
                message += ` ${result.skipped_count} users were skipped.`;
            }

            toast({
                title: "Import Successful",
                description: message,
                backgroundColor: "bg-green-600",
                color: "text-white",
            });

            // Show warnings if any
            if (result.warnings && result.warnings.length > 0) {
                console.warn('Import warnings:', result.warnings);
                // You could show these in a modal or additional toast
                toast({
                    title: "Import Warnings",
                    description: `${result.warnings.length} warnings occurred. Check console for details.`,
                    backgroundColor: "bg-yellow-600",
                    color: "text-white",
                });
            }

            // Refresh the users list
            await fetchTbcs();
            setIsImportOpen(false);

        } catch (error: any) {
            console.error('Import failed:', error);

            let errorMessage = "Failed to import users. Please check your file format and try again.";
            if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            }

            toast({
                title: "Import Failed",
                description: errorMessage,
                backgroundColor: "bg-red-600",
                color: "text-white",
                variant: "destructive",
            });
        } finally {
            setIsImporting(false);
        }
    };

    // Download template function
    const handleDownloadTemplate = async () => {
        try {
            const response = await api.get('/api/tbcs/download-template', {
                responseType: 'blob',
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'tbcs_import_template.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast({
                title: "Success",
                description: "Template downloaded successfully.",
                backgroundColor: "bg-green-600",
                color: "text-white",
            });

        } catch (error: any) {
            console.error('Template download failed:', error);
            toast({
                title: "Error",
                description: "Failed to download template.",
                backgroundColor: "bg-red-600",
                color: "text-white",
                variant: "destructive",
            });
        }
    };

    const fetchTbcs = async (
        page = 1,
        perPage = 10,
        searchValue = '',
        sortColumn = 'created_at',
        sortDirection: 'asc' | 'desc' = 'desc'
    ) => {
        try {
            const res = await api.get(`/api/tbcs`, {
                params: {
                    page,
                    per_page: perPage,
                    search: searchValue,
                    sort_by: sortColumn,
                    sort_dir: sortDirection,
                },
            });

            const tbcData = res.data.tbcs;
            setTbcs(tbcData.data);
            setCenter(res.data.centers);

            setPagination({
                current_page: tbcData.current_page,
                last_page: tbcData.last_page,
                per_page: tbcData.per_page,
            });
        } catch {
            console.error('Something went wrong');
        }
    };

    // Fetch all tbcs data for export
    const fetchAllTbcs = async () => {
        try {
            const res = await api.get(`/api/tbcs`, {
                params: {
                    page: 1,
                    per_page: 10000, // Large number to get all records
                    search: search,
                    sort_by: sortBy,
                    sort_dir: sortDir,
                },
            });

            return res.data.tbcs.data;
        } catch (error) {
            console.error('Failed to fetch all tbcs:', error);
            toast({
                title: "Error",
                description: "Failed to fetch all tbcs data.",
                backgroundColor: "bg-red-600",
                color: "text-white",
                variant: "destructive",
            });
            return [];
        }
    };

    useEffect(() => {
        fetchTbcs(
            pagination.current_page,
            pagination.per_page,
            search,
            sortBy,
            sortDir
        );
    }, []);

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > pagination.last_page) return;
        fetchTbcs(newPage, pagination.per_page, search, sortBy, sortDir);
    };

    const handlePerPageChange = (newPerPage: number) => {
        fetchTbcs(1, newPerPage, search, sortBy, sortDir);
    };

    const handleSort = (column: string) => {
        const newDir = sortBy === column && sortDir === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortDir(newDir);
        fetchTbcs(pagination.current_page, pagination.per_page, search, column, newDir);
    };

    const handleDelete = async (id: number) => {
        const confirmed = window.confirm("Are you sure you want to delete this item?");
        if (!confirmed) return;

        try {
            const response = await api.delete(`/api/tbcs/delete/${id}`);
            toast({
                title: "Deleted",
                description: response.data?.message || "Center deleted successfully.",
                backgroundColor: "bg-green-600",
                color: "text-white",
            });
            await fetchTbcs(); // refresh the data
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to delete the tbc.",
                backgroundColor: "bg-red-600",
                color: "text-white",
                variant: "destructive",
            });
        }
    };

    const closeModel = () => {
        setMode('create');
        setSelectedCenter(null);
        setModelOpen(false);
    };

    const handleModelToggle = (open: boolean) => {
        setModelOpen(open);
        if (!open) {
            closeModel();
        }
    };

    const openModel = (mode: 'create' | 'view' | 'edit', tbc?: any) => {
        setMode(mode);
        setSelectedCenter(tbc || null);
        setModelOpen(true);
    };

    const getFormFieldsWithValues = () => {
        return TbcsModelFormConfig.fields.map((field) => {
            let value = '';

            if (selectedCenter) {
                if (field.name === 'center') {
                    value = String(selectedCenter.center_id) || ''; // Pass center_id as string
                } else {
                    value = selectedCenter[field.name] ?? '';
                }
            }

            return {
                ...field,
                value,
            };
        });
    };

    const handleSelectionChange = (selectedIds: number[]) => {
        setSelectedRows(selectedIds);
    };

    const handleBulkExportCSV = () => {
        if (selectedRows.length === 0) {
            toast({
                title: "Error",
                description: "You must select at least one Record.",
                backgroundColor: "bg-red-600",
                color: "text-white",
                variant: "destructive",
            });

            return;
        }

        const selectedTbcs = tbcs.filter(user => selectedRows.includes(user.id));
        const headers = TbcsTableConfig.columns
            .filter(col => !['actions', 'status'].includes(col.key))
            .map(col => col.label);

        const rows = selectedTbcs.map(tbc =>
            TbcsTableConfig.columns
                .filter(col => !['actions', 'status'].includes(col.key))
                .map(col => {
                    const value = tbc[col.key];
                    if (Array.isArray(value)) {
                        return value.map(v => v.label || v.name || JSON.stringify(v)).join(', ');
                    }
                    if (typeof value === 'object' && value !== null) {
                        return value.label || value.name || JSON.stringify(value);
                    }
                    return value ?? '';
                })
        );

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `selected_tbcs_${selectedRows.length}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleBulkExportPDF = () => {
        if (selectedRows.length === 0) {
            toast({
                title: "Error",
                description: "You must select at least one Record.",
                backgroundColor: "bg-red-600",
                color: "text-white",
                variant: "destructive",
            });

            return;
        }

        const selectedTbcs = tbcs.filter(tbc => selectedRows.includes(tbc.id));
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        const hiddenColumnKeys = ['actions', 'status'];
        const visibleColumns = TbcsTableConfig.columns.filter(col => !hiddenColumnKeys.includes(col.key));

        const headers = [visibleColumns.map(col => col.label)];
        const rows = selectedTbcs.map(tbc =>
            visibleColumns.map(col => {
                const value = tbc[col.key];
                if (Array.isArray(value)) {
                    return value.map(v => v.label || v.name || JSON.stringify(v)).join(', ');
                }
                if (typeof value === 'object' && value !== null) {
                    return value.label || value.name || JSON.stringify(value);
                }
                return value ?? '';
            })
        );

        // Add title
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(`Selected tbcs Report (${selectedRows.length} tbcs)`, pageWidth / 2, 20, { align: 'center' });

        autoTable(doc, {
            startY: 30,
            head: headers,
            body: rows,
            styles: {
                fontSize: 10,
                cellPadding: 3,
            },
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: 255,
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245],
            },
        });

        doc.save(`selected_tbcs_${selectedRows.length}.pdf`);
    };

    // Export All Pages to CSV
    const handleExportAllCSV = async () => {
        try {
            const allTbcs = await fetchAllTbcs();

            if (allTbcs.length === 0) {
                toast({
                    title: "Error",
                    description: "You must select at least one Record.",
                    backgroundColor: "bg-red-600",
                    color: "text-white",
                    variant: "destructive",
                });

                return;
            }

            const headers = TbcsTableConfig.columns
                .filter(col => !['actions', 'status'].includes(col.key))
                .map(col => col.label);

            const rows = allTbcs.map((tbc: any) =>
                TbcsTableConfig.columns
                    .filter(col => !['actions', 'status'].includes(col.key))
                    .map(col => {
                        const value = tbc[col.key];
                        if (Array.isArray(value)) {
                            return value.map(v => v.label || v.name || JSON.stringify(v)).join(', ');
                        }
                        if (typeof value === 'object' && value !== null) {
                            return value.label || value.name || JSON.stringify(value);
                        }
                        return value ?? '';
                    })
            );

            const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.setAttribute('download', `all_tbcs_${allTbcs.length}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast({
                title: "Success",
                description: `Exported ${allTbcs.length} tbcs to CSV.`,
                backgroundColor: "bg-green-600",
                color: "text-white",
            });
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    // Export Current Page to CSV
    const handleCurrentPageExportCSV = () => {
        if (tbcs.length === 0) {
            toast({
                title: "Error",
                description: "You must select at least one Record.",
                backgroundColor: "bg-red-600",
                color: "text-white",
                variant: "destructive",
            });

            return;
        }

        const headers = TbcsTableConfig.columns
            .filter(col => !['actions', 'status'].includes(col.key))
            .map(col => col.label);

        const rows = tbcs.map(tbc =>
            TbcsTableConfig.columns
                .filter(col => !['actions', 'status'].includes(col.key))
                .map(col => {
                    const value = tbc[col.key];
                    if (Array.isArray(value)) {
                        return value.map(v => v.label || v.name || JSON.stringify(v)).join(', ');
                    }
                    if (typeof value === 'object' && value !== null) {
                        return value.label || value.name || JSON.stringify(value);
                    }
                    return value ?? '';
                })
        );

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `tbcs_page_${pagination.current_page}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
            title: "Success",
            description: `Exported ${tbcs.length} tbcs from current page to CSV.`,
            backgroundColor: "bg-green-600",
            color: "text-white",
        });
    };

    const handleBulkExportExcel = async () => {
        if (selectedRows.length === 0) {
            toast({
                title: "Error",
                description: "You must select at least one Record.",
                backgroundColor: "bg-red-600",
                color: "text-white",
                variant: "destructive",
            });
            return;
        }

        const selectedDomains = tbcs.filter(tbc => selectedRows.includes(tbc.id));

        // Create workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Selected tbcs");

        // Auto-generate columns from object keys
        const firstRow = selectedDomains[0];
        worksheet.columns = Object.keys(firstRow).map(key => ({
            header: key,
            key,
            width: 20,
        }));

        // Add data
        selectedDomains.forEach(tbc => {
            worksheet.addRow(tbc);
        });

        // Generate and download the file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, `selected_tbcs_${selectedRows.length}.xlsx`);
    };

    const handleExportAllExcel = async () => {
        try {
            const allDomains = await fetchAllTbcs();

            if (allDomains.length === 0) {
                toast({
                    title: "Error",
                    description: "You must select at least one Record.",
                    backgroundColor: "bg-red-600",
                    color: "text-white",
                    variant: "destructive",
                });
                return;
            }

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('All Domains');

            // Auto-generate columns from first tbc object
            const firstRow = allDomains[0];
            worksheet.columns = Object.keys(firstRow).map((key) => ({
                header: key,
                key,
                width: 20,
            }));

            // Add each tbc as a row
            allDomains.forEach((tbc: any) => {
                worksheet.addRow(tbc);
            });

            // Export to file
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            saveAs(blob, `all_tbcs_${allDomains.length}.xlsx`);

            toast({
                title: "Success",
                description: `Exported ${allDomains.length} tbcs to Excel.`,
                backgroundColor: "bg-green-600",
                color: "text-white",
            });
        } catch (error) {
            console.error('Export failed:', error);
            toast({
                title: "Error",
                description: "Failed to export tbcs.",
                backgroundColor: "bg-red-600",
                color: "text-white",
                variant: "destructive",
            });
        }
    };

    const handleCurrentPageExportExcel = async () => {
        if (tbcs.length === 0) {
            toast({
                title: "Error",
                description: "You must select at least one Record.",
                backgroundColor: "bg-red-600",
                color: "text-white",
                variant: "destructive",
            });
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`Page ${pagination.current_page}`);

        // Auto-generate columns from first tbc object
        const firstRow = tbcs[0];
        worksheet.columns = Object.keys(firstRow).map((key) => ({
            header: key,
            key,
            width: 20,
        }));

        // Add data rows
        tbcs.forEach((tbc) => {
            worksheet.addRow(tbc);
        });

        // Generate Excel file and download
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        saveAs(blob, `tbcs_page_${pagination.current_page}.xlsx`);

        toast({
            title: "Success",
            description: `Exported ${tbcs.length} tbcs from current page to Excel.`,
            backgroundColor: "bg-green-600",
            color: "text-white",
        });
    };

    // Export All Pages to PDF
    const handleExportAllPDF = async () => {
        try {
            const allTbcs = await fetchAllTbcs();

            if (allTbcs.length === 0) {
                toast({
                    title: "Error",
                    description: "You must select at least one Record.",
                    backgroundColor: "bg-red-600",
                    color: "text-white",
                    variant: "destructive",
                });

                return;
            }

            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();

            const hiddenColumnKeys = ['actions', 'status'];
            const visibleColumns = TbcsTableConfig.columns.filter(col => !hiddenColumnKeys.includes(col.key));

            const headers = [visibleColumns.map(col => col.label)];
            const rows = allTbcs.map((tbc: any) =>
                visibleColumns.map(col => {
                    const value = tbc[col.key];
                    if (Array.isArray(value)) {
                        return value.map(v => v.label || v.name || JSON.stringify(v)).join(', ');
                    }
                    if (typeof value === 'object' && value !== null) {
                        return value.label || value.name || JSON.stringify(value);
                    }
                    return value ?? '';
                })
            );

            // Add title
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text(`All Tbcs Report (${allTbcs.length} tbcs)`, pageWidth / 2, 20, { align: 'center' });

            autoTable(doc, {
                startY: 30,
                head: headers,
                body: rows,
                styles: {
                    fontSize: 10,
                    cellPadding: 3,
                },
                headStyles: {
                    fillColor: [41, 128, 185],
                    textColor: 255,
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245],
                },
            });

            doc.save(`all_tbcs_${allTbcs.length}.pdf`);

            toast({
                title: "Success",
                description: `Exported ${allTbcs.length} tbcs to PDF.`,
                backgroundColor: "bg-green-600",
                color: "text-white",
            });
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    // Export Current Page to PDF
    const handleCurrentPageExportPDF = () => {
        if (tbcs.length === 0) {
            toast({
                title: "Error",
                description: "You must select at least one Record.",
                backgroundColor: "bg-red-600",
                color: "text-white",
                variant: "destructive",
            });

            return;
        }

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        const hiddenColumnKeys = ['actions', 'status'];
        const visibleColumns = TbcsTableConfig.columns.filter(col => !hiddenColumnKeys.includes(col.key));

        const headers = [visibleColumns.map(col => col.label)];
        const rows = tbcs.map(tbc =>
            visibleColumns.map(col => {
                const value = tbc[col.key];
                if (Array.isArray(value)) {
                    return value.map(v => v.label || v.name || JSON.stringify(v)).join(', ');
                }
                if (typeof value === 'object' && value !== null) {
                    return value.label || value.name || JSON.stringify(value);
                }
                return value ?? '';
            })
        );

        // Add title
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(`Tbcs Report - Page ${pagination.current_page} (${tbcs.length} tbcs)`, pageWidth / 2, 20, { align: 'center' });

        autoTable(doc, {
            startY: 30,
            head: headers,
            body: rows,
            styles: {
                fontSize: 10,
                cellPadding: 3,
            },
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: 255,
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245],
            },
        });

        doc.save(`tbcs_page_${pagination.current_page}.pdf`);

        toast({
            title: "Success",
            description: `Exported ${tbcs.length} tbcs from current page to PDF.`,
            backgroundColor: "bg-green-600",
            color: "text-white",
        });
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'p' && canPrint) {
                event.preventDefault();
                handlePrintClick();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handlePrintClick]);

    const isReadOnly = mode === 'view';

    return (
        <Header title={'Team Based Code (TBC)'}>
            <div className="min-h-screen bg-white p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6">
                        {/* Bulk Operations Bar - Show when items are selected */}
                        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg print:hidden">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-2">
                                    <Hospital className="w-5 h-5 text-blue-600" />
                                    <span className="font-medium text-blue-800">
                                        {selectedRows.length} Team based code{selectedRows.length !== 1 ? 's' : ''} selected
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                    {/* Export Options */}
                                    {canExport && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm" className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl">
                                                    <Download className="w-4 h-4" />
                                                    Export Actions
                                                    <ChevronDown className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger className="data-[highlighted]:bg-indigo-100 data-[highlighted]:text-black">
                                                        Export to CSV
                                                    </DropdownMenuSubTrigger>
                                                    <DropdownMenuSubContent>
                                                        <DropdownMenuItem className="data-[highlighted]:bg-indigo-100 data-[highlighted]:text-black" onClick={handleExportAllCSV}>
                                                            All Pages
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="data-[highlighted]:bg-indigo-100 data-[highlighted]:text-black" onClick={handleCurrentPageExportCSV}>
                                                            Current Page
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="data-[highlighted]:bg-indigo-100 data-[highlighted]:text-black" onClick={handleBulkExportCSV}>
                                                            Selected Tbc{selectedRows.length !== 1 ? 's' : ''}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuSub>
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger className="data-[highlighted]:bg-indigo-100 data-[highlighted]:text-black">
                                                        Export to Excel
                                                    </DropdownMenuSubTrigger>
                                                    <DropdownMenuSubContent>
                                                        <DropdownMenuItem className="data-[highlighted]:bg-indigo-100 data-[highlighted]:text-black" onClick={handleExportAllExcel}>
                                                            All Pages
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="data-[highlighted]:bg-indigo-100 data-[highlighted]:text-black" onClick={handleCurrentPageExportExcel}>
                                                            Current Page
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="data-[highlighted]:bg-indigo-100 data-[highlighted]:text-black" onClick={handleBulkExportExcel}>
                                                            Selected Tbc{selectedRows.length !== 1 ? 's' : ''}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuSub>
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger className="data-[highlighted]:bg-indigo-100 data-[highlighted]:text-black">
                                                        Export to PDF
                                                    </DropdownMenuSubTrigger>
                                                    <DropdownMenuSubContent>
                                                        <DropdownMenuItem className="data-[highlighted]:bg-indigo-100 data-[highlighted]:text-black" onClick={handleExportAllPDF}>
                                                            All Pages
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="data-[highlighted]:bg-indigo-100 data-[highlighted]:text-black" onClick={handleCurrentPageExportPDF}>
                                                            Current Page
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="data-[highlighted]:bg-indigo-100 data-[highlighted]:text-black" onClick={handleBulkExportPDF}>
                                                            Selected Tbc{selectedRows.length !== 1 ? 's' : ''}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuSub>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}

                                    {/* Export / Import Controls - Hidden in print */}
                                    {canImport && (
                                        <Button size="sm" variant="outline" onClick={() => isImportOpen ? setIsImportOpen(false) : setIsImportOpen(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl">
                                            <Upload className="w-4 h-4" />
                                            Import
                                        </Button>
                                    )}

                                    {/* The print button is now directly in this component */}
                                    {canPrint && (
                                        <Button
                                            onClick={handlePrintClick}
                                            size="sm" variant="outline"
                                            disabled={isLoadingAll}
                                            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 
                                                    hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl"
                                        >
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <Printer className="w-4 h-4" />
                                                {isLoadingAll ? 'Printing...' : 'Print'}
                                            </label>
                                        </Button>
                                    )}

                                    {/* Clear Selection */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedRows([])}
                                        className="text-gray-600 hover:text-gray-800"
                                    >
                                        Clear Selection
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Import Section - Show above search and add button */}
                        {isImportOpen && (
                            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg print:hidden">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-2">
                                        <Upload className="w-5 h-5 text-green-600" />
                                        <span className="font-medium text-green-800">
                                            Import Team Based Code
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 flex-wrap">
                                        {/* Download Template */}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleDownloadTemplate}
                                            className="flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-50 hover:text-black"
                                        >
                                            <FileText className="w-4 h-4" />
                                            Download Template
                                        </Button>

                                        {/* Import File */}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                            className="border-green-300 text-green-700 hover:bg-green-50 hover:text-black"
                                            disabled={isImporting}
                                        >
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <Upload className="w-4 h-4" />
                                                {isImporting ? 'Importing...' : 'Import File'}
                                                <input
                                                    type="file"
                                                    accept=".csv,.xlsx,.xls"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            handleImport(file);
                                                        }
                                                        // Reset input value to allow re-uploading the same file
                                                        e.target.value = '';
                                                    }}
                                                    disabled={isImporting}
                                                />
                                            </label>
                                        </Button>
                                    </div>
                                </div>
                                <div className="mt-2 text-sm text-green-600">
                                    Upload CSV or Excel files with columns: code, center_id (optional)
                                </div>
                            </div>
                        )}

                        {/* Search + Add Button */}
                        <div className="mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="relative w-full max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4" />
                                <Input
                                    type="text"
                                    placeholder="Search..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        fetchTbcs(1, pagination.per_page, e.target.value, sortBy, sortDir);
                                    }}
                                    className="pl-10 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                                />
                            </div>
                            <CustomModelForm
                                addButton={TbcsModelFormConfig.addButton}
                                title={mode === 'view' ? 'View Team Based Code' : mode === 'edit' ? 'Update Team Based Code' : TbcsModelFormConfig.title}
                                description={TbcsModelFormConfig.description}
                                fields={getFormFieldsWithValues()}
                                buttons={TbcsModelFormConfig.buttons}
                                onSubmit={async (data, setErrors) => {
                                    try {
                                        await TbcsModelFormConfig.onSubmit(data, mode, selectedCenter?.id, setErrors);
                                        await fetchTbcs();
                                        await refresh();
                                        closeModel();
                                    } catch (error) {
                                        console.error("Submission failed", error);
                                    }
                                }}
                                open={modelOpen}
                                onOpenChange={handleModelToggle}
                                readOnly={isReadOnly}
                                mode={mode}
                                extraData={{ center }}
                            />
                        </div>

                        {/* Printable Layout */}
                        <div ref={printRef} className="hidden print:block">

                            {/* Header with Logo and Title */}
                            <div className="flex justify-between items-center border-b pb-4 mb-4">
                                <img src="/images/logo-right.png" alt="Logo" className="h-16" />
                                <div className="text-center w-full -ml-16">
                                    <h1 className="text-2xl font-bold">Team Based Code Report</h1>
                                    <p className="text-sm text-gray-600">Generated on: {new Date().toLocaleString()}</p>
                                </div>
                            </div>
                            {allTbcs.length > 0 && (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse border border-gray-300">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                {TbcsTableConfig.columns
                                                    .filter(col => !['actions', 'status'].includes(col.key))
                                                    .map((column) => (
                                                        <th key={column.key} className="border border-gray-300 px-4 py-2 text-left font-semibold">
                                                            {column.label}
                                                        </th>
                                                    ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allTbcs.map((tbc, index) => (
                                                <tr key={tbc.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                    {TbcsTableConfig.columns
                                                        .filter(col => !['actions', 'status'].includes(col.key))
                                                        .map((column) => (
                                                            <td key={column.key} className="border border-gray-300 px-4 py-2">
                                                                {(() => {
                                                                    const value = tbc[column.key];
                                                                    if (Array.isArray(value)) {
                                                                        return value.map(v => v.label || v.name || JSON.stringify(v)).join(', ');
                                                                    }
                                                                    if (typeof value === 'object' && value !== null) {
                                                                        return value.label || value.name || JSON.stringify(value);
                                                                    }
                                                                    return value ?? '';
                                                                })()}
                                                            </td>
                                                        ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {allTbcs.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-gray-600">No tbcs found to display.</p>
                                </div>
                            )}

                            {/* Signature based on role (replace this logic with real auth if needed) */}
                            <div className="mt-16">
                                <p className="mb-12">Signature:</p>
                                <div className="w-48 border-t text-center pt-2"></div>
                            </div>

                            {/* Footer */}
                            <div className="print-footer hidden print:flex justify-between text-sm text-gray-600 mt-6 px-8">
                                <div>
                                    Printed by: {userName} ({userRole})
                                </div>
                                <div className="page-number" />
                            </div>
                        </div>

                        {/* Web Table (visible only on screen) */}
                        <div className="print:hidden">
                            <CustomTable
                                columns={TbcsTableConfig.columns}
                                actions={TbcsTableConfig.actions}
                                data={tbcs}
                                onDelete={handleDelete}
                                pageSize={pagination.per_page}
                                pageSizeOptions={[10, 15, 20, 50, 100]}
                                currentPage={pagination.current_page}
                                totalPages={pagination.last_page}
                                onPageChange={handlePageChange}
                                onPageSizeChange={handlePerPageChange}
                                onView={(tbc) => openModel('view', tbc)}
                                onEdit={(tbc) => openModel('edit', tbc)}
                                isModel={true}
                                sortBy={sortBy}
                                sortDir={sortDir}
                                onSortChange={handleSort}
                                enableSelection={true}
                                selectedRows={selectedRows}
                                onSelectionChange={handleSelectionChange}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Header>
    );
};

export default Domain;

