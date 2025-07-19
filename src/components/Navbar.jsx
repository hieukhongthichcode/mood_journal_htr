import { Link } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import { Sun, Moon } from 'lucide-react';
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const { user, setUser } = useContext(AuthContext); // lấy thông tin user

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <nav className="bg-slate-900/80 dark:bg-slate-800 backdrop-blur-md text-slate-100 p-4 shadow-xl rounded-b-2xl fixed w-full top-0 z-50">
      <div className="container mx-auto flex justify-between items-center px-4">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold tracking-wide text-indigo-400">Mood Journal</h1>
          <button
            onClick={toggleTheme}
            className="hover:text-yellow-400 transition"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        <div className="space-x-6">
          <Link to="/" className="hover:text-indigo-400 transition font-medium">Trang chủ</Link>

          {user ? (
            <>
              <span className="font-medium text-green-300">👋 {user.username}</span>
              <button
                onClick={handleLogout}
                className="hover:text-red-400 transition font-medium"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-indigo-400 transition font-medium">Đăng nhập</Link>
              <Link to="/register" className="hover:text-indigo-400 transition font-medium">Đăng ký</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
