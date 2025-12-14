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
  Tooltip,
  Popconfirm,
  Badge,
  Result,
  Timeline,
  Divider,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  CheckOutlined,
  CloseOutlined,
  FileTextOutlined,
  EyeOutlined,
  ExportOutlined,
  PrinterOutlined,
  DollarOutlined,
  BankOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  DeleteOutlined,
  EditOutlined,
  LinkOutlined,
  SwapOutlined,
  TransactionOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { PaymentVoucher, WriteOffDetail, AccountPayable } from '../types';
import { mockSuppliers, mockAccountPayables } from '../lib/mockData';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

// 模拟付款单数据
const initialPaymentVouchers: PaymentVoucher[] = [
  {
    id: 'pv-1',
    voucherNo: 'FK202412001',
    requestId: 'pr-req-3',
    requestNo: 'QK202411001',
    supplierId: '1',
    supplierName: '华为技术有限公司',
    paymentAmount: 120000,
    paymentMethod: 'bank_transfer',
    bankAccount: '6222021234567890123',
    bankName: '中国工商银行深圳分行',
    paymentDate: '2024-12-10',
    payableIds: ['ap-2'],
    payableNos: ['AP202411001'],
    writeOffDetails: [
      {
        id: 'wod-1',
        payableId: 'ap-2',
        payableNo: 'AP202411001',
        payableAmount: 120000,
        writeOffAmount: 120000,
        remainingAmount: 0,
      },
    ],
    status: 'completed',
    operator: '财务主管',
    remark: '11月对账款项付款',
    createdAt: '2024-12-10',
    updatedAt: '2024-12-10',
  },
  {
    id: 'pv-2',
    voucherNo: 'FK202411001',
    requestId: '',
    requestNo: '',
    supplierId: '3',
    supplierName: '阿里巴巴集团',
    paymentAmount: 30000,
    paymentMethod: 'bank_transfer',
    bankAccount: '6222035678901234567',
    bankName: '中国农业银行杭州分行',
    paymentDate: '2024-11-20',
    payableIds: ['ap-3'],
    payableNos: ['AP202410001'],
    writeOffDetails: [
      {
        id: 'wod-2',
        payableId: 'ap-3',
        payableNo: 'AP202410001',
        payableAmount: 50000,
        writeOffAmount: 30000,
        remainingAmount: 20000,
      },
    ],
    status: 'completed',
    operator: '张会计',
    remark: '部分付款',
    createdAt: '2024-11-20',
    updatedAt: '2024-11-20',
  },
];

