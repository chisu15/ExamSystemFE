import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import "./examShiftDetails.css";
import Back from "../Back/back.js";
import global from "../../global.js";
import InvigilatorButtons from "../InvigilatorButton/invigilatorButton.js";
import useAuth from "../../hooks/Auth/useAuth.js";

const ExamShiftDetails = () => {
	useAuth();
	const { examCode } = useParams();
	const navigate = useNavigate();
	console.log(examCode);

	const [examShift, setExamShift] = useState(null);
	const [userExamShift, setUserExamShift] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showContent, setShowContent] = useState(false);

	useEffect(() => {
		const fetchExamShiftDetails = async () => {
			try {
				const response = await axios.post(
					`${global.ip}/api/v1/exam-shifts/detail-byExamCode/${examCode}`
				);
				if (response.data.code === 200) {
					setExamShift(response.data.examShift);
					setUserExamShift(response.data.userExamShift || []);
				} else {
					setError("Failed to fetch exam shift details.");
				}
			} catch (error) {
				console.log(error);
				setError("An error occurred while fetching the data.");
			} finally {
				setLoading(false);
			}
		};

		fetchExamShiftDetails();
		const timer = setTimeout(() => {
			setShowContent(true);
		}, 1000);

		return () => clearTimeout(timer);
	}, [examCode]);

	if (loading || !showContent) {
		return (
			<div className="loading-container">
				<div className="spinner"></div>
			</div>
		);
	}

	if (error) {
		return <div>{error}</div>;
	}

	const getStatusClass = (status) => {
		switch (status.toLowerCase()) {
			case "pending":
				return "status-pending";
			case "done":
				return "status-done";
			case "in-progress":
				return "status-in-progress";
			default:
				return ""; // Default class if no match
		}
	};

	return (
		<div>
			{/* <Back></Back> */}
			<h1 className="text-3xl font-bold text-center mb-5 mt-28">
				{examShift.subject_name}
			</h1>
			<div className="flex flex-col items-center gap-5 w-full md:w-fit mx-auto px-3">
				<div className="flex flex-wrap justify-between w-full gap-4">
					<div className="flex flex-col items-center flex-1">
						<span className="text-gray-500 whitespace-nowrap">
							Trạng thái
						</span>
						<span className={`${getStatusClass(examShift.status)}`}>
							{examShift.status}
						</span>
					</div>
					<div className="flex flex-col items-center flex-1">
						<span className="text-gray-500">Lớp</span>
						<span className="font-semibold text-2xl whitespace-nowrap">
							{examShift.classroom}-{examShift.building}
						</span>
					</div>
					<div className="flex flex-col items-center flex-1">
						<span className="text-gray-500 whitespace-nowrap">
							Kíp
						</span>
						<span className="font-semibold text-2xl">
							{examShift.shift}
						</span>
					</div>
				</div>
				<div className="flex flex-wrap gap-10 md:flex-row w-full justify-around">
					<div className="flex flex-col items-center flex-1">
						<span className="text-gray-500 whitespace-nowrap">
							Mã môn học
						</span>
						<span className="font-semibold text-2xl">
							{examShift.subject_code}
						</span>
					</div>
					<div className="flex flex-col items-center flex-1 md:mt-0">
						<span className="text-gray-500">Thời gian bắt đầu</span>
						<span className="font-semibold text-2xl">
							{new Date(
								examShift.starting_time
							).toLocaleDateString("en-GB")}
						</span>
					</div>
					<div className="flex flex-col items-center flex-1">
						<span className="text-gray-500 whitespace-nowrap">
							Hình thức thi
						</span>
						<span className="font-semibold text-2xl">
							{examShift.exam_format}
						</span>
					</div>
				</div>
			</div>

			<div className="flex flex-wrap justify-around mt-10">
				<div className="flex-col align-middle justify-center text-center">
					<InvigilatorButtons
						invigilatorNumber={1}
						examCode={examCode}
						shiftId={examShift.id}
						state={userExamShift[0]?.state || "0"}
					/>
					<h4>
						{userExamShift[0]?.state === "1"
							? "Quét thông tin giám thị thành công"
							: "Quét mã thông tin cán bộ coi thi"}
					</h4>
				</div>
				<div className="flex-col align-middle justify-center text-center">
					<InvigilatorButtons
						invigilatorNumber={2}
						examCode={examCode}
						shiftId={examShift.id}
						state={userExamShift[1]?.state || "0"}
					/>
					<h4>
						{userExamShift[1]?.state === "1"
							? "Quét thông tin giám thị thành công"
							: "Quét mã thông tin cán bộ coi thi"}
					</h4>
				</div>
			</div>
		</div>
	);
};

export default ExamShiftDetails;
