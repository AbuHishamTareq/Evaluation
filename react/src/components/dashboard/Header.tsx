import { SidebarTrigger } from "../ui/sidebar"
import { UserProfile } from "../UserProfile"
import type { HeaderProps } from "@/types/types";

const Header = ({ title, children }: HeaderProps) => {
  return (
    <div>
      <header className="flex h-14 md:h-16 shrink-0 items-center justify-between gap-2 border-b bg-gradient-to-r from-blue-50 to-indigo-50 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm px-2 md:px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <div className="h-4 w-px bg-sidebar-border hidden sm:block" />
          <h1 className="text-base md:text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent truncate">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <UserProfile />
        </div>
      </header>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}

export default Header