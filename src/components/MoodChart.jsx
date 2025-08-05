import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

function useThemeMode() {
  const [isDark, setIsDark] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (e) => setIsDark(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  return isDark;
}


export default function MoodChart({ refresh }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const isDark = useThemeMode();

  const moodColors = {
    joy: "#facc15",
    anger: "#f87171",
    sadness: "#60a5fa",
    fear: "#c084fc",
    disgust: "#34d399",
    neutral: "#9ca3af",
  };

  const moodLabels = ["joy", "anger", "sadness", "fear", "disgust", "neutral"];


  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return console.error("⚠️ Token không tồn tại.");

        const res = await axios.get("http://localhost:5000/api/journals/moods", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const rawData = res.data;
        if (!Array.isArray(rawData) || rawData.length === 0) {
          setChartData(null);
          return;
        }

        const dateSet = new Set();
        const moodMap = {};
        for (const label of moodLabels) moodMap[label] = {};

        for (const item of rawData) {
          let rawDate = item.date;
          if (rawDate?.$date) rawDate = rawDate.$date;
          const dateObj = new Date(rawDate);
          if (isNaN(dateObj)) continue;
          const dateStr = dateObj.toISOString().split("T")[0];
          dateSet.add(dateStr);
          const moodLabel = item.mood.label;
          if (moodLabels.includes(moodLabel)) {
            moodMap[moodLabel][dateStr] = item.mood.score;
          }
        }

        const sortedDates = Array.from(dateSet).sort();

        const datasets = moodLabels.map((label) => ({
          label,
          data: sortedDates.map((date) => moodMap[label][date] ?? null),
          borderColor: moodColors[label],
          backgroundColor: moodColors[label],
          tension: 0.4,
          pointRadius: 5,
          spanGaps: true,
        }));

        setChartData({
          labels: sortedDates,
          datasets,
        });
      } catch (err) {
        console.error("❌ Lỗi khi lấy dữ liệu mood:", err);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true); 
    fetchData();
  }, [refresh]); 

  const chartOptions = useMemo(() => {
    const gridColor = isDark ? "#444" : "#ccc";
    const labelColor = isDark ? "#bbb" : "#444";
    const titleColor = isDark ? "#aaa" : "#333";
    const legendColor = isDark ? "#ccc" : "#666";
    const tooltipBg = isDark ? "#333" : "#eee";
    const tooltipTitle = isDark ? "#fff" : "#111";
    const tooltipBody = isDark ? "#ccc" : "#222";

    return {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: legendColor,
          },
        },
        tooltip: {
          backgroundColor: tooltipBg,
          titleColor: tooltipTitle,
          bodyColor: tooltipBody,
          callbacks: {
            label: (context) => {
              const score = context.parsed.y;
              return `${context.dataset.label}: ${
                score !== null ? score.toFixed(2) : "Không có dữ liệu"
              }`;
            },
          },
        },
      },
      scales: {
        y: {
          min: 0,
          max: 1,
          grid: {
            color: gridColor,
            drawBorder: false,
          },
          title: {
            display: true,
            text: "Mức độ cảm xúc (0 - 1)",
            color: titleColor,
          },
          ticks: {
            color: labelColor,
          },
        },
        x: {
          grid: {
            color: gridColor,
            drawBorder: false,
          },
          title: {
            display: true,
            text: "Ngày",
            color: titleColor,
          },
          ticks: {
            color: labelColor,
          },
        },
      },
    };
  }, [isDark]);

  return (
    <div className="rounded-2xl shadow-lg ring-1 ring-gray-200 dark:ring-gray-700 p-6 transition-colors duration-300 bg-white/80 dark:bg-white/5 backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          📈 Biểu đồ Mood
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Theo dõi trạng thái cảm xúc của bạn theo thời gian
        </span>
      </div>

      {loading ? (
        <div className="text-gray-700 dark:text-gray-300 text-center py-10">
          Đang tải dữ liệu...
        </div>
      ) : !chartData ? (
        <div className="text-gray-500 dark:text-gray-400 text-center py-10">
          Chưa có dữ liệu mood nào. Hãy ghi nhật ký để bắt đầu!
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-transparent">
          <Line
            key={isDark ? "dark" : "light"} 
            data={chartData}
            options={chartOptions}
          />
        </div>
      )}
    </div>
  );
}
