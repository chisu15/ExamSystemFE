import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import global from "../../global.js";

const InvigilatorButton = ({ invigilatorNumber, teacherCode }) => {
  const navigate = useNavigate();
  const { id } = useParams(); // Lấy id từ URL
  console.log("Shift ID from URL:", id);

  const handleCheckAndCreate = async () => {
    try {
      // Gọi API detail-byCode để kiểm tra bản ghi
      const detailResponse = await axios.post(
        `http://${global.ip}:8080/api/v1/user-examshift/detail-byCode/${teacherCode}/${id}`
      );
      console.log("Detail API Response:", detailResponse.data);

      if (detailResponse.data.code === 204) {
        // Nếu không có bản ghi, tạo bản ghi mới
        await axios.post(
          `http://${global.ip}:8080/api/v1/user-examshift/create`,
          {
            id: id,
            teacher_code: teacherCode,
          }
        );
        console.log("Record created successfully");
      } else {
        console.log("Record already exists");
      }

      // Điều hướng tới trang quét QR sau khi kiểm tra xong, bao gồm id trong URL
      navigate(`/scan-invigilator-${invigilatorNumber}/${id}`);
    } catch (error) {
      console.error("Error during check or create:", error);
    }
  };

  return (
    <div className="flex flex-col items-center mb-2">
      <span className="text-gray-600 font-semibold">
        Quét QR cho Giám thị {invigilatorNumber}
      </span>
      <button
        className="bg-blue-500 rounded-3xl p-2 hover:bg-blue-600 hover:shadow-xl transition-all mt-3"
        onClick={handleCheckAndCreate}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="200px"
          viewBox="0 -960 960 960"
          width="200px"
          fill="#fff"
        >
          <path d="M80-680v-200h200v80H160v120H80Zm0 600v-200h80v120h120v80H80Zm600 0v-80h120v-120h80v200H680Zm120-600v-120H680v-80h200v200h-80ZM700-260h60v60h-60v-60Zm0-120h60v60h-60v-60Zm-60 60h60v60h-60v-60Zm-60 60h60v60h-60v-60Zm-60-60h60v60h-60v-60Zm120-120h60v60h-60v-60Zm-60 60h60v60h-60v-60Zm-60-60h60v60h-60v-60Zm240-320v240H520v-240h240ZM440-440v240H200v-240h240Zm0-320v240H200v-240h240Zm-60 500v-120H260v120h120Zm0-320v-120H260v120h120Zm320 0v-120H580v120h120Z" />
        </svg>
      </button>
    </div>
  );
};

export default InvigilatorButton;
