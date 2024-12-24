import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import global from "../../global.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [examShift, setExamShift] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Fetch user details and associated data
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const sessionId = Cookies.get("session_id");
        const userId = Cookies.get("user_id");
        if (!sessionId || !userId || userId !== id) {
          navigate(-1);
          toast.error("Truy cập thất bại");
          return;
        }
        const userResponse = await axios.post(
          `${global.ip}/api/v1/users/detail/${id}`
        );

        if (userResponse.data.code === 200) {
          const { user, shiftData, totalCost } = userResponse.data;
          setUser(user);
          setExamShift(shiftData || []);
          setTotalCost(totalCost || 0);

          // Fetch QR Code
          try {
            const qrResponse = await axios.post(
              `${global.ip}/api/v1/users/qr-code/${id}`,
              { responseType: "blob" }
            );
            if (qrResponse.status === 200) {
              setQrCode(qrResponse.data.qr_code);
            } else {
              console.warn("Không tìm thấy QR Code");
            }
          } catch (qrError) {
            console.error("Lỗi khi lấy QR Code:", qrError);
          }
        } else {
          setError("Không tìm thấy thông tin người dùng.");
        }
      } catch (err) {
        console.error(err);
        setError("Có lỗi xảy ra khi lấy thông tin người dùng.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [id, navigate]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = examShift.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(examShift.length / itemsPerPage);

  // Handlers
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const renderPagination = () => {
    const pages = [];
    const maxPageButtons = 5; // Maximum number of page buttons displayed
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    // Adjust startPage if endPage exceeds totalPages
    if (endPage === totalPages) {
      startPage = Math.max(1, totalPages - maxPageButtons + 1);
    }

    // Add numbered page buttons
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 rounded ${
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

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>{error}</div>;

  const formatDateTime = (dateString) => {
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    return new Intl.DateTimeFormat("vi-VN", options).format(new Date(dateString));
  };
  return (
    <div className="p-5 bg-gray-100 min-h-screen">
      {/* User Information */}
      <div className="bg-white shadow-lg rounded-lg p-6 mx-auto max-w-full mt-16">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-3">
          THÔNG TIN NGƯỜI DÙNG
        </h1>
        <hr />
        <div className="flex flex-col items-center mt-8 mb-3">
          {qrCode ? (
            <img
              src={qrCode}
              alt="User QR Code"
              className="w-32 h-32 rounded-lg border-4 border-blue-400 shadow-lg mb-5"
            />
          ) : (
            <div className="w-32 h-32 flex items-center justify-center bg-gray-200 text-gray-500 rounded-lg">
              Không có QR Code
            </div>
          )}
          <h2 className="text-2xl font-bold text-gray-700 mb-1">{user.name}</h2>
          <p className="text-gray-500 italic mb-4">{user.position}</p>
        </div>

        {/* User Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {[
            { label: "Email", value: user.email },
            { label: "Số điện thoại", value: user.phone },
            { label: "Cơ quan", value: user.workplace },
            {
              label: "Số tài khoản",
              value: `${user.account} (${user.bank})`,
            },
            { label: "Mã số thuế", value: user.tax_code },
            { label: "Mã giảng viên", value: user.teacher_code },
          ].map((item, idx) => (
            <div key={idx} className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <p className="text-gray-600 font-medium">
                <strong>{item.label}:</strong>
              </p>
              <p className="text-gray-800">{item.value}</p>
            </div>
          ))}
        </div>
        <hr />
      </div>

      {/* Exam Shift Information */}
      <div className="mt-8">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-3">
          DANH SÁCH CA THI ĐÃ COI
        </h1>
        <hr />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 mt-3">
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <p className="text-gray-600 font-medium">
              <strong>Số ca thi đã coi:</strong>
            </p>
            <p className="text-gray-800">{examShift.length}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <p className="text-gray-600 font-medium">
              <strong>Tổng số tiền:</strong>
            </p>
            <p className="text-gray-800">
              {new Intl.NumberFormat("vi-VN").format(totalCost)} VND
            </p>
          </div>
        </div>
        {/* Controls */}
        <div className="flex flex-col gap-3 items-center mt-5 mb-3">
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
          <div className="flex space-x-2">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Trước
            </button>
            {renderPagination()}
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Sau
            </button>
          </div>
        </div>
        {/* Paginated Items */}
        <div className="p-5">
          {/* Items */}
          <div className="grid grid-cols-1 gap-6 mb-8">
            {currentItems.length === 0 ? (
              <div className="text-center text-gray-500 py-4 font-semibold">
                Không có dữ liệu
              </div>
            ) : (
              currentItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg shadow-lg hover:shadow-xl transition-all ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="font-bold text-lg text-blue-600">
                      {index + 1 + indexOfFirstItem}. {item.subject_name}
                    </div>
                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold bg-green-200 text-green-800
                        }`}
                      >
                        Xong
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-gray-700">
                    <p>
                      <strong>Mã môn thi:</strong> {item.subject_code}
                    </p>
					<p>
                      <strong>Thời gian:</strong> {formatDateTime(item.starting_time)}
                    </p>
                    <p>
                      <strong>Địa điểm:</strong>{" "}
                      <span className="text-gray-900">
                        {item.building}/{item.classroom}
                      </span>
                    </p>
                    <p>
                      <strong>Kỳ thi:</strong> {item.exam_name}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
