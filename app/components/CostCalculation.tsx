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
  Progress,
  Divider,
  Alert,
  Empty,
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
  CalculatorOutlined,
  ToolOutlined,
  AppstoreOutlined,
  DollarOutlined,
  PercentageOutlined,
  PieChartOutlined,
  EditOutlined,
  DeleteOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { 
  Material, 
  Process, 
  Product, 
  BOM, 
  BOMaterial, 
  BOMProcess, 
  CostCalculation as CostCalculationType 
} from '../types';

const { TextArea } = Input;

// 模拟物料数据
const mockMaterials: Material[] = [
  {
    id: 'mat-1',
    code: 'MAT001',
    name: '铝合金板材',
    category: '金属材料',
    specification: '1000*500*2mm',
    unit: '张',
    unitPrice: 150,
    supplierId: '1',
    supplierName: '华为技术有限公司',
    stockQuantity: 500,
    safetyStock: 100,
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: 'mat-2',
    code: 'MAT002',
    name: '不锈钢螺丝',
    category: '紧固件',
    specification: 'M6*20',
    unit: '个',
    unitPrice: 0.5,
    supplierId: '2',
    supplierName: '腾讯科技有限公司',
    stockQuantity: 10000,
    safetyStock: 2000,
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: 'mat-3',
    code: 'MAT003',
    name: '电子元件PCB板',
    category: '电子元件',
    specification: '100*80mm',
    unit: '块',
    unitPrice: 25,
    supplierId: '1',
    supplierName: '华为技术有限公司',
    stockQuantity: 1000,
    safetyStock: 200,
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: 'mat-4',
    code: 'MAT004',
    name: '塑料外壳',
    category: '塑料制品',
    specification: 'ABS 200*150*50mm',
    unit: '个',
    unitPrice: 35,
    supplierId: '3',
    supplierName: '阿里巴巴集团',
    stockQuantity: 800,
    safetyStock: 150,
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: 'mat-5',
    code: 'MAT005',
    name: '电源线',
    category: '电子元件',
    specification: '1.5m 国标',
    unit: '根',
    unitPrice: 8,
    supplierId: '2',
    supplierName: '腾讯科技有限公司',
    stockQuantity: 2000,
    safetyStock: 500,
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
];

// 模拟工序数据
const mockProcesses: Process[] = [
  {
    id: 'proc-1',
    code: 'PROC001',
    name: '切割',
    description: '使用激光切割机进行材料切割',
    laborCostPerHour: 50,
    machineCostPerHour: 80,
    defaultHours: 0.5,
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: 'proc-2',
    code: 'PROC002',
    name: '焊接',
    description: '电子元件焊接工序',
    laborCostPerHour: 60,
    machineCostPerHour: 40,
    defaultHours: 1,
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: 'proc-3',
    code: 'PROC003',
    name: '组装',
    description: '产品组装工序',
    laborCostPerHour: 45,
    machineCostPerHour: 20,
    defaultHours: 1.5,
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: 'proc-4',
    code: 'PROC004',
    name: '测试',
    description: '产品功能测试',
    laborCostPerHour: 55,
    machineCostPerHour: 100,
    defaultHours: 0.5,
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: 'proc-5',
    code: 'PROC005',
    name: '包装',
    description: '产品包装工序',
    laborCostPerHour: 35,
    machineCostPerHour: 15,
    defaultHours: 0.3,
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
];

// 模拟商品数据
const mockProducts: Product[] = [
  {
    id: 'prod-1',
    code: 'PROD001',
    name: '智能控制器A型',
    category: '电子产品',
    specification: '标准版',
    unit: '台',
    sellingPrice: 580,
    hasBom: true,
    bomId: 'bom-1',
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: 'prod-2',
    code: 'PROD002',
    name: '智能控制器B型',
    category: '电子产品',
    specification: '高配版',
    unit: '台',
    sellingPrice: 880,
    hasBom: true,
    bomId: 'bom-2',
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: 'prod-3',
    code: 'PROD003',
    name: '金属支架',
    category: '配件',
    specification: '通用型',
    unit: '个',
    sellingPrice: 120,
    hasBom: true,
    bomId: 'bom-3',
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
];

// 模拟BOM数据
const mockBOMs: BOM[] = [
  {
    id: 'bom-1',
    bomNo: 'BOM202401001',
    productId: 'prod-1',
    productCode: 'PROD001',
    productName: '智能控制器A型',
    version: 'V1.0',
    quantity: 1,
    materials: [
      {
        id: 'bm-1',
        bomId: 'bom-1',
        materialId: 'mat-3',
        materialCode: 'MAT003',
        materialName: '电子元件PCB板',
        specification: '100*80mm',
        unit: '块',
        quantity: 1,
        unitPrice: 25,
        amount: 25,
        wastageRate: 2,
        actualQuantity: 1.02,
        actualAmount: 25.5,
      },
      {
        id: 'bm-2',
        bomId: 'bom-1',
        materialId: 'mat-4',
        materialCode: 'MAT004',
        materialName: '塑料外壳',
        specification: 'ABS 200*150*50mm',
        unit: '个',
        quantity: 1,
        unitPrice: 35,
        amount: 35,
        wastageRate: 1,
        actualQuantity: 1.01,
        actualAmount: 35.35,
      },
      {
        id: 'bm-3',
        bomId: 'bom-1',
        materialId: 'mat-2',
        materialCode: 'MAT002',
        materialName: '不锈钢螺丝',
        specification: 'M6*20',
        unit: '个',
        quantity: 8,
        unitPrice: 0.5,
        amount: 4,
        wastageRate: 5,
        actualQuantity: 8.4,
        actualAmount: 4.2,
      },
      {
        id: 'bm-4',
        bomId: 'bom-1',
        materialId: 'mat-5',
        materialCode: 'MAT005',
        materialName: '电源线',
        specification: '1.5m 国标',
        unit: '根',
        quantity: 1,
        unitPrice: 8,
        amount: 8,
        wastageRate: 0,
        actualQuantity: 1,
        actualAmount: 8,
      },
    ],
    processes: [
      {
        id: 'bp-1',
        bomId: 'bom-1',
        processId: 'proc-2',
        processCode: 'PROC002',
        processName: '焊接',
        sequence: 1,
        workHours: 0.8,
        laborCostPerHour: 60,
        machineCostPerHour: 40,
        laborCost: 48,
        machineCost: 32,
        totalCost: 80,
      },
      {
        id: 'bp-2',
        bomId: 'bom-1',
        processId: 'proc-3',
        processCode: 'PROC003',
        processName: '组装',
        sequence: 2,
        workHours: 1.2,
        laborCostPerHour: 45,
        machineCostPerHour: 20,
        laborCost: 54,
        machineCost: 24,
        totalCost: 78,
      },
      {
        id: 'bp-3',
        bomId: 'bom-1',
        processId: 'proc-4',
        processCode: 'PROC004',
        processName: '测试',
        sequence: 3,
        workHours: 0.5,
        laborCostPerHour: 55,
        machineCostPerHour: 100,
        laborCost: 27.5,
        machineCost: 50,
        totalCost: 77.5,
      },
      {
        id: 'bp-4',
        bomId: 'bom-1',
        processId: 'proc-5',
        processCode: 'PROC005',
        processName: '包装',
        sequence: 4,
        workHours: 0.3,
        laborCostPerHour: 35,
        machineCostPerHour: 15,
        laborCost: 10.5,
        machineCost: 4.5,
        totalCost: 15,
      },
    ],
    materialCost: 73.05,
    laborCost: 140,
    machineCost: 110.5,
    otherCost: 20,
    totalCost: 343.55,
    status: 'active',
    effectiveDate: '2024-01-01',
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
    createdBy: '系统管理员',
  },
  {
    id: 'bom-2',
    bomNo: 'BOM202401002',
    productId: 'prod-2',
    productCode: 'PROD002',
    productName: '智能控制器B型',
    version: 'V1.0',
    quantity: 1,
    materials: [
      {
        id: 'bm-5',
        bomId: 'bom-2',
        materialId: 'mat-3',
        materialCode: 'MAT003',
        materialName: '电子元件PCB板',
        specification: '100*80mm',
        unit: '块',
        quantity: 2,
        unitPrice: 25,
        amount: 50,
        wastageRate: 2,
        actualQuantity: 2.04,
        actualAmount: 51,
      },
      {
        id: 'bm-6',
        bomId: 'bom-2',
        materialId: 'mat-4',
        materialCode: 'MAT004',
        materialName: '塑料外壳',
        specification: 'ABS 200*150*50mm',
        unit: '个',
        quantity: 1,
        unitPrice: 35,
        amount: 35,
        wastageRate: 1,
        actualQuantity: 1.01,
        actualAmount: 35.35,
      },
      {
        id: 'bm-7',
        bomId: 'bom-2',
        materialId: 'mat-1',
        materialCode: 'MAT001',
        materialName: '铝合金板材',
        specification: '1000*500*2mm',
        unit: '张',
        quantity: 0.2,
        unitPrice: 150,
        amount: 30,
        wastageRate: 5,
        actualQuantity: 0.21,
        actualAmount: 31.5,
      },
      {
        id: 'bm-8',
        bomId: 'bom-2',
        materialId: 'mat-2',
        materialCode: 'MAT002',
        materialName: '不锈钢螺丝',
        specification: 'M6*20',
        unit: '个',
        quantity: 12,
        unitPrice: 0.5,
        amount: 6,
        wastageRate: 5,
        actualQuantity: 12.6,
        actualAmount: 6.3,
      },
      {
        id: 'bm-9',
        bomId: 'bom-2',
        materialId: 'mat-5',
        materialCode: 'MAT005',
        materialName: '电源线',
        specification: '1.5m 国标',
        unit: '根',
        quantity: 1,
        unitPrice: 8,
        amount: 8,
        wastageRate: 0,
        actualQuantity: 1,
        actualAmount: 8,
      },
    ],
    processes: [
      {
        id: 'bp-5',
        bomId: 'bom-2',
        processId: 'proc-1',
        processCode: 'PROC001',
        processName: '切割',
        sequence: 1,
        workHours: 0.5,
        laborCostPerHour: 50,
        machineCostPerHour: 80,
        laborCost: 25,
        machineCost: 40,
        totalCost: 65,
      },
      {
        id: 'bp-6',
        bomId: 'bom-2',
        processId: 'proc-2',
        processCode: 'PROC002',
        processName: '焊接',
        sequence: 2,
        workHours: 1.2,
        laborCostPerHour: 60,
        machineCostPerHour: 40,
        laborCost: 72,
        machineCost: 48,
        totalCost: 120,
      },
      {
        id: 'bp-7',
        bomId: 'bom-2',
        processId: 'proc-3',
        processCode: 'PROC003',
        processName: '组装',
        sequence: 3,
        workHours: 1.8,
        laborCostPerHour: 45,
        machineCostPerHour: 20,
        laborCost: 81,
        machineCost: 36,
        totalCost: 117,
      },
      {
        id: 'bp-8',
        bomId: 'bom-2',
        processId: 'proc-4',
        processCode: 'PROC004',
        processName: '测试',
        sequence: 4,
        workHours: 0.8,
        laborCostPerHour: 55,
        machineCostPerHour: 100,
        laborCost: 44,
        machineCost: 80,
        totalCost: 124,
      },
      {
        id: 'bp-9',
        bomId: 'bom-2',
        processId: 'proc-5',
        processCode: 'PROC005',
        processName: '包装',
        sequence: 5,
        workHours: 0.3,
        laborCostPerHour: 35,
        machineCostPerHour: 15,
        laborCost: 10.5,
        machineCost: 4.5,
        totalCost: 15,
      },
    ],
    materialCost: 132.15,
    laborCost: 232.5,
    machineCost: 208.5,
    otherCost: 30,
    totalCost: 603.15,
    status: 'active',
    effectiveDate: '2024-01-01',
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
    createdBy: '系统管理员',
  },
  {
    id: 'bom-3',
    bomNo: 'BOM202401003',
    productId: 'prod-3',
    productCode: 'PROD003',
    productName: '金属支架',
    version: 'V1.0',
    quantity: 1,
    materials: [
      {
        id: 'bm-10',
        bomId: 'bom-3',
        materialId: 'mat-1',
        materialCode: 'MAT001',
        materialName: '铝合金板材',
        specification: '1000*500*2mm',
        unit: '张',
        quantity: 0.1,
        unitPrice: 150,
        amount: 15,
        wastageRate: 10,
        actualQuantity: 0.11,
        actualAmount: 16.5,
      },
      {
        id: 'bm-11',
        bomId: 'bom-3',
        materialId: 'mat-2',
        materialCode: 'MAT002',
        materialName: '不锈钢螺丝',
        specification: 'M6*20',
        unit: '个',
        quantity: 4,
        unitPrice: 0.5,
        amount: 2,
        wastageRate: 5,
        actualQuantity: 4.2,
        actualAmount: 2.1,
      },
    ],
    processes: [
      {
        id: 'bp-10',
        bomId: 'bom-3',
        processId: 'proc-1',
        processCode: 'PROC001',
        processName: '切割',
        sequence: 1,
        workHours: 0.3,
        laborCostPerHour: 50,
        machineCostPerHour: 80,
        laborCost: 15,
        machineCost: 24,
        totalCost: 39,
      },
      {
        id: 'bp-11',
        bomId: 'bom-3',
        processId: 'proc-3',
        processCode: 'PROC003',
        processName: '组装',
        sequence: 2,
        workHours: 0.5,
        laborCostPerHour: 45,
        machineCostPerHour: 20,
        laborCost: 22.5,
        machineCost: 10,
        totalCost: 32.5,
      },
    ],
    materialCost: 18.6,
    laborCost: 37.5,
    machineCost: 34,
    otherCost: 5,
    totalCost: 95.1,
    status: 'active',
    effectiveDate: '2024-01-01',
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
    createdBy: '系统管理员',
  },
];

// 模拟成本核算单数据
const initialCostCalculations: CostCalculationType[] = [
  {
    id: 'cc-1',
    calculationNo: 'CC202412001',
    productId: 'prod-1',
    productCode: 'PROD001',
    productName: '智能控制器A型',
    bomId: 'bom-1',
    bomNo: 'BOM202401001',
    bomVersion: 'V1.0',
    quantity: 100,
    materialCost: 7305,
    laborCost: 14000,
    machineCost: 11050,
    otherCost: 2000,
    totalCost: 34355,
    unitCost: 343.55,
    sellingPrice: 580,
    grossProfit: 236.45,
    grossProfitRate: 40.77,
    status: 'confirmed',
    calculatedAt: '2024-12-10',
    confirmedAt: '2024-12-10',
    confirmedBy: '财务主管',
    createdAt: '2024-12-10',
    updatedAt: '2024-12-10',
    createdBy: '张会计',
  },
  {
    id: 'cc-2',
    calculationNo: 'CC202412002',
    productId: 'prod-2',
    productCode: 'PROD002',
    productName: '智能控制器B型',
    bomId: 'bom-2',
    bomNo: 'BOM202401002',
    bomVersion: 'V1.0',
    quantity: 50,
    materialCost: 6607.5,
    laborCost: 11625,
    machineCost: 10425,
    otherCost: 1500,
    totalCost: 30157.5,
    unitCost: 603.15,
    sellingPrice: 880,
    grossProfit: 276.85,
    grossProfitRate: 31.46,
    status: 'confirmed',
    calculatedAt: '2024-12-12',
    confirmedAt: '2024-12-12',
    confirmedBy: '财务主管',
    createdAt: '2024-12-12',
    updatedAt: '2024-12-12',
    createdBy: '王会计',
  },
  {
    id: 'cc-3',
    calculationNo: 'CC202412003',
    productId: 'prod-3',
    productCode: 'PROD003',
    productName: '金属支架',
    bomId: 'bom-3',
    bomNo: 'BOM202401003',
    bomVersion: 'V1.0',
    quantity: 200,
    materialCost: 3720,
    laborCost: 7500,
    machineCost: 6800,
    otherCost: 1000,
    totalCost: 19020,
    unitCost: 95.1,
    sellingPrice: 120,
    grossProfit: 24.9,
    grossProfitRate: 20.75,
    status: 'draft',
    calculatedAt: '2024-12-14',
    createdAt: '2024-12-14',
    updatedAt: '2024-12-14',
    createdBy: '张会计',
  },
];

const CostCalculation: React.FC = () => {
  const [calculations, setCalculations] = useState<CostCalculationType[]>(initialCostCalculations);
  const [boms] = useState<BOM[]>(mockBOMs);
  const [products] = useState<Product[]>(mockProducts);
  const [materials] = useState<Material[]>(mockMaterials);
  const [processes] = useState<Process[]>(mockProcesses);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [isBomDetailVisible, setIsBomDetailVisible] = useState(false);
  const [currentCalculation, setCurrentCalculation] = useState<CostCalculationType | null>(null);
  const [currentBom, setCurrentBom] = useState<BOM | null>(null);
  const [activeTab, setActiveTab] = useState('calculations');
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  
  // 核算预览数据
  const [previewData, setPreviewData] = useState<{
    materialCost: number;
    laborCost: number;
    machineCost: number;
    otherCost: number;
    totalCost: number;
    unitCost: number;
    grossProfit: number;
    grossProfitRate: number;
  } | null>(null);

  // 统计数据
  const stats = {
    totalCalculations: calculations.length,
    confirmedCount: calculations.filter(c => c.status === 'confirmed').length,
    draftCount: calculations.filter(c => c.status === 'draft').length,
    avgMaterialCostRate: calculations.length > 0 
      ? calculations.reduce((sum, c) => sum + (c.materialCost / c.totalCost * 100), 0) / calculations.length 
      : 0,
    avgLaborCostRate: calculations.length > 0 
      ? calculations.reduce((sum, c) => sum + (c.laborCost / c.totalCost * 100), 0) / calculations.length 
      : 0,
    avgGrossProfitRate: calculations.length > 0 
      ? calculations.reduce((sum, c) => sum + c.grossProfitRate, 0) / calculations.length 
      : 0,
  };

  // 状态标签
  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      draft: { color: 'orange', text: '草稿' },
      confirmed: { color: 'green', text: '已确认' },
      cancelled: { color: 'default', text: '已取消' },
      active: { color: 'green', text: '生效中' },
      inactive: { color: 'default', text: '已失效' },
    };
    const config = statusMap[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 筛选数据
  const getFilteredCalculations = () => {
    if (!searchText) return calculations;
    return calculations.filter(c =>
      c.calculationNo.toLowerCase().includes(searchText.toLowerCase()) ||
      c.productName.toLowerCase().includes(searchText.toLowerCase()) ||
      c.productCode.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  // 新建成本核算
  const handleCreateCalculation = () => {
    form.resetFields();
    setPreviewData(null);
    setIsModalVisible(true);
  };

  // 查看详情
  const handleViewDetail = (calculation: CostCalculationType) => {
    setCurrentCalculation(calculation);
    setIsDetailVisible(true);
  };

  // 查看BOM详情
  const handleViewBomDetail = (bomId: string) => {
    const bom = boms.find(b => b.id === bomId);
    if (bom) {
      setCurrentBom(bom);
      setIsBomDetailVisible(true);
    }
  };

  // 选择商品后加载BOM并计算成本
  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product && product.bomId) {
      const bom = boms.find(b => b.id === product.bomId);
      if (bom) {
        form.setFieldsValue({
          bomId: bom.id,
          bomNo: bom.bomNo,
          bomVersion: bom.version,
          sellingPrice: product.sellingPrice,
        });
        
        // 计算成本预览
        const quantity = form.getFieldValue('quantity') || 1;
        calculateCostPreview(bom, quantity, product.sellingPrice, form.getFieldValue('otherCost') || 0);
      }
    }
  };

  // 计算成本预览
  const calculateCostPreview = (bom: BOM, quantity: number, sellingPrice: number, otherCost: number) => {
    const materialCost = bom.materialCost * quantity;
    const laborCost = bom.laborCost * quantity;
    const machineCost = bom.machineCost * quantity;
    const totalOtherCost = otherCost * quantity;
    const totalCost = materialCost + laborCost + machineCost + totalOtherCost;
    const unitCost = totalCost / quantity;
    const grossProfit = sellingPrice - unitCost;
    const grossProfitRate = (grossProfit / sellingPrice) * 100;

    setPreviewData({
      materialCost,
      laborCost,
      machineCost,
      otherCost: totalOtherCost,
      totalCost,
      unitCost,
      grossProfit,
      grossProfitRate,
    });
  };

  // 数量或其他费用变化时重新计算
  const handleQuantityOrCostChange = () => {
    const productId = form.getFieldValue('productId');
    const quantity = form.getFieldValue('quantity') || 1;
    const otherCost = form.getFieldValue('otherCost') || 0;
    const sellingPrice = form.getFieldValue('sellingPrice') || 0;
    
    const product = products.find(p => p.id === productId);
    if (product && product.bomId) {
      const bom = boms.find(b => b.id === product.bomId);
      if (bom) {
        calculateCostPreview(bom, quantity, sellingPrice, otherCost);
      }
    }
  };

  // 保存核算单
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (!previewData) {
        message.error('请先选择商品进行成本计算');
        return;
      }

      const product = products.find(p => p.id === values.productId);
      const bom = boms.find(b => b.id === values.bomId);
      
      if (!product || !bom) {
        message.error('商品或BOM数据异常');
        return;
      }

      const newCalculation: CostCalculationType = {
        id: `cc-${Date.now()}`,
        calculationNo: `CC${dayjs().format('YYYYMMDD')}${String(calculations.length + 1).padStart(3, '0')}`,
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        bomId: bom.id,
        bomNo: bom.bomNo,
        bomVersion: bom.version,
        quantity: values.quantity,
        materialCost: previewData.materialCost,
        laborCost: previewData.laborCost,
        machineCost: previewData.machineCost,
        otherCost: previewData.otherCost,
        totalCost: previewData.totalCost,
        unitCost: previewData.unitCost,
        sellingPrice: values.sellingPrice,
        grossProfit: previewData.grossProfit,
        grossProfitRate: previewData.grossProfitRate,
        status: 'draft',
        calculatedAt: dayjs().format('YYYY-MM-DD'),
        remark: values.remark,
        createdAt: dayjs().format('YYYY-MM-DD'),
        updatedAt: dayjs().format('YYYY-MM-DD'),
        createdBy: '当前用户',
      };

      setCalculations([newCalculation, ...calculations]);
      setIsModalVisible(false);
      message.success('成本核算单创建成功');
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  // 确认核算单
  const handleConfirmCalculation = (calculation: CostCalculationType) => {
    const updatedCalculations = calculations.map(c =>
      c.id === calculation.id
        ? {
            ...c,
            status: 'confirmed' as const,
            confirmedAt: dayjs().format('YYYY-MM-DD'),
            confirmedBy: '当前用户',
            updatedAt: dayjs().format('YYYY-MM-DD'),
          }
        : c
    );
    setCalculations(updatedCalculations);
    message.success('成本核算单已确认');
  };

  // 成本核算单表格列
  const calculationColumns: ColumnsType<CostCalculationType> = [
    {
      title: '核算单号',
      dataIndex: 'calculationNo',
      key: 'calculationNo',
      width: 140,
      render: (text, record) => (
        <a onClick={() => handleViewDetail(record)}>{text}</a>
      ),
    },
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
      ellipsis: true,
    },
    {
      title: '核算数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 90,
      align: 'right',
    },
    {
      title: '材料费用',
      dataIndex: 'materialCost',
      key: 'materialCost',
      width: 110,
      align: 'right',
      render: (amount: number) => `¥${amount.toLocaleString()}`,
    },
    {
      title: '人工费用',
      dataIndex: 'laborCost',
      key: 'laborCost',
      width: 110,
      align: 'right',
      render: (amount: number) => `¥${amount.toLocaleString()}`,
    },
    {
      title: '总成本',
      dataIndex: 'totalCost',
      key: 'totalCost',
      width: 120,
      align: 'right',
      render: (amount: number) => (
        <span style={{ color: '#f5222d', fontWeight: 500 }}>
          ¥{amount.toLocaleString()}
        </span>
      ),
    },
    {
      title: '单位成本',
      dataIndex: 'unitCost',
      key: 'unitCost',
      width: 100,
      align: 'right',
      render: (amount: number) => `¥${amount.toFixed(2)}`,
    },
    {
      title: '毛利率',
      dataIndex: 'grossProfitRate',
      key: 'grossProfitRate',
      width: 100,
      render: (rate: number) => (
        <span style={{ color: rate >= 30 ? '#52c41a' : rate >= 20 ? '#faad14' : '#f5222d' }}>
          {rate.toFixed(2)}%
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => getStatusTag(status),
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
          <Tooltip title="查看BOM">
            <Button
              type="link"
              size="small"
              icon={<AppstoreOutlined />}
              onClick={() => handleViewBomDetail(record.bomId)}
            />
          </Tooltip>
          {record.status === 'draft' && (
            <Popconfirm
              title="确定确认该核算单吗？"
              onConfirm={() => handleConfirmCalculation(record)}
              okText="确定"
              cancelText="取消"
            >
              <Tooltip title="确认">
                <Button
                  type="link"
                  size="small"
                  icon={<CheckOutlined />}
                  style={{ color: '#52c41a' }}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  // BOM表格列
  const bomColumns: ColumnsType<BOM> = [
    {
      title: 'BOM编号',
      dataIndex: 'bomNo',
      key: 'bomNo',
      width: 140,
      render: (text, record) => (
        <a onClick={() => handleViewBomDetail(record.id)}>{text}</a>
      ),
    },
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
      ellipsis: true,
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: 80,
    },
    {
      title: '材料费用',
      dataIndex: 'materialCost',
      key: 'materialCost',
      width: 110,
      align: 'right',
      render: (amount: number) => `¥${amount.toFixed(2)}`,
    },
    {
      title: '人工费用',
      dataIndex: 'laborCost',
      key: 'laborCost',
      width: 110,
      align: 'right',
      render: (amount: number) => `¥${amount.toFixed(2)}`,
    },
    {
      title: '机器费用',
      dataIndex: 'machineCost',
      key: 'machineCost',
      width: 110,
      align: 'right',
      render: (amount: number) => `¥${amount.toFixed(2)}`,
    },
    {
      title: '总成本',
      dataIndex: 'totalCost',
      key: 'totalCost',
      width: 110,
      align: 'right',
      render: (amount: number) => (
        <span style={{ color: '#f5222d', fontWeight: 500 }}>
          ¥{amount.toFixed(2)}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewBomDetail(record.id)}
        >
          详情
        </Button>
      ),
    },
  ];

  // Tab项
  const tabItems = [
    {
      key: 'calculations',
      label: (
        <Space>
          <CalculatorOutlined />
          成本核算单
        </Space>
      ),
    },
    {
      key: 'bom',
      label: (
        <Space>
          <AppstoreOutlined />
          BOM管理
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* 统计卡片 */}
      <Row gutter={16}>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="核算单总数"
              value={stats.totalCalculations}
              prefix={<FileTextOutlined />}
              suffix="笔"
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="已确认"
              value={stats.confirmedCount}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckOutlined />}
              suffix="笔"
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="草稿"
              value={stats.draftCount}
              valueStyle={{ color: '#faad14' }}
              prefix={<EditOutlined />}
              suffix="笔"
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="平均材料占比"
              value={stats.avgMaterialCostRate}
              valueStyle={{ color: '#1890ff' }}
              prefix={<PercentageOutlined />}
              precision={1}
              suffix="%"
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="平均人工占比"
              value={stats.avgLaborCostRate}
              valueStyle={{ color: '#722ed1' }}
              prefix={<PercentageOutlined />}
              precision={1}
              suffix="%"
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="平均毛利率"
              value={stats.avgGrossProfitRate}
              valueStyle={{ color: stats.avgGrossProfitRate >= 30 ? '#52c41a' : '#faad14' }}
              prefix={<PieChartOutlined />}
              precision={1}
              suffix="%"
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
              placeholder="搜索核算单号/商品"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 220 }}
              allowClear
            />
          </Space>
          <Space>
            <Button icon={<ExportOutlined />}>导出</Button>
            <Button type="primary" icon={<CalculatorOutlined />} onClick={handleCreateCalculation}>
              新建成本核算
            </Button>
          </Space>
        </div>

        {/* Tab和表格 */}
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
        
        {activeTab === 'calculations' && (
          <Table
            columns={calculationColumns}
            dataSource={getFilteredCalculations()}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
            scroll={{ x: 1400 }}
          />
        )}

        {activeTab === 'bom' && (
          <Table
            columns={bomColumns}
            dataSource={boms}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
            scroll={{ x: 1200 }}
          />
        )}
      </Card>

      {/* 新建成本核算弹窗 */}
      <Modal
        title="新建成本核算"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={900}
        okText="保存"
        cancelText="取消"
      >
        <div className="space-y-4">
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="productId"
                  label="选择商品"
                  rules={[{ required: true, message: '请选择商品' }]}
                >
                  <Select
                    placeholder="请选择商品"
                    showSearch
                    optionFilterProp="children"
                    onChange={handleProductChange}
                  >
                    {products.filter(p => p.hasBom && p.status === 'active').map(p => (
                      <Select.Option key={p.id} value={p.id}>
                        {p.code} - {p.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="quantity"
                  label="核算数量"
                  rules={[{ required: true, message: '请输入数量' }]}
                  initialValue={1}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={1}
                    precision={0}
                    onChange={handleQuantityOrCostChange}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="otherCost"
                  label="其他费用/件"
                  initialValue={0}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    precision={2}
                    prefix="¥"
                    onChange={handleQuantityOrCostChange}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="bomNo" label="BOM编号">
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="bomVersion" label="BOM版本">
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="sellingPrice"
                  label="销售价格"
                  rules={[{ required: true, message: '请输入销售价格' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    precision={2}
                    prefix="¥"
                    onChange={handleQuantityOrCostChange}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="remark" label="备注">
              <TextArea rows={2} placeholder="请输入备注信息" />
            </Form.Item>
          </Form>

          {/* 成本预览 */}
          {previewData && (
            <Card title="成本核算预览" size="small">
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic
                    title="材料费用"
                    value={previewData.materialCost}
                    prefix="¥"
                    precision={2}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="人工费用"
                    value={previewData.laborCost}
                    prefix="¥"
                    precision={2}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="机器费用"
                    value={previewData.machineCost}
                    prefix="¥"
                    precision={2}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="其他费用"
                    value={previewData.otherCost}
                    prefix="¥"
                    precision={2}
                  />
                </Col>
              </Row>
              <Divider />
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic
                    title="总成本"
                    value={previewData.totalCost}
                    valueStyle={{ color: '#f5222d' }}
                    prefix="¥"
                    precision={2}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="单位成本"
                    value={previewData.unitCost}
                    valueStyle={{ color: '#1890ff' }}
                    prefix="¥"
                    precision={2}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="单位毛利"
                    value={previewData.grossProfit}
                    valueStyle={{ color: previewData.grossProfit >= 0 ? '#52c41a' : '#f5222d' }}
                    prefix="¥"
                    precision={2}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="毛利率"
                    value={previewData.grossProfitRate}
                    valueStyle={{ color: previewData.grossProfitRate >= 30 ? '#52c41a' : previewData.grossProfitRate >= 20 ? '#faad14' : '#f5222d' }}
                    precision={2}
                    suffix="%"
                  />
                </Col>
              </Row>
              <Divider />
              <div className="flex items-center gap-4">
                <span>成本构成：</span>
                <div className="flex-1">
                  <Progress
                    percent={100}
                    success={{ percent: (previewData.materialCost / previewData.totalCost) * 100, strokeColor: '#1890ff' }}
                    strokeColor="#52c41a"
                    trailColor="#faad14"
                    showInfo={false}
                  />
                  <div className="flex justify-between text-xs mt-1">
                    <span style={{ color: '#1890ff' }}>
                      材料 {((previewData.materialCost / previewData.totalCost) * 100).toFixed(1)}%
                    </span>
                    <span style={{ color: '#52c41a' }}>
                      人工 {((previewData.laborCost / previewData.totalCost) * 100).toFixed(1)}%
                    </span>
                    <span style={{ color: '#722ed1' }}>
                      机器 {((previewData.machineCost / previewData.totalCost) * 100).toFixed(1)}%
                    </span>
                    <span style={{ color: '#faad14' }}>
                      其他 {((previewData.otherCost / previewData.totalCost) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </Modal>

      {/* 成本核算详情弹窗 */}
      <Modal
        title="成本核算详情"
        open={isDetailVisible}
        onCancel={() => setIsDetailVisible(false)}
        footer={[
          <Button key="print" icon={<PrinterOutlined />}>打印</Button>,
          <Button key="close" onClick={() => setIsDetailVisible(false)}>关闭</Button>,
        ]}
        width={900}
      >
        {currentCalculation && (
          <div className="space-y-4">
            <Descriptions title="基本信息" bordered column={3} size="small">
              <Descriptions.Item label="核算单号">{currentCalculation.calculationNo}</Descriptions.Item>
              <Descriptions.Item label="状态">{getStatusTag(currentCalculation.status)}</Descriptions.Item>
              <Descriptions.Item label="核算时间">{currentCalculation.calculatedAt}</Descriptions.Item>
              <Descriptions.Item label="商品编码">{currentCalculation.productCode}</Descriptions.Item>
              <Descriptions.Item label="商品名称">{currentCalculation.productName}</Descriptions.Item>
              <Descriptions.Item label="核算数量">{currentCalculation.quantity}</Descriptions.Item>
              <Descriptions.Item label="BOM编号">
                <a onClick={() => handleViewBomDetail(currentCalculation.bomId)}>
                  {currentCalculation.bomNo}
                </a>
              </Descriptions.Item>
              <Descriptions.Item label="BOM版本">{currentCalculation.bomVersion}</Descriptions.Item>
              <Descriptions.Item label="创建人">{currentCalculation.createdBy}</Descriptions.Item>
            </Descriptions>

            <Card title="成本明细" size="small">
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic
                    title="材料费用"
                    value={currentCalculation.materialCost}
                    prefix="¥"
                    precision={2}
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    占比 {((currentCalculation.materialCost / currentCalculation.totalCost) * 100).toFixed(1)}%
                  </div>
                </Col>
                <Col span={6}>
                  <Statistic
                    title="人工费用"
                    value={currentCalculation.laborCost}
                    prefix="¥"
                    precision={2}
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    占比 {((currentCalculation.laborCost / currentCalculation.totalCost) * 100).toFixed(1)}%
                  </div>
                </Col>
                <Col span={6}>
                  <Statistic
                    title="机器费用"
                    value={currentCalculation.machineCost}
                    prefix="¥"
                    precision={2}
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    占比 {((currentCalculation.machineCost / currentCalculation.totalCost) * 100).toFixed(1)}%
                  </div>
                </Col>
                <Col span={6}>
                  <Statistic
                    title="其他费用"
                    value={currentCalculation.otherCost}
                    prefix="¥"
                    precision={2}
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    占比 {((currentCalculation.otherCost / currentCalculation.totalCost) * 100).toFixed(1)}%
                  </div>
                </Col>
              </Row>
              <Divider />
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic
                    title="总成本"
                    value={currentCalculation.totalCost}
                    valueStyle={{ color: '#f5222d', fontWeight: 600 }}
                    prefix="¥"
                    precision={2}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="单位成本"
                    value={currentCalculation.unitCost}
                    valueStyle={{ color: '#1890ff' }}
                    prefix="¥"
                    precision={2}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="销售价格"
                    value={currentCalculation.sellingPrice}
                    prefix="¥"
                    precision={2}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="单位毛利"
                    value={currentCalculation.grossProfit}
                    valueStyle={{ color: currentCalculation.grossProfit >= 0 ? '#52c41a' : '#f5222d' }}
                    prefix="¥"
                    precision={2}
                  />
                </Col>
              </Row>
              <Divider />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>毛利率：</span>
                  <span 
                    style={{ 
                      fontSize: 24, 
                      fontWeight: 600,
                      color: currentCalculation.grossProfitRate >= 30 ? '#52c41a' : currentCalculation.grossProfitRate >= 20 ? '#faad14' : '#f5222d'
                    }}
                  >
                    {currentCalculation.grossProfitRate.toFixed(2)}%
                  </span>
                </div>
                <Progress
                  type="circle"
                  percent={currentCalculation.grossProfitRate}
                  size={80}
                  strokeColor={currentCalculation.grossProfitRate >= 30 ? '#52c41a' : currentCalculation.grossProfitRate >= 20 ? '#faad14' : '#f5222d'}
                  format={(percent) => `${percent?.toFixed(1)}%`}
                />
              </div>
            </Card>

            {currentCalculation.remark && (
              <Descriptions bordered size="small">
                <Descriptions.Item label="备注">{currentCalculation.remark}</Descriptions.Item>
              </Descriptions>
            )}
          </div>
        )}
      </Modal>

      {/* BOM详情弹窗 */}
      <Modal
        title="BOM详情"
        open={isBomDetailVisible}
        onCancel={() => setIsBomDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsBomDetailVisible(false)}>关闭</Button>,
        ]}
        width={1000}
      >
        {currentBom && (
          <div className="space-y-4">
            <Descriptions title="BOM基本信息" bordered column={3} size="small">
              <Descriptions.Item label="BOM编号">{currentBom.bomNo}</Descriptions.Item>
              <Descriptions.Item label="版本">{currentBom.version}</Descriptions.Item>
              <Descriptions.Item label="状态">{getStatusTag(currentBom.status)}</Descriptions.Item>
              <Descriptions.Item label="商品编码">{currentBom.productCode}</Descriptions.Item>
              <Descriptions.Item label="商品名称">{currentBom.productName}</Descriptions.Item>
              <Descriptions.Item label="生效日期">{currentBom.effectiveDate}</Descriptions.Item>
            </Descriptions>

            <Card title="物料清单" size="small" extra={<Tag color="blue">{currentBom.materials.length}项</Tag>}>
              <Table
                columns={[
                  { title: '物料编码', dataIndex: 'materialCode', key: 'materialCode', width: 100 },
                  { title: '物料名称', dataIndex: 'materialName', key: 'materialName', width: 150 },
                  { title: '规格', dataIndex: 'specification', key: 'specification', width: 120 },
                  { title: '单位', dataIndex: 'unit', key: 'unit', width: 60 },
                  { title: '用量', dataIndex: 'quantity', key: 'quantity', width: 80, align: 'right' },
                  { title: '单价', dataIndex: 'unitPrice', key: 'unitPrice', width: 80, align: 'right', render: (v: number) => `¥${v}` },
                  { title: '损耗率', dataIndex: 'wastageRate', key: 'wastageRate', width: 80, align: 'right', render: (v: number) => `${v}%` },
                  { title: '实际用量', dataIndex: 'actualQuantity', key: 'actualQuantity', width: 90, align: 'right' },
                  { 
                    title: '金额', 
                    dataIndex: 'actualAmount', 
                    key: 'actualAmount', 
                    width: 100, 
                    align: 'right',
                    render: (v: number) => <span style={{ color: '#f5222d' }}>¥{v.toFixed(2)}</span>
                  },
                ]}
                dataSource={currentBom.materials}
                rowKey="id"
                size="small"
                pagination={false}
                summary={() => (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={8}><strong>材料费用合计</strong></Table.Summary.Cell>
                    <Table.Summary.Cell index={8} align="right">
                      <strong style={{ color: '#f5222d' }}>¥{currentBom.materialCost.toFixed(2)}</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
              />
            </Card>

            <Card title="工序清单" size="small" extra={<Tag color="green">{currentBom.processes.length}道工序</Tag>}>
              <Table
                columns={[
                  { title: '序号', dataIndex: 'sequence', key: 'sequence', width: 60 },
                  { title: '工序编码', dataIndex: 'processCode', key: 'processCode', width: 100 },
                  { title: '工序名称', dataIndex: 'processName', key: 'processName', width: 120 },
                  { title: '工时(h)', dataIndex: 'workHours', key: 'workHours', width: 80, align: 'right' },
                  { title: '人工成本/h', dataIndex: 'laborCostPerHour', key: 'laborCostPerHour', width: 100, align: 'right', render: (v: number) => `¥${v}` },
                  { title: '机器成本/h', dataIndex: 'machineCostPerHour', key: 'machineCostPerHour', width: 100, align: 'right', render: (v: number) => `¥${v}` },
                  { title: '人工费用', dataIndex: 'laborCost', key: 'laborCost', width: 90, align: 'right', render: (v: number) => `¥${v.toFixed(2)}` },
                  { title: '机器费用', dataIndex: 'machineCost', key: 'machineCost', width: 90, align: 'right', render: (v: number) => `¥${v.toFixed(2)}` },
                  { 
                    title: '工序成本', 
                    dataIndex: 'totalCost', 
                    key: 'totalCost', 
                    width: 100, 
                    align: 'right',
                    render: (v: number) => <span style={{ color: '#f5222d' }}>¥{v.toFixed(2)}</span>
                  },
                ]}
                dataSource={currentBom.processes}
                rowKey="id"
                size="small"
                pagination={false}
                summary={() => (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={6}><strong>工费合计</strong></Table.Summary.Cell>
                    <Table.Summary.Cell index={6} align="right">
                      <strong style={{ color: '#52c41a' }}>¥{currentBom.laborCost.toFixed(2)}</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={7} align="right">
                      <strong style={{ color: '#722ed1' }}>¥{currentBom.machineCost.toFixed(2)}</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={8} align="right">
                      <strong style={{ color: '#f5222d' }}>¥{(currentBom.laborCost + currentBom.machineCost).toFixed(2)}</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
              />
            </Card>

            <Card title="成本汇总" size="small">
              <Row gutter={16}>
                <Col span={5}>
                  <Statistic title="材料费用" value={currentBom.materialCost} prefix="¥" precision={2} />
                </Col>
                <Col span={5}>
                  <Statistic title="人工费用" value={currentBom.laborCost} prefix="¥" precision={2} />
                </Col>
                <Col span={5}>
                  <Statistic title="机器费用" value={currentBom.machineCost} prefix="¥" precision={2} />
                </Col>
                <Col span={4}>
                  <Statistic title="其他费用" value={currentBom.otherCost} prefix="¥" precision={2} />
                </Col>
                <Col span={5}>
                  <Statistic 
                    title="单件总成本" 
                    value={currentBom.totalCost} 
                    valueStyle={{ color: '#f5222d', fontWeight: 600 }}
                    prefix="¥" 
                    precision={2} 
                  />
                </Col>
              </Row>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CostCalculation;
