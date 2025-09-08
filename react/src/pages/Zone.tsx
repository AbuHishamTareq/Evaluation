/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import Header from '../components/dashboard/Header';
import CustomTable from '../components/CustomTable';
import { ZonesTableConfig } from '../config/tables/zone-table';
import api from '../axios';
import { CustomModelForm } from '../components/CustomModelForm';
import { ZonesModelFormConfig } from '../config/forms/zone-model-form';
import { toast } from '../hooks/use-toast';
import { useApp } from '../hooks/useApp';
import { Search } from 'lucide-react';
import { Input } from '../components/ui/input';

const Zones = () => {
    const [zones, setZones] = useState([]);
    const [elt, setElt] = useState([]);
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
    const [selectedZone, setSelectedZone] = useState<any>(null);
    const { refresh } = useApp();

    const fetchZones = async (
        page = 1,
        perPage = 10,
        searchValue = '',
        sortColumn = 'created_at',
        sortDirection: 'asc' | 'desc' = 'desc'
    ) => {
        try {
            const res = await api.get(`/api/zones`, {
                params: {
                    page,
                    per_page: perPage,
                    search: searchValue,
                    sort_by: sortColumn,
                    sort_dir: sortDirection,
                },
            });

            const zoneData = res.data.zones;
            setZones(zoneData.data);
            setElt(res.data.elts);

            setPagination({
                current_page: zoneData.meta?.current_page,
                last_page: zoneData.meta?.last_page,
                per_page: zoneData.meta?.per_page,
            });
        } catch {
            console.error('Something went wrong');
        }
    };

    useEffect(() => {
        fetchZones(
            pagination.current_page,
            pagination.per_page,
            search,
            sortBy,
            sortDir
        );
    }, []);

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > pagination.last_page) return;
        fetchZones(newPage, pagination.per_page, search, sortBy, sortDir);
    };

    const handlePerPageChange = (newPerPage: number) => {
        fetchZones(1, newPerPage, search, sortBy, sortDir);
    };

    const handleSort = (column: string) => {
        const newDir = sortBy === column && sortDir === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortDir(newDir);
        fetchZones(pagination.current_page, pagination.per_page, search, column, newDir);
    };

    const handleDelete = async (id: number) => {
        const confirmed = window.confirm("Are you sure you want to delete this item?");
        if (!confirmed) return;

        try {
            const response = await api.delete(`/api/zones/delete/${id}`);
            toast({
                title: "Deleted",
                description: response.data?.message || "Zone deleted successfully.",
                backgroundColor: "bg-green-600",
                color: "text-white",
            });
            await fetchZones(); // refresh the data
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to delete the zone.",
                backgroundColor: "bg-red-600",
                color: "text-white",
                variant: "destructive",
            });
        }
    };

    const closeModel = () => {
        setMode('create');
        setSelectedZone(null);
        setModelOpen(false);
    };

    const handleModelToggle = (open: boolean) => {
        setModelOpen(open);
        if (!open) {
            closeModel();
        }
    };

    const openModel = (mode: 'create' | 'view' | 'edit', zone?: any) => {
        setMode(mode);
        setSelectedZone(zone || null);
        setModelOpen(true);
    };

    const getFormFieldsWithValues = () => {
        return ZonesModelFormConfig.fields.map((field) => {
            let value = '';

            if (selectedZone) {
                if (field.name === 'elt') {
                    value = String(selectedZone.elt_id) || ''; // Pass elt_id as string
                } else {
                    value = selectedZone[field.name] ?? '';
                }
            }

            return {
                ...field,
                value,
            };
        });
    };

    const isReadOnly = mode === 'view';

    return (
        <Header title={'Zones'}>
            <div className="min-h-screen bg-white p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6">
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
                                        fetchZones(1, pagination.per_page, e.target.value, sortBy, sortDir);
                                    }}
                                    className="pl-10 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                                />
                            </div>
                            <CustomModelForm
                                addButton={ZonesModelFormConfig.addButton}
                                title={mode === 'view' ? 'View Zone' : mode === 'edit' ? 'Update Zone' : ZonesModelFormConfig.title}
                                description={ZonesModelFormConfig.description}
                                fields={getFormFieldsWithValues()}
                                buttons={ZonesModelFormConfig.buttons}
                                onSubmit={async (data, setErrors) => {
                                    try {
                                        await ZonesModelFormConfig.onSubmit(data, mode, selectedZone?.id, setErrors);
                                        await fetchZones();
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
                                extraData={{ elt }}
                            />
                        </div>

                        {/* Table */}
                        <CustomTable
                            columns={ZonesTableConfig.columns}
                            actions={ZonesTableConfig.actions}
                            data={zones}
                            onDelete={handleDelete}
                            pageSize={pagination.per_page}
                            pageSizeOptions={[10, 15, 20, 50, 100]}
                            currentPage={pagination.current_page}
                            totalPages={pagination.last_page}
                            onPageChange={handlePageChange}
                            onPageSizeChange={handlePerPageChange}
                            onView={(zone) => openModel('view', zone)}
                            onEdit={(zone) => openModel('edit', zone)}
                            isModel={true}
                            sortBy={sortBy}
                            sortDir={sortDir}
                            onSortChange={handleSort}
                        />
                    </div>
                </div>
            </div>
        </Header>
    );
};

export default Zones;