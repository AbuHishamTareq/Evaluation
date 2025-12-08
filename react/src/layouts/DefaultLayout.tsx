import { Navigate, Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "../components/ui/sidebar";
import { AppSidebar } from "../components/AppSidebar";
import { useApp } from "../hooks/useApp";
import ScrollToTop from "../components/ScrollToTop";

const DefaultLayout = () => {
  const { user, loading } = useApp();

  // ✅ 1. Wait for fetchUser to complete
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  // ✅ 2. If not loading and no user → redirect
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div>
      <SidebarProvider>
        <div className="h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1 flex flex-col">
            <ScrollToTop />
            <Outlet />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default DefaultLayout;
