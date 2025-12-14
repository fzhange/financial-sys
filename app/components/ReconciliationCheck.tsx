'use client';

import React, { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  message,
  Card,
  Row,
  Col,
  Typography,
  Alert,
  Tooltip,
  Descriptions,
  Divider,
  Checkbox,
} from 'antd';
import {
  CheckCircleOutlined,
  SyncOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { 
  mockReconciliationStatements, 
  mockPurchaseReceipts,
} from '../lib/mockData';
import type { 
  ReconciliationStatement, 
  ReconciliationReceiptItem,
  PurchaseReceipt,
} from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const reconciliationStatusConfig: Record<string, { color: string; text: string }> = {
  pending: { color: 'default', text: '未对账' },
  matched: { color: 'success', text: '已对账' },
  unmatched: { color: 'error', text: '未对账' },
};

interface ReconciliationCheckProps {
  onConfirmReconciliation?: (statement: ReconciliationStatement, payableAmount: number) => void;
}

export default function ReconciliationCheck({ onConfirmReconciliation }: ReconciliationCheckProps) {
  const [statements, setStatements] = useState<ReconciliationStatement[]>(
    mockReconciliationStatements.filter(s => s.status !== 'confirmed')
  );
  const [selectedStatement, setSelectedStatement] = useState<ReconciliationStatement | null>(null);
  const [receipts, setReceipts] = useState<ReconciliationReceiptItem[]>([]);
  const [isReceiptDetailOpen, setIsReceiptDetailOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PurchaseReceipt | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const handleSelectStatement = (statement: ReconciliationStatement) => {
    setSelectedStatement(statement);
    setReceipts([...statement.receipts]);
    setSelectedRowKeys([]);
  };

  // 单个入库单对账
  const handleMatchReceipt = (item: ReconciliationReceiptItem) => {
    setReceipts(
      receipts.map((r) =>
        r.id === item.id ? { ...r, reconciliationStatus: 'matched' as const } : r
      )
    );
    message.success(`入库单 ${item.receiptNo} 对账成功`);
  };

  // 批量对账
  const handleBatchMatch = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要对账的入库单');
      return;
    }
    
    setReceipts(
      receipts.map((r) =>
        selectedRowKeys.includes(r.id) 
          ? { ...r, reconciliationStatus: 'matched' as const } 
          : r
      )
    );
    message.success(`批量对账完成，成功对账 ${selectedRowKeys.length} 个入库单`);
    setSelectedRowKeys([]);
  };

  // 查看入库单详情
  const handleViewReceipt = (receiptNo: string) => {
    const receipt = mockPurchaseReceipts.find(r => r.receiptNo === receiptNo);
    if (receipt) {
      setSelectedReceipt(receipt);
      setIsReceiptDetailOpen(true);
    } else {
      message.warning('未找到对应的入库单');
    }
  };

  // 完成核对 - 打开确认弹窗
  const handleCompleteCheck = () => {
    if (!selectedStatement) return;
    const unmatchedCount = receipts.filter(r => r.reconciliationStatus !== 'matched').length;
    if (unmatchedCount > 0) {
      message.warning(`还有 ${unmatchedCount} 个入库单未对账`);
      return;
    }
    setIsConfirmOpen(true);
  };

  // 确认对账并生成应付
  const handleConfirmAndGeneratePayable = () => {
    if (!selectedStatement) return;

    // 计算应付金额
    const payableAmount = receipts.reduce((sum, r) => sum + r.payableAmount, 0);

    // 更新对账单状态
    setStatements(
      statements.filter(s => s.id !== selectedStatement.id)
    );

    // 调用回调生成应付账款
    if (onConfirmReconciliation) {
      onConfirmReconciliation(selectedStatement, payableAmount);
    }

    message.success(`对账确认成功，已生成应付账款 ¥${payableAmount.toLocaleString()}`);
    setIsConfirmOpen(false);
    setSelectedStatement(null);
    setReceipts([]);
  };

  const unmatchedCount = receipts.filter(r => r.reconciliationStatus !== 'matched').length;
  const matchedCount = receipts.filter(r => r.reconciliationStatus === 'matched').length;
  const totalPayableAmount = receipts.reduce((sum, r) => sum + r.payableAmount, 0);

  const columns = [
    {
      title: '入库单号',
      dataIndex: 'receiptNo',
      key: 'receiptNo',
      width: 120,
      render: (text: string) => (
        <a onClick={() => handleViewReceipt(text)}>{text}</a>
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
      title: '入库SKU数',
      dataIndex: 'skuCount',
      key: 'skuCount',
      width: 100,
      align: 'center' as const,
    },
    {
      title: '入库数量',
      dataIndex: 'receiptQuantity',
      key: 'receiptQuantity',
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
      title: '品种',
      dataIndex: 'category',
      key: 'category',
      width: 120,
    },
    {
      title: '是否含税',
      dataIndex: 'hasTax',
      key: 'hasTax',
      width: 80,
      align: 'center' as const,
      render: (val: boolean) => val ? '是' : '否',
    },
    {
      title: '入库金额',
      dataIndex: 'receiptAmount',
      key: 'receiptAmount',
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
      width: 100,
      fixed: 'right' as const,
      render: (_: unknown, record: ReconciliationReceiptItem) => (
        <Space size="small">
          <Tooltip title="查看入库单">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewReceipt(record.receiptNo)}
            />
          </Tooltip>
          {record.reconciliationStatus !== 'matched' && (
            <Tooltip title="确认对账">
              <Button
                type="link"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleMatchReceipt(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // 入库单明细列
  const receiptItemColumns = [
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

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
    getCheckboxProps: (record: ReconciliationReceiptItem) => ({
      disabled: record.reconciliationStatus === 'matched',
    }),
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>对账核对</Title>

      <Row gutter={16}>
        <Col xs={24} lg={6}>
          <Card title="待核对对账单" size="small">
            {statements.length === 0 ? (
              <Text type="secondary">暂无待核对的对账单</Text>
            ) : (
              <div style={{ maxHeight: 500, overflow: 'auto' }}>
                {statements.map((statement) => (
                  <Card
                    key={statement.id}
                    size="small"
                    hoverable
                    style={{
                      marginBottom: 8,
                      borderColor: selectedStatement?.id === statement.id ? '#1677ff' : undefined,
                    }}
                    onClick={() => handleSelectStatement(statement)}
                  >
                    <div style={{ fontWeight: 500 }}>{statement.statementNo}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      {statement.supplierName}
                    </div>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                      {statement.periodStart} ~ {statement.periodEnd}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <Tag color="processing">
                        {statement.receipts.length} 个入库单
                      </Tag>
                      <Tag color="blue">
                        ¥{statement.reconciliationAmount.toLocaleString()}
                      </Tag>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={18}>
          <Card
            title={
              selectedStatement
                ? `核对明细 - ${selectedStatement.statementNo}`
                : '核对明细'
            }
            extra={
              selectedStatement && (
                <Space>
                  <Button icon={<SyncOutlined />} onClick={handleBatchMatch}>
                    批量匹配
                  </Button>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    disabled={unmatchedCount > 0}
                    onClick={handleCompleteCheck}
                  >
                    完成
                  </Button>
                </Space>
              )
            }
          >
            {!selectedStatement ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                请从左侧选择一个对账单进行核对
              </div>
            ) : (
              <>
                {unmatchedCount > 0 && (
                  <Alert
                    message={
                      <span>
                        存在 <Text strong style={{ color: '#ff4d4f' }}>{unmatchedCount}</Text> 个入库单未对账，
                        请逐一核对后确认
                      </span>
                    }
                    type="warning"
                    showIcon
                    icon={<ExclamationCircleOutlined />}
                    style={{ marginBottom: 16 }}
                  />
                )}

                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={6}>
                    <Card size="small">
                      <div style={{ color: '#666', fontSize: 12 }}>总记录数</div>
                      <div style={{ fontSize: 24, fontWeight: 600 }}>{receipts.length}</div>
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small">
                      <div style={{ color: '#666', fontSize: 12 }}>已匹配</div>
                      <div style={{ fontSize: 24, fontWeight: 600, color: '#52c41a' }}>
                        {matchedCount}
                      </div>
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small">
                      <div style={{ color: '#666', fontSize: 12 }}>未匹配</div>
                      <div style={{ fontSize: 24, fontWeight: 600, color: '#ff4d4f' }}>
                        {unmatchedCount}
                      </div>
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small">
                      <div style={{ color: '#666', fontSize: 12 }}>应付金额</div>
                      <div style={{ fontSize: 20, fontWeight: 600, color: '#1677ff' }}>
                        ¥{totalPayableAmount.toLocaleString()}
                      </div>
                    </Card>
                  </Col>
                </Row>

                <Table
                  rowSelection={rowSelection}
                  columns={columns}
                  dataSource={receipts}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  scroll={{ x: 1500 }}
                  summary={(pageData) => {
                    const totalQty = pageData.reduce((sum, r) => sum + r.receiptQuantity, 0);
                    const totalAmount = pageData.reduce((sum, r) => sum + r.receiptAmount, 0);
                    const totalPayable = pageData.reduce((sum, r) => sum + r.payableAmount, 0);
                    return (
                      <Table.Summary fixed>
                        <Table.Summary.Row>
                          <Table.Summary.Cell index={0} />
                          <Table.Summary.Cell index={1} colSpan={3}>
                            <strong>合计</strong>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={2} align="right">
                            <strong>{totalQty}</strong>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={3} colSpan={4} />
                          <Table.Summary.Cell index={4} align="right">
                            <strong>¥{totalAmount.toLocaleString()}</strong>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={5} align="right">
                            <strong style={{ color: '#1677ff' }}>¥{totalPayable.toLocaleString()}</strong>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={6} colSpan={2} />
                        </Table.Summary.Row>
                      </Table.Summary>
                    );
                  }}
                />

                {/* 应付金额提示 */}
                {unmatchedCount === 0 && totalPayableAmount > 0 && (
                  <Alert
                    message={
                      <span>
                        核对完成后将生成应付账款：
                        <Text strong style={{ color: '#1677ff', fontSize: 16, marginLeft: 8 }}>
                          ¥{totalPayableAmount.toLocaleString()}
                        </Text>
                      </span>
                    }
                    type="info"
                    showIcon
                    icon={<DollarOutlined />}
                    style={{ marginTop: 16 }}
                  />
                )}
              </>
            )}
          </Card>
        </Col>
      </Row>

      {/* 入库单详情弹窗 */}
      <Modal
        title="采购入库单详情"
        open={isReceiptDetailOpen}
        onCancel={() => setIsReceiptDetailOpen(false)}
        width={1100}
        footer={[
          <Button key="close" onClick={() => setIsReceiptDetailOpen(false)}>
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
              <Descriptions.Item label="入库数量">{selectedReceipt.totalQuantity}</Descriptions.Item>
              <Descriptions.Item label="良品数量">{selectedReceipt.goodQuantity}</Descriptions.Item>
              <Descriptions.Item label="次品数量">
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
              columns={receiptItemColumns}
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

      {/* 确认对账弹窗 */}
      <Modal
        title="确认对账"
        open={isConfirmOpen}
        onOk={handleConfirmAndGeneratePayable}
        onCancel={() => setIsConfirmOpen(false)}
        okText="确认并生成应付"
        cancelText="取消"
      >
        {selectedStatement && (
          <div>
            <Alert
              message="确认对账后将自动生成供应商应付账款"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="对账单号">{selectedStatement.statementNo}</Descriptions.Item>
              <Descriptions.Item label="供应商">{selectedStatement.supplierName}</Descriptions.Item>
              <Descriptions.Item label="对账期间">
                {selectedStatement.periodStart} ~ {selectedStatement.periodEnd}
              </Descriptions.Item>
              <Descriptions.Item label="入库单数量">
                {receipts.length} 单
              </Descriptions.Item>
              <Descriptions.Item label="应付金额">
                <Text strong style={{ color: '#1677ff', fontSize: 18 }}>
                  ¥{totalPayableAmount.toLocaleString()}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="付款到期日">
                {dayjs().add(30, 'day').format('YYYY-MM-DD')}
                <Text type="secondary" style={{ marginLeft: 8 }}>(30天后)</Text>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
}
