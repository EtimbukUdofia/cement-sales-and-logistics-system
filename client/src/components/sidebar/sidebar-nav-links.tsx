import { NavLink } from "react-router";
import { LayoutDashboard, Package, Truck, ShoppingCart, Boxes, Map, Store, BarChart2, Users } from "lucide-react";

export function SidebarNavLinks() {
  return (
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
          to="/admin/suppliers"
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
          to="/admin/products"
          className={({ isActive }) =>
            `flex items-center gap-5 px-4 py-2 rounded sidebar-navlink-hover ${isActive ? 'sidebar-navlink-active font-semibold' : ''}`
          }
        >
          <Package size={16} />
          Products
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/admin/orders"
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
          to="/admin/inventory"
          className={({ isActive }) =>
            `flex items-center gap-5 px-4 py-2 rounded sidebar-navlink-hover ${isActive ? 'sidebar-navlink-active font-semibold' : ''}`
          }
        >
          <Boxes size={16} />
          Inventory
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/admin/routes"
          className={({ isActive }) =>
            `flex items-center gap-5 px-4 py-2 rounded sidebar-navlink-hover ${isActive ? 'sidebar-navlink-active font-semibold' : ''}`
          }
        >
          <Map size={16} />
          Routes
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/admin/shops"
          className={({ isActive }) =>
            `flex items-center gap-5 px-4 py-2 rounded sidebar-navlink-hover ${isActive ? 'sidebar-navlink-active font-semibold' : ''}`
          }
        >
          <Store size={16} />
          Shops
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/admin/reports"
          className={({ isActive }) =>
            `flex items-center gap-5 px-4 py-2 rounded sidebar-navlink-hover ${isActive ? 'sidebar-navlink-active font-semibold' : ''}`
          }
        >
          <BarChart2 size={16} />
          Reports
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/admin/user-roles"
          className={({ isActive }) =>
            `flex items-center gap-5 px-4 py-2 rounded sidebar-navlink-hover ${isActive ? 'sidebar-navlink-active font-semibold' : ''}`
          }
        >
          <Users size={16} />
          User Roles
        </NavLink>
      </li>
    </ul>
  );
}
