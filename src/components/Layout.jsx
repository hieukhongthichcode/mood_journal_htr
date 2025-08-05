import Navbar from "./Navbar";

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-400 via-pink-200 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white font-sans">
      <Navbar />
      <main className="pt-24 px-4 max-w-6xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}

export default Layout;
