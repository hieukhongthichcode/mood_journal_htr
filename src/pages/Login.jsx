import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";


function Login() {
  const { setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const location = useLocation();

  // 👉 Nhận dữ liệu từ trang đăng ký và điền sẵn vào form
  useEffect(() => {
    if (location.state?.email && location.state?.password) {
      setFormData({
        email: location.state.email,
        password: location.state.password,
      });
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post("http://localhost:5000/api/auth/login", {
      email: formData.email,
      password: formData.password,
    });
     localStorage.setItem('token', res.data.token);
     navigate('/dashboard');
    // ✅ Lưu thông tin vào localStorage và cập nhật context
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user); // cập nhật context

    // ✅ Thông báo & điều hướng sau khi thành công
    toast.success("🎉 Đăng nhập thành công!");
    navigate("/home");
  } catch (error) {
    const msg = error.response?.data?.message || "❌ Đăng nhập thất bại!";
    toast.error(msg);
  }
};


  return (
    <div className="flex justify-center items-center h-screen bg-[#f5f7fa] dark:bg-gray-900 transition-colors">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-800 dark:text-white p-8 rounded shadow-lg w-96 transition-colors"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center text-green-600 dark:text-green-400">
          Đăng nhập
        </h2>

        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded mb-4 bg-white dark:bg-slate-700 dark:text-white"
          required
        />

        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Mật khẩu"
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded mb-4 bg-white dark:bg-slate-700 dark:text-white"
          required
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          Đăng nhập
        </button>
      </form>
    </div>
  );
}

export default Login;
