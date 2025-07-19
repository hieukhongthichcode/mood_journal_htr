function Home() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center transition-colors duration-300"
      style={{
        backgroundImage:
          'linear-gradient(to bottom left, #a1c4fd 70%, #fbc2eb 100%)',
      }}
    >
      {/* Dark mode overlay để che gradient */}
      <div className="absolute inset-0 bg-gray-900 opacity-90 dark:opacity-100 pointer-events-none z-0 hidden dark:block"></div>

      <div className="z-10 text-center px-6">
        <h1 className="text-4xl font-bold text-slate-800 dark:text-white">
          🌤️ Mood Journal
        </h1>
        <p className="mt-4 text-lg text-slate-700 dark:text-gray-300">
          Hôm nay bạn cảm thấy thế nào? Ghi lại cảm xúc của mình nhé.
        </p>

        <button className="mt-8 bg-white text-indigo-500 hover:bg-indigo-100 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 transition duration-300 px-6 py-3 rounded-xl shadow-md">
          Thêm nhật ký cảm xúc
        </button>
      </div>
    </div>
  );
}

export default Home;
