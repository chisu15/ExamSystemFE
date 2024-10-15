import React, { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner"; // Import thư viện qr-scanner
import "./QrStyles.css"; // CSS tùy chỉnh

const QrReader = ({ onScanSuccess }) => {
	const videoRef = useRef(null); // Tham chiếu đến phần tử video
	const [scanner, setScanner] = useState(null); // State lưu trữ instance của qr-scanner
	const [error, setError] = useState(null); // State để lưu lỗi khi camera không truy cập được
	const [scannedData, setScannedData] = useState(""); // Lưu kết quả mã QR từ camera hoặc hình ảnh

	// Quét mã QR từ camera
	useEffect(() => {
		if (videoRef.current) {
			// Khởi tạo QR scanner
			const qrScanner = new QrScanner(
				videoRef.current,
				(result) => {
					setScannedData(result.data);
					onScanSuccess(result.data); // Gọi hàm onScanSuccess khi scan thành công
				},
				{
					onDecodeError: (error) =>
						console.log("Decode error:", error),
					highlightScanRegion: true, // Tô sáng vùng mã QR
					preferredCamera: "environment", // Sử dụng camera sau nếu có
				}
			);

			qrScanner
				.start()
				.then(() => setScanner(qrScanner)) // Bắt đầu quét mã QR
				.catch((err) => {
					console.error("Camera access error:", err);
					setError(
						"Không thể truy cập vào camera. Vui lòng cấp quyền sử dụng camera."
					);
				});

			return () => {
				qrScanner.stop(); // Dừng scanner khi component bị unmount
			};
		}
	}, [onScanSuccess]);

	// Quét mã QR từ hình ảnh tải lên
	const handleFileUpload = async (event) => {
		const file = event.target.files[0]; // Lấy file được chọn
		if (file) {
			try {
				const result = await QrScanner.scanImage(file); // Sử dụng QrScanner để phân tích hình ảnh
				setScannedData(result); // Lưu kết quả mã QR vào state
				onScanSuccess(result); // Gọi callback nếu quét thành công
			} catch (error) {
				console.error("Error scanning image:", error);
				setError(
					"Không thể phân tích mã QR từ hình ảnh này. Vui lòng thử lại."
				);
			}
		}
	};

	return (
		<div className="qr-reader-container">
			{/* Nếu có lỗi, hiển thị thông báo lỗi */}
			{error ? (
				<p className="error-message">{error}</p>
			) : (
				<>
					<video ref={videoRef} className="qr-video" />
					<p>Hoặc chọn hình ảnh chứa mã QR:</p>
					<div className="file-input-container">
						<label
							htmlFor="file-upload"
							className="file-upload-label"
						>
							Chọn ảnh từ thiết bị:
						</label>
						<input
							type="file"
							id="file-upload"
							accept="image/*"
							onChange={handleFileUpload}
							className="file-upload-input"
						/>
					</div>
				</>
			)}

			{/* Hiển thị kết quả mã QR đã quét */}
			{scannedData && <p>Kết quả quét: {scannedData}</p>}
		</div>
	);
};

export default QrReader;
