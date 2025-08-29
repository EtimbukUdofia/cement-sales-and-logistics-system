import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Search, Bell } from "lucide-react"

export function SiteHeader() {
  return (
    <header className="flex h-12 sm:h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 sm:gap-2 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-1 sm:mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-sm sm:text-base font-medium truncate">Hey Adewumi</h1>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full w-8 h-8 sm:w-10 sm:h-10">
            <Search size={14} className="sm:w-4 sm:h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full w-8 h-8 sm:w-10 sm:h-10">
            <Bell size={14} className="sm:w-4 sm:h-4" />
          </Button>
          <div className="flex items-center gap-1 sm:gap-2 pl-1 sm:pl-2">
            <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 overflow-hidden text-xs sm:text-sm">
              {/* <img
                  src="/profile-placeholder.png"
                  alt="A"
                  className="w-7 h-7 sm:w-8 sm:h-8 object-cover"
                /> */}
              A
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-medium text-gray-900">Adewumi Abiola</span>
              <span className="text-xs text-gray-500">adewumi@email.com</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
