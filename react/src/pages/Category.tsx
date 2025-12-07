/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
import Header from "../components/dashboard/Header";
import CustomTable from "../components/CustomTable";
import { CategoriesTableConfig } from "../config/tables/category-table";
import api from "../axios";
import { CustomModelForm } from "../components/CustomModelForm";
import { CategoriesModelFormConfig } from "../config/forms/category-model-form";
import { toast } from "../hooks/use-toast";
import { useApp } from "../hooks/useApp";
import {
  Search,
  Download,
  ChevronDown,
  Upload,
  FileText,
  Printer,
  User,
} from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "../components/ui/dropdown-menu";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { hasPermission } from "../lib/authorization";
import { useReactToPrint } from "react-to-print";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export const Category = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [sector, setSector] = useState([]);
  const [specialty, setSpecialty] = useState([]);
  const [rank, setRank] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
  });
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [modelOpen, setModelOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "view" | "edit" | "assign">(
    "create"
  );
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  // New state for bulk operations
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Import state
  const [isImporting, setIsImporting] = useState(false);

  const { user } = useApp();

  const userName = user?.name ?? undefined;
  const userRole = user?.roles?.[0] ?? undefined;

  const userPermissions = user?.permissions ?? [];

  const canPrint = hasPermission(`print-category`, userPermissions);
  const canExport = hasPermission(`export-category`, userPermissions);
  const canImport = hasPermission(`import-category`, userPermissions);

  const printRef = useRef<HTMLDivElement>(null);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [isLoadingAll, setIsLoadingAll] = useState(false);

  // Fetch all categories data for printing - Fixed version
  const fetchAllCategoriesForPrint = async (): Promise<any[]> => {
    try {
      const res = await api.get(`/api/categories`, {
        params: {
          page: 1,
          per_page: -1, // Use -1 to get all records as per backend fix
          search: search,
          sort_by: sortBy,
          sort_dir: sortDir,
        },
      });

      const fetchedCategories = res.data.categories.data;
      return fetchedCategories;
    } catch (error) {
      console.error("Failed to fetch all categories:", error);
      toast({
        title: "Error",
        description: "Failed to fetch all categories data.",
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
      // Fetch all categories and wait for the result
      const fetchedCategories = await fetchAllCategoriesForPrint();

      if (fetchedCategories.length === 0) {
        toast({
          title: "Warning",
          description: "No categories found to print.",
          backgroundColor: "bg-yellow-600",
          color: "text-white",
        });
        return;
      }

      // Update state with fetched categories
      setAllCategories(fetchedCategories);

      // Wait for state to update and component to re-render
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(undefined);
        }, 500); // Increased delay to ensure state update
      });

      // Now trigger the print
      if (!printRef.current) alert("Ref is null!");
      handlePrint();
    } catch (error) {
      console.error("Print preparation failed:", error);
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
    documentTitle: "All Categories Report",
    onAfterPrint: () => {
      // Clear the allCategories state after printing to free up memory
      setAllCategories([]);
    },
  });

  // Enhanced import handler
  const handleImport = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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
      formData.append("file", file);

      const response = await api.post("/api/categories/import", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const result = response.data;

      // Show success message with statistics
      let message = `Import completed! ${result.imported_count} categories imported successfully.`;
      if (result.skipped_count > 0) {
        message += ` ${result.skipped_count} categories were skipped.`;
      }

      toast({
        title: "Import Successful",
        description: message,
        backgroundColor: "bg-green-600",
        color: "text-white",
      });

      // Show warnings if any
      if (result.warnings && result.warnings.length > 0) {
        console.warn("Import warnings:", result.warnings);
        // You could show these in a modal or additional toast
        toast({
          title: "Import Warnings",
          description: `${result.warnings.length} warnings occurred. Check console for details.`,
          backgroundColor: "bg-yellow-600",
          color: "text-white",
        });
      }

      // Refresh the categories list
      await fetchCategories();
    } catch (error: any) {
      console.error("Import failed:", error);

      let errorMessage =
        "Failed to import categories. Please check your file format and try again.";
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
      const response = await api.get("/api/categories/download-template", {
        responseType: "blob",
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "categories_import_template.xlsx");
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
      console.error("Template download failed:", error);
      toast({
        title: "Error",
        description: "Failed to download template.",
        backgroundColor: "bg-red-600",
        color: "text-white",
        variant: "destructive",
      });
    }
  };

  const fetchCategories = async (
    page = 1,
    perPage = 10,
    searchValue = "",
    sortColumn = "created_at",
    sortDirection: "asc" | "desc" = "desc"
  ) => {
    try {
      const res = await api.get(`/api/categories`, {
        params: {
          page,
          per_page: perPage,
          search: searchValue,
          sort_by: sortColumn,
          sort_dir: sortDirection,
        },
      });

      const categoryData = res.data.categories;

      setCategories(categoryData.data);
      setSector(res.data.sectors);
      setSpecialty(res.data.specialties);
      setRank(res.data.ranks);

      setPagination({
        current_page: categoryData.current_page,
        last_page: categoryData.last_page,
        per_page: categoryData.per_page,
      });
    } catch {
      console.error("Something went wrong");
    }
  };

  // Fetch all specialtys data for export
  const fetchAllCategories = async () => {
    try {
      const res = await api.get(`/api/categories`, {
        params: {
          page: 1,
          per_page: 10000, // Large number to get all records
          search: search,
          sort_by: sortBy,
          sort_dir: sortDir,
        },
      });

      setAllCategories(res.data.categories.data);

      return res.data.categories.data;
    } catch (error) {
      console.error("Failed to fetch all categories:", error);
      toast({
        title: "Error",
        description: "Failed to fetch all categories data.",
        backgroundColor: "bg-red-600",
        color: "text-white",
        variant: "destructive",
      });
      return [];
    }
  };

  useEffect(() => {
    fetchCategories(
      pagination.current_page,
      pagination.per_page,
      search,
      sortBy,
      sortDir
    );
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.last_page) return;
    fetchCategories(newPage, pagination.per_page, search, sortBy, sortDir);
  };

  const handlePerPageChange = (newPerPage: number) => {
    fetchCategories(1, newPerPage, search, sortBy, sortDir);
  };

  const handleSort = (column: string) => {
    const newDir = sortBy === column && sortDir === "asc" ? "desc" : "asc";
    setSortBy(column);
    setSortDir(newDir);
    fetchCategories(
      pagination.current_page,
      pagination.per_page,
      search,
      column,
      newDir
    );
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this item?"
    );
    if (!confirmed) return;

    try {
      const response = await api.delete(`/api/categories/delete/${id}`);
      toast({
        title: "Deleted",
        description: response.data?.message || "Category deleted successfully.",
        backgroundColor: "bg-green-600",
        color: "text-white",
      });
      await fetchCategories(); // refresh the data
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete the category.",
        backgroundColor: "bg-red-600",
        color: "text-white",
        variant: "destructive",
      });
    }
  };

  const closeModel = () => {
    setMode("create");
    setSelectedCategory(null);
    setModelOpen(false);
  };

  const handleModelToggle = (open: boolean) => {
    setModelOpen(open);
    if (!open) {
      closeModel();
    }
  };

  const openModel = (
    mode: "create" | "view" | "edit" | "assign",
    category?: any
  ) => {
    setMode(mode);
    setSelectedCategory(category || null);
    setModelOpen(true);
  };

  const getFormFieldsWithValues = () => {
    return CategoriesModelFormConfig.fields.map((field) => {
      let value = "";

      if (selectedCategory) {
        if (field.name === "sector") {
          value = String(selectedCategory.sector_id || "");
        } else if (field.name === "specialty") {
          value = String(selectedCategory.specialty_id || "");
        } else if (field.name === "rank") {
          value = String(selectedCategory.rank_id || "");
        } else {
          value = selectedCategory[field.name] ?? "";
        }
      }

      return {
        ...field,
        value,
      };
    });
  };

  // Bulk operations handlers
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

    const selectedCategories = categories.filter((category) =>
      selectedRows.includes(category.id)
    );
    const headers = CategoriesTableConfig.columns
      .filter((col) => !["actions", "status"].includes(col.key))
      .map((col) => col.label);

    const rows = selectedCategories.map((category) =>
      CategoriesTableConfig.columns
        .filter((col) => !["actions", "status"].includes(col.key))
        .map((col) => {
          const value = category[col.key];
          if (Array.isArray(value)) {
            return value
              .map((v) => v.label || v.name || JSON.stringify(v))
              .join(", ");
          }
          if (typeof value === "object" && value !== null) {
            return value.label || value.name || JSON.stringify(value);
          }
          return value ?? "";
        })
    );

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute(
      "download",
      `selected_categories_${selectedRows.length}.csv`
    );
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

    const selectedCategories = categories.filter((category) =>
      selectedRows.includes(category.id)
    );
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    const hiddenColumnKeys = ["actions", "status"];
    const visibleColumns = CategoriesTableConfig.columns.filter(
      (col) => !hiddenColumnKeys.includes(col.key)
    );

    const headers = [visibleColumns.map((col) => col.label)];
    const rows = selectedCategories.map((category) =>
      visibleColumns.map((col) => {
        const value = category[col.key];
        if (Array.isArray(value)) {
          return value
            .map((v) => v.label || v.name || JSON.stringify(v))
            .join(", ");
        }
        if (typeof value === "object" && value !== null) {
          return value.label || value.name || JSON.stringify(value);
        }
        return value ?? "";
      })
    );

    // Add title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Selected Categories Report (${selectedRows.length} categories)`,
      pageWidth / 2,
      20,
      { align: "center" }
    );

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

    doc.save(`selected_categories_${selectedRows.length}.pdf`);
  };

  // Export All Pages to CSV
  const handleExportAllCSV = async () => {
    try {
      const allCategories = await fetchAllCategories();
      if (allCategories.length === 0) {
        toast({
          title: "Error",
          description: "Table is empty.",
          backgroundColor: "bg-red-600",
          color: "text-white",
          variant: "destructive",
        });

        return;
      }

      const headers = CategoriesTableConfig.columns
        .filter((col) => !["actions", "status"].includes(col.key))
        .map((col) => col.label);

      const rows = allCategories.map((category: any) =>
        CategoriesTableConfig.columns
          .filter((col) => !["actions", "status"].includes(col.key))
          .map((col) => {
            const value = category[col.key];
            if (Array.isArray(value)) {
              return value
                .map((v) => v.label || v.name || JSON.stringify(v))
                .join(", ");
            }
            if (typeof value === "object" && value !== null) {
              return value.label || value.name || JSON.stringify(value);
            }
            return value ?? "";
          })
      );

      const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute(
        "download",
        `all_categories_${allCategories.length}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: `Exported ${allCategories.length} categories to CSV.`,
        backgroundColor: "bg-green-600",
        color: "text-white",
      });
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  // Export Current Page to CSV
  const handleCurrentPageExportCSV = () => {
    if (categories.length === 0) {
      toast({
        title: "Error",
        description: "Table is empty.",
        backgroundColor: "bg-red-600",
        color: "text-white",
        variant: "destructive",
      });

      return;
    }

    const headers = CategoriesTableConfig.columns
      .filter((col) => !["actions", "status"].includes(col.key))
      .map((col) => col.label);

    const rows = categories.map((category) =>
      CategoriesTableConfig.columns
        .filter((col) => !["actions", "status"].includes(col.key))
        .map((col) => {
          const value = category[col.key];
          if (Array.isArray(value)) {
            return value
              .map((v) => v.label || v.name || JSON.stringify(v))
              .join(", ");
          }
          if (typeof value === "object" && value !== null) {
            return value.label || value.name || JSON.stringify(value);
          }
          return value ?? "";
        })
    );

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute(
      "download",
      `categories_page_${pagination.current_page}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: `Exported ${categories.length} categories from current page to CSV.`,
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

    const selectedDomains = categories.filter((category) =>
      selectedRows.includes(category.id)
    );

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Selected categories");

    // Auto-generate columns from object keys
    const firstRow = selectedDomains[0];
    worksheet.columns = Object.keys(firstRow).map((key) => ({
      header: key,
      key,
      width: 20,
    }));

    // Add data
    selectedDomains.forEach((category) => {
      worksheet.addRow(category);
    });

    // Generate and download the file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `selected_categories_${selectedRows.length}.xlsx`);
  };

  const handleExportAllExcel = async () => {
    try {
      const allDomains = await fetchAllCategories();

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
      const worksheet = workbook.addWorksheet("All Domains");

      // Auto-generate columns from first category object
      const firstRow = allDomains[0];
      worksheet.columns = Object.keys(firstRow).map((key) => ({
        header: key,
        key,
        width: 20,
      }));

      // Add each category as a row
      allDomains.forEach((category: any) => {
        worksheet.addRow(category);
      });

      // Export to file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, `all_categories_${allDomains.length}.xlsx`);

      toast({
        title: "Success",
        description: `Exported ${allDomains.length} categories to Excel.`,
        backgroundColor: "bg-green-600",
        color: "text-white",
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Error",
        description: "Failed to export categories.",
        backgroundColor: "bg-red-600",
        color: "text-white",
        variant: "destructive",
      });
    }
  };

  const handleCurrentPageExportExcel = async () => {
    if (categories.length === 0) {
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

    // Auto-generate columns from first category object
    const firstRow = categories[0];
    worksheet.columns = Object.keys(firstRow).map((key) => ({
      header: key,
      key,
      width: 20,
    }));

    // Add data rows
    categories.forEach((category) => {
      worksheet.addRow(category);
    });

    // Generate Excel file and download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `categories_page_${pagination.current_page}.xlsx`);

    toast({
      title: "Success",
      description: `Exported ${categories.length} categories from current page to Excel.`,
      backgroundColor: "bg-green-600",
      color: "text-white",
    });
  };

  // Export All Pages to PDF
  const handleExportAllPDF = async () => {
    try {
      const allCategories = await fetchAllCategories();
      if (allCategories.length === 0) {
        toast({
          title: "Error",
          description: "Table is empty.",
          backgroundColor: "bg-red-600",
          color: "text-white",
          variant: "destructive",
        });

        return;
      }

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      const hiddenColumnKeys = ["actions", "status"];
      const visibleColumns = CategoriesTableConfig.columns.filter(
        (col) => !hiddenColumnKeys.includes(col.key)
      );

      const headers = [visibleColumns.map((col) => col.label)];
      const rows = allCategories.map((category: any) =>
        visibleColumns.map((col) => {
          const value = category[col.key];
          if (Array.isArray(value)) {
            return value
              .map((v) => v.label || v.name || JSON.stringify(v))
              .join(", ");
          }
          if (typeof value === "object" && value !== null) {
            return value.label || value.name || JSON.stringify(value);
          }
          return value ?? "";
        })
      );

      // Add title
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(
        `All Categories Report (${allCategories.length} categories)`,
        pageWidth / 2,
        20,
        { align: "center" }
      );

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

      doc.save(`all_categories_${allCategories.length}.pdf`);

      toast({
        title: "Success",
        description: `Exported ${allCategories.length} categories to PDF.`,
        backgroundColor: "bg-green-600",
        color: "text-white",
      });
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  // Export Current Page to PDF
  const handleCurrentPageExportPDF = () => {
    if (categories.length === 0) {
      toast({
        title: "Error",
        description: "Table is empty.",
        backgroundColor: "bg-red-600",
        color: "text-white",
        variant: "destructive",
      });

      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    const hiddenColumnKeys = ["actions", "status"];
    const visibleColumns = CategoriesTableConfig.columns.filter(
      (col) => !hiddenColumnKeys.includes(col.key)
    );

    const headers = [visibleColumns.map((col) => col.label)];
    const rows = categories.map((category) =>
      visibleColumns.map((col) => {
        const value = category[col.key];
        if (Array.isArray(value)) {
          return value
            .map((v) => v.label || v.name || JSON.stringify(v))
            .join(", ");
        }
        if (typeof value === "object" && value !== null) {
          return value.label || value.name || JSON.stringify(value);
        }
        return value ?? "";
      })
    );

    // Add title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Categories Report - Page ${pagination.current_page} (${categories.length} categories)`,
      pageWidth / 2,
      20,
      { align: "center" }
    );

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

    doc.save(`categories_page_${pagination.current_page}.pdf`);

    toast({
      title: "Success",
      description: `Exported ${categories.length} categories from current page to PDF.`,
      backgroundColor: "bg-green-600",
      color: "text-white",
    });
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "p" && canPrint) {
        event.preventDefault();
        handlePrintClick();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handlePrintClick]);

  const isReadOnly = mode === "view";

  return (
    <Header title={"Saudi Health Council Categories"}>
      <div className="min-h-screen bg-white p-6 print:bg-white print:p-12 print:text-black">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            {/* Bulk Operations Bar - Show when items are selected */}
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg print:hidden">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-800">
                    {selectedRows.length} categorie
                    {selectedRows.length !== 1 ? "s" : ""} selected
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Export Options */}
                  {canExport && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl"
                        >
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
                            <DropdownMenuItem
                              className="data-[highlighted]:bg-indigo-100 data-[highlighted]:text-black"
                              onClick={handleExportAllCSV}
                            >
                              All Pages
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="data-[highlighted]:bg-indigo-100 data-[highlighted]:text-black"
                              onClick={handleCurrentPageExportCSV}
                            >
                              Current Page
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="data-[highlighted]:bg-indigo-100 data-[highlighted]:text-black"
                              onClick={handleBulkExportCSV}
                            >
                              Selected Category
                              {selectedRows.length !== 1 ? "s" : ""}
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger className="data-[highlighted]:bg-indigo-100 data-[highlighted]:text-black">
                            Export to Excel
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem
                              className="data-[highlighted]:bg-indigo-100 data-[highlighted]:text-black"
                              onClick={handleExportAllExcel}
                            >
                              All Pages
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="data-[highlighted]:bg-indigo-100 data-[highlighted]:text-black"
                              onClick={handleCurrentPageExportExcel}
                            >
                              Current Page
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="data-[highlighted]:bg-indigo-100 data-[highlighted]:text-black"
                              onClick={handleBulkExportExcel}
                            >
                              Selected Category
                              {selectedRows.length !== 1 ? "s" : ""}
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger className="data-[highlighted]:bg-indigo-100 data-[highlighted]:text-black">
                            Export to PDF
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem
                              className="data-[highlighted]:bg-indigo-100 data-[highlighted]:text-black"
                              onClick={handleExportAllPDF}
                            >
                              All Pages
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="data-[highlighted]:bg-indigo-100 data-[highlighted]:text-black"
                              onClick={handleCurrentPageExportPDF}
                            >
                              Current Page
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="data-[highlighted]:bg-indigo-100 data-[highlighted]:text-black"
                              onClick={handleBulkExportPDF}
                            >
                              Selected Category
                              {selectedRows.length !== 1 ? "s" : ""}
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  {/* Export / Import Controls - Hidden in print */}
                  {canImport && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        isImportOpen
                          ? setIsImportOpen(false)
                          : setIsImportOpen(true)
                      }
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl"
                    >
                      <Upload className="w-4 h-4" />
                      Import
                    </Button>
                  )}

                  {/* The print button is now directly in this component */}
                  {canPrint && (
                    <Button
                      onClick={handlePrintClick}
                      size="sm"
                      variant="outline"
                      disabled={isLoadingAll}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 
                                                    hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl"
                    >
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Printer className="w-4 h-4" />
                        {isLoadingAll ? "Printing..." : "Print"}
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
                      Import Categories
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
                        {isImporting ? "Importing..." : "Import File"}
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
                            e.target.value = "";
                          }}
                          disabled={isImporting}
                        />
                      </label>
                    </Button>
                  </div>
                </div>
                <div className="mt-2 text-sm text-green-600">
                  Upload CSV or Excel files with columns: name, email, password,
                  specialty_id (optional), mobile (optional), sectors
                  (comma-separated)
                </div>
              </div>
            )}

            {/* Search & Form - Hidden in print */}
            <div className="mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:hidden">
              {/* Search Input on the Left */}
              <div className="relative w-full max-w-md md:flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    fetchCategories(
                      1,
                      pagination.per_page,
                      e.target.value,
                      sortBy,
                      sortDir
                    );
                  }}
                  className="pl-10 border-blue-200 focus:border-blue-400 focus:ring-blue-400 w-full"
                />
              </div>

              {/* Buttons on the Right */}
              <div className="flex flex-wrap items-center gap-2">
                <CustomModelForm
                  addButton={CategoriesModelFormConfig.addButton}
                  title={
                    mode === "view"
                      ? "View Category"
                      : mode === "edit"
                      ? "Update Category"
                      : CategoriesModelFormConfig.title
                  }
                  description={CategoriesModelFormConfig.description}
                  fields={getFormFieldsWithValues()}
                  buttons={CategoriesModelFormConfig.buttons}
                  onSubmit={async (data, setErrors) => {
                    try {
                      await CategoriesModelFormConfig.onSubmit(
                        data,
                        mode,
                        selectedCategory?.id,
                        setErrors
                      );
                      await fetchCategories();
                      closeModel();
                    } catch (error) {
                      console.error("Submission failed", error);
                    }
                  }}
                  open={modelOpen}
                  onOpenChange={handleModelToggle}
                  readOnly={isReadOnly}
                  mode={mode}
                  extraData={{ sector, specialty, rank }}
                />
              </div>
            </div>

            {/* Printable Layout */}
            <div ref={printRef} className="hidden print:block">
              {/* Header with Logo and Title */}
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <img src="/images/logo-right.png" alt="Logo" className="h-16" />
                <div className="text-center w-full -ml-16">
                  <h1 className="text-2xl font-bold">Category Report</h1>
                  <p className="text-sm text-gray-600">
                    Generated on: {new Date().toLocaleString()}
                  </p>
                </div>
              </div>
              {allCategories.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        {CategoriesTableConfig.columns
                          .filter(
                            (col) => !["actions", "status"].includes(col.key)
                          )
                          .map((column) => (
                            <th
                              key={column.key}
                              className="border border-gray-300 px-4 py-2 text-left font-semibold"
                            >
                              {column.label}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {allCategories.map((category, index) => (
                        <tr
                          key={category.id}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }
                        >
                          {CategoriesTableConfig.columns
                            .filter(
                              (col) => !["actions", "status"].includes(col.key)
                            )
                            .map((column) => (
                              <td
                                key={column.key}
                                className="border border-gray-300 px-4 py-2"
                              >
                                {(() => {
                                  const value = category[column.key];
                                  if (Array.isArray(value)) {
                                    return value
                                      .map(
                                        (v) =>
                                          v.label || v.name || JSON.stringify(v)
                                      )
                                      .join(", ");
                                  }
                                  if (
                                    typeof value === "object" &&
                                    value !== null
                                  ) {
                                    return (
                                      value.label ||
                                      value.name ||
                                      JSON.stringify(value)
                                    );
                                  }
                                  return value ?? "";
                                })()}
                              </td>
                            ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {allCategories.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    No categories found to display.
                  </p>
                </div>
              )}

              {/* Signature based on sector (replace this logic with real auth if needed) */}
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
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 overflow-hidden">
              <CustomTable
                columns={CategoriesTableConfig.columns}
                actions={CategoriesTableConfig.actions}
                data={categories}
                onDelete={handleDelete}
                pageSize={pagination.per_page}
                pageSizeOptions={[10, 15, 20, 50, 100]}
                currentPage={pagination.current_page}
                totalPages={pagination.last_page}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePerPageChange}
                onView={(category) => openModel("view", category)}
                onEdit={(category) => openModel("edit", category)}
                onAssign={(category) => openModel("assign", category)}
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
