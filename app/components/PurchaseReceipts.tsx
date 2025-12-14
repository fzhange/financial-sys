'use client';

import React, { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Card,
  Row,
  Col,
  Typography,
  Descriptions,
  Divider,
  Select,
  Input,
  Statistic,
} from 'antd';
import {
  EyeOutlined,
  SearchOutlined,
  FileExcelOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { mockPurchaseReceipts, mockSuppliers } from '../lib/mockData';
import type { PurchaseReceipt } from '../types';

const { Title, Text } = Typography;
const { Option } = Select;

const statusConfig: Record<string, { color: string; text: string }> = {
  pending: { color: 'processing', text: '待对账' },
  reconciled: { color: 'success', text: '已对账' },
  cancelled: { color: 'default', text: '已取消' },
};

const reconciliationStatusConfig: Record<string, { color: string; text: string }> = {
  pending: { color: 'default', text: '未对账' },
  matched: { color: 'success', text: '已对账' },
  unmatched: { color: 'error', text: '未对账' },
};

export default function PurchaseReceipts() {
  const [receipts] = useState<PurchaseReceipt[]>(mockPurchaseReceipts);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PurchaseReceipt | null>(null);
  const [filterSupplier, setFilterSupplier] = useState<string | undefined>();
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [searchText, setSearchText] = useState('');

  const filteredReceipts = receipts.filter((r) => {
    if (filterSupplier && r.supplierId !== filterSupplier) return false;
    if (filterStatus && r.reconciliationStatus !== filterStatus) return false;
    if (searchText && !r.receiptNo.toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
  });

  // 统计
  const stats = {
    total: receipts.length,
    pending: receipts.filter(r => r.reconciliationStatus === 'pending').length,
    reconciled: receipts.filter(r => r.reconciliationStatus === 'matched').length,
    totalAmount: receipts.reduce((sum, r) => sum + r.totalAmount, 0),
  };

  const handleView = (record: PurchaseReceipt) => {
    setSelectedReceipt(record);
    setIsDetailOpen(true);
  };

  const columns = [
    {
      title: '入库单号',
      dataIndex: 'receiptNo',
      key: 'receiptNo',
      width: 120,
      render: (text: string, record: PurchaseReceipt) => (
        <a onClick={() => handleView(record)}>{text}</a>
      ),
    },
    {
      title: '入库日期',
      dataIndex: 'receiptDate',
      key: 'receiptDate',
      width: 100,
    },
    {
      title: '关联采购单号',
      dataIndex: 'purchaseOrderNo',
      key: 'purchaseOrderNo',
      width: 140,
      render: (text: string) => text ? <a>{text}</a> : '-',
    },
    {
      title: '供应商',
      dataIndex: 'supplierName',
      key: 'supplierName',
      width: 160,
    },
    {
      title: '入库SKU数',
      dataIndex: 'skuCount',
      key: 'skuCount',
      width: 100,
      align: 'center' as const,
    },
    {
      title: '入库数量',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      width: 90,
      align: 'right' as const,
    },
    {
      title: '良品数量',
      dataIndex: 'goodQuantity',
      key: 'goodQuantity',
      width: 90,
      align: 'right' as const,
    },
    {
      title: '次品数量',
      dataIndex: 'defectQuantity',
      key: 'defectQuantity',
      width: 90,
      align: 'right' as const,
      render: (val: number) => (
        <span style={{ color: val > 0 ? '#ff4d4f' : undefined }}>{val}</span>
      ),
    },
    {
      title: '入库金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 110,
      align: 'right' as const,
      render: (val: number) => `¥${val.toLocaleString()}`,
    },
    {
      title: '应付金额',
      dataIndex: 'payableAmount',
      key: 'payableAmount',
      width: 110,
      align: 'right' as const,
      render: (val: number) => (
        <Text strong>¥{val.toLocaleString()}</Text>
      ),
    },
    {
      title: '对账状态',
      dataIndex: 'reconciliationStatus',
      key: 'reconciliationStatus',
      width: 90,
      render: (status: string) => {
        const config = reconciliationStatusConfig[status];
        return <Tag color={config?.color}>{config?.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: unknown, record: PurchaseReceipt) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleView(record)}
        >
          查看
        </Button>
      ),
    },
  ];

  const itemColumns = [
    {
      title: '商品编码',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 100,
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 150,
    },
    {
      title: '规格型号',
      dataIndex: 'specification',
      key: 'specification',
      width: 150,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 60,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      align: 'right' as const,
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 100,
      align: 'right' as const,
      render: (val: number) => `¥${val.toFixed(2)}`,
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 100,
      align: 'right' as const,
      render: (val: number) => `¥${val.toFixed(2)}`,
    },
    {
      title: '税率',
      dataIndex: 'taxRate',
      key: 'taxRate',
      width: 70,
      align: 'right' as const,
      render: (val: number) => `${val}%`,
    },
    {
      title: '税额',
      dataIndex: 'taxAmount',
      key: 'taxAmount',
      width: 100,
      align: 'right' as const,
      render: (val: number) => `¥${val.toFixed(2)}`,
    },
    {
      title: '含税金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 110,
      align: 'right' as const,
      render: (val: number) => (
        <Text strong>¥{val.toLocaleString()}</Text>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>采购入库单</Title>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="入库单总数"
              value={stats.total}
              prefix={<InboxOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="待对账"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="已对账"
              value={stats.reconciled}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="入库总金额"
              value={stats.totalAmount}
              valueStyle={{ color: '#1677ff' }}
              formatter={(val) => `¥${Number(val).toLocaleString()}`}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col>
            <Input
              placeholder="搜索入库单号"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
          </Col>
          <Col>
            <Select
              placeholder="选择供应商"
              style={{ width: 180 }}
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
              placeholder="对账状态"
              style={{ width: 120 }}
              allowClear
              value={filterStatus}
              onChange={setFilterStatus}
            >
              {Object.entries(reconciliationStatusConfig).map(([key, val]) => (
                <Option key={key} value={key}>{val.text}</Option>
              ))}
            </Select>
          </Col>
          <Col flex="auto" />
          <Col>
            <Button icon={<FileExcelOutlined />}>导出</Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredReceipts}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title="采购入库单详情"
        open={isDetailOpen}
        onCancel={() => setIsDetailOpen(false)}
        width={1100}
        footer={[
          <Button key="close" onClick={() => setIsDetailOpen(false)}>
            关闭
          </Button>,
        ]}
      >
        {selectedReceipt && (
          <>
            <Descriptions bordered size="small" column={3}>
              <Descriptions.Item label="入库单号">{selectedReceipt.receiptNo}</Descriptions.Item>
              <Descriptions.Item label="采购订单号">{selectedReceipt.purchaseOrderNo || '-'}</Descriptions.Item>
              <Descriptions.Item label="入库日期">{selectedReceipt.receiptDate}</Descriptions.Item>
              <Descriptions.Item label="供应商">{selectedReceipt.supplierName}</Descriptions.Item>
              <Descriptions.Item label="入库仓库">{selectedReceipt.warehouseName}</Descriptions.Item>
              <Descriptions.Item label="对账状态">
                <Tag color={reconciliationStatusConfig[selectedReceipt.reconciliationStatus]?.color}>
                  {reconciliationStatusConfig[selectedReceipt.reconciliationStatus]?.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="入库SKU数">{selectedReceipt.skuCount}</Descriptions.Item>
              <Descriptions.Item label="入库数量">{selectedReceipt.totalQuantity}</Descriptions.Item>
              <Descriptions.Item label="良品/次品">
                {selectedReceipt.goodQuantity} / 
                <span style={{ color: selectedReceipt.defectQuantity > 0 ? '#ff4d4f' : undefined }}>
                  {selectedReceipt.defectQuantity}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="入库金额">
                ¥{selectedReceipt.totalAmount.toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="应付金额" span={2}>
                <Text strong style={{ fontSize: 16, color: '#1677ff' }}>
                  ¥{selectedReceipt.payableAmount.toLocaleString()}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">商品明细</Divider>

            <Table
              columns={itemColumns}
              dataSource={selectedReceipt.items}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ x: 1000 }}
              summary={(pageData) => {
                const totalQty = pageData.reduce((sum, item) => sum + item.quantity, 0);
                const totalAmt = pageData.reduce((sum, item) => sum + item.amount, 0);
                const totalTax = pageData.reduce((sum, item) => sum + item.taxAmount, 0);
                const totalWithTax = pageData.reduce((sum, item) => sum + item.totalAmount, 0);
                return (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={4}>
                        <strong>合计</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <strong>{totalQty}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} />
                      <Table.Summary.Cell index={3} align="right">
                        <strong>¥{totalAmt.toFixed(2)}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4} />
                      <Table.Summary.Cell index={5} align="right">
                        <strong>¥{totalTax.toFixed(2)}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={6} align="right">
                        <strong style={{ color: '#1677ff' }}>¥{totalWithTax.toLocaleString()}</strong>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                );
              }}
            />
          </>
        )}
      </Modal>
    </div>
  );
}
