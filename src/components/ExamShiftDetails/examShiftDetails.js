import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import "./examShiftDetails.css";
import Back from "../Back/back.js"
import global from "../../global.js"

const ExamShiftDetails = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	console.log(id);
	console.log(global.abc);
	
	const [examShift, setExamShift] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showContent, setShowContent] = useState(false);

	useEffect(() => {
		const fetchExamShiftDetails = async () => {
			try {
				const response = await axios.post(
					`http://${global.ip}:8080/api/v1/exam-shifts/detail/${id}`
				);
				if (response.data.code === 200) {
					setExamShift(response.data.examShift);
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
		}, 1500);

		return () => clearTimeout(timer);
	}, [id]);

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
			<Back></Back>
			<h1 className="text-3xl font-bold text-center mb-5">
				{examShift.subject_name}
			</h1>
			<div className="flex flex-col items-center gap-5 w-fit mx-auto px-3">
				<div className="flex justify-between w-full">
					<div className="flex flex-col items-center">
						<span className="text-gray-500">Trạng thái</span>
						<span className={`${getStatusClass(examShift.status)}`}>
							{examShift.status}
						</span>
					</div>
					<div className="flex flex-col items-center">
						<span className="text-gray-500">Lớp</span>
						<span className="font-semibold text-2xl">
							{examShift.classroom}-{examShift.building}
						</span>
					</div>
					<div className="flex flex-col items-center">
						<span className="text-gray-500">Kíp</span>
						<span className="font-semibold text-2xl">
							{examShift.shift}
						</span>
					</div>
				</div>
				<div className="flex gap-10">
					<div className="flex flex-col items-center">
						<span className="text-gray-500">Mã môn học</span>
						<span className="font-semibold text-2xl">
							{examShift.subject_code}
						</span>
					</div>
					<div className="flex flex-col items-center">
						<span className="text-gray-500">Thời gian bắt đầu</span>
						<span className="font-semibold text-2xl">
							{new Date(
								examShift.starting_time
							).toLocaleDateString("en-GB")}
						</span>
					</div>
					<div className="flex flex-col items-center">
						<span className="text-gray-500">Hình thức thi</span>
						<span className="font-semibold text-2xl">
							{examShift.exam_format}
						</span>
					</div>
				</div>
			</div>
			<div className="flex flex-wrap justify-around mt-10">
				<div className="">
					<div className="flex flex-col items-center mb-2">
						<span className="text-gray-500">Giám thị 1</span>
						<span className="font-semibold text-2xl">
							{examShift.invigilator_1}
						</span>
					</div>

					<Link to="/scan-invigilator-1">
						<button className="bg-red-500 rounded-3xl p-2 hover:bg-red-600 hover:shadow-xl transition-all">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								height="200px"
								viewBox="0 -960 960 960"
								width="200px"
								fill="#fff"
							>
								<path d="M80-680v-200h200v80H160v120H80Zm0 600v-200h80v120h120v80H80Zm600 0v-80h120v-120h80v200H680Zm120-600v-120H680v-80h200v200h-80ZM700-260h60v60h-60v-60Zm0-120h60v60h-60v-60Zm-60 60h60v60h-60v-60Zm-60 60h60v60h-60v-60Zm-60-60h60v60h-60v-60Zm120-120h60v60h-60v-60Zm-60 60h60v60h-60v-60Zm-60-60h60v60h-60v-60Zm240-320v240H520v-240h240ZM440-440v240H200v-240h240Zm0-320v240H200v-240h240Zm-60 500v-120H260v120h120Zm0-320v-120H260v120h120Zm320 0v-120H580v120h120Z" />
							</svg>
						</button>
					</Link>
				</div>
				<div className="">
					<div className="flex flex-col items-center mb-2">
						<span className="text-gray-500">Giám thị 2</span>
						<span className="font-semibold text-2xl">
							{examShift.invigilator_2}
						</span>
					</div>

					<Link to="/scan-invigilator-1">
						<button className="bg-red-500 rounded-3xl p-2 hover:bg-red-600 hover:shadow-xl transition-all">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								height="200px"
								viewBox="0 -960 960 960"
								width="200px"
								fill="#fff"
							>
								<path d="M80-680v-200h200v80H160v120H80Zm0 600v-200h80v120h120v80H80Zm600 0v-80h120v-120h80v200H680Zm120-600v-120H680v-80h200v200h-80ZM700-260h60v60h-60v-60Zm0-120h60v60h-60v-60Zm-60 60h60v60h-60v-60Zm-60 60h60v60h-60v-60Zm-60-60h60v60h-60v-60Zm120-120h60v60h-60v-60Zm-60 60h60v60h-60v-60Zm-60-60h60v60h-60v-60Zm240-320v240H520v-240h240ZM440-440v240H200v-240h240Zm0-320v240H200v-240h240Zm-60 500v-120H260v120h120Zm0-320v-120H260v120h120Zm320 0v-120H580v120h120Z" />
							</svg>
						</button>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default ExamShiftDetails;
