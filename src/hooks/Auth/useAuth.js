import { useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Cookies from "js-cookie";

const useAuth = () => {
  const { examCode } = useParams(); // Lấy examCode từ URL nếu cần
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const sessionId = Cookies.get("session_id");
      
      // Nếu không có session_id, chuyển hướng về trang đăng nhập
      if (!sessionId) {
        // Lưu lại trang hiện tại để quay lại sau khi đăng nhập
        sessionStorage.setItem("redirectAfterLogin", location.pathname);
        navigate("/login");
      }
    };

    checkAuth(); // Kiểm tra khi component mount
  }, [navigate, location]); // Kiểm tra lại khi

};

export default useAuth;