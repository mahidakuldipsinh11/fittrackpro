import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useProducts } from '../context/ProductContext';
import api from '../api/client';
import {
  LayoutDashboard, Package, ShoppingCart, Users, LogOut, Plus, Pencil,
  Trash2, X, Search, IndianRupee, Menu, Dumbbell, Lock, Mail, Eye, EyeOff, RotateCcw,
  ImagePlus, Upload,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import './Fittrackadmin.css';

const C = {
  orange: '#2563EB',       // Replaced graph accent color with Royal Sapphire Blue!
  blue: '#2563EB',
  green: '#15803D',
  amber: '#D97706',
  red: '#DC2626',
  pink: '#E11D48',
  emerald: '#059669',
  muted: '#6B7280',
  border: '#E5DDD0',
  text: '#111111',
  panel: '#FFFFFF',
  panel2: '#F4EFE6',
};

const STATUS_STYLE = {
  Confirmed: { bg: 'rgba(168,85,247,0.16)', fg: '#c084fc' },
  Processing: { bg: 'rgba(168,85,247,0.16)', fg: '#c084fc' },
  Pending: { bg: 'rgba(234,179,8,0.16)', fg: C.amber },
  Shipped: { bg: 'rgba(59,130,246,0.16)', fg: C.blue },
  Delivered: { bg: 'rgba(34,197,94,0.16)', fg: C.green },
  Cancelled: { bg: 'rgba(239,68,68,0.16)', fg: C.red },
  Returned: { bg: 'rgba(249,115,22,0.16)', fg: '#fb923c' },
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80";

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

const normalizeOrderItems = (items = []) =>
  (Array.isArray(items) ? items : []).map((item) => ({
    id: item?.id || Math.random().toString(36).slice(2),
    name: item?.name || 'Fitness product',
    qty: Number(item?.qty || item?.quantity || 1),
    price: Number(item?.price || 0),
    image: item?.image || FALLBACK_IMAGE,
  }));

// Django Order -> admin panel shape
const mapOrder = (o) => ({
  pk: o.id,               // real DB id -> status update ke liye
  id: o.order_id,         // display order id
  date: o.date,
  total: Number(o.total),
  status: o.status,
  paymentMethod: o.payment_method,
  customer: o.customer,
  userId: o.user_id || null,  // linked user ID from backend
  totalItems: Number(o.total_items || 0),  // total items in this order
  items: (o.items || []).map((it) => ({
    id: it.id,
    name: it.product_name,
    qty: it.quantity,
    price: Number(it.price),
    image: it.image || FALLBACK_IMAGE,
    cat: it.category,
  })),
});

const mapCustomer = (u) => ({
  id: u.id,
  name: u.name || 'FitTrack customer',
  email: u.email || '',
  joined: u.date_joined || '',
});

const customerEmailFromOrder = (order) => order.customer?.email || '';
const customerNameFromOrder = (order) => order.customer?.name || 'Guest customer';

const dateLabel = (date) => {
  if (!date) return '—';
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

/* ---------------------------------------------------------------
   Small UI atoms
---------------------------------------------------------------- */
function Badge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.Pending;
  return (
    <span className="fta-badge" style={{ background: s.bg, color: s.fg }}>
      {status}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="fta-stat-card">
      <div className="fta-stat-card__icon">
        <Icon size={21} color={C.orange} />
      </div>
      <div className="min-w-0">
        <p className="fta-stat-card__label">{label}</p>
        <p className="fta-stat-card__value">{value}</p>
        {sub && <p className="fta-stat-card__sub">{sub}</p>}
      </div>
    </div>
  );
}

function Field({ label, icon: Icon, ...props }) {
  return (
    <label className={`fta-field ${Icon ? 'fta-input-icon-wrap' : ''}`}>
      <span className="fta-field__label">{label}</span>
      {Icon && <Icon size={15} />}
      <input {...props} className="fta-field__input" />
    </label>
  );
}

/* ---------------------------------------------------------------
   Auth screens (real Django is_staff login)
---------------------------------------------------------------- */
function Logo({ size }) {
  return (
    <div className="fta-logo" style={size ? { fontSize: size } : { fontSize: '1.25rem' }}>
      <span className="fta-logo__main">FITTRACK</span>
      <span className="fta-logo__accent">PRO</span>
    </div>
  );
}

function AuthShell({ children }) {
  return (
    <div className="fta fta-auth-shell">
      <div className="fta-auth-card">
        <div className="fta-auth-card__brand">
          <div className="fta-auth-card__brand-icon">🏋️</div>
          <div className="fta-brand-badge-wrap">
            <Logo size="1.6rem" />
            <span className="fta-admin-badge">ADMIN CONTROL PANEL</span>
          </div>
        </div>
        <div className="fta-auth-panel">{children}</div>
        <p className="fta-auth-footer">FitTrack Pro Admin Panel &copy; {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}

function LoginScreen({ onLogin, initialError }) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState(initialError || '');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const res = await api.post('/auth/login/', { email: email.trim().toLowerCase(), password: pw });
      if (!res.data.is_staff) {
        setErr('This account does not have admin access.');
        setBusy(false);
        return;
      }
      localStorage.setItem('fittrack_token', res.data.token);
      localStorage.setItem('fittrack_refresh', res.data.refresh);
      onLogin(res.data.user);
    } catch (e2) {
      if (!e2.response) {
        setErr('Cannot connect to server. Make sure the Django backend is running on port 8000.');
      } else {
        const msg = e2.response?.data?.non_field_errors?.[0] || 'Invalid email or password.';
        setErr(msg);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell>
      <h1 className="fta-auth-title">Admin sign in</h1>
      <p className="fta-auth-sub">Sign in with your Django staff account to manage products, orders and customers.</p>
      <form onSubmit={submit}>
        <Field icon={Mail} label="Email" type="email" placeholder="admin@fittrackpro.com" value={email}
          onChange={(e) => setEmail(e.target.value)} required />
        <div style={{ position: 'relative' }}>
          <Field icon={Lock} label="Password" type={show ? 'text' : 'password'} placeholder="Your password" value={pw}
            onChange={(e) => setPw(e.target.value)} required />
          <button type="button" onClick={() => setShow(!show)} className="fta-toggle-eye">
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {err && <p className="fta-auth-error">{err}</p>}
        <button type="submit" disabled={busy} className="fta-btn fta-btn--primary" style={{ width: '100%' }}>
          {busy ? 'Signing in…' : 'SIGN IN'}
        </button>
      </form>
    </AuthShell>
  );
}

/* ---------------------------------------------------------------
   Product modal
---------------------------------------------------------------- */
function ProductModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(
    initial
      ? {
          name: initial.name || '',
          cat: initial.cat || 'Strength',
          price: initial.price ?? '',
          was: initial.was ?? '',
          stock: initial.stock ?? '',
          image: initial.image || '',
          description: initial.description || '',
          tag: initial.tag || '',
          is_deal: !!initial.is_deal,
        }
      : {
          name: '',
          cat: 'Strength',
          price: '',
          was: '',
          stock: '',
          image: '',
          description: '',
          tag: '',
          is_deal: false,
        }
  );
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initial ? initial.image || '' : '');

  const set = (k) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [k]: value });
  };

  const handleFilePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    e.target.value = '';
  };

  const clearPickedImage = () => {
    if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setImageFile(null);
    setPreviewUrl(initial ? initial.image || '' : '');
  };

  return (
    <div className="fta-modal-overlay">
      <div className="fta-modal" style={{ maxWidth: 520 }}>
        <div className="fta-modal__header">
          <h3 className="fta-modal__title">{initial ? 'Edit product' : 'Add product'}</h3>
          <button onClick={onClose} className="fta-modal__close"><X size={18} /></button>
        </div>
        <Field label="Product name" value={form.name} onChange={set('name')} placeholder="e.g. Kettlebell 16kg" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
          <label className="fta-field">
            <span className="fta-field__label">Category</span>
            <input
              list="fta-cat-list"
              value={form.cat}
              onChange={set('cat')}
              className="fta-field__input"
              placeholder="Strength / Cardio / Barbells..."
            />
            <datalist id="fta-cat-list">
              {['Strength', 'Cardio', 'Mobility', 'Recovery', 'Barbells', 'Plates', 'Racks', 'Benches', 'Dumbbells', 'Kettlebells', 'Accessories', 'Machines'].map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
          <Field label="Tag (optional)" value={form.tag} onChange={set('tag')} placeholder="New / Bestseller" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem' }}>
          <Field label="Price (₹)" type="number" value={form.price} onChange={set('price')} placeholder="0" />
          <Field label="Was Price (₹)" type="number" value={form.was} onChange={set('was')} placeholder="Optional" />
          <Field label="Stock" type="number" value={form.stock} onChange={set('stock')} placeholder="0" />
        </div>
        <div className="fta-image-picker">
          <span className="fta-field__label">Product image</span>
          <div className="fta-image-picker__row">
            <div className="fta-image-picker__preview">
              {previewUrl ? <img src={previewUrl} alt="Product preview" onError={(e) => { e.target.style.display = 'none'; }} /> : <ImagePlus size={22} color={C.muted} />}
            </div>
            <div className="fta-image-picker__actions">
              <label className="fta-btn fta-btn--ghost fta-image-picker__btn">
                <Upload size={14} />
                {imageFile ? 'Change image' : 'Upload from device'}
                <input type="file" accept="image/*" onChange={handleFilePick} hidden />
              </label>
              {(imageFile || previewUrl) && (
                <button type="button" onClick={clearPickedImage} className="fta-btn fta-btn--ghost fta-image-picker__btn">
                  <Trash2 size={14} /> Remove
                </button>
              )}
              {imageFile && (
                <span className="fta-image-picker__filename" title={imageFile.name}>{imageFile.name}</span>
              )}
            </div>
          </div>
          <Field label="…or paste Image URL" value={form.image} onChange={set('image')} placeholder="https://..." />
        </div>
        <label className="fta-field">
          <span className="fta-field__label">Description</span>
          <textarea
            value={form.description}
            onChange={set('description')}
            className="fta-field__input"
            rows={3}
            placeholder="Short product description shown on Shop page"
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.1rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={form.is_deal} onChange={set('is_deal')} />
          <span style={{ fontSize: '0.85rem', color: C.text }}>Show this product on the Deals page</span>
        </label>
        <div className="fta-modal__actions">
          <button onClick={onClose} className="fta-btn fta-btn--ghost">Cancel</button>
          <button
            disabled={saving}
            onClick={async () => {
              if (!form.name || form.price === '') return;
              setSaving(true);
              try {
                await onSave({
                  ...form,
                  price: Number(form.price),
                  was: form.was === '' ? undefined : Number(form.was),
                  stock: form.stock === '' ? 0 : Number(form.stock),
                  imageFile,
                });
              } finally {
                setSaving(false);
              }
            }}
            className="fta-btn fta-btn--primary"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   Quick Image Edit Modal
---------------------------------------------------------------- */
function ImageEditModal({ product, onClose, onSave }) {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(product.image || '');
  const [urlInput, setUrlInput] = useState(product.image || '');
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('upload'); // 'upload' | 'url'

  const handleFilePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    e.target.value = '';
  };

  const handleUrlChange = (e) => {
    setUrlInput(e.target.value);
    setPreviewUrl(e.target.value);
    setImageFile(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        image: imageFile ? product.image : urlInput,
        imageFile: imageFile || null,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fta-modal-overlay">
      <div className="fta-modal fta-image-edit-modal">
        <div className="fta-modal__header">
          <h3 className="fta-modal__title">🖼️ Update Product Image</h3>
          <button onClick={onClose} className="fta-modal__close"><X size={18} /></button>
        </div>

        {/* Product name */}
        <p className="fta-image-edit-product-name">{product.name}</p>

        {/* Preview */}
        <div className="fta-image-edit-preview">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
            />
          ) : (
            <div className="fta-image-edit-placeholder">
              <ImagePlus size={40} color={C.muted} />
              <span>No image set</span>
            </div>
          )}
        </div>

        {/* Tab switcher */}
        <div className="fta-image-edit-tabs">
          <button
            className={`fta-image-edit-tab ${tab === 'upload' ? 'is-active' : ''}`}
            onClick={() => setTab('upload')}
          >
            <Upload size={13} /> Upload from device
          </button>
          <button
            className={`fta-image-edit-tab ${tab === 'url' ? 'is-active' : ''}`}
            onClick={() => setTab('url')}
          >
            <ImagePlus size={13} /> Paste URL
          </button>
        </div>

        {tab === 'upload' && (
          <div className="fta-image-edit-upload-area">
            <label className="fta-image-upload-zone">
              <Upload size={22} color={C.muted} />
              <span>{imageFile ? imageFile.name : 'Click to choose an image file'}</span>
              <small>JPG, PNG, WEBP supported</small>
              <input type="file" accept="image/*" onChange={handleFilePick} hidden />
            </label>
            {imageFile && (
              <button
                type="button"
                className="fta-btn fta-btn--ghost"
                style={{ width: '100%', marginTop: '0.5rem' }}
                onClick={() => { setImageFile(null); setPreviewUrl(product.image || ''); }}
              >
                <Trash2 size={13} /> Remove selected file
              </button>
            )}
          </div>
        )}

        {tab === 'url' && (
          <div style={{ marginTop: '0.75rem' }}>
            <label className="fta-field">
              <span className="fta-field__label">Image URL</span>
              <input
                type="url"
                className="fta-field__input"
                value={urlInput}
                onChange={handleUrlChange}
                placeholder="https://example.com/image.jpg"
              />
            </label>
          </div>
        )}

        <div className="fta-modal__actions" style={{ marginTop: '1rem' }}>
          <button onClick={onClose} className="fta-btn fta-btn--ghost">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving || (!imageFile && !urlInput)}
            className="fta-btn fta-btn--primary"
          >
            {saving ? 'Saving…' : 'Update Image'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   Dashboard sections
---------------------------------------------------------------- */
function Analytics({ products, orders, customers }) {
  const revenue = orders.reduce((s, o) => s + (o.status !== 'Cancelled' ? o.total : 0), 0);
  const chartData = useMemo(() => {
    const byDate = {};
    orders.forEach((o) => {
      if (o.status === 'Cancelled') return;
      byDate[o.date] = (byDate[o.date] || 0) + o.total;
    });
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, total]) => ({ date: date.slice(5), total }));
  }, [orders]);

  return (
    <div>
      <div className="fta-stats-grid">
        <StatCard icon={IndianRupee} label="Revenue" value={inr(revenue)} sub="all time" />
        <StatCard icon={ShoppingCart} label="Orders" value={orders.length} sub={`${orders.filter(o => o.status === 'Confirmed').length} new`} />
        <StatCard icon={Users} label="Customers" value={customers.length} />
        <StatCard icon={Package} label="Products" value={products.length} sub={`${products.filter(p => p.stock < 10).length} low stock`} />
      </div>
      <div className="fta-chart-panel">
        <h3 className="fta-chart-title">Revenue over time</h3>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="date" stroke={C.muted} fontSize={12} tickLine={false} axisLine={{ stroke: C.border }} />
              <YAxis stroke={C.muted} fontSize={12} tickLine={false} axisLine={{ stroke: C.border }}
                tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip
                contentStyle={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 8 }}
                labelStyle={{ color: C.text }} itemStyle={{ color: C.orange }}
                formatter={(v) => inr(v)} />
              <Bar dataKey="total" fill={C.orange} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function OrdersTab({ orders, updateStatus }) {
  const [q, setQ] = useState('');
  const filtered = orders.filter((o) =>
    o.status !== 'Returned' &&
    (o.id.toLowerCase().includes(q.toLowerCase()) || customerNameFromOrder(o).toLowerCase().includes(q.toLowerCase()))
  );
  return (
    <div className="fta-panel">
      <div className="fta-panel__header">
        <div className="fta-search">
          <Search size={15} color={C.muted} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search orders or customers" />
        </div>
      </div>
      <div className="fta-table-wrap">
        <table className="fta-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.pk}>
                <td style={{ fontWeight: 700 }}>{o.id}</td>
                <td>{customerNameFromOrder(o)}</td>
                <td className="fta-muted">{dateLabel(o.date)}</td>
                <td>{inr(o.total)}</td>
                <td>
                  <select value={o.status} onChange={(e) => updateStatus(o.pk, e.target.value)}
                    className="fta-status-select"
                    style={{ background: STATUS_STYLE[o.status]?.bg, color: STATUS_STYLE[o.status]?.fg }}>
                    {Object.keys(STATUS_STYLE).map((s) => <option key={s} value={s} style={{ background: C.panel2, color: C.text }}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="fta-table-empty">No orders match your search.</div>}
      </div>
    </div>
  );
}

function ReturnsTab({ returns, updateReturnStatus }) {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('Active');

  const RETURN_STATUSES = ['Requested', 'Approved', 'Picked Up', 'Inspected', 'Refund Initiated', 'Refund Completed', 'Rejected'];
  const RETURN_STYLE = {
    'Requested': { bg: '#fef3c7', fg: '#92400e' },
    'Approved': { bg: '#dbeafe', fg: '#1e40af' },
    'Picked Up': { bg: '#ede9fe', fg: '#5b21b6' },
    'Inspected': { bg: '#ede9fe', fg: '#5b21b6' },
    'Refund Initiated': { bg: '#d1fae5', fg: '#065f46' },
    'Refund Completed': { bg: '#d1fae5', fg: '#065f46' },
    'Rejected': { bg: '#fee2e2', fg: '#991b1b' },
  };

  const COMPLETED_STATUSES = ['Refund Completed', 'Rejected'];

  const filtered = returns.filter((r) => {
    const matchesSearch =
      (r.order_id_display || '').toLowerCase().includes(q.toLowerCase()) ||
      (r.product_name || '').toLowerCase().includes(q.toLowerCase()) ||
      (r.user_name || '').toLowerCase().includes(q.toLowerCase()) ||
      (r.user_email || '').toLowerCase().includes(q.toLowerCase());
    if (filter === 'Active') return matchesSearch && !COMPLETED_STATUSES.includes(r.status);
    if (filter === 'Completed') return matchesSearch && COMPLETED_STATUSES.includes(r.status);
    return matchesSearch;
  });

  const activeCount = returns.filter(r => !COMPLETED_STATUSES.includes(r.status)).length;
  const completedCount = returns.filter(r => COMPLETED_STATUSES.includes(r.status)).length;

  return (
    <div className="fta-panel">
      <div className="fta-panel__header" style={{ flexDirection: 'column', gap: '0.75rem', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div className="fta-search">
            <Search size={15} color={C.muted} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by order, product, customer, or email" />
          </div>
          <span className="fta-muted" style={{ fontSize: '0.85rem' }}>{filtered.length} returns</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['All', 'Active', 'Completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '8px',
                border: `1.5px solid ${filter === f ? C.orange : C.border}`,
                background: filter === f ? 'rgba(255,153,0,0.15)' : 'transparent',
                color: filter === f ? C.orange : C.muted,
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {f} {f === 'Active' ? `(${activeCount})` : f === 'Completed' ? `(${completedCount})` : `(${returns.length})`}
            </button>
          ))}
        </div>
      </div>
      <div className="fta-table-wrap">
        <table className="fta-table">
          <thead>
            <tr>
              <th>RAN</th>
              <th>Order</th>
              <th>Customer</th>
              <th>Email</th>
              <th>Product</th>
              <th>Reason</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} style={COMPLETED_STATUSES.includes(r.status) ? { opacity: 0.7 } : {}}>
                <td style={{ fontWeight: 700, color: C.orange }}>{r.ran_number}</td>
                <td style={{ fontWeight: 600 }}>{r.order_id_display}</td>
                <td>{r.user_name || '—'}</td>
                <td className="fta-muted" style={{ fontSize: '0.8rem' }}>{r.user_email || '—'}</td>
                <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.product_name}</td>
                <td className="fta-muted" style={{ fontSize: '0.82rem' }}>{r.reason}</td>
                <td style={{ fontWeight: 700, color: C.green }}>{inr(r.return_amount)}</td>
                <td>
                  <select
                    value={r.status}
                    onChange={(e) => updateReturnStatus(r.id, e.target.value)}
                    className="fta-status-select"
                    disabled={COMPLETED_STATUSES.includes(r.status)}
                    style={{
                      background: RETURN_STYLE[r.status]?.bg || C.panel2,
                      color: RETURN_STYLE[r.status]?.fg || C.text,
                      opacity: COMPLETED_STATUSES.includes(r.status) ? 0.6 : 1,
                    }}
                  >
                    {RETURN_STATUSES.map((s) => (
                      <option key={s} value={s} style={{ background: C.panel2, color: C.text }}>{s}</option>
                    ))}
                  </select>
                </td>
                <td className="fta-muted">{dateLabel(r.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="fta-table-empty">No return requests found.</div>}
      </div>
    </div>
  );
}

