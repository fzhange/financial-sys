'use client';

import { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Card,
  Row,
  Col,
  Typography,
  Statistic,
  Divider,
  Descriptions,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  DollarOutlined,
  WalletOutlined,
  CheckCircleOutlined,
  AccountBookOutlined,
} from '@ant-design/icons';
import { mockSuppliers, mockAccountPayables, mockPaymentRequests } from '../lib/mockData';
import type { Supplier } from '../types';

const { Title } = Typography;
const { Option } = Select;

export default function SupplierManagement() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  // 计算供应商财务统计数据
  const getSupplierFinancialStats = (supplierId: string) => {
    // 应付账款（从应付账款表获取）
    const supplierPayables = mockAccountPayables.filter(p => p.supplierId === supplierId);
    const totalPayable = supplierPayables.reduce((sum, p) => sum + p.amount, 0);
    const paidAmount = supplierPayables.reduce((sum, p) => sum + p.paidAmount, 0);
    const unpaidAmount = supplierPayables.reduce((sum, p) => sum + p.unpaidAmount, 0);
    
    // 预付账款（从请款单中获取预付类型的已付款金额）
    const advancePayments = mockPaymentRequests.filter(
      r => r.supplierId === supplierId && r.requestType === 'advance' && r.status === 'paid'
    );
    const advanceAmount = advancePayments.reduce((sum, r) => sum + r.approvedAmount, 0);
    
    return {
      totalPayable,    // 应付合计
      advanceAmount,   // 预付账款
      paidAmount,      // 已结算金额
      unpaidAmount,    // 应付余额
    };
  };

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchText.toLowerCase()) ||
      s.code.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleAdd = () => {
    setEditingSupplier(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: Supplier) => {
    setEditingSupplier(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleViewDetail = (record: Supplier) => {
    setViewingSupplier(record);
    setIsDetailModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setSuppliers(suppliers.filter((s) => s.id !== id));
    message.success('删除成功');
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingSupplier) {
        setSuppliers(
          suppliers.map((s) =>
            s.id === editingSupplier.id
              ? { ...s, ...values, updatedAt: new Date().toISOString().split('T')[0] }
              : s
          )
        );
        message.success('更新成功');
      } else {
        const newSupplier: Supplier = {
          id: Date.now().toString(),
          ...values,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
        };
        setSuppliers([...suppliers, newSupplier]);
        message.success('添加成功');
      }
      setIsModalOpen(false);
    } catch {
      // Form validation failed
    }
  };

  const columns = [
    {
      title: '供应商编码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: '供应商名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '联系人',
      dataIndex: 'contact',
      key: 'contact',
      width: 100,
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
    },
    {
      title: '开户银行',
      dataIndex: 'bankName',
      key: 'bankName',
      width: 180,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>
          {status === 'active' ? '启用' : '停用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: unknown, record: Supplier) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除该供应商吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>供应商管理</Title>

      <Card>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col flex="auto">
            <Input
              placeholder="搜索供应商名称或编码"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增供应商
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredSuppliers}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title={editingSupplier ? '编辑供应商' : '新增供应商'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        width={720}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="code"
                label="供应商编码"
                rules={[{ required: true, message: '请输入供应商编码' }]}
              >
                <Input placeholder="请输入供应商编码" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name"
                label="供应商名称"
                rules={[{ required: true, message: '请输入供应商名称' }]}
              >
                <Input placeholder="请输入供应商名称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="contact"
                label="联系人"
                rules={[{ required: true, message: '请输入联系人' }]}
              >
                <Input placeholder="请输入联系人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="联系电话"
                rules={[{ required: true, message: '请输入联系电话' }]}
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="email" label="邮箱">
                <Input placeholder="请输入邮箱" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  <Option value="active">启用</Option>
                  <Option value="inactive">停用</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="address" label="地址">
            <Input.TextArea rows={2} placeholder="请输入地址" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="bankName" label="开户银行">
                <Input placeholder="请输入开户银行" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="bankAccount" label="银行账号">
                <Input placeholder="请输入银行账号" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="taxNumber" label="税号">
            <Input placeholder="请输入税号" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 供应商详情弹窗 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AccountBookOutlined style={{ color: '#1890ff', fontSize: 20 }} />
            <span>供应商详情</span>
          </div>
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {viewingSupplier && (() => {
          const stats = getSupplierFinancialStats(viewingSupplier.id);
          return (
            <div>
              {/* 基本信息 */}
              <Descriptions 
                title="基本信息" 
                bordered 
                size="small" 
                column={2}
                style={{ marginBottom: 24 }}
              >
                <Descriptions.Item label="供应商编码">{viewingSupplier.code}</Descriptions.Item>
                <Descriptions.Item label="供应商名称">{viewingSupplier.name}</Descriptions.Item>
                <Descriptions.Item label="联系人">{viewingSupplier.contact}</Descriptions.Item>
                <Descriptions.Item label="联系电话">{viewingSupplier.phone}</Descriptions.Item>
                <Descriptions.Item label="邮箱">{viewingSupplier.email || '-'}</Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color={viewingSupplier.status === 'active' ? 'success' : 'default'}>
                    {viewingSupplier.status === 'active' ? '启用' : '停用'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="开户银行" span={2}>{viewingSupplier.bankName || '-'}</Descriptions.Item>
                <Descriptions.Item label="银行账号" span={2}>{viewingSupplier.bankAccount || '-'}</Descriptions.Item>
                <Descriptions.Item label="地址" span={2}>{viewingSupplier.address || '-'}</Descriptions.Item>
              </Descriptions>

              <Divider style={{ margin: '16px 0' }} />

              {/* 财务统计卡片 */}
              <div style={{ marginBottom: 16 }}>
                <Title level={5} style={{ marginBottom: 16 }}>
                  <DollarOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  财务往来统计
                </Title>
                <Row gutter={16}>
                  <Col span={6}>
                    <Card 
                      size="small" 
                      style={{ 
                        background: '#7da1ff',
                        borderRadius: 12,
                        border: 'none',
                        height: 100,
                      }}
                    >
                      <Statistic
                        title={<span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>应付合计</span>}
                        value={stats.totalPayable}
                        precision={2}
                        prefix={<WalletOutlined />}
                        suffix="元"
                        valueStyle={{ color: '#fff', fontSize: 20, fontWeight: 600 }}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card 
                      size="small" 
                      style={{ 
                        background: '#9de0bf',
                        borderRadius: 12,
                        border: 'none',
                        height: 100,
                      }}
                    >
                      <Statistic
                        title={<span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>预付账款</span>}
                        value={stats.advanceAmount}
                        precision={2}
                        prefix={<DollarOutlined />}
                        suffix="元"
                        valueStyle={{ color: '#fff', fontSize: 20, fontWeight: 600 }}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card 
                      size="small" 
                      style={{ 
                        background: '#ffc48a',
                        borderRadius: 12,
                        border: 'none',
                        height: 100,
                      }}
                    >
                      <Statistic
                        title={<span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>已结算金额</span>}
                        value={stats.paidAmount}
                        precision={2}
                        prefix={<CheckCircleOutlined />}
                        suffix="元"
                        valueStyle={{ color: '#fff', fontSize: 20, fontWeight: 600 }}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card 
                      size="small" 
                      style={{ 
                        background: '#c4b6ff',
                        borderRadius: 12,
                        border: 'none',
                        height: 100,
                      }}
                    >
                      <Statistic
                        title={<span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>应付余额</span>}
                        value={stats.unpaidAmount}
                        precision={2}
                        prefix={<AccountBookOutlined />}
                        suffix="元"
                        valueStyle={{ color: '#fff', fontSize: 20, fontWeight: 600 }}
                      />
                    </Card>
                  </Col>
                </Row>
              </div>

              {/* 结算进度 */}
              {stats.totalPayable > 0 && (
                <Card size="small" style={{ marginTop: 16, borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666' }}>结算进度</span>
                    <span style={{ fontWeight: 600, color: '#1890ff' }}>
                      {((stats.paidAmount / stats.totalPayable) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div 
                    style={{ 
                      marginTop: 8, 
                      height: 8, 
                      background: '#f0f0f0', 
                      borderRadius: 4,
                      overflow: 'hidden'
                    }}
                  >
                    <div 
                      style={{ 
                        width: `${(stats.paidAmount / stats.totalPayable) * 100}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #1890ff, #52c41a)',
                        borderRadius: 4,
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: '#999' }}>
                    <span>已结算: ¥{stats.paidAmount.toLocaleString()}</span>
                    <span>应付合计: ¥{stats.totalPayable.toLocaleString()}</span>
                  </div>
                </Card>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
