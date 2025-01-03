// import React, { useState, useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import axios from "axios";
// import Back from "../Back/back.js";
// import { Html5QrcodeScanner } from "html5-qrcode";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import global from "../../global.js";
// import useAuth from "../../hooks/Auth/useAuth.js"; 
// import Cookies from "js-cookie";
// import QrScanner from 'qr-scanner'; 

// const ScanInvigilator = ({ invigilator }) => {
// 	useAuth(); 

// 	const [invigilatorCode, setInvigilatorCode] = useState("");
// 	const [manualInput, setManualInput] = useState("");
// 	const [submitStatus, setSubmitStatus] = useState("");
// 	const [isScanned, setIsScanned] = useState(false); 
// 	const [scanner, setScanner] = useState(null);
// 	const navigate = useNavigate();
// 	const { id } = useParams();
// 	const sessionId = Cookies.get("session_id");

// 	const onScanSuccess = (decodedText) => {
// 		if (!isScanned) {
// 			try {
// 				const obj = JSON.parse(decodedText);
// 				setInvigilatorCode(obj.teacher_code);


// 				toast.success("Quét mã thành công!");
				
// 				setIsScanned(true);

// 				if (scanner) {
// 					scanner.clear();
// 				}
// 			} catch (error) {
// 				console.error("Error parsing QR code:", error);
// 				toast.error("Mã QR không hợp lệ.");
// 			}
// 		}
// 	};


// 	const onScanFailure = (error) => {
// 		if (!isScanned) {
// 			console.warn(`QR Code scan error: ${error}`);
// 		}
// 	};

// 	const handleSubmit = async () => {
// 		const code = invigilatorCode || manualInput;
// 		console.log("code:.....", code);

// 		try {
// 			// const obj = JSON.parse(code);
// 			const shiftId = id;

// 			const data = {
// 				session_id: sessionId,
// 				shift_id: shiftId,
// 				teacher_code: code,
// 			};
// 			console.log("1231231221", data);

// 			const response = await axios.post(
// 				`${global.ip}/api/v1/user-examshift/confirm-scan`,
// 				data
// 			);

// 			if (response.data.code === 200) {
// 				setSubmitStatus("Scan confirmed successfully.");
// 				setTimeout(() => {
// 					toast.success("Xác nhận thành công!");
// 				}, 2000);
// 			} else {
// 				toast.error(response.data.message);
// 				setSubmitStatus("Failed to confirm scan.");
// 			}
// 		} catch (error) {
// 			console.error("Error confirming scan", error);
// 			setSubmitStatus("An error occurred while confirming the scan.");
// 			toast.error("Xác nhận thất bại");
// 		}
// 	};

// 	// Khởi tạo `Html5QrcodeScanner`
// 	useEffect(() => {
// 		const newScanner = new Html5QrcodeScanner("qr-reader", {
// 			fps: 30,
// 			qrbox: 400,
// 			aspectRatio: 0.5 / 0.25,
// 		});

// 		newScanner.render(onScanSuccess, onScanFailure);
// 		setScanner(newScanner);
// 		return () => {
// 			if (newScanner) {
// 				newScanner.clear();
// 			}
// 		};
// 	}, []);

// 	return (
// 		<div className="">
// 			<Back />
// 			<div className="flex-col">
// 				<p className="text-center font-semibold text-2xl mb-4">
// 					Quét QR giám thị {invigilator}
// 					<br />{" "}
// 					<span className="text-center font-normal opacity-50 text-base">
// 						Hoặc nhập trực tiếp mã
// 					</span>
// 				</p>
// 				<div
// 					id="qr-reader"
// 					className="mx-auto w-7/12 rounded-xl mb-5 shadow-lg"
// 				></div>
// 				<p className="text-center font-semibold text-lg my-6">
// 					Mã quét được: <br /> {invigilatorCode}
// 				</p>
// 				{/* <div className=" border-b-2 border-b-[solid] my-3"></div> */}
// 				<div className="flex flex-col gap-3 w-screen justify-center text-center align-middle">
// 					<input
// 						type="text"
// 						placeholder={`Nhập Mã giảng viên ${invigilator}`}
// 						value={manualInput}
// 						onChange={(e) => setManualInput(e.target.value)}
// 						className="text-center py-3 w-7/12 mx-auto my-0 rounded-lg border border-solid border-gray-300"
// 					/>
// 					<button
// 						onClick={handleSubmit}
// 						className="bg-green-500 py-3 w-7/12 rounded-lg font-semibold text-[white] mx-auto my-0"
// 					>
// 						Xác nhận
// 						<ToastContainer />
// 					</button>
// 					{submitStatus && <p>{submitStatus}</p>}
// 				</div>
// 			</div>
// 		</div>
// 	);
// };

