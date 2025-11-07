import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import global from "../../global";
import { useNavigate } from "react-router-dom";
import "./faculty-dashboard.css";
import { Users, ClipboardList, UserCheck, Edit3, Save, X } from "lucide-react";

export default function FacultyDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    name: "",
    number_teacher: 0,
    invigilatorCount: 0,
    avgPerShift: 0,
  });
  const [examRound, setExamRound] = useState(null); // 🟢 Đợt thi hiện tại
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [newShiftValue, setNewShiftValue] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const userId = Cookies.get("user_id");
      if (!userId) return;

      // Lấy thông tin người dùng
      const userRes = await axios.post(`${global.ip}/api/v1/users/detail/${userId}`);
      const user = userRes.data?.user;

      // 🟩 Lấy thông tin đợt thi hiện tại của khoa
      const roundRes = await axios.post(`${global.ip}/api/v1/exam-round/current-workplace/${user.workplace_id}`);
      if (roundRes.data.code === 200) {
        setExamRound(roundRes.data.data);
      }

      // Lấy thông tin khoa
      const facultyRes = await axios.post(`${global.ip}/api/v1/workplaces/detail/${user.workplace_id}`);
      const workplace = facultyRes.data?.workplace || {};

      setStats({
        name: workplace.name || "Khoa chưa xác định",
        number_teacher: workplace.number_teacher ?? 0,
        invigilatorCount: workplace.invigilator_count ?? 0,
        avgPerShift: workplace.avg_per_shift ?? 0,
      });

      // 🟢 Lấy danh sách giảng viên trong khoa
      const userListRes = await axios.post(`${global.ip}/api/v1/users/workplace/`, {
        workplace_id: user.workplace_id,
      });
      setUsers(userListRes.data?.users || []);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🟠 Cập nhật số ca thi cho giảng viên
  const handleUpdateShift = async (userId) => {
    if (!newShiftValue || isNaN(newShiftValue)) {
      alert("⚠️ Vui lòng nhập số hợp lệ!");
      return;
    }
    try {
      await axios.patch(`${global.ip}/api/v1/users/update-number-shift`, {
        user_id: userId,
        new_number_shift: Number(newShiftValue),
      });
      alert("✅ Cập nhật thành công!");
      setEditingUser(null);
      setNewShiftValue("");
      fetchStats(); // reload
    } catch (err) {
      console.error("Lỗi cập nhật ca thi:", err);
      alert("❌ Lỗi khi cập nhật số ca thi!");
    }
  };

  if (loading) {
    return (
      <div className="faculty-dashboard">
        <div className="dashboard-container text-center text-gray-500">
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="faculty-dashboard">
      <div className="dashboard-container">
        <h1 className="dashboard-title">
          Tổng quan <span>{stats.name}</span>
        </h1>

        {/* --- 🟦 Thông tin đợt thi hiện tại --- */}
{examRound && (() => {
  const total = examRound.total_shift || 0;
  const completed = examRound.completed_shifts || 0;
  const percent = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;

  return (
    <div className="exam-round-card relative bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 mb-8 shadow-md overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
        <div>
          <h2 className="text-xl font-semibold text-blue-700">
            {examRound.exam_round?.name}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {examRound.exam_round?.description}
          </p>
        </div>
        <div className="text-sm text-gray-500 mt-2 sm:mt-0">
          {new Date(examRound.exam_round?.start_date).toLocaleDateString("vi-VN")} —{" "}
          {new Date(examRound.exam_round?.end_date).toLocaleDateString("vi-VN")}
        </div>
      </div>

      {/* Thống kê dạng grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-white shadow-sm rounded-lg p-3 border border-gray-100">
          <p className="text-gray-500 text-sm">Tổng số ca thi</p>
          <h3 className="text-lg font-bold text-blue-700">{total}</h3>
        </div>
        <div className="bg-white shadow-sm rounded-lg p-3 border border-gray-100">
          <p className="text-gray-500 text-sm">Số giảng viên</p>
          <h3 className="text-lg font-bold text-green-600">{examRound.number_teacher || 0}</h3>
        </div>
        <div className="bg-white shadow-sm rounded-lg p-3 border border-gray-100">
          <p className="text-gray-500 text-sm">Đã hoàn thành</p>
          <h3 className="text-lg font-bold text-yellow-600">{completed}</h3>
        </div>
        <div className="bg-white shadow-sm rounded-lg p-3 border border-gray-100">
          <p className="text-gray-500 text-sm">Tổng tất cả ca</p>
          <h3 className="text-lg font-bold text-indigo-600">{examRound.total_all_shifts || 0}</h3>
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
        Hoàn thành <b>{completed}</b> / <b>{total}</b> ca thi —{" "}
        <span className="font-semibold text-blue-600">{percent}%</span>
      </p>
    </div>
  );
})()}


        {/* --- Thống kê --- */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="icon-wrapper blue"><Users size={28} /></div>
            <div>
              <p>Số lượng giảng viên</p>
              <h2>{stats.number_teacher}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="icon-wrapper orange"><ClipboardList size={28} /></div>
            <div>
              <p>Số người phải trông thi</p>
              <h2>{stats.invigilatorCount}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="icon-wrapper green"><UserCheck size={28} /></div>
            <div>
              <p>Số người/buổi trung bình</p>
              <h2>{stats.avgPerShift}</h2>
            </div>
          </div>
        </div>

        {/* --- Nút hành động --- */}
        <div className="dashboard-actions">
          <button className="btn blue" onClick={() => navigate("/faculty/assign")}>
            Gán giảng viên cho ca thi
          </button>
          <button className="btn green" onClick={() => navigate("/faculty/register")}>
            Đăng ký ca thi
          </button>
        </div>

        {/* --- Danh sách giảng viên --- */}
        <div className="faculty-list">
          <h2 className="faculty-list-title">Danh sách giảng viên trong khoa</h2>

          <div className="table-container">
            <table className="faculty-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Họ và tên</th>
                  <th>Mã giảng viên</th>
                  <th>Email</th>
                  <th>Số ca thi đã coi</th>
                  <th>Số ca được giao</th>
                  <th>Vai trò</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((u, i) => (
                    <tr key={u.id}>
                      <td>{i + 1}</td>
                      <td>{u.name}</td>
                      <td>{u.teacher_code}</td>
                      <td>{u.email || "-"}</td>
                      <td>{u.exam_shift_count ?? 0}</td>

                      {/* Cột chỉnh sửa số ca */}
                      <td>
                        {editingUser === u.id ? (
                          <input
                            type="number"
                            value={newShiftValue}
                            onChange={(e) => setNewShiftValue(e.target.value)}
                            className="border rounded px-2 py-1 w-16 text-center"
                          />
                        ) : (
                          u.number_shift ?? "-"
                        )}
                      </td>

                      <td>{u.role_name}</td>

                      <td>
                        {editingUser === u.id ? (
                          <>
                            <button
                              className="btn confirm px-2 py-1 mr-2"
                              onClick={() => handleUpdateShift(u.id)}
                            >
                              <Save size={16} />
                            </button>
                            <button
                              className="btn cancel px-2 py-1"
                              onClick={() => {
                                setEditingUser(null);
                                setNewShiftValue("");
                              }}
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <button
                            className="btn reset px-2 py-1"
                            onClick={() => {
                              setEditingUser(u.id);
                              setNewShiftValue(u.number_shift ?? "");
                            }}
                          >
                            <Edit3 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", color: "#6b7280" }}>
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
