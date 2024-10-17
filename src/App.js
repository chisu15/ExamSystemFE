import { Routes, Route, useLocation } from "react-router-dom";
// import ListExamShift from "./components/ListExamShift/listExamShift.js";
import ExamShiftDetails from "./components/ExamShiftDetails/examShiftDetails.js";
import ScanInvigilator from "./components/ScanInvigilator/scanInvigilator.js";
import Home from "./components/Home/Home.js";
import NavBar from "./components/Navbar/navbar.js";
import React from "react";
import global from "./global.js";
import Login from "./components/Login/login.js";

function App() {
  global.ip = "localhost";
  // global.ip = "192.168.1.197";
  // global.ip = "10.171.17.11";

  // Sử dụng useLocation để lấy đường dẫn hiện tại
  const location = useLocation();

  return (
    <div className="overflow-x-hidden">
      {/* Hiển thị NavBar trừ trang /login */}
      {location.pathname !== "/login" && <NavBar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/exam-shift/:examCode" element={<ExamShiftDetails />} />
        <Route path="/scan-invigilator-1/:examCode/:id" element={<ScanInvigilator invigilator="1" />} />
        <Route path="/scan-invigilator-2/:examCode/:id" element={<ScanInvigilator invigilator="2" />} />
      </Routes>
    </div>
  );
}

export default App;
