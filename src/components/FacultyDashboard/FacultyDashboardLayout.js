import React, { useState } from "react";
import { Layout, Menu, Button, Drawer } from "antd";
import {
  DashboardOutlined,
  CalendarOutlined,
  TeamOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate } from "react-router-dom";
import "./faculty-dashboard.css";

const { Sider, Content, Header } = Layout;

export default function FacultyDashboardLayout() {
  const navigate = useNavigate();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Tổng quan",
      onClick: () => navigate("/faculty"),
    },
    {
      key: "assign",
      icon: <TeamOutlined />,
      label: "Gán giảng viên",
      onClick: () => navigate("/faculty/assign"),
    },
    {
      key: "register",
      icon: <CalendarOutlined />,
      label: "Đăng ký lịch coi thi",
      onClick: () => navigate("/faculty/register"),
    },
  ];

  return (
    <Layout className="faculty-layout" style={{ minHeight: "100vh" }}>
      {/* ==== SIDEBAR (Desktop / Tablet) ==== */}
      <Sider
        width={240}
        className="faculty-sidebar"
        style={{
          background: "linear-gradient(180deg, #e8edf3 0%, #d4dae0 100%)",
          color: "#374151",
          position: "fixed",
          height: "100vh",
          left: 0,
          top: 80,
          bottom: 0,
          overflow: "hidden",
          borderRight: "1px solid #e5e7eb",
        }}
      >
        <Menu
          theme="light"
          mode="inline"
          defaultSelectedKeys={["dashboard"]}
          style={{
            background: "transparent",
            border: "none",
            fontWeight: 500,
          }}
          items={menuItems}
        />
      </Sider>

      {/* ==== DRAWER SIDEBAR (Mobile) ==== */}
      <Drawer
        placement="left"
        title="Hệ thống quản lý trông thi"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={220}
        bodyStyle={{ padding: 0 }}
      >
        <Menu
          mode="inline"
          items={menuItems.map((item) => ({
            ...item,
            onClick: () => {
              item.onClick();
              setDrawerVisible(false);
            },
          }))}
        />
      </Drawer>

      {/* ==== MAIN CONTENT ==== */}
      <Layout
        className="faculty-main"
        style={{
          marginLeft: 240,
          transition: "all 0.3s ease",
        }}
      >
        <Header className="faculty-header">
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setDrawerVisible(true)}
            className="mobile-menu-btn"
          />
          <span>Hệ thống quản lý trông thi</span>
        </Header>

        <Content className="faculty-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
