import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CreateJournal from './pages/CreateJournal';


function App() {
  return (
    // Thêm lớp dark mode và hiệu ứng chuyển mượt
    <div className="min-h-screen bg-[#f5f7fa] text-black dark:bg-gray-900 dark:text-white transition-colors duration-300">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/create" element={<CreateJournal />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
