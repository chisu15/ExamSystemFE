import { useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Cookies from "js-cookie";

const useAuth = () => {
  const { examCode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const sessionId = Cookies.get("session_id");

    if (!sessionId) {
      sessionStorage.setItem("redirectAfterLogin", location.pathname);
      navigate("/login");
    }
  }, [navigate, location]);
};

export default useAuth;