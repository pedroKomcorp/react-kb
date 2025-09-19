
import React from "react";
import './home/scrollbar-hide.css';
import { UserOutlined } from "@ant-design/icons";

interface HeaderProps {
  userName: string;
  allWidgets: { key: string; title: string }[];
  selectedKeys: string[];
  setSelectedKeys: (keys: string[]) => void;
  onReset?: () => void;
}


const Header: React.FC<HeaderProps> = ({ userName, allWidgets, selectedKeys, setSelectedKeys, onReset }) => {
  const [collapsed, setCollapsed] = React.useState(false);

  const handleToggleWidget = (key: string) => {
    setSelectedKeys(
      selectedKeys.includes(key)
        ? selectedKeys.filter((k) => k !== key)
        : [...selectedKeys, key]
    );
  };

  return (
    <header className="fixed top-0 left-0 w-screen z-10 flex items-center justify-between bg-white shadow min-h-[60px] px-20 py-3 gap-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? 'Mostrar seleção de widgets' : 'Ocultar seleção de widgets'}
          className="transition-transform duration-300 text-xl text-gray-500 focus:outline-none"
        >
          <span className={collapsed ? 'inline-block transform rotate-180' : 'inline-block'}>⮜</span>
        </button>
        <div
          className={`flex items-center gap-3 whitespace-nowrap min-h-[44px] transition-all duration-400 overflow-x-auto overflow-y-hidden border border-gray-300 bg-white rounded ${collapsed ? 'max-w-0 w-0 opacity-0 p-0 border-0' : 'max-w-[600px] w-auto opacity-100 px-4 border'} scrollbar-hide`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {!collapsed && (
            <button
              className="mr-2 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-xs font-semibold border border-gray-300 transition-colors"
              onClick={onReset}
            >
              Reiniciar home
            </button>
          )}
          {allWidgets.map((w) => (
            <label
              key={w.key}
              className="inline-flex items-center font-medium text-[15px] cursor-pointer mr-0"
            >
              <input
                type="checkbox"
                checked={selectedKeys.includes(w.key)}
                onChange={() => handleToggleWidget(w.key)}
                className="mr-1.5 accent-blue-600"
              />
              {w.title}
            </label>
          ))}
        </div>
      </div>
      <button className="flex items-center gap-2 rounded px-6 py-2 font-semibold transition-colors">
        <UserOutlined className="text-blue-700 text-xl" />
        <span>{userName}</span>
      </button>
    </header>
  );
};

export default Header;

