import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const addClickAnimation = (e) => {
  const element = e.currentTarget;
  element.style.animation = 'none';
  setTimeout(() => {
    element.style.animation = 'navbar-click-animation 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
  }, 10);
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navbarStyles = `
    @keyframes navbar-click-animation {
      0% { transform: scale(1); }
      50% { transform: scale(0.92); }
      100% { transform: scale(1); }
    }
  `;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <style>{navbarStyles}</style>
      <nav className="h-16 border-b border-gray-200/60 bg-white/80 backdrop-blur-xl fixed top-0 w-full z-50 flex items-center justify-between px-4 sm:px-6 lg:px-8 transition-all duration-300">
        <div className="flex items-center gap-3">
          {/* Logo Icon */}
          <div className="w-8 h-8 bg-black rounded-lg shadow-sm flex items-center justify-center group cursor-pointer hover:scale-105 transition-transform duration-200" onClick={addClickAnimation}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
        </div>
        <span className="font-semibold text-gray-900 tracking-tight text-lg select-none">Radius</span>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        <button onClick={addClickAnimation} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100/50 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-200">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
             </svg>
        </button>
        
        <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

        {/* User Menu */}
        <div className="relative">
          <button 
            onClick={(e) => {
              addClickAnimation(e);
              setShowUserMenu(!showUserMenu);
            }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 hover:bg-gray-50 rounded-full transition-colors duration-200 group"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-gray-200 shadow-sm"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 border border-gray-200 shadow-sm flex items-center justify-center overflow-hidden">
                <span className="text-xs font-medium text-gray-600 group-hover:text-gray-800">
                  {getUserInitials()}
                </span>
              </div>
            )}
            <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <>
              {/* Backdrop to close menu */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowUserMenu(false)}
              />
              
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-20 animate-fade-in">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                  {user?.authProvider === 'google' && (
                    <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                      <svg className="w-3 h-3" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      </svg>
                      Google
                    </span>
                  )}
                </div>

                {/* Menu Items */}
                <button
                  onClick={(e) => {
                    addClickAnimation(e);
                    handleLogout();
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Log Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
    </>
  );
};

export default Navbar;
