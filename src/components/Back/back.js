import "../ListExamShift/listExamShift.css";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";

const Back = (examCode) => {
	const navigate = useNavigate();
	return (
		<div className="my-2 ">
			<button className="w-fit text-left" onClick={() => navigate(`/exam-shift/${examCode}`)}>
				<div className="back-button w-fit flex text-left justify-center align-middle text-nowrap flex-nowrap">
					<div>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							height="28px"
							viewBox="0 -960 960 960"
							width="24px"
							fill="#007bff"
							className="absolute"
						>
							<path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
						</svg>
						<p className="mx-7">Quay lại</p>
					</div>
				</div>
			</button>
		</div>
	);
};

export default Back;
