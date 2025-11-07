import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import global from "../../../global";
import moment from "moment";
import CalendarView from "./CalendarView";
import ShiftModal from "./ShiftModal";
import AssignPreview from "./AssignPreview";
import "./exam-calendar.css";

export default function ExamShiftCalendar({ mode }) {
	const [shifts, setShifts] = useState([]);
	const [lecturers, setLecturers] = useState([]);
	const [selectedDate, setSelectedDate] = useState(null);
	const [dayShifts, setDayShifts] = useState([]);
	const [selectedShifts, setSelectedShifts] = useState([]);
	const [selectedUser, setSelectedUser] = useState("");
	const [assignList, setAssignList] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [loading, setLoading] = useState(true);

	const sessionId = Cookies.get("session_id");
	const workplaceId = Cookies.get("workplace_id");

	useEffect(() => {
		fetchShifts();
		if (mode === "assign") fetchLecturers();
	}, [mode]);

	const fetchShifts = async () => {
		try {
			const res = await axios.post(
				`${global.ip}/api/v1/exam-shifts/empty`
			);
			if (res.data.code === 200) {
				const data = res.data.shifts.map((s) => ({
					...s,
					start: new Date(s.starting_time),
					end: new Date(moment(s.starting_time).add(2, "hours")),
					title: s.subject_name,
				}));
				setShifts(data);
			}
		} catch (err) {
			console.error("Lỗi lấy danh sách ca thi:", err);
		} finally {
			setLoading(false);
		}
	};

	const fetchLecturers = async () => {
		try {
			const sessionId = Cookies.get("session_id");
			const userId = Cookies.get("user_id");

			// 🧩 1. Gọi API lấy chi tiết user hiện tại
			const userRes = await axios.post(
				`${global.ip}/api/v1/users/detail/${userId}`
			);
			const workplaceId = userRes.data.user.workplace_id;

			if (!workplaceId) {
				console.warn("Không tìm thấy workplace_id của người dùng");
				return;
			}

			// 🧩 2. Gọi API lấy danh sách giảng viên trong khoa
			const res = await axios.post(
				`${global.ip}/api/v1/users/workplace`,
				{
					workplace_id: workplaceId,
				}
			);

			if (res.data.code === 200) {
				setLecturers(res.data.users);
			} else {
				console.warn(
					"Không lấy được danh sách giảng viên:",
					res.data.message
				);
			}
		} catch (err) {
			console.error("Lỗi lấy danh sách giảng viên:", err);
		}
	};

	const handleSelectDate = (date) => {
		const dateStr = moment(date).format("YYYY-MM-DD");
		const filtered = shifts.filter(
			(s) => moment(s.start).format("YYYY-MM-DD") === dateStr
		);
		if (filtered.length > 0) {
			setSelectedDate(dateStr);
			setDayShifts(filtered);
			setShowModal(true);
		}
	};

	const handleSelectShift = (id) => {
		setSelectedShifts((prev) =>
			prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
		);
	};

	const handleConfirm = async () => {
		if (selectedShifts.length === 0) {
			alert("Vui lòng chọn ít nhất một ca thi!");
			return;
		}

		try {
			if (mode === "register") {
				await axios.post(
					`${global.ip}/api/v1/user-examshift/register`,
					{
						session_id: sessionId,
						shift_ids: selectedShifts,
					}
				);
				alert("Đăng ký thành công!");
			} else if (mode === "assign") {
				if (!selectedUser) {
					alert("Vui lòng chọn giảng viên!");
					return;
				}
				for (const shift_id of selectedShifts) {
					await axios.post(
						`${global.ip}/api/v1/user-examshift/assign`,
						{
							session_id: sessionId,
							user_id: selectedUser,
							shift_id,
						}
					);
				}
				const added = selectedShifts.map((id) => ({
					shift_id: id,
					user_id: selectedUser,
					user_name:
						lecturers.find((l) => l.id === Number(selectedUser))
							?.name || "",
					subject_name:
						dayShifts.find((s) => s.id === id)?.subject_name || "",
				}));
				setAssignList([...assignList, ...added]);
				alert("Gán thành công!");
			}

			setSelectedShifts([]);
			setSelectedUser("");
			setShowModal(false);
			fetchShifts();
		} catch (err) {
			console.error("Lỗi xác nhận:", err);
			alert("Có lỗi xảy ra!");
		}
	};

	const handleReset = () => setSelectedShifts([]);

	if (loading) return <div className="loading">Đang tải lịch...</div>;

	return (
		<div className={`exam-calendar-wrapper ${mode}`}>
			<div className="calendar-header">
				<button
					className="back-btn"
					onClick={() => window.history.back()}
				>
					Quay lại
				</button>
				<h2>
					{mode === "assign"
						? "Gán giảng viên cho ca thi"
						: "Đăng ký ca thi"}
				</h2>
			</div>

			<CalendarView shifts={shifts} onSelectDate={handleSelectDate} />

			{(selectedShifts.length > 0 || assignList.length > 0) && (
				<AssignPreview
					mode={mode}
					selectedShifts={selectedShifts}
					setSelectedShifts={setSelectedShifts}
					assignList={assignList}
					setAssignList={setAssignList}
					dayShifts={dayShifts}
					lecturers={lecturers}
					selectedUser={selectedUser}
					onConfirm={handleConfirm}
					onReset={handleReset}
				/>
			)}

			{showModal && (
				<ShiftModal
					mode={mode}
					selectedDate={selectedDate}
					shifts={dayShifts}
					selectedShifts={selectedShifts}
					handleSelectShift={handleSelectShift}
					onClose={() => setShowModal(false)}
					lecturers={lecturers}
					selectedUser={selectedUser}
					setSelectedUser={setSelectedUser}
					onConfirm={handleConfirm} // ✅ thêm dòng này
				/>
			)}
		</div>
	);
}
