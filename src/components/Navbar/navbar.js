import "../ListExamShift/listExamShift.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const NavBar = () => {
	return (
		<div className="flex bg-red-500 items-center py-3 gap-3 w-screen m-0">
			<div className="flex justify-center align-middle h-10 w-10 bg-white rounded-lg text-center p-1 mx-2">
				<img
					src="/Logo_PTIT_University.png"
					alt="logo"
					className=" h-auto w-7 object-contain"
				/>
			</div>
			<span className="font-bold text-2xl text-gray-50">
				Hệ thống quản lý trông thi
			</span>
		</div>
	);
};

export default NavBar;
