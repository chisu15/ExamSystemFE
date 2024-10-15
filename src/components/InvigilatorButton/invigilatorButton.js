import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import global from "../../global.js";

const InvigilatorButton = ({ invigilatorNumber, examCode, shiftId, state }) => {
	const navigate = useNavigate();
	// const { examCode } = useParams();
	const [dataUser, setDataUser] = useState(null); // State để lưu dữ liệu của user

	const handleCheckAndCreate = async () => {
		try {
			const response = await axios.post(
				`http://${global.ip}:8080/api/v1/users/detail-byCode/${examCode}`
			);
			if (response.status === 200) {
				setDataUser(response.data);
				navigate(`/scan-invigilator-${invigilatorNumber}/${examCode}/${shiftId}`);
			} else {
				console.error("Failed to fetch user data");
			}
		} catch (error) {
			console.error("Error while fetching user data: ", error);
		}
	};

	return (
		<div className="flex flex-col items-center mb-2">
			<span className="text-gray-600 font-semibold">
				Quét QR cho Giám thị {invigilatorNumber}
			</span>
			<button
				className={`rounded-3xl p-2 transition-all mt-3 hover:shadow-xl ${
					state === "1"
						? "bg-green-600 cursor-not-allowed"
						: "bg-blue-500 hover:bg-blue-600 cursor-pointer"
				}`}
				onClick={state == "1" ? undefined : handleCheckAndCreate}
				disabled={state === "1"} 
			>
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
		</div>
	);
};


export default InvigilatorButton;
