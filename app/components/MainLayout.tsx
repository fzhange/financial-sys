'use client';

import React, { useState } from 'react';
import { 
  Layout, 
  Menu, 
  theme,
  ConfigProvider,
  App as AntdApp
} from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  FileTextOutlined,
  AuditOutlined,
  HistoryOutlined,
  SettingOutlined,
  DollarOutlined,
  InboxOutlined,
  MoneyCollectOutlined,
  ProfileOutlined,
  AccountBookOutlined,
  CalculatorOutlined,
} from '@ant-design/icons';
import zhCN from 'antd/locale/zh_CN';

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
  currentKey: string;
  onMenuSelect: (key: string) => void;
}

const menuItems = [
  {
    key: 'dashboard',
    icon: <DashboardOutlined />,
    label: '对账概览',
  },
  {
    key: 'suppliers',
    icon: <TeamOutlined />,
    label: '供应商管理',
  },
  {
    key: 'receipts',
    icon: <InboxOutlined />,
    label: '采购入库单',
  },
  {
    key: 'statements',
    icon: <FileTextOutlined />,
    label: '对账单管理',
  },
  {
    key: 'reconciliation',
    icon: <AuditOutlined />,
    label: '对账核对',
  },
  {
    key: 'payables',
    icon: <DollarOutlined />,
    label: '应付账款',
  },
  {
    key: 'invoices',
    icon: <ProfileOutlined />,
    label: '发票管理',
  },
  {
    key: 'paymentRequests',
    icon: <MoneyCollectOutlined />,
    label: '请款管理',
  },
  {
    key: 'paymentVouchers',
    icon: <AccountBookOutlined />,
    label: '付款单管理',
  },
  {
    key: 'costCalculation',
    icon: <CalculatorOutlined />,
    label: '成本核算',
  },
  {
    key: 'history',
    icon: <HistoryOutlined />,
    label: '对账历史',
  },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: '系统设置',
  },
];

export default function MainLayout({ children, currentKey, onMenuSelect }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
        },
      }}
    >
      <AntdApp>
        <Layout style={{ minHeight: '100vh' }}>
          <Sider 
            collapsible 
            collapsed={collapsed} 
            onCollapse={setCollapsed}
            style={{
              background: token.colorBgContainer,
            }}
          >
            <div style={{ 
              height: 64, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderBottom: `1px solid ${token.colorBorderSecondary}`,
            }}>
              <h1 style={{ 
                margin: 0, 
                fontSize: collapsed ? 16 : 18, 
                fontWeight: 600,
                color: token.colorPrimary,
                whiteSpace: 'nowrap',
              }}>
                {collapsed ? 'ERP' : 'ERP财务系统'}
              </h1>
            </div>
            <Menu
              mode="inline"
              selectedKeys={[currentKey]}
              items={menuItems}
              style={{ borderRight: 0 }}
              onClick={({ key }) => onMenuSelect(key)}
            />
          </Sider>
          <Layout>
            <Header style={{ 
              padding: '0 24px', 
              background: token.colorBgContainer,
              borderBottom: `1px solid ${token.colorBorderSecondary}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>
                供应商对账模块
              </h2>
              <span style={{ color: token.colorTextSecondary }}>
                当前用户：财务管理员
              </span>
            </Header>
            <Content style={{ 
              margin: 16, 
              padding: 24, 
              background: token.colorBgContainer,
              borderRadius: token.borderRadius,
              minHeight: 280,
              overflow: 'auto',
            }}>
              {children}
            </Content>
          </Layout>
        </Layout>
      </AntdApp>
    </ConfigProvider>
  );
}
