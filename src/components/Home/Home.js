import React from "react";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "./Home.css";

const Home = (props) => {
    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate("/login"); // Điều hướng tới trang Login
    };

    return (
        <div className="homeContainer gap-5 z-50 overflow-y-hidden h-screen">
            <div className="titleContainer text-white p-3">
                <div className="text-6xl text-center">
                    Hệ thống quản lý trông thi
                </div>
            </div>
            <button
                onClick={handleLoginClick}
                className="py-2 text-3xl h-auto w-6/12 px-7 bg-blue-500 text-white font-semibold rounded-full shadow-md hover:bg-blue-700 focus:outline-none focus:ring focus:ring-violet-400 focus:ring-opacity-75"
            >
                Đăng nhập
            </button>
        </div>
    );
};

export default Home;
