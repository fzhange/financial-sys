'use client';

import React, { useState } from 'react';
import {
  Table,
  Tag,
  Select,
  DatePicker,
  Card,
  Row,
  Col,
  Typography,
  Timeline,
  Empty,
} from 'antd';
import {
  FileAddOutlined,
  SendOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { mockReconciliationHistory, mockReconciliationStatements, mockSuppliers } from '../lib/mockData';
import type { ReconciliationHistory as HistoryType, ReconciliationStatement } from '../types';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const actionConfig: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
  created: { color: 'blue', text: '创建', icon: <FileAddOutlined /> },
  submitted: { color: 'cyan', text: '提交', icon: <SendOutlined /> },
  confirmed: { color: 'green', text: '确认', icon: <CheckCircleOutlined /> },
  disputed: { color: 'red', text: '争议', icon: <ExclamationCircleOutlined /> },
  resolved: { color: 'orange', text: '解决', icon: <CheckCircleOutlined /> },
  adjusted: { color: 'purple', text: '调整', icon: <EditOutlined /> },
};

const statusConfig: Record<string, { color: string; text: string }> = {
  draft: { color: 'default', text: '草稿' },
  pending: { color: 'processing', text: '待确认' },
  confirmed: { color: 'success', text: '已确认' },
  disputed: { color: 'error', text: '有争议' },
  resolved: { color: 'warning', text: '已解决' },
};

export default function ReconciliationHistoryComponent() {
  const [history] = useState<HistoryType[]>(mockReconciliationHistory);
  const [selectedReconciliation, setSelectedReconciliation] = useState<string | undefined>();
  const [filterSupplier, setFilterSupplier] = useState<string | undefined>();

  // 获取对账单信息
  const getStatement = (reconciliationId: string): ReconciliationStatement | undefined => {
    return mockReconciliationStatements.find(s => s.id === reconciliationId);
  };

  // 过滤历史记录
  const filteredHistory = history.filter((h) => {
    if (selectedReconciliation && h.reconciliationId !== selectedReconciliation) return false;
    if (filterSupplier) {
      const statement = getStatement(h.reconciliationId);
      if (statement?.supplierId !== filterSupplier) return false;
    }
    return true;
  });

  // 按对账单分组
  const groupedHistory = filteredHistory.reduce((acc, h) => {
    if (!acc[h.reconciliationId]) {
      acc[h.reconciliationId] = [];
    }
    acc[h.reconciliationId].push(h);
    return acc;
  }, {} as Record<string, HistoryType[]>);

  const columns = [
    {
      title: '对账单号',
      key: 'statementNo',
      width: 150,
      render: (_: unknown, record: HistoryType) => {
        const statement = getStatement(record.reconciliationId);
        return statement?.statementNo || '-';
      },
    },
    {
      title: '供应商',
      key: 'supplierName',
      width: 180,
      render: (_: unknown, record: HistoryType) => {
        const statement = getStatement(record.reconciliationId);
        return statement?.supplierName || '-';
      },
    },
    {
      title: '操作类型',
      dataIndex: 'action',
      key: 'action',
      width: 100,
      render: (action: string) => {
        const config = actionConfig[action];
        return <Tag color={config?.color}>{config?.text}</Tag>;
      },
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      width: 100,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
    },
    {
      title: '操作时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>对账历史</Title>

      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col>
                <Select
                  placeholder="选择供应商"
                  style={{ width: 200 }}
                  allowClear
                  value={filterSupplier}
                  onChange={setFilterSupplier}
                >
                  {mockSuppliers.map((s) => (
                    <Option key={s.id} value={s.id}>{s.name}</Option>
                  ))}
                </Select>
              </Col>
              <Col>
                <Select
                  placeholder="选择对账单"
                  style={{ width: 180 }}
                  allowClear
                  value={selectedReconciliation}
                  onChange={setSelectedReconciliation}
                >
                  {mockReconciliationStatements.map((s) => (
                    <Option key={s.id} value={s.id}>{s.statementNo}</Option>
                  ))}
                </Select>
              </Col>
            </Row>

            <Table
              columns={columns}
              dataSource={filteredHistory}
              rowKey="id"
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="操作时间线">
            {Object.keys(groupedHistory).length === 0 ? (
              <Empty description="暂无历史记录" />
            ) : (
              <div style={{ maxHeight: 500, overflow: 'auto' }}>
                {Object.entries(groupedHistory).map(([reconciliationId, items]) => {
                  const statement = getStatement(reconciliationId);
                  return (
                    <div key={reconciliationId} style={{ marginBottom: 24 }}>
                      <div style={{ 
                        marginBottom: 12, 
                        padding: '8px 12px',
                        background: '#f5f5f5',
                        borderRadius: 4,
                      }}>
                        <Text strong>{statement?.statementNo}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {statement?.supplierName}
                        </Text>
                        <Tag 
                          color={statusConfig[statement?.status || 'draft']?.color}
                          style={{ marginLeft: 8 }}
                        >
                          {statusConfig[statement?.status || 'draft']?.text}
                        </Tag>
                      </div>
                      <Timeline
                        items={items.map((item) => {
                          const config = actionConfig[item.action];
                          return {
                            color: config?.color,
                            dot: config?.icon,
                            children: (
                              <div>
                                <div>
                                  <Tag color={config?.color} size="small">{config?.text}</Tag>
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    {item.operator}
                                  </Text>
                                </div>
                                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                                  {item.remark}
                                </div>
                                <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                                  <ClockCircleOutlined style={{ marginRight: 4 }} />
                                  {item.createdAt}
                                </div>
                              </div>
                            ),
                          };
                        })}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
