// 供应商类型
export interface Supplier {
  id: string;
  code: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  bankAccount: string;
  bankName: string;
  taxNumber: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// 采购订单类型
export interface PurchaseOrder {
  id: string;
  orderNo: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  totalAmount: number;
  paidAmount: number;
  status: 'pending' | 'partial' | 'paid' | 'cancelled';
  items: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

// 对账单类型
export interface ReconciliationStatement {
  id: string;
  statementNo: string;
  supplierId: string;
  supplierName: string;
  periodStart: string;
  periodEnd: string;
  reconciliationQuantity: number;  // 对账数量（入库单数）
  reconciliationAmount: number;    // 对账金额
  confirmedAmount: number;         // 确认金额
  status: 'draft' | 'pending' | 'confirmed' | 'disputed' | 'resolved';
  receipts: ReconciliationReceiptItem[];  // 关联的入库单
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  confirmedBy?: string;
}

// 对账单关联的入库单
export interface ReconciliationReceiptItem {
  id: string;
  receiptId: string;
  receiptNo: string;
  receiptDate: string;
  purchaseOrderNo?: string;
  skuCount: number;           // 入库SKU数
  receiptQuantity: number;    // 入库数量
  goodQuantity: number;       // 良品数量
  defectQuantity: number;     // 次品数量
  category: string;           // 品种
  hasTax: boolean;            // 是否含税
  receiptAmount: number;      // 入库金额
  payableAmount: number;      // 应付金额
  reconciliationStatus: 'pending' | 'matched' | 'unmatched';  // 对账状态
}

// 对账明细项
export interface ReconciliationItem {
  id: string;
  date: string;
  documentNo: string;
  documentType: 'purchase' | 'payment' | 'return' | 'adjustment';
  description: string;
  ourAmount: number;         // 我方金额
  supplierAmount: number;    // 供应商金额
  difference: number;        // 差异
  status: 'matched' | 'unmatched' | 'adjusted';
  remark?: string;
}

// 差异记录
export interface DifferenceRecord {
  id: string;
  reconciliationId: string;
  itemId: string;
  differenceAmount: number;
  reason: string;
  resolution: string;
  status: 'pending' | 'investigating' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

// 对账历史
export interface ReconciliationHistory {
  id: string;
  reconciliationId: string;
  action: 'created' | 'submitted' | 'confirmed' | 'disputed' | 'resolved' | 'adjusted';
  operator: string;
  remark: string;
  createdAt: string;
}

// 统计数据
export interface ReconciliationStats {
  totalStatements: number;
  pendingCount: number;
  confirmedCount: number;
  disputedCount: number;
  totalDifference: number;
}

// 采购入库单
export interface PurchaseReceipt {
  id: string;
  receiptNo: string;
  purchaseOrderId?: string;
  purchaseOrderNo?: string;
  supplierId: string;
  supplierName: string;
  receiptDate: string;
  warehouseId: string;
  warehouseName: string;
  skuCount: number;           // 入库SKU数
  totalQuantity: number;      // 入库数量
  goodQuantity: number;       // 良品数量
  defectQuantity: number;     // 次品数量
  totalAmount: number;        // 入库金额
  payableAmount: number;      // 应付金额
  reconciliationStatus: 'pending' | 'matched' | 'unmatched';  // 对账状态
  reconciliationId?: string;  // 关联的对账单ID
  status: 'pending' | 'reconciled' | 'cancelled';
  items: PurchaseReceiptItem[];
  createdAt: string;
  updatedAt: string;
}

// 采购入库单明细
export interface PurchaseReceiptItem {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  specification: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number; // 含税金额
}

// 应付账款
export interface AccountPayable {
  id: string;
  payableNo: string;
  supplierId: string;
  supplierName: string;
  sourceType: 'reconciliation' | 'purchase' | 'other';
  sourceNo: string;
  sourceId: string;
  amount: number;
  paidAmount: number;
  unpaidAmount: number;
  dueDate: string;
  status: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  remark?: string;
}

// 付款记录
export interface PaymentRecord {
  id: string;
  paymentNo: string;
  payableId: string;
  payableNo: string;
  supplierId: string;
  supplierName: string;
  amount: number;
  paymentMethod: 'bank_transfer' | 'cash' | 'check' | 'other';
  paymentDate: string;
  bankAccount?: string;
  remark?: string;
  createdAt: string;
  operator: string;
}

// 付款单（由请款单付款后生成）
export interface PaymentVoucher {
  id: string;
  voucherNo: string;           // 付款单号
  requestId: string;           // 关联请款单ID
  requestNo: string;           // 关联请款单号
  supplierId: string;
  supplierName: string;
  paymentAmount: number;       // 付款金额
  paymentMethod: 'bank_transfer' | 'cash' | 'check' | 'other';
  bankAccount: string;
  bankName: string;
  paymentDate: string;         // 付款日期
  payableIds: string[];        // 核销的应付账款ID
  payableNos: string[];        // 核销的应付账款单号
  writeOffDetails: WriteOffDetail[];  // 核销明细
  status: 'pending' | 'completed' | 'cancelled';
  operator: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

// 核销明细
export interface WriteOffDetail {
  id: string;
  payableId: string;
  payableNo: string;
  payableAmount: number;       // 应付金额
  writeOffAmount: number;      // 本次核销金额
  remainingAmount: number;     // 核销后剩余金额
}

// 应付统计
export interface PayableStats {
  totalPayables: number;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  overdueCount: number;
  overdueAmount: number;
}

// 请款单
export interface PaymentRequest {
  id: string;
  requestNo: string;
  supplierId: string;
  supplierName: string;
  requestType: 'normal' | 'advance' | 'urgent';  // 普通/预付/紧急
  payableIds: string[];       // 关联的应付账款ID
  payableNos: string[];       // 关联的应付账款单号
  invoiceIds: string[];       // 关联的发票ID
  invoiceNos: string[];       // 关联的发票号
  requestAmount: number;      // 请款金额
  approvedAmount: number;     // 批准金额
  paymentMethod: 'bank_transfer' | 'cash' | 'check' | 'other';
  bankAccount: string;
  bankName: string;
  expectedPayDate: string;    // 期望付款日期
  actualPayDate?: string;     // 实际付款日期
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'paid' | 'cancelled';
  applicant: string;          // 申请人
  approver?: string;          // 审批人
  remark?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  paidAt?: string;
}

// 请款单明细
export interface PaymentRequestItem {
  id: string;
  requestId: string;
  payableId: string;
  payableNo: string;
  invoiceId?: string;
  invoiceNo?: string;
  amount: number;
  remark?: string;
}

// 发票
export interface Invoice {
  id: string;
  invoiceNo: string;          // 发票号码
  invoiceCode: string;        // 发票代码
  invoiceType: 'vat_special' | 'vat_normal' | 'electronic' | 'other';  // 增值税专票/普票/电子发票/其他
  supplierId: string;
  supplierName: string;
  buyerName: string;          // 购方名称
  buyerTaxNo: string;         // 购方税号
  invoiceDate: string;        // 开票日期
  amount: number;             // 不含税金额
  taxRate: number;            // 税率
  taxAmount: number;          // 税额
  totalAmount: number;        // 含税金额
  payableIds: string[];       // 关联的应付账款ID
  payableNos: string[];       // 关联的应付账款单号
  reconciliationIds: string[]; // 关联的对账单ID
  reconciliationNos: string[]; // 关联的对账单号
  verifyStatus: 'pending' | 'verified' | 'failed';  // 验真状态
  matchStatus: 'pending' | 'matched' | 'partial' | 'unmatched';  // 匹配状态
  status: 'pending' | 'received' | 'verified' | 'rejected' | 'cancelled';
  receivedAt?: string;        // 收票日期
  verifiedAt?: string;        // 验真日期
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

// 发票明细
export interface InvoiceItem {
  id: string;
  invoiceId: string;
  productName: string;
  specification: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxRate: number;
  taxAmount: number;
}

// 请款统计
export interface PaymentRequestStats {
  totalRequests: number;
  pendingCount: number;
  approvedCount: number;
  paidCount: number;
  totalRequestAmount: number;
  totalApprovedAmount: number;
  totalPaidAmount: number;
}

// 发票统计
export interface InvoiceStats {
  totalInvoices: number;
  pendingCount: number;
  verifiedCount: number;
  matchedCount: number;
  totalAmount: number;
  totalTaxAmount: number;
}

// ==================== 成本核算相关类型 ====================

// 物料/原材料
export interface Material {
  id: string;
  code: string;              // 物料编码
  name: string;              // 物料名称
  category: string;          // 物料分类
  specification: string;     // 规格型号
  unit: string;              // 单位
  unitPrice: number;         // 单价
  supplierId?: string;       // 供应商ID
  supplierName?: string;     // 供应商名称
  stockQuantity: number;     // 库存数量
  safetyStock: number;       // 安全库存
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// 工序
export interface Process {
  id: string;
  code: string;              // 工序编码
  name: string;              // 工序名称
  description: string;       // 工序描述
  laborCostPerHour: number;  // 每小时人工成本
  machineCostPerHour: number; // 每小时机器成本
  defaultHours: number;      // 默认工时
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// 商品/成品
export interface Product {
  id: string;
  code: string;              // 商品编码
  name: string;              // 商品名称
  category: string;          // 商品分类
  specification: string;     // 规格型号
  unit: string;              // 单位
  sellingPrice: number;      // 销售价格
  hasBom: boolean;           // 是否有BOM
  bomId?: string;            // BOM ID
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// BOM（物料清单）
export interface BOM {
  id: string;
  bomNo: string;             // BOM编号
  productId: string;         // 成品ID
  productCode: string;       // 成品编码
  productName: string;       // 成品名称
  version: string;           // 版本号
  quantity: number;          // 成品数量（通常为1）
  materials: BOMaterial[];   // 物料明细
  processes: BOMProcess[];   // 工序明细
  materialCost: number;      // 材料费用合计
  laborCost: number;         // 人工费用合计
  machineCost: number;       // 机器费用合计
  otherCost: number;         // 其他费用
  totalCost: number;         // 总成本
  status: 'draft' | 'active' | 'inactive';
  effectiveDate: string;     // 生效日期
  expiryDate?: string;       // 失效日期
  remark?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// BOM物料明细
export interface BOMaterial {
  id: string;
  bomId: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  specification: string;
  unit: string;
  quantity: number;          // 用量
  unitPrice: number;         // 单价
  amount: number;            // 金额
  wastageRate: number;       // 损耗率(%)
  actualQuantity: number;    // 实际用量（含损耗）
  actualAmount: number;      // 实际金额
  remark?: string;
}

// BOM工序明细
export interface BOMProcess {
  id: string;
  bomId: string;
  processId: string;
  processCode: string;
  processName: string;
  sequence: number;          // 工序顺序
  workHours: number;         // 工时（小时）
  laborCostPerHour: number;  // 人工成本/小时
  machineCostPerHour: number; // 机器成本/小时
  laborCost: number;         // 人工费用
  machineCost: number;       // 机器费用
  totalCost: number;         // 工序总成本
  remark?: string;
}

// 成本核算单
export interface CostCalculation {
  id: string;
  calculationNo: string;     // 核算单号
  productId: string;
  productCode: string;
  productName: string;
  bomId: string;
  bomNo: string;
  bomVersion: string;
  quantity: number;          // 核算数量
  materialCost: number;      // 材料费用
  laborCost: number;         // 人工费用
  machineCost: number;       // 机器费用
  otherCost: number;         // 其他费用
  totalCost: number;         // 总成本
  unitCost: number;          // 单位成本
  sellingPrice: number;      // 销售价格
  grossProfit: number;       // 毛利
  grossProfitRate: number;   // 毛利率(%)
  status: 'draft' | 'confirmed' | 'cancelled';
  calculatedAt: string;      // 核算时间
  confirmedAt?: string;      // 确认时间
  confirmedBy?: string;      // 确认人
  remark?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// 成本核算统计
export interface CostCalculationStats {
  totalCalculations: number;
  confirmedCount: number;
  draftCount: number;
  avgMaterialCostRate: number;  // 平均材料成本占比
  avgLaborCostRate: number;     // 平均人工成本占比
  avgGrossProfitRate: number;   // 平均毛利率
}
