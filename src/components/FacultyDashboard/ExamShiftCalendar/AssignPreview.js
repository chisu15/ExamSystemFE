import React from "react";
import moment from "moment";

export default function AssignPreview({
  mode,
  selectedShifts,
  setSelectedShifts,
  assignList,
  setAssignList,
  dayShifts,
  lecturers,
  selectedUser,
  onConfirm,
  onReset,
}) {
  return (
    <div className="assign-preview">
      <h3>{mode === "assign" ? "Danh sách gán giảng viên" : "Các ca thi đã chọn"}</h3>
      <table>
        <thead>
          <tr>
            <th>Môn thi</th>
            <th>Phòng</th>
            <th>Thời gian</th>
            {mode === "assign" && <th>Giảng viên</th>}
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {dayShifts
            .filter((s) => selectedShifts.includes(s.id))
            .map((s) => (
              <tr key={s.id}>
                <td>{s.subject_name}</td>
                <td>{s.building}/{s.classroom}</td>
                <td>{moment(s.starting_time).format("DD/MM/YYYY HH:mm")}</td>
                {mode === "assign" && (
                  <td>
                    {lecturers.find((l) => l.id === Number(selectedUser))?.name ||
                      "Chưa chọn"}
                  </td>
                )}
                <td>
                  <button
                    className="btn-remove"
                    onClick={() =>
                      setSelectedShifts(selectedShifts.filter((id) => id !== s.id))
                    }
                  >
                    Bỏ chọn
                  </button>
                </td>
              </tr>
            ))}

          {mode === "assign" &&
            assignList.map((item, idx) => (
              <tr key={`${item.shift_id}-${idx}`}>
                <td>{item.subject_name}</td>
                <td>—</td>
                <td>—</td>
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
        <button className="btn confirm" onClick={onConfirm}>
          Xác nhận
        </button>
        <button className="btn reset" onClick={onReset}>
          Reset
        </button>
      </div>
    </div>
  );
}
