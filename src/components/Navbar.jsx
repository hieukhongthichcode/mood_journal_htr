import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useContext, useRef } from 'react';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") === "dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const avatarRef = useRef(null);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Dark mode
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);
  const toggleMenu = () => setMenuOpen(prev => !prev);
  const toggleDropdown = () => setDropdownOpen(prev => !prev);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        avatarRef.current &&
        !avatarRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Reset dropdown khi user thay đổi (sau đăng nhập)
  useEffect(() => {
    setDropdownOpen(false);
  }, [user]);

  return (
    <nav className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-purple-900 dark:to-indigo-900 text-white fixed w-full top-0 z-50 shadow-lg rounded-b-2xl">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo & Theme */}
        <div className="flex items-center gap-3">
          <Link to="/" className="text-2xl font-bold tracking-wide">
            Mood Journal
          </Link>
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-white/20">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6 font-medium">
          <Link to="/" className="hover:underline underline-offset-4">Trang chủ</Link>

          {!user ? (
            <>
              <Link to="/login" className="hover:underline">Đăng nhập</Link>
              <Link to="/register" className="hover:underline">Đăng ký</Link>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center gap-2 focus:outline-none"
                ref={avatarRef}
              >
                <img
                  src={localStorage.getItem("customAvatar") || user?.avatar || "/default-avatar.png"}
                  className="w-8 h-8 rounded-full border-2 border-white object-cover"
                  alt="User Avatar"
                />
                <span className="text-white font-medium">{user.name || user.username}</span>
              </button>

              {dropdownOpen && (
                <div
                  ref={dropdownRef}
                  className="absolute right-0 mt-2 w-40 bg-white text-black rounded-md shadow-lg py-2 z-50"
                >
                  <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">Trang cá nhân</Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="p-2">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-3 font-medium">
          <Link to="/" className="block hover:underline">Trang chủ</Link>
          {!user ? (
            <>
              <Link to="/login" className="block hover:underline">Đăng nhập</Link>
              <Link to="/register" className="block hover:underline">Đăng ký</Link>
            </>
          ) : (
            <>
              <Link to="/profile" className="block hover:underline">Trang cá nhân</Link>
              <button onClick={handleLogout} className="block text-left hover:underline">Đăng xuất</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
