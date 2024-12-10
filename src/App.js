import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import React, { useEffect } from "react";
import Cookies from "js-cookie";
import Home from "./components/Home/Home.js";
import ExamShiftDetails from "./components/ExamShiftDetails/examShiftDetails.js";
import ScanInvigilator from "./components/ScanInvigilator/scanInvigilator.js";
import NavBar from "./components/Navbar/navbar.js";
import Login from "./components/Login/login.js";
import UserDetails from "./components/DetailUser/detail.js";
import global from "./global.js";

function App() {
  global.ip = "localhost";
  // global.ip = "192.168.2.105";
  // global.ip = "10.171.17.11";

  // Sử dụng useLocation để lấy đường dẫn hiện tại
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const sessionId = Cookies.get("session_id");
    if (!sessionId && location.pathname !== "/login") {
      navigate("/login");
    }
  }, [location, navigate]);

  return (
    <div className="overflow-x-hidden">
      {location.pathname !== "/login" && <NavBar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/user/:id" element={<UserDetails />} />
        <Route path="/exam-shift/:examCode" element={<ExamShiftDetails />} />
        <Route
          path="/scan-invigilator-1/:examCode/:id"
          element={<ScanInvigilator invigilator="1" />}
        />
        <Route
          path="/scan-invigilator-2/:examCode/:id"
          element={<ScanInvigilator invigilator="2" />}
        />
      </Routes>
    </div>
  );
}

export default App;
