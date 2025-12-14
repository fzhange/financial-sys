'use client';

import React from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Progress, Typography } from 'antd';
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  DollarOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { mockReconciliationStatements, mockPurchaseReceipts, getReconciliationStats, getPayableStats } from '../lib/mockData';
import type { ReconciliationStatement } from '../types';

const { Title } = Typography;

const statusConfig: Record<string, { color: string; text: string }> = {
  draft: { color: 'default', text: '草稿' },
  pending: { color: 'processing', text: '待确认' },
  confirmed: { color: 'success', text: '已确认' },
  disputed: { color: 'error', text: '有争议' },
  resolved: { color: 'warning', text: '已解决' },
};

export default function Dashboard() {
  const stats = getReconciliationStats();
  const payableStats = getPayableStats();
  const recentStatements = mockReconciliationStatements.slice(0, 5);
  
  // 入库单统计
  const receiptStats = {
    total: mockPurchaseReceipts.length,
    pending: mockPurchaseReceipts.filter(r => r.reconciliationStatus === 'pending').length,
    matched: mockPurchaseReceipts.filter(r => r.reconciliationStatus === 'matched').length,
  };

  const columns = [
    {
      title: '对账单号',
      dataIndex: 'statementNo',
      key: 'statementNo',
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: '供应商',
      dataIndex: 'supplierName',
      key: 'supplierName',
    },
    {
      title: '对账期间',
      key: 'period',
      render: (_: unknown, record: ReconciliationStatement) => (
        <span>{record.periodStart} ~ {record.periodEnd}</span>
      ),
    },
    {
      title: '入库单数',
      dataIndex: 'reconciliationQuantity',
      key: 'reconciliationQuantity',
      align: 'center' as const,
    },
    {
      title: '对账金额',
      dataIndex: 'reconciliationAmount',
      key: 'reconciliationAmount',
      render: (val: number) => `¥${val.toLocaleString()}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config = statusConfig[status];
        return <Tag color={config?.color}>{config?.text}</Tag>;
      },
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>对账概览</Title>
      
      {/* 对账单统计 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="对账单总数"
              value={stats.totalStatements}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待确认"
              value={stats.pendingCount}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="已确认"
              value={stats.confirmedCount}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待对账入库单"
              value={receiptStats.pending}
              prefix={<InboxOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 应付账款统计 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="应付总额"
              value={payableStats.totalAmount}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#1677ff' }}
              formatter={(val) => `¥${Number(val).toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="已付金额"
              value={payableStats.paidAmount}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
              formatter={(val) => `¥${Number(val).toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="未付金额"
              value={payableStats.unpaidAmount}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
              formatter={(val) => `¥${Number(val).toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="逾期金额"
              value={payableStats.overdueAmount}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
              formatter={(val) => `¥${Number(val).toLocaleString()}`}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="最近对账单" extra={<a>查看全部</a>}>
            <Table
              columns={columns}
              dataSource={recentStatements}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="对账完成率">
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Progress
                type="circle"
                percent={stats.totalStatements > 0 ? Math.round((stats.confirmedCount / stats.totalStatements) * 100) : 0}
                format={(percent) => `${percent}%`}
                size={120}
              />
              <p style={{ marginTop: 16, color: '#666' }}>
                本月对账完成进度
              </p>
            </div>
          </Card>
          <Card title="入库单对账进度" style={{ marginTop: 16 }}>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Progress
                type="circle"
                percent={receiptStats.total > 0 ? Math.round((receiptStats.matched / receiptStats.total) * 100) : 0}
                format={(percent) => `${percent}%`}
                size={120}
                strokeColor="#52c41a"
              />
              <p style={{ marginTop: 16, color: '#666' }}>
                {receiptStats.matched}/{receiptStats.total} 已对账
              </p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
