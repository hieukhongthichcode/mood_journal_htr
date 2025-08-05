import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import CreateJournal from "./pages/CreateJournal";
import Profile from "./pages/Profile";
import EditJournalForm from "./pages/EditJournalForm";

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#f5f7fa] text-black dark:bg-gray-900 dark:text-white transition-colors duration-300">
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/create" element={<CreateJournal />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/edit/:id" element={<EditJournalForm />} />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;