// export default ScanInvigilator;

// 				HTML5-QR-SCANNER CUSTOM

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Back from "../Back/back.js";
import { Html5QrcodeScanner } from "html5-qrcode";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import global from "../../global.js";
import useAuth from "../../hooks/Auth/useAuth.js"; 
import Cookies from "js-cookie";

const ScanInvigilator = ({ invigilator, examCodeProp }) => {
	useAuth(); 

	const [invigilatorCode, setInvigilatorCode] = useState("");
	const [manualInput, setManualInput] = useState("");
	const [submitStatus, setSubmitStatus] = useState("");
	const [isScanned, setIsScanned] = useState(false); 
	const [scanner, setScanner] = useState(null);
	const navigate = useNavigate();
	const { examCode, id } = useParams();
	console.log({ examCode, id });
	
	const sessionId = Cookies.get("session_id");

	// Function for handling successful scan
	const onScanSuccess = (decodedText) => {
		if (!isScanned) {
			try {
				const obj = JSON.parse(decodedText);
				setInvigilatorCode(decodedText);

				toast.success("Quét mã thành công!");
				
				setIsScanned(true);

				// Stop the scanner after successful scan
				if (scanner) {
					scanner.clear();
				}
			} catch (error) {
				console.error("Error parsing QR code:", error);
				toast.error("Mã QR không hợp lệ.");
			}
		}
	};

	// Function for handling scan failure
	const onScanFailure = (error) => {
		if (!isScanned) {
			console.warn(`QR Code scan error: ${error}`);
		}
	};

	// Function to handle form submission
	const handleSubmit = async () => {
		const code = invigilatorCode || manualInput;
		console.log("code:.....", code);

		try {
			const shiftId = id;

			const data = {
				session_id: sessionId,
				shift_id: shiftId,
				teacher_code: code,
			};
			console.log("1231231221", data);

			const response = await axios.post(
				`${global.ip}/api/v1/user-examshift/confirm-scan`,
				data
			);

			if (response.data.code === 200) {
				setSubmitStatus("Scan confirmed successfully.");
				setTimeout(() => {
					toast.success("Xác nhận thành công!");
				}, 2000);
				setTimeout(() => {
					navigate(`/exam-shift/${examCode}`)
				}, 2000);
			} else {
				toast.error(response.data.message);
				setSubmitStatus("Failed to confirm scan.");
			}
		} catch (error) {
			console.error("Error confirming scan", error);
			setSubmitStatus("An error occurred while confirming the scan.");
			toast.error("Xác nhận thất bại");
		}
	};

	// Initialize `Html5QrcodeScanner`
	useEffect(() => {
		const newScanner = new Html5QrcodeScanner("qr-reader", {
			fps: 30,
			qrbox: 400,
			aspectRatio: 0.5 / 0.25,
		});

		newScanner.render(onScanSuccess, onScanFailure);
		setScanner(newScanner);

		// Cleanup scanner when component unmounts
		return () => {
			if (newScanner) {
				newScanner.clear();
			}
		};
	}, [isScanned]);

	return (
		<div className="">
			<Back examCode= {examCode}/>
			<div className="flex-col">
				<p className="text-center font-semibold text-2xl mb-4">
					Quét QR giám thị {invigilator}
					<br />{" "}
					<span className="text-center font-normal opacity-50 text-base">
						Hoặc nhập trực tiếp mã
					</span>
				</p>
				<div
					id="qr-reader"
					className="mx-auto w-7/12 rounded-xl mb-5 shadow-lg"
				></div>
				<p className="text-center font-semibold text-lg my-6">
					Mã quét được: <br /> {invigilatorCode}
				</p>
				{/* Input and submit button */}
				<div className="flex flex-col gap-3 w-screen justify-center text-center align-middle">
					<input
						type="text"
						placeholder={`Nhập Mã giảng viên ${invigilator}`}
						value={manualInput}
						onChange={(e) => setManualInput(e.target.value)}
						className="text-center py-3 w-7/12 mx-auto my-0 rounded-lg border border-solid border-gray-300"
					/>
					<button
						onClick={handleSubmit}
						className="bg-green-500 py-3 w-7/12 rounded-lg font-semibold text-[white] mx-auto my-0"
					>
						Xác nhận
						<ToastContainer />
					</button>
					{submitStatus && <p>{submitStatus}</p>}
				</div>
			</div>
		</div>
	);
};

