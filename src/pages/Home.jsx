import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState, useContext } from "react";
import MoodChart from "../components/MoodChart";
import { AuthContext } from "../context/AuthContext";
import { toast } from "sonner";

function Home() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshChart, setRefreshChart] = useState(0); // ✅ để trigger cập nhật biểu đồ

  const handleClick = () => {
    if (!token) {
      toast.warning("Bạn cần đăng nhập trước khi tạo nhật ký!");
      navigate("/login");
      return;
    }
    navigate("/create");
  };

  // ✅ Lấy danh sách nhật ký
  const fetchJournals = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/journals`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Lỗi khi lấy danh sách nhật ký");

      const data = await res.json();
      setJournals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, [token]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xoá nhật ký này?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/journals/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Xoá thất bại");

      alert("✅ Đã xoá thành công!");
      await fetchJournals();                      // reload danh sách
      setRefreshChart(prev => prev + 1);          // ✅ trigger cập nhật biểu đồ
    } catch (err) {
      console.error("Lỗi khi xoá:", err);
    }
  };

  return (
    <div className="pt-20 min-h-screen flex flex-col items-center py-12 transition-colors duration-300 bg-gradient-to-bl from-blue-200 to-pink-200 dark:from-[#1e1e2f] dark:to-[#2d2d3a]">
      <div className="fixed inset-0 h-full w-full bg-gray-900 dark:opacity-100 pointer-events-none z-0 hidden dark:block"></div>

      <div className="z-10 text-center px-6">
        <h1 className="text-4xl font-bold text-slate-800 dark:text-white">🌤️ Mood Journal</h1>
        <p className="mt-4 text-lg text-slate-700 dark:text-gray-300">
          Hôm nay bạn cảm thấy thế nào? Ghi lại cảm xúc của mình nhé.
        </p>

        <button
          onClick={handleClick}
          className="mt-8 bg-white text-indigo-500 hover:bg-indigo-100 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 transition duration-300 px-6 py-3 rounded-xl shadow-md hover:scale-105"
        >
          Thêm nhật ký cảm xúc
        </button>
      </div>

      {/* ✅ Biểu đồ mood */}
      <div className="z-10 mt-16 w-full px-6 max-w-3xl">
        <MoodChart refresh={refreshChart} />
      </div>

      {/* Danh sách bài viết */}
      <div className="z-10 mt-16 w-full px-6 max-w-3xl">
        <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-white">📝 Nhật ký đã tạo:</h2>
        {loading ? (
          <p className="text-gray-600 dark:text-gray-300">⏳ Đang tải danh sách nhật ký...</p>
        ) : journals.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">Chưa có bài viết nào.</p>
        ) : (
          journals.map(journal => (
            <div
              key={journal._id}
              className="bg-white text-slate-800 dark:bg-slate-700 dark:text-white p-4 rounded-lg shadow-md mb-4 flex justify-between items-center transition-transform hover:scale-[1.01]"
            >
              <div>
                <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-300">{journal.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {new Date(journal.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/edit/${journal._id}`)}
                  className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 hover:scale-105 transition-transform"
                >
                  ✏️ Sửa
                </button>
                <button
                  onClick={() => handleDelete(journal._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 hover:scale-105 transition-transform"
                >
                  🗑️ Xoá
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Home;
