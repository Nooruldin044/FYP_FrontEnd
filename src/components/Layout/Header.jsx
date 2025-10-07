import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Plus, LogOut, User, Search } from "lucide-react";
import { AuthContext } from "../../contexts/AuthContext";

const Header = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setIsMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand */}
          <Link
            to="/"
            className="flex items-center font-bold text-xl text-blue-600 hover:text-blue-700"
          >
            CrowdSourceIdeas
          </Link>

          {/* Search (Desktop) */}
          <div className="hidden md:flex flex-1 px-6">
            <form onSubmit={handleSearch} className="w-full max-w-lg mx-auto">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute inset-y-0 left-3 my-auto text-gray-400"
                />
                <input
                  type="text"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Search ideas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>

          {/* Desktop Auth Links */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/create" className="flex items-center btn btn-primary">
                  <Plus size={18} className="mr-1" /> New Idea
                </Link>

                {/* Profile Dropdown */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-blue-600">
                    <img
                      src={user?.avatar}
                      alt={user?.username}
                      className="h-8 w-8 rounded-full border"
                    />
                    <span>{user?.username}</span>
                  </button>

                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-md border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link
                      to={`/profile/${user?.username}`}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User size={16} className="mr-2" /> Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut size={16} className="mr-2" /> Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary">
                  Log in
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white shadow-md">
          <form onSubmit={handleSearch} className="p-3">
            <div className="relative">
              <Search
                size={18}
                className="absolute inset-y-0 left-3 my-auto text-gray-400"
              />
              <input
                type="text"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Search ideas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          <div className="px-4 py-3 border-t">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={user?.avatar}
                    alt={user?.username}
                    className="h-10 w-10 rounded-full border"
                  />
                  <div>
                    <p className="font-medium text-gray-800">{user?.username}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>

                <Link
                  to="/create"
                  onClick={() => setIsMenuOpen(false)}
                  className="btn btn-primary w-full flex items-center justify-center"
                >
                  <Plus size={18} className="mr-1" /> New Idea
                </Link>

                <Link
                  to={`/profile/${user?.username}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="btn btn-secondary w-full flex items-center justify-center"
                >
                  <User size={18} className="mr-1" /> Profile
                </Link>

                <button
                  onClick={handleLogout}
                  className="btn btn-ghost w-full flex items-center justify-center"
                >
                  <LogOut size={18} className="mr-1" /> Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="btn btn-secondary w-full"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="btn btn-primary w-full"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
