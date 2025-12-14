'use client';

import React, { useState } from 'react';
import {
  Card,
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
  Tabs,
  Row,
  Col,
  Statistic,
  Descriptions,
  Timeline,
  Tooltip,
  Popconfirm,
  Alert,
  Divider,
  Result,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  CheckOutlined,
  CloseOutlined,
  DollarOutlined,
  FileTextOutlined,
  EyeOutlined,
  ExportOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  BankOutlined,
  TransactionOutlined,
  FileDoneOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { PaymentRequest, PaymentVoucher, WriteOffDetail, AccountPayable } from '../types';
import { mockPaymentRequests, mockSuppliers, mockAccountPayables, mockInvoices, getPaymentRequestStats } from '../lib/mockData';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

const PaymentRequestManagement: React.FC = () => {
  const [requests, setRequests] = useState<PaymentRequest[]>(mockPaymentRequests);
  const [payables, setPayables] = useState<AccountPayable[]>(mockAccountPayables);
  const [paymentVouchers, setPaymentVouchers] = useState<PaymentVoucher[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [isPayModalVisible, setIsPayModalVisible] = useState(false);
  const [isVoucherVisible, setIsVoucherVisible] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<PaymentRequest | null>(null);
  const [currentVoucher, setCurrentVoucher] = useState<PaymentVoucher | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [form] = Form.useForm();
  const [payForm] = Form.useForm();

  const stats = getPaymentRequestStats();

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      draft: { color: 'default', text: '草稿' },
      pending: { color: 'processing', text: '待审批' },
      approved: { color: 'success', text: '已审批' },
      rejected: { color: 'error', text: '已驳回' },
      paid: { color: 'cyan', text: '已付款' },
      cancelled: { color: 'default', text: '已取消' },
    };
    const { color, text } = statusMap[status] || { color: 'default', text: status };
    return <Tag color={color}>{text}</Tag>;
  };

  const getTypeTag = (type: string) => {
    const typeMap: Record<string, { color: string; text: string }> = {
      normal: { color: 'blue', text: '普通请款' },
      advance: { color: 'orange', text: '预付款' },
      urgent: { color: 'red', text: '紧急请款' },
    };
    const { color, text } = typeMap[type] || { color: 'default', text: type };
    return <Tag color={color}>{text}</Tag>;
  };

  const getPaymentMethodText = (method: string) => {
    const methodMap: Record<string, string> = {
      bank_transfer: '银行转账',
      cash: '现金',
      check: '支票',
      other: '其他',
    };
    return methodMap[method] || method;
  };

  const filteredRequests = requests.filter(r => {
    const matchTab = activeTab === 'all' || r.status === activeTab;
    const matchSearch = !searchText ||
      r.requestNo.toLowerCase().includes(searchText.toLowerCase()) ||
      r.supplierName.includes(searchText);
    const matchSupplier = !selectedSupplier || r.supplierId === selectedSupplier;
    return matchTab && matchSearch && matchSupplier;
  });

  // 获取请款单关联的待核销应付账款
  const getRelatedPayables = (request: PaymentRequest) => {
    return payables.filter(p =>
      request.payableIds.includes(p.id) &&
      p.status !== 'paid' &&
      p.status !== 'cancelled'
    );
  };

  const columns: ColumnsType<PaymentRequest> = [
    {
      title: '请款单号',
      dataIndex: 'requestNo',
      key: 'requestNo',
      width: 140,
      render: (text, record) => (
        <a onClick={() => handleViewDetail(record)}>{text}</a>
      ),
    },
    {
      title: '供应商',
      dataIndex: 'supplierName',
      key: 'supplierName',
      width: 160,
      ellipsis: true,
    },
    {
      title: '请款类型',
      dataIndex: 'requestType',
      key: 'requestType',
      width: 100,
      render: (type) => getTypeTag(type),
    },
    {
      title: '请款金额',
      dataIndex: 'requestAmount',
      key: 'requestAmount',
      width: 120,
      align: 'right',
      render: (amount) => `¥${amount.toLocaleString()}`,
    },
    {
      title: '批准金额',
      dataIndex: 'approvedAmount',
      key: 'approvedAmount',
      width: 120,
      align: 'right',
      render: (amount, record) => (
        <span style={{ color: record.status === 'rejected' ? '#ff4d4f' : undefined }}>
          {record.status === 'rejected' ? '-' : `¥${amount.toLocaleString()}`}
        </span>
      ),
    },
    {
      title: '关联应付',
      dataIndex: 'payableNos',
      key: 'payableNos',
      width: 120,
      render: (nos: string[]) => (
        nos.length > 0 ? (
          <Tooltip title={nos.join(', ')}>
            <span>{nos.length}笔</span>
          </Tooltip>
        ) : '-'
      ),
    },
    {
      title: '关联发票',
      dataIndex: 'invoiceNos',
      key: 'invoiceNos',
      width: 120,
      render: (nos: string[]) => (
        nos.length > 0 ? (
          <Tooltip title={nos.join(', ')}>
            <span>{nos.length}张</span>
          </Tooltip>
        ) : '-'
      ),
    },
    {
      title: '期望付款日',
      dataIndex: 'expectedPayDate',
      key: 'expectedPayDate',
      width: 110,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status) => getStatusTag(status),
    },
    {
      title: '申请人',
      dataIndex: 'applicant',
      key: 'applicant',
      width: 80,
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
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            查看
          </Button>
          {record.status === 'pending' && (
            <>
              <Popconfirm
                title="确认审批通过？"
                onConfirm={() => handleApprove(record.id)}
              >
                <Button type="link" size="small" style={{ color: '#52c41a' }}>
                  通过
                </Button>
              </Popconfirm>
              <Popconfirm
                title="确认驳回请款？"
                onConfirm={() => handleReject(record.id)}
              >
                <Button type="link" size="small" danger>
                  驳回
                </Button>
              </Popconfirm>
            </>
          )}
          {record.status === 'approved' && (
            <Button type="link" size="small" onClick={() => handleOpenPayModal(record)}>
              付款
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleViewDetail = (record: PaymentRequest) => {
    setCurrentRequest(record);
    setIsDetailVisible(true);
  };

  const handleApprove = (id: string) => {
    setRequests(prev => prev.map(r =>
      r.id === id
        ? { ...r, status: 'approved' as const, approvedAmount: r.requestAmount, approver: '财务主管', approvedAt: dayjs().format('YYYY-MM-DD'), updatedAt: dayjs().format('YYYY-MM-DD') }
        : r
    ));
    message.success('审批通过');
  };

  const handleReject = (id: string) => {
    setRequests(prev => prev.map(r =>
      r.id === id
        ? { ...r, status: 'rejected' as const, approver: '财务主管', approvedAt: dayjs().format('YYYY-MM-DD'), updatedAt: dayjs().format('YYYY-MM-DD') }
        : r
    ));
    message.warning('已驳回请款');
  };

  // 打开付款弹窗
  const handleOpenPayModal = (record: PaymentRequest) => {
    setCurrentRequest(record);

    // 获取关联的应付账款并计算核销金额
    const relatedPayables = getRelatedPayables(record);
    let remainingAmount = record.approvedAmount;

    const writeOffItems = relatedPayables.map(p => {
      const writeOffAmount = Math.min(p.unpaidAmount, remainingAmount);
      remainingAmount -= writeOffAmount;
      return {
        payableId: p.id,
        payableNo: p.payableNo,
        unpaidAmount: p.unpaidAmount,
        writeOffAmount,
      };
    });

    payForm.setFieldsValue({
      paymentDate: dayjs(),
      paymentMethod: record.paymentMethod,
      writeOffItems,
      remark: '',
    });

    setIsPayModalVisible(true);
  };

  // 执行付款
  const handlePay = () => {
    if (!currentRequest) return;

    payForm.validateFields().then(values => {
      const paymentDate = values.paymentDate.format('YYYY-MM-DD');
      const voucherNo = `FK${dayjs().format('YYYYMMDD')}${String(paymentVouchers.length + 1).padStart(3, '0')}`;

      // 构建核销明细
      const writeOffDetails: WriteOffDetail[] = [];
      const updatedPayables = [...payables];

      values.writeOffItems?.forEach((item: { payableId: string; writeOffAmount: number }) => {
        if (item.writeOffAmount > 0) {
          const payableIndex = updatedPayables.findIndex(p => p.id === item.payableId);
          if (payableIndex >= 0) {
            const payable = updatedPayables[payableIndex];
            const newPaidAmount = payable.paidAmount + item.writeOffAmount;
            const newUnpaidAmount = payable.amount - newPaidAmount;

            writeOffDetails.push({
              id: `wo-${Date.now()}-${item.payableId}`,
              payableId: item.payableId,
              payableNo: payable.payableNo,
              payableAmount: payable.amount,
              writeOffAmount: item.writeOffAmount,
              remainingAmount: newUnpaidAmount,
            });

            // 更新应付账款
            updatedPayables[payableIndex] = {
              ...payable,
              paidAmount: newPaidAmount,
              unpaidAmount: newUnpaidAmount,
              status: newUnpaidAmount <= 0 ? 'paid' : 'partial',
              paidAt: newUnpaidAmount <= 0 ? paymentDate : undefined,
              updatedAt: dayjs().format('YYYY-MM-DD'),
            };
          }
        }
      });

      // 创建付款单
      const newVoucher: PaymentVoucher = {
        id: `pv-${Date.now()}`,
        voucherNo,
        requestId: currentRequest.id,
        requestNo: currentRequest.requestNo,
        supplierId: currentRequest.supplierId,
        supplierName: currentRequest.supplierName,
        paymentAmount: currentRequest.approvedAmount,
        paymentMethod: values.paymentMethod,
        bankAccount: currentRequest.bankAccount,
        bankName: currentRequest.bankName,
        paymentDate,
        payableIds: writeOffDetails.map(d => d.payableId),
        payableNos: writeOffDetails.map(d => d.payableNo),
        writeOffDetails,
        status: 'completed',
        operator: '财务主管',
        remark: values.remark,
        createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      };

      // 更新请款单状态
      setRequests(prev => prev.map(r =>
        r.id === currentRequest.id
          ? {
            ...r,
            status: 'paid' as const,
            actualPayDate: paymentDate,
            paidAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            updatedAt: dayjs().format('YYYY-MM-DD')
          }
          : r
      ));

      // 更新应付账款
      setPayables(updatedPayables);

      // 保存付款单
      setPaymentVouchers(prev => [newVoucher, ...prev]);
      setCurrentVoucher(newVoucher);

      setIsPayModalVisible(false);
      setIsVoucherVisible(true);

      message.success('付款成功，已生成付款单并核销应付账款');
    });
  };

  const handleCreateRequest = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      const newRequest: PaymentRequest = {
        id: `pr-req-${Date.now()}`,
        requestNo: `QK${dayjs().format('YYYYMMDD')}${String(requests.length + 1).padStart(3, '0')}`,
        supplierId: values.supplierId,
        supplierName: mockSuppliers.find(s => s.id === values.supplierId)?.name || '',
        requestType: values.requestType,
        payableIds: values.payableIds || [],
        payableNos: values.payableIds?.map((id: string) => payables.find(p => p.id === id)?.payableNo || '') || [],
        invoiceIds: values.invoiceIds || [],
        invoiceNos: values.invoiceIds?.map((id: string) => mockInvoices.find(i => i.id === id)?.invoiceNo || '') || [],
        requestAmount: values.requestAmount,
        approvedAmount: 0,
        paymentMethod: values.paymentMethod,
        bankAccount: mockSuppliers.find(s => s.id === values.supplierId)?.bankAccount || '',
        bankName: mockSuppliers.find(s => s.id === values.supplierId)?.bankName || '',
        expectedPayDate: values.expectedPayDate.format('YYYY-MM-DD'),
        status: 'pending',
        applicant: '当前用户',
        remark: values.remark,
        createdAt: dayjs().format('YYYY-MM-DD'),
        updatedAt: dayjs().format('YYYY-MM-DD'),
      };
      setRequests(prev => [newRequest, ...prev]);
      setIsModalVisible(false);
      message.success('请款单创建成功');
    });
  };

  const tabItems = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待审批' },
    { key: 'approved', label: '已审批' },
    { key: 'paid', label: '已付款' },
    { key: 'rejected', label: '已驳回' },
  ];

  // 计算核销总额
  const calculateTotalWriteOff = () => {
    const items = payForm.getFieldValue('writeOffItems') || [];
    return items.reduce((sum: number, item: { writeOffAmount?: number }) => sum + (item.writeOffAmount || 0), 0);
  };

  return (
    <div className="space-y-4">
      {/* 统计卡片 */}
      <Row gutter={16}>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="请款单总数"
              value={stats.totalRequests}
              suffix="笔"
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="待审批"
              value={stats.pendingCount}
              suffix="笔"
              valueStyle={{ color: '#1890ff' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="已审批"
              value={stats.approvedCount}
              suffix="笔"
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="请款总额"
              value={stats.totalRequestAmount}
              precision={2}
              prefix="¥"
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="批准总额"
              value={stats.totalApprovedAmount}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="已付款总额"
              value={stats.totalPaidAmount}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 请款单列表 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

        <div className="flex justify-between items-center mb-4">
          <Space>
            <Input
              placeholder="搜索请款单号/供应商"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Select
              placeholder="选择供应商"
              value={selectedSupplier}
              onChange={setSelectedSupplier}
              style={{ width: 180 }}
              allowClear
            >
              {mockSuppliers.filter(s => s.status === 'active').map(s => (
                <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>
              ))}
            </Select>
            <RangePicker placeholder={['开始日期', '结束日期']} />
          </Space>
          <Space>
            <Button icon={<ExportOutlined />}>导出</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateRequest}>
              新建请款单
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredRequests}
          rowKey="id"
          size="small"
          scroll={{ x: 1500 }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      {/* 新建请款单弹窗 */}
      <Modal
        title="新建请款单"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={700}
        okText="提交"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="supplierId"
                label="供应商"
                rules={[{ required: true, message: '请选择供应商' }]}
              >
                <Select placeholder="请选择供应商">
                  {mockSuppliers.filter(s => s.status === 'active').map(s => (
                    <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="requestType"
                label="请款类型"
                rules={[{ required: true, message: '请选择请款类型' }]}
              >
                <Select placeholder="请选择请款类型">
                  <Select.Option value="normal">普通请款</Select.Option>
                  <Select.Option value="advance">预付款</Select.Option>
                  <Select.Option value="urgent">紧急请款</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="requestAmount"
                label="请款金额"
                rules={[{ required: true, message: '请输入请款金额' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                  prefix="¥"
                  placeholder="请输入请款金额"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expectedPayDate"
                label="期望付款日期"
                rules={[{ required: true, message: '请选择期望付款日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="payableIds" label="关联应付账款">
                <Select mode="multiple" placeholder="选择关联的应付账款" allowClear>
                  {payables.filter(p => p.status !== 'paid' && p.status !== 'cancelled').map(p => (
                    <Select.Option key={p.id} value={p.id}>
                      {p.payableNo} - {p.supplierName} (¥{p.unpaidAmount.toLocaleString()})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="invoiceIds" label="关联发票">
                <Select mode="multiple" placeholder="选择关联的发票" allowClear>
                  {mockInvoices.filter(i => i.status !== 'cancelled').map(i => (
                    <Select.Option key={i.id} value={i.id}>
                      {i.invoiceNo} - {i.supplierName} (¥{i.totalAmount.toLocaleString()})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="paymentMethod"
            label="付款方式"
            rules={[{ required: true, message: '请选择付款方式' }]}
          >
            <Select placeholder="请选择付款方式">
              <Select.Option value="bank_transfer">银行转账</Select.Option>
              <Select.Option value="cash">现金</Select.Option>
              <Select.Option value="check">支票</Select.Option>
              <Select.Option value="other">其他</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 付款弹窗 */}
      <Modal
        title={
          <Space>
            <BankOutlined />
            <span>确认付款</span>
          </Space>
        }
        open={isPayModalVisible}
        onOk={handlePay}
        onCancel={() => setIsPayModalVisible(false)}
        width={700}
        okText="确认付款"
        cancelText="取消"
      >
        {currentRequest && (
          <div className="space-y-4">
            <Alert
              message="付款确认"
              description="确认付款后将生成付款单，并自动核销关联的应付账款，冲减供应商应付余额。"
              type="info"
              showIcon
            />

            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="请款单号">{currentRequest.requestNo}</Descriptions.Item>
              <Descriptions.Item label="供应商">{currentRequest.supplierName}</Descriptions.Item>
              <Descriptions.Item label="批准金额">
                <span style={{ color: '#52c41a', fontWeight: 'bold', fontSize: 16 }}>
                  ¥{currentRequest.approvedAmount.toLocaleString()}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="付款方式">{getPaymentMethodText(currentRequest.paymentMethod)}</Descriptions.Item>
              <Descriptions.Item label="收款银行">{currentRequest.bankName}</Descriptions.Item>
              <Descriptions.Item label="收款账号">{currentRequest.bankAccount}</Descriptions.Item>
            </Descriptions>

            <Form form={payForm} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="paymentDate"
                    label="付款日期"
                    rules={[{ required: true, message: '请选择付款日期' }]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="paymentMethod"
                    label="付款方式"
                    rules={[{ required: true, message: '请选择付款方式' }]}
                  >
                    <Select>
                      <Select.Option value="bank_transfer">银行转账</Select.Option>
                      <Select.Option value="cash">现金</Select.Option>
                      <Select.Option value="check">支票</Select.Option>
                      <Select.Option value="other">其他</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              {currentRequest.payableIds.length > 0 && (
                <>
                  <Divider orientation={"left" as const}>
                    <Space>
                      <TransactionOutlined />
                      <span>应付账款核销</span>
                    </Space>
                  </Divider>

                  <Form.List name="writeOffItems">
                    {(fields) => (
                      <Table
                        dataSource={fields.map((field, index) => {
                          const items = payForm.getFieldValue('writeOffItems') || [];
                          return { ...field, ...items[index] };
                        })}
                        columns={[
                          {
                            title: '应付单号',
                            dataIndex: 'payableNo',
                            width: 140,
                          },
                          {
                            title: '待核销金额',
                            dataIndex: 'unpaidAmount',
                            width: 120,
                            align: 'right',
                            render: (amount) => `¥${(amount || 0).toLocaleString()}`,
                          },
                          {
                            title: '本次核销金额',
                            key: 'writeOffAmount',
                            width: 150,
                            render: (_, record, index) => (
                              <Form.Item
                                name={[index, 'writeOffAmount']}
                                noStyle
                              >
                                <InputNumber
                                  min={0}
                                  max={record.unpaidAmount}
                                  precision={2}
                                  prefix="¥"
                                  style={{ width: '100%' }}
                                />
                              </Form.Item>
                            ),
                          },
                          {
                            title: '核销后余额',
                            key: 'remaining',
                            width: 120,
                            align: 'right',
                            render: (_, record, index) => {
                              const items = payForm.getFieldValue('writeOffItems') || [];
                              const writeOff = items[index]?.writeOffAmount || 0;
                              const remaining = (record.unpaidAmount || 0) - writeOff;
                              return (
                                <span style={{ color: remaining <= 0 ? '#52c41a' : undefined }}>
                                  ¥{remaining.toLocaleString()}
                                </span>
                              );
                            },
                          },
                        ]}
                        rowKey="payableId"
                        size="small"
                        pagination={false}
                        summary={() => (
                          <Table.Summary>
                            <Table.Summary.Row>
                              <Table.Summary.Cell index={0} colSpan={2}>
                                <strong>核销合计</strong>
                              </Table.Summary.Cell>
                              <Table.Summary.Cell index={1} align="right" colSpan={2}>
                                <strong style={{ color: '#1890ff' }}>
                                  ¥{calculateTotalWriteOff().toLocaleString()}
                                </strong>
                              </Table.Summary.Cell>
                            </Table.Summary.Row>
                          </Table.Summary>
                        )}
                      />
                    )}
                  </Form.List>
                </>
              )}

              <Form.Item name="remark" label="付款备注" style={{ marginTop: 16 }}>
                <TextArea rows={2} placeholder="请输入付款备注" />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* 付款单详情弹窗 */}
      <Modal
        title={null}
        open={isVoucherVisible}
        onCancel={() => setIsVoucherVisible(false)}
        footer={[
          <Button key="print" icon={<FileTextOutlined />}>打印付款单</Button>,
          <Button key="close" type="primary" onClick={() => setIsVoucherVisible(false)}>完成</Button>,
        ]}
        width={700}
      >
        {currentVoucher && (
          <Result
            status="success"
            title="付款成功"
            subTitle={`付款单号：${currentVoucher.voucherNo}`}
            extra={
              <div className="text-left">
                <Descriptions bordered size="small" column={2}>
                  <Descriptions.Item label="付款单号">{currentVoucher.voucherNo}</Descriptions.Item>
                  <Descriptions.Item label="请款单号">{currentVoucher.requestNo}</Descriptions.Item>
                  <Descriptions.Item label="供应商">{currentVoucher.supplierName}</Descriptions.Item>
                  <Descriptions.Item label="付款金额">
                    <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
                      ¥{currentVoucher.paymentAmount.toLocaleString()}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="付款方式">{getPaymentMethodText(currentVoucher.paymentMethod)}</Descriptions.Item>
                  <Descriptions.Item label="付款日期">{currentVoucher.paymentDate}</Descriptions.Item>
                  <Descriptions.Item label="收款银行">{currentVoucher.bankName}</Descriptions.Item>
                  <Descriptions.Item label="收款账号">{currentVoucher.bankAccount}</Descriptions.Item>
                  <Descriptions.Item label="操作人">{currentVoucher.operator}</Descriptions.Item>
                  <Descriptions.Item label="操作时间">{currentVoucher.createdAt}</Descriptions.Item>
                </Descriptions>

                {currentVoucher.writeOffDetails.length > 0 && (
                  <>
                    <Divider orientation={"left" as const}>
                      <Space>
                        <FileDoneOutlined />
                        <span>核销明细</span>
                      </Space>
                    </Divider>
                    <Table
                      dataSource={currentVoucher.writeOffDetails}
                      columns={[
                        { title: '应付单号', dataIndex: 'payableNo', width: 140 },
                        {
                          title: '应付金额',
                          dataIndex: 'payableAmount',
                          width: 120,
                          align: 'right',
                          render: (v) => `¥${v.toLocaleString()}`,
                        },
                        {
                          title: '核销金额',
                          dataIndex: 'writeOffAmount',
                          width: 120,
                          align: 'right',
                          render: (v) => <span style={{ color: '#52c41a' }}>¥{v.toLocaleString()}</span>,
                        },
                        {
                          title: '剩余金额',
                          dataIndex: 'remainingAmount',
                          width: 120,
                          align: 'right',
                          render: (v) => (
                            <span style={{ color: v <= 0 ? '#52c41a' : '#faad14' }}>
                              ¥{v.toLocaleString()}
                            </span>
                          ),
                        },
                        {
                          title: '状态',
                          key: 'status',
                          width: 80,
                          render: (_, record) => (
                            record.remainingAmount <= 0
                              ? <Tag color="success">已结清</Tag>
                              : <Tag color="warning">部分核销</Tag>
                          ),
                        },
                      ]}
                      rowKey="id"
                      size="small"
                      pagination={false}
                    />
                  </>
                )}
              </div>
            }
          />
        )}
      </Modal>

      {/* 请款单详情弹窗 */}
      <Modal
        title="请款单详情"
        open={isDetailVisible}
        onCancel={() => setIsDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailVisible(false)}>关闭</Button>,
          currentRequest?.status === 'pending' && (
            <Button key="approve" type="primary" onClick={() => {
              handleApprove(currentRequest.id);
              setIsDetailVisible(false);
            }}>
              审批通过
            </Button>
          ),
          currentRequest?.status === 'approved' && (
            <Button key="pay" type="primary" onClick={() => {
              setIsDetailVisible(false);
              handleOpenPayModal(currentRequest);
            }}>
              去付款
            </Button>
          ),
        ]}
        width={800}
      >
        {currentRequest && (
          <div className="space-y-4">
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="请款单号">{currentRequest.requestNo}</Descriptions.Item>
              <Descriptions.Item label="状态">{getStatusTag(currentRequest.status)}</Descriptions.Item>
              <Descriptions.Item label="供应商">{currentRequest.supplierName}</Descriptions.Item>
              <Descriptions.Item label="请款类型">{getTypeTag(currentRequest.requestType)}</Descriptions.Item>
              <Descriptions.Item label="请款金额">
                <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
                  ¥{currentRequest.requestAmount.toLocaleString()}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="批准金额">
                <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
                  ¥{currentRequest.approvedAmount.toLocaleString()}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="付款方式">{getPaymentMethodText(currentRequest.paymentMethod)}</Descriptions.Item>
              <Descriptions.Item label="期望付款日">{currentRequest.expectedPayDate}</Descriptions.Item>
              <Descriptions.Item label="收款银行">{currentRequest.bankName}</Descriptions.Item>
              <Descriptions.Item label="收款账号">{currentRequest.bankAccount}</Descriptions.Item>
              <Descriptions.Item label="申请人">{currentRequest.applicant}</Descriptions.Item>
              <Descriptions.Item label="审批人">{currentRequest.approver || '-'}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{currentRequest.createdAt}</Descriptions.Item>
              <Descriptions.Item label="审批时间">{currentRequest.approvedAt || '-'}</Descriptions.Item>
              {currentRequest.actualPayDate && (
                <Descriptions.Item label="实际付款日">{currentRequest.actualPayDate}</Descriptions.Item>
              )}
              <Descriptions.Item label="备注" span={2}>{currentRequest.remark || '-'}</Descriptions.Item>
            </Descriptions>

            <Card title="关联单据" size="small">
              <Row gutter={16}>
                <Col span={12}>
                  <div className="font-medium mb-2">关联应付账款</div>
                  {currentRequest.payableNos.length > 0 ? (
                    <Space direction="vertical" size="small">
                      {currentRequest.payableNos.map((no, index) => (
                        <Tag key={index} icon={<DollarOutlined />} color="blue">{no}</Tag>
                      ))}
                    </Space>
                  ) : (
                    <span className="text-gray-400">无关联应付</span>
                  )}
                </Col>
                <Col span={12}>
                  <div className="font-medium mb-2">关联发票</div>
                  {currentRequest.invoiceNos.length > 0 ? (
                    <Space direction="vertical" size="small">
                      {currentRequest.invoiceNos.map((no, index) => (
                        <Tag key={index} icon={<FileTextOutlined />} color="green">{no}</Tag>
                      ))}
                    </Space>
                  ) : (
                    <span className="text-gray-400">无关联发票</span>
                  )}
                </Col>
              </Row>
            </Card>

            <Card title="审批流程" size="small">
              <Timeline
                items={[
                  {
                    color: 'green',
                    dot: <CheckCircleOutlined />,
                    children: (
                      <div>
                        <div className="font-medium">创建请款单</div>
                        <div className="text-gray-500 text-sm">{currentRequest.applicant} - {currentRequest.createdAt}</div>
                      </div>
                    ),
                  },
                  ...(currentRequest.status !== 'draft' ? [{
                    color: currentRequest.status === 'rejected' ? 'red' :
                      currentRequest.status === 'pending' ? 'blue' : 'green',
                    dot: currentRequest.status === 'pending' ? <SyncOutlined spin /> :
                      currentRequest.status === 'rejected' ? <CloseOutlined /> : <CheckCircleOutlined />,
                    children: (
                      <div>
                        <div className="font-medium">
                          {currentRequest.status === 'pending' ? '等待审批' :
                            currentRequest.status === 'rejected' ? '审批驳回' : '审批通过'}
                        </div>
                        <div className="text-gray-500 text-sm">
                          {currentRequest.approver || '待审批'} - {currentRequest.approvedAt || '进行中'}
                        </div>
                      </div>
                    ),
                  }] : []),
                  ...(currentRequest.status === 'paid' ? [{
                    color: 'cyan',
                    dot: <DollarOutlined />,
                    children: (
                      <div>
                        <div className="font-medium">已付款</div>
                        <div className="text-gray-500 text-sm">{currentRequest.paidAt}</div>
                      </div>
                    ),
                  }] : []),
                ]}
              />
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PaymentRequestManagement;
