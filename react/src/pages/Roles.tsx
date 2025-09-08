/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import Header from '../components/dashboard/Header';
import CustomTable from '../components/CustomTable';
import { RolesTableConfig } from '../config/tables/role-table';
import api from '../axios';
import { CustomModelForm } from '../components/CustomModelForm';
import { RoleModelFormConfig } from '../config/forms/role-model-form';
import { toast } from '../hooks/use-toast';
import { useApp } from '../hooks/useApp';
import type { ExtraDataProps } from '../types/types';
import { Search } from 'lucide-react';
import { Input } from '../components/ui/input';

const Roles = () => {
    const [roles, setRoles] = useState([]);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
    });
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [permissions, setPermissions] = useState<ExtraDataProps>();
    const [modelOpen, setModelOpen] = useState(false);
    const [mode, setMode] = useState<'create' | 'view' | 'edit'>('create');
    const [selectedRole, setSelectedRole] = useState<any>(null);
    const { refresh } = useApp();

    const fetchRoles = async (
        page = 1,
        perPage = 10,
        searchValue = '',
        sortColumn = 'created_at',
        sortDirection: 'asc' | 'desc' = 'desc'
    ) => {
        try {
            const res = await api.get(`/api/roles`, {
                params: {
                    page,
                    per_page: perPage,
                    search: searchValue,
                    sort_by: sortColumn,
                    sort_dir: sortDirection,
                },
            });

            const roleData = res.data.roles;

            setRoles(roleData.data);
            setPermissions(res.data.permissions);

            setPagination({
                current_page: roleData.current_page,
                last_page: roleData.last_page,
                per_page: roleData.per_page,
            });
        } catch {
            console.error('Something went wrong');
        }
    };

    useEffect(() => {
        fetchRoles(
            pagination.current_page,
            pagination.per_page,
            search,
            sortBy,
            sortDir
        );
    }, []);

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > pagination.last_page) return;
        fetchRoles(newPage, pagination.per_page, search, sortBy, sortDir);
    };

    const handlePerPageChange = (newPerPage: number) => {
        fetchRoles(1, newPerPage, search, sortBy, sortDir);
    };

    const handleSort = (column: string) => {
        const newDir = sortBy === column && sortDir === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortDir(newDir);
        fetchRoles(pagination.current_page, pagination.per_page, search, column, newDir);
    };

    const handleDelete = async (id: number) => {
        const confirmed = window.confirm("Are you sure you want to delete this item?");
        if (!confirmed) return;

        try {
            const response = await api.delete(`/api/roles/delete/${id}`);
            toast({
                title: "Deleted",
                description: response.data?.message || "Role deleted successfully.",
                backgroundColor: "bg-green-600",
                color: "text-white",
            });
            await fetchRoles(); // refresh the data
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to delete the role.",
                backgroundColor: "bg-red-600",
                color: "text-white",
                variant: "destructive",
            });
        }
    };

    const closeModel = () => {
        setMode('create');
        setSelectedRole(null);
        setModelOpen(false);
    };

    const handleModelToggle = (open: boolean) => {
        setModelOpen(open);
        if (!open) {
            closeModel();
        }
    };

    const openModel = (mode: 'create' | 'view' | 'edit', role?: any) => {
        setMode(mode);
        setSelectedRole(role || null);
        setModelOpen(true);
    };

    const getFormFieldsWithValues = () => {
        return RoleModelFormConfig.fields.map(field => {
            let value = selectedRole ? selectedRole[field.name] ?? '' : '';

            if (field.name === 'permissions' && Array.isArray(value)) {
                value = value.map((perm: any) => perm.name);
            }

            return {
                ...field,
                value,
            };
        });
    };

    const isReadOnly = mode === 'view';

    return (
        <Header title={'Roles'}>
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
                                        fetchRoles(1, pagination.per_page, e.target.value, sortBy, sortDir);
                                    }}
                                    className="pl-10 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                                />
                            </div>
                            <CustomModelForm
                                addButton={RoleModelFormConfig.addButton}
                                title={mode === 'view' ? 'View Role' : mode === 'edit' ? 'Update Role' : RoleModelFormConfig.title}
                                description={RoleModelFormConfig.description}
                                fields={getFormFieldsWithValues()}
                                buttons={RoleModelFormConfig.buttons}
                                onSubmit={async (data, setErrors) => {
                                    try {
                                        await RoleModelFormConfig.onSubmit(data, mode, selectedRole?.id, setErrors);
                                        await fetchRoles();
                                        refresh();
                                        closeModel();
                                    } catch (error) {
                                        console.error("Submission failed", error);
                                    }
                                }}
                                open={modelOpen}
                                onOpenChange={handleModelToggle}
                                readOnly={isReadOnly}
                                mode={mode}
                                extraData={permissions}
                            />
                        </div>

                        {/* Table */}
                        <CustomTable
                            columns={RolesTableConfig.columns}
                            actions={RolesTableConfig.actions}
                            data={roles}
                            onDelete={handleDelete}
                            pageSize={pagination.per_page}
                            pageSizeOptions={[10, 15, 20, 50, 100]}
                            currentPage={pagination.current_page}
                            totalPages={pagination.last_page}
                            onPageChange={handlePageChange}
                            onPageSizeChange={handlePerPageChange}
                            onView={(role) => openModel('view', role)}
                            onEdit={(role) => openModel('edit', role)}
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

export default Roles;
