import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import global from "../../global";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./user-tabs.css";

export default function UserDetails() {
	const { id } = useParams();
	const navigate = useNavigate();
	const sessionId = Cookies.get("session_id");
	const userId = Cookies.get("user_id");

	const [user, setUser] = useState(null);
	const [qrCode, setQrCode] = useState(null);
	const [assignedShifts, setAssignedShifts] = useState([]); // TAB 2
	const [completedShifts, setCompletedShifts] = useState([]); // TAB 3
	const [totalCost, setTotalCost] = useState(0);
	const [activeTab, setActiveTab] = useState("info");
	const [loading, setLoading] = useState(true);
	const [examSummary, setExamSummary] = useState(null);
	const total = examSummary?.number_shift || 0;
	const completed = examSummary?.completed_shifts || 0;
	const percent =
		total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;

	// Pagination
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(5);

	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentItems = completedShifts.slice(
		indexOfFirstItem,
		indexOfLastItem
	);
	const totalPages = Math.ceil(completedShifts.length / itemsPerPage);

	const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
	const handleNext = () => {
		if (currentPage < totalPages) setCurrentPage(currentPage + 1);
	};
	const handlePrev = () => {
		if (currentPage > 1) setCurrentPage(currentPage - 1);
	};
	const handleItemsPerPageChange = (e) => {
		setItemsPerPage(Number(e.target.value));
		setCurrentPage(1);
	};

	const renderPagination = () => {
		const pages = [];
		const maxPageButtons = 5;
		let startPage = Math.max(
			1,
			currentPage - Math.floor(maxPageButtons / 2)
		);
		let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
		if (endPage === totalPages) {
			startPage = Math.max(1, totalPages - maxPageButtons + 1);
		}
		for (let i = startPage; i <= endPage; i++) {
			pages.push(
				<button
					key={i}
					onClick={() => handlePageChange(i)}
					className={`px-3 py-1 rounded-md ${
						currentPage === i
							? "bg-blue-500 text-white"
							: "bg-gray-200 text-gray-800 hover:bg-gray-300"
					}`}
				>
					{i}
				</button>
			);
		}
		return pages;
	};

	const formatDateTime = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleString("vi-VN", {
			hour: "2-digit",
			minute: "2-digit",
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
	};

	// 🌐 TAB 1: Thông tin người dùng + lịch sử đã coi
	const fetchUserInfo = async () => {
		try {
			const res = await axios.post(
				`${global.ip}/api/v1/users/detail/${id}`
			);
			if (res.data.code === 200) {
				const { user, shiftData, totalCost } = res.data;
				setUser(user);
				setCompletedShifts(shiftData || []);
				setTotalCost(totalCost || 0);

				try {
					const qrRes = await axios.post(
						`${global.ip}/api/v1/users/qr-code/${id}`
					);
					if (qrRes.status === 200) setQrCode(qrRes.data.qr_code);
				} catch {
					console.warn("Không có QR code");
				}
			} else {
				toast.error("Không tìm thấy thông tin người dùng.");
			}
		} catch (err) {
			console.error(err);
			toast.error("Lỗi khi tải dữ liệu người dùng!");
		}
	};

	// 🌐 TAB 2: Ca thi được phân công
	const fetchAssignedShifts = async () => {
		try {
			const res = await axios.post(
				`${global.ip}/api/v1/user-examshift/assigned`,
				{
					session_id: sessionId,
				}
			);
			if (res.data.code === 200) {
				setAssignedShifts(res.data.shifts || []);
			} else {
				toast.warn("Không có ca thi nào được phân công.");
			}
		} catch (err) {
			console.error("Lỗi khi lấy danh sách ca thi được phân công:", err);
			toast.error("Không thể tải danh sách ca thi được phân công.");
		}
	};

	const fetchExamSummary = async () => {
		try {
			const res = await axios.post(
				`${global.ip}/api/v1/users/exam-summary/${userId}`
			);
			if (res.data.code === 200) {
				setExamSummary(res.data.data);
			}
		} catch (err) {
			console.error("Lỗi khi lấy thống kê đợt thi:", err);
		}
	};

	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			if (activeTab === "info" || activeTab === "history")
				await fetchUserInfo();
			if (activeTab === "schedule") {
				await fetchAssignedShifts();
				await fetchExamSummary();
			}

			setLoading(false);
		};
		loadData();
	}, [activeTab]);

	if (loading)
		return (
			<div className="user-details-container text-center text-gray-500 mt-40">
				Đang tải dữ liệu...
			</div>
		);

	return (
		<div className="user-details-container">
			{/* --- Tabs header --- */}
			<div className="tabs-header">
				<button
					className={`tab-btn ${
						activeTab === "info" ? "active" : ""
					}`}
					onClick={() => setActiveTab("info")}
				>
					Thông tin người dùng
				</button>
				<button
					className={`tab-btn ${
						activeTab === "schedule" ? "active" : ""
					}`}
					onClick={() => setActiveTab("schedule")}
				>
					Lịch coi thi
				</button>
				<button
					className={`tab-btn ${
						activeTab === "history" ? "active" : ""
					}`}
					onClick={() => setActiveTab("history")}
				>
					Các ca thi đã coi
				</button>
			</div>

			{/* --- Tab content --- */}
			<div className="tab-content">
				{/* TAB 1: Thông tin người dùng */}
				{activeTab === "info" && user && (
					<div className="user-info-tab">
						<div className="bg-white shadow-lg rounded-lg p-6 mt-8">
							<div className="flex flex-col items-center mb-5">
								{qrCode ? (
									<img
										src={qrCode}
										alt="QR Code"
										className="w-32 h-32 rounded-lg border-4 border-blue-400 shadow-lg mb-4"
									/>
								) : (
									<div className="w-32 h-32 flex items-center justify-center bg-gray-200 text-gray-500 rounded-lg">
										Không có QR
									</div>
								)}
								<h2 className="text-2xl font-bold text-gray-700 mb-1">
									{user.name}
								</h2>
								<p className="text-gray-500 italic mb-4">
									{user.position}
								</p>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
								{[
									{ label: "Email", value: user.email },
									{
										label: "Số điện thoại",
										value: user.phone,
									},
									{ label: "Cơ quan", value: user.workplace },
									{
										label: "Số tài khoản",
										value: `${user.account} (${user.bank})`,
									},
									{
										label: "Mã số thuế",
										value: user.tax_code,
									},
									{
										label: "Mã giảng viên",
										value: user.teacher_code,
									},
								].map((item, idx) => (
									<div key={idx} className="info-card">
										<p className="label">{item.label}</p>
										<p className="value">
											{item.value || "—"}
										</p>
									</div>
								))}
							</div>
						</div>
					</div>
				)}

				{/* TAB 2: Lịch coi thi */}
				{activeTab === "schedule" && (
					<div className="exam-schedule-tab">
						<div className="flex justify-between items-center mt-8 mb-4">
							<h2 className="text-2xl font-semibold text-blue-600">
								Lịch coi thi
							</h2>
							<button
								className="btn blue"
								onClick={() => navigate("/faculty/register")}
							>
								Đăng ký ca thi
							</button>
						</div>

						{/* 🟦 Thống kê đợt thi */}
						{/* --- Exam Round Summary --- */}
						{examSummary && examSummary.exam_round ? (
							(() => {
								const total = examSummary.number_shift ?? 0;
								const assigned =
									examSummary.assigned_shifts ?? 0;
								const completed =
									examSummary.completed_shifts ?? 0;
								const remaining =
									examSummary.remaining_shifts ?? 0;
								const percent =
									total > 0
										? Math.min(
												100,
												Math.round(
													(completed / total) * 100
												)
										  )
										: 0;

								return (
									<div className="exam-round-card relative bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 mb-8 shadow-md overflow-hidden">
										{/* Header */}
										<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
											<div>
												<h2 className="text-xl font-semibold text-blue-700">
													{
														examSummary.exam_round
															?.name
													}
												</h2>
												<p className="text-sm text-gray-600 mt-1">
													{examSummary.exam_round
														?.description ||
														"Đợt thi hiện tại của giảng viên"}
												</p>
											</div>
											<div className="text-sm text-gray-500 mt-2 sm:mt-0">
												{new Date(
													examSummary.exam_round?.start_date
												).toLocaleDateString(
													"vi-VN"
												)}{" "}
												—{" "}
												{new Date(
													examSummary.exam_round?.end_date
												).toLocaleDateString("vi-VN")}
											</div>
										</div>

										{/* Thống kê dạng grid */}
										<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
											<div className="bg-white shadow-sm rounded-lg p-3 border border-gray-100">
												<p className="text-gray-500 text-sm">
													Tổng số ca cần hoàn thành
												</p>
												<h3 className="text-lg font-bold text-blue-700">
													{total}
												</h3>
											</div>
											<div className="bg-white shadow-sm rounded-lg p-3 border border-gray-100">
												<p className="text-gray-500 text-sm">
													Số ca được phân công
												</p>
												<h3 className="text-lg font-bold text-indigo-600">
													{assigned}
												</h3>
											</div>
											<div className="bg-white shadow-sm rounded-lg p-3 border border-gray-100">
												<p className="text-gray-500 text-sm">
													Đã hoàn thành
												</p>
												<h3 className="text-lg font-bold text-yellow-600">
													{completed}
												</h3>
											</div>
											<div className="bg-white shadow-sm rounded-lg p-3 border border-gray-100">
												<p className="text-gray-500 text-sm">
													Còn lại
												</p>
												<h3 className="text-lg font-bold text-red-600">
													{remaining}
												</h3>
											</div>
										</div>

										{/* Progress */}
										<div className="w-full bg-gray-200 rounded-full h-3 mt-2 overflow-hidden">
											<div
												className={`h-3 transition-all duration-500 ${
													percent < 50
														? "bg-yellow-400"
														: percent < 100
														? "bg-blue-500"
														: "bg-green-500"
												}`}
												style={{ width: `${percent}%` }}
											></div>
										</div>
										<p className="text-center text-sm text-gray-700 mt-2">
											Hoàn thành <b>{completed}</b> /{" "}
											<b>{total}</b> ca thi —{" "}
											<span className="font-semibold text-blue-600">
												{percent}%
											</span>
										</p>
									</div>
								);
							})()
						) : (
							<div className="text-gray-500 italic text-center py-4">
								Không có dữ liệu đợt thi
							</div>
						)}
						{/* 🧾 Danh sách ca thi */}
						{assignedShifts.length === 0 ? (
							<div className="empty-state">
								Hiện chưa có ca thi nào được phân công.
							</div>
						) : (
							<div className="table-responsive">
								<table className="faculty-table">
									<thead>
										<tr>
											<th>STT</th>
											<th>Môn học</th>
											<th>Phòng</th>
											<th>Hình thức</th>
											<th>Thời gian</th>
										</tr>
									</thead>
									<tbody>
										{assignedShifts.map((s, i) => (
											<tr key={s.id}>
												<td>{i + 1}</td>
												<td>{s.subject_name}</td>
												<td>
													{s.building}/{s.classroom}
												</td>
												<td>{s.exam_format}</td>
												<td>
													{formatDateTime(
														s.starting_time
													)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				)}

				{/* TAB 3: Các ca thi đã coi + phân trang */}
				{activeTab === "history" && (
					<div className="exam-history-tab mt-8">
						<div className="summary-cards">
							<div className="summary-item">
								<p>Số ca thi đã coi</p>
								<h2>
									<b>{completedShifts.length}</b>
								</h2>
							</div>
							<div className="summary-item">
								<p>Tổng tiền</p>
								<h2>
									<b>
										{new Intl.NumberFormat("vi-VN").format(
											totalCost
										)}{" "}
										VND
									</b>
								</h2>
							</div>
						</div>

						{completedShifts.length === 0 ? (
							<div className="empty-state">
								Chưa có lịch sử coi thi
							</div>
						) : (
							<>
								<div className="flex justify-end items-center mb-3">
									<label className="text-sm text-gray-700">
										Hiển thị:{" "}
										<select
											value={itemsPerPage}
											onChange={handleItemsPerPageChange}
											className="border rounded p-1"
										>
											<option value={5}>5</option>
											<option value={10}>10</option>
											<option value={20}>20</option>
										</select>{" "}
										mục mỗi trang
									</label>
								</div>

								<div className="history-list">
									{currentItems.map((s, i) => (
										<div
											key={s.id}
											className="history-card"
										>
											<h3>
												{i + 1 + indexOfFirstItem}.{" "}
												{s.subject_name}
											</h3>
											<p>
												<strong>Phòng:</strong>{" "}
												{s.building}/{s.classroom}
											</p>
											<p>
												<strong>Thời gian:</strong>{" "}
												{formatDateTime(
													s.starting_time
												)}
											</p>
											<p>
												<strong>Hình thức:</strong>{" "}
												{s.exam_format}
											</p>
											<p>
												<strong>Thù lao:</strong>{" "}
												{s.invigilator_cost}đ
											</p>
										</div>
									))}
								</div>

								<div className="pagination mt-6 flex justify-center items-center gap-2">
									<button
										onClick={handlePrev}
										disabled={currentPage === 1}
										className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
									>
										Trước
									</button>
									{renderPagination()}
									<button
										onClick={handleNext}
										disabled={currentPage === totalPages}
										className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
									>
										Sau
									</button>
								</div>
							</>
						)}
					</div>
				)}
			</div>

			<ToastContainer />
		</div>
	);
}
