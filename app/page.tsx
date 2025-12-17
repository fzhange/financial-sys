'use client';

import React, { useState, useCallback } from 'react';
import MainLayout from './components/MainLayout';
import Dashboard from './components/Dashboard';
import SupplierManagement from './components/SupplierManagement';
import PurchaseReceipts from './components/PurchaseReceipts';
import StatementManagement from './components/StatementManagement';
import ReconciliationCheck from './components/ReconciliationCheck';
import AccountPayable from './components/AccountPayable';
import InvoiceManagement from './components/InvoiceManagement';
import PaymentRequestManagement from './components/PaymentRequestManagement';
import PaymentVoucherManagement from './components/PaymentVoucherManagement';
import CostCalculation from './components/CostCalculation';
import ReconciliationHistory from './components/ReconciliationHistory';
import Settings from './components/Settings';
import type { ReconciliationStatement, AccountPayable as AccountPayableType } from './types';
import dayjs from 'dayjs';

export default function Home() {
  const [currentKey, setCurrentKey] = useState('dashboard');
  const [newPayables, setNewPayables] = useState<AccountPayableType[]>([]);
  const [highlightPayableNo, setHighlightPayableNo] = useState<string | undefined>();

  // 对账确认后生成应付账款
  const handleConfirmReconciliation = useCallback((statement: ReconciliationStatement, payableAmount: number) => {
    const newPayable: AccountPayableType = {
      id: `ap-${Date.now()}`,
      payableNo: `AP${dayjs().format('YYYYMMDD')}${String(newPayables.length + 4).padStart(3, '0')}`,
      supplierId: statement.supplierId,
      supplierName: statement.supplierName,
      sourceType: 'reconciliation',
      sourceNo: statement.statementNo,
      sourceId: statement.id,
      amount: payableAmount,
      paidAmount: 0,
      unpaidAmount: payableAmount,
      dueDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
      status: 'pending',
      createdAt: dayjs().format('YYYY-MM-DD'),
      updatedAt: dayjs().format('YYYY-MM-DD'),
      remark: `对账单${statement.statementNo}确认后生成`,
    };
    setNewPayables(prev => [...prev, newPayable]);
    
    // 跳转到应付账款页面
    setTimeout(() => {
      setCurrentKey('payables');
    }, 1500);
  }, [newPayables.length]);

  // 从对账单管理跳转到应付账款
  const handleNavigateToPayable = useCallback((payableNo: string) => {
    setHighlightPayableNo(payableNo);
    setCurrentKey('payables');
    // 清除高亮状态
    setTimeout(() => {
      setHighlightPayableNo(undefined);
    }, 3000);
  }, []);

  const renderContent = () => {
    switch (currentKey) {
      case 'dashboard':
        return <Dashboard />;
      case 'suppliers':
        return <SupplierManagement />;
      case 'receipts':
        return <PurchaseReceipts />;
      case 'statements':
        return <StatementManagement onNavigateToPayable={handleNavigateToPayable} />;
      case 'reconciliation':
        return <ReconciliationCheck onConfirmReconciliation={handleConfirmReconciliation} />;
      case 'payables':
        return <AccountPayable highlightPayableNo={highlightPayableNo} />;
      case 'invoices':
        return <InvoiceManagement />;
      case 'paymentRequests':
        return <PaymentRequestManagement />;
      case 'paymentVouchers':
        return <PaymentVoucherManagement />;
      case 'costCalculation':
        return <CostCalculation />;
      case 'history':
        return <ReconciliationHistory />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <MainLayout currentKey={currentKey} onMenuSelect={setCurrentKey}>
      {renderContent()}
    </MainLayout>
  );
}
