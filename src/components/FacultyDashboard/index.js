import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
	Card,
	Row,
	Col,
	Table,
	Statistic,
	Input,
	Button,
	Progress,
	message,
	Typography,
	Spin,
	Select,
} from "antd";
import {
	CalendarOutlined,
	CheckCircleOutlined,
	TeamOutlined,
	FileDoneOutlined,
	UserOutlined,
	UsergroupAddOutlined,
	EditOutlined,
	SaveOutlined,
	CloseOutlined,
	PieChartOutlined,
} from "@ant-design/icons";
import global from "../../global";
import "./faculty-dashboard.css";
import { DatePicker } from "antd";
import dayjs from "dayjs";

const { Paragraph } = Typography;

export default function FacultyDashboard() {
	const [data, setData] = useState(null);
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [examRounds, setExamRounds] = useState([]);
	const [selectedRound, setSelectedRound] = useState(null);
	const [editingUser, setEditingUser] = useState(null);
	const [newShiftValue, setNewShiftValue] = useState("");
	const [summaryDate, setSummaryDate] = useState(dayjs());
	const [dailySummary, setDailySummary] = useState([]);
	const refAssigned = useRef(null);
	const refFree = useRef(null);
	const refUsers = useRef(null);

	useEffect(() => {
		fetchInitialData();
	}, []);

	const fetchInitialData = async () => {
		try {
			const userId = Cookies.get("user_id");
			const userRes = await axios.post(
				`${global.ip}/api/v1/users/detail/${userId}`
			);
			const user = userRes.data.user;

			await Promise.all([
				fetchCurrentWorkplace(user.workplace_id),
				fetchAllExamRounds(user.workplace_id),
				fetchUsers(user.workplace_id),
			]);
		} catch (err) {
			message.error("Không thể tải dữ liệu!");
		} finally {
			setLoading(false);
		}
	};

	const fetchCurrentWorkplace = async (workplaceId) => {
		const res = await axios.post(
			`${global.ip}/api/v1/exam-round/current-workplace/${workplaceId}`
		);
		if (res.data.code === 200) setData(res.data.data);
	};

	const fetchAllExamRounds = async (workplaceId) => {
		const res = await axios.post(
			`${global.ip}/api/v1/exam-round/all-workplace/${workplaceId}`
		);
		if (res.data.code === 200) setExamRounds(res.data.data || []);
	};

	const fetchUsers = async (workplaceId) => {
		const res = await axios.post(`${global.ip}/api/v1/users/workplace/`, {
			workplace_id: workplaceId,
		});
		setUsers(res.data?.users || []);
	};

	const fetchSummaryByDate = async (date) => {
		try {
			const userId = Cookies.get("user_id");
			const userRes = await axios.post(
				`${global.ip}/api/v1/users/detail/${userId}`
			);
			const user = userRes.data.user;
			const res = await axios.get(
				`${global.ip}/api/v1/workplace/summary-by-date/${user.workplace_id}?date=${date}`
			);
			if (res.data.code === 200) setDailySummary(res.data.data || []);
		} catch (error) {
			console.error(error);
			message.error("Không thể tải tổng kết trong ngày!");
		}
	};

	const handleSelectRound = async (roundId) => {
		setSelectedRound(roundId);
		setLoading(true);

		try {
			if (roundId === "current") {
				const userId = Cookies.get("user_id");
				const userRes = await axios.post(
					`${global.ip}/api/v1/users/detail/${userId}`
				);
				const user = userRes.data.user;
				await fetchCurrentWorkplace(user.workplace_id);
			} else {
				const res = await axios.post(
					`${global.ip}/api/v1/exam-round/workplace-round`,
					{
						exam_round_id: roundId,
					}
				);
				if (res.data.code === 200) setData(res.data.data);
			}
		} catch {
			message.error("Không thể tải dữ liệu đợt thi!");
		} finally {
			setLoading(false);
		}
	};

	const handleUpdateShift = async (userId) => {
		if (!newShiftValue || isNaN(newShiftValue)) {
			message.warning("Vui lòng nhập số hợp lệ!");
			return;
		}
		try {
			await axios.patch(`${global.ip}/api/v1/users/update-number-shift`, {
				user_id: userId,
				new_number_shift: Number(newShiftValue),
			});
			message.success("Cập nhật thành công!");
			setEditingUser(null);
			setNewShiftValue("");
			const userIdCookie = Cookies.get("user_id");
			const userRes = await axios.post(
				`${global.ip}/api/v1/users/detail/${userIdCookie}`
			);
			const user = userRes.data.user;
			await fetchCurrentWorkplace(user.workplace_id);
		} catch {
			message.error("Lỗi khi cập nhật số ca thi!");
		}
	};

	const scrollToSection = (ref) => {
		if (ref && ref.current) {
			ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
			ref.current.classList.add("highlight-section");
			setTimeout(
				() => ref.current.classList.remove("highlight-section"),
				2000
			);
		}
	};

	if (loading) return <Spin tip="Đang tải dữ liệu..." fullscreen />;
	if (!data) return <p>Không có dữ liệu.</p>;

	const {
		exam_round,
		workplace,
		total_shift,
		number_teacher,
		completed_shifts,
		total_free_users,
		total_all_shifts,
		registered_free_days = [],
		assigned_shift_details = [],
	} = data;

	const percent = total_shift
		? Math.round((completed_shifts / total_shift) * 100)
		: 0;

	return (
		<div className="faculty-dashboard-container">
			<h1 className="dashboard-title">Tổng quan: {workplace?.name}</h1>

			{/* ======== THỐNG KÊ ======== */}
			<Row gutter={[16, 16]} className="stats-row">
				<Col xs={24} sm={12} md={4}>
					<Card
						hoverable
						onClick={() => scrollToSection(refAssigned)}
					>
						<Statistic
							title="Tổng ca thi"
							value={total_shift}
							prefix={<CalendarOutlined />}
						/>
						<Paragraph className="see-more">🔗 Chi tiết</Paragraph>
					</Card>
				</Col>
				<Col xs={24} sm={12} md={4}>
					<Card
						hoverable
						onClick={() => scrollToSection(refAssigned)}
					>
						<Statistic
							title="Đã hoàn thành"
							value={completed_shifts}
							prefix={<CheckCircleOutlined />}
						/>
						<Paragraph className="see-more">
							🔗 Ca đã xong
						</Paragraph>
					</Card>
				</Col>
				<Col xs={24} sm={12} md={4}>
					<Card hoverable onClick={() => scrollToSection(refFree)}>
						<Statistic
							title="GV đăng ký coi thi"
							value={total_free_users}
							prefix={<UsergroupAddOutlined />}
						/>
						<Paragraph className="see-more">
							🔗 Lịch coi thi
						</Paragraph>
					</Card>
				</Col>
				<Col xs={24} sm={12} md={4}>
					<Card hoverable onClick={() => scrollToSection(refUsers)}>
						<Statistic
							title="Tổng số GV"
							value={number_teacher}
							prefix={<UserOutlined />}
						/>
						<Paragraph className="see-more">🔗 Danh sách</Paragraph>
					</Card>
				</Col>
				<Col xs={24} sm={12} md={4}>
					<Card>
						<Statistic
							title="Tổng số ca đã coi (Tất cả các kỳ)"
							value={total_all_shifts}
							prefix={<PieChartOutlined />}
						/>
					</Card>
				</Col>
			</Row>

			{/* ======== ĐỢT THI HIỆN TẠI ======== */}
			<Card className="exam-round-card">
				<div className="exam-round-header">
					<h3>Đợt thi</h3>
					<Select
						value={selectedRound || "current"}
						style={{ width: 320 }}
						onChange={handleSelectRound}
					>
						<Select.Option value="current">
							Đợt thi hiện tại
						</Select.Option>
						{examRounds.map((r) => (
							<Select.Option key={r.id} value={r.id}>
								{r.name}
							</Select.Option>
						))}
					</Select>
				</div>

				<p>
					<b>{exam_round?.name}</b> — {exam_round?.description}
				</p>
				<p>
					{new Date(exam_round?.start_date).toLocaleDateString(
						"vi-VN"
					)}{" "}
					→{" "}
					{new Date(exam_round?.end_date).toLocaleDateString("vi-VN")}
				</p>
				<Progress
					percent={percent}
					status={percent === 100 ? "success" : "active"}
					strokeColor={
						percent < 50
							? "#faad14"
							: percent < 100
							? "#1890ff"
							: "#52c41a"
					}
				/>
				<p className="exam-progress-text">
					Hoàn thành <b>{completed_shifts}</b> / <b>{total_shift}</b>{" "}
					— Tổng toàn kỳ: <b>{total_all_shifts}</b>
				</p>
			</Card>
			<Card
				className="daily-summary-card"
				title="Tổng kết ca thi theo ngày"
			>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						marginBottom: 12,
					}}
				>
					<DatePicker
						value={summaryDate}
						onChange={(val) => {
							setSummaryDate(val);
							fetchSummaryByDate(val.format("YYYY-MM-DD"));
						}}
						format="DD/MM/YYYY"
						allowClear={false}
					/>
					<span style={{ fontStyle: "italic", color: "#475569" }}>
						Dữ liệu theo ngày thi
					</span>
				</div>

				<Table
					bordered
					size="middle"
					dataSource={dailySummary}
					rowKey={(r) => `${r.user_id}-${r.date}`}
					pagination={{ pageSize: 5 }}
					columns={[
						{
							title: "Giảng viên",
							dataIndex: "teacher_name",
							align: "center",
						},
						{
							title: "Mã GV",
							dataIndex: "teacher_code",
							align: "center",
						},
						{
							title: "Số ca trong ngày",
							dataIndex: "total_shifts",
							align: "center",
						},
						{
							title: "Số ca đã coi",
							dataIndex: "completed_shifts",
							align: "center",
						},
						{
							title: "Ghi chú",
							dataIndex: "note",
							align: "center",
						},
					]}
				/>
			</Card>

			{/* ======== CA THI ======== */}
			<div ref={refAssigned} className="scroll-section">
				<Card title="Ca thi đã gán" className="detail-card">
					<Table
						bordered
						size="middle"
						dataSource={assigned_shift_details}
						rowKey={(r) => `${r.exam_shift_id}-${r.user_id}`}
						pagination={{ pageSize: 5 }}
						columns={[
							{
								title: "Giảng viên",
								dataIndex: "teacher_name",
								align: "center",
							},
							{
								title: "Mã GV",
								dataIndex: "teacher_code",
								align: "center",
							},
							{
								title: "Môn thi",
								dataIndex: "subject_name",
								align: "center",
							},
							{
								title: "Phòng",
								render: (_, r) =>
									`${r.building}-${r.classroom}`,
								align: "center",
							},
							{
								title: "Thời gian",
								dataIndex: "starting_time",
								render: (d) =>
									new Date(d).toLocaleString("vi-VN", {
										hour: "2-digit",
										minute: "2-digit",
										day: "2-digit",
										month: "2-digit",
									}),
								align: "center",
							},
						]}
					/>
				</Card>
			</div>

			{/* ======== LỊCH RẢNH ======== */}
			<div ref={refFree} className="scroll-section">
				<Card
					title="Lịch coi thi của giảng viên"
					className="detail-card"
				>
					<Table
						bordered
						size="middle"
						dataSource={registered_free_days}
						rowKey="freeday_id"
						pagination={{ pageSize: 5 }}
						columns={[
							{
								title: "Giảng viên",
								dataIndex: "teacher_name",
								align: "center",
							},
							{
								title: "Mã GV",
								dataIndex: "teacher_code",
								align: "center",
							},
							{
								title: "Ngày coi thi",
								dataIndex: "free_date",
								render: (d) =>
									new Date(d).toLocaleDateString("vi-VN"),
								align: "center",
							},
							{
								title: "Ghi chú",
								dataIndex: "note",
								align: "center",
							},
						]}
					/>
				</Card>
			</div>

			{/* ======== DANH SÁCH GV ======== */}
			<div ref={refUsers} className="scroll-section">
				<Card
					title="Danh sách giảng viên trong khoa"
					className="detail-card"
				>
					<Table
						bordered
						size="middle"
						dataSource={users}
						rowKey="id"
						pagination={{ pageSize: 10 }}
						columns={[
							{
								title: "STT",
								render: (_, __, i) => i + 1,
								align: "center",
							},
							{
								title: "Họ và tên",
								dataIndex: "name",
								align: "center",
							},
							{
								title: "Mã GV",
								dataIndex: "teacher_code",
								align: "center",
							},
							{
								title: "Email",
								dataIndex: "email",
								align: "center",
							},
							{
								title: "Số ca đã coi",
								dataIndex: "exam_shift_count",
								align: "center",
							},
							{
								title: "Số ca được giao",
								align: "center",
								render: (_, record) =>
									editingUser === record.id ? (
										<Input
											type="number"
											value={newShiftValue}
											onChange={(e) =>
												setNewShiftValue(e.target.value)
											}
											style={{ width: 80 }}
										/>
									) : (
										record.number_shift
									),
							},
							{
								title: "Vai trò",
								dataIndex: "role_name",
								align: "center",
							},
							{
								title: "Hành động",
								align: "center",
								render: (_, record) =>
									editingUser === record.id ? (
										<>
											<Button
												type="primary"
												icon={<SaveOutlined />}
												size="small"
												style={{ marginRight: 8 }}
												onClick={() =>
													handleUpdateShift(record.id)
												}
											/>
											<Button
												icon={<CloseOutlined />}
												size="small"
												danger
												onClick={() => {
													setEditingUser(null);
													setNewShiftValue("");
												}}
											/>
										</>
									) : (
										<Button
											icon={<EditOutlined />}
											size="small"
											onClick={() => {
												setEditingUser(record.id);
												setNewShiftValue(
													record.number_shift ?? ""
												);
											}}
										/>
									),
							},
						]}
					/>
				</Card>
			</div>
		</div>
	);
}
