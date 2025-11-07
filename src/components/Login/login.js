import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios"; // Import Axios
import { ToastContainer, toast } from "react-toastify"; // Import react-toastify
import "react-toastify/dist/ReactToastify.css"; // Import CSS của react-toastify
import "./login.css";
import Cookies from "js-cookie";
import global from "../../global.js";

const Login = (props) => {
	const [form, setForm] = useState({
		email: "",
		password: "",
	});
	console.log(useParams());

	const [emailError, setEmailError] = useState("");
	const [passwordError, setPasswordError] = useState("");
	const navigate = useNavigate();

	useEffect(() => {
		toast.info("Yêu cầu đăng nhập để vào trang quét mã", {
			position: "top-center",
			autoClose: 10000,
		});
	}, []);

	const loginUser = async (loginData) => {
		try {
			const response = await axios.post(
				`${global.ip}/api/v1/users/login`,
				loginData
			);
			console.log(response.data, "|", response.status);

			if (response.status === 200 || response.data.code === 200) {
				const data = response.data;
				const sessionId =
					data.session_id || response.headers["session_id"];
				const expireTime = new Date(data.expire_at);
				Cookies.set("session_id", sessionId, {
					expires: expireTime,
					path: "/",
				});
				Cookies.set("user_id", data.user.id, {
					expires: expireTime,
					path: "/",
				});
				axios.defaults.headers.common["session_id"] = sessionId;
				if (data.user.role_id === 5) {
					toast.success("Đăng nhập thành công - Quản lý khoa");
					navigate("/faculty-dashboard");
					return;
				} else {
					toast.success(
						"Đăng nhập thành công với vai trò quản trị viên."
					);
					navigate(`/user/${response.data.user.id}`);
					return;
				}
				// toast.success(response.data.message || "Đăng nhập thành công");
				// const redirectUrl =
				// 	sessionStorage.getItem("redirectAfterLogin") || "/";
				// sessionStorage.removeItem("redirectAfterLogin");

				// navigate(redirectUrl);
			} else {
				toast.error(
					response.data.message || "Đăng nhập không thành công"
				);
			}
		} catch (error) {
			console.log("Error Response: ", error.response);
			if (error.response && error.response.data) {
				toast.error(
					error.response.data.message || "Đăng nhập không thành công"
				);
			} else {
				toast.error("Có lỗi xảy ra, vui lòng thử lại sau");
			}
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setForm({
			...form,
			[name]: value,
		});
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		let valid = true;

		if (valid) {
			loginUser(form);
		}
	};

	return (
		<div className="mainContainer z-50 overflow-hidden h-screen">
			<div className="titleContainer text-white p-3">
				<div className="text-6xl text-center">
					Hệ thống quản lý trông thi
				</div>
			</div>
			<form onSubmit={handleSubmit}>
				<br />
				<div className="inputContainer">
					<label className="text-white text-xl">Tên đăng nhập</label>
					<input
						type="email"
						name="email"
						value={form.email}
						placeholder="Nhập username"
						onChange={handleInputChange}
						className="inputBox"
						required
					/>
					{emailError && (
						<label className="errorLabel">{emailError}</label>
					)}
				</div>
				<br />
				<div className="inputContainer">
					<label className="text-white text-xl">Mật khẩu</label>
					<input
						type="password"
						name="password"
						value={form.password}
						placeholder="Nhập mật khẩu"
						onChange={handleInputChange}
						className="inputBox"
						required
					/>
					{passwordError && (
						<label className="errorLabel">{passwordError}</label>
					)}
				</div>
				<br />
				<div className="inputContainer bg-blue-400 p-1 rounded-xl">
					<input
						className="inputButton w-full text-white text-2xl font-semibold"
						type="submit"
						value="Đăng nhập"
					/>
				</div>
			</form>
			<ToastContainer />
		</div>
	);
};

export default Login;
