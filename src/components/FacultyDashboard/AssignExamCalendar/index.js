import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import global from "../../../global";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./exam-calendar.css";

const localizer = momentLocalizer(moment);

export default function AssignExamCalendar() {
  const [shifts, setShifts] = useState([]);
  const [dayShifts, setDayShifts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedShift, setSelectedShift] = useState(null);
  const [lecturers, setLecturers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [assignList, setAssignList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const sessionId = Cookies.get("session_id");
  const userId = Cookies.get("user_id");

  useEffect(() => {
    fetchShifts();
  }, []);

  // ✅ Lấy danh sách ca thi còn thiếu người
  const fetchShifts = async () => {
    try {
      const res = await axios.post(`${global.ip}/api/v1/exam-shifts/empty`);
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
      console.error("Lỗi lấy ca thi:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Khi click vào 1 ngày trong lịch
  const handleSelectSlot = (slotInfo) => {
    const dateStr = moment(slotInfo.start).format("YYYY-MM-DD");
    const filtered = shifts.filter(
      (s) => moment(s.start).format("YYYY-MM-DD") === dateStr
    );
    if (filtered.length > 0) {
      setSelectedDate(dateStr);
      setDayShifts(filtered);
      setShowModal(true);
    }
  };

  // ✅ Khi chọn ca thi → lấy giảng viên (±30 phút)
  const handleSelectShift = async (shift) => {
    setSelectedShift(shift);
    setSelectedUser("");
    setLecturers([]);

    try {
      const userRes = await axios.post(`${global.ip}/api/v1/users/detail/${userId}`);
      const workplaceId = userRes.data.user.workplace_id;

      // Tính khoảng thời gian ±30 phút
      const startTime = moment(shift.starting_time).subtract(30, "minutes").toISOString();
      const endTime = moment(shift.starting_time).add(30, "minutes").toISOString();

      const res = await axios.post(`${global.ip}/api/v1/user-free/date`, {
        date: shift.starting_time,
        workplace_id: workplaceId,
        start_time: startTime,
        end_time: endTime,
      });

      if (res.data.code === 200) {
        setLecturers(res.data.users || []);
      } else {
        setLecturers([]);
      }
    } catch (err) {
      console.error("Lỗi lấy giảng viên:", err);
    }
  };

  // ✅ Thêm vào danh sách gán
  const handleAddToAssignList = () => {
    if (!selectedUser || !selectedShift) {
      alert("⚠️ Vui lòng chọn ca thi và giảng viên!");
      return;
    }

    const lecturer = lecturers.find((l) => l.id === Number(selectedUser));

    const newItem = {
      shift_id: selectedShift.id,
      subject_name: selectedShift.subject_name,
      date: moment(selectedShift.starting_time).format("DD/MM/YYYY"),
      time: moment(selectedShift.starting_time).format("HH:mm"),
      user_id: lecturer.id,
      user_name: lecturer.name,
    };

    setAssignList((prev) => [...prev, newItem]);
    setSelectedShift(null);
    setSelectedUser("");
  };

  // ✅ Gửi toàn bộ danh sách lên server
  const handleConfirmAll = async () => {
    if (assignList.length === 0) {
      alert("⚠️ Chưa có dữ liệu để gán!");
      return;
    }

    try {
      for (const item of assignList) {
        await axios.post(`${global.ip}/api/v1/user-examshift/assign`, {
          session_id: sessionId,
          user_id: item.user_id,
          shift_id: item.shift_id,
        });
      }
      alert("✅ Gán thành công!");
      setAssignList([]);
      fetchShifts();
    } catch (err) {
      console.error("Lỗi xác nhận:", err);
      alert("❌ Có lỗi xảy ra khi gán!");
    }
  };

  const handleReset = () => setAssignList([]);

  const eventStyleGetter = () => ({
    style: {
      backgroundColor: "#90cdf4",
      borderRadius: "6px",
      color: "#1a202c",
      border: "none",
      fontSize: "0.85rem",
      padding: "2px 4px",
    },
  });

  const dayPropGetter = (date) => {
    const hasShift = shifts.some(
      (s) => moment(s.start).format("YYYY-MM-DD") === moment(date).format("YYYY-MM-DD")
    );
    if (hasShift) return { style: { backgroundColor: "#ebf8ff" } };
    return {};
  };

  if (loading) return <div className="loading">Đang tải lịch...</div>;

  return (
    <div className="exam-calendar-wrapper">
      <div className="calendar-header">
        <button className="back-btn" onClick={() => window.history.back()}>
          ← Quay lại
        </button>
        <h2>Gán giảng viên cho ca thi</h2>
      </div>

      <div className="calendar-card">
        <Calendar
          localizer={localizer}
          events={shifts}
          startAccessor="start"
          endAccessor="end"
          selectable
          views={["month"]}
          style={{ height: "70vh", padding: "15px" }}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectSlot}
          eventPropGetter={eventStyleGetter}
          dayPropGetter={dayPropGetter}
        />
      </div>

      {/* Preview danh sách gán */}
      {assignList.length > 0 && (
        <div className="assign-preview">
          <h3>Danh sách gán tạm</h3>
          <table>
            <thead>
              <tr>
                <th>Ca thi</th>
                <th>Ngày</th>
                <th>Giờ</th>
                <th>Giảng viên</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {assignList.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.subject_name}</td>
                  <td>{item.date}</td>
                  <td>{item.time}</td>
                  <td>{item.user_name}</td>
                  <td>
                    <button
                      className="btn-remove"
                      onClick={() =>
                        setAssignList(assignList.filter((_, i) => i !== idx))
                      }
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="assign-actions">
            <button className="btn confirm" onClick={handleConfirmAll}>
              Xác nhận toàn bộ
            </button>
            <button className="btn reset" onClick={handleReset}>
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Popup */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Ca thi ngày {moment(selectedDate).format("DD/MM/YYYY")}</h3>

            <div
              className="shift-list"
              style={{
                maxHeight: "250px",
                overflowY: "auto",
                marginBottom: "10px",
              }}
            >
              {dayShifts.map((shift) => (
                <div
                  key={shift.id}
                  className={`shift-item ${
                    selectedShift?.id === shift.id ? "selected" : ""
                  }`}
                  onClick={() => handleSelectShift(shift)}
                >
                  <strong>{shift.subject_name}</strong> – {shift.exam_format}
                  <br />
                  <small>
                    {shift.building}/{shift.classroom} •{" "}
                    {moment(shift.starting_time).format("HH:mm")}
                  </small>
                </div>
              ))}
            </div>

            {selectedShift && (
              <div className="lecturer-select">
                <label>Chọn giảng viên (±30 phút):</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  <option value="">-- Chọn giảng viên --</option>
                  {lecturers.length > 0 ? (
                    lecturers.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} ({l.email})
                      </option>
                    ))
                  ) : (
                    <option disabled>Không có giảng viên giờ này</option>
                  )}
                </select>
              </div>
            )}

            <div className="modal-actions">
              <button onClick={handleAddToAssignList} className="btn confirm">
                Thêm vào danh sách
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedShift(null);
                  setSelectedUser("");
                }}
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
