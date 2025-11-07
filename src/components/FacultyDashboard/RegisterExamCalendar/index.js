import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import global from "../../../global";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./exam-calendar.css";

const localizer = momentLocalizer(moment);

// Các khung giờ chuẩn
const TIME_SLOTS = ["08:00", "10:00", "13:30", "15:30", "17:30"];

export default function RegisterExamCalendar() {
	const [shifts, setShifts] = useState([]);
	const [registeredDays, setRegisteredDays] = useState([]); // [{date, slots:[], note}]
	const [selectedDate, setSelectedDate] = useState(null);
	const [selectedSlots, setSelectedSlots] = useState([]);
	const [note, setNote] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [loading, setLoading] = useState(true);

	const userId = Cookies.get("user_id");
	const sessionId = Cookies.get("session_id");

	useEffect(() => {
		fetchShifts();
		fetchRegisteredDays();
	}, []);

	// ✅ Lấy danh sách ngày có ca thi
	const fetchShifts = async () => {
		try {
			const res = await axios.post(
				`${global.ip}/api/v1/exam-shifts/empty`
			);
			if (res.data.code === 200) {
				const data = res.data.shifts.map((s) => ({
					...s,
					date: moment(s.starting_time).format("YYYY-MM-DD"),
				}));
				setShifts(data);
			}
		} catch (err) {
			console.error("Lỗi lấy ca thi:", err);
		} finally {
			setLoading(false);
		}
	};

	// ✅ Lấy danh sách các free_date (datetime)
	const fetchRegisteredDays = async () => {
		try {
			const res = await axios.post(
				`${global.ip}/api/v1/user-free/user/${userId}`
			);
			if (res.data.code === 200) {
				// Group theo ngày
				const grouped = {};
				res.data.days.forEach((d) => {
					const date = moment(d.free_date).format("YYYY-MM-DD");
					const time = moment(d.free_date).format("HH:mm");
					if (!grouped[date]) grouped[date] = { slots: [], note: "" };
					grouped[date].slots.push(time);
					grouped[date].note = d.note || "";
				});

				const formatted = Object.entries(grouped).map(
					([date, value]) => ({
						date,
						slots: value.slots,
						note: value.note,
					})
				);

				setRegisteredDays(formatted);
			}
		} catch (err) {
			console.error("Lỗi lấy danh sách free date:", err);
		}
	};

	// ✅ Khi click vào ngày trong lịch
	const handleSelectSlot = (slotInfo) => {
		const dateStr = moment(slotInfo.start).format("YYYY-MM-DD");
		const hasExam = shifts.some((s) => s.date === dateStr);

		if (!hasExam) {
			alert("Ngày này không có ca thi!");
			return;
		}

		const existing = registeredDays.find((d) => d.date === dateStr);

		if (existing) {
			setSelectedDate(dateStr);
			setSelectedSlots(existing.slots || []);
			setNote(existing.note);
			setShowModal(true);
		} else {
			setSelectedDate(dateStr);
			setSelectedSlots([]);
			setNote("");
			setShowModal(true);
		}
	};

	// ✅ Bật/tắt slot
	const toggleSlot = (slot) => {
		setSelectedSlots((prev) =>
			prev.includes(slot)
				? prev.filter((s) => s !== slot)
				: [...prev, slot]
		);
	};

	// ✅ Gửi đăng ký (datetime)
	const handleSubmit = async () => {
		if (!selectedDate) return;
		if (selectedSlots.length === 0) {
			alert("⚠️ Vui lòng chọn ít nhất 1 khung giờ!");
			return;
		}

		const free_dates = selectedSlots.map((slot) =>
			moment(`${selectedDate}T${slot}`).toISOString()
		);

		try {
			await axios.post(`${global.ip}/api/v1/user-free/register`, {
				user_id: userId,
				session_id: sessionId,
				free_dates,
				note,
			});

			alert("✅ Lưu đăng ký ca trông thi thành công!");
			setShowModal(false);
			fetchRegisteredDays();
		} catch (err) {
			console.error("Lỗi đăng ký:", err);
			alert("❌ Có lỗi xảy ra khi lưu!");
		}
	};

	// ✅ Đặt màu ngày
	const dayPropGetter = (date) => {
		const dateStr = moment(date).format("YYYY-MM-DD");
		const hasExam = shifts.some((s) => s.date === dateStr);
		const isRegistered = registeredDays.some((d) => d.date === dateStr);

		if (isRegistered)
			return { style: { backgroundColor: "#fbd38d", cursor: "pointer" } }; // vàng
		if (hasExam)
			return { style: { backgroundColor: "#bee3f8", cursor: "pointer" } }; // xanh
		return {};
	};

	if (loading) return <div className="loading">Đang tải...</div>;

	return (
		<div className="exam-calendar-wrapper">
			<div className="calendar-header">
				<button
					className="back-btn"
					onClick={() => window.history.back()}
				>
					← Quay lại
				</button>
				<h2>Đăng ký / chỉnh sửa ca trông thi</h2>
			</div>

			<div className="calendar-card">
				<Calendar
					localizer={localizer}
					events={shifts.map((s) => ({
						title: "Ca thi",
						start: new Date(s.date),
						end: new Date(s.date),
					}))} // trick để event có thể tap được
					selectable
					views={["month"]}
					style={{
						height: "70vh",
						padding: "15px",
						touchAction: "manipulation",
					}}
					onSelectSlot={handleSelectSlot}
					onSelectEvent={(event) =>
						handleSelectSlot({ start: event.start })
					} // thêm handler cho mobile tap
					dayPropGetter={dayPropGetter}
				/>
			</div>

			{/* Chú thích */}
			<div className="calendar-legend mt-4">
				<div>
					<span
						className="legend-box"
						style={{ backgroundColor: "#bee3f8" }}
					></span>{" "}
					Ngày có ca thi
				</div>
				<div>
					<span
						className="legend-box"
						style={{ backgroundColor: "#fbd38d" }}
					></span>{" "}
					Ngày đã đăng ký (có khung giờ)
				</div>
			</div>

			{/* Popup */}
			{showModal && (
				<div className="modal-overlay">
					<div className="modal-content">
						<h3>
							{registeredDays.some((d) => d.date === selectedDate)
								? "Cập nhật ca trông thi"
								: "Đăng ký ca trông thi"}{" "}
							- {moment(selectedDate).format("DD/MM/YYYY")}
						</h3>

						<div className="shift-list">
							{TIME_SLOTS.map((slot) => (
								<div
									key={slot}
									className={`shift-item ${
										selectedSlots.includes(slot)
											? "selected"
											: ""
									}`}
									onClick={() => toggleSlot(slot)}
								>
									<strong>{slot}</strong>
								</div>
							))}
						</div>

						<textarea
							placeholder="Ghi chú thêm (tuỳ chọn)"
							value={note}
							onChange={(e) => setNote(e.target.value)}
							className="assign-input"
							rows={2}
						/>

						<div className="modal-actions">
							<button
								onClick={handleSubmit}
								className="btn confirm"
							>
								Lưu thay đổi
							</button>
							<button
								onClick={() => setShowModal(false)}
								className="btn cancel"
							>
								Đóng
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
