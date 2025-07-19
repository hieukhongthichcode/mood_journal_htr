import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const username = formData.username.trim();
    const email = formData.email.trim();
    const password = formData.password.trim();
    const confirmPassword = formData.confirmPassword.trim();

    // ✅ Kiểm tra trống
    if (!username || !email || !password) {
      toast.error("❌ Vui lòng điền đầy đủ thông tin.");
      return;
    }

    // ✅ Kiểm tra email đơn giản
    if (!email.includes("@") || !email.includes(".")) {
      toast.error("❌ Email không hợp lệ.");
      return;
    }

    // ✅ Kiểm tra xác nhận mật khẩu
    if (password !== confirmPassword) {
      toast.error("❌ Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        username,
        email,
        password,
      });

      toast.success("🎉 Đăng ký thành công! Chuyển sang đăng nhập...");

      setTimeout(() => {
        navigate("/login", {
          state: {
            email,
            password,
          },
        });
      }, 1500);
    } catch (error) {
      const msg = error.response?.data?.message || "❌ Đăng ký thất bại!";
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
          Đăng ký
        </h2>

        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Tên người dùng"
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded mb-4 bg-white dark:bg-slate-700 dark:text-white"
          required
        />

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

        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Xác nhận mật khẩu"
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded mb-4 bg-white dark:bg-slate-700 dark:text-white"
          required
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          Đăng ký
        </button>
      </form>
    </div>
  );
}

export default Register;
