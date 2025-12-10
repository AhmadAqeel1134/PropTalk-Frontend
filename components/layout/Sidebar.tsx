'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Building2,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeToggle from '@/components/admin/ThemeToggle';

interface SidebarProps {
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const pathname = usePathname();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('admin@proptalk.com');

  useEffect(() => {
    // Only access localStorage on client side after mount
    const email = localStorage.getItem('user_email') || 'admin@proptalk.com';
    setUserEmail(email);
  }, []);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Agents',
      href: '/admin/agents',
      icon: Users,
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
    },
  ];

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Default logout behavior
      localStorage.removeItem('admin_token');
      localStorage.removeItem('access_token');
      window.location.href = '/login/admin';
    }
  };

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') {
      return pathname === href || pathname === '/admin';
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-3 rounded-lg transition-all duration-300"
        style={
          theme === 'dark'
            ? {
                background: 'rgba(15, 31, 58, 0.9)',
                border: '1px solid rgba(77, 184, 255, 0.3)',
                backdropFilter: 'blur(10px)',
              }
            : {
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(77, 184, 255, 0.3)',
                backdropFilter: 'blur(10px)',
              }
        }
      >
        {isOpen ? (
          <X size={24} className="text-blue-400" />
        ) : (
          <Menu size={24} className="text-blue-400" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className={`fixed inset-0 z-40 lg:hidden ${
            theme === 'dark' ? 'bg-black bg-opacity-50' : 'bg-black bg-opacity-30'
          }`}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
        style={
          theme === 'dark'
            ? {
                width: '280px',
                background: 'rgba(10, 15, 25, 0.95)',
                borderRight: '1px solid rgba(77, 184, 255, 0.2)',
                backdropFilter: 'blur(10px)',
              }
            : {
                width: '280px',
                background: 'rgba(255, 255, 255, 0.98)',
                borderRight: '1px solid rgba(77, 184, 255, 0.2)',
                backdropFilter: 'blur(10px)',
              }
        }
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div
            className={`p-6 border-b ${
              theme === 'dark' ? 'border-blue-900' : 'border-blue-200'
            }`}
          >
            <Link
              href="/admin/dashboard"
              className="flex items-center space-x-3 group"
              onClick={() => setIsOpen(false)}
            >
              <div
                className="p-2 rounded-lg transition-all duration-300 group-hover:scale-110"
                style={{
                  background: 'linear-gradient(135deg, #3b9eff 0%, #1e5fb8 100%)',
                  boxShadow: '0 4px 15px rgba(59, 158, 255, 0.4)',
                }}
              >
                <Building2 size={28} className="text-white" />
              </div>
              <div>
                <h1
                  className={`text-2xl font-bold transition-colors duration-300 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                  style={
                    theme === 'dark'
                      ? {
                          textShadow: '0 0 20px rgba(77, 184, 255, 0.3)',
                        }
                      : {}
                  }
                >
                  PropTalk
                </h1>
                <p className={`text-xs ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>
                  Admin Dashboard
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    active
                      ? 'text-white'
                      : theme === 'dark'
                      ? 'text-blue-300 hover:text-white hover:bg-blue-950'
                      : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                  }`}
                  style={{
                    background: active
                      ? 'linear-gradient(135deg, #3b9eff 0%, #1e5fb8 100%)'
                      : 'transparent',
                    boxShadow: active
                      ? '0 4px 20px rgba(59, 158, 255, 0.4)'
                      : 'none',
                  }}
                >
                  <Icon
                    size={20}
                    style={{
                      filter: active
                        ? 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))'
                        : 'none',
                    }}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className={`p-4 border-t ${theme === 'dark' ? 'border-blue-900' : 'border-blue-200'}`}>
            <div
              className="p-4 rounded-lg mb-3"
              style={
                theme === 'dark'
                  ? {
                      background: 'rgba(59, 158, 255, 0.05)',
                      border: '1px solid rgba(77, 184, 255, 0.2)',
                    }
                  : {
                      background: 'rgba(59, 158, 255, 0.08)',
                      border: '1px solid rgba(77, 184, 255, 0.25)',
                    }
              }
            >
              <p className={`text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Admin User
              </p>
              <p className={`text-xs ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>
                {userEmail}
              </p>
            </div>
            <div className="mb-3">
              <ThemeToggle />
            </div>
            <button
              onClick={handleLogout}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
                theme === 'dark'
                  ? 'text-red-400 hover:text-white hover:bg-red-950'
                  : 'text-red-500 hover:text-white hover:bg-red-500'
              }`}
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

