'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  PRODUCTS,
  DASHBOARD_METRICS,
  STOCK_AGEING_SUMMARY,
  MONTHLY_REVIEW_QUEUE,
  DEMO_ORDERS,
  DEMO_TASKS
} from '../../data/fixtures';
import { formatCurrency, formatDate, computeAvailableStock } from '../../lib/formatters';
import {
  LayoutDashboard,
  Gem,
  CalendarCheck,
  Package,
  ShoppingCart,
  Truck,
  Users,
  CheckSquare,
  CreditCard,
  BarChart3,
  Settings,
  AlertCircle,
  Clock,
  CheckCircle,
  HelpCircle,
  Lock,
  ArrowUpRight,
  ShieldAlert,
  Plus,
  X,
  RefreshCw,
  Layers,
} from 'lucide-react';
import CrmTab from '../../components/dashboard/CrmTab';
import TasksTab from '../../components/dashboard/TasksTab';

function DashboardContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [actionNotice, setActionNotice] = useState(null);
  const [receiptModal, setReceiptModal] = useState(false);
  const [receiptForm, setReceiptForm] = useState({
    variantId: 'NSK-EAR-001-GLD',
    batchReference: 'BATCH-202610-NEW',
    quantity: 10,
    unitCostMinor: 85000
  });
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receiptFeedback, setReceiptFeedback] = useState(null);
  const [liveSummary, setLiveSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [liveReviews, setLiveReviews] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [decisionForm, setDecisionForm] = useState({
    decision: 'CONTINUE',
    reason: ''
  });
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [decisionFeedback, setDecisionFeedback] = useState(null);

  // Node 8: Orders, Dispatch & Returns State
  const [liveOrders, setLiveOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [dispatchModalOrder, setDispatchModalOrder] = useState(null);
  const [dispatchCarrier, setDispatchCarrier] = useState('BlueDart Express');
  const [dispatchTracking, setDispatchTracking] = useState('');
  const [dispatchLoading, setDispatchLoading] = useState(false);
  const [dispatchFeedback, setDispatchFeedback] = useState(null);

  const [returnModalOrder, setReturnModalOrder] = useState(null);
  const [returnDisposition, setReturnDisposition] = useState('SELLABLE_RESTOCK');
  const [returnNotes, setReturnNotes] = useState('');
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnFeedback, setReturnFeedback] = useState(null);

  // Node 9: Suppliers & Purchase Orders State
  const [liveSuppliers, setLiveSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [livePOs, setLivePOs] = useState([]);
  const [posLoading, setPosLoading] = useState(false);

  // Modals State for POs
  const [createPOModal, setCreatePOModal] = useState(false);
  const [poSupplierId, setPoSupplierId] = useState('');
  const [poVariantId, setPoVariantId] = useState('');
  const [poQuantity, setPoQuantity] = useState(20);
  const [poExpectedDate, setPoExpectedDate] = useState('');
  const [poNotes, setPoNotes] = useState('');
  const [createPOLoading, setCreatePOLoading] = useState(false);
  const [createPOFeedback, setCreatePOFeedback] = useState(null);

  const [approvePOModal, setApprovePOModal] = useState(null);
  const [approvePONotes, setApprovePONotes] = useState('Approved for artisanal procurement');
  const [approvePOLoading, setApprovePOLoading] = useState(false);
  const [approvePOFeedback, setApprovePOFeedback] = useState(null);

  const [receiveModalPO, setReceiveModalPO] = useState(null);
  const [receiveItems, setReceiveItems] = useState({});
  const [receiveBatchRef, setReceiveBatchRef] = useState('');
  const [receiveLoading, setReceiveLoading] = useState(false);
  const [receiveFeedback, setReceiveFeedback] = useState(null);

  const [returnSupplierModalPO, setReturnSupplierModalPO] = useState(null);
  const [returnSupplierItems, setReturnSupplierItems] = useState({});
  const [returnSupplierReason, setReturnSupplierReason] = useState('DEFECTIVE_OR_DAMAGED');
  const [returnSupplierNotes, setReturnSupplierNotes] = useState('');
  const [returnSupplierLoading, setReturnSupplierLoading] = useState(false);
  const [returnSupplierFeedback, setReturnSupplierFeedback] = useState(null);

  // WooCommerce-style Product Catalogue Editor State
  const [liveProducts, setLiveProducts] = useState(PRODUCTS);
  const [productsLoading, setProductsLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editActiveSubTab, setEditActiveSubTab] = useState('general');
  const [editFormData, setEditFormData] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editFeedback, setEditFeedback] = useState(null);

  const loadLiveInventory = async () => {
    try {
      setSummaryLoading(true);
      const res = await fetch('/api/inventory/summary');
      if (res.ok) {
        const data = await res.json();
        setLiveSummary(data);
      }
    } catch (err) {
      console.error('Failed to load live inventory summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  const loadLiveReviews = async () => {
    try {
      setReviewsLoading(true);
      const res = await fetch('/api/reviews/queue');
      if (res.ok) {
        const data = await res.json();
        setLiveReviews(data);
      }
    } catch (err) {
      console.error('Failed to load review queue:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const loadLiveOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setLiveOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to load live orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadLiveSuppliers = async () => {
    try {
      setSuppliersLoading(true);
      const res = await fetch('/api/suppliers');
      if (res.ok) {
        const data = await res.json();
        setLiveSuppliers(data.suppliers || []);
      }
    } catch (err) {
      console.error('Failed to load suppliers:', err);
    } finally {
      setSuppliersLoading(false);
    }
  };

  const loadLivePOs = async () => {
    try {
      setPosLoading(true);
      const res = await fetch('/api/purchase-orders');
      if (res.ok) {
        const data = await res.json();
        setLivePOs(data.purchaseOrders || []);
      }
    } catch (err) {
      console.error('Failed to load purchase orders:', err);
    } finally {
      setPosLoading(false);
    }
  };

  const loadLiveProducts = async () => {
    try {
      setProductsLoading(true);
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          setLiveProducts(data.products);
        }
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    loadLiveInventory();
    loadLiveReviews();
    loadLiveOrders();
    loadLiveSuppliers();
    loadLivePOs();
    loadLiveProducts();
  }, []);

  const handleRecordDecision = async (e) => {
    e.preventDefault();
    if (!selectedReview) return;
    setDecisionLoading(true);
    setDecisionFeedback(null);
    try {
      const res = await fetch('/api/reviews/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designCode: selectedReview.designCode,
          decision: decisionForm.decision,
          reason: decisionForm.reason
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record decision');
      setDecisionFeedback({
        type: 'success',
        message: `Decision '${data.decisionRecord.decision}' applied to ${data.item.designCode}! New status: ${data.item.status}, Policy: ${data.item.reorderPolicy}.`
      });
      setSelectedReview(null);
      setDecisionForm({ decision: 'CONTINUE', reason: '' });
      await loadLiveReviews();
    } catch (err) {
      setDecisionFeedback({ type: 'error', message: err.message });
    } finally {
      setDecisionLoading(false);
    }
  };

  const handleCreateReceipt = async (e) => {
    e.preventDefault();
    setReceiptLoading(true);
    setReceiptFeedback(null);
    try {
      const res = await fetch('/api/inventory/receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(receiptForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Receipt creation failed');
      setReceiptFeedback({
        type: 'success',
        message: `Batch ${data.batch.id} (${data.batch.batchReference}) recorded! Received: +${data.batch.initialQuantity} units, Movement: signed +${data.movement.quantity}.`
      });
      setReceiptModal(false);
      await loadLiveInventory();
    } catch (err) {
      setReceiptFeedback({ type: 'error', message: err.message });
    } finally {
      setReceiptLoading(false);
    }
  };

  const handleConfirmDispatch = async (e) => {
    e.preventDefault();
    if (!dispatchModalOrder) return;
    setDispatchLoading(true);
    setDispatchFeedback(null);
    try {
      const res = await fetch(`/api/orders/${dispatchModalOrder.id}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carrier: dispatchCarrier,
          trackingNumber: dispatchTracking || `BLUEDART-NSK-${Math.floor(1000000 + Math.random() * 9000000)}`
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Dispatch failed');
      setDispatchFeedback(`✓ Order ${dispatchModalOrder.orderNumber} dispatched! Signed inventory reservation consumed.`);
      await loadLiveOrders();
      await loadLiveInventory();
      setTimeout(() => {
        setDispatchModalOrder(null);
        setDispatchFeedback(null);
      }, 1600);
    } catch (err) {
      setDispatchFeedback(`Error: ${err.message}`);
    } finally {
      setDispatchLoading(false);
    }
  };

  const handleProcessReturn = async (e) => {
    e.preventDefault();
    if (!returnModalOrder) return;
    setReturnLoading(true);
    setReturnFeedback(null);
    try {
      // 1. Request Return
      const retRes = await fetch(`/api/orders/${returnModalOrder.id}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: returnModalOrder.lines.map((l) => ({ sku: l.sku, quantity: 1 })),
          reason: 'CUSTOMER_RETURN_REQUEST',
          customerNotes: returnNotes
        })
      });
      const retData = await retRes.json();
      if (!retRes.ok) throw new Error(retData.error || 'Return request failed');

      // 2. Inspect & Execute Disposition
      const inspectRes = await fetch(`/api/orders/${returnModalOrder.id}/inspect-return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          returnId: retData.returnRecord.id,
          disposition: returnDisposition,
          inspectorNotes: returnNotes || 'Warehouse return inspection verified'
        })
      });
      const inspectData = await inspectRes.json();
      if (!inspectRes.ok) throw new Error(inspectData.error || 'Inspection resolution failed');

      setReturnFeedback(`✓ Return inspected and ${returnDisposition === 'SELLABLE_RESTOCK' ? 'restocked into vault inventory' : 'marked as damaged/scrap'}! Order refunded.`);
      await loadLiveOrders();
      await loadLiveInventory();
      setTimeout(() => {
        setReturnModalOrder(null);
        setReturnFeedback(null);
      }, 1800);
    } catch (err) {
      setReturnFeedback(`Error: ${err.message}`);
    } finally {
      setReturnLoading(false);
    }
  };

  const handleCreatePO = async (e) => {
    e.preventDefault();
    if (!poSupplierId || !poVariantId) {
      setCreatePOFeedback({ type: 'error', message: 'Please select a supplier and variant' });
      return;
    }
    setCreatePOLoading(true);
    setCreatePOFeedback(null);
    try {
      const res = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: poSupplierId,
          lines: [{ variantId: poVariantId, quantity: parseInt(poQuantity, 10) }],
          expectedDeliveryDate: poExpectedDate || undefined,
          notes: poNotes
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create purchase order');
      setCreatePOFeedback({
        type: 'success',
        message: `✓ Purchase Order ${data.purchaseOrder.poNumber} generated! Status: ${data.purchaseOrder.status} (${data.requiresApproval ? 'Pending Approval' : 'Auto-approved'}).`
      });
      await loadLivePOs();
      await loadLiveSuppliers();
      setTimeout(() => {
        setCreatePOModal(false);
        setCreatePOFeedback(null);
        setPoNotes('');
      }, 1600);
    } catch (err) {
      setCreatePOFeedback({ type: 'error', message: err.message });
    } finally {
      setCreatePOLoading(false);
    }
  };

  const handleApprovePO = async (e) => {
    e.preventDefault();
    if (!approvePOModal) return;
    setApprovePOLoading(true);
    setApprovePOFeedback(null);
    try {
      const res = await fetch(`/api/purchase-orders/${approvePOModal.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalNotes: approvePONotes })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'PO approval failed');
      setApprovePOFeedback(`✓ Purchase Order ${approvePOModal.poNumber} approved by manager! Ready for goods receipt.`);
      await loadLivePOs();
      setTimeout(() => {
        setApprovePOModal(null);
        setApprovePOFeedback(null);
      }, 1500);
    } catch (err) {
      setApprovePOFeedback(`Error: ${err.message}`);
    } finally {
      setApprovePOLoading(false);
    }
  };

  const handleReceiveShipment = async (e) => {
    e.preventDefault();
    if (!receiveModalPO) return;
    setReceiveLoading(true);
    setReceiveFeedback(null);
    try {
      const itemsToReceive = Object.entries(receiveItems)
        .map(([variantId, qty]) => ({ variantId, quantity: parseInt(qty, 10) }))
        .filter((i) => i.quantity > 0);

      if (itemsToReceive.length === 0) {
        throw new Error('Please enter a quantity greater than 0 to receive');
      }

      const res = await fetch(`/api/purchase-orders/${receiveModalPO.id}/receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: itemsToReceive,
          batchReference: receiveBatchRef || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Goods receipt failed');

      setReceiveFeedback(`✓ Received shipment! PO status is now ${data.purchaseOrder.status}. FIFO batches and signed movements appended to inventory ledger.`);
      await loadLivePOs();
      await loadLiveInventory();
      setTimeout(() => {
        setReceiveModalPO(null);
        setReceiveFeedback(null);
      }, 1600);
    } catch (err) {
      setReceiveFeedback(`Error: ${err.message}`);
    } finally {
      setReceiveLoading(false);
    }
  };

  const handleReturnSupplier = async (e) => {
    e.preventDefault();
    if (!returnSupplierModalPO) return;
    setReturnSupplierLoading(true);
    setReturnSupplierFeedback(null);
    try {
      const itemsToReturn = Object.entries(returnSupplierItems)
        .map(([variantId, qty]) => ({ variantId, quantity: parseInt(qty, 10) }))
        .filter((i) => i.quantity > 0);

      if (itemsToReturn.length === 0) {
        throw new Error('Please enter a quantity greater than 0 to return');
      }

      const res = await fetch(`/api/purchase-orders/${returnSupplierModalPO.id}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: itemsToReturn,
          reason: returnSupplierReason,
          notes: returnSupplierNotes
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Vendor return failed');

      setReturnSupplierFeedback(`✓ Vendor return recorded! Inventory movement signed and deducted.`);
      await loadLivePOs();
      await loadLiveInventory();
      setTimeout(() => {
        setReturnSupplierModalPO(null);
        setReturnSupplierFeedback(null);
      }, 1600);
    } catch (err) {
      setReturnSupplierFeedback(`Error: ${err.message}`);
    } finally {
      setReturnSupplierLoading(false);
    }
  };

  const openProductEditor = (prod) => {
    setEditingProduct(prod);
    setEditFormData({
      ...prod,
      priceRupees: prod.priceMinor ? (prod.priceMinor / 100).toFixed(0) : '1999',
      salePriceRupees: prod.salePriceMinor ? (prod.salePriceMinor / 100).toFixed(0) : '',
      stockStatus: prod.lifecycle === 'archived' ? 'OUT_OF_STOCK' : 'IN_STOCK'
    });
    setEditActiveSubTab('general');
    setEditFeedback(null);
  };

  const handleSaveProductEdit = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    setEditLoading(true);
    setEditFeedback(null);
    try {
      const pricePaise = editFormData.priceRupees
        ? Math.round(parseFloat(editFormData.priceRupees) * 100)
        : editingProduct.priceMinor;

      const payload = {
        name: editFormData.name,
        slug: editFormData.slug,
        category: editFormData.category,
        categoryName: editFormData.categoryName,
        collectionType: editFormData.collectionType,
        collectionName: editFormData.collectionName,
        lifecycle: editFormData.lifecycle,
        publishState: editFormData.publishState,
        salesUnit: editFormData.salesUnit,
        priceMinor: pricePaise,
        description: editFormData.description,
        story: editFormData.story,
        materials: editFormData.materials,
        dimensions: editFormData.dimensions,
        weight: editFormData.weight,
        care: editFormData.care
      };

      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update product');

      setEditFeedback({
        type: 'success',
        message: `✓ Product "${data.product.name}" (${data.product.code}) updated successfully!`
      });
      await loadLiveProducts();
      setTimeout(() => {
        setEditingProduct(null);
        setEditFeedback(null);
      }, 1500);
    } catch (err) {
      setEditFeedback({ type: 'error', message: err.message });
    } finally {
      setEditLoading(false);
    }
  };

  const showPlannedNotice = (actionName, nodeNumber) => {
    setActionNotice({
      title: `${actionName} (Planned)`,
      message: `This mutation will be wired to backend persistence in Node ${nodeNumber}. It is safely disabled in this Node 2 foundation.`
    });
  };

  return (
    <div>
      {/* Top Title & Environment Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 600, margin: 0 }}>Company Operations Workspace</h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
            NISHKÈA internal inventory, 30-day collection lifecycle, orders, and daily task management.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-demo">Demo Dataset Active</span>
          <span className="badge badge-burgundy">Provisional Currency: INR (₹)</span>
        </div>
      </div>

      {/* Prominent Architectural Disclaimer Banner */}
      <div
        role="alert"
        style={{
          backgroundColor: '#FEF7EC',
          border: '1px solid #F5DEB3',
          borderRadius: 'var(--radius-xs)',
          padding: '12px 18px',
          marginBottom: 'var(--space-6)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.82rem',
          color: '#8C5311'
        }}
      >
        <ShieldAlert size={20} style={{ flexShrink: 0 }} />
        <div>
          <strong>Node 9 Connected Engine:</strong> Staff authentication, RBAC authorization, transactional inventory ledger (FIFO goods receipts &amp; signed movements), 30-day collection lifecycle reviews, checkout orders &amp; courier dispatch, and artisan supplier directory with multi-tier PO approvals, FIFO goods receipts, and bounded vendor returns are actively connected to live API handlers.
        </div>
      </div>

      {/* Action Notification Modal / Banner */}
      {actionNotice && (
        <div
          role="status"
          style={{
            backgroundColor: '#EDF3F8',
            border: '1px solid #C4D7E8',
            borderRadius: 'var(--radius-xs)',
            padding: '12px 16px',
            marginBottom: 'var(--space-6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.82rem',
            color: '#1C4468'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={16} />
            <div>
              <strong>{actionNotice.title}:</strong> {actionNotice.message}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="btn btn-sm btn-outline"
            style={{ fontSize: '0.72rem', padding: '4px 8px' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Workspace Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: 'var(--space-6)',
          overflowX: 'auto',
          paddingBottom: '2px'
        }}
      >
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'products', label: 'Products & Variants', icon: Gem },
          { id: 'reviews', label: '30-Day Reviews', icon: CalendarCheck },
          { id: 'inventory', label: 'Inventory & Ageing', icon: Package },
          { id: 'orders', label: 'Orders', icon: ShoppingCart },
          { id: 'suppliers', label: 'Suppliers & POs', icon: Truck },
          { id: 'crm', label: 'Customers & CRM', icon: Users },
          { id: 'tasks', label: 'Team Tasks', icon: CheckSquare },
          { id: 'finance', label: 'Finance', icon: CreditCard },
          { id: 'reports', label: 'Reports', icon: BarChart3 },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                border: 'none',
                background: 'none',
                fontSize: '0.84rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--color-burgundy)' : 'var(--color-text-muted)',
                borderBottom: isActive ? '2px solid var(--color-burgundy)' : '2px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div>
          {/* Key Metric Cards */}
          <div className="dashboard-stats-grid">
            <div className="stat-card">
              <span className="stat-card-label">Net Sales (Last 30 Days)</span>
              <span className="stat-card-value">
                {formatCurrency(DASHBOARD_METRICS.netSalesMinor, 'INR')}
              </span>
              <span className="stat-card-subtext">{DASHBOARD_METRICS.totalOrders} total completed orders</span>
            </div>

            <div className="stat-card">
              <span className="stat-card-label">Available Physical Stock</span>
              <span className="stat-card-value">{DASHBOARD_METRICS.availableUnitsTotal} units</span>
              <span className="stat-card-subtext">Across 8 fixture designs</span>
            </div>

            <div className="stat-card">
              <span className="stat-card-label">Unsold Stock Cost (FIFO)</span>
              <span className="stat-card-value" style={{ color: 'var(--color-burgundy)' }}>
                {formatCurrency(DASHBOARD_METRICS.unsoldStockCostMinor, 'INR')}
              </span>
              <span className="stat-card-subtext">Evaluated at batch receipt unit cost</span>
            </div>

            <div className="stat-card">
              <span className="stat-card-label">Action Items Required</span>
              <span className="stat-card-value" style={{ color: 'var(--color-status-warning)' }}>
                {DASHBOARD_METRICS.monthlyReviewsDue + DASHBOARD_METRICS.pendingDispatches}
              </span>
              <span className="stat-card-subtext">
                {DASHBOARD_METRICS.monthlyReviewsDue} reviews due • {DASHBOARD_METRICS.pendingDispatches} dispatches pending
              </span>
            </div>
          </div>

          {/* Two-Column Overview Split */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-6)' }}>
            {/* Ageing Summary Table */}
            <div className="table-container" style={{ padding: 'var(--space-5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.15rem' }}>Stock Ageing Breakdown</h3>
                <span className="badge badge-gold">FIFO Method</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                Formula: Batch Age = Report Date − Received Date. Oldest units allocated first.
              </p>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Age Bracket</th>
                    <th>Remaining Units</th>
                    <th>Unsold Cost</th>
                    <th>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {STOCK_AGEING_SUMMARY.map((row) => (
                    <tr key={row.bucket}>
                      <td><strong>{row.bucket}</strong></td>
                      <td>{row.units} units</td>
                      <td>{formatCurrency(row.costMinor, 'INR')}</td>
                      <td>
                        <span style={{ fontSize: '0.78rem', color: row.percentage > 30 ? 'var(--color-status-warning)' : 'inherit' }}>
                          {row.percentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Daily Operational Tasks */}
            <div className="table-container" style={{ padding: 'var(--space-5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.15rem' }}>Priority Team Tasks</h3>
                <button
                  type="button"
                  onClick={() => showPlannedNotice('Task Creation', 10)}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.74rem' }}
                >
                  + New Task (Planned)
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(liveReviews?.tasks || DEMO_TASKS).map((task) => (
                  <div
                    key={task.id}
                    style={{
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-xs)',
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: '#FAF8F6'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.86rem' }}>{task.title}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        Assigned to: <strong>{task.assignedTo}</strong> • Due: {task.dueDate} • Ref: {task.linkedRecord}
                      </div>
                    </div>
                    <span className={`badge ${task.status === 'RESOLVED' ? 'badge-gold' : task.priority === 'HIGH' ? 'badge-danger' : 'badge-warning'}`}>
                      {task.status === 'RESOLVED' ? 'RESOLVED' : task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS & VARIANTS */}
      {activeTab === 'products' && (
        <div className="table-container">
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Design &amp; Variant Catalogue</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                Full WooCommerce-style options: pricing, descriptions, artisanal stories, dimensions, care, and variant options.
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  const newDraft = {
                    id: `des-${Date.now().toString(36)}`,
                    code: `NSK-NEW-${Math.floor(100 + Math.random() * 900)}`,
                    name: 'New Artisanal Jewellery Design',
                    slug: `new-design-${Date.now().toString(36)}`,
                    category: 'earrings',
                    categoryName: 'Earrings',
                    collectionType: 'monthly_trend',
                    collectionName: 'Autumn Trend Edit',
                    lifecycle: 'active',
                    publishState: 'published',
                    salesUnit: 'pair',
                    priceMinor: 249900,
                    priceRupees: '2499',
                    currency: 'INR',
                    description: 'Handcrafted luxury piece with refined finishing and artisanal materials.',
                    story: 'Centuries-old jewellery traditions handcrafted by regional master artisans.',
                    materials: '18k Micron Gold Plating, Hypoallergenic Brass Alloy',
                    dimensions: '5.0 cm length, 2.0 cm width',
                    weight: '12g',
                    care: 'Store in provided anti-tarnish pouch. Keep away from water and perfume.',
                    variants: []
                  };
                  openProductEditor(newDraft);
                }}
                className="btn btn-primary btn-sm"
              >
                + New Product
              </button>
              <button
                type="button"
                onClick={loadLiveProducts}
                disabled={productsLoading}
                className="btn btn-outline btn-sm"
              >
                <RefreshCw size={12} className={productsLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Design / Code</th>
                <th>Category</th>
                <th>Collection Type</th>
                <th>Variant SKUs</th>
                <th>Sales Unit</th>
                <th>Retail Price</th>
                <th>30-Day Review</th>
                <th>Lifecycle</th>
                <th>Catalogue Action</th>
              </tr>
            </thead>
            <tbody>
              {liveProducts.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.name}</strong>
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>{p.code}</div>
                  </td>
                  <td>{p.categoryName || p.category}</td>
                  <td>
                    <span className="badge badge-gold">{p.collectionType}</span>
                  </td>
                  <td style={{ fontSize: '0.74rem' }}>
                    {p.variants?.map((v) => (
                      <div key={v.sku}>
                        <code>{v.sku}</code> ({v.colour || v.name})
                      </div>
                    ))}
                  </td>
                  <td>{p.salesUnit}</td>
                  <td>
                    <strong>{formatCurrency(p.priceMinor, p.currency || 'INR')}</strong>
                  </td>
                  <td style={{ fontSize: '0.76rem' }}>{p.reviewDate || '—'}</td>
                  <td>
                    <span className={`badge ${p.lifecycle === 'active' ? 'badge-success' : p.lifecycle === 'clearance' ? 'badge-danger' : 'badge-warning'}`}>
                      {p.lifecycle}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => openProductEditor(p)}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.72rem', padding: '4px 8px', borderColor: 'var(--color-burgundy)', color: 'var(--color-burgundy)' }}
                    >
                      Edit Options
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: 30-DAY REVIEWS */}
      {activeTab === 'reviews' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div className="table-container" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ fontSize: '1.25rem', margin: 0 }}>30-Day Collection Decision Queue</h3>
                  <span className="badge badge-gold">Node 6 Lifecycle Active</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: '6px 0 0' }}>
                  Formula: <code>Period Sell-Through = Net Sold / (Opening Stock + Eligible Receipts)</code>. Review due 30 days from launch. Items under review never auto-discount or delete stock.
                </p>
              </div>

              <button
                type="button"
                onClick={loadLiveReviews}
                disabled={reviewsLoading}
                className="btn btn-outline btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}
              >
                <RefreshCw size={14} className={reviewsLoading ? 'spin' : ''} />
                {reviewsLoading ? 'Refreshing...' : 'Refresh Queue'}
              </button>
            </div>

            {/* Decision Feedback Banner */}
            {decisionFeedback && (
              <div
                role="status"
                style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: decisionFeedback.type === 'success' ? '#F0FDF4' : '#FEF2F2',
                  border: `1px solid ${decisionFeedback.type === 'success' ? '#86EFAC' : '#FECACA'}`,
                  color: decisionFeedback.type === 'success' ? '#166534' : '#991B1B',
                  fontSize: '0.84rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} />
                  <span>{decisionFeedback.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDecisionFeedback(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                >
                  <X size={15} />
                </button>
              </div>
            )}
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Design / Code</th>
                  <th>Launch Date</th>
                  <th>Review Due</th>
                  <th>Days Active</th>
                  <th>Opening / Receipts</th>
                  <th>Units Sold</th>
                  <th>Sell-Through</th>
                  <th>Status</th>
                  <th>Reorder Policy</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {(liveReviews?.queue || MONTHLY_REVIEW_QUEUE).map((item) => (
                  <tr key={item.id || item.designCode}>
                    <td>
                      <strong>{item.designName || item.name}</strong>
                      <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>{item.designCode}</div>
                    </td>
                    <td>{item.launchDate}</td>
                    <td>
                      <span style={{ fontWeight: item.isDue ? 600 : 'normal', color: item.isDue ? 'var(--color-burgundy)' : 'inherit' }}>
                        {item.reviewDueDate}
                      </span>
                    </td>
                    <td>{item.daysSinceLaunch} days</td>
                    <td>
                      {item.openingSellableUnits ?? item.initialReceiptUnits} units
                      {item.eligibleReceiptUnits > 0 ? ` (+${item.eligibleReceiptUnits})` : ''}
                    </td>
                    <td>{item.netUnitsSold} units</td>
                    <td>
                      <strong style={{ color: item.sellThroughPercentage > 50 ? 'var(--color-status-success)' : item.sellThroughPercentage < 35 ? 'var(--color-status-danger)' : 'inherit' }}>
                        {item.sellThroughRate}
                      </strong>
                    </td>
                    <td>
                      <span className={`badge ${item.status === 'under_review' ? 'badge-warning' : item.status === 'clearance' ? 'badge-danger' : item.status === 'discontinued' ? 'badge-demo' : 'badge-gold'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {item.reorderPolicy || 'standard'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        id={`btn-decision-${item.designCode}`}
                        onClick={() => {
                          setSelectedReview(item);
                          setDecisionForm({
                            decision: item.status === 'clearance' ? 'DISCONTINUE' : 'CONTINUE',
                            reason: ''
                          });
                        }}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.74rem', padding: '5px 10px' }}
                      >
                        Record Decision
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: INVENTORY */}
      {activeTab === 'inventory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Header Card */}
          <div className="table-container" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Transactional Inventory Ledger &amp; Goods Receipt</h3>
                  <span className="badge badge-gold">Node 5 Engine Active</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: '6px 0 0' }}>
                  Enforcing jeweller formula: <code>Available = Sellable On-Hand − Active Reservations</code>. Zero overselling, strict FIFO batches, and signed append-only movements.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={loadLiveInventory}
                  disabled={summaryLoading}
                  className="btn btn-outline btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}
                >
                  <RefreshCw size={14} className={summaryLoading ? 'spin' : ''} />
                  {summaryLoading ? 'Refreshing...' : 'Refresh Ledger'}
                </button>
                <button
                  type="button"
                  id="btn-open-goods-receipt"
                  onClick={() => setReceiptModal(true)}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}
                >
                  <Plus size={15} />
                  + Receive Stock Batch
                </button>
              </div>
            </div>

            {/* Receipt Feedback Banner */}
            {receiptFeedback && (
              <div
                role="status"
                style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: receiptFeedback.type === 'success' ? '#F0FDF4' : '#FEF2F2',
                  border: `1px solid ${receiptFeedback.type === 'success' ? '#86EFAC' : '#FECACA'}`,
                  color: receiptFeedback.type === 'success' ? '#166534' : '#991B1B',
                  fontSize: '0.84rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} />
                  <span>{receiptFeedback.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setReceiptFeedback(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                >
                  <X size={15} />
                </button>
              </div>
            )}

            {/* Live Ledger KPI summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginTop: '18px' }}>
              <div style={{ backgroundColor: 'var(--color-surface)', padding: '12px 16px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tracked Batches</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--color-burgundy)', marginTop: '4px' }}>
                  {liveSummary?.batches?.length ?? 5} batches
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>FIFO Allocation Order</div>
              </div>

              <div style={{ backgroundColor: 'var(--color-surface)', padding: '12px 16px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sellable Units On-Hand</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--color-text-main)', marginTop: '4px' }}>
                  {liveSummary?.batches?.reduce((acc, b) => acc + b.currentQuantity, 0) ?? 117} units
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>In Active Storage</div>
              </div>

              <div style={{ backgroundColor: 'var(--color-surface)', padding: '12px 16px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Reservations</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 600, color: '#D97706', marginTop: '4px' }}>
                  5 units
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>Checkout 15-min TTL Holds</div>
              </div>

              <div style={{ backgroundColor: 'var(--color-surface)', padding: '12px 16px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Movements Logged</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--color-status-success)', marginTop: '4px' }}>
                  {liveSummary?.movements?.length ?? 0} signed
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>Append-Only Ledger Trail</div>
              </div>
            </div>
          </div>

          {/* Table 1: Live Stock Batches Ledger */}
          <div className="table-container">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 600 }}>Active Batches Ledger (FIFO Allocation Queue)</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                  Batch costs are isolated by role-based access control. Oldest received units allocated first.
                </p>
              </div>
              <span className="badge badge-demo">Live Ledger View</span>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch ID</th>
                  <th>Variant SKU</th>
                  <th>Batch Reference</th>
                  <th>Initial Units</th>
                  <th>Current Units</th>
                  <th>Received Date</th>
                  <th>Unit Cost</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(liveSummary?.batches || [
                  { id: 'BAT-202610-01', variantId: 'NSK-EAR-001-GLD', batchReference: 'BATCH-202610-A', initialQuantity: 20, currentQuantity: 18, receivedDate: '2026-10-01' },
                  { id: 'BAT-202606-12', variantId: 'NSK-RNG-002-SZ7', batchReference: 'BATCH-202606-C', initialQuantity: 50, currentQuantity: 22, receivedDate: '2026-06-15' },
                  { id: 'BAT-202609-08', variantId: 'NSK-NCK-003-BUR', batchReference: 'BATCH-202609-B', initialQuantity: 15, currentQuantity: 5, receivedDate: '2026-09-18' },
                  { id: 'BAT-202607-20', variantId: 'NSK-HAR-004-IVR', batchReference: 'BATCH-202607-A', initialQuantity: 80, currentQuantity: 30, receivedDate: '2026-07-10' },
                  { id: 'BAT-202605-18', variantId: 'NSK-EAR-006-GLD', batchReference: 'BATCH-202605-E', initialQuantity: 100, currentQuantity: 42, receivedDate: '2026-05-01' }
                ]).map((batch) => (
                  <tr key={batch.id}>
                    <td>
                      <code>{batch.id}</code>
                    </td>
                    <td>
                      <strong>{batch.variantId}</strong>
                    </td>
                    <td>{batch.batchReference}</td>
                    <td>{batch.initialQuantity} units</td>
                    <td>
                      <strong style={{ color: batch.currentQuantity > 0 ? 'var(--color-text-main)' : 'var(--color-status-danger)' }}>
                        {batch.currentQuantity} units
                      </strong>
                    </td>
                    <td>{batch.receivedDate}</td>
                    <td>
                      {batch.unitCostMinor !== undefined ? (
                        formatCurrency(batch.unitCostMinor, 'INR')
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Cost Redacted (RBAC)</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${batch.currentQuantity > 0 ? 'badge-gold' : 'badge-danger'}`}>
                        {batch.currentQuantity > 0 ? 'Active' : 'Depleted'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table 2: Recent Signed Inventory Movements (Append-Only) */}
          <div className="table-container">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 600 }}>Recent Signed Movements (Append-Only Audit)</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                  Every physical stock change is recorded as a signed movement. Arbitrary counter overrides are prohibited.
                </p>
              </div>
              <span className="badge badge-gold">Immutable Ledger</span>
            </div>

            {(!liveSummary?.movements || liveSummary.movements.length === 0) ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.84rem' }}>
                No runtime movements posted yet in this session. Click <strong>&quot;+ Receive Stock Batch&quot;</strong> above to record a new goods receipt movement.
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Movement #</th>
                    <th>Batch ID</th>
                    <th>Variant SKU</th>
                    <th>Signed Quantity</th>
                    <th>Movement Type</th>
                    <th>Actor</th>
                    <th>Recorded Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {liveSummary.movements.map((mov) => {
                    const isPositive = mov.quantity > 0;
                    return (
                      <tr key={mov.id}>
                        <td>
                          <code>MOV-#{mov.id}</code>
                        </td>
                        <td>
                          <code>{mov.batchId}</code>
                        </td>
                        <td>
                          <strong>{mov.variantId}</strong>
                        </td>
                        <td>
                          <span
                            style={{
                              fontWeight: 600,
                              color: isPositive ? 'var(--color-status-success)' : 'var(--color-status-danger)'
                            }}
                          >
                            {isPositive ? `+${mov.quantity}` : mov.quantity}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${mov.movementType === 'RECEIPT' ? 'badge-gold' : 'badge-warning'}`}>
                            {mov.movementType}
                          </span>
                        </td>
                        <td>{mov.actorId || 'system'}</td>
                        <td style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
                          {mov.createdAt ? new Date(mov.createdAt).toLocaleTimeString() : 'Just now'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Table 3: SKU Available Stock Level Gate */}
          <div className="table-container">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
              <h4 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 600 }}>Catalogue SKU Availability &amp; Reservation Gate</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                Available for Sale represents stock that can safely enter checkout without risk of overselling.
              </p>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>SKU / Variant</th>
                  <th>Design Name</th>
                  <th>Physical On-Hand</th>
                  <th>Active Reservations</th>
                  <th>Available for Sale</th>
                  <th>Oldest Batch Age</th>
                  <th>Unit Cost (Restricted)</th>
                  <th>Reorder Policy</th>
                </tr>
              </thead>
              <tbody>
                {PRODUCTS.flatMap((p) =>
                  p.variants.map((v) => {
                    const avail = computeAvailableStock(v.sellable, v.reserved);
                    const oldestBatch = p.stockBatches && p.stockBatches[0];
                    return (
                      <tr key={v.sku}>
                        <td>
                          <code>{v.sku}</code>
                          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                            {v.colour} {v.size ? `• ${v.size}` : ''}
                          </div>
                        </td>
                        <td>{p.name}</td>
                        <td>{v.sellable}</td>
                        <td>{v.reserved}</td>
                        <td>
                          <strong style={{ color: avail > 0 ? 'var(--color-status-success)' : 'var(--color-status-danger)' }}>
                            {avail}
                          </strong>
                        </td>
                        <td>{oldestBatch ? `${oldestBatch.ageDays} days (${oldestBatch.ageBucket})` : '—'}</td>
                        <td>
                          <span style={{ fontSize: '0.75rem', color: '#666' }}>
                            {formatCurrency(v.unitCostMinor, 'INR')}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${p.reorderPolicy === 'blocked_clearance' ? 'badge-danger' : 'badge-gold'}`}>
                            {p.reorderPolicy}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: ORDERS (Live Node 8 Connection) */}
      {activeTab === 'orders' && (
        <div className="table-container">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 600 }}>Orders &amp; Dispatch Queue</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
                Order line price snapshots, transactional vault reservations, courier dispatch, and return inspections.
              </p>
            </div>
            <button
              type="button"
              onClick={loadLiveOrders}
              disabled={ordersLoading}
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={13} className={ordersLoading ? 'animate-spin' : ''} />
              <span>Refresh Orders</span>
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer</th>
                <th>Allocated Items</th>
                <th>Total</th>
                <th>Payment Status</th>
                <th>Fulfillment State</th>
                <th>Tracking</th>
                <th>Operational Action</th>
              </tr>
            </thead>
            <tbody>
              {(liveOrders.length > 0 ? liveOrders : DEMO_ORDERS).map((ord) => {
                const customerName = ord.customer?.name || ord.customerName;
                const customerEmail = ord.customer?.email || ord.customerEmail;
                const itemsSummary = ord.lines
                  ? ord.lines.map((l) => `${l.quantity}× ${l.designName || l.sku}`).join(', ')
                  : ord.itemsSummary;
                const totalMinor = ord.orderTotalMinor || ord.totalMinor;
                const currency = ord.currency || 'INR';

                return (
                  <tr key={ord.id}>
                    <td>
                      <strong style={{ fontFamily: 'monospace', color: 'var(--color-burgundy)' }}>
                        {ord.orderNumber}
                      </strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{customerName}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>{customerEmail}</div>
                    </td>
                    <td style={{ fontSize: '0.82rem', maxWidth: '280px' }}>
                      {itemsSummary}
                    </td>
                    <td>
                      <strong>{formatCurrency(totalMinor, currency)}</strong>
                    </td>
                    <td>
                      <span className={`badge ${ord.paymentStatus === 'PAID' ? 'badge-success' : ord.paymentStatus === 'REFUNDED_RETURN' ? 'badge-danger' : 'badge-warning'}`}>
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${ord.fulfillmentStatus === 'DISPATCHED' ? 'badge-gold' : ord.fulfillmentStatus === 'RETURNED_INSPECTED' ? 'badge-neutral' : 'badge-warning'}`}>
                        {ord.fulfillmentStatus}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
                      {ord.tracking ? (
                        <div>
                          <div><strong>{ord.tracking.carrier}</strong></div>
                          <code>{ord.tracking.trackingNumber}</code>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      {ord.fulfillmentStatus === 'DISPATCHED' ? (
                        <button
                          type="button"
                          onClick={() => setReturnModalOrder(ord)}
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.72rem', padding: '4px 10px', borderColor: 'var(--color-gold)', color: 'var(--color-text-main)' }}
                        >
                          Process Return
                        </button>
                      ) : ord.paymentStatus === 'REFUNDED_RETURN' ? (
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                          ✓ Resolved
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDispatchModalOrder(ord)}
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '0.72rem', padding: '4px 10px' }}
                        >
                          Dispatch Order
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 6: SUPPLIERS & PURCHASE ORDERS (Live Node 9 Connection) */}
      {activeTab === 'suppliers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Quick Metrics Bar */}
          <div className="dashboard-stats-grid">
            <div className="stat-card">
              <span className="stat-card-label">Contracted Artisan Guilds</span>
              <span className="stat-card-value">{liveSuppliers.length}</span>
              <span className="stat-card-subtext">Jaipur, Surat, Bengaluru &amp; Mumbai</span>
            </div>

            <div className="stat-card">
              <span className="stat-card-label">Total Procurement Value</span>
              <span className="stat-card-value" style={{ color: 'var(--color-burgundy)' }}>
                {livePOs.length > 0 && livePOs[0]?.totalCostMinor !== null
                  ? formatCurrency(
                      livePOs.reduce((sum, p) => sum + (p.totalCostMinor || 0), 0),
                      'INR'
                    )
                  : 'RBAC Cost Isolated'}
              </span>
              <span className="stat-card-subtext">Across {livePOs.length} total procurement orders</span>
            </div>

            <div className="stat-card">
              <span className="stat-card-label">Pending Approval</span>
              <span className="stat-card-value" style={{ color: '#D97706' }}>
                {livePOs.filter((p) => p.status === 'PENDING_APPROVAL').length}
              </span>
              <span className="stat-card-subtext">High-value or staff drafted POs</span>
            </div>

            <div className="stat-card">
              <span className="stat-card-label">Active Receiving / In-Transit</span>
              <span className="stat-card-value" style={{ color: 'var(--color-gold)' }}>
                {livePOs.filter((p) => p.status === 'APPROVED' || p.status === 'PARTIALLY_RECEIVED').length}
              </span>
              <span className="stat-card-subtext">Awaiting full vault intake</span>
            </div>
          </div>

          {/* Section 1: Purchase Orders Queue */}
          <div className="table-container">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 600 }}>Purchase Orders &amp; Receipts Ledger</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
                  Multi-tier approvals, zero over-receipt gating (Received ≤ Ordered), and bounded vendor returns.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (liveSuppliers.length > 0) {
                      setPoSupplierId(liveSuppliers[0].id);
                      setPoVariantId(liveSuppliers[0].products[0]?.variantId || '');
                      setPoQuantity(liveSuppliers[0].products[0]?.moq || 20);
                    }
                    setCreatePOModal(true);
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={14} />
                  <span>Draft Purchase Order</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    loadLivePOs();
                    loadLiveSuppliers();
                  }}
                  disabled={posLoading}
                  className="btn btn-outline btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <RefreshCw size={13} className={posLoading ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>PO Reference</th>
                  <th>Artisan Guild Partner</th>
                  <th>Order Items &amp; SKUs</th>
                  <th>Reconciliation (Ord / Rcv / Ret)</th>
                  <th>Total Commitment</th>
                  <th>Delivery Due</th>
                  <th>Approval / State</th>
                  <th>Operational Action</th>
                </tr>
              </thead>
              <tbody>
                {livePOs.map((po) => {
                  const rec = po.reconciliation || {
                    totalOrdered: po.lines?.reduce((s, l) => s + l.orderedQuantity, 0) || 0,
                    totalReceived: po.lines?.reduce((s, l) => s + l.receivedQuantity, 0) || 0,
                    totalReturned: po.lines?.reduce((s, l) => s + l.returnedQuantity, 0) || 0,
                    percentReceived: 0
                  };

                  return (
                    <tr key={po.id}>
                      <td>
                        <strong style={{ fontFamily: 'monospace', color: 'var(--color-burgundy)' }}>
                          {po.poNumber}
                        </strong>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                          Created: {po.createdAt?.slice(0, 10)}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{po.supplierName}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>ID: {po.supplierId}</div>
                      </td>
                      <td style={{ fontSize: '0.8rem', maxWidth: '240px' }}>
                        {po.lines?.map((l) => (
                          <div key={l.id || l.variantId} style={{ marginBottom: '4px' }}>
                            <strong>{l.orderedQuantity}×</strong> {l.designName || l.variantId}
                            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'block' }}>
                              Received: {l.receivedQuantity} | Returned: {l.returnedQuantity}
                            </span>
                          </div>
                        ))}
                      </td>
                      <td>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                          {rec.totalReceived} / {rec.totalOrdered} rcvd
                          {rec.totalReturned > 0 && (
                            <span style={{ color: 'var(--color-status-danger)', marginLeft: '4px', fontSize: '0.75rem' }}>
                              (-{rec.totalReturned} ret)
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            width: '100%',
                            height: '6px',
                            backgroundColor: '#E5E7EB',
                            borderRadius: '3px',
                            marginTop: '6px',
                            overflow: 'hidden'
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(100, rec.percentReceived || 0)}%`,
                              height: '100%',
                              backgroundColor:
                                po.status === 'FULFILLED'
                                  ? '#10B981'
                                  : po.status === 'PARTIALLY_RECEIVED'
                                  ? 'var(--color-burgundy)'
                                  : 'var(--color-gold)'
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                          {rec.remainingPending > 0 ? `${rec.remainingPending} pending` : 'All items accounted'}
                        </span>
                      </td>
                      <td>
                        {po.totalCostMinor !== null ? (
                          <strong>{formatCurrency(po.totalCostMinor, po.currency || 'INR')}</strong>
                        ) : (
                          <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                            Cost Isolated
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {po.expectedDeliveryDate || '—'}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            po.status === 'FULFILLED'
                              ? 'badge-success'
                              : po.status === 'PARTIALLY_RECEIVED'
                              ? 'badge-burgundy'
                              : po.status === 'APPROVED'
                              ? 'badge-gold'
                              : 'badge-warning'
                          }`}
                        >
                          {po.status}
                        </span>
                        {po.approvedBy && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                            By {po.approvedBy}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {po.status === 'PENDING_APPROVAL' && (
                            <button
                              type="button"
                              onClick={() => {
                                setApprovePOModal(po);
                                setApprovePONotes('Approved for production & restock intake');
                              }}
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                            >
                              Approve PO
                            </button>
                          )}

                          {(po.status === 'APPROVED' || po.status === 'PARTIALLY_RECEIVED') && (
                            <button
                              type="button"
                              onClick={() => {
                                setReceiveModalPO(po);
                                const defaultQtys = {};
                                po.lines?.forEach((l) => {
                                  defaultQtys[l.variantId] = Math.max(0, l.orderedQuantity - l.receivedQuantity);
                                });
                                setReceiveItems(defaultQtys);
                                setReceiveBatchRef(`BAT-${po.poNumber.replace('PO-', '')}-${Date.now().toString(36).slice(-3).toUpperCase()}`);
                              }}
                              className="btn btn-outline btn-sm"
                              style={{ fontSize: '0.72rem', padding: '4px 8px', borderColor: 'var(--color-burgundy)', color: 'var(--color-burgundy)' }}
                            >
                              Receive Shipment
                            </button>
                          )}

                          {rec.totalReceived > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setReturnSupplierModalPO(po);
                                const defaultReturns = {};
                                po.lines?.forEach((l) => {
                                  defaultReturns[l.variantId] = 0;
                                });
                                setReturnSupplierItems(defaultReturns);
                              }}
                              className="btn btn-outline btn-sm"
                              style={{ fontSize: '0.72rem', padding: '4px 8px', borderColor: '#D97706', color: '#B45309' }}
                            >
                              Vendor Return
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Section 2: Artisan Guilds Directory */}
          <div className="table-container" style={{ padding: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 600 }}>Contracted Artisan Guilds &amp; Terms</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
                Catalog mappings, standard lead times, minimum order quantities (MOQ), and wholesale unit price protections.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
              {liveSuppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  style={{
                    backgroundColor: '#FAF8F6',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-xs)',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>{supplier.name}</h4>
                        <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
                          {supplier.city}, {supplier.state}
                        </span>
                      </div>
                      <span className="badge badge-gold">{supplier.code}</span>
                    </div>

                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '6px 0 12px' }}>
                      {supplier.notes}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.78rem', marginBottom: '12px', backgroundColor: '#FFFFFF', padding: '8px 12px', borderRadius: '4px' }}>
                      <div>
                        <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>Lead Time:</span>
                        <strong>{supplier.leadTimeDays} Days</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>Terms:</span>
                        <strong>{supplier.paymentTerms}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>Contact:</span>
                        <span>{supplier.contactPerson}</span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>Phone:</span>
                        <span>{supplier.phone}</span>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.78rem' }}>
                      <strong style={{ display: 'block', marginBottom: '6px' }}>Contracted Catalogue Variants:</strong>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {supplier.products?.map((p) => (
                          <div
                            key={p.variantId}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '4px 8px',
                              backgroundColor: '#FFFFFF',
                              borderRadius: '3px',
                              border: '1px solid #ECE7E2'
                            }}
                          >
                            <div>
                              <code>{p.variantId}</code>
                              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginLeft: '6px' }}>
                                MOQ: {p.moq}
                              </span>
                            </div>
                            <div style={{ fontWeight: 600 }}>
                              {p.unitCostMinor !== null ? (
                                formatCurrency(p.unitCostMinor, 'INR')
                              ) : (
                                <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>Cost Hidden</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #ECE7E2', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setPoSupplierId(supplier.id);
                        if (supplier.products && supplier.products.length > 0) {
                          setPoVariantId(supplier.products[0].variantId);
                          setPoQuantity(supplier.products[0].moq);
                        }
                        setCreatePOModal(true);
                      }}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.74rem' }}
                    >
                      Draft Restock PO
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: CRM */}
      {activeTab === 'crm' && <CrmTab />}

      {/* TAB 8: TASKS */}
      {activeTab === 'tasks' && <TasksTab />}

      {/* TAB 9: FINANCE */}
      {activeTab === 'finance' && (
        <div className="table-container" style={{ padding: 'var(--space-8)' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '12px' }}>Commercial &amp; Financial Reconciliations</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
            Per AGENTS.md: Integer minor currency units (`price_minor`), explicit currency (INR), and single source of truth.
          </p>
          <div style={{ backgroundColor: '#FAF7F2', border: '1px solid var(--color-border)', padding: '16px', borderRadius: '4px', fontSize: '0.82rem' }}>
            <strong>Gross Margin Formula Definition:</strong> Net Merchandise Revenue (excluding collected taxes) − Allocated Cost of Goods Sold. Shipping, payment fees, and overheads reported separately.
          </div>
        </div>
      )}

      {/* TAB 10: REPORTS */}
      {activeTab === 'reports' && (
        <div className="table-container" style={{ padding: 'var(--space-8)' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '12px' }}>Inventory &amp; Sales Performance Metrics</h3>
          <div style={{ backgroundColor: '#FAF7F2', border: '1px solid var(--color-border)', padding: '16px', borderRadius: '4px', fontSize: '0.82rem', marginBottom: '16px' }}>
            <strong>Period Sell-Through Rate Formula:</strong> Net Units Sold / (Opening Sellable Stock + Eligible Receipts in Period). Returns and damaged transfers isolated.
          </div>
        </div>
      )}

      {/* TAB 11: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="table-container" style={{ padding: 'var(--space-6)' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Company Configuration Parameters</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ border: '1px solid var(--color-border)', padding: '16px', borderRadius: '4px' }}>
              <strong>Provisional Timezone:</strong>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.84rem' }}>Asia/Kolkata (IST)</div>
            </div>
            <div style={{ border: '1px solid var(--color-border)', padding: '16px', borderRadius: '4px' }}>
              <strong>Base Currency:</strong>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.84rem' }}>INR (₹) — Minor units (paise)</div>
            </div>
            <div style={{ border: '1px solid var(--color-border)', padding: '16px', borderRadius: '4px' }}>
              <strong>Checkout Reservation TTL:</strong>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.84rem' }}>15 minutes (Atomic lock duration)</div>
            </div>
            <div style={{ border: '1px solid var(--color-border)', padding: '16px', borderRadius: '4px' }}>
              <strong>Trend Design Review Cycle:</strong>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.84rem' }}>30 calendar days from launch</div>
            </div>
          </div>
        </div>
      )}

      {/* Goods Receipt Modal Dialog */}
      {receiptModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="receipt-dialog-title"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(26, 10, 14, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-sm)',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--color-border)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--color-surface)'
              }}
            >
              <div>
                <h3 id="receipt-dialog-title" style={{ fontSize: '1.2rem', margin: 0, fontWeight: 600 }}>
                  Receive Stock Batch (Goods Receipt)
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
                  Posts a signed <code>+</code> inventory movement and registers a new FIFO batch.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReceiptModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateReceipt} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  Target Product Variant SKU
                </label>
                <select
                  id="receipt-variant-select"
                  value={receiptForm.variantId}
                  onChange={(e) => setReceiptForm({ ...receiptForm, variantId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.85rem'
                  }}
                  required
                >
                  {PRODUCTS.flatMap((p) =>
                    p.variants.map((v) => (
                      <option key={v.sku} value={v.sku}>
                        {v.sku} — {p.name} ({v.colour})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  Batch Reference Code
                </label>
                <input
                  type="text"
                  id="receipt-batch-ref"
                  value={receiptForm.batchReference}
                  onChange={(e) => setReceiptForm({ ...receiptForm, batchReference: e.target.value })}
                  placeholder="e.g. BATCH-202610-NEW"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.85rem'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                    Received Quantity
                  </label>
                  <input
                    type="number"
                    id="receipt-quantity"
                    min="1"
                    max="1000"
                    value={receiptForm.quantity}
                    onChange={(e) => setReceiptForm({ ...receiptForm, quantity: parseInt(e.target.value, 10) || 1 })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '0.85rem'
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                    Unit Cost (in Paise / Minor)
                  </label>
                  <input
                    type="number"
                    id="receipt-unit-cost"
                    min="100"
                    step="100"
                    value={receiptForm.unitCostMinor}
                    onChange={(e) => setReceiptForm({ ...receiptForm, unitCostMinor: parseInt(e.target.value, 10) || 0 })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '0.85rem'
                    }}
                    required
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px', display: 'block' }}>
                    = {formatCurrency(receiptForm.unitCostMinor, 'INR')}
                  </span>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                <button
                  type="button"
                  onClick={() => setReceiptModal(false)}
                  className="btn btn-outline btn-sm"
                  disabled={receiptLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-submit-goods-receipt"
                  className="btn btn-primary btn-sm"
                  disabled={receiptLoading}
                  style={{ minWidth: '130px' }}
                >
                  {receiptLoading ? 'Recording...' : 'Post Goods Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* 30-Day Collection Decision Modal Dialog */}
      {selectedReview && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-decision-dialog-title"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(26, 10, 14, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-sm)',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--color-border)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--color-surface)'
              }}
            >
              <div>
                <h3 id="review-decision-dialog-title" style={{ fontSize: '1.2rem', margin: 0, fontWeight: 600 }}>
                  Record 30-Day Review Decision
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
                  Target: <strong>{selectedReview.designCode}</strong> — {selectedReview.designName || selectedReview.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleRecordDecision} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  Lifecycle Decision
                </label>
                <select
                  id="decision-select"
                  value={decisionForm.decision}
                  onChange={(e) => setDecisionForm({ ...decisionForm, decision: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.85rem'
                  }}
                  required
                >
                  <option value="CONTINUE">CONTINUE — Extend Trend Window by 30 Days</option>
                  <option value="PROMOTE_TO_PERMANENT">PROMOTE_TO_PERMANENT — Move to Core Collection (Enable Reorders)</option>
                  <option value="STOP_REORDER">STOP_REORDER — End Reorders (Sell Down Remaining Units)</option>
                  <option value="CLEARANCE">CLEARANCE — Apply Clearance Markdown (Block Reorders)</option>
                  <option value="SUPPLIER_RETURN">SUPPLIER_RETURN — Vendor Return (Quarantine Unsold Units)</option>
                  <option value="DISCONTINUE">DISCONTINUE — End Sales Immediately (Archive Listing)</option>
                </select>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '4px' }}>
                  Per docs/INVENTORY.md: Items under review never auto-discount or delete stock; decisions are human-reviewed and audited.
                </span>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  Justification / Operational Reason
                </label>
                <textarea
                  id="decision-reason"
                  rows={3}
                  value={decisionForm.reason}
                  onChange={(e) => setDecisionForm({ ...decisionForm, reason: e.target.value })}
                  placeholder="e.g. Strong 63% sell-through rate; continuing collection for another 30-day cycle."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.85rem',
                    fontFamily: 'inherit'
                  }}
                  required
                  minLength={5}
                />
              </div>

              {/* Modal Footer Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                <button
                  type="button"
                  onClick={() => setSelectedReview(null)}
                  className="btn btn-outline btn-sm"
                  disabled={decisionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-submit-review-decision"
                  className="btn btn-primary btn-sm"
                  disabled={decisionLoading}
                  style={{ minWidth: '150px' }}
                >
                  {decisionLoading ? 'Applying...' : 'Apply Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Node 8: Dispatch Order Modal Dialog */}
      {dispatchModalOrder && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="dispatch-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(26, 10, 14, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-sm)',
              maxWidth: '540px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--color-border)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--color-surface)'
              }}
            >
              <div>
                <h3 id="dispatch-modal-title" style={{ fontSize: '1.2rem', margin: 0, fontWeight: 600 }}>
                  Dispatch Order &amp; Consume Stock
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
                  Target Order: <strong>{dispatchModalOrder.orderNumber}</strong> ({dispatchModalOrder.customer?.name || dispatchModalOrder.customerName})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDispatchModalOrder(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmDispatch} style={{ padding: '24px' }}>
              {dispatchFeedback && (
                <div style={{ padding: '10px 14px', borderRadius: '4px', backgroundColor: '#E8F5E9', color: '#1B5E20', fontSize: '0.85rem', marginBottom: '16px' }}>
                  {dispatchFeedback}
                </div>
              )}

              <div style={{ backgroundColor: '#FAF8F6', padding: '12px 16px', borderRadius: '4px', marginBottom: '16px', fontSize: '0.82rem' }}>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Inventory Reservation Consumption:</div>
                <div style={{ color: 'var(--color-text-muted)' }}>
                  Confirming courier pickup will transition the reservation into a signed physical inventory deduction (DISPATCH movement) in the warehouse ledger.
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  Courier Carrier
                </label>
                <select
                  value={dispatchCarrier}
                  onChange={(e) => setDispatchCarrier(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.85rem' }}
                >
                  <option value="BlueDart Express">BlueDart Express (Air Courier Insured)</option>
                  <option value="Delhivery Surface">Delhivery Express Logistics</option>
                  <option value="DTDC Premium">DTDC Secure Value Transit</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  Waybill / Tracking Number
                </label>
                <input
                  type="text"
                  value={dispatchTracking}
                  onChange={(e) => setDispatchTracking(e.target.value)}
                  placeholder="e.g. BLUEDART-NSK-9281742 (leave blank to auto-generate)"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                <button
                  type="button"
                  onClick={() => setDispatchModalOrder(null)}
                  className="btn btn-outline btn-sm"
                  disabled={dispatchLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={dispatchLoading}
                  style={{ minWidth: '160px' }}
                >
                  {dispatchLoading ? 'Dispatching...' : 'Confirm Dispatch & Deduct'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Node 8: Return Inspection Modal Dialog */}
      {returnModalOrder && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="return-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(26, 10, 14, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-sm)',
              maxWidth: '540px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--color-border)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--color-surface)'
              }}
            >
              <div>
                <h3 id="return-modal-title" style={{ fontSize: '1.2rem', margin: 0, fontWeight: 600 }}>
                  Inspect Return &amp; Execute Disposition
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
                  Target: Order <strong>{returnModalOrder.orderNumber}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReturnModalOrder(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleProcessReturn} style={{ padding: '24px' }}>
              {returnFeedback && (
                <div style={{ padding: '10px 14px', borderRadius: '4px', backgroundColor: '#E8F5E9', color: '#1B5E20', fontSize: '0.85rem', marginBottom: '16px' }}>
                  {returnFeedback}
                </div>
              )}

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  Physical Inspection Disposition
                </label>
                <select
                  value={returnDisposition}
                  onChange={(e) => setReturnDisposition(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.85rem' }}
                >
                  <option value="SELLABLE_RESTOCK">SELLABLE_RESTOCK — Sanitize &amp; Restock Units into Vault Ledger</option>
                  <option value="DAMAGED_SCRAP">DAMAGED_SCRAP — Write Off Damaged Units (Scrap Ledger)</option>
                  <option value="SUPPLIER_RETURN">SUPPLIER_RETURN — Return to Vendor Quarantine</option>
                </select>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '4px' }}>
                  Per docs/INVENTORY.md: Restock and refund are separate ledger events. Restock creates an append-only movement.
                </span>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  Inspector Notes &amp; Condition Details
                </label>
                <textarea
                  rows={3}
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="e.g. Original seals intact; sanitized with alcohol wipe and restocked into primary batch."
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.85rem', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                <button
                  type="button"
                  onClick={() => setReturnModalOrder(null)}
                  className="btn btn-outline btn-sm"
                  disabled={returnLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={returnLoading}
                  style={{ minWidth: '160px' }}
                >
                  {returnLoading ? 'Processing...' : 'Complete Inspection & Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Node 9: Create Purchase Order Modal Dialog */}
      {createPOModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-po-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(26, 10, 14, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-sm)',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--color-border)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--color-surface)'
              }}
            >
              <div>
                <h3 id="create-po-modal-title" style={{ fontSize: '1.2rem', margin: 0, fontWeight: 600 }}>
                  Draft Artisan Purchase Order
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
                  Restock vault inventory with contracted artisan partner MOQs and terms.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreatePOModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePO} style={{ padding: '24px' }}>
              {createPOFeedback && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '4px',
                    backgroundColor: createPOFeedback.type === 'error' ? '#FEE2E2' : '#E8F5E9',
                    color: createPOFeedback.type === 'error' ? '#991B1B' : '#1B5E20',
                    fontSize: '0.85rem',
                    marginBottom: '16px'
                  }}
                >
                  {createPOFeedback.message}
                </div>
              )}

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  Artisan Guild / Supplier
                </label>
                <select
                  value={poSupplierId}
                  onChange={(e) => {
                    const sId = e.target.value;
                    setPoSupplierId(sId);
                    const sup = liveSuppliers.find((s) => s.id === sId);
                    if (sup && sup.products && sup.products.length > 0) {
                      setPoVariantId(sup.products[0].variantId);
                      setPoQuantity(sup.products[0].moq);
                    }
                  }}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.85rem' }}
                >
                  {liveSuppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code} — {s.city})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  Contracted Design Variant
                </label>
                <select
                  value={poVariantId}
                  onChange={(e) => {
                    const vId = e.target.value;
                    setPoVariantId(vId);
                    const sup = liveSuppliers.find((s) => s.id === poSupplierId);
                    const p = sup?.products?.find((prod) => prod.variantId === vId);
                    if (p) setPoQuantity(p.moq);
                  }}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.85rem' }}
                >
                  {liveSuppliers
                    .find((s) => s.id === poSupplierId)
                    ?.products?.map((p) => (
                      <option key={p.variantId} value={p.variantId}>
                        {p.variantId} (MOQ: {p.moq}) {p.unitCostMinor ? `— ${formatCurrency(p.unitCostMinor, 'INR')}/unit` : ''}
                      </option>
                    ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                    Order Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={poQuantity}
                    onChange={(e) => setPoQuantity(parseInt(e.target.value, 10) || 0)}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.85rem' }}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>
                    Must satisfy supplier MOQ requirement.
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                    Expected Delivery Date
                  </label>
                  <input
                    type="date"
                    value={poExpectedDate}
                    onChange={(e) => setPoExpectedDate(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  Procurement Notes
                </label>
                <input
                  type="text"
                  value={poNotes}
                  onChange={(e) => setPoNotes(e.target.value)}
                  placeholder="e.g. Seasonal festive bridal restock"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                <button
                  type="button"
                  onClick={() => setCreatePOModal(false)}
                  className="btn btn-outline btn-sm"
                  disabled={createPOLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={createPOLoading}
                  style={{ minWidth: '150px' }}
                >
                  {createPOLoading ? 'Submitting...' : 'Create Purchase Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Node 9: Approve Purchase Order Modal Dialog */}
      {approvePOModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="approve-po-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(26, 10, 14, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-sm)',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--color-border)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--color-surface)'
              }}
            >
              <div>
                <h3 id="approve-po-modal-title" style={{ fontSize: '1.2rem', margin: 0, fontWeight: 600 }}>
                  Approve Purchase Order
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
                  Target: <strong>{approvePOModal.poNumber}</strong> ({approvePOModal.supplierName})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setApprovePOModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleApprovePO} style={{ padding: '24px' }}>
              {approvePOFeedback && (
                <div style={{ padding: '10px 14px', borderRadius: '4px', backgroundColor: '#E8F5E9', color: '#1B5E20', fontSize: '0.85rem', marginBottom: '16px' }}>
                  {approvePOFeedback}
                </div>
              )}

              <div style={{ backgroundColor: '#FAF8F6', padding: '12px 16px', borderRadius: '4px', marginBottom: '16px', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Supplier:</span>
                  <strong>{approvePOModal.supplierName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Committed Value:</span>
                  <strong>
                    {approvePOModal.totalCostMinor !== null
                      ? formatCurrency(approvePOModal.totalCostMinor, approvePOModal.currency || 'INR')
                      : 'RBAC Cost Isolated'}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Ordered Items:</span>
                  <span>{approvePOModal.lines?.map((l) => `${l.orderedQuantity}× ${l.variantId}`).join(', ')}</span>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  Manager Approval Notes
                </label>
                <input
                  type="text"
                  value={approvePONotes}
                  onChange={(e) => setApprovePONotes(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                <button
                  type="button"
                  onClick={() => setApprovePOModal(null)}
                  className="btn btn-outline btn-sm"
                  disabled={approvePOLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={approvePOLoading}
                  style={{ minWidth: '150px' }}
                >
                  {approvePOLoading ? 'Approving...' : 'Confirm Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Node 9: Receive Goods Shipment Modal Dialog */}
      {receiveModalPO && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="receive-po-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(26, 10, 14, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-sm)',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--color-border)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--color-surface)'
              }}
            >
              <div>
                <h3 id="receive-po-modal-title" style={{ fontSize: '1.2rem', margin: 0, fontWeight: 600 }}>
                  Receive Goods Shipment (Intake to Vault)
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
                  Target: <strong>{receiveModalPO.poNumber}</strong> ({receiveModalPO.supplierName})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReceiveModalPO(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleReceiveShipment} style={{ padding: '24px' }}>
              {receiveFeedback && (
                <div style={{ padding: '10px 14px', borderRadius: '4px', backgroundColor: '#E8F5E9', color: '#1B5E20', fontSize: '0.85rem', marginBottom: '16px' }}>
                  {receiveFeedback}
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  Vault Batch Reference Identifier
                </label>
                <input
                  type="text"
                  value={receiveBatchRef}
                  onChange={(e) => setReceiveBatchRef(e.target.value)}
                  placeholder="e.g. BATCH-202610-A"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.85rem' }}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>
                  Batch will be appended to physical FIFO inventory ledger with signed RECEIPT movement.
                </span>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '8px' }}>
                  Line Quantities Received (Zero Over-Receipt Gating)
                </label>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {receiveModalPO.lines?.map((line) => {
                    const remainingPending = line.orderedQuantity - line.receivedQuantity;
                    const currentVal = receiveItems[line.variantId] !== undefined ? receiveItems[line.variantId] : 0;

                    return (
                      <div
                        key={line.id || line.variantId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          backgroundColor: '#FAF8F6',
                          borderRadius: '4px',
                          border: '1px solid var(--color-border)'
                        }}
                      >
                        <div style={{ flex: 1, paddingRight: '12px' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>
                            {line.designName || line.variantId}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                            Ordered: {line.orderedQuantity} | Received so far: {line.receivedQuantity} | Remaining: <strong>{remainingPending}</strong>
                          </div>
                        </div>

                        <div style={{ width: '100px' }}>
                          <input
                            type="number"
                            min="0"
                            max={remainingPending}
                            value={currentVal}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10) || 0;
                              setReceiveItems({
                                ...receiveItems,
                                [line.variantId]: Math.min(val, remainingPending)
                              });
                            }}
                            style={{
                              width: '100%',
                              padding: '6px 8px',
                              border: '1px solid var(--color-border)',
                              borderRadius: '4px',
                              textAlign: 'center',
                              fontSize: '0.85rem',
                              fontWeight: 600
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                <button
                  type="button"
                  onClick={() => setReceiveModalPO(null)}
                  className="btn btn-outline btn-sm"
                  disabled={receiveLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={receiveLoading}
                  style={{ minWidth: '170px' }}
                >
                  {receiveLoading ? 'Receiving...' : 'Confirm Goods Intake'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Node 9: Vendor Return Modal Dialog */}
      {returnSupplierModalPO && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="return-supplier-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(26, 10, 14, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-sm)',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--color-border)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--color-surface)'
              }}
            >
              <div>
                <h3 id="return-supplier-modal-title" style={{ fontSize: '1.2rem', margin: 0, fontWeight: 600 }}>
                  Return Defective Units to Vendor
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
                  Target: <strong>{returnSupplierModalPO.poNumber}</strong> ({returnSupplierModalPO.supplierName})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReturnSupplierModalPO(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleReturnSupplier} style={{ padding: '24px' }}>
              {returnSupplierFeedback && (
                <div style={{ padding: '10px 14px', borderRadius: '4px', backgroundColor: '#E8F5E9', color: '#1B5E20', fontSize: '0.85rem', marginBottom: '16px' }}>
                  {returnSupplierFeedback}
                </div>
              )}

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  Vendor Claim Reason
                </label>
                <select
                  value={returnSupplierReason}
                  onChange={(e) => setReturnSupplierReason(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.85rem' }}
                >
                  <option value="DEFECTIVE_OR_DAMAGED">DEFECTIVE_OR_DAMAGED — Physical flaw or transit breakage</option>
                  <option value="SPECIFICATION_MISMATCH">SPECIFICATION_MISMATCH — Plating/carat deviation</option>
                  <option value="QUALITY_AUDIT_FAIL">QUALITY_AUDIT_FAIL — Micron thickness or stone setting failure</option>
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  Units to Return (Bounded: Returned ≤ Received)
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {returnSupplierModalPO.lines
                    ?.filter((l) => l.receivedQuantity > 0)
                    ?.map((line) => {
                      const maxEligible = line.receivedQuantity - line.returnedQuantity;
                      const currentVal = returnSupplierItems[line.variantId] !== undefined ? returnSupplierItems[line.variantId] : 0;

                      return (
                        <div
                          key={line.id || line.variantId}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 12px',
                            backgroundColor: '#FAF8F6',
                            borderRadius: '4px',
                            border: '1px solid var(--color-border)'
                          }}
                        >
                          <div style={{ flex: 1, paddingRight: '12px' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>
                              {line.designName || line.variantId}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                              Total Received: {line.receivedQuantity} | Prev Returned: {line.returnedQuantity} | Max Returnable: <strong>{maxEligible}</strong>
                            </div>
                          </div>

                          <div style={{ width: '100px' }}>
                            <input
                              type="number"
                              min="0"
                              max={maxEligible}
                              value={currentVal}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0;
                                setReturnSupplierItems({
                                  ...returnSupplierItems,
                                  [line.variantId]: Math.min(val, maxEligible)
                                });
                              }}
                              style={{
                                width: '100%',
                                padding: '6px 8px',
                                border: '1px solid var(--color-border)',
                                borderRadius: '4px',
                                textAlign: 'center',
                                fontSize: '0.85rem',
                                fontWeight: 600
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  Claim Notes / Vendor RMA Code
                </label>
                <input
                  type="text"
                  value={returnSupplierNotes}
                  onChange={(e) => setReturnSupplierNotes(e.target.value)}
                  placeholder="e.g. RMA-JPR-2026-891: Defective pearl clasp identified during intake QC"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                <button
                  type="button"
                  onClick={() => setReturnSupplierModalPO(null)}
                  className="btn btn-outline btn-sm"
                  disabled={returnSupplierLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={returnSupplierLoading}
                  style={{ minWidth: '170px' }}
                >
                  {returnSupplierLoading ? 'Processing...' : 'Confirm Vendor Return'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Node 15 Foundation: WooCommerce-Style Product Editor Modal */}
      {editingProduct && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-editor-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(26, 10, 14, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-sm)',
              maxWidth: '820px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--color-border)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--color-surface)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 id="product-editor-modal-title" style={{ fontSize: '1.2rem', margin: 0, fontWeight: 600 }}>
                    Product Editor — {editingProduct.code}
                  </h3>
                  <span className={`badge ${editingProduct.lifecycle === 'active' ? 'badge-success' : 'badge-gold'}`}>
                    {editingProduct.lifecycle}
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
                  WooCommerce-style options: general description, pricing, inventory, dimensions, materials and variations.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            {/* Sub-tab Navigation */}
            <div
              style={{
                display: 'flex',
                gap: '2px',
                borderBottom: '1px solid var(--color-border)',
                backgroundColor: '#FAF8F6',
                padding: '0 16px',
                overflowX: 'auto'
              }}
            >
              {[
                { id: 'general', label: '🏷️ General & Story' },
                { id: 'pricing', label: '💰 Pricing & Tax' },
                { id: 'inventory', label: '📦 Inventory & SKU' },
                { id: 'shipping', label: '🚚 Shipping & Dimensions' },
                { id: 'materials', label: '✨ Materials & Care' },
                { id: 'variations', label: '💎 Variations Matrix' },
                { id: 'publishing', label: '📌 Publishing Status' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setEditActiveSubTab(tab.id)}
                  style={{
                    padding: '10px 14px',
                    border: 'none',
                    background: 'none',
                    fontSize: '0.8rem',
                    fontWeight: editActiveSubTab === tab.id ? 600 : 500,
                    color: editActiveSubTab === tab.id ? 'var(--color-burgundy)' : 'var(--color-text-muted)',
                    borderBottom: editActiveSubTab === tab.id ? '2px solid var(--color-burgundy)' : '2px solid transparent',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveProductEdit} style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              {editFeedback && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '4px',
                    backgroundColor: editFeedback.type === 'error' ? '#FEE2E2' : '#E8F5E9',
                    color: editFeedback.type === 'error' ? '#991B1B' : '#1B5E20',
                    fontSize: '0.85rem',
                    marginBottom: '16px'
                  }}
                >
                  {editFeedback.message}
                </div>
              )}

              {/* Sub-tab 1: General */}
              {editActiveSubTab === 'general' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                      Product Design Title
                    </label>
                    <input
                      type="text"
                      value={editFormData.name || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                        Product Slug / URL Key
                      </label>
                      <input
                        type="text"
                        value={editFormData.slug || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, slug: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                        Design Code / Internal Model ID
                      </label>
                      <input
                        type="text"
                        disabled
                        value={editFormData.code || ''}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.85rem', backgroundColor: '#F3F4F6' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                      Short Storefront Summary
                    </label>
                    <input
                      type="text"
                      value={editFormData.description || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                      placeholder="e.g. Handcrafted 18k gold filigree chandelier earrings..."
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                      Full Artisanal Editorial Narrative &amp; Craft Story
                    </label>
                    <textarea
                      rows={4}
                      value={editFormData.story || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, story: e.target.value })}
                      placeholder="Detailed provenance, history, and craft techniques..."
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.85rem', fontFamily: 'inherit' }}
                    />
                  </div>
                </div>
              )}

              {/* Sub-tab 2: Pricing */}
              {editActiveSubTab === 'pricing' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                        Regular Retail Price (₹ INR)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editFormData.priceRupees || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, priceRupees: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.85rem' }}
                      />
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>
                        Stored internally in paise integer units (e.g. ₹2,499 = 249,900 paise).
                      </span>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                        Sale Price (Optional ₹ INR)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editFormData.salePriceRupees || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, salePriceRupees: e.target.value })}
                        placeholder="Leave blank for regular price"
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#FAF8F6', padding: '12px 16px', borderRadius: '4px', fontSize: '0.8rem' }}>
                    <strong>GST / Tax Calculation:</strong> All Indian luxury jewelry prices displayed on storefront include 3% jewellery GST as standard per statutory compliance.
                  </div>
                </div>
              )}

              {/* Sub-tab 3: Inventory */}
              {editActiveSubTab === 'inventory' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                        Master Design SKU
                      </label>
                      <input
                        type="text"
                        value={editFormData.code || ''}
                        disabled
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.85rem', backgroundColor: '#F3F4F6' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                        Catalogue Stock Status
                      </label>
                      <select
                        value={editFormData.stockStatus || 'IN_STOCK'}
                        onChange={(e) => setEditFormData({ ...editFormData, stockStatus: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.85rem' }}
                      >
                        <option value="IN_STOCK">In Stock (Normal sales permitted)</option>
                        <option value="OUT_OF_STOCK">Out of Stock (Shows Sold Out badge)</option>
                        <option value="ON_BACKORDER">On Backorder (Made-to-Order Artisan Intake)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#FAF8F6', padding: '12px 16px', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    Physical batch stock quantities are tracked strictly in <strong>Tab 4: Inventory &amp; Ageing</strong> through signed ledger receipts to prevent overselling.
                  </div>
                </div>
              )}

              {/* Sub-tab 4: Shipping */}
              {editActiveSubTab === 'shipping' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                        Dimensions
                      </label>
                      <input
                        type="text"
                        value={editFormData.dimensions || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, dimensions: e.target.value })}
                        placeholder="e.g. 7.2 cm drop length, 2.4 cm width"
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                        Piece / Pair Weight
                      </label>
                      <input
                        type="text"
                        value={editFormData.weight || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, weight: e.target.value })}
                        placeholder="e.g. 14g per pair"
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                        Sales Packaging Unit
                      </label>
                      <select
                        value={editFormData.salesUnit || 'piece'}
                        onChange={(e) => setEditFormData({ ...editFormData, salesUnit: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.85rem' }}
                      >
                        <option value="pair">Pair (Earrings standard)</option>
                        <option value="piece">Piece (Ring / Necklace / Nath)</option>
                        <option value="set">Set (Gift bundle / combo)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-tab 5: Materials */}
              {editActiveSubTab === 'materials' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                      Artisanal Materials &amp; Plating
                    </label>
                    <input
                      type="text"
                      value={editFormData.materials || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, materials: e.target.value })}
                      placeholder="e.g. 18k Micron Gold Plating, Hypoallergenic Brass Alloy, Freshwater Pearls"
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                      Care Guidelines &amp; Anti-Tarnish Instructions
                    </label>
                    <textarea
                      rows={3}
                      value={editFormData.care || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, care: e.target.value })}
                      placeholder="e.g. Store in provided velvet pouch. Keep away from water and harsh chemicals."
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.85rem', fontFamily: 'inherit' }}
                    />
                  </div>
                </div>
              )}

              {/* Sub-tab 6: Variations */}
              {editActiveSubTab === 'variations' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.86rem' }}>Contracted Variant Options:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {editFormData.variants?.map((v, idx) => (
                      <div
                        key={v.sku || idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          border: '1px solid var(--color-border)',
                          borderRadius: '4px',
                          backgroundColor: '#FAF8F6'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              backgroundColor: v.hex || '#D4AF37',
                              border: '1px solid #CCC'
                            }}
                          />
                          <div>
                            <strong>{v.name || v.colour}</strong>
                            <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                              SKU: <code>{v.sku}</code>
                            </div>
                          </div>
                        </div>
                        <span className="badge badge-gold">{v.colour}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-tab 7: Publishing */}
              {editActiveSubTab === 'publishing' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                        Product Category
                      </label>
                      <select
                        value={editFormData.category || 'earrings'}
                        onChange={(e) => {
                          const cat = e.target.value;
                          setEditFormData({
                            ...editFormData,
                            category: cat,
                            categoryName: cat.charAt(0).toUpperCase() + cat.slice(1)
                          });
                        }}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.85rem' }}
                      >
                        <option value="earrings">Earrings</option>
                        <option value="rings">Rings</option>
                        <option value="necklaces">Necklaces &amp; Pendants</option>
                        <option value="hair-accessories">Hair Accessories</option>
                        <option value="nose-rings">Nose Rings &amp; Pins</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                        Collection Dimension
                      </label>
                      <select
                        value={editFormData.collectionType || 'monthly_trend'}
                        onChange={(e) => setEditFormData({ ...editFormData, collectionType: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.85rem' }}
                      >
                        <option value="monthly_trend">Monthly Trend Edit (30-Day Lifecycle)</option>
                        <option value="permanent">Permanent Atelier Collection</option>
                        <option value="limited_edition">Limited Edition Festive</option>
                        <option value="trial">Experimental Trial Batch</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                        Lifecycle State
                      </label>
                      <select
                        value={editFormData.lifecycle || 'active'}
                        onChange={(e) => setEditFormData({ ...editFormData, lifecycle: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.85rem' }}
                      >
                        <option value="active">Active (Available for purchase)</option>
                        <option value="clearance">Clearance (Discounted sell-through)</option>
                        <option value="draft">Draft (Private admin preview only)</option>
                        <option value="archived">Archived (Discontinued historical)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                        Publishing Visibility
                      </label>
                      <select
                        value={editFormData.publishState || 'published'}
                        onChange={(e) => setEditFormData({ ...editFormData, publishState: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.85rem' }}
                      >
                        <option value="published">Published (Visible on storefront)</option>
                        <option value="hidden">Hidden (Accessible only by direct link)</option>
                        <option value="draft">Draft (Unpublished)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  paddingTop: '20px',
                  marginTop: '20px',
                  borderTop: '1px solid var(--color-border)'
                }}
              >
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="btn btn-outline btn-sm"
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={editLoading}
                  style={{ minWidth: '160px' }}
                >
                  {editLoading ? 'Saving...' : 'Update Product Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading dashboard workspace...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
