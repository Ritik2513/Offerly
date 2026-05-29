import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  BarChart3,
  Box,
  X,
  Link2,
  Users,
  BadgeDollarSign,
  Wallet,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();
  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Offers",
      path: "/offers",
      icon: ShoppingBag,
    },
    {
      name: "Affiliate",
      path: "/create-affiliate",
      icon: Users,
    },
    {
      name: "Tracking Links",
      path: "/tracking-links",
      icon: Link2,
    },
    {
      name: "Conversions",
      path: "/conversions",
      icon: BadgeDollarSign,
    },
    {
      name: "Payouts",
      path: "/payouts",
      icon: Wallet,
    },
    ...(user?.role === "affiliate"
      ? [
          {
            name: "Affiliates",
            path: "/affiliates",
            icon: Users,
          },
        ]
      : ""),

    {
      name: "Analytics",
      path: "/analytics",
      icon: BarChart3,
    },
  ];

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-indigo-50 text-indigo-700"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <aside
      className={`
        fixed lg:static top-0 left-0 z-50
        h-screen w-72 bg-white border-r border-gray-200
        transform transition-transform duration-300
        flex flex-col
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
    >
      {/* TOP */}
      <div className="h-16 border-b border-gray-200 px-5 flex items-center justify-between font-inter">
        {/* BRAND */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Box size={20} />
          </div>

          <div>
            <h1 className="text-lg font-bold text-gray-800">Offerly</h1>

            <p className="text-xs text-gray-500">Tracking Suite</p>
          </div>
        </div>

        {/* CLOSE BUTTON */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          <X size={18} />
        </button>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto font-inter">
        <p className="uppercase tracking-wider text-[11px] text-gray-400 px-3 mb-3 font-semibold">
          Workspace
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={linkClass}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* BOTTOM */}
      <div className="p-4 border-t border-gray-200 font-inter">
        <div className="rounded-2xl bg-indigo-50 p-4">
          <p className="text-sm font-semibold text-gray-800">Need Help?</p>

          <p className="text-xs text-gray-500 mt-1">
            Contact support for assistance.
          </p>

          <button className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2 rounded-xl transition">
            Contact Support
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
