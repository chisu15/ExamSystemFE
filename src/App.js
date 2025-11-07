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
import FacultyDashboard from "./components/FacultyDashboard";
// import ExamShiftAssign from "./components/FacultyDashboard/ExamShiftAssign";
// import ExamShiftRegister from "./components/FacultyDashboard/ExamShiftRegister";
import AssignExamCalendar from "./components/FacultyDashboard/AssignExamCalendar";
import RegisterFreeDays from "./components/FacultyDashboard/RegisterExamCalendar/index.js";

function App() {
	global.ip = "http://localhost:80";
	// global.ip = "http://192.168.11.108:80";
	// global.ip = "http://10.23.93.132:80";

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
				<Route
					path="/exam-shift/:examCode"
					element={<ExamShiftDetails />}
				/>
				<Route
					path="/scan-invigilator-1/:examCode/:id"
					element={<ScanInvigilator invigilator="1" />}
				/>
				<Route
					path="/scan-invigilator-2/:examCode/:id"
					element={<ScanInvigilator invigilator="2" />}
				/>
				<Route
					path="/faculty-dashboard"
					element={<FacultyDashboard />}
				/>
				<Route
					path="/faculty/assign"
					element={<AssignExamCalendar />}
				/>
				<Route
					path="/faculty/register"
					element={<RegisterFreeDays />}
				/>
			</Routes>
		</div>
	);
}

export default App;
