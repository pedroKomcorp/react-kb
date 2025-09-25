import React, { useState } from "react";
import { SettingFilled, BellFilled } from '@ant-design/icons';

interface UniversalHeaderProps {
  userName: string;
  title?: string;
  showTitle?: boolean;
}

const UniversalHeader: React.FC<UniversalHeaderProps> = ({ 
  userName, 
  title = "", 
  showTitle = false 
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  return (
    <header className="w-full z-10 flex items-center justify-between min-h-[60px] px-6 py-3">
      {/* Left side - Title or empty space */}
      <div className="flex items-center gap-4">
        {showTitle && title && (
          <div>
            <h1 className="text-xl font-semibold text-white">{title}</h1>
          </div>
        )}
      </div>

      {/* Right side - Config, Notifications, and User display */}
      <div className="flex items-center gap-3">
        {/* Config button */}
        <div className="relative">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`p-2 rounded-lg transition-colors ${
              showConfig 
                ? 'bg-white/30 hover:bg-white/35' 
                : 'bg-white/5 hover:bg-white/20'
            }`}
            title="Settings"
          >
            <SettingFilled 
              style={{ fontSize: '24px', color: '#BA8364' }} 
            />
          </button>

          {/* Config dropdown */}
          {showConfig && (
            <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[250px] z-20">
              <h3 className="font-semibold mb-3 text-gray-800">Settings</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm text-gray-700">
                  Profile Settings
                </button>
                <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm text-gray-700">
                  Notification Settings
                </button>
                <div className="border-t pt-2 mt-2">
                  <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm text-red-600">
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notifications button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-lg transition-colors relative ${
              showNotifications 
                ? 'bg-white/30 hover:bg-white/35' 
                : 'bg-white/5 hover:bg-white/20'
            }`}
            title="Notifications"
          >
            <BellFilled 
              style={{ fontSize: '24px', color: '#BA8364' }} 
            />
          </button>
          
          {/* Notifications dropdown */}
          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[300px] z-20">
              <h3 className="font-semibold mb-3 text-gray-800">Notifications</h3>
              <div className="text-center text-gray-500 py-4">
                No notifications
              </div>
            </div>
          )}
        </div>

        {/* User display */}
        <div className="flex items-center gap-3 ml-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-white text-lg font-semibold">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-medium">{userName}</span>
            <span className="text-white/70 text-sm">Online</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default UniversalHeader;