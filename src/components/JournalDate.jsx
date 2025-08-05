import React from "react";

export default function JournalDate({ value, showTime = true }) {
    console.log("📅 Giá trị truyền vào JournalDate:", value);
  if (!value) return <span className="text-gray-400">Không có ngày</span>;

  // Hỗ trợ định dạng MongoDB kiểu {$date: "..."}
  const rawDate = value?.$date || value;
  const date = new Date(rawDate);
   console.log("📅 Đã parse thành date:", date);

  if (isNaN(date)) {
    return <span className="text-red-400">Ngày không hợp lệ</span>;
  }

  const options = showTime
    ? {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    : {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      };

  return (
    <span className="text-gray-600 dark:text-gray-300 text-sm">
      {date.toLocaleDateString("vi-VN", options)}
    </span>
  );
}
