import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);

  const [newName, setNewName] = useState("");
  const [newAvatar, setNewAvatar] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setNewName(user.name);
    }
  }, [user]);

  useEffect(() => {
    if (newAvatar) {
      const previewUrl = URL.createObjectURL(newAvatar);
      setPreviewAvatar(previewUrl);
      return () => URL.revokeObjectURL(previewUrl);
    }
  }, [newAvatar]);

  const handleEditName = () => {
    setIsEditingName(true);
    setIsChanged(true);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSave = async () => {
    if (!user?._id) {
      toast.error("❌ Không tìm thấy ID người dùng.");
      return;
    }

    try {
      let avatarBase64 = user.avatar;

      if (newAvatar) {
        if (newAvatar.size > 2 * 1024 * 1024) {
          toast.error("❌ Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 2MB.");
          return;
        }
        avatarBase64 = await convertToBase64(newAvatar);
      }

      await saveProfile(newName || user.name, avatarBase64);
    } catch (err) {
      toast.error("❌ Cập nhật thất bại");
      console.error("Lỗi khi cập nhật:", err);
    }
  };

  const saveProfile = async (name, avatar) => {
    try {
      const res = await axios.put(`https://mood-journal-htr.onrender.com/api/auth/${user._id}`, {
        name,
        avatar,
      });

      localStorage.setItem("user", JSON.stringify(res.data));
      setUser(res.data);
      setIsEditingName(false);
      setIsChanged(false);
      toast.success("✅ Cập nhật thành công!");
      window.location.reload();
    } catch (err) {
      toast.error("❌ Cập nhật thất bại");
      console.error("Lỗi:", err);
    }
  };

  const avatarSrc = previewAvatar || user?.avatar || "/default-avatar.png";

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="p-8 rounded-2xl shadow-xl text-white text-center w-[350px]
        bg-gradient-to-r from-indigo-500 to-purple-500 
        dark:from-gray-800 dark:to-gray-700 transition-all duration-300">

        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt="avatar"
            className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-white object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-white bg-gray-300" />
        )}

        {!isEditingName ? (
          <>
            <h2 className="text-xl font-bold mb-2">{user?.name || "Chưa đặt tên"}</h2>
            <button
              onClick={handleEditName}
              className="bg-white text-indigo-600 font-semibold px-4 py-1 rounded-lg mb-3 hover:bg-gray-100 transition"
            >
              Chỉnh sửa thông tin
            </button>
          </>
        ) : (
          <input
            type="text"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              setIsChanged(true);
            }}
            className="w-full px-3 py-2 mb-3 rounded-lg 
              text-black dark:text-white dark:bg-gray-800 font-semibold"
            placeholder="Nhập tên mới"
          />
        )}

        <p className="text-sm mb-4">{user?.email}</p>

        <label className="bg-white text-indigo-600 font-semibold w-full py-2 rounded-xl cursor-pointer block mb-3 hover:bg-gray-100 transition">
          Chọn ảnh mới
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                if (file.size > 1024 * 1024 * 2) {
                  toast.error("❌ Ảnh quá lớn. Vui lòng chọn ảnh < 2MB.");
                  return;
                }
                setNewAvatar(file);
                setIsChanged(true);
              }
            }}
            className="hidden"
          />
        </label>

        {isChanged && (
          <button
            onClick={handleSave}
            className="bg-indigo-800 text-white font-semibold w-full py-2 rounded-xl hover:bg-indigo-900 transition"
          >
            Xác nhận
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;
