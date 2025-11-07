import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import global from "../../global";
import "./faculty-dashboard.css";

export default function ExamShiftAssign() {
	const [shifts, setShifts] = useState([]);
	const [lecturers, setLecturers] = useState([]);
	const [assignments, setAssignments] = useState([]); // { shiftId, lecturerId }
	const [dates, setDates] = useState([]);
	const [selectedDate, setSelectedDate] = useState(null);
	const [loading, setLoading] = useState(true);

	const navigate = useNavigate();
	const sessionId = Cookies.get("session_id");

	useEffect(() => {
		fetchData();
	}, []);

	const formatDate = (dateStr, withTime = false) => {
		if (!dateStr) return "-";
		const d = new Date(dateStr);
		return d.toLocaleString("vi-VN", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			...(withTime && { hour: "2-digit", minute: "2-digit" }),
		});
	};

	const fetchData = async () => {
		try {
			const userId = Cookies.get("user_id");
			const userRes = await axios.post(
				`${global.ip}/api/v1/users/detail/${userId}`
			);
			const workplaceId = userRes.data.user.workplace_id;

			// Lấy danh sách ca thi còn trống
			const res = await axios.post(
				`${global.ip}/api/v1/exam-shifts/empty`,
				{
					workplace_id: workplaceId,
				}
			);
			const all = res.data.shifts || [];

			// Gom ngày
			const uniqueDates = [
				...new Set(
					all.map((s) =>
						s.starting_time ? s.starting_time.split("T")[0] : "Khác"
					)
				),
			];
			setDates(uniqueDates);
			setSelectedDate(uniqueDates[0]);
			setShifts(all);

			// Lấy danh sách giảng viên
			const lecRes = await axios.post(
				`${global.ip}/api/v1/users/workplace/`,
				{
					workplace_id: workplaceId,
				}
			);
			setLecturers(lecRes.data.users || []);
		} catch (err) {
			console.error("Lỗi khi tải dữ liệu:", err);
		} finally {
			setLoading(false);
		}
	};

	const handleSelectLecturer = (shiftId, lecturerId) => {
		setAssignments((prev) => {
			const exist = prev.find((a) => a.shiftId === shiftId);
			if (exist)
				return prev.map((a) =>
					a.shiftId === shiftId ? { ...a, lecturerId } : a
				);
			return [...prev, { shiftId, lecturerId }];
		});
	};

	const handleConfirm = async () => {
		const validAssignments = assignments.filter((a) => a.lecturerId);
		if (validAssignments.length === 0)
			return alert("⚠️ Chưa chọn giảng viên nào để gán!");

		const confirmed = window.confirm(
			`Xác nhận gán ${validAssignments.length} ca thi cho giảng viên đã chọn?`
		);
		if (!confirmed) return;

		try {
			for (const a of validAssignments) {
				await axios.post(`${global.ip}/api/v1/user-examshift/assign`, {
					session_id: sessionId,
					user_id: a.lecturerId,
					shift_id: a.shiftId,
				});
			}
			alert("✅ Gán giảng viên thành công!");
			setAssignments([]);
			fetchData();
		} catch (err) {
			console.error("Lỗi khi gán:", err);
			alert("❌ Lỗi khi gửi yêu cầu gán giảng viên!");
		}
	};

	const handleReset = () => {
		if (assignments.length === 0) return;
		const confirmed = window.confirm(
			"Bạn có chắc muốn xóa toàn bộ lựa chọn?"
		);
		if (confirmed) setAssignments([]);
	};

	const removeAssignment = (shiftId) => {
		setAssignments((prev) => prev.filter((a) => a.shiftId !== shiftId));
	};

	if (loading)
		return (
			<div className="faculty-dashboard text-center text-gray-500">
				<p>Đang tải dữ liệu...</p>
			</div>
		);

	const filteredShifts = shifts.filter((s) =>
		s.starting_time
			? s.starting_time.startsWith(selectedDate)
			: selectedDate === "Khác"
	);

	// Lấy danh sách chi tiết các ca đã gán tạm
	const assignedDetails = assignments
		.filter((a) => a.lecturerId)
		.map((a) => {
			const shift = shifts.find((s) => s.id === a.shiftId);
			const lecturer = lecturers.find((l) => l.id == a.lecturerId);
			return {
				...a,
				shiftName: shift ? shift.subject_name : "",
				room: shift ? `${shift.building} - ${shift.classroom}` : "",
				time: shift ? formatDate(shift.starting_time, true) : "",
				lecturerName: lecturer ? lecturer.name : "",
			};
		});

	return (
		<div className="faculty-dashboard">
			<div className="dashboard-container">
				{/* --- Header có nút quay lại --- */}

				<button
					className="back-btn"
					onClick={() => navigate("/faculty-dashboard")}
				>
					⬅ Quay lại
				</button>
				<h1 className="dashboard-title">
					🧾 Gán giảng viên cho ca thi
				</h1>

				{/* --- Bộ chọn ngày --- */}
				<div className="date-selector">
					{dates.map((d) => (
						<button
							key={d}
							className={`date-btn ${
								selectedDate === d ? "active" : ""
							}`}
							onClick={() => setSelectedDate(d)}
						>
							{formatDate(d)}
						</button>
					))}
				</div>

				{/* --- Bảng ca thi --- */}
				<div className="table-container">
					<table className="faculty-table">
						<thead>
							<tr>
								<th>STT</th>
								<th>Môn học</th>
								<th>Mã HP</th>
								<th>Tòa / Phòng</th>
								<th>Hình thức</th>
								<th>Bắt đầu</th>
								<th>Cần</th>
								<th>Còn thiếu</th>
								<th>Chọn giảng viên</th>
							</tr>
						</thead>
						<tbody>
							{filteredShifts.length > 0 ? (
								filteredShifts.map((s, i) => (
									<tr key={s.id}>
										<td>{i + 1}</td>
										<td>{s.subject_name}</td>
										<td>{s.subject_code}</td>
										<td>
											{s.building} - {s.classroom}
										</td>
										<td>{s.exam_format}</td>
										<td>
											{formatDate(s.starting_time, true)}
										</td>
										<td>{s.invigilator_count}</td>
										<td
											style={{
												color: "red",
												fontWeight: 600,
											}}
										>
											{s.remaining_slots}
										</td>
										<td>
											<select
												defaultValue=""
												className="assign-select"
												onChange={(e) =>
													handleSelectLecturer(
														s.id,
														e.target.value
													)
												}
											>
												<option value="">
													-- Chọn giảng viên --
												</option>
												{lecturers.map((lec) => (
													<option
														key={lec.id}
														value={lec.id}
													>
														{lec.name}
													</option>
												))}
											</select>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td
										colSpan="9"
										style={{
											textAlign: "center",
											color: "#6b7280",
										}}
									>
										Không có ca thi trong ngày này
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>



				{/* --- Nút hành động --- */}
				<div className="dashboard-actions">
					<button className="btn blue" onClick={handleConfirm}>
						Xác nhận gán ({assignedDetails.length})
					</button>
					<button className="btn orange" onClick={handleReset}>
						Đặt lại
					</button>
				</div>
        				{/* --- Các ca đã gán tạm --- */}
				{assignedDetails.length > 0 && (
					<div className="selected-shifts">
						<h2>Các ca đã gán tạm ({assignedDetails.length})</h2>
						<table className="selected-table">
							<thead>
								<tr>
									<th>Môn học</th>
									<th>Giảng viên</th>
									<th>Phòng</th>
									<th>Thời gian</th>
									<th></th>
								</tr>
							</thead>
							<tbody>
								{assignedDetails.map((a) => (
									<tr key={a.shiftId}>
										<td>{a.shiftName}</td>
										<td>{a.lecturerName}</td>
										<td>{a.room}</td>
										<td>{a.time}</td>
										<td>
											<button
												className="remove-btn"
												onClick={() =>
													removeAssignment(a.shiftId)
												}
											>
												✖ Bỏ gán
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}
