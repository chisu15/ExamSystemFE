import "../ListExamShift/listExamShift.css";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";

const Back = () => {
    const navigate = useNavigate();
	return (
		<div className="my-2">
			<button className="back-button flex justify-center align-middle gap-2" onClick={() => navigate(-1)}>
				<svg xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 -960 960 960" width="24px" fill="#007bff"><path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z"/></svg>
				<span>Quay lại</span>
			</button>
		</div>
	);
};

export default Back;