export default ScanInvigilator;


//  			WITH QR-SCANNER

// import React, { useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import axios from "axios";
// import Back from "../Back/back.js";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import global from "../../global.js";
// import useAuth from "../../hooks/Auth/useAuth.js"; 
// import Cookies from "js-cookie";
// import QrReader from "../QrReader/QrReader"; // Import QrReader mới

// const ScanInvigilator = ({ invigilator }) => {
// 	useAuth(); 

// 	const [invigilatorCode, setInvigilatorCode] = useState("");
// 	const [manualInput, setManualInput] = useState("");
// 	const [submitStatus, setSubmitStatus] = useState("");
// 	const [isScanned, setIsScanned] = useState(false); 
// 	const navigate = useNavigate();
// 	const { id } = useParams();
// 	const sessionId = Cookies.get("session_id");

// 	// Success callback for QR scanner
// 	const onScanSuccess = (result) => {
// 		if (!isScanned) {
// 			try {
// 				const obj = JSON.parse(result);
// 				setInvigilatorCode(obj.teacher_code);
// 				toast.success("Quét mã thành công!");
// 				setIsScanned(true); // Set state để ngăn việc quét tiếp
// 			} catch (error) {
// 				console.error("Error parsing QR code:", error);
// 				toast.error("Mã QR không hợp lệ.");
// 			}
// 		}
// 	};

// 	const handleSubmit = async () => {
// 		const code = invigilatorCode || manualInput;
// 		console.log("code:.....", code);

// 		try {
// 			const shiftId = id;

// 			const data = {
// 				session_id: sessionId,
// 				shift_id: shiftId,
// 				teacher_code: code,
// 			};
// 			console.log("1231231221", data);

// 			const response = await axios.post(
// 				`${global.ip}/api/v1/user-examshift/confirm-scan`,
// 				data
// 			);

// 			if (response.data.code === 200) {
// 				setSubmitStatus("Scan confirmed successfully.");
// 				setTimeout(() => {
// 					toast.success("Xác nhận thành công!");
// 				}, 2000);
// 			} else {
// 				toast.error(response.data.message);
// 				setSubmitStatus("Failed to confirm scan.");
// 			}
// 		} catch (error) {
// 			console.error("Error confirming scan", error);
// 			setSubmitStatus("An error occurred while confirming the scan.");
// 			toast.error("Xác nhận thất bại");
// 		}
// 	};

// 	return (
// 		<div className="">
// 			<Back />
// 			<div className="flex-col">
// 				<p className="text-center font-semibold text-2xl mb-4">
// 					Quét QR giám thị {invigilator}
// 					<br />{" "}
// 					<span className="text-center font-normal opacity-50 text-base">
// 						Hoặc nhập trực tiếp mã
// 					</span>
// 				</p>

// 				{/* Thay thế với QrReader */}
// 				{!isScanned && (
// 					<div className="qr-scanner-container mx-auto w-7/12 rounded-xl mb-5 shadow-lg">
// 						<QrReader onScanSuccess={onScanSuccess} />
// 					</div>
// 				)}

// 				<p className="text-center font-semibold text-lg my-6">
// 					Mã quét được: <br /> {invigilatorCode}
// 				</p>

// 				<div className="flex flex-col gap-3 w-screen justify-center text-center align-middle">
// 					<input
// 						type="text"
// 						placeholder={`Nhập Mã giảng viên ${invigilator}`}
// 						value={manualInput}
// 						onChange={(e) => setManualInput(e.target.value)}
// 						className="text-center py-3 w-7/12 mx-auto my-0 rounded-lg border border-solid border-gray-300"
// 					/>
// 					<button
// 						onClick={handleSubmit}
// 						className="bg-green-500 py-3 w-7/12 rounded-lg font-semibold text-[white] mx-auto my-0"
// 					>
// 						Xác nhận
// 						<ToastContainer />
// 					</button>
// 					{submitStatus && <p>{submitStatus}</p>}
// 				</div>
// 			</div>
// 		</div>
// 	);
// };

// export default ScanInvigilator;
