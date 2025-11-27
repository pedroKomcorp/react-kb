import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import {
  HomeIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  CalculatorIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/solid';
import { useAuth } from '../hooks/UseAuth';

const sidebarItems = [
  {
    name: 'Operacional',
    icon_name: 'calculator',
    sub_options: [
      { name: 'Demandas', url: '/operacional/demandas' },
      { name: 'Consultoria', url: '/operacional/consultoria' },
      { name: 'Controle Crédito', url: '/operacional/credito' },
      { name: 'Radar', url: '/operacional/radar' },
    ],
  },
  {
    name: 'Gestão',
    icon_name: 'user-group',
    sub_options: [
      { name: 'Projetos', url: '/gestao/projetos' },
      { name: 'Clientes', url: '/gestao/clientes' },
    ],
  },
  {
    name: 'Comercial',
    icon_name: 'currency-dollar',
    sub_options: [
      { name: 'CRM', url: '/comercial/crm' },
    ],
  },
];

const iconMap: { [key: string]: React.ElementType } = {
  home: HomeIcon,
  calculator: CalculatorIcon,
  'user-group': UserGroupIcon,
  'currency-dollar': CurrencyDollarIcon,
  'arrow-right-on-rectangle': ArrowRightOnRectangleIcon,
};

const Sidebar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<{ [key: string]: boolean }>({});
  const location = useLocation();
  const { logout } = useAuth();

  useEffect(() => {
    if (!isExpanded) {
      setOpenSubmenus({});
    }
  }, [isExpanded]);

  const handleMenuClick = (itemName: string) => {
    setOpenSubmenus(prev => ({ ...prev, [itemName]: !prev[itemName] }));
  };

  const handleSair = (() => {
    logout();
    window.location.href = '/login';
  })

  const IconComponent = ({ name, className }: { name: string; className: string }) => {
    const Icon = iconMap[name];
    return Icon ? <Icon className={className} /> : null;
  };

  // Helper component for sidebar items to add transitions
  const SidebarItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span
      className={`whitespace-nowrap font-semibold transition-opacity duration-300 ${
        isExpanded ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {children}
    </span>
  );

  // Delay para expandir/contrair sidebar
  const expandTimeout = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (expandTimeout.current) clearTimeout(expandTimeout.current);
    expandTimeout.current = setTimeout(() => setIsExpanded(true), 250); // 250ms delay
  };
  const handleMouseLeave = () => {
    if (expandTimeout.current) clearTimeout(expandTimeout.current);
    expandTimeout.current = setTimeout(() => setIsExpanded(false), 250); // 250ms delay
  };

  return (
    <div className="fixed left-0 z-20 mt-2">
      {/* Logo section */}
      <div className={`flex justify-end items-center ml-2 px-1 w-12 h-16`}>
      <div className="w-10 h-10 flex items-center justify-center">
        <img 
        src="/assets/K.png"
        alt="K logo"
        className="w-full h-full object-contain"
        />
      </div>
      </div>
      
      {/* Navigation */}
      <nav className={`h-[calc(95vh-4rem)] overflow-hidden rounded-e-xl transition-all duration-700 ease-in-out ${isExpanded ? 'w-48' : 'w-16'}`}
      style={{ background: "linear-gradient(360deg,rgba(119,83,67, 1) 0%, rgba(31, 30, 39, 1) 60%)" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      >
      <div className="flex flex-col h-full">
      {/* Main navigation links */}
      <ul className="flex-1">
        <li>
        <Link
          to="/home"
          className={`flex items-center p-5 gap-4 text-white font-semibold transition-colors duration-200 ${
          location.pathname === '/home' ? 'bg-black/80 inset-shadow-[0px_0px_10px_0px_#452D2C] ' : 'hover:bg-black/40 hover:rounded-lg'
          }`}
        >
          <HomeIcon className={`w-6 h-6 shrink-0 ${location.pathname === '/home' ? 'text-[#775343]' : 'text-white'}`}/>
          <SidebarItem>Home</SidebarItem>
        </Link>
        </li>

        {/* Dynamic Sidebar Items */}
        {sidebarItems.map((item) => {
        const isSubmenuOpen = openSubmenus[item.name] || false;
        const isActive = item.sub_options.some(sub => location.pathname.startsWith(sub.url));

        return (
          <li key={item.name}>
          <button
            onClick={() => handleMenuClick(item.name)}
            className={`w-full flex items-center justify-between p-5 gap-4 text-white transition-colors duration-200 ${
            isActive ? 'bg-black/80 inset-shadow-[0px_0px_10px_0px_#452D2C] ' : 'hover:bg-black/40'
            }`}
          >
            <div className="flex items-center gap-4">
              <IconComponent
              name={item.icon_name}
              className={`w-6 h-6 shrink-0 ${isActive ? 'text-[#775343]' : 'text-white'}`}
              />
              <SidebarItem>{item.name}</SidebarItem>
            </div>
            {isExpanded && (
            <ChevronDownIcon
              className={`w-5 h-5 shrink-0 transition-transform duration-300 ${
              isSubmenuOpen ? 'rotate-180' : ''
              }`}
            />
            )}
          </button>

          {/* Submenu with smooth transition */}
          <div
            className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
            isSubmenuOpen && isExpanded ? 'max-h-40' : 'max-h-0'
            }`}
          >
            <ul className="flex align-end font-light flex-col w-full space-y-0.5">
            {item.sub_options.map((sub) => (
              <li key={sub.name}>
              <Link
                to={sub.url}
                className="w-full flex items-center justify-start pl-13 p-1 gap-1 text-white transition-colors duration-200 hover:bg-black/40"
              >
                {sub.name}
              </Link>
              </li>
            ))}
            </ul>
          </div>
          </li>
        );
        })}
      </ul>

      {/* Logout Button */}
      <div className="p-5 hover:bg-black/40">
        <button
          onClick={() => handleSair()}
          className="w-full flex items-center gap-4 pr-3 pt-1 pb-2 text-white font-semibold transition-colors duration-600  rounded-lg"
        >
          <ArrowRightOnRectangleIcon className="w-6 h-6 shrink-0" />
          <SidebarItem>Sair</SidebarItem>
        </button>
      </div>
      </div>
    </nav>
    </div>
  );
};

export default Sidebar;