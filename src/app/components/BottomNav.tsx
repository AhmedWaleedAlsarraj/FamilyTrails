import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Compass, Camera, User } from "lucide-react";
import { clsx } from "clsx";

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/explore", icon: Compass, label: "Explore" },
    { path: "/memories", icon: Camera, label: "Memories" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full max-w-[430px] mx-auto bg-white border-t border-gray-200 flex justify-around py-2.5 z-50 pb-6">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = isActive(tab.path);
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={clsx(
              "flex flex-col items-center p-2 min-w-[60px] transition-colors",
              active ? "text-[#2E5C8A]" : "text-gray-400",
            )}
          >
            <Icon size={24} strokeWidth={active ? 2.5 : 2} />
            <span
              className={clsx(
                "text-xs mt-1",
                active ? "font-bold" : "font-medium",
              )}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
