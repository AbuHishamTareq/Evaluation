import { createRoot } from 'react-dom/client'
import './index.css'
import router from './router.tsx';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from './provider/LanguageProvider.tsx';
import { AppProvider } from './provider/AppProvider.tsx';

const queryClient = new QueryClient();


createRoot(document.getElementById("root")!).render(

    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <AppProvider>
                <LanguageProvider>
                    <Toaster />
                    <Sonner />
                    <RouterProvider router={router} />
                </LanguageProvider>
            </AppProvider>
        </TooltipProvider>
    </QueryClientProvider>
);