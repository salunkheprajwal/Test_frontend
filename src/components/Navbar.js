import React, { useState } from 'react';
import { Menu, X, Plus, Eye, Sparkles } from 'lucide-react';

const Navbar = ({ currentPage, onPageChange, projectCount }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Add Project', page: 'add-project', icon: Plus },
    { name: 'View Projects', page: 'view-projects', icon: Eye }
  ];

  const handlePageChange = (page) => {
    onPageChange(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">        
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center group cursor-pointer">
              <div className="relative w-10 h-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg transform transition-all duration-200 group-hover:scale-105 group-hover:shadow-xl">
                <Sparkles className="w-5 h-5 text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
              </div>
              <div className="ml-3 hidden min-[329px]:block">
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                Project Management
                </span>               
              </div>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center space-x-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.page;
              return (
                <button
                  key={item.name}
                  onClick={() => handlePageChange(item.page)}
                  className={`relative flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-out hover:-translate-y-1 active:translate-y-0 overflow-hidden group ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-2xl shadow-indigo-500/40'
                      : 'bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 text-gray-700 hover:from-gray-200 hover:via-gray-300 hover:to-gray-400 hover:text-gray-900 hover:shadow-xl hover:shadow-gray-500/30'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      isActive ? 'bg-white/20' : 'bg-gray-600/20'
                    }`}>
                      <Icon size={14} className={`${isActive ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    <span>{item.name}</span>
                  </div>
                  {item.page === 'view-projects' && projectCount > 0 && (
                    <span className="relative bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-bold rounded-full px-2 py-0.5 ml-1 shadow-sm">
                      {projectCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 pt-2 pb-4 space-y-2 bg-white/95 backdrop-blur-md border-t border-gray-100">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.page;
              return (
                <button
                  key={item.name}
                  onClick={() => handlePageChange(item.page)}
                  className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-100'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} className={`${isActive ? 'text-indigo-600' : ''}`} />
                  <span className="flex-1 text-left">{item.name}</span>
                  {item.page === 'view-projects' && projectCount > 0 && (
                    <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold rounded-full px-2.5 py-1">
                      {projectCount}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="pt-3 border-t border-gray-100 mt-2">
              <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-3 rounded-xl font-semibold text-sm shadow-lg flex items-center justify-center space-x-2 transition-all duration-200">
                <Plus size={18} />
                <span>Create New Project</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;