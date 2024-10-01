import "./listExamShift.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import global from "../../global.js"

const ListExamShift = () => {
	const [listExamShift, setListExamShift] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showContent, setShowContent] = useState(false);
	console.log(global.abc);
	useEffect(() => {
		const fetchExamShift = async () => {
			try {
				const response = await axios.post(
					`http://${global.ip}:8080/api/v1/exam-shifts/`
				); // Replace with your API URL
				if (response.data.code === 200) {
					setListExamShift(response.data.examShift); // Assuming response.data.examShift is an array
				} else {
					setError("Failed to get exam shift data.");
				}
			} catch (error) {
				setError("An error occurred while fetching the data.");
			} finally {
				setLoading(false);
			}
		};

		fetchExamShift();
		const timer = setTimeout(() => {
			setShowContent(true);
		}, 1500);

		return () => clearTimeout(timer);
	}, []);

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
		<div className="list-exam-shift">
			<h1>Exam Shifts</h1>
			{listExamShift.length === 0 ? (
				<p>No exam shifts available.</p>
			) : (
				listExamShift.map((examShift) => (
					<div className="box-exam" key={examShift.id}>
						<h2>Subject: {examShift.subject_name}</h2>
						<p>
							Date:{" "}
							{new Date(examShift.date).toLocaleDateString()}
						</p>
						<p>Shift: {examShift.shift}</p>
						<p>Classroom: {examShift.classroom}</p>
						<p>Building: {examShift.building}</p>
						<p>
							Invigilators: {examShift.invigilator_1},{" "}
							{examShift.invigilator_2}
						</p>
						<p>
							Status:{" "}
							<span
								className={`${getStatusClass(
									examShift.status
								)}`}
							>
								{" "}
								{examShift.status}
							</span>
						</p>

						<Link to={`/exam-shift/${examShift.id}`}>
							View Details
						</Link>
					</div>
				))
			)}
		</div>
	);
};

export default ListExamShift;
