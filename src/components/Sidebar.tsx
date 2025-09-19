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
    ],
  },
  {
    name: 'Gestão',
    icon_name: 'user-group',
    sub_options: [
      { name: 'Projetos', url: '/gestao/projetos' },
      { name: 'Sprints', url: '/gestao/sprints' },
      { name: 'Usuários', url: '/gestao/usuarios' },
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

  return (
    <nav className={`fixed left-0 h-[calc(100vh-2.5rem)] z-20 mt-5 bg-black overflow-hidden rounded-e-xl shadow-sm shadow-black transition-all duration-700 ease-in-out ${isExpanded ? 'w-48' : 'w-12'}`}
      style={{ backgroundImage: "assets/marmore.png"}}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex flex-col h-full">
        {/* Main navigation links */}
        <ul className="flex-1">
          <li>
            <Link
              to="/home"
              className={`flex items-center p-3 gap-4 text-white font-semibold transition-colors duration-200 ${
                location.pathname === '/home' ? 'bg-[#9B6A51]' : 'hover:bg-white/10 hover:rounded-lg'
              }`}
            >
              <HomeIcon className="w-6 h-6 shrink-0" />
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
                  className={`w-full flex items-center justify-between p-3 gap-4 text-white transition-colors duration-200 ${
                    isActive ? 'bg-[#9B6A51]' : 'hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <IconComponent name={item.icon_name} className="w-6 h-6 shrink-0" />
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
                    isSubmenuOpen && isExpanded ? 'max-h-40' : 'max-h-0' // Control visibility and animate height
                  }`}
                >
                  <ul className="flex align-end font-light flex-col w-full space-y-0.5">
                    {item.sub_options.map((sub) => (
                      <li key={sub.name}>
                        <Link
                          to={sub.url}
                          className="w-full flex items-center justify-start pl-13 p-1 gap-1 text-white transition-colors duration-200 hover:bg-white/15"
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
        <div className="p-2 ">
            <button
              onClick={() => handleSair()}
              className="w-full flex items-center gap-4 pr-3 pt-1 pb-2 text-white font-semibold"
            >
              <ArrowRightOnRectangleIcon className="w-6 h-6 shrink-0" />
              <SidebarItem>Sair</SidebarItem>
            </button>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;