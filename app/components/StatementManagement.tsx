'use client';

import React, { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Select,
  DatePicker,
  message,
  Card,
  Row,
  Col,
  Typography,
  Descriptions,
  Divider,
  Tabs,
  Checkbox,
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  PrinterOutlined,
  SearchOutlined,
  FileExcelOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { mockReconciliationStatements, mockSuppliers, mockPurchaseReceipts } from '../lib/mockData';
import type { ReconciliationStatement, ReconciliationReceiptItem, PurchaseReceipt } from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const statusConfig: Record<string, { color: string; text: string }> = {
  draft: { color: 'default', text: '草稿' },
  pending: { color: 'processing', text: '待确认' },
  confirmed: { color: 'success', text: '已确认' },
  disputed: { color: 'error', text: '有争议' },
  resolved: { color: 'warning', text: '已解决' },
};

const reconciliationStatusConfig: Record<string, { color: string; text: string }> = {
  pending: { color: 'default', text: '未对账' },
  matched: { color: 'success', text: '已对账' },
  unmatched: { color: 'error', text: '未对账' },
};

export default function StatementManagement() {
  const [statements, setStatements] = useState<ReconciliationStatement[]>(mockReconciliationStatements);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedStatement, setSelectedStatement] = useState<ReconciliationStatement | null>(null);
  const [filterSupplier, setFilterSupplier] = useState<string | undefined>();
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState('all');
  const [form] = Form.useForm();

  // 筛选数据
  const getFilteredStatements = () => {
    let filtered = statements;
    
    // 按标签页筛选
    if (activeTab === 'pending') {
      filtered = filtered.filter(s => s.status === 'pending' || s.status === 'draft');
    } else if (activeTab === 'confirmed') {
      filtered = filtered.filter(s => s.status === 'confirmed');
    } else if (activeTab === 'archived') {
      filtered = filtered.filter(s => s.status === 'resolved');
    }
    
    // 按供应商筛选
    if (filterSupplier) {
      filtered = filtered.filter(s => s.supplierId === filterSupplier);
    }
    
    // 按状态筛选
    if (filterStatus) {
      filtered = filtered.filter(s => s.status === filterStatus);
    }
    
    return filtered;
  };

  const filteredStatements = getFilteredStatements();

  const handleCreate = () => {
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleView = (record: ReconciliationStatement) => {
    setSelectedStatement(record);
    setIsDetailOpen(true);
  };

  const handleConfirm = (record: ReconciliationStatement) => {
    Modal.confirm({
      title: '确认对账单',
      content: `确定要确认对账单 ${record.statementNo} 吗？确认后将生成应付账款。`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        setStatements(
          statements.map((s) =>
            s.id === record.id
              ? {
                  ...s,
                  status: 'confirmed' as const,
                  confirmedAmount: s.reconciliationAmount,
                  confirmedAt: new Date().toISOString(),
                  confirmedBy: '财务管理员',
                }
              : s
          )
        );
        message.success('对账单已确认，应付账款已生成');
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const supplier = mockSuppliers.find((s) => s.id === values.supplierId);
      
      // 获取该供应商在对账期间内的入库单
      const periodStart = values.period[0].format('YYYY-MM-DD');
      const periodEnd = values.period[1].format('YYYY-MM-DD');
      const supplierReceipts = mockPurchaseReceipts.filter(
        r => r.supplierId === values.supplierId && 
             r.receiptDate >= periodStart && 
             r.receiptDate <= periodEnd &&
             r.status !== 'reconciled'
      );
      
      // 转换为对账单入库单项
      const receipts: ReconciliationReceiptItem[] = supplierReceipts.map((r, index) => ({
        id: `rri-new-${index}`,
        receiptId: r.id,
        receiptNo: r.receiptNo,
        receiptDate: r.receiptDate,
        purchaseOrderNo: r.purchaseOrderNo,
        skuCount: r.skuCount,
        receiptQuantity: r.totalQuantity,
        goodQuantity: r.goodQuantity,
        defectQuantity: r.defectQuantity,
        category: '待分类',
        hasTax: true,
        receiptAmount: r.totalAmount,
        payableAmount: r.payableAmount,
        reconciliationStatus: 'pending' as const,
      }));
      
      const totalAmount = receipts.reduce((sum, r) => sum + r.receiptAmount, 0);
      
      const newStatement: ReconciliationStatement = {
        id: `rec-${Date.now()}`,
        statementNo: `AA${dayjs().format('YYYYMMDDHHmm')}`,
        supplierId: values.supplierId,
        supplierName: supplier?.name || '',
        periodStart,
        periodEnd,
        reconciliationQuantity: receipts.length,
        reconciliationAmount: totalAmount,
        confirmedAmount: 0,
        status: 'draft',
        receipts,
        createdAt: dayjs().format('YYYY-MM-DD'),
        updatedAt: dayjs().format('YYYY-MM-DD'),
      };
      
      setStatements([newStatement, ...statements]);
      message.success(`对账单创建成功，已关联 ${receipts.length} 个入库单`);
      setIsModalOpen(false);
    } catch {
      // Form validation failed
    }
  };

  const columns = [
    {
      title: '',
      key: 'checkbox',
      width: 50,
      render: () => <Checkbox />,
    },
    {
      title: '对账单号',
      dataIndex: 'statementNo',
      key: 'statementNo',
      width: 150,
      render: (text: string, record: ReconciliationStatement) => (
        <a onClick={() => handleView(record)}>{text}</a>
      ),
    },
    {
      title: '供应商',
      dataIndex: 'supplierName',
      key: 'supplierName',
      width: 160,
    },
    {
      title: '对账期间',
      key: 'period',
      width: 200,
      render: (_: unknown, record: ReconciliationStatement) => (
        <span>{record.periodStart} ~ {record.periodEnd}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: string) => {
        const config = statusConfig[status];
        return <Tag color={config?.color}>{config?.text}</Tag>;
      },
    },
    {
      title: '对账数量',
      dataIndex: 'reconciliationQuantity',
      key: 'reconciliationQuantity',
      width: 90,
      align: 'center' as const,
    },
    {
      title: '对账金额',
      dataIndex: 'reconciliationAmount',
      key: 'reconciliationAmount',
      width: 120,
      align: 'right' as const,
      render: (val: number) => `¥${val.toLocaleString()}`,
    },
    {
      title: '确认人',
      dataIndex: 'confirmedBy',
      key: 'confirmedBy',
      width: 100,
      render: (text: string) => text || '-',
    },
    {
      title: '确认时间',
      dataIndex: 'confirmedAt',
      key: 'confirmedAt',
      width: 110,
      render: (text: string) => text ? dayjs(text).format('YYYY-MM-DD') : '-',
    },
    {
      title: '结款状态',
      key: 'paymentStatus',
      width: 90,
      render: (_: unknown, record: ReconciliationStatement) => (
        record.status === 'confirmed' 
          ? <Tag color="success">已结款</Tag>
          : <Tag color="default">未结款</Tag>
      ),
    },
    {
      title: '结款金额',
      key: 'paymentAmount',
      width: 120,
      align: 'right' as const,
      render: (_: unknown, record: ReconciliationStatement) => (
        record.status === 'confirmed' 
          ? `¥${record.confirmedAmount.toLocaleString()}`
          : '-'
      ),
    },
    {
      title: '创建人',
      key: 'creator',
      width: 100,
      render: () => '张会计',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: unknown, record: ReconciliationStatement) => (
        <Space size="small">
          <a onClick={() => handleView(record)}>详情</a>
          {record.status !== 'confirmed' && (
            <a>操作</a>
          )}
        </Space>
      ),
    },
  ];

  // 入库单明细列
  const receiptColumns = [
    {
      title: '入库单号',
      dataIndex: 'receiptNo',
      key: 'receiptNo',
      width: 120,
      render: (text: string) => <a>{text}</a>,
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
      width: 90,
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
  ];

  const tabItems = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待确认' },
    { key: 'confirmed', label: '已确认' },
    { key: 'archived', label: '已作废' },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>对账单管理</Title>

      <Card>
        {/* 标签页 */}
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={tabItems}
          style={{ marginBottom: 16 }}
        />

        {/* 筛选栏 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col>
            <Select
              placeholder="供应商"
              style={{ width: 160 }}
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
              placeholder="状态"
              style={{ width: 100 }}
              allowClear
              value={filterStatus}
              onChange={setFilterStatus}
            >
              {Object.entries(statusConfig).map(([key, val]) => (
                <Option key={key} value={key}>{val.text}</Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Select placeholder="结款状态" style={{ width: 100 }} allowClear>
              <Option value="paid">已结款</Option>
              <Option value="unpaid">未结款</Option>
            </Select>
          </Col>
          <Col>
            <RangePicker placeholder={['开始日期', '结束日期']} />
          </Col>
          <Col>
            <Select placeholder="对账单号" style={{ width: 120 }} allowClear showSearch />
          </Col>
          <Col flex="auto" />
        </Row>

        {/* 操作按钮 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col>
            <Button type="primary" onClick={handleCreate}>
              确认
            </Button>
          </Col>
          <Col>
            <Button>作废</Button>
          </Col>
          <Col>
            <Button icon={<PrinterOutlined />}>打印采购</Button>
          </Col>
          <Col>
            <Button>推送金蝶</Button>
          </Col>
          <Col flex="auto" />
          <Col>
            <Button icon={<FileExcelOutlined />}>导出</Button>
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              新建对账单
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredStatements}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1800 }}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ padding: '16px 0' }}>
                <Table
                  columns={receiptColumns}
                  dataSource={record.receipts}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  scroll={{ x: 1400 }}
                  summary={(pageData) => {
                    const totalQty = pageData.reduce((sum, r) => sum + r.receiptQuantity, 0);
                    const totalAmount = pageData.reduce((sum, r) => sum + r.receiptAmount, 0);
                    const totalPayable = pageData.reduce((sum, r) => sum + r.payableAmount, 0);
                    return (
                      <Table.Summary fixed>
                        <Table.Summary.Row>
                          <Table.Summary.Cell index={0} colSpan={4}>
                            <strong>合计</strong>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={1} align="right">
                            <strong>{totalQty}</strong>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={2} colSpan={4} />
                          <Table.Summary.Cell index={3} align="right">
                            <strong>¥{totalAmount.toLocaleString()}</strong>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={4} align="right">
                            <strong style={{ color: '#1677ff' }}>¥{totalPayable.toLocaleString()}</strong>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={5} />
                        </Table.Summary.Row>
                      </Table.Summary>
                    );
                  }}
                />
              </div>
            ),
          }}
        />
      </Card>

      {/* 新建对账单弹窗 */}
      <Modal
        title="新建对账单"
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        width={600}
        okText="创建"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="supplierId"
            label="供应商"
            rules={[{ required: true, message: '请选择供应商' }]}
          >
            <Select placeholder="请选择供应商">
              {mockSuppliers.filter(s => s.status === 'active').map((s) => (
                <Option key={s.id} value={s.id}>{s.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="period"
            label="对账期间"
            rules={[{ required: true, message: '请选择对账期间' }]}
            extra="系统将自动关联该期间内该供应商的所有待对账入库单"
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 对账单详情弹窗 */}
      <Modal
        title="对账单详情"
        open={isDetailOpen}
        onCancel={() => setIsDetailOpen(false)}
        width={1300}
        footer={[
          <Button key="close" onClick={() => setIsDetailOpen(false)}>
            关闭
          </Button>,
          selectedStatement?.status !== 'confirmed' && (
            <Button
              key="confirm"
              type="primary"
              onClick={() => {
                if (selectedStatement) {
                  handleConfirm(selectedStatement);
                  setIsDetailOpen(false);
                }
              }}
            >
              确认对账
            </Button>
          ),
        ]}
      >
        {selectedStatement && (
          <>
            <Descriptions bordered size="small" column={3}>
              <Descriptions.Item label="对账单号">{selectedStatement.statementNo}</Descriptions.Item>
              <Descriptions.Item label="供应商">{selectedStatement.supplierName}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusConfig[selectedStatement.status]?.color}>
                  {statusConfig[selectedStatement.status]?.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="对账期间">
                {selectedStatement.periodStart} ~ {selectedStatement.periodEnd}
              </Descriptions.Item>
              <Descriptions.Item label="入库单数量">
                {selectedStatement.reconciliationQuantity} 单
              </Descriptions.Item>
              <Descriptions.Item label="对账金额">
                <Text strong style={{ color: '#1677ff', fontSize: 16 }}>
                  ¥{selectedStatement.reconciliationAmount.toLocaleString()}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">{selectedStatement.createdAt}</Descriptions.Item>
              <Descriptions.Item label="确认时间">
                {selectedStatement.confirmedAt ? dayjs(selectedStatement.confirmedAt).format('YYYY-MM-DD HH:mm') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="确认人">{selectedStatement.confirmedBy || '-'}</Descriptions.Item>
            </Descriptions>

            {/* @ts-ignore */}
            <Divider orientation="left">关联入库单明细</Divider>

            <Table
              columns={receiptColumns}
              dataSource={selectedStatement.receipts}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ x: 1400 }}
              summary={(pageData) => {
                const totalQty = pageData.reduce((sum, r) => sum + r.receiptQuantity, 0);
                const totalAmount = pageData.reduce((sum, r) => sum + r.receiptAmount, 0);
                const totalPayable = pageData.reduce((sum, r) => sum + r.payableAmount, 0);
                return (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={4}>
                        <strong>合计</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <strong>{totalQty}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} colSpan={4} />
                      <Table.Summary.Cell index={3} align="right">
                        <strong>¥{totalAmount.toLocaleString()}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4} align="right">
                        <strong style={{ color: '#1677ff' }}>¥{totalPayable.toLocaleString()}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={5} />
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