function ProductsTab({ products, onAdd, onEdit, onDelete }) {
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(null);         // null | 'new' | product object (edit)
  const [imgModal, setImgModal] = useState(null);   // null | product object (quick image edit)
  const filtered = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="fta-panel">
      <div className="fta-panel__header">
        <div className="fta-search">
          <Search size={15} color={C.muted} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" />
        </div>
        <button onClick={() => setModal('new')} className="fta-btn fta-btn--primary">
          <Plus size={14} /> ADD PRODUCT
        </button>
      </div>
      <div className="fta-table-wrap">
        <table className="fta-table">
          <thead>
            <tr>
              <th style={{ width: 56 }}>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                {/* ── Image thumbnail + quick-edit ── */}
                <td>
                  <button
                    className="fta-product-img-btn"
                    onClick={() => setImgModal(p)}
                    title="Click to update image"
                  >
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="fta-product-thumb"
                        onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                      />
                    ) : (
                      <div className="fta-product-thumb fta-product-thumb--empty">
                        <ImagePlus size={16} color={C.muted} />
                      </div>
                    )}
                    <span className="fta-product-img-overlay">
                      <Upload size={12} />
                    </span>
                  </button>
                </td>
                <td style={{ fontWeight: 700 }}>{p.name}</td>
                <td className="fta-muted">{p.cat}</td>
                <td>{inr(p.price)}</td>
                <td>
                  <span style={{ color: p.stock < 10 ? C.red : C.text, fontWeight: p.stock < 10 ? 700 : 400 }}>{p.stock}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button onClick={() => setModal(p)} className="fta-icon-btn"><Pencil size={14} color={C.muted} /></button>
                    <button onClick={() => onDelete(p.id)} className="fta-icon-btn fta-icon-btn--danger"><Trash2 size={14} color={C.red} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="fta-table-empty">No products match your search.</div>}
      </div>

      {/* Full product edit modal */}
      {modal && (
        <ProductModal
          initial={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={async (data) => { modal === 'new' ? await onAdd(data) : await onEdit(modal.id, data); setModal(null); }}
        />
      )}

      {/* Quick image-only edit modal */}
      {imgModal && (
        <ImageEditModal
          product={imgModal}
          onClose={() => setImgModal(null)}
          onSave={async ({ image, imageFile }) => {
            await onEdit(imgModal.id, {
              name: imgModal.name,
              cat: imgModal.cat,
              price: imgModal.price,
              was: imgModal.was,
              stock: imgModal.stock,
              tag: imgModal.tag,
              description: imgModal.description,
              is_deal: imgModal.is_deal,
              image,
              imageFile,
            });
            setImgModal(null);
          }}
        />
      )}
    </div>
  );
}

