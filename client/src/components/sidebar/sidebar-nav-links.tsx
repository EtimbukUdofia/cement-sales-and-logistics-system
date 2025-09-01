import { NavLink } from "react-router";
import { LayoutDashboard, Package, Truck, ShoppingCart, Boxes, Map, Store, BarChart2, Users, Warehouse } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export function SidebarNavLinks() {
  const { user } = useAuthStore();
  const userRole = user?.role;

  // Define navigation items for different roles
  const adminNavItems = [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
    { to: "/admin/suppliers", icon: Truck, label: "Suppliers" },
    { to: "/admin/products", icon: Package, label: "Products" },
    { to: "/admin/orders", icon: ShoppingCart, label: "Orders" },
    { to: "/admin/inventory", icon: Boxes, label: "Inventory" },
    { to: "/admin/routes", icon: Map, label: "Routes" },
    { to: "/admin/shops", icon: Store, label: "Shops" },
    { to: "/admin/trucks", icon: Truck, label: "Trucks" },
    { to: "/admin/reports", icon: BarChart2, label: "Reports" },
    { to: "/admin/user-roles", icon: Users, label: "User Roles" },
  ];

  const salesPersonNavItems = [
    { to: "/sales", icon: LayoutDashboard, label: "Dashboard", end: true },
    // { to: "/sales/customers", icon: Users, label: "Customers" },
    { to: "/sales/orders", icon: ShoppingCart, label: "Orders" },
    { to: "/sales/inventory", icon: Warehouse, label: "Inventory" },
    { to: "/sales/deliveries", icon: Truck, label: "Deliveries" },
    // { to: "/sales/invoices", icon: Package, label: "Invoices" },
    // { to: "/sales/payments", icon: Store, label: "Payments" },
    { to: "/sales/reports", icon: BarChart2, label: "Reports" },
  ];

  // Get nav items based on user role
  const getNavItems = () => {
    switch (userRole) {
      case "admin":
        return adminNavItems;
      case "salesPerson":
        return salesPersonNavItems;
      default:
        return adminNavItems; // Default to admin nav if role is not recognized
    }
  };

  const navItems = getNavItems();

  return (
    <ul className="space-y-2">
      {navItems.map((item) => (
        <li key={item.to}>
          <NavLink
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-5 px-4 py-2 rounded sidebar-navlink-hover ${isActive ? 'sidebar-navlink-active font-semibold' : ''}`
            }
            end={item.end}
          >
            <item.icon size={16} />
            {item.label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}
