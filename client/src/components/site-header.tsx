import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Search, Bell } from "lucide-react"

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">Hey Adewumi</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full">
            <Search size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full">
            <Bell size={16} />
          </Button>
          <div className="flex items-center gap-2 pl-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
              {/* <img
                  src="/profile-placeholder.png"
                  alt="A"
                  className="w-8 h-8 object-cover"
                /> */}
              A
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">Adewumi Abiola</span>
              <span className="text-xs text-gray-500">adewumi@email.com</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
