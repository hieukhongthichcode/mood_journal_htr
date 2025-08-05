import { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import AuthLayout from "../components/AuthLayout";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setToken } = useContext(AuthContext);

  useEffect(() => {
    if (location.state?.email) {
      setFormData({
        email: location.state.email,
        password: location.state.password || "",
      });
    }
    if (location.state?.registered) {
    toast.success("🎉 Đăng ký thành công! Vui lòng đăng nhập.");
  }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🔐 Đang gửi dữ liệu đăng nhập:", formData);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);
      console.log("📥 Phản hồi từ backend:", res.data);

      const token = res.data.token;
      const user = res.data.user;

      if (!token || !user) {
        console.error("❌ Thiếu token hoặc user từ backend!");
        toast.error("Dữ liệu đăng nhập không hợp lệ.");
        return;
      }

      // ✅ Lưu localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      console.log("📦 Đã lưu vào localStorage:", { token, user });

      // ✅ Cập nhật vào context
      setToken(token);
      setUser(user);
      console.log("✅ Đã cập nhật AuthContext");

      toast.success("✅ Đăng nhập thành công!");
      navigate("/home");
    } catch (err) {
      const msg = err.response?.data?.message || "❌ Đăng nhập thất bại!";
      console.error("🚨 Lỗi đăng nhập:", err);
      toast.error(msg);
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-3xl font-bold mb-6 dark:text-white text-center">
        Welcome back 👋
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-[#2D2A3E] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          value={formData.password}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-[#2D2A3E] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md transition"
        >
          Log in
        </button>

        <p className="text-center text-sm text-gray-400">
          Don’t have an account?{" "}
          <Link to="/register" className="text-purple-400 hover:underline">
            Register
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default Login;