const PaymentVoucherManagement: React.FC = () => {
  const [vouchers, setVouchers] = useState<PaymentVoucher[]>(initialPaymentVouchers);
  const [payables, setPayables] = useState<AccountPayable[]>(mockAccountPayables);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [isWriteOffVisible, setIsWriteOffVisible] = useState(false);
  const [isIndependentWriteOffVisible, setIsIndependentWriteOffVisible] = useState(false);
  const [currentVoucher, setCurrentVoucher] = useState<PaymentVoucher | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [form] = Form.useForm();
  const [writeOffForm] = Form.useForm();
  
  // 核销相关状态
  const [selectedPayables, setSelectedPayables] = useState<AccountPayable[]>([]);
  const [writeOffAmounts, setWriteOffAmounts] = useState<Record<string, number>>({});
  
  // 独立核销相关状态
  const [independentSelectedPayables, setIndependentSelectedPayables] = useState<AccountPayable[]>([]);
  const [independentWriteOffAmounts, setIndependentWriteOffAmounts] = useState<Record<string, number>>({});

  // 统计数据
  const stats = {
    totalVouchers: vouchers.length,
    completedCount: vouchers.filter(v => v.status === 'completed').length,
    pendingCount: vouchers.filter(v => v.status === 'pending').length,
    totalPaymentAmount: vouchers.filter(v => v.status === 'completed').reduce((sum, v) => sum + v.paymentAmount, 0),
    totalWriteOffAmount: vouchers.filter(v => v.status === 'completed')
      .reduce((sum, v) => sum + v.writeOffDetails.reduce((s, d) => s + d.writeOffAmount, 0), 0),
  };

  // 获取待核销的应付账款
  const pendingPayables = payables.filter(p => 
    p.status !== 'paid' && p.status !== 'cancelled' && p.unpaidAmount > 0
  );

  // 状态标签
  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      pending: { color: 'orange', text: '待确认' },
      completed: { color: 'green', text: '已完成' },
      cancelled: { color: 'default', text: '已取消' },
    };
    const config = statusMap[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 付款方式标签
  const getPaymentMethodTag = (method: string) => {
    const methodMap: Record<string, { color: string; text: string }> = {
      bank_transfer: { color: 'blue', text: '银行转账' },
      cash: { color: 'green', text: '现金' },
      check: { color: 'purple', text: '支票' },
      other: { color: 'default', text: '其他' },
    };
    const config = methodMap[method] || { color: 'default', text: method };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 筛选数据
  const getFilteredData = () => {
    let filtered = vouchers;

    if (activeTab !== 'all') {
      filtered = filtered.filter(v => v.status === activeTab);
    }

    if (searchText) {
      filtered = filtered.filter(v =>
        v.voucherNo.toLowerCase().includes(searchText.toLowerCase()) ||
        v.supplierName.toLowerCase().includes(searchText.toLowerCase()) ||
        v.requestNo.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (selectedSupplier) {
      filtered = filtered.filter(v => v.supplierId === selectedSupplier);
    }

    return filtered;
  };

  // 新建付款单
  const handleCreateVoucher = () => {
    form.resetFields();
    setSelectedPayables([]);
    setWriteOffAmounts({});
    setIsModalVisible(true);
  };

  // 查看详情
  const handleViewDetail = (voucher: PaymentVoucher) => {
    setCurrentVoucher(voucher);
    setIsDetailVisible(true);
  };

  // 选择应付账款进行核销
  const handleSelectPayable = (payable: AccountPayable, selected: boolean) => {
    if (selected) {
      setSelectedPayables(prev => [...prev, payable]);
      setWriteOffAmounts(prev => ({
        ...prev,
        [payable.id]: payable.unpaidAmount,
      }));
    } else {
      setSelectedPayables(prev => prev.filter(p => p.id !== payable.id));
      setWriteOffAmounts(prev => {
        const newAmounts = { ...prev };
        delete newAmounts[payable.id];
        return newAmounts;
      });
    }
  };

  // 更新核销金额
  const handleWriteOffAmountChange = (payableId: string, amount: number) => {
    setWriteOffAmounts(prev => ({
      ...prev,
      [payableId]: amount,
    }));
  };

  // 保存付款单
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (selectedPayables.length === 0) {
        message.error('请选择要核销的应付账款');
        return;
      }

      const totalWriteOff = Object.values(writeOffAmounts).reduce((sum, amount) => sum + amount, 0);
      
      if (totalWriteOff <= 0) {
        message.error('核销金额必须大于0');
        return;
      }

      const supplier = mockSuppliers.find(s => s.id === values.supplierId);
      
      // 生成核销明细
      const writeOffDetails: WriteOffDetail[] = selectedPayables.map(payable => ({
        id: `wod-${Date.now()}-${payable.id}`,
        payableId: payable.id,
        payableNo: payable.payableNo,
        payableAmount: payable.amount,
        writeOffAmount: writeOffAmounts[payable.id] || 0,
        remainingAmount: payable.unpaidAmount - (writeOffAmounts[payable.id] || 0),
      }));

      const newVoucher: PaymentVoucher = {
        id: `pv-${Date.now()}`,
        voucherNo: `FK${dayjs().format('YYYYMMDD')}${String(vouchers.length + 1).padStart(3, '0')}`,
        requestId: values.requestId || '',
        requestNo: values.requestNo || '',
        supplierId: values.supplierId,
        supplierName: supplier?.name || '',
        paymentAmount: totalWriteOff,
        paymentMethod: values.paymentMethod,
        bankAccount: supplier?.bankAccount || '',
        bankName: supplier?.bankName || '',
        paymentDate: values.paymentDate.format('YYYY-MM-DD'),
        payableIds: selectedPayables.map(p => p.id),
        payableNos: selectedPayables.map(p => p.payableNo),
        writeOffDetails,
        status: 'completed',
        operator: '当前用户',
        remark: values.remark,
        createdAt: dayjs().format('YYYY-MM-DD'),
        updatedAt: dayjs().format('YYYY-MM-DD'),
      };

      // 更新应付账款状态
      const updatedPayables = payables.map(p => {
        const writeOffAmount = writeOffAmounts[p.id];
        if (writeOffAmount) {
          const newPaidAmount = p.paidAmount + writeOffAmount;
          const newUnpaidAmount = p.amount - newPaidAmount;
          return {
            ...p,
            paidAmount: newPaidAmount,
            unpaidAmount: newUnpaidAmount,
            status: newUnpaidAmount <= 0 ? 'paid' : 'partial',
            paidAt: newUnpaidAmount <= 0 ? dayjs().format('YYYY-MM-DD') : undefined,
            updatedAt: dayjs().format('YYYY-MM-DD'),
          } as AccountPayable;
        }
        return p;
      });

      setVouchers([newVoucher, ...vouchers]);
      setPayables(updatedPayables);
      setIsModalVisible(false);
      message.success('付款单创建成功，应付账款已核销');
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  // 取消付款单
  const handleCancelVoucher = (voucher: PaymentVoucher) => {
    if (voucher.status !== 'pending') {
      message.error('只能取消待确认的付款单');
      return;
    }
    
    const updatedVouchers = vouchers.map(v =>
      v.id === voucher.id ? { ...v, status: 'cancelled' as const, updatedAt: dayjs().format('YYYY-MM-DD') } : v
    );
    setVouchers(updatedVouchers);
    message.success('付款单已取消');
  };

  // 打印付款单
  const handlePrint = (voucher: PaymentVoucher) => {
    message.info('正在准备打印...');
  };

  // 打开独立核销弹窗
  const handleOpenIndependentWriteOff = () => {
    writeOffForm.resetFields();
    setIndependentSelectedPayables([]);
    setIndependentWriteOffAmounts({});
    setIsIndependentWriteOffVisible(true);
  };

  // 独立核销 - 选择应付账款
  const handleIndependentSelectPayable = (payable: AccountPayable, selected: boolean) => {
    if (selected) {
      setIndependentSelectedPayables(prev => [...prev, payable]);
      setIndependentWriteOffAmounts(prev => ({
        ...prev,
        [payable.id]: payable.unpaidAmount,
      }));
    } else {
      setIndependentSelectedPayables(prev => prev.filter(p => p.id !== payable.id));
      setIndependentWriteOffAmounts(prev => {
        const newAmounts = { ...prev };
        delete newAmounts[payable.id];
        return newAmounts;
      });
    }
  };

  // 独立核销 - 更新核销金额
  const handleIndependentWriteOffAmountChange = (payableId: string, amount: number) => {
    setIndependentWriteOffAmounts(prev => ({
      ...prev,
      [payableId]: amount,
    }));
  };

  // 独立核销 - 确认核销
  const handleIndependentWriteOffOk = async () => {
    try {
      const values = await writeOffForm.validateFields();
      
      if (independentSelectedPayables.length === 0) {
        message.error('请选择要核销的应付账款');
        return;
      }

      const totalWriteOff = Object.values(independentWriteOffAmounts).reduce((sum, amount) => sum + amount, 0);
      
      if (totalWriteOff <= 0) {
        message.error('核销金额必须大于0');
        return;
      }

      // 查找选择的付款单
      const selectedVoucher = vouchers.find(v => v.id === values.voucherId);
      if (!selectedVoucher) {
        message.error('请选择付款单');
        return;
      }

      // 检查核销金额是否超过付款单剩余可核销金额
      const alreadyWriteOff = selectedVoucher.writeOffDetails.reduce((sum, d) => sum + d.writeOffAmount, 0);
      const remainingPayment = selectedVoucher.paymentAmount - alreadyWriteOff;
      
      if (totalWriteOff > remainingPayment) {
        message.error(`核销金额超过付款单剩余可核销金额（¥${remainingPayment.toLocaleString()}）`);
        return;
      }

      // 生成新的核销明细
      const newWriteOffDetails: WriteOffDetail[] = independentSelectedPayables.map(payable => ({
        id: `wod-${Date.now()}-${payable.id}`,
        payableId: payable.id,
        payableNo: payable.payableNo,
        payableAmount: payable.amount,
        writeOffAmount: independentWriteOffAmounts[payable.id] || 0,
        remainingAmount: payable.unpaidAmount - (independentWriteOffAmounts[payable.id] || 0),
      }));

      // 更新付款单的核销明细
      const updatedVouchers = vouchers.map(v => {
        if (v.id === selectedVoucher.id) {
          return {
            ...v,
            payableIds: [...v.payableIds, ...independentSelectedPayables.map(p => p.id)],
            payableNos: [...v.payableNos, ...independentSelectedPayables.map(p => p.payableNo)],
            writeOffDetails: [...v.writeOffDetails, ...newWriteOffDetails],
            updatedAt: dayjs().format('YYYY-MM-DD'),
          };
        }
        return v;
      });

      // 更新应付账款状态
      const updatedPayables = payables.map(p => {
        const writeOffAmount = independentWriteOffAmounts[p.id];
        if (writeOffAmount) {
          const newPaidAmount = p.paidAmount + writeOffAmount;
          const newUnpaidAmount = p.amount - newPaidAmount;
          return {
            ...p,
            paidAmount: newPaidAmount,
            unpaidAmount: newUnpaidAmount,
            status: newUnpaidAmount <= 0 ? 'paid' : 'partial',
            paidAt: newUnpaidAmount <= 0 ? dayjs().format('YYYY-MM-DD') : undefined,
            updatedAt: dayjs().format('YYYY-MM-DD'),
          } as AccountPayable;
        }
        return p;
      });

      setVouchers(updatedVouchers);
      setPayables(updatedPayables);
      setIsIndependentWriteOffVisible(false);
      message.success(`成功核销${independentSelectedPayables.length}笔应付账款，核销金额：¥${totalWriteOff.toLocaleString()}`);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  // 表格列定义
  const columns: ColumnsType<PaymentVoucher> = [
    {
      title: '付款单号',
      dataIndex: 'voucherNo',
      key: 'voucherNo',
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
      title: '付款金额',
      dataIndex: 'paymentAmount',
      key: 'paymentAmount',
      width: 120,
      align: 'right',
      render: (amount: number) => (
        <span style={{ color: '#f5222d', fontWeight: 500 }}>
          ¥{amount.toLocaleString()}
        </span>
      ),
    },
    {
      title: '付款方式',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 100,
      render: (method: string) => getPaymentMethodTag(method),
    },
    {
      title: '付款日期',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      width: 110,
    },
    {
      title: '核销应付',
      key: 'writeOff',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span className="text-xs text-gray-500">
            核销{record.writeOffDetails.length}笔应付
          </span>
          <span className="text-sm">
            ¥{record.writeOffDetails.reduce((sum, d) => sum + d.writeOffAmount, 0).toLocaleString()}
          </span>
        </Space>
      ),
    },
    {
      title: '关联请款单',
      dataIndex: 'requestNo',
      key: 'requestNo',
      width: 130,
      render: (text: string) => text || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      width: 90,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="打印">
            <Button
              type="link"
              size="small"
              icon={<PrinterOutlined />}
              onClick={() => handlePrint(record)}
            />
          </Tooltip>
          {record.status === 'pending' && (
            <Popconfirm
              title="确定取消该付款单吗？"
              onConfirm={() => handleCancelVoucher(record)}
              okText="确定"
              cancelText="取消"
            >
              <Tooltip title="取消">
                <Button
                  type="link"
                  size="small"
                  danger
                  icon={<CloseOutlined />}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  // 应付账款选择表格列
  const payableColumns: ColumnsType<AccountPayable> = [
    {
      title: '应付单号',
      dataIndex: 'payableNo',
      key: 'payableNo',
      width: 130,
    },
    {
      title: '供应商',
      dataIndex: 'supplierName',
      key: 'supplierName',
      width: 150,
      ellipsis: true,
    },
    {
      title: '应付金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 110,
      align: 'right',
      render: (amount: number) => `¥${amount.toLocaleString()}`,
    },
    {
      title: '已付金额',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      width: 110,
      align: 'right',
      render: (amount: number) => `¥${amount.toLocaleString()}`,
    },
    {
      title: '未付金额',
      dataIndex: 'unpaidAmount',
      key: 'unpaidAmount',
      width: 110,
      align: 'right',
      render: (amount: number) => (
        <span style={{ color: '#f5222d' }}>¥{amount.toLocaleString()}</span>
      ),
    },
    {
      title: '到期日',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 100,
      render: (date: string) => {
        const isOverdue = dayjs(date).isBefore(dayjs(), 'day');
        return (
          <span style={{ color: isOverdue ? '#f5222d' : undefined }}>
            {date}
            {isOverdue && <WarningOutlined className="ml-1" />}
          </span>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          pending: { color: 'orange', text: '待付款' },
          partial: { color: 'blue', text: '部分付款' },
          overdue: { color: 'red', text: '已逾期' },
        };
        const config = statusMap[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  ];

  // 已选择应付账款核销表格列
  const writeOffColumns: ColumnsType<AccountPayable> = [
    {
      title: '应付单号',
      dataIndex: 'payableNo',
      key: 'payableNo',
      width: 130,
    },
    {
      title: '供应商',
      dataIndex: 'supplierName',
      key: 'supplierName',
      width: 140,
      ellipsis: true,
    },
    {
      title: '未付金额',
      dataIndex: 'unpaidAmount',
      key: 'unpaidAmount',
      width: 110,
      align: 'right',
      render: (amount: number) => (
        <span style={{ color: '#f5222d' }}>¥{amount.toLocaleString()}</span>
      ),
    },
    {
      title: '本次核销金额',
      key: 'writeOffAmount',
      width: 150,
      render: (_, record) => (
        <InputNumber
          value={writeOffAmounts[record.id]}
          min={0}
          max={record.unpaidAmount}
          precision={2}
          style={{ width: '100%' }}
          prefix="¥"
          onChange={(value) => handleWriteOffAmountChange(record.id, value || 0)}
        />
      ),
    },
    {
      title: '核销后余额',
      key: 'remainingAmount',
      width: 110,
      align: 'right',
      render: (_, record) => {
        const remaining = record.unpaidAmount - (writeOffAmounts[record.id] || 0);
        return (
          <span style={{ color: remaining > 0 ? '#faad14' : '#52c41a' }}>
            ¥{remaining.toLocaleString()}
          </span>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 60,
      render: (_, record) => (
        <Button
          type="link"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleSelectPayable(record, false)}
        />
      ),
    },
  ];

  // Tab项
  const tabItems = [
    { key: 'all', label: `全部 (${vouchers.length})` },
    { key: 'completed', label: `已完成 (${vouchers.filter(v => v.status === 'completed').length})` },
    { key: 'pending', label: `待确认 (${vouchers.filter(v => v.status === 'pending').length})` },
    { key: 'cancelled', label: `已取消 (${vouchers.filter(v => v.status === 'cancelled').length})` },
  ];

  return (
    <div className="space-y-4">
      {/* 统计卡片 */}
      <Row gutter={16}>
        <Col span={5}>
          <Card size="small">
            <Statistic
              title="付款单总数"
              value={stats.totalVouchers}
              prefix={<FileTextOutlined />}
              suffix="笔"
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card size="small">
            <Statistic
              title="已完成"
              value={stats.completedCount}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
              suffix="笔"
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card size="small">
            <Statistic
              title="待确认"
              value={stats.pendingCount}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
              suffix="笔"
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card size="small">
            <Statistic
              title="付款总额"
              value={stats.totalPaymentAmount}
              valueStyle={{ color: '#f5222d' }}
              prefix="¥"
              precision={2}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="核销总额"
              value={stats.totalWriteOffAmount}
              valueStyle={{ color: '#1890ff' }}
              prefix="¥"
              precision={2}
            />
          </Card>
        </Col>
      </Row>

      {/* 主内容卡片 */}
      <Card>
        {/* 操作栏 */}
        <div className="flex justify-between items-center mb-4">
          <Space>
            <Input
              placeholder="搜索付款单号/供应商"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 220 }}
              allowClear
            />
            <Select
              placeholder="选择供应商"
              style={{ width: 180 }}
              allowClear
              value={selectedSupplier || undefined}
              onChange={setSelectedSupplier}
            >
              {mockSuppliers.filter(s => s.status === 'active').map(s => (
                <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>
              ))}
            </Select>
          </Space>
          <Space>
            <Button icon={<ExportOutlined />}>导出</Button>
            <Button 
              icon={<TransactionOutlined />} 
              onClick={handleOpenIndependentWriteOff}
            >
              应付核销
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateVoucher}>
              新建付款单
            </Button>
          </Space>
        </div>

        {/* Tab和表格 */}
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
        <Table
          columns={columns}
          dataSource={getFilteredData()}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* 新建付款单弹窗 */}
      <Modal
        title="新建付款单"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={1000}
        okText="确认付款"
        cancelText="取消"
      >
        <div className="space-y-4">
          {/* 基本信息 */}
          <Card title="付款信息" size="small">
            <Form form={form} layout="vertical">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="supplierId"
                    label="供应商"
                    rules={[{ required: true, message: '请选择供应商' }]}
                  >
                    <Select 
                      placeholder="请选择供应商"
                      showSearch
                      optionFilterProp="children"
                      onChange={(value) => {
                        // 清空已选择的应付账款
                        setSelectedPayables([]);
                        setWriteOffAmounts({});
                      }}
                    >
                      {mockSuppliers.filter(s => s.status === 'active').map(s => (
                        <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="paymentDate"
                    label="付款日期"
                    rules={[{ required: true, message: '请选择付款日期' }]}
                    initialValue={dayjs()}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="paymentMethod"
                    label="付款方式"
                    rules={[{ required: true, message: '请选择付款方式' }]}
                    initialValue="bank_transfer"
                  >
                    <Select placeholder="请选择付款方式">
                      <Select.Option value="bank_transfer">银行转账</Select.Option>
                      <Select.Option value="cash">现金</Select.Option>
                      <Select.Option value="check">支票</Select.Option>
                      <Select.Option value="other">其他</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={16}>
                  <Form.Item name="remark" label="备注">
                    <TextArea rows={2} placeholder="请输入备注信息" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="requestNo" label="关联请款单号">
                    <Input placeholder="可选，输入关联的请款单号" />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>

          {/* 选择应付账款 */}
          <Card 
            title={
              <Space>
                <span>选择应付账款进行核销</span>
                <Badge count={pendingPayables.length} style={{ backgroundColor: '#faad14' }} />
              </Space>
            } 
            size="small"
          >
            <Form.Item noStyle shouldUpdate>
              {() => {
                const supplierId = form.getFieldValue('supplierId');
                const filteredPayables = supplierId 
                  ? pendingPayables.filter(p => p.supplierId === supplierId)
                  : pendingPayables;
                
                return (
                  <Table
                    columns={payableColumns}
                    dataSource={filteredPayables}
                    rowKey="id"
                    size="small"
                    pagination={false}
                    scroll={{ y: 200 }}
                    rowSelection={{
                      type: 'checkbox',
                      selectedRowKeys: selectedPayables.map(p => p.id),
                      onChange: (_, selectedRows) => {
                        setSelectedPayables(selectedRows);
                        const amounts: Record<string, number> = {};
                        selectedRows.forEach(row => {
                          amounts[row.id] = row.unpaidAmount;
                        });
                        setWriteOffAmounts(amounts);
                      },
                    }}
                  />
                );
              }}
            </Form.Item>
          </Card>

          {/* 核销明细 */}
          {selectedPayables.length > 0 && (
            <Card 
              title={
                <Space>
                  <span>核销明细</span>
                  <Tag color="blue">{selectedPayables.length}笔</Tag>
                </Space>
              }
              size="small"
              extra={
                <Space>
                  <span>核销合计：</span>
                  <span style={{ color: '#f5222d', fontWeight: 600, fontSize: 16 }}>
                    ¥{Object.values(writeOffAmounts).reduce((sum, a) => sum + a, 0).toLocaleString()}
                  </span>
                </Space>
              }
            >
              <Table
                columns={writeOffColumns}
                dataSource={selectedPayables}
                rowKey="id"
                size="small"
                pagination={false}
              />
              <Alert
                className="mt-3"
                type="info"
                showIcon
                message="核销说明"
                description="付款确认后，系统将自动更新应付账款的已付金额和未付金额，并根据核销情况更新应付状态。"
              />
            </Card>
          )}
        </div>
      </Modal>

      {/* 付款单详情弹窗 */}
      <Modal
        title="付款单详情"
        open={isDetailVisible}
        onCancel={() => setIsDetailVisible(false)}
        footer={[
          <Button key="print" icon={<PrinterOutlined />} onClick={() => currentVoucher && handlePrint(currentVoucher)}>
            打印
          </Button>,
          <Button key="close" onClick={() => setIsDetailVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {currentVoucher && (
          <div className="space-y-4">
            {/* 状态提示 */}
            {currentVoucher.status === 'completed' && (
              <Alert
                type="success"
                showIcon
                icon={<CheckCircleOutlined />}
                message="付款已完成"
                description={`付款时间：${currentVoucher.paymentDate}，操作人：${currentVoucher.operator}`}
              />
            )}

            {/* 基本信息 */}
            <Descriptions title="基本信息" bordered column={2} size="small">
              <Descriptions.Item label="付款单号">{currentVoucher.voucherNo}</Descriptions.Item>
              <Descriptions.Item label="状态">{getStatusTag(currentVoucher.status)}</Descriptions.Item>
              <Descriptions.Item label="供应商">{currentVoucher.supplierName}</Descriptions.Item>
              <Descriptions.Item label="付款金额">
                <span style={{ color: '#f5222d', fontWeight: 600 }}>
                  ¥{currentVoucher.paymentAmount.toLocaleString()}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="付款方式">{getPaymentMethodTag(currentVoucher.paymentMethod)}</Descriptions.Item>
              <Descriptions.Item label="付款日期">{currentVoucher.paymentDate}</Descriptions.Item>
              <Descriptions.Item label="收款银行">{currentVoucher.bankName}</Descriptions.Item>
              <Descriptions.Item label="收款账号">{currentVoucher.bankAccount}</Descriptions.Item>
              {currentVoucher.requestNo && (
                <Descriptions.Item label="关联请款单" span={2}>
                  <a><LinkOutlined /> {currentVoucher.requestNo}</a>
                </Descriptions.Item>
              )}
              {currentVoucher.remark && (
                <Descriptions.Item label="备注" span={2}>{currentVoucher.remark}</Descriptions.Item>
              )}
            </Descriptions>

            {/* 核销明细 */}
            <Card title="核销明细" size="small">
              <Table
                columns={[
                  {
                    title: '应付单号',
                    dataIndex: 'payableNo',
                    key: 'payableNo',
                    width: 130,
                  },
                  {
                    title: '应付金额',
                    dataIndex: 'payableAmount',
                    key: 'payableAmount',
                    width: 120,
                    align: 'right',
                    render: (amount: number) => `¥${amount.toLocaleString()}`,
                  },
                  {
                    title: '本次核销',
                    dataIndex: 'writeOffAmount',
                    key: 'writeOffAmount',
                    width: 120,
                    align: 'right',
                    render: (amount: number) => (
                      <span style={{ color: '#52c41a', fontWeight: 500 }}>
                        ¥{amount.toLocaleString()}
                      </span>
                    ),
                  },
                  {
                    title: '核销后余额',
                    dataIndex: 'remainingAmount',
                    key: 'remainingAmount',
                    width: 120,
                    align: 'right',
                    render: (amount: number) => (
                      <span style={{ color: amount > 0 ? '#faad14' : '#52c41a' }}>
                        ¥{amount.toLocaleString()}
                      </span>
                    ),
                  },
                  {
                    title: '核销状态',
                    key: 'status',
                    width: 100,
                    render: (_, record: WriteOffDetail) => (
                      record.remainingAmount <= 0 
                        ? <Tag color="green">全额核销</Tag>
                        : <Tag color="orange">部分核销</Tag>
                    ),
                  },
                ]}
                dataSource={currentVoucher.writeOffDetails}
                rowKey="id"
                size="small"
                pagination={false}
                summary={(pageData) => {
                  const totalWriteOff = pageData.reduce((sum, row) => sum + row.writeOffAmount, 0);
                  const totalRemaining = pageData.reduce((sum, row) => sum + row.remainingAmount, 0);
                  return (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={2}>
                        <strong>合计</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} align="right">
                        <strong style={{ color: '#52c41a' }}>¥{totalWriteOff.toLocaleString()}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3} align="right">
                        <strong style={{ color: totalRemaining > 0 ? '#faad14' : '#52c41a' }}>
                          ¥{totalRemaining.toLocaleString()}
                        </strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4} />
                    </Table.Summary.Row>
                  );
                }}
              />
            </Card>

            {/* 操作记录 */}
            <Card title="操作记录" size="small">
              <Timeline
                items={[
                  {
                    color: 'green',
                    children: (
                      <div>
                        <div className="font-medium">付款完成</div>
                        <div className="text-gray-500 text-sm">
                          {currentVoucher.paymentDate} · {currentVoucher.operator}
                        </div>
                        <div className="text-gray-500 text-sm">
                          付款金额：¥{currentVoucher.paymentAmount.toLocaleString()}
                        </div>
                      </div>
                    ),
                  },
                  {
                    color: 'blue',
                    children: (
                      <div>
                        <div className="font-medium">创建付款单</div>
                        <div className="text-gray-500 text-sm">
                          {currentVoucher.createdAt} · {currentVoucher.operator}
                        </div>
                      </div>
                    ),
                  },
                ]}
              />
            </Card>
          </div>
        )}
      </Modal>

      {/* 独立应付核销弹窗 */}
      <Modal
        title={
          <Space>
            <TransactionOutlined />
            <span>应付账款核销</span>
          </Space>
        }
        open={isIndependentWriteOffVisible}
        onOk={handleIndependentWriteOffOk}
        onCancel={() => setIsIndependentWriteOffVisible(false)}
        width={1100}
        okText="确认核销"
        cancelText="取消"
      >
        <div className="space-y-4">
          {/* 选择付款单 */}
          <Card title="选择付款单" size="small">
            <Form form={writeOffForm} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="voucherId"
                    label="付款单"
                    rules={[{ required: true, message: '请选择付款单' }]}
                  >
                    <Select 
                      placeholder="请选择要核销的付款单"
                      showSearch
                      optionFilterProp="children"
                      onChange={() => {
                        setIndependentSelectedPayables([]);
                        setIndependentWriteOffAmounts({});
                      }}
                    >
                      {vouchers.filter(v => v.status === 'completed').map(v => {
                        const alreadyWriteOff = v.writeOffDetails.reduce((sum, d) => sum + d.writeOffAmount, 0);
                        const remaining = v.paymentAmount - alreadyWriteOff;
                        return (
                          <Select.Option key={v.id} value={v.id} disabled={remaining <= 0}>
                            <div className="flex justify-between items-center">
                              <span>{v.voucherNo} - {v.supplierName}</span>
                              <span className="text-gray-400 text-xs ml-2">
                                付款¥{v.paymentAmount.toLocaleString()} / 
                                已核销¥{alreadyWriteOff.toLocaleString()} / 
                                <span style={{ color: remaining > 0 ? '#52c41a' : '#999' }}>
                                  可核销¥{remaining.toLocaleString()}
                                </span>
                              </span>
                            </div>
                          </Select.Option>
                        );
                      })}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item noStyle shouldUpdate>
                    {() => {
                      const voucherId = writeOffForm.getFieldValue('voucherId');
                      const selectedVoucher = vouchers.find(v => v.id === voucherId);
                      if (!selectedVoucher) return null;
                      
                      const alreadyWriteOff = selectedVoucher.writeOffDetails.reduce((sum, d) => sum + d.writeOffAmount, 0);
                      const remaining = selectedVoucher.paymentAmount - alreadyWriteOff;
                      
                      return (
                        <div className="p-3 bg-blue-50 rounded-lg mt-6">
                          <Row gutter={16}>
                            <Col span={8}>
                              <div className="text-gray-500 text-xs">付款金额</div>
                              <div className="font-medium">¥{selectedVoucher.paymentAmount.toLocaleString()}</div>
                            </Col>
                            <Col span={8}>
                              <div className="text-gray-500 text-xs">已核销金额</div>
                              <div className="font-medium text-orange-500">¥{alreadyWriteOff.toLocaleString()}</div>
                            </Col>
                            <Col span={8}>
                              <div className="text-gray-500 text-xs">可核销金额</div>
                              <div className="font-medium text-green-500">¥{remaining.toLocaleString()}</div>
                            </Col>
                          </Row>
                        </div>
                      );
                    }}
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>

          {/* 待核销应付账款列表 */}
          <Card 
            title={
              <Space>
                <span>选择应付账款</span>
                <Badge count={pendingPayables.length} style={{ backgroundColor: '#faad14' }} />
              </Space>
            } 
            size="small"
          >
            <Form.Item noStyle shouldUpdate>
              {() => {
                const voucherId = writeOffForm.getFieldValue('voucherId');
                const selectedVoucher = vouchers.find(v => v.id === voucherId);
                
                // 根据付款单供应商筛选应付账款
                const filteredPayables = selectedVoucher 
                  ? pendingPayables.filter(p => p.supplierId === selectedVoucher.supplierId)
                  : pendingPayables;
                
                return (
                  <>
                    {!voucherId && (
                      <Alert
                        type="info"
                        showIcon
                        message="请先选择付款单"
                        description="选择付款单后，将显示该供应商的待核销应付账款"
                        className="mb-3"
                      />
                    )}
                    <Table
                      columns={[
                        {
                          title: '应付单号',
                          dataIndex: 'payableNo',
                          key: 'payableNo',
                          width: 130,
                        },
                        {
                          title: '供应商',
                          dataIndex: 'supplierName',
                          key: 'supplierName',
                          width: 150,
                          ellipsis: true,
                        },
                        {
                          title: '来源单号',
                          dataIndex: 'sourceNo',
                          key: 'sourceNo',
                          width: 130,
                        },
                        {
                          title: '应付金额',
                          dataIndex: 'amount',
                          key: 'amount',
                          width: 110,
                          align: 'right',
                          render: (amount: number) => `¥${amount.toLocaleString()}`,
                        },
                        {
                          title: '已付金额',
                          dataIndex: 'paidAmount',
                          key: 'paidAmount',
                          width: 110,
                          align: 'right',
                          render: (amount: number) => `¥${amount.toLocaleString()}`,
                        },
                        {
                          title: '未付金额',
                          dataIndex: 'unpaidAmount',
                          key: 'unpaidAmount',
                          width: 110,
                          align: 'right',
                          render: (amount: number) => (
                            <span style={{ color: '#f5222d' }}>¥{amount.toLocaleString()}</span>
                          ),
                        },
                        {
                          title: '到期日',
                          dataIndex: 'dueDate',
                          key: 'dueDate',
                          width: 100,
                          render: (date: string) => {
                            const isOverdue = dayjs(date).isBefore(dayjs(), 'day');
                            return (
                              <span style={{ color: isOverdue ? '#f5222d' : undefined }}>
                                {date}
                                {isOverdue && <WarningOutlined className="ml-1" />}
                              </span>
                            );
                          },
                        },
                        {
                          title: '状态',
                          dataIndex: 'status',
                          key: 'status',
                          width: 90,
                          render: (status: string) => {
                            const statusMap: Record<string, { color: string; text: string }> = {
                              pending: { color: 'orange', text: '待付款' },
                              partial: { color: 'blue', text: '部分付款' },
                              overdue: { color: 'red', text: '已逾期' },
                            };
                            const config = statusMap[status] || { color: 'default', text: status };
                            return <Tag color={config.color}>{config.text}</Tag>;
                          },
                        },
                      ]}
                      dataSource={filteredPayables}
                      rowKey="id"
                      size="small"
                      pagination={false}
                      scroll={{ y: 200 }}
                      rowSelection={{
                        type: 'checkbox',
                        selectedRowKeys: independentSelectedPayables.map(p => p.id),
                        onChange: (_, selectedRows) => {
                          setIndependentSelectedPayables(selectedRows);
                          const amounts: Record<string, number> = {};
                          selectedRows.forEach(row => {
                            amounts[row.id] = row.unpaidAmount;
                          });
                          setIndependentWriteOffAmounts(amounts);
                        },
                        getCheckboxProps: () => ({
                          disabled: !voucherId,
                        }),
                      }}
                    />
                  </>
                );
              }}
            </Form.Item>
          </Card>

          {/* 核销明细 */}
          {independentSelectedPayables.length > 0 && (
            <Card 
              title={
                <Space>
                  <span>核销明细</span>
                  <Tag color="blue">{independentSelectedPayables.length}笔</Tag>
                </Space>
              }
              size="small"
              extra={
                <Form.Item noStyle shouldUpdate>
                  {() => {
                    const voucherId = writeOffForm.getFieldValue('voucherId');
                    const selectedVoucher = vouchers.find(v => v.id === voucherId);
                    const alreadyWriteOff = selectedVoucher?.writeOffDetails.reduce((sum, d) => sum + d.writeOffAmount, 0) || 0;
                    const remainingPayment = (selectedVoucher?.paymentAmount || 0) - alreadyWriteOff;
                    const totalWriteOff = Object.values(independentWriteOffAmounts).reduce((sum, a) => sum + a, 0);
                    const isOverLimit = totalWriteOff > remainingPayment;
                    
                    return (
                      <Space>
                        <span>核销合计：</span>
                        <span style={{ color: isOverLimit ? '#f5222d' : '#52c41a', fontWeight: 600, fontSize: 16 }}>
                          ¥{totalWriteOff.toLocaleString()}
                        </span>
                        {isOverLimit && (
                          <Tag color="error">超出可核销金额</Tag>
                        )}
                      </Space>
                    );
                  }}
                </Form.Item>
              }
            >
              <Table
                columns={[
                  {
                    title: '应付单号',
                    dataIndex: 'payableNo',
                    key: 'payableNo',
                    width: 130,
                  },
                  {
                    title: '供应商',
                    dataIndex: 'supplierName',
                    key: 'supplierName',
                    width: 140,
                    ellipsis: true,
                  },
                  {
                    title: '未付金额',
                    dataIndex: 'unpaidAmount',
                    key: 'unpaidAmount',
                    width: 110,
                    align: 'right',
                    render: (amount: number) => (
                      <span style={{ color: '#f5222d' }}>¥{amount.toLocaleString()}</span>
                    ),
                  },
                  {
                    title: '本次核销金额',
                    key: 'writeOffAmount',
                    width: 150,
                    render: (_: unknown, record: AccountPayable) => (
                      <InputNumber
                        value={independentWriteOffAmounts[record.id]}
                        min={0}
                        max={record.unpaidAmount}
                        precision={2}
                        style={{ width: '100%' }}
                        prefix="¥"
                        onChange={(value) => handleIndependentWriteOffAmountChange(record.id, value || 0)}
                      />
                    ),
                  },
                  {
                    title: '核销后余额',
                    key: 'remainingAmount',
                    width: 110,
                    align: 'right',
                    render: (_: unknown, record: AccountPayable) => {
                      const remaining = record.unpaidAmount - (independentWriteOffAmounts[record.id] || 0);
                      return (
                        <span style={{ color: remaining > 0 ? '#faad14' : '#52c41a' }}>
                          ¥{remaining.toLocaleString()}
                        </span>
                      );
                    },
                  },
                  {
                    title: '操作',
                    key: 'action',
                    width: 60,
                    render: (_: unknown, record: AccountPayable) => (
                      <Button
                        type="link"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleIndependentSelectPayable(record, false)}
                      />
                    ),
                  },
                ]}
                dataSource={independentSelectedPayables}
                rowKey="id"
                size="small"
                pagination={false}
              />
              <Alert
                className="mt-3"
                type="info"
                showIcon
                message="核销说明"
                description="核销确认后，系统将自动更新应付账款的已付金额和未付金额，并将核销记录添加到付款单中。"
              />
            </Card>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default PaymentVoucherManagement;
