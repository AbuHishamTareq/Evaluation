/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import Header from '../components/dashboard/Header';
import CustomTable from '../components/CustomTable';
import { EltsTableConfig } from '../config/tables/elt-table';
import api from '../axios';
import { CustomModelForm } from '../components/CustomModelForm';
import { EltModelFormConfig } from '../config/forms/elt-model-form';
import { toast } from '../hooks/use-toast';
import { Search } from 'lucide-react';
import { Input } from '../components/ui/input';

const Elt = () => {
  const [elts, setElts] = useState<any[]>([]);
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
  const [selectedElt, setSelectedElt] = useState<any>(null);

  const fetchElts = async (
    page = 1,
    perPage = 10,
    searchValue = '',
    sortColumn = 'created_at',
    sortDirection: 'asc' | 'desc' = 'desc'
  ) => {
    try {
      const res = await api.get(`/api/elts`, {
        params: {
          page,
          per_page: perPage,
          search: searchValue,
          sort_by: sortColumn,
          sort_dir: sortDirection,
        },
      });

      const eltData = res.data;

      setElts(eltData.data);

      setPagination({
        current_page: eltData.current_page,
        last_page: eltData.last_page,
        per_page: eltData.per_page,
      });
    } catch (error: any) {
      console.error('Failed to fetch elts:', error);
      toast({
        title: 'Error',
        description: 'Could not load elts.',
        backgroundColor: 'bg-red-600',
        color: 'text-white',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchElts(
      pagination.current_page,
      pagination.per_page,
      search,
      sortBy,
      sortDir
    );
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.last_page) return;
    fetchElts(newPage, pagination.per_page, search, sortBy, sortDir);
  };

  const handlePerPageChange = (newPerPage: number) => {
    fetchElts(1, newPerPage, search, sortBy, sortDir);
  };

  const handleSort = (column: string) => {
    const newDir = sortBy === column && sortDir === 'asc' ? 'desc' : 'asc';
    setSortBy(column);
    setSortDir(newDir);
    fetchElts(pagination.current_page, pagination.per_page, search, column, newDir);
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this item?");
    if (!confirmed) return;

    try {
      const response = await api.delete(`/api/elts/delete/${id}`);
      toast({
        title: "Deleted",
        description: response.data?.message || "Elt deleted successfully.",
        backgroundColor: "bg-green-600",
        color: "text-white",
      });
      await fetchElts(pagination.current_page, pagination.per_page); // refresh
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete the elt.",
        backgroundColor: "bg-red-600",
        color: "text-white",
        variant: "destructive",
      });
    }
  };

  const closeModel = () => {
    setMode('create');
    setSelectedElt(null);
    setModelOpen(false);
  };

  const handleModelToggle = (open: boolean) => {
    setModelOpen(open);
    if (!open) closeModel();
  };

  const openModel = (mode: 'create' | 'view' | 'edit', elt?: any) => {
    setMode(mode);
    setSelectedElt(elt || null);
    setModelOpen(true);
  };

  const getFormFieldsWithValues = () => {
    return EltModelFormConfig.fields.map((field) => ({
      ...field,
      value: selectedElt ? selectedElt[field.name] ?? '' : '',
    }));
  };

  const isReadOnly = mode === 'view';

  return (
    <Header title={'Elts'}>
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
                    fetchElts(1, pagination.per_page, e.target.value, sortBy, sortDir);
                  }}
                  className="pl-10 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
              <CustomModelForm
                addButton={EltModelFormConfig.addButton}
                title={
                  mode === 'view'
                    ? 'View Elt'
                    : mode === 'edit'
                      ? 'Update Elt '
                      : EltModelFormConfig.title
                }
                description={EltModelFormConfig.description}
                fields={getFormFieldsWithValues()}
                buttons={EltModelFormConfig.buttons}
                onSubmit={async (data, setErrors) => {
                  try {
                    await EltModelFormConfig.onSubmit(
                      data,
                      mode,
                      selectedElt?.id,
                      setErrors
                    );
                    await fetchElts(pagination.current_page, pagination.per_page);
                    closeModel();
                  } catch (error) {
                    console.error('Submission failed', error);
                  }
                }}
                open={modelOpen}
                onOpenChange={handleModelToggle}
                readOnly={isReadOnly}
                mode={mode}
              />
            </div>

            {/* Table */}
            <CustomTable
              columns={EltsTableConfig.columns}
              actions={EltsTableConfig.actions}
              data={elts}
              onDelete={handleDelete}
              onView={(elt) => openModel('view', elt)}
              onEdit={(elt) => openModel('edit', elt)}
              pageSize={pagination.per_page}
              pageSizeOptions={[10, 15, 20, 50, 100]}
              currentPage={pagination.current_page}
              totalPages={pagination.last_page}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePerPageChange}
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

export default Elt;