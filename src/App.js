import { Routes, Route } from "react-router-dom";
import ListExamShift from "./components/ListExamShift/listExamShift.js";
import ExamShiftDetails from "./components/ExamShiftDetails/examShiftDetails.js";
import ScanInvigilator from "./components/ScanInvigilator/scanInvigilator.js";
import NavBar from "./components/Navbar/navbar.js";
import React from "react";
import global from "./global.js"

function App() {
	global.ip = "10.171.17.184" || "localhost"
	return (
		<div className="overflow-x-hidden">
			<NavBar></NavBar>
			<Routes>
				<Route path="/" element={<ListExamShift />} />
				<Route path="/exam-shift/:id" element={<ExamShiftDetails />} />
				<Route
					path="/scan-invigilator-1"
					element={<ScanInvigilator invigilator="1" />}
				/>
				<Route
					path="/scan-invigilator-2"
					element={<ScanInvigilator invigilator="2" />}
				/>
			</Routes>
		</div>
	);
}

export default App;
