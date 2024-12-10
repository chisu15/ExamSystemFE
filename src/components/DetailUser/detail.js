import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import global from "../../global.js";

const UserDetails = () => {
  const { id } = useParams(); // Lấy id từ URL
  const [user, setUser] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userResponse = await axios.post(
          `http://${global.ip}:8080/api/v1/users/detail/${id}`
        );
  
        if (userResponse.data.code === 200) {
          setUser(userResponse.data.user);
  
          // Gọi API để lấy QR Code
          try {
            const qrResponse = await axios.post(
              `http://${global.ip}:8080/api/v1/users/qr-code/${id}`,
              { responseType: "blob" } // Nhận ảnh dưới dạng Blob
            );
            if (qrResponse.status === 200) {
              setQrCode(qrResponse.data.qr_code); // Tạo URL từ Blob
            } else {
              console.warn("Không tìm thấy QR Code");
            }
          } catch (qrError) {
            console.error("Lỗi khi lấy QR Code:", qrError);
            setQrCode(null); // Hoặc dùng ảnh mặc định
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
  }, [id]);
  

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="p-5 bg-gray-100 min-h-screen">
      <h1 className="text-3xl mt-16 font-bold text-center text-blue-600 mb-8">
        Thông tin người dùng
      </h1>

      <div className="bg-white shadow-lg rounded-lg p-6 mx-auto max-w-2xl">
        <div className="flex flex-col items-center">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <p className="text-gray-600 font-medium">
              <strong>Email:</strong>
            </p>
            <p className="text-gray-800">{user.email}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <p className="text-gray-600 font-medium">
              <strong>Số điện thoại:</strong>
            </p>
            <p className="text-gray-800">{user.phone}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <p className="text-gray-600 font-medium">
              <strong>Cơ quan:</strong>
            </p>
            <p className="text-gray-800">{user.workplace}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <p className="text-gray-600 font-medium">
              <strong>Số tài khoản:</strong>
            </p>
            <p className="text-gray-800">
              {user.account} ({user.bank})
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <p className="text-gray-600 font-medium">
              <strong>Mã số thuế:</strong>
            </p>
            <p className="text-gray-800">{user.tax_code}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <p className="text-gray-600 font-medium">
              <strong>Mã giảng viên:</strong>
            </p>
            <p className="text-gray-800">{user.teacher_code}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
