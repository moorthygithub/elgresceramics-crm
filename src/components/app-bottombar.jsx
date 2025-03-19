import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Frame,
  Settings2,
  ShoppingBag,
  File,
  Home,
  ChevronUp,
  X,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function AppBottombar() {
  const location = useLocation();
  const [activeDropdown, setActiveDropdown] = React.useState(null);
  

  const navItems = [
    {
      title: "Home",
      url: "/home",
      icon: Home,
    },
    {
      title: "Master",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Category",
          url: "/master/category",
        },
        {
          title: "Item",
          url: "/master/item",
        },
        {
          title: "Buyer",
          url: "/master/buyer",
        },
      ],
    },
    {
      title: "Purchase",
      url: "/purchase", 
      icon: ShoppingBag,
    },
    {
      title: "Dispatch",
      url: "/dispatch",
      icon: ShoppingBag,
    },
    {
      title: "Report",
      url: "#",
      icon: File,
      items: [
        {
          title: "Stock",
          url: "/report/stock",
        },
        {
          title: "Buyer",
          url: "/report/buyer",
        },
      ],
    },
  ];

  // show only first 5 items in bottom navigation
  const mobileNavItems = navItems.slice(0, 5);

  const handleItemClick = (item, e) => {
    if (item.items) {
      e.preventDefault();
      setActiveDropdown(activeDropdown === item.title ? null : item.title);
    }
  };

  const isItemActive = (item) => {
    if (item.url !== "#" && location.pathname.startsWith(item.url)) {
      return true;
    }
    if (item.items) {
      return item.items.some(subItem => location.pathname.startsWith(subItem.url));
    }
    return false;
  };

  // Get the current active dropdown menu if any availabe for master and report
  const activeMenu = activeDropdown ? navItems.find(item => item.title === activeDropdown) : null;

  return (
    <>
      {/* Main bottom navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 rounded-t-lg shadow-lg z-40">
        <div className="flex justify-around items-center  h-14 px-1">
          {mobileNavItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = isItemActive(item);
            const hasDropdown = !!item.items;
            
            return (
              <Link 
                key={item.title}
                to={hasDropdown ? "#" : item.url}
                onClick={(e) => handleItemClick(item, e)}
                className={`flex flex-col items-center justify-center p-1  rounded-lg relative ${
                  isActive 
                    ? "text-yellow-600" 
                    : "text-gray-500"
                }`}
              >
                <div className="relative">
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavIndicator"
                      className="absolute -bottom-1 left-0 right-0 h-[2px] bg-yellow-500 rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <IconComponent className="h-4 w-4" />
                </div>
                <span className="text-xs mt-1 font-medium">{item.title}</span>
                
                {hasDropdown && (
                  <span className={`absolute top-0 right-0 w-1.5 h-1.5 rounded-full ${
                    isActive ? "bg-yellow-500" : "bg-gray-400"
                  }`} />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* master and report*/}
      <AnimatePresence>
        {activeMenu && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveDropdown(null)}
          >
            <motion.div 
              className="w-full bg-white rounded-t-xl overflow-hidden"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex flex-col">
                {/* Handle bar for swipe gestures */}
                <div className="w-full flex justify-center pt-2 pb-4">
                  <div className="w-12 h-1 bg-gray-300 rounded-full" />
                </div>
                
                <div className="px-4 pb-2">
                  <h3 className="font-medium text-base flex items-center">
                    {React.createElement(activeMenu.icon, { className: "h-4 w-4 mr-2 text-yellow-600" })}
                    {activeMenu.title}
                  </h3>
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  {activeMenu.items.map((subItem, index) => (
                    <motion.div
                      key={subItem.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={subItem.url}
                        className={`flex justify-between items-center py-2 px-3 border-b border-gray-100 ${
                          location.pathname.startsWith(subItem.url)
                            ? "text-yellow-700 font-medium bg-yellow-50"
                            : "text-gray-700"
                        }`}
                        onClick={() => setActiveDropdown(null)}
                      >
                        <span className=" text-sm ">{subItem.title}</span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </Link>
                    </motion.div>
                  ))}
                </div>
                
                <div className="p-4">
                  <button 
                    onClick={() => setActiveDropdown(null)}
                    className="w-full py-1 rounded-lg bg-gray-100 text-gray-700 font-medium text-sm flex items-center justify-center"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}