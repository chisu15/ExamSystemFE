import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import QrScanner from "react-qr-scanner";
import Back from "../Back/back.js";
import { Html5QrcodeScanner } from "html5-qrcode";

const ScanInvigilator = ({ invigilator }) => {
	const [invigilatorCode, setInvigilatorCode] = useState("");
	const [manualInput, setManualInput] = useState("");
	const [submitStatus, setSubmitStatus] = useState("");
	const navigate = useNavigate();

	const onScanSuccess = (decodedText) => {
		console.log(`Scanned code: ${decodedText}`);
		// Xử lý QR code đã quét được
	};

	const onScanFailure = (error) => {
		console.warn(`QR Code scan error: ${error}`);
	};

	const handleScan = (data) => {
		if (data) {
			// Extract the `text` field from the scanned QR code data
			setInvigilatorCode(data.text);
		}
	};

	const handleError = (err) => {
		console.error(err);
	};

	const handleSubmit = async () => {
		const code = invigilatorCode || manualInput;
		const obj = JSON.parse(code);
		console.log(obj);

		const shiftId = 1; // Replace with the actual shift_id from your data
		console.log(code);

		const data = {
			shift_id: shiftId,
			teacher_code: obj.teacher_code,
		};
		console.log(data);
		try {
			const response = await axios.post(
				`http://${global.ip}:8080/api/v1/user-examshift/confirm-scan`,
				data
			);
			if (response.data.code === 200) {
				setSubmitStatus("Scan confirmed successfully.");
				setTimeout(() => {
					navigate("/"); // Redirect back to the main page after submission
				}, 2000);
			} else {
				setSubmitStatus("Failed to confirm scan.");
			}
		} catch (error) {
			console.error("Error confirming scan", error);
			setSubmitStatus("An error occurred while confirming the scan.");
		}
	};

	useEffect(() => {
		const scanner = new Html5QrcodeScanner("qr-reader", {
			fps: 10,
			qrbox: 250,
		});
		scanner.render(onScanSuccess, onScanFailure);

		return () => {
			scanner.clear();
		};
	}, []);

	// const previewStyle = {
	// 	height: 240,
	// 	width: 320,
	// };

	return (
		<div className="">
			<Back></Back>
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
					className="mx-auto w-4/12 rounded-xl mb-5 shadow-lg"
				></div>
				{/* <QrScanner
					delay={300}
					onError={handleError}
					onScan={handleScan}
				/> */}
				<p className="text-center font-semibold text-lg">
					Mã quét được: <br /> {invigilatorCode}
				</p>
				<div className=" border-b-2 border-b-[solid] my-3"></div>
				<div className="flex flex-col gap-3 w-screen justify-center text-center align-middle">
					<input
						type="text"
						placeholder={`Nhập Mã giảng viên ${invigilator}`}
						value={manualInput}
						onChange={(e) => setManualInput(e.target.value)}
						className="text-center p-2 w-3/5 mx-auto my-0 rounded-lg border border-solid border-gray-300"
					/>
					<button
						onClick={handleSubmit}
						className="bg-green-500 py-3 w-36 rounded-lg font-semibold text-[white] mx-auto my-0"
					>
						Xác nhận
					</button>
					{submitStatus && <p>{submitStatus}</p>}
				</div>
			</div>
		</div>
	);
};

export default ScanInvigilator;