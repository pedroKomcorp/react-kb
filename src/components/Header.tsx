
import React from "react";
import './home/scrollbar-hide.css';


interface HeaderProps {
  userName: string;
  allWidgets?: { key: string; title: string }[];
  selectedKeys?: string[];
  setSelectedKeys?: (keys: string[]) => void;
  onReset?: () => void;
}



const Header: React.FC<HeaderProps> = ({ userName }) => {
  return (
    <header className="fixed top-0 left-0 w-screen z-10 flex items-center justify-between bg-white shadow min-h-[60px] px-20 py-3 gap-6">
      <div className="flex items-center gap-4">
        {/* Collapsible widget selection hidden */}
      </div>
      <button className="flex items-center gap-2 rounded px-6 py-2 font-semibold transition-colors">
        <span className="text-blue-700 text-xl">👤</span>
        <span>{userName}</span>
      </button>
    </header>
  );
};

export default Header;

