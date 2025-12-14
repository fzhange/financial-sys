'use client';

import React, { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  message,
  Card,
  Row,
  Col,
  Typography,
  Statistic,
  Descriptions,
  Divider,
  Timeline,
  Tooltip,
  Progress,
} from 'antd';
import {
  DollarOutlined,
  EyeOutlined,
  PayCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  SearchOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import {
  mockAccountPayables,
  mockPaymentRecords,
  mockSuppliers,
  getPayableStats
} from '../lib/mockData';
import type { AccountPayable as AccountPayableType, PaymentRecord } from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const statusConfig: Record<string, { color: string; text: string }> = {
  pending: { color: 'processing', text: '待付款' },
  partial: { color: 'warning', text: '部分付款' },
  paid: { color: 'success', text: '已付款' },
  overdue: { color: 'error', text: '已逾期' },
  cancelled: { color: 'default', text: '已取消' },
};

const sourceTypeConfig: Record<string, string> = {
  reconciliation: '对账确认',
  purchase: '采购订单',
  other: '其他',
};

const paymentMethodConfig: Record<string, string> = {
  bank_transfer: '银行转账',
  cash: '现金',
  check: '支票',
  other: '其他',
};

export default function AccountPayableComponent() {
  const [payables, setPayables] = useState<AccountPayableType[]>(mockAccountPayables);
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>(mockPaymentRecords);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedPayable, setSelectedPayable] = useState<AccountPayableType | null>(null);
  const [filterSupplier, setFilterSupplier] = useState<string | undefined>();
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [form] = Form.useForm();

  const stats = getPayableStats();

  const filteredPayables = payables.filter((p) => {
    if (filterSupplier && p.supplierId !== filterSupplier) return false;
    if (filterStatus && p.status !== filterStatus) return false;
    return true;
  });

  const handleView = (record: AccountPayableType) => {
    setSelectedPayable(record);
    setIsDetailOpen(true);
  };

  const handlePayment = (record: AccountPayableType) => {
    setSelectedPayable(record);
    form.resetFields();
    form.setFieldsValue({
      amount: record.unpaidAmount,
      paymentDate: dayjs(),
      paymentMethod: 'bank_transfer',
    });
    setIsPaymentOpen(true);
  };

  const handlePaymentSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!selectedPayable) return;

      const paymentAmount = values.amount;
      if (paymentAmount > selectedPayable.unpaidAmount) {
        message.error('付款金额不能超过未付金额');
        return;
      }

      // 创建付款记录
      const newPayment: PaymentRecord = {
        id: `pay-${Date.now()}`,
        paymentNo: `PAY${dayjs().format('YYYYMMDD')}${String(paymentRecords.length + 1).padStart(3, '0')}`,
        payableId: selectedPayable.id,
        payableNo: selectedPayable.payableNo,
        supplierId: selectedPayable.supplierId,
        supplierName: selectedPayable.supplierName,
        amount: paymentAmount,
        paymentMethod: values.paymentMethod,
        paymentDate: values.paymentDate.format('YYYY-MM-DD'),
        bankAccount: values.bankAccount,
        remark: values.remark,
        createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        operator: '财务管理员',
      };
      setPaymentRecords([newPayment, ...paymentRecords]);

      // 更新应付账款状态
      const newPaidAmount = selectedPayable.paidAmount + paymentAmount;
      const newUnpaidAmount = selectedPayable.amount - newPaidAmount;
      let newStatus: AccountPayableType['status'] = 'partial';
      if (newUnpaidAmount <= 0) {
        newStatus = 'paid';
      }

      setPayables(
        payables.map((p) =>
          p.id === selectedPayable.id
            ? {
              ...p,
              paidAmount: newPaidAmount,
              unpaidAmount: newUnpaidAmount,
              status: newStatus,
              updatedAt: dayjs().format('YYYY-MM-DD'),
              paidAt: newStatus === 'paid' ? dayjs().format('YYYY-MM-DD') : undefined,
            }
            : p
        )
      );

      message.success('付款成功');
      setIsPaymentOpen(false);
    } catch {
      // Form validation failed
    }
  };

  // 获取某个应付账款的付款记录
  const getPaymentHistory = (payableId: string) => {
    return paymentRecords.filter((p) => p.payableId === payableId);
  };

  const columns = [
    {
      title: '应付单号',
      dataIndex: 'payableNo',
      key: 'payableNo',
      width: 140,
      render: (text: string, record: AccountPayableType) => (
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
      title: '来源类型',
      dataIndex: 'sourceType',
      key: 'sourceType',
      width: 100,
      render: (type: string) => sourceTypeConfig[type] || type,
    },
    {
      title: '来源单号',
      dataIndex: 'sourceNo',
      key: 'sourceNo',
      width: 140,
    },
    {
      title: '应付金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right' as const,
      render: (val: number) => (
        <Text strong>¥{val.toLocaleString()}</Text>
      ),
    },
    {
      title: '已付金额',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      width: 120,
      align: 'right' as const,
      render: (val: number) => (
        <Text style={{ color: '#52c41a' }}>¥{val.toLocaleString()}</Text>
      ),
    },
    {
      title: '未付金额',
      dataIndex: 'unpaidAmount',
      key: 'unpaidAmount',
      width: 120,
      align: 'right' as const,
      render: (val: number) => (
        <Text style={{ color: val > 0 ? '#ff4d4f' : '#52c41a' }} strong>
          ¥{val.toLocaleString()}
        </Text>
      ),
    },
    {
      title: '到期日',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 110,
      render: (date: string, record: AccountPayableType) => {
        const isOverdue = record.status === 'overdue';
        return (
          <span style={{ color: isOverdue ? '#ff4d4f' : undefined }}>
            {date}
            {isOverdue && <WarningOutlined style={{ marginLeft: 4 }} />}
          </span>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const config = statusConfig[status];
        return <Tag color={config?.color}>{config?.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: unknown, record: AccountPayableType) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          {record.status !== 'paid' && record.status !== 'cancelled' && (
            <Tooltip title="付款">
              <Button
                type="link"
                size="small"
                icon={<PayCircleOutlined />}
                onClick={() => handlePayment(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>应付账款</Title>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={4}>
          <Card size="small">
            <Statistic
              title="应付总额"
              value={stats.totalAmount}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#1677ff', fontSize: 20 }}
              formatter={(val) => `¥${Number(val).toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card size="small">
            <Statistic
              title="已付金额"
              value={stats.paidAmount}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: 20 }}
              formatter={(val) => `¥${Number(val).toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card size="small">
            <Statistic
              title="未付金额"
              value={stats.unpaidAmount}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14', fontSize: 20 }}
              formatter={(val) => `¥${Number(val).toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card size="small">
            <Statistic
              title="逾期笔数"
              value={stats.overdueCount}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f', fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card size="small">
            <Statistic
              title="逾期金额"
              value={stats.overdueAmount}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f', fontSize: 20 }}
              formatter={(val) => `¥${Number(val).toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card size="small">
            <div style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>付款进度</div>
            <Progress
              percent={Math.round((stats.paidAmount / stats.totalAmount) * 100)}
              size="small"
              status={stats.overdueCount > 0 ? 'exception' : 'active'}
            />
          </Card>
        </Col>
      </Row>

      {/* 列表 */}
      <Card>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col>
            <Select
              placeholder="选择供应商"
              style={{ width: 200 }}
              allowClear
              value={filterSupplier}
              onChange={setFilterSupplier}
              suffixIcon={<SearchOutlined />}
            >
              {mockSuppliers.map((s) => (
                <Option key={s.id} value={s.id}>{s.name}</Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Select
              placeholder="选择状态"
              style={{ width: 120 }}
              allowClear
              value={filterStatus}
              onChange={setFilterStatus}
            >
              {Object.entries(statusConfig).map(([key, val]) => (
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
          dataSource={filteredPayables}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1300 }}
        />
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title="应付账款详情"
        open={isDetailOpen}
        onCancel={() => setIsDetailOpen(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setIsDetailOpen(false)}>
            关闭
          </Button>,
          selectedPayable?.status !== 'paid' && selectedPayable?.status !== 'cancelled' && (
            <Button
              key="payment"
              type="primary"
              icon={<PayCircleOutlined />}
              onClick={() => {
                setIsDetailOpen(false);
                if (selectedPayable) handlePayment(selectedPayable);
              }}
            >
              付款
            </Button>
          ),
        ]}
      >
        {selectedPayable && (
          <>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="应付单号">{selectedPayable.payableNo}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusConfig[selectedPayable.status]?.color}>
                  {statusConfig[selectedPayable.status]?.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="供应商">{selectedPayable.supplierName}</Descriptions.Item>
              <Descriptions.Item label="来源类型">
                {sourceTypeConfig[selectedPayable.sourceType]}
              </Descriptions.Item>
              <Descriptions.Item label="来源单号">{selectedPayable.sourceNo}</Descriptions.Item>
              <Descriptions.Item label="到期日">
                <span style={{ color: selectedPayable.status === 'overdue' ? '#ff4d4f' : undefined }}>
                  {selectedPayable.dueDate}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="应付金额">
                <Text strong style={{ fontSize: 16 }}>¥{selectedPayable.amount.toLocaleString()}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="已付金额">
                <Text style={{ color: '#52c41a', fontSize: 16 }}>
                  ¥{selectedPayable.paidAmount.toLocaleString()}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="未付金额" span={2}>
                <Text strong style={{ color: '#ff4d4f', fontSize: 18 }}>
                  ¥{selectedPayable.unpaidAmount.toLocaleString()}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">{selectedPayable.createdAt}</Descriptions.Item>
              <Descriptions.Item label="付清时间">{selectedPayable.paidAt || '-'}</Descriptions.Item>
              <Descriptions.Item label="备注" span={2}>{selectedPayable.remark || '-'}</Descriptions.Item>
            </Descriptions>

            {/* @ts-ignore */}
            <Divider orientation={"left" as const}>付款记录</Divider>

            {getPaymentHistory(selectedPayable.id).length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>
                暂无付款记录
              </div>
            ) : (
              <Timeline
                items={getPaymentHistory(selectedPayable.id).map((record) => ({
                  color: 'green',
                  dot: <CheckCircleOutlined />,
                  children: (
                    <div>
                      <div>
                        <Text strong>¥{record.amount.toLocaleString()}</Text>
                        <Tag color="blue" style={{ marginLeft: 8 }}>
                          {paymentMethodConfig[record.paymentMethod]}
                        </Tag>
                      </div>
                      <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                        单号：{record.paymentNo}
                      </div>
                      <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                        {record.paymentDate} | {record.operator}
                      </div>
                      {record.remark && (
                        <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                          备注：{record.remark}
                        </div>
                      )}
                    </div>
                  ),
                }))}
              />
            )}
          </>
        )}
      </Modal>

      {/* 付款弹窗 */}
      <Modal
        title="付款"
        open={isPaymentOpen}
        onOk={handlePaymentSubmit}
        onCancel={() => setIsPaymentOpen(false)}
        okText="确认付款"
        cancelText="取消"
      >
        {selectedPayable && (
          <>
            <div style={{
              background: '#f5f5f5',
              padding: 16,
              borderRadius: 8,
              marginBottom: 16
            }}>
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ color: '#666', fontSize: 12 }}>供应商</div>
                  <div style={{ fontWeight: 500 }}>{selectedPayable.supplierName}</div>
                </Col>
                <Col span={12}>
                  <div style={{ color: '#666', fontSize: 12 }}>未付金额</div>
                  <div style={{ fontWeight: 600, color: '#ff4d4f', fontSize: 18 }}>
                    ¥{selectedPayable.unpaidAmount.toLocaleString()}
                  </div>
                </Col>
              </Row>
            </div>

            <Form form={form} layout="vertical">
              <Form.Item
                name="amount"
                label="付款金额"
                rules={[
                  { required: true, message: '请输入付款金额' },
                  {
                    validator: (_, value) => {
                      if (value && value > selectedPayable.unpaidAmount) {
                        return Promise.reject('付款金额不能超过未付金额');
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0.01}
                  max={selectedPayable.unpaidAmount}
                  precision={2}
                  formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value?.replace(/¥\s?|(,*)/g, '') as unknown as number}
                />
              </Form.Item>
              <Form.Item
                name="paymentDate"
                label="付款日期"
                rules={[{ required: true, message: '请选择付款日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item
                name="paymentMethod"
                label="付款方式"
                rules={[{ required: true, message: '请选择付款方式' }]}
              >
                <Select>
                  <Option value="bank_transfer">银行转账</Option>
                  <Option value="cash">现金</Option>
                  <Option value="check">支票</Option>
                  <Option value="other">其他</Option>
                </Select>
              </Form.Item>
              <Form.Item name="bankAccount" label="银行账号">
                <Input placeholder="请输入收款银行账号" />
              </Form.Item>
              <Form.Item name="remark" label="备注">
                <Input.TextArea rows={2} placeholder="请输入备注" />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
}
