import "../ListExamShift/listExamShift.css";
import React from "react";

const NavBar = () => {
	return (
		<nav className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white shadow-md flex items-center px-4 py-2 md:py-3">
			<div className="flex items-center gap-3">
				<div className="flex justify-center items-center bg-white rounded-lg p-1 w-10 h-10">
					<img
						src="/Logo_PTIT_University.png"
						alt="PTIT Logo"
						className="w-8 h-auto object-contain"
					/>
				</div>
				<span className="font-bold text-lg md:text-2xl whitespace-nowrap">
					Hệ thống quản lý trông thi
				</span>
			</div>
		</nav>
	);
};

export default NavBar;
