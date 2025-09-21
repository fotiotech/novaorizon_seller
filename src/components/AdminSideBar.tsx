// components/AdminSideBar.tsx
import React, { LegacyRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Assignment,
  BarChart,
  Category,
  Chat,
  CheckCircle,
  CollectionsBookmark,
  Dashboard,
  Discount,
  Email,
  GetAppRounded,
  Group,
  Inventory,
  LocalShipping,
  Person2,
  Replay,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Store,
  Tag,
  Notifications,
  Receipt,
  AttachMoney,
  Segment,
  History,
  ReceiptLong,
  Campaign,
  Public,
  Code,
  Assessment,
  Inventory2,
  ManageAccounts,
  Payment,
  Language,
  Room,
  Message,
} from "@mui/icons-material";
import { MessageCircle } from "lucide-react";

interface MenuLink {
  name: string;
  href: string;
  icon?: React.ReactNode;
}

interface MenuSection {
  title: string;
  links: MenuLink[];
}

interface AdminSideBarProps {
  domNode?: LegacyRef<HTMLDivElement>;
  sideBarToggle: boolean;
  screenSize: number;
  setSideBarToggle: (open: boolean) => void;
}

const menuConfig: MenuSection[] = [
  {
    title: "Dashboard",
    links: [
      { name: "Overview", href: "/overview", icon: <Dashboard /> },
      {
        name: "Notifications",
        href: "/notifications",
        icon: <Notifications />,
      },
      { name: "Messages", href: "/chat", icon: <Message /> },
    ],
  },
  {
    title: "Catalog",
    links: [
      { name: "Products", href: "/products", icon: <Inventory2 /> },
      { name: "Brands", href: "/brands", icon: <Tag /> },
      { name: "Inventory", href: "/inventory", icon: <Inventory /> },
    ],
  },
  {
    title: "Sales",
    links: [
      { name: "Orders", href: "/orders", icon: <ShoppingBag /> },
      { name: "Order Status", href: "/order_status", icon: <CheckCircle /> },
      { name: "Shipments", href: "/shipments", icon: <LocalShipping /> },
      {
        name: "Refunds & Returns",
        href: "/refunds_returns",
        icon: <Replay />,
      },
    ],
  },
  {
    title: "Marketing",
    links: [
      {
        name: "Discounts",
        href: "/discounts_coupons",
        icon: <Discount />,
      },
      {
        name: "Promotions",
        href: "/promotions",
        icon: <Email />,
      },
      {
        name: "Advertising",
        href: "/advertising",
        icon: <CollectionsBookmark />,
      },
    ],
  },
  {
    title: "Analytics",
    links: [
      { name: "Sales Reports", href: "/sales_reports", icon: <Assessment /> },
      {
        name: "Customer Insights",
        href: "/customer_report",
        icon: <BarChart />,
      },
      {
        name: "Inventory Reports",
        href: "/inventory_reports",
        icon: <Inventory />,
      },
    ],
  },
  {
    title: "Settings",
    links: [
      {
        name: "Store Settings",
        href: "/settings/general",
        icon: <Settings />,
      },
      { name: "Payment Methods", href: "/payment", icon: <Payment /> },
      { name: "Shipping Zones", href: "/shipping", icon: <LocalShipping /> },
    ],
  },
  {
    title: "Support",
    links: [{ name: "Customer Chat", href: "/chat", icon: <Chat /> }],
  },
];

const signOutLink: MenuLink = { name: "Sign Out", href: "/auth/signout" };

const AdminSideBar: React.FC<AdminSideBarProps> = ({
  domNode,
  sideBarToggle,
  screenSize,
  setSideBarToggle,
}) => {
  const pathname = usePathname();
  const open = "fixed lg:relative inset-y-0 left-0 z-50 translate-x-0";
  const hide = "fixed lg:relative inset-y-0 -left-full lg:translate-x-0";

  const handleClose = () => {
    if (screenSize <= 1024) setSideBarToggle(false);
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {sideBarToggle && screenSize <= 1024 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={handleClose}
        />
      )}

      <aside
        ref={domNode}
        className={`${sideBarToggle || screenSize > 1024 ? open : hide} 
          w-3/4 lg:w-64 h-full overflow-y-auto transition-transform duration-300 ease-in-out
          bg-white dark:bg-gray-800 shadow-lg flex flex-col justify-between`}
      >
        <div>
          <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
            <Link href="/" className="flex items-center">
              <Image src="/logo.png" alt="logo" width={60} height={40} />
              <span className="ml-2 text-xl font-bold text-gray-800 dark:text-white">
                Admin Panel
              </span>
            </Link>
            {screenSize <= 1024 && (
              <button
                title="button"
                type="button"
                onClick={handleClose}
                className="lg:hidden p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
          <nav className="p-4 space-y-6 overflow-y-auto">
            {menuConfig.map((section) => (
              <div key={section.title} className="mb-6">
                <h3 className="text-xs uppercase font-semibold mb-3 text-gray-500 dark:text-gray-400 tracking-wide">
                  {section.title}
                </h3>
                <ul className="space-y-1">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={handleClose}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 ${
                          pathname === link.href ||
                          pathname.startsWith(link.href)
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        }`}
                      >
                        <span className="text-gray-500 dark:text-gray-400">
                          {link.icon}
                        </span>
                        <span className="font-medium">{link.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href={signOutLink.href}
            onClick={handleClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900 transition-colors duration-200 font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>{signOutLink.name}</span>
          </Link>
        </div>
      </aside>
    </>
  );
};

export default AdminSideBar;