function CustomersTab({ customers }) {
  const [q, setQ] = useState('');
  const filtered = customers.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()) || c.email.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="fta-panel">
      <div className="fta-panel__header">
        <div className="fta-search">
          <Search size={15} color={C.muted} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customers" />
        </div>
      </div>
      <div className="fta-table-wrap">
        <table className="fta-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td style={{ fontWeight: 700 }}>{c.name}</td>
                <td className="fta-muted">{c.email}</td>
                <td className="fta-muted">{dateLabel(c.joined)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="fta-table-empty">No customers match your search.</div>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   User Purchases Tab
---------------------------------------------------------------- */
function UserPurchasesTab({ customers, orders }) {
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const customerPurchases = useMemo(() => {
    return customers.map((customer) => {
      // Match orders using user_id FK (primary matching)
      // Fallback: match by customer name for guest orders
      const customerOrders = orders
        .filter((o) => o.userId === customer.id || customerNameFromOrder(o) === customer.name)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      const totalSpent = customerOrders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.total : 0), 0);
      const orderCount = customerOrders.length;
      const totalItemsPurchased = customerOrders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.totalItems : 0), 0);
      return { ...customer, orders: customerOrders, totalSpent, orderCount, totalItemsPurchased, lastOrder: customerOrders.length > 0 ? customerOrders[0].date : null };
    }).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [customers, orders]);

  const statusBreakdown = useMemo(() => {
    const counts = {};
    orders.forEach((o) => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({ name: status, value: count, color: STATUS_STYLE[status]?.fg || C.muted }));
  }, [orders]);

  // Top customers by spending (for chart)
  const topCustomers = customerPurchases.filter(c => c.orderCount > 0).slice(0, 8);

  // Top customers by items purchased (for new chart)
  const topByItems = customerPurchases.filter(c => c.totalItemsPurchased > 0).slice(0, 8);

  // Total items purchased across all orders
  const totalItemsAll = orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.totalItems : 0), 0);

  return (
    <div>
      <div className="fta-stats-grid">
        <StatCard icon={Users} label="Total Customers" value={customers.length} sub={`${customerPurchases.filter(c => c.orderCount > 0).length} active`} />
        <StatCard icon={ShoppingCart} label="Total Orders" value={orders.length} sub={`${orders.filter(o => o.status === 'Delivered').length} delivered`} />
        <StatCard icon={IndianRupee} label="Total Revenue" value={inr(orders.reduce((s, o) => s + (o.status !== 'Cancelled' ? o.total : 0), 0))} sub="all time" />
        <StatCard icon={Package} label="Total Items Sold" value={totalItemsAll} sub={`across ${orders.length} orders`} />
      </div>

      <div className="fta-charts-row">
        <div className="fta-chart-panel">
          <h3 className="fta-chart-title">Order Status Distribution</h3>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={statusBreakdown} cx="50%" cy="50%" labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`} outerRadius={80} dataKey="value">
                  {statusBreakdown.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: C.panel2, border: `1px solid ${C.border}` }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="fta-chart-panel">
          <h3 className="fta-chart-title">Top Customers by Spending</h3>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={topCustomers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis type="number" stroke={C.muted} fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                <YAxis dataKey="name" type="category" stroke={C.muted} fontSize={11} width={120} />
                <Tooltip contentStyle={{ background: C.panel2, border: `1px solid ${C.border}` }} formatter={(v) => inr(v)} />
                <Bar dataKey="totalSpent" fill={C.orange} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── NEW: Items Purchased per Customer Chart ── */}
      <div className="fta-charts-row" style={{ marginTop: '1.25rem' }}>
        <div className="fta-chart-panel">
          <h3 className="fta-chart-title">Items Purchased per Customer</h3>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={topByItems} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis type="number" stroke={C.muted} fontSize={11} />
                <YAxis dataKey="name" type="category" stroke={C.muted} fontSize={11} width={120} />
                <Tooltip contentStyle={{ background: C.panel2, border: `1px solid ${C.border}` }} formatter={(v) => [`${v} items`, 'Purchased']} />
                <Bar dataKey="totalItemsPurchased" fill={C.green} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="fta-chart-panel">
          <h3 className="fta-chart-title">Orders per Customer</h3>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={topByItems} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis type="number" stroke={C.muted} fontSize={11} />
                <YAxis dataKey="name" type="category" stroke={C.muted} fontSize={11} width={120} />
                <Tooltip contentStyle={{ background: C.panel2, border: `1px solid ${C.border}` }} formatter={(v) => [`${v} orders`, 'Placed']} />
                <Bar dataKey="orderCount" fill={C.purple} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="fta-purchases-grid">
        <div className="fta-panel fta-customer-list">
          <div className="fta-panel__header" style={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            👥 All Customers
          </div>
          {customerPurchases.length === 0 ? (
            <div className="fta-table-empty">No customers yet</div>
          ) : (
            customerPurchases.map((customer) => (
              <button
                key={customer.id}
                onClick={() => setSelectedCustomer(customer)}
                className={`fta-customer-row ${selectedCustomer?.id === customer.id ? 'is-selected' : ''}`}
              >
                <div className="fta-customer-row__name">
                  <span className="fta-avatar-chip">{customer.name.slice(0, 1).toUpperCase()}</span>
                  {customer.name}
                </div>
                <div className="fta-customer-row__meta">
                  Orders: {customer.orderCount} • Items: {customer.totalItemsPurchased} • {inr(customer.totalSpent)}
                  {customer.lastOrder && <><br />Last purchase: {dateLabel(customer.lastOrder)}</>}
                </div>
              </button>
            ))
          )}
        </div>

        <div>
          {selectedCustomer ? (
            <>
              <div className="fta-detail-card" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{selectedCustomer.name}</h3>
                    <p style={{ fontSize: '0.85rem', color: C.muted, marginTop: '0.25rem' }}>{selectedCustomer.email}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: C.muted }}>Member since</div>
                    <div style={{ fontWeight: 700 }}>{dateLabel(selectedCustomer.joined)}</div>
                  </div>
                </div>
                <div className="fta-detail-stats">
                  <div>
                    <div className="fta-detail-stat-label">Total Orders</div>
                    <div className="fta-detail-stat-value" style={{ color: C.orange }}>{selectedCustomer.orderCount}</div>
                  </div>
                  <div>
                    <div className="fta-detail-stat-label">Items Purchased</div>
                    <div className="fta-detail-stat-value" style={{ color: C.blue }}>{selectedCustomer.totalItemsPurchased}</div>
                  </div>
                  <div>
                    <div className="fta-detail-stat-label">Total Spent</div>
                    <div className="fta-detail-stat-value" style={{ color: C.green, fontSize: '1.05rem' }}>{inr(selectedCustomer.totalSpent)}</div>
                  </div>
                  <div>
                    <div className="fta-detail-stat-label">Status</div>
                    <span className="fta-badge" style={{
                      background: selectedCustomer.orderCount > 0 ? 'rgba(34,197,94,0.16)' : 'rgba(234,179,8,0.16)',
                      color: selectedCustomer.orderCount > 0 ? C.green : C.amber,
                      marginTop: '0.3rem',
                    }}>
                      {selectedCustomer.orderCount > 0 ? 'Active' : 'No Orders'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="fta-panel">
                <div className="fta-panel__header" style={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  📦 Purchase History ({selectedCustomer.orderCount})
                </div>
                {selectedCustomer.orderCount === 0 ? (
                  <div className="fta-table-empty">No purchase history</div>
                ) : (
                  <div style={{ padding: '1rem', maxHeight: 380, overflowY: 'auto' }}>
                    {selectedCustomer.orders.map((order) => {
                      const orderItems = normalizeOrderItems(order.items);
                      return (
                        <div key={order.pk} className="fta-order-card">
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{order.id}</span>
                            <Badge status={order.status} />
                          </div>
                          {orderItems.map((item) => (
                            <div key={`${order.pk}-${item.id}`} className="fta-order-item-row">
                              <img src={item.image} alt={item.name} className="fta-order-item-img"
                                onError={(e) => { e.target.src = FALLBACK_IMAGE; }} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                                <div style={{ fontSize: '0.7rem', color: C.muted }}>Qty: {item.qty}</div>
                              </div>
                              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: C.orange }}>{inr(item.price * item.qty)}</div>
                            </div>
                          ))}
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: C.muted, marginTop: '0.4rem' }}>
                            <span>{dateLabel(order.date)}</span>
                            <span style={{ fontWeight: 700, color: C.orange }}>{inr(order.total)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="fta-empty-state">
              <div className="fta-empty-state__icon">👤</div>
              <p>Select a customer to view their purchase history and details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   Dashboard shell
---------------------------------------------------------------- */
const NAV = [
  { key: 'analytics', label: 'Analytics', icon: LayoutDashboard },
  { key: 'orders', label: 'Orders', icon: ShoppingCart },
  { key: 'returns', label: 'Returns', icon: RotateCcw },
  { key: 'products', label: 'Products', icon: Package },
  { key: 'customers', label: 'Customers', icon: Users },
  { key: 'purchases', label: 'User Purchases', icon: ShoppingCart },
];

function Dashboard({ account, products, orders, customers, returns, actions, onLogout }) {
  const [tab, setTab] = useState('analytics');
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="fta fta-shell">
      <aside className="fta-sidebar">
        <div className="fta-sidebar__brand">
          <div className="fta-sidebar__brand-icon">🏋️</div>
          <div className="fta-brand-badge-wrap">
            <Logo size="1.15rem" />
            <span className="fta-admin-badge">ADMIN DASHBOARD</span>
          </div>
        </div>
        <nav className="fta-nav">
          {NAV.map((n) => (
            <button key={n.key} onClick={() => setTab(n.key)} className={`fta-nav__item ${tab === n.key ? 'is-active' : ''}`}>
              <n.icon size={17} /> {n.label}
            </button>
          ))}
        </nav>
        <div className="fta-sidebar__footer">
          <p className="fta-sidebar__email">{account.email}</p>
          <button onClick={onLogout} className="fta-logout-btn"><LogOut size={15} /> Log out</button>
        </div>
      </aside>

      <div className="fta-main">
        <div className="fta-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🏋️</span>
            <div className="fta-brand-badge-wrap">
              <Logo size="1.05rem" />
              <span className="fta-admin-badge">ADMIN PANEL</span>
            </div>
          </div>
          <button onClick={() => setNavOpen(!navOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <Menu size={20} color={C.text} />
          </button>
        </div>
        {navOpen && (
          <div className="fta-mobile-nav" style={{ display: 'flex' }}>
            {NAV.map((n) => (
              <button key={n.key} onClick={() => { setTab(n.key); setNavOpen(false); }} className={`fta-nav__item ${tab === n.key ? 'is-active' : ''}`}>
                <n.icon size={17} /> {n.label}
              </button>
            ))}
            <button onClick={onLogout} className="fta-logout-btn" style={{ padding: '0.7rem 0.85rem' }}>
              <LogOut size={15} /> Log out
            </button>
          </div>
        )}

        <div className="fta-content">
          <h1 className="fta-page-title">{NAV.find((n) => n.key === tab)?.label}</h1>
          {tab === 'analytics' && <Analytics products={products} orders={orders} customers={customers} />}
          {tab === 'orders' && <OrdersTab orders={orders} updateStatus={actions.updateOrderStatus} />}
          {tab === 'returns' && <ReturnsTab returns={returns} updateReturnStatus={actions.updateReturnStatus} />}
          {tab === 'products' && (
            <ProductsTab products={products} onAdd={actions.addProduct} onEdit={actions.editProduct} onDelete={actions.deleteProduct} />
          )}
          {tab === 'customers' && <CustomersTab customers={customers} />}
          {tab === 'purchases' && <UserPurchasesTab customers={customers} orders={orders} />}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   Root
---------------------------------------------------------------- */
export default function FitTrackAdmin() {
  const [booting, setBooting] = useState(true);
  const [account, setAccount] = useState(null);
  const [authError, setAuthError] = useState('');
  const { products, addProduct, editProduct, deleteProduct } = useProducts();
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [returns, setReturns] = useState([]);

  const loadOrdersAndCustomers = useCallback(async () => {
    try {
      const [ordersRes, customersRes, returnsRes] = await Promise.all([
        api.get('/admin/orders/'),
        api.get('/auth/users/'),
        api.get('/admin/returns/'),
      ]);
      const orderList = ordersRes.data.results || ordersRes.data;
      const userList = customersRes.data.results || customersRes.data;
      const returnList = returnsRes.data.results || returnsRes.data;
      setOrders(orderList.map(mapOrder));
      setCustomers(userList.map(mapCustomer));
      setReturns(returnList);
    } catch (err) {
      console.error('Failed to load admin data', err);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('fittrack_token');
    if (token) {
      api.get('/auth/me/')
        .then((res) => {
          if (!res.data.is_staff) {
            setAuthError('This account does not have admin access. Please sign in with an admin account.');
            localStorage.removeItem('fittrack_token');
            localStorage.removeItem('fittrack_refresh');
          } else {
            setAccount(res.data);
          }
        })
        .catch(() => {
          localStorage.removeItem('fittrack_token');
          localStorage.removeItem('fittrack_refresh');
          setAuthError('Could not connect to server. Please make sure the backend is running on port 8000.');
        })
        .finally(() => setBooting(false));
    } else {
      setBooting(false);
    }
  }, []);

  useEffect(() => {
    if (!account) return;
    loadOrdersAndCustomers();
    const interval = setInterval(loadOrdersAndCustomers, 8000);
    return () => clearInterval(interval);
  }, [account, loadOrdersAndCustomers]);

  const actions = {
    addProduct,
    editProduct,
    deleteProduct,
    updateOrderStatus: async (pk, status) => {
      try {
        await api.patch(`/admin/orders/${pk}/status/`, { status });
        if (status === 'Cancelled') {
          setOrders((prev) => prev.filter((o) => o.pk !== pk));
        } else {
          setOrders((prev) => prev.map((o) => (o.pk === pk ? { ...o, status } : o)));
        }
      } catch (err) {
        console.error('Failed to update order status', err);
      }
    },
    updateReturnStatus: async (pk, status) => {
      try {
        await api.put(`/admin/returns/${pk}/status/`, { status });
        setReturns((prev) => prev.map((r) => (r.id === pk ? { ...r, status } : r)));
      } catch (err) {
        console.error('Failed to update return status', err);
      }
    },
  };

  if (booting) {
    return (
      <div className="fta fta-boot">
        <div className="fta-boot__inner">
          <Dumbbell size={18} color={C.orange} className="fta-spin" />
          <span style={{ fontSize: '0.85rem' }}>Loading admin panel…</span>
        </div>
      </div>
    );
  }

  if (!account) {
    return <LoginScreen onLogin={(acc) => setAccount(acc)} initialError={authError} />;
  }

  return (
    <Dashboard
      account={account}
      products={products}
      orders={orders}
      customers={customers}
      returns={returns}
      actions={actions}
      onLogout={() => {
        localStorage.removeItem('fittrack_token');
        localStorage.removeItem('fittrack_refresh');
        setAccount(null);
      }}
    />
  );
}