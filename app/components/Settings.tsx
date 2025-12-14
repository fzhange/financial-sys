'use client';

import React from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Row,
  Col,
  Typography,
  Divider,
  message,
  InputNumber,
} from 'antd';
import { SaveOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

export default function Settings() {
  const [form] = Form.useForm();

  const handleSave = () => {
    message.success('设置保存成功');
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>系统设置</Title>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card title="对账设置">
            <Form form={form} layout="vertical" initialValues={{
              autoPeriod: 'monthly',
              reminderDays: 3,
              autoMatch: true,
              toleranceAmount: 0.01,
              requireApproval: true,
            }}>
              <Form.Item
                name="autoPeriod"
                label="默认对账周期"
              >
                <Select>
                  <Option value="weekly">每周</Option>
                  <Option value="biweekly">每两周</Option>
                  <Option value="monthly">每月</Option>
                  <Option value="quarterly">每季度</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="reminderDays"
                label="对账提醒天数"
                extra="在对账截止日期前多少天发送提醒"
              >
                <InputNumber min={1} max={30} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name="toleranceAmount"
                label="差异容忍金额"
                extra="小于此金额的差异将自动忽略"
              >
                <InputNumber
                  min={0}
                  step={0.01}
                  style={{ width: '100%' }}
                  formatter={(value) => `¥ ${value}`}
                  parser={(value) => value?.replace(/¥\s?/g, '') as unknown as number}
                />
              </Form.Item>

              <Form.Item
                name="autoMatch"
                label="自动匹配"
                valuePropName="checked"
              >
                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
              </Form.Item>

              <Form.Item
                name="requireApproval"
                label="需要审批确认"
                valuePropName="checked"
              >
                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="通知设置">
            <Form layout="vertical" initialValues={{
              emailNotify: true,
              smsNotify: false,
              notifyEmail: 'finance@company.com',
            }}>
              <Form.Item
                name="emailNotify"
                label="邮件通知"
                valuePropName="checked"
              >
                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
              </Form.Item>

              <Form.Item
                name="notifyEmail"
                label="通知邮箱"
              >
                <Input placeholder="请输入通知邮箱" />
              </Form.Item>

              <Form.Item
                name="smsNotify"
                label="短信通知"
                valuePropName="checked"
              >
                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
              </Form.Item>
            </Form>
          </Card>

          <Card title="数据设置" style={{ marginTop: 16 }}>
            <Form layout="vertical" initialValues={{
              retentionPeriod: 36,
              exportFormat: 'xlsx',
            }}>
              <Form.Item
                name="retentionPeriod"
                label="数据保留期限（月）"
              >
                <InputNumber min={12} max={120} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name="exportFormat"
                label="默认导出格式"
              >
                <Select>
                  <Option value="xlsx">Excel (.xlsx)</Option>
                  <Option value="csv">CSV (.csv)</Option>
                  <Option value="pdf">PDF (.pdf)</Option>
                </Select>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      <Divider />

      <div style={{ textAlign: 'right' }}>
        <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
          保存设置
        </Button>
      </div>
    </div>
  );
}
