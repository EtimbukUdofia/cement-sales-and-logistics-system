import * as React from "react"
import {
  IconInnerShadowTop,
} from "@tabler/icons-react"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavLink } from "react-router"
import { LayoutDashboard, Package, Truck, ShoppingCart } from "lucide-react"

const data = {
  user: {
    name: "Adewumi Abiola",
    email: "adewumiabiola@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  }
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <nav className="flex-1 py-4">
          <ul className="space-y-2">
            <li>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-5 px-4 py-2 rounded sidebar-navlink-hover ${isActive ? 'sidebar-navlink-active font-semibold' : ''}`
                }
                end
              >
                <LayoutDashboard size={16} />
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/orders"
                className={({ isActive }) =>
                  `flex items-center gap-5 px-4 py-2 rounded sidebar-navlink-hover ${isActive ? 'sidebar-navlink-active font-semibold' : ''}`
                }
              >
                <ShoppingCart size={16} />
                Orders
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/suppliers"
                className={({ isActive }) =>
                  `flex items-center gap-5 px-4 py-2 rounded sidebar-navlink-hover ${isActive ? 'sidebar-navlink-active font-semibold' : ''}`
                }
              >
                <Truck size={16} />
                Suppliers
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  `flex items-center gap-5 px-4 py-2 rounded sidebar-navlink-hover ${isActive ? 'sidebar-navlink-active font-semibold' : ''}`
                }
              >
                <Package size={16} />
                Products
              </NavLink>
            </li>
          </ul>
        </nav>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
