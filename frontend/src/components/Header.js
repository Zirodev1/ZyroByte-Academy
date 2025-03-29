// src/components/Header.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (token && user) {
      setIsLoggedIn(true);
      setUserName(user.name);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/login");
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <header className="bg-gray-900 py-4 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold">
            <Link to="/">
              <span className="text-white">
                ZyroByte<span className="text-blue-500">Academy</span>
              </span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={toggleMenu}
              className="text-gray-300 hover:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              <div className={`w-6 h-5 flex flex-col justify-between ${menuOpen ? "open" : ""}`}>
                <span className={`bg-white h-0.5 w-full transform transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`}></span>
                <span className={`bg-white h-0.5 w-full transition-all duration-300 ${menuOpen ? "opacity-0" : "opacity-100"}`}></span>
                <span className={`bg-white h-0.5 w-full transform transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}></span>
              </div>
            </button>
          </div>

          <nav className={`${menuOpen ? "flex" : "hidden"} md:flex flex-col md:flex-row absolute md:relative left-0 right-0 top-16 md:top-auto bg-gray-900 md:bg-transparent z-50 md:z-auto p-4 md:p-0 shadow-md md:shadow-none`}>
            <ul className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6 w-full">
              <li className="md:mt-0">
                <Menu as="div" className="relative inline-block text-left">
                  <div>
                    <MenuButton className="inline-flex text-gray-300 hover:text-white justify-center gap-x-1.5">
                      Our Courses
                      <ChevronDownIcon
                        aria-hidden="true"
                        className="mt-1 size-5 text-gray-400"
                      />
                    </MenuButton>
                  </div>
                  <MenuItems
                    transition
                    className="absolute left-0 z-10 mt-2 w-56 origin-top-left rounded-md bg-white ring-1 shadow-lg ring-black/5 transition focus:outline-none data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                  >
                    <div className="py-1">
                      <MenuItem>
                        <Link
                          to="#"
                          className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-none"
                        >
                          Front-End Web Development
                        </Link>
                      </MenuItem>
                      <MenuItem>
                        <Link
                          to="#"
                          className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-none"
                        >
                          Back-End Web Development
                        </Link>
                      </MenuItem>
                      <MenuItem>
                        <Link
                          to="#"
                          className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-none"
                        >
                          Full Stack Web Development
                        </Link>
                      </MenuItem>
                    </div>
                  </MenuItems>
                </Menu>
              </li>
              
              {isLoggedIn ? (
                <li className="relative">
                  <button
                    className="text-gray-300 hover:text-white flex items-center"
                    onClick={toggleDropdown}
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={dropdownOpen}
                  >
                    {userName} 
                    <svg 
                      className={`ml-1 h-4 w-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <ul
                    className={`absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 transform origin-top-right transition-all duration-200 ${
                      dropdownOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
                    }`}
                  >
                    <li>
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          setMenuOpen(false);
                          setDropdownOpen(false);
                        }}
                      >
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          setMenuOpen(false);
                          setDropdownOpen(false);
                        }}
                      >
                        Profile
                      </Link>
                    </li>
                    <li>
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          handleLogout();
                          setMenuOpen(false);
                          setDropdownOpen(false);
                        }}
                        type="button"
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              ) : (
                <>
                  <li>
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="text-gray-300 hover:text-white"
                    >
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/register"
                      onClick={() => setMenuOpen(false)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-300"
                    >
                      Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
