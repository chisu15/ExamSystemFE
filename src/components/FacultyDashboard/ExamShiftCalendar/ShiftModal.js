import React from "react";
import moment from "moment";

export default function ShiftModal({
  mode,
  selectedDate,
  shifts,
  selectedShifts,
  handleSelectShift,
  onClose,
  lecturers,
  selectedUser,
  setSelectedUser,
  onConfirm, // ✅ thêm props để gọi xác nhận trực tiếp
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Ca thi ngày {moment(selectedDate).format("DD/MM/YYYY")}</h3>

        {/* Danh sách ca thi trong ngày */}
        <div
          className="shift-list"
          style={{
            maxHeight: "250px",
            overflowY: shifts.length > 4 ? "auto" : "visible",
          }}
        >
          {shifts.map((shift) => (
            <div
              key={shift.id}
              className={`shift-item ${
                selectedShifts.includes(shift.id) ? "selected" : ""
              }`}
              onClick={() => handleSelectShift(shift.id)}
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

        {/* Chọn giảng viên (chỉ hiện trong mode "assign") */}
        {mode === "assign" && (
          <div className="lecturer-select">
            <label>Chọn giảng viên:</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">-- Chọn giảng viên --</option>
              {lecturers.map((lec) => (
                <option key={lec.id} value={lec.id}>
                  {lec.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Nút hành động */}
        <div className="modal-actions">
          {mode === "assign" && (
            <button onClick={onConfirm} className="btn confirm">
              Xác nhận
            </button>
          )}
          <button onClick={onClose} className="btn cancel">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
