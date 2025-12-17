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
  Upload,
  Badge,
  Spin,
  Alert,
  Image,
  Steps,
  Progress,
  Result,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  CloseOutlined,
  FileTextOutlined,
  EyeOutlined,
  ExportOutlined,
  UploadOutlined,
  SafetyCertificateOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  InboxOutlined,
  ScanOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile, UploadProps } from 'antd/es/upload';
import dayjs from 'dayjs';
import type { Invoice } from '../types';
import { mockInvoices, mockSuppliers, mockAccountPayables, mockReconciliationStatements, getInvoiceStats } from '../lib/mockData';

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Dragger } = Upload;

const InvoiceManagement: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [isMatchVisible, setIsMatchVisible] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [form] = Form.useForm();
  const [matchForm] = Form.useForm();

  // 发票上传相关状态
  const [uploadedFile, setUploadedFile] = useState<UploadFile | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognizeSuccess, setRecognizeSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // 批量导入相关状态
  const [isBatchImportVisible, setIsBatchImportVisible] = useState(false);
  const [importStep, setImportStep] = useState(0);
  const [importFileList, setImportFileList] = useState<UploadFile[]>([]);
  const [importData, setImportData] = useState<ImportInvoiceData[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [isRecognizingBatch, setIsRecognizingBatch] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);

  const stats = getInvoiceStats();

  // 批量导入数据类型
  interface ImportInvoiceData {
    key: string;
    fileName?: string;
    invoiceNo: string;
    invoiceCode: string;
    invoiceType: string;
    supplierName: string;
    invoiceDate: string;
    amount: number;
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
    remark?: string;
    status: 'valid' | 'error' | 'warning';
    errorMsg?: string;
  }

  // 模拟发票OCR识别数据
  const mockOcrResults = [
    {
      invoiceNo: '12345678',
      invoiceCode: '044001900211',
      invoiceType: 'vat_special',
      supplierName: '华为技术有限公司',
      invoiceDate: '2024-12-10',
      amount: 88495.58,
      taxRate: 13,
      taxAmount: 11504.42,
      totalAmount: 100000,
    },
    {
      invoiceNo: '87654321',
      invoiceCode: '044001900212',
      invoiceType: 'electronic',
      supplierName: '腾讯科技有限公司',
      invoiceDate: '2024-12-12',
      amount: 44247.79,
      taxRate: 13,
      taxAmount: 5752.21,
      totalAmount: 50000,
    },
    {
      invoiceNo: '11223344',
      invoiceCode: '044001900213',
      invoiceType: 'vat_normal',
      supplierName: '阿里巴巴集团',
      invoiceDate: '2024-12-08',
      amount: 26548.67,
      taxRate: 13,
      taxAmount: 3451.33,
      totalAmount: 30000,
    },
  ];

  // 模拟OCR识别
  const simulateOcrRecognition = () => {
    setIsRecognizing(true);

    // 模拟识别延迟
    setTimeout(() => {
      // 随机选择一个模拟结果
      const randomResult = mockOcrResults[Math.floor(Math.random() * mockOcrResults.length)];

      // 查找匹配的供应商ID
      const matchedSupplier = mockSuppliers.find(s =>
        s.name === randomResult.supplierName || s.name.includes(randomResult.supplierName.substring(0, 2))
      );

      // 填充表单
      form.setFieldsValue({
        invoiceNo: randomResult.invoiceNo,
        invoiceCode: randomResult.invoiceCode,
        invoiceType: randomResult.invoiceType,
        supplierId: matchedSupplier?.id || undefined,
        invoiceDate: dayjs(randomResult.invoiceDate),
        amount: randomResult.amount,
        taxRate: randomResult.taxRate,
      });

      setIsRecognizing(false);
      setRecognizeSuccess(true);
      message.success('发票识别成功，信息已自动填充');
    }, 1500);
  };

  // 处理文件上传
  const handleUpload: UploadProps['onChange'] = (info) => {
    const { file } = info;

    if (file.status === 'removed') {
      setUploadedFile(null);
      setPreviewUrl('');
      setRecognizeSuccess(false);
      return;
    }

    setUploadedFile(file);
    setRecognizeSuccess(false);

    // 生成预览URL
    if (file.originFileObj) {
      const url = URL.createObjectURL(file.originFileObj);
      setPreviewUrl(url);
    }
  };

  // 自定义上传（不实际上传到服务器）
  const customUpload: UploadProps['customRequest'] = (options) => {
    const { onSuccess } = options;
    setTimeout(() => {
      onSuccess?.('ok');
    }, 100);
  };

  const getInvoiceTypeTag = (type: string) => {
    const typeMap: Record<string, { color: string; text: string }> = {
      vat_special: { color: 'red', text: '增值税专票' },
      vat_normal: { color: 'blue', text: '增值税普票' },
      electronic: { color: 'green', text: '电子发票' },
      other: { color: 'default', text: '其他' },
    };
    const { color, text } = typeMap[type] || { color: 'default', text: type };
    return <Tag color={color}>{text}</Tag>;
  };

  const getVerifyStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      pending: { color: 'default', text: '待验真', icon: <ClockCircleOutlined /> },
      verified: { color: 'success', text: '已验真', icon: <CheckCircleOutlined /> },
      failed: { color: 'error', text: '验真失败', icon: <CloseOutlined /> },
    };
    const { color, text, icon } = statusMap[status] || { color: 'default', text: status, icon: null };
    return <Tag color={color} icon={icon}>{text}</Tag>;
  };

  const getMatchStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      pending: { color: 'default', text: '待匹配' },
      matched: { color: 'success', text: '已匹配' },
      partial: { color: 'warning', text: '部分匹配' },
      unmatched: { color: 'error', text: '未匹配' },
    };
    const { color, text } = statusMap[status] || { color: 'default', text: status };
    return <Tag color={color}>{text}</Tag>;
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      pending: { color: 'default', text: '待收票' },
      received: { color: 'processing', text: '已收票' },
      verified: { color: 'success', text: '已验真' },
      rejected: { color: 'error', text: '已退回' },
      cancelled: { color: 'default', text: '已作废' },
    };
    const { color, text } = statusMap[status] || { color: 'default', text: status };
    return <Tag color={color}>{text}</Tag>;
  };

  const filteredInvoices = invoices.filter(i => {
    let matchTab = activeTab === 'all';
    if (activeTab === 'pending') matchTab = i.status === 'pending' || i.status === 'received';
    if (activeTab === 'verified') matchTab = i.verifyStatus === 'verified';
    if (activeTab === 'matched') matchTab = i.matchStatus === 'matched';
    if (activeTab === 'unmatched') matchTab = i.matchStatus === 'pending' || i.matchStatus === 'unmatched';

    const matchSearch = !searchText ||
      i.invoiceNo.toLowerCase().includes(searchText.toLowerCase()) ||
      i.supplierName.includes(searchText);
    const matchSupplier = !selectedSupplier || i.supplierId === selectedSupplier;
    return matchTab && matchSearch && matchSupplier;
  });

  const columns: ColumnsType<Invoice> = [
    {
      title: '发票号码',
      dataIndex: 'invoiceNo',
      key: 'invoiceNo',
      width: 140,
      render: (text, record) => (
        <a onClick={() => handleViewDetail(record)}>{text}</a>
      ),
    },
    {
      title: '发票代码',
      dataIndex: 'invoiceCode',
      key: 'invoiceCode',
      width: 130,
    },
    {
      title: '发票类型',
      dataIndex: 'invoiceType',
      key: 'invoiceType',
      width: 110,
      render: (type) => getInvoiceTypeTag(type),
    },
    {
      title: '供应商',
      dataIndex: 'supplierName',
      key: 'supplierName',
      width: 150,
      ellipsis: true,
    },
    {
      title: '开票日期',
      dataIndex: 'invoiceDate',
      key: 'invoiceDate',
      width: 100,
    },
    {
      title: '不含税金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 110,
      align: 'right',
      render: (amount) => `¥${amount.toLocaleString()}`,
    },
    {
      title: '税额',
      dataIndex: 'taxAmount',
      key: 'taxAmount',
      width: 100,
      align: 'right',
      render: (amount) => `¥${amount.toLocaleString()}`,
    },
    {
      title: '含税金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 110,
      align: 'right',
      render: (amount) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
          ¥{amount.toLocaleString()}
        </span>
      ),
    },
    {
      title: '已关联金额',
      dataIndex: 'matchedAmount',
      key: 'matchedAmount',
      width: 110,
      align: 'right',
      render: (amount, record) => (
        <span style={{ color: amount > 0 ? '#52c41a' : '#999' }}>
          ¥{(amount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: '未关联金额',
      dataIndex: 'unmatchedAmount',
      key: 'unmatchedAmount',
      width: 110,
      align: 'right',
      render: (amount, record) => (
        <span style={{ color: amount > 0 ? '#faad14' : '#999' }}>
          ¥{(amount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: '验真状态',
      dataIndex: 'verifyStatus',
      key: 'verifyStatus',
      width: 100,
      render: (status) => getVerifyStatusTag(status),
    },
    {
      title: '匹配状态',
      dataIndex: 'matchStatus',
      key: 'matchStatus',
      width: 90,
      render: (status) => getMatchStatusTag(status),
    },
    {
      title: '关联应付',
      dataIndex: 'payableNos',
      key: 'payableNos',
      width: 100,
      render: (nos: string[]) => (
        nos.length > 0 ? (
          <Tooltip title={nos.join(', ')}>
            <Badge count={nos.length} size="small" color="#1890ff">
              <Tag icon={<LinkOutlined />}>已关联</Tag>
            </Badge>
          </Tooltip>
        ) : <span className="text-gray-400">-</span>
      ),
    },
    {
      title: '收票日期',
      dataIndex: 'receivedAt',
      key: 'receivedAt',
      width: 100,
      render: (date) => date || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            查看
          </Button>
          {record.verifyStatus === 'pending' && (
            <Popconfirm
              title="确认验真该发票？"
              onConfirm={() => handleVerify(record.id)}
            >
              <Button type="link" size="small" style={{ color: '#52c41a' }}>
                验真
              </Button>
            </Popconfirm>
          )}
          {record.matchStatus !== 'matched' && record.verifyStatus === 'verified' && (
            <Button type="link" size="small" onClick={() => handleOpenMatch(record)}>
              匹配
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleViewDetail = (record: Invoice) => {
    setCurrentInvoice(record);
    setIsDetailVisible(true);
  };

  const handleVerify = (id: string) => {
    setInvoices(prev => prev.map(i =>
      i.id === id
        ? {
          ...i,
          verifyStatus: 'verified' as const,
          status: 'verified' as const,
          verifiedAt: dayjs().format('YYYY-MM-DD'),
          updatedAt: dayjs().format('YYYY-MM-DD')
        }
        : i
    ));
    message.success('发票验真成功');
  };

  const handleOpenMatch = (record: Invoice) => {
    setCurrentInvoice(record);
    matchForm.resetFields();
    setIsMatchVisible(true);
  };

  const handleMatch = () => {
    matchForm.validateFields().then(values => {
      if (!currentInvoice) return;

      const payableNos = values.payableIds?.map((id: string) =>
        mockAccountPayables.find(p => p.id === id)?.payableNo || ''
      ) || [];
      const reconciliationNos = values.reconciliationIds?.map((id: string) =>
        mockReconciliationStatements.find(r => r.id === id)?.statementNo || ''
      ) || [];

      setInvoices(prev => prev.map(i =>
        i.id === currentInvoice.id
          ? {
            ...i,
            matchStatus: 'matched' as const,
            payableIds: values.payableIds || [],
            payableNos,
            reconciliationIds: values.reconciliationIds || [],
            reconciliationNos,
            updatedAt: dayjs().format('YYYY-MM-DD')
          }
          : i
      ));
      setIsMatchVisible(false);
      message.success('发票匹配成功');
    });
  };

  const handleCreateInvoice = () => {
    form.resetFields();
    setUploadedFile(null);
    setPreviewUrl('');
    setRecognizeSuccess(false);
    setIsRecognizing(false);
    setIsModalVisible(true);
  };

  // 批量导入相关函数
  const handleOpenBatchImport = () => {
    setIsBatchImportVisible(true);
    setImportStep(0);
    setImportFileList([]);
    setImportData([]);
    setImportProgress(0);
    setIsImporting(false);
    setIsRecognizingBatch(false);
    setImportResult(null);
  };

  const handleBatchFileUpload: UploadProps['onChange'] = (info) => {
    setImportFileList(info.fileList);
  };

  const handleRemoveFile = (uid: string) => {
    setImportFileList(prev => prev.filter(f => f.uid !== uid));
  };

  const handleRecognizeAll = () => {
    if (importFileList.length === 0) {
      message.warning('请先上传发票文件');
      return;
    }
    
    setIsRecognizingBatch(true);
    setImportStep(1);
    
    // 模拟批量OCR识别
    setTimeout(() => {
      const recognizedData: ImportInvoiceData[] = importFileList.map((file, index) => {
        // 随机生成识别结果
        const randomStatus = Math.random();
        let status: 'valid' | 'warning' | 'error' = 'valid';
        let errorMsg: string | undefined;
        
        if (randomStatus > 0.85) {
          status = 'error';
          errorMsg = '发票图片模糊，无法识别';
        } else if (randomStatus > 0.7) {
          status = 'warning';
          errorMsg = '供应商信息需要人工确认';
        }
        
        const suppliers = ['华为技术有限公司', '腾讯科技有限公司', '阿里巴巴集团', '京东集团', '字节跳动'];
        const types = ['vat_special', 'vat_normal', 'electronic'];
        const amount = Math.floor(Math.random() * 100000) + 10000;
        const taxRate = [6, 9, 13][Math.floor(Math.random() * 3)];
        const taxAmount = Math.round(amount * taxRate / 100);
        
        return {
          key: file.uid,
          fileName: file.name,
          invoiceNo: status === 'error' ? '' : `${Math.floor(Math.random() * 90000000) + 10000000}`,
          invoiceCode: `04400190030${index + 1}`,
          invoiceType: types[Math.floor(Math.random() * types.length)],
          supplierName: suppliers[Math.floor(Math.random() * suppliers.length)],
          invoiceDate: `2024-12-${String(Math.floor(Math.random() * 15) + 1).padStart(2, '0')}`,
          amount,
          taxRate,
          taxAmount,
          totalAmount: amount + taxAmount,
          status,
          errorMsg,
        };
      });
      
      setImportData(recognizedData);
      setIsRecognizingBatch(false);
    }, 2000);
  };

  const handleRemoveImportRow = (key: string) => {
    setImportData(prev => prev.filter(item => item.key !== key));
    setImportFileList(prev => prev.filter(f => f.uid !== key));
  };

  const handleStartImport = () => {
    const validData = importData.filter(item => item.status !== 'error');
    if (validData.length === 0) {
      message.warning('没有可导入的有效数据');
      return;
    }

    setIsImporting(true);
    setImportStep(2);
    setImportProgress(0);

    const total = validData.length;
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setImportProgress(Math.round((current / total) * 100));
      if (current >= total) {
        clearInterval(interval);
        setTimeout(() => {
          const errorCount = importData.filter(item => item.status === 'error').length;
          setImportResult({
            success: validData.length,
            failed: errorCount,
            errors: importData.filter(item => item.status === 'error').map(item => `${item.invoiceCode}: ${item.errorMsg}`),
          });

          const newInvoices: Invoice[] = validData.map((item, index) => {
            const supplier = mockSuppliers.find(s => s.name === item.supplierName);
            return {
              id: `inv-import-${Date.now()}-${index}`,
              invoiceNo: item.invoiceNo,
              invoiceCode: item.invoiceCode,
              invoiceType: item.invoiceType as Invoice['invoiceType'],
              supplierId: supplier?.id || '',
              supplierName: item.supplierName,
              buyerName: '本公司',
              buyerTaxNo: '91440300MA5BBBBB',
              invoiceDate: item.invoiceDate,
              amount: item.amount,
              taxRate: item.taxRate,
              taxAmount: item.taxAmount,
              totalAmount: item.totalAmount,
              matchedAmount: 0,
              unmatchedAmount: item.totalAmount,
              payableIds: [],
              payableNos: [],
              reconciliationIds: [],
              reconciliationNos: [],
              verifyStatus: 'pending',
              matchStatus: 'pending',
              status: 'received',
              receivedAt: dayjs().format('YYYY-MM-DD'),
              remark: item.remark || '批量导入',
              createdAt: dayjs().format('YYYY-MM-DD'),
              updatedAt: dayjs().format('YYYY-MM-DD'),
            };
          });
          setInvoices(prev => [...newInvoices, ...prev]);
          setIsImporting(false);
          setImportStep(3);
        }, 500);
      }
    }, 300);
  };

  const handleCloseBatchImport = () => {
    setIsBatchImportVisible(false);
    if (importResult && importResult.success > 0) {
      message.success(`成功导入 ${importResult.success} 条发票`);
    }
  };

  // 导入数据表格列
  const importColumns: ColumnsType<ImportInvoiceData> = [
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      fixed: 'left',
      render: (status, record) => {
        if (status === 'valid') {
          return <Tag color="success" icon={<CheckCircleOutlined />}>有效</Tag>;
        } else if (status === 'warning') {
          return (
            <Tooltip title={record.errorMsg}>
              <Tag color="warning" icon={<ExclamationCircleOutlined />}>警告</Tag>
            </Tooltip>
          );
        } else {
          return (
            <Tooltip title={record.errorMsg}>
              <Tag color="error" icon={<CloseOutlined />}>错误</Tag>
            </Tooltip>
          );
        }
      },
    },
    {
      title: '文件名',
      dataIndex: 'fileName',
      key: 'fileName',
      width: 150,
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <span className="text-gray-600">{text}</span>
        </Tooltip>
      ),
    },
    {
      title: '发票号码',
      dataIndex: 'invoiceNo',
      key: 'invoiceNo',
      width: 120,
      render: (text, record) => (
        <span style={{ color: record.status === 'error' && !text ? '#ff4d4f' : undefined }}>
          {text || '-'}
        </span>
      ),
    },
    {
      title: '发票代码',
      dataIndex: 'invoiceCode',
      key: 'invoiceCode',
      width: 130,
    },
    {
      title: '发票类型',
      dataIndex: 'invoiceType',
      key: 'invoiceType',
      width: 110,
      render: (type) => getInvoiceTypeTag(type),
    },
    {
      title: '供应商',
      dataIndex: 'supplierName',
      key: 'supplierName',
      width: 140,
      ellipsis: true,
      render: (text, record) => (
        <span style={{ color: record.status === 'warning' ? '#faad14' : undefined }}>
          {text}
        </span>
      ),
    },
    {
      title: '开票日期',
      dataIndex: 'invoiceDate',
      key: 'invoiceDate',
      width: 100,
    },
    {
      title: '不含税金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 100,
      align: 'right',
      render: (amount) => `¥${amount?.toLocaleString() || 0}`,
    },
    {
      title: '税率',
      dataIndex: 'taxRate',
      key: 'taxRate',
      width: 60,
      align: 'center',
      render: (rate) => `${rate}%`,
    },
    {
      title: '含税金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 110,
      align: 'right',
      render: (amount) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
          ¥{amount?.toLocaleString() || 0}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveImportRow(record.key)}
        >
          移除
        </Button>
      ),
    },
  ];

  const handleModalOk = () => {
    form.validateFields().then(values => {
      const amount = values.amount;
      const taxRate = values.taxRate;
      const taxAmount = amount * taxRate / 100;
      const totalAmount = amount + taxAmount;

      const newInvoice: Invoice = {
        id: `inv-${Date.now()}`,
        invoiceNo: values.invoiceNo,
        invoiceCode: values.invoiceCode,
        invoiceType: values.invoiceType,
        supplierId: values.supplierId,
        supplierName: mockSuppliers.find(s => s.id === values.supplierId)?.name || '',
        buyerName: '本公司',
        buyerTaxNo: '91440300MA5BBBBB',
        invoiceDate: values.invoiceDate.format('YYYY-MM-DD'),
        amount,
        taxRate,
        taxAmount,
        totalAmount,
        matchedAmount: 0,
        unmatchedAmount: totalAmount,
        payableIds: [],
        payableNos: [],
        reconciliationIds: [],
        reconciliationNos: [],
        verifyStatus: 'pending',
        matchStatus: 'pending',
        status: 'received',
        receivedAt: dayjs().format('YYYY-MM-DD'),
        remark: values.remark,
        createdAt: dayjs().format('YYYY-MM-DD'),
        updatedAt: dayjs().format('YYYY-MM-DD'),
      };
      setInvoices(prev => [newInvoice, ...prev]);
      setIsModalVisible(false);
      message.success('发票登记成功');
    });
  };

  const tabItems = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待处理' },
    { key: 'verified', label: '已验真' },
    { key: 'matched', label: '已匹配' },
    { key: 'unmatched', label: '待匹配' },
  ];

  return (
    <div className="space-y-4">
      {/* 统计卡片 */}
      <Row gutter={16}>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="发票总数"
              value={stats.totalInvoices}
              suffix="张"
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="待处理"
              value={stats.pendingCount}
              suffix="张"
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="已验真"
              value={stats.verifiedCount}
              suffix="张"
              valueStyle={{ color: '#52c41a' }}
              prefix={<SafetyCertificateOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="已匹配"
              value={stats.matchedCount}
              suffix="张"
              valueStyle={{ color: '#1890ff' }}
              prefix={<LinkOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="发票总额"
              value={stats.totalAmount}
              precision={2}
              prefix="¥"
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="税额合计"
              value={stats.totalTaxAmount}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 发票列表 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

        <div className="flex justify-between items-center mb-4">
          <Space>
            <Input
              placeholder="搜索发票号码/供应商"
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
            <Select placeholder="发票类型" style={{ width: 120 }} allowClear>
              <Select.Option value="vat_special">增值税专票</Select.Option>
              <Select.Option value="vat_normal">增值税普票</Select.Option>
              <Select.Option value="electronic">电子发票</Select.Option>
            </Select>
            <RangePicker placeholder={['开票开始', '开票结束']} />
          </Space>
          <Space>
            <Button icon={<UploadOutlined />} onClick={handleOpenBatchImport}>批量导入</Button>
            <Button icon={<ExportOutlined />}>导出</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateInvoice}>
              登记发票
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredInvoices}
          rowKey="id"
          size="small"
          scroll={{ x: 1820 }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      {/* 登记发票弹窗 */}
      <Modal
        title="登记发票"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={900}
        okText="保存"
        cancelText="取消"
      >
        <Row gutter={24}>
          {/* 左侧：上传区域 */}
          <Col span={10}>
            <div className="mb-3">
              <div className="font-medium mb-2">上传发票</div>
              <div className="text-gray-500 text-sm mb-3">
                支持电子发票(PDF/OFD)或纸质发票照片(JPG/PNG)
              </div>
            </div>

            {!uploadedFile ? (
              <Dragger
                name="invoice"
                multiple={false}
                accept=".jpg,.jpeg,.png,.pdf,.ofd"
                onChange={handleUpload}
                customRequest={customUpload}
                showUploadList={false}
                style={{ padding: '20px 0' }}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                </p>
                <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                <p className="ant-upload-hint text-gray-400">
                  支持 JPG、PNG、PDF、OFD 格式
                </p>
              </Dragger>
            ) : (
              <div className="border rounded-lg p-4">
                {/* 文件预览 */}
                <div className="mb-4">
                  {previewUrl && uploadedFile.type?.startsWith('image/') ? (
                    <Image
                      src={previewUrl}
                      alt="发票预览"
                      style={{ maxHeight: 200, objectFit: 'contain' }}
                      className="rounded"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-32 bg-gray-50 rounded">
                      {uploadedFile.type === 'application/pdf' ? (
                        <FilePdfOutlined style={{ fontSize: 48, color: '#ff4d4f' }} />
                      ) : (
                        <FileImageOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                      )}
                    </div>
                  )}
                </div>

                {/* 文件信息 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <FileTextOutlined className="mr-2 text-blue-500" />
                    <span className="text-sm truncate" style={{ maxWidth: 150 }}>
                      {uploadedFile.name}
                    </span>
                  </div>
                  <Button
                    type="link"
                    danger
                    size="small"
                    onClick={() => {
                      setUploadedFile(null);
                      setPreviewUrl('');
                      setRecognizeSuccess(false);
                    }}
                  >
                    删除
                  </Button>
                </div>

                {/* 识别按钮 */}
                {!recognizeSuccess ? (
                  <Button
                    type="primary"
                    icon={<ScanOutlined />}
                    loading={isRecognizing}
                    onClick={simulateOcrRecognition}
                    block
                  >
                    {isRecognizing ? '识别中...' : '智能识别发票信息'}
                  </Button>
                ) : (
                  <Alert
                    message="识别成功"
                    description="发票信息已自动填充到右侧表单，请核对后保存"
                    type="success"
                    showIcon
                    icon={<CheckCircleOutlined />}
                  />
                )}
              </div>
            )}

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-600 font-medium mb-2">
                <SafetyCertificateOutlined className="mr-1" />
                智能识别说明
              </div>
              <ul className="text-xs text-gray-600 space-y-1 pl-4" style={{ listStyleType: 'disc' }}>
                <li>支持增值税专用发票、普通发票、电子发票</li>
                <li>自动识别发票号码、代码、金额等关键信息</li>
                <li>识别后请核对信息准确性</li>
                <li>建议上传清晰、完整的发票图片</li>
              </ul>
            </div>
          </Col>

          {/* 右侧：表单区域 */}
          <Col span={14}>
            <div className="font-medium mb-3">发票信息</div>
            <Spin spinning={isRecognizing} tip="正在识别发票信息...">
              <Form form={form} layout="vertical">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="invoiceNo"
                      label="发票号码"
                      rules={[{ required: true, message: '请输入发票号码' }]}
                    >
                      <Input placeholder="请输入发票号码" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="invoiceCode"
                      label="发票代码"
                      rules={[{ required: true, message: '请输入发票代码' }]}
                    >
                      <Input placeholder="请输入发票代码" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="invoiceType"
                      label="发票类型"
                      rules={[{ required: true, message: '请选择发票类型' }]}
                    >
                      <Select placeholder="请选择发票类型">
                        <Select.Option value="vat_special">增值税专用发票</Select.Option>
                        <Select.Option value="vat_normal">增值税普通发票</Select.Option>
                        <Select.Option value="electronic">电子发票</Select.Option>
                        <Select.Option value="other">其他</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="supplierId"
                      label="供应商"
                      rules={[{ required: true, message: '请选择供应商' }]}
                    >
                      <Select placeholder="请选择供应商" showSearch optionFilterProp="children">
                        {mockSuppliers.filter(s => s.status === 'active').map(s => (
                          <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="invoiceDate"
                      label="开票日期"
                      rules={[{ required: true, message: '请选择开票日期' }]}
                    >
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="taxRate"
                      label="税率(%)"
                      rules={[{ required: true, message: '请输入税率' }]}
                      initialValue={13}
                    >
                      <Select placeholder="请选择税率">
                        <Select.Option value={0}>0%</Select.Option>
                        <Select.Option value={1}>1%</Select.Option>
                        <Select.Option value={3}>3%</Select.Option>
                        <Select.Option value={6}>6%</Select.Option>
                        <Select.Option value={9}>9%</Select.Option>
                        <Select.Option value={13}>13%</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="amount"
                      label="不含税金额"
                      rules={[{ required: true, message: '请输入金额' }]}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        precision={2}
                        prefix="¥"
                        placeholder="请输入不含税金额"
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        // @ts-ignore 1
                        parser={value => value?.replace(/,/g, '') as unknown as number}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="remark" label="备注">
                  <TextArea rows={2} placeholder="请输入备注信息" />
                </Form.Item>
              </Form>
            </Spin>
          </Col>
        </Row>
      </Modal>

      {/* 发票详情弹窗 */}
      <Modal
        title="发票详情"
        open={isDetailVisible}
        onCancel={() => setIsDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailVisible(false)}>关闭</Button>,
          currentInvoice?.verifyStatus === 'pending' && (
            <Button key="verify" type="primary" onClick={() => {
              handleVerify(currentInvoice.id);
              setIsDetailVisible(false);
            }}>
              验真
            </Button>
          ),
        ]}
        width={800}
      >
        {currentInvoice && (
          <div className="space-y-4">
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="发票号码">{currentInvoice.invoiceNo}</Descriptions.Item>
              <Descriptions.Item label="发票代码">{currentInvoice.invoiceCode}</Descriptions.Item>
              <Descriptions.Item label="发票类型">{getInvoiceTypeTag(currentInvoice.invoiceType)}</Descriptions.Item>
              <Descriptions.Item label="开票日期">{currentInvoice.invoiceDate}</Descriptions.Item>
              <Descriptions.Item label="销方名称">{currentInvoice.supplierName}</Descriptions.Item>
              <Descriptions.Item label="购方名称">{currentInvoice.buyerName}</Descriptions.Item>
              <Descriptions.Item label="购方税号">{currentInvoice.buyerTaxNo}</Descriptions.Item>
              <Descriptions.Item label="税率">{currentInvoice.taxRate}%</Descriptions.Item>
              <Descriptions.Item label="不含税金额">
                ¥{currentInvoice.amount.toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="税额">
                ¥{currentInvoice.taxAmount.toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="含税金额" span={2}>
                <span style={{ fontSize: 16, fontWeight: 'bold', color: '#1890ff' }}>
                  ¥{currentInvoice.totalAmount.toLocaleString()}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="已关联金额">
                <span style={{ color: (currentInvoice.matchedAmount || 0) > 0 ? '#52c41a' : '#999' }}>
                  ¥{(currentInvoice.matchedAmount || 0).toLocaleString()}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="未关联金额">
                <span style={{ color: (currentInvoice.unmatchedAmount || 0) > 0 ? '#faad14' : '#999' }}>
                  ¥{(currentInvoice.unmatchedAmount || 0).toLocaleString()}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="验真状态">{getVerifyStatusTag(currentInvoice.verifyStatus)}</Descriptions.Item>
              <Descriptions.Item label="匹配状态">{getMatchStatusTag(currentInvoice.matchStatus)}</Descriptions.Item>
              <Descriptions.Item label="收票日期">{currentInvoice.receivedAt || '-'}</Descriptions.Item>
              <Descriptions.Item label="验真日期">{currentInvoice.verifiedAt || '-'}</Descriptions.Item>
              <Descriptions.Item label="备注" span={2}>{currentInvoice.remark || '-'}</Descriptions.Item>
            </Descriptions>

            <Card title="关联单据" size="small">
              <Row gutter={16}>
                <Col span={12}>
                  <div className="font-medium mb-2">关联应付账款</div>
                  {currentInvoice.payableNos.length > 0 ? (
                    <Space wrap>
                      {currentInvoice.payableNos.map((no, index) => (
                        <Tag key={index} color="blue">{no}</Tag>
                      ))}
                    </Space>
                  ) : (
                    <span className="text-gray-400">无关联应付</span>
                  )}
                </Col>
                <Col span={12}>
                  <div className="font-medium mb-2">关联对账单</div>
                  {currentInvoice.reconciliationNos.length > 0 ? (
                    <Space wrap>
                      {currentInvoice.reconciliationNos.map((no, index) => (
                        <Tag key={index} color="green">{no}</Tag>
                      ))}
                    </Space>
                  ) : (
                    <span className="text-gray-400">无关联对账单</span>
                  )}
                </Col>
              </Row>
            </Card>
          </div>
        )}
      </Modal>

      {/* 匹配弹窗 */}
      <Modal
        title="发票匹配"
        open={isMatchVisible}
        onOk={handleMatch}
        onCancel={() => setIsMatchVisible(false)}
        width={600}
        okText="确认匹配"
        cancelText="取消"
      >
        {currentInvoice && (
          <div className="space-y-4">
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="发票号码">{currentInvoice.invoiceNo}</Descriptions.Item>
              <Descriptions.Item label="供应商">{currentInvoice.supplierName}</Descriptions.Item>
              <Descriptions.Item label="含税金额" span={2}>
                <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                  ¥{currentInvoice.totalAmount.toLocaleString()}
                </span>
              </Descriptions.Item>
            </Descriptions>

            <Form form={matchForm} layout="vertical">
              <Form.Item name="payableIds" label="关联应付账款">
                <Select mode="multiple" placeholder="选择关联的应付账款" allowClear>
                  {mockAccountPayables
                    .filter(p => p.supplierId === currentInvoice.supplierId && p.status !== 'paid' && p.status !== 'cancelled')
                    .map(p => (
                      <Select.Option key={p.id} value={p.id}>
                        {p.payableNo} - ¥{p.unpaidAmount.toLocaleString()}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>
              <Form.Item name="reconciliationIds" label="关联对账单">
                <Select mode="multiple" placeholder="选择关联的对账单" allowClear>
                  {mockReconciliationStatements
                    .filter(r => r.supplierId === currentInvoice.supplierId)
                    .map(r => (
                      <Select.Option key={r.id} value={r.id}>
                        {r.statementNo} - ¥{r.reconciliationAmount.toLocaleString()}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* 批量导入弹窗 */}
      <Modal
        title="批量导入发票"
        open={isBatchImportVisible}
        onCancel={handleCloseBatchImport}
        width={1100}
        footer={
          importStep === 0 ? [
            <Button key="cancel" onClick={handleCloseBatchImport}>取消</Button>,
            <Button 
              key="next" 
              type="primary" 
              disabled={importFileList.length === 0} 
              onClick={handleRecognizeAll}
              icon={<ScanOutlined />}
            >
              开始识别 ({importFileList.length} 个文件)
            </Button>,
          ] : importStep === 1 ? [
            <Button key="back" onClick={() => { setImportStep(0); setImportData([]); }} disabled={isRecognizingBatch}>
              上一步
            </Button>,
            <Button key="cancel" onClick={handleCloseBatchImport} disabled={isRecognizingBatch}>取消</Button>,
            <Button
              key="import"
              type="primary"
              disabled={isRecognizingBatch || importData.filter(item => item.status !== 'error').length === 0}
              onClick={handleStartImport}
            >
              确认导入
            </Button>,
          ] : importStep === 2 ? [
            <Button key="cancel" disabled>导入中...</Button>,
          ] : [
            <Button key="close" type="primary" onClick={handleCloseBatchImport}>完成</Button>,
          ]
        }
      >
        <Steps
          current={importStep}
          items={[
            { title: '上传发票', icon: <UploadOutlined /> },
            { title: '识别确认', icon: <ScanOutlined /> },
            { title: '导入中', icon: <ClockCircleOutlined /> },
            { title: '完成', icon: <CheckCircleOutlined /> },
          ]}
          className="mb-6"
        />

        {importStep === 0 && (
          <div>
            <Dragger
              name="invoiceFiles"
              multiple
              accept=".jpg,.jpeg,.png,.pdf,.ofd"
              fileList={importFileList}
              onChange={handleBatchFileUpload}
              customRequest={(options) => {
                setTimeout(() => options.onSuccess?.('ok'), 100);
              }}
              showUploadList={false}
              style={{ padding: '30px 0' }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ fontSize: 56, color: '#1890ff' }} />
              </p>
              <p className="ant-upload-text text-lg">点击或拖拽发票文件到此区域</p>
              <p className="ant-upload-hint text-gray-400">
                支持 JPG、PNG、PDF、OFD 格式，可同时上传多个文件
              </p>
            </Dragger>

            {importFileList.length > 0 && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium">已上传文件 ({importFileList.length})</span>
                  <Button 
                    type="link" 
                    danger 
                    size="small"
                    onClick={() => setImportFileList([])}
                  >
                    清空全部
                  </Button>
                </div>
                <div className="max-h-48 overflow-y-auto border rounded-lg">
                  {importFileList.map((file, index) => (
                    <div 
                      key={file.uid} 
                      className={`flex items-center justify-between p-3 ${index !== importFileList.length - 1 ? 'border-b' : ''}`}
                    >
                      <div className="flex items-center">
                        {file.type?.includes('pdf') ? (
                          <FilePdfOutlined style={{ fontSize: 20, color: '#ff4d4f', marginRight: 8 }} />
                        ) : (
                          <FileImageOutlined style={{ fontSize: 20, color: '#1890ff', marginRight: 8 }} />
                        )}
                        <div>
                          <div className="text-sm truncate" style={{ maxWidth: 300 }}>{file.name}</div>
                          <div className="text-xs text-gray-400">
                            {file.size ? `${(file.size / 1024).toFixed(1)} KB` : ''}
                          </div>
                        </div>
                      </div>
                      <Button 
                        type="link" 
                        danger 
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveFile(file.uid)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="font-medium text-blue-600 mb-2">
                <SafetyCertificateOutlined className="mr-2" />
                批量识别说明
              </div>
              <ul className="text-sm text-gray-600 space-y-1 pl-4" style={{ listStyleType: 'disc' }}>
                <li>支持增值税专用发票、普通发票、电子发票的图片或PDF</li>
                <li>系统将自动识别发票号码、代码、金额等关键信息</li>
                <li>识别完成后可预览和修正信息，确认无误后再导入</li>
                <li>建议上传清晰、完整的发票图片以提高识别准确率</li>
              </ul>
            </div>
          </div>
        )}

        {importStep === 1 && (
          <div>
            {isRecognizingBatch ? (
              <div className="py-16 text-center">
                <Spin size="large" />
                <div className="mt-4 text-gray-500">
                  正在识别发票信息，请稍候...
                </div>
                <div className="mt-2 text-gray-400 text-sm">
                  共 {importFileList.length} 个文件
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <Row gutter={16}>
                    <Col span={6}>
                      <Card size="small">
                        <Statistic title="识别文件数" value={importData.length} suffix="个" />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card size="small">
                        <Statistic
                          title="识别成功"
                          value={importData.filter(item => item.status === 'valid').length}
                          suffix="个"
                          valueStyle={{ color: '#52c41a' }}
                        />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card size="small">
                        <Statistic
                          title="需确认/失败"
                          value={importData.filter(item => item.status !== 'valid').length}
                          suffix="个"
                          valueStyle={{ color: importData.some(item => item.status === 'error') ? '#ff4d4f' : '#faad14' }}
                        />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card size="small">
                        <Statistic
                          title="可导入金额"
                          value={importData.filter(item => item.status !== 'error').reduce((sum, item) => sum + item.totalAmount, 0)}
                          precision={2}
                          prefix="¥"
                          valueStyle={{ color: '#1890ff' }}
                        />
                      </Card>
                    </Col>
                  </Row>
                </div>

                {importData.some(item => item.status === 'error') && (
                  <Alert
                    message={`有 ${importData.filter(item => item.status === 'error').length} 个文件识别失败`}
                    description="识别失败的文件将不会被导入，您可以移除后重新上传清晰的图片"
                    type="error"
                    showIcon
                    className="mb-4"
                  />
                )}

                {importData.some(item => item.status === 'warning') && !importData.some(item => item.status === 'error') && (
                  <Alert
                    message={`有 ${importData.filter(item => item.status === 'warning').length} 个文件需要确认`}
                    description="请检查标记为警告的数据是否正确"
                    type="warning"
                    showIcon
                    className="mb-4"
                  />
                )}

                <Table
                  columns={importColumns}
                  dataSource={importData}
                  rowKey="key"
                  size="small"
                  scroll={{ x: 1200, y: 280 }}
                  pagination={false}
                />
              </>
            )}
          </div>
        )}

        {importStep === 2 && (
          <div className="py-12 text-center">
            <Spin size="large" />
            <div className="mt-6 mb-4">
              <Progress percent={importProgress} status="active" />
            </div>
            <div className="text-gray-500">
              正在导入发票数据，请稍候...
            </div>
          </div>
        )}

        {importStep === 3 && importResult && (
          <Result
            status={importResult.failed > 0 ? 'warning' : 'success'}
            title={importResult.failed > 0 ? '导入完成（部分失败）' : '导入成功'}
            subTitle={
              <div>
                <p>成功导入 <span className="text-green-500 font-bold">{importResult.success}</span> 张发票</p>
                {importResult.failed > 0 && (
                  <p>失败 <span className="text-red-500 font-bold">{importResult.failed}</span> 张</p>
                )}
              </div>
            }
            extra={
              importResult.errors.length > 0 && (
                <div className="text-left mt-4 p-4 bg-red-50 rounded-lg">
                  <div className="font-medium text-red-600 mb-2">失败原因：</div>
                  <ul className="text-sm text-gray-600 space-y-1 pl-4" style={{ listStyleType: 'disc' }}>
                    {importResult.errors.map((err, index) => (
                      <li key={index}>{err}</li>
                    ))}
                  </ul>
                </div>
              )
            }
          />
        )}
      </Modal>
    </div>
  );
};

export default InvoiceManagement;
