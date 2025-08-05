const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#28243D] px-4 pt-10 md:pt-16">
      <div className="flex flex-col md:flex-row w-full max-w-5xl h-[85vh] bg-white dark:bg-[#1F1B2E] rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Left side image */}
        <div className="hidden md:flex md:w-1/2 bg-black relative">
          <img
            src="https://images.pexels.com/photos/1723637/pexels-photo-1723637.jpeg"
            alt="Auth visual"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-8 left-8 text-white text-lg font-medium">
            Capturing Moments,<br />Creating Memories
          </div>
        </div>

        {/* Right side form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-10 bg-white dark:bg-[#1F1B2E]">
          <div className="w-full max-w-md text-gray-800 dark:text-white">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
