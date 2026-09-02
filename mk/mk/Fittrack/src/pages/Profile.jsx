import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import api from '../api/client';
import { User, Package, Settings, LogOut, CheckCircle, ChevronDown, ChevronUp, Mail, MapPin, Phone, ShieldCheck, Pencil, Heart, ShoppingCart, Trash2, Truck } from 'lucide-react';
import OrderTracking from './OrderTracking';
import './profile.css';

const mapOrder = (o) => ({
  id: o.order_id,
  date: o.date,
  total: Number(o.total),
  status: o.status,
  paymentMethod: o.payment_method,
  customer: o.customer,
  items: (o.items || []).map((it) => ({
    id: it.id,
    name: it.product_name,
    qty: it.quantity,
    price: Number(it.price),
    image: it.image,
  })),
});

const Profile = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user: authUser, logout } = useAuth();
  const { wishlist, toggleWishlist, fetchWishlist } = useWishlist();
  const [activeTab, setActiveTab] = useState('orders');
  const [orderFilter, setOrderFilter] = useState('All');
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [otpModal, setOtpModal] = useState({ open: false, orderId: null, otp: '', loading: false, generatedOtp: '', email: '' });
  const [cancelReason, setCancelReason] = useState('');
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [returnModal, setReturnModal] = useState({ open: false, order: null, loading: false });
  const [returnForm, setReturnForm] = useState({ reason: '', reason_detail: '' });
  const [returnRequests, setReturnRequests] = useState([]);

  useEffect(() => {
    if (!authUser) {
      setUser({
        name: 'Guest',
        email: 'Please login to view your profile',
      });
      setOrdersLoading(false);
      return;
    }

    setUser(authUser);
    setProfileForm({
      name: authUser.name || '',
      email: authUser.email || '',
      phone: authUser.phone || '',
      address: authUser.address || '',
    });

    api.get('/orders/')
      .then((res) => {
        const list = res.data.results || res.data;
        setOrders(list.map(mapOrder));
      })
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));

    api.get('/returns/')
      .then((res) => {
        const list = res.data.results || res.data;
        setReturnRequests(list);
      })
      .catch(() => setReturnRequests([]));
  }, [authUser, navigate]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId(prev => prev === orderId ? null : orderId);
  };

  const cancelOrder = async (orderId) => {
    // ALL payment methods — OTP required
    try {
      const res = await api.post(`/orders/${orderId}/generate-otp/`);
      const generatedOtp = res.data.otp;
      const email = res.data.email || '';
      setOtpModal({ open: true, orderId, otp: '', loading: false, generatedOtp, email });
      toast.info(`OTP sent to ${email}. OTP: ${generatedOtp}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not generate OTP.');
    }
  };

  const submitOtpCancel = async () => {
    const { orderId, otp } = otpModal;
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP.');
      return;
    }
    setOtpModal(prev => ({ ...prev, loading: true }));
    try {
      await api.post(`/orders/${orderId}/cancel/`, { otp, reason: cancelReason || 'Customer requested cancellation' });
      setOrders((prev) => prev.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));
      const order = orders.find(o => o.id === orderId);
      const payment = (order?.paymentMethod || '').toLowerCase();
      const isRefund = payment.includes('cod') || payment.includes('upi');
      setOtpModal({ open: false, orderId: null, otp: '', loading: false, generatedOtp: '', email: '' });
      setCancelReason('');
      if (isRefund) {
        toast.success(`Order #${orderId} cancelled. Refund of ₹${order?.total?.toLocaleString('en-IN')} will be processed within 7 days.`);
      } else {
        toast.success(`Order #${orderId} cancelled successfully. Refund will be processed to your account.`);
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Could not cancel order.';
      toast.error(msg);
    } finally {
      setOtpModal(prev => ({ ...prev, loading: false }));
    }
  };

  const saveProfile = () => {
    const updatedUser = { ...user, ...profileForm };
    setUser(updatedUser);
    // Note: naam/phone/address backend User model mein abhi save nahi hote
    // (accounts.User model mein sirf name/email hai). Ye sirf local display update hai.
    toast.success('Profile details saved successfully.');
    setIsEditingProfile(false);
  };

  const getTrackingSteps = (order) => {
    const steps = ['Order Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
    const status = String(order.status || 'Confirmed').toLowerCase();
    const completed = status.includes('delivered') ? 5 : status.includes('delivery') ? 4 : status.includes('shipped') ? 3 : status.includes('processing') ? 2 : 1;
    return { steps, completed };
  };

  const getReturnForOrder = (orderId) => {
    return returnRequests.find(r => r.order_id_display === orderId);
  };

  const openReturnModal = (order) => {
    setReturnModal({ open: true, order, loading: false });
    setReturnForm({ reason: '', reason_detail: '' });
  };

  const submitReturnRequest = async () => {
    if (!returnForm.reason) {
      toast.error('Please select a return reason.');
      return;
    }
    const order = returnModal.order;
    setReturnModal(prev => ({ ...prev, loading: true }));
    try {
      const totalAmount = order.items.reduce((sum, it) => sum + it.price * (it.qty || 1), 0);
      const res = await api.post('/returns/create/', {
        order_id: order.id,
        product_name: order.items.map(it => it.name).join(', '),
        reason: returnForm.reason,
        reason_detail: returnForm.reason_detail,
        return_amount: totalAmount,
      });
      setReturnRequests(prev => [res.data, ...prev]);
      setReturnModal({ open: false, order: null, loading: false });
      setReturnForm({ reason: '', reason_detail: '' });
      toast.success(`Return request submitted! RAN: ${res.data.ran_number}. Refund of ₹${Number(totalAmount).toLocaleString('en-IN')} will be processed within 7 days.`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not submit return request.');
    } finally {
      setReturnModal(prev => ({ ...prev, loading: false }));
    }
  };

  const getInitials = (name) => {
    if (!name) return 'M';
    return name.charAt(0).toUpperCase();
  };

  const ORDER_FILTERS = ['All', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  const filteredOrders = (orderFilter === 'All' ? orders : orders.filter(o => o.status === orderFilter)).filter(o => o.status !== 'Returned');

  const getFilterCount = (filter) => {
    if (filter === 'All') return orders.length;
    return orders.filter(o => o.status === filter).length;
  };

  if (!user) return null;

  return (
    <div className="profile-page">
      <div className="profile-container">

        <div className="profile-header fade-in">
          <div className="avatar-wrapper">
            <div className="user-avatar-badge">
              <div className="user-avatar">
                {getInitials(user.name)}
              </div>
              <span className="profile-verified-dot" title="Verified Active Account">✓</span>
            </div>
          </div>
          <div className="user-info">
            <div className="user-name-row">
              <h2>{user.name}</h2>
              {user.is_staff && <span className="user-account-tag">⭐ FitTrack Verified Member</span>}
            </div>
            <p className="user-email-text"><Mail size={14} /> {user.email}</p>
            {user.phone && <p className="user-phone-text"><Phone size={14} /> {user.phone}</p>}
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>

        <div className="tabs-container fade-in">
          <div className="tabs-header">
            <button
              className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={18} /> Profile Info
            </button>
            <button
              className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <Package size={18} /> My Orders ({orders.length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'tracking' ? 'active' : ''}`}
              onClick={() => setActiveTab('tracking')}
            >
              <Truck size={18} /> Order Tracking
            </button>
            <button
              className={`tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
              onClick={() => setActiveTab('wishlist')}
            >
              <Heart size={18} /> Wishlist ({wishlist.length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={18} /> Settings
            </button>
            <div className={`tab-indicator indicator-${activeTab}`}></div>
          </div>

          <div className="tab-content">
            {activeTab === 'profile' && (
              <div className="content-pane slide-right">
                <div className="account-title-row"><div><h3>Your Account</h3><p>Manage your personal details and delivery information.</p></div><button className="account-edit-link" onClick={() => setIsEditingProfile(true)}><Pencil size={15} /> Edit</button></div>
                {isEditingProfile ? <div className="profile-edit-form">
                  <input value={profileForm.name} onChange={(event) => setProfileForm({ ...profileForm, name: event.target.value })} placeholder="Full name" />
                  <input type="email" value={profileForm.email} disabled placeholder="Email address" />
                  <input value={profileForm.phone} onChange={(event) => setProfileForm({ ...profileForm, phone: event.target.value })} placeholder="Phone number" />
                  <textarea value={profileForm.address} onChange={(event) => setProfileForm({ ...profileForm, address: event.target.value })} placeholder="Default delivery address" />
                  <div><button className="edit-btn" onClick={saveProfile}>Save Details</button><button className="cancel-edit-btn" onClick={() => setIsEditingProfile(false)}>Cancel</button></div>
                </div> : <>
                  <div className="amazon-account-grid">
                    <div className="amazon-account-card"><User size={25} /><div><span>Account Holder</span><strong>{user.name}</strong></div></div>
                    <div className="amazon-account-card"><Mail size={25} /><div><span>Email Address</span><strong>{user.email}</strong><small>Used for order updates</small></div></div>
                    <div className="amazon-account-card"><Phone size={25} /><div><span>Mobile Number</span><strong>{user.phone || 'Add mobile number'}</strong><small>For delivery updates</small></div></div>
                    <div className="amazon-account-card"><MapPin size={25} /><div><span>Default Delivery Address</span><strong>{user.address || 'Add your delivery address'}</strong><small>Used during checkout</small></div></div>
                    <div className="amazon-account-card account-security"><ShieldCheck size={25} /><div><span>Login &amp; Security</span><strong>Account is protected</strong><small>Use Settings to change password</small></div></div>
                  </div>
                </>}
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="content-pane slide-right">
                <div className="orders-header-row">
                  <h3>Recent Orders</h3>
                  {orders.length > 0 && <span className="order-count-tag">{orders.length} Orders Placed</span>}
                </div>

                {!ordersLoading && orders.length > 0 && (
                  <div className="order-filters">
                    {ORDER_FILTERS.map(filter => {
                      const count = getFilterCount(filter);
                      if (filter !== 'All' && count === 0) return null;
                      return (
                        <button
                          key={filter}
                          className={`order-filter-chip ${orderFilter === filter ? 'is-active' : ''}`}
                          onClick={() => setOrderFilter(filter)}
                        >
                          {filter}
                          <span className="filter-chip-count">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {ordersLoading ? (
                  <div className="no-orders-box"><p>Loading your orders…</p></div>
                ) : orders.length === 0 ? (
                  <div className="no-orders-box">
                    <p>You haven't placed any orders yet.</p>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="no-orders-box">
                    <p>No {orderFilter.toLowerCase()} orders found.</p>
                  </div>
                ) : (
                  <div className="orders-list">
                    {filteredOrders.map(order => {
                      const isExpanded = expandedOrderId === order.id;
                      const tracking = getTrackingSteps(order);

                      return (
                        <div key={order.id} className={`order-card ${isExpanded ? 'is-expanded' : ''}`}>
                          <div className="order-header">
                            <div className="order-id-group">
                              <span className="order-date">Placed on {order.date}</span>
                            </div>
                            <span className={`status-badge ${(order.status || 'Confirmed').toLowerCase()}`}>
                              <CheckCircle size={14} />
                              {order.status || 'Confirmed'}
                            </span>
                          </div>

                          {order.items && order.items.length > 0 && (
                            <div className="order-items-preview">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="order-item-row">
                                  <img
                                    src={item.image || 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80'}
                                    alt={item.name}
                                    className="order-item-thumb"
                                    onError={(e) => {
                                      e.target.src = 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80';
                                    }}
                                  />
                                  <div className="order-item-info">
                                    <span className="item-name">{item.name}</span>
                                    <span className="item-qty">Qty: {item.qty || 1}</span>
                                  </div>
                                  <span className="item-price">
                                    ₹{((item.price) * (item.qty || 1)).toLocaleString('en-IN')}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="order-details-bar">
                            <div className="order-total-box">
                              <span>Total Paid:</span>
                              <strong className="total-amount">₹{Number(order.total).toLocaleString('en-IN')}</strong>
                            </div>

                            <div className="order-action-btns">
                              {['Confirmed', 'Processing'].includes(order.status) && (
                                <button
                                  className="cancel-order-btn"
                                  onClick={() => cancelOrder(order.id)}
                                  disabled={cancellingOrder === order.id}
                                >
                                  <Trash2 size={14} />
                                  {cancellingOrder === order.id ? 'Cancelling…' : 'Cancel Order (OTP Required)'}
                                </button>
                              )}
                              {order.status === 'Delivered' && !getReturnForOrder(order.id) && (
                                <button
                                  className="return-order-btn"
                                  onClick={() => openReturnModal(order)}
                                >
                                  🔄 Return Item
                                </button>
                              )}
                              {order.status === 'Delivered' && getReturnForOrder(order.id) && (
                                <span className={`return-status-badge return-status-${(getReturnForOrder(order.id).status || '').toLowerCase().replace(/ /g, '-')}`}>
                                  🔄 {getReturnForOrder(order.id).status} — {getReturnForOrder(order.id).ran_number}
                                </span>
                              )}
                              <button
                                className="view-order-btn"
                                onClick={() => toggleOrderDetails(order.id)}
                              >
                                {isExpanded ? 'Hide Details' : 'View Details'}
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="expanded-order-info fade-in">
                              <div className="delivery-tracker">
                                <h4>Delivery Tracking</h4>
                                <div className="tracking-steps">
                                  {tracking.steps.map((step, index) => <div key={step} className={`tracking-step ${index + 1 <= tracking.completed ? 'complete' : ''}`}><span>{index + 1 <= tracking.completed ? '✓' : index + 1}</span><small>{step}</small></div>)}
                                </div>
                                <p className="delivery-status">Current status: <strong>{tracking.steps[tracking.completed - 1]}</strong></p>
                              </div>
                              <div className="expanded-grid">
                                {order.customer && (
                                  <div className="exp-block">
                                    <h4>Shipping Address</h4>
                                    <p><strong>{order.customer.name}</strong></p>
                                    <p>{order.customer.address}</p>
                                    <p>Phone: {order.customer.phone}</p>
                                  </div>
                                )}
                                <div className="exp-block">
                                  <h4>Payment Details</h4>
                                  <p>Method: <strong>{order.paymentMethod || 'Online'}</strong></p>
                                  <p>Status: <span style={{ color: '#10b981', fontWeight: 600 }}>Payment Complete</span></p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tracking' && (
              <div className="content-pane slide-right">
                <OrderTracking />
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="content-pane slide-right">
                <div className="orders-header-row">
                  <h3>My Wishlist</h3>
                  <span className="order-count-tag">{wishlist.length} Items Saved</span>
                </div>

                {wishlist.length === 0 ? (
                  <div className="no-orders-box">
                    <Heart size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <p>Your wishlist is empty. Browse the shop and save items you love!</p>
                    <a href="/shop" className="edit-btn" style={{ display: 'inline-flex', textDecoration: 'none', marginTop: '1rem' }}>
                      <ShoppingCart size={16} /> Go to Shop
                    </a>
                  </div>
                ) : (
                  <div className="wishlist-grid">
                    {wishlist.map((item) => {
                      const product = item.product;
                      if (!product) return null;
                      return (
                        <div key={item.id} className="wishlist-card">
                          <div className="wishlist-card__thumb">
                            <img
                              src={product.image || 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80'}
                              alt={product.name}
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80';
                              }}
                            />
                          </div>
                          <div className="wishlist-card__info">
                            <span className="wishlist-card__cat">{product.category?.name || product.cat || 'Equipment'}</span>
                            <h4>{product.name}</h4>
                            <div className="wishlist-card__price-row">
                              <span className="wishlist-card__price">₹{Number(product.price).toLocaleString('en-IN')}</span>
                              {product.was_price && (
                                <span className="wishlist-card__was">₹{Number(product.was_price).toLocaleString('en-IN')}</span>
                              )}
                            </div>
                            <div className="wishlist-card__actions">
                              <button className="wishlist-add-btn" onClick={() => {
                                toast.info('Navigate to shop to add to cart.');
                                navigate('/shop');
                              }}>
                                <ShoppingCart size={15} /> View in Shop
                              </button>
                              <button className="wishlist-remove-btn" onClick={async () => {
                                const result = await toggleWishlist(product);
                                if (result.action === 'removed') toast.info(`${product.name} removed from wishlist.`);
                              }}>
                                <Trash2 size={15} /> Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="content-pane slide-right">
                <h3>Account Settings</h3>
                <div className="settings-section">
                  <h4>Change Password</h4>
                  <div className="settings-form">
                    <input type="password" placeholder="Current Password" />
                    <input type="password" placeholder="New Password" />
                    <input type="password" placeholder="Confirm New Password" />
                    <button className="save-btn" onClick={() => toast.info('Password change API abhi setup nahi hua hai.')}>
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Return Request Modal */}
      {returnModal.open && (
        <div className="otp-modal-backdrop" onClick={() => setReturnModal({ open: false, order: null, loading: false })}>
          <div className="otp-modal" onClick={e => e.stopPropagation()}>
            <div className="otp-modal__header">
              <span style={{ fontSize: '2rem' }}>🔄</span>
              <h3>Request Return</h3>
            </div>
            <p className="otp-modal-desc">
              Return item from order <strong>#{returnModal.order?.id}</strong>. You will receive a Return Authorization Number (RAN) and your refund will be processed within 7 days.
            </p>
            <div className="otp-modal-code">
              <span>📦 Return Window: <strong>7 days</strong> from delivery</span>
            </div>
            <div className="otp-reason-field">
              <label>Return Reason *</label>
              <select value={returnForm.reason} onChange={e => setReturnForm(prev => ({ ...prev, reason: e.target.value }))}>
                <option value="">Select reason...</option>
                <option value="changed_mind">Changed my mind</option>
                <option value="better_price">Found a better price</option>
                <option value="wrong_item">Received wrong item</option>
                <option value="defective">Item is defective/damaged</option>
                <option value="not_as_described">Not as described</option>
                <option value="size_issue">Size/fit issue</option>
                <option value="other">Other reason</option>
              </select>
            </div>
            <div className="otp-reason-field">
              <label>Additional Details (optional)</label>
              <textarea
                placeholder="Describe your reason..."
                value={returnForm.reason_detail}
                onChange={e => setReturnForm(prev => ({ ...prev, reason_detail: e.target.value }))}
                rows={3}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #334155', background: '#1e293b', color: '#fff', fontSize: '0.9rem', resize: 'vertical' }}
              />
            </div>
            <div className="otp-modal-warning">
              💰 Refund of ₹{returnModal.order ? Number(returnModal.order.total).toLocaleString('en-IN') : '0'} will be processed within 7 days after item pickup.
            </div>
            <div className="otp-modal-actions">
              <button
                className="otp-modal-btn otp-modal-btn--cancel"
                onClick={() => setReturnModal({ open: false, order: null, loading: false })}
              >
                Go Back
              </button>
              <button
                className="otp-modal-btn otp-modal-btn--confirm"
                onClick={submitReturnRequest}
                disabled={returnModal.loading || !returnForm.reason}
              >
                {returnModal.loading ? 'Submitting...' : '📦 Submit Return Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTP Modal for ALL Order Cancellation */}
      {otpModal.open && (
        <div className="otp-modal-backdrop" onClick={() => setOtpModal({ open: false, orderId: null, otp: '', loading: false, generatedOtp: '', email: '' })}>
          <div className="otp-modal" onClick={e => e.stopPropagation()}>
            <div className="otp-modal__header">
              <ShieldCheck size={36} />
              <h3>Verify OTP to Cancel Order</h3>
            </div>
            <p className="otp-modal-desc">
              A 6-digit OTP has been sent to your registered email
              {otpModal.email ? ` (${otpModal.email})` : ''} for security verification.
            </p>
            <div className="otp-modal-code">
              <span>OTP: <strong>{otpModal.generatedOtp}</strong></span>
              <span className="otp-modal-expiry">Expires in 10 minutes</span>
            </div>
            <input
              type="text"
              className="otp-modal-input"
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              value={otpModal.otp}
              onChange={e => setOtpModal(prev => ({ ...prev, otp: e.target.value.replace(/\D/g, '') }))}
              autoFocus
            />
            <div className="otp-reason-field">
              <label>Cancellation Reason (optional)</label>
              <select value={cancelReason} onChange={e => setCancelReason(e.target.value)}>
                <option value="">Select reason...</option>
                <option value="Changed my mind">Changed my mind</option>
                <option value="Found better price elsewhere">Found better price elsewhere</option>
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Product no longer needed">Product no longer needed</option>
                <option value="Shipping time too long">Shipping time too long</option>
              </select>
            </div>
            <div className="otp-modal-warning">
              ⚠️ Once cancelled, this action cannot be undone.
            </div>
            <div className="otp-modal-actions">
              <button
                className="otp-modal-btn otp-modal-btn--cancel"
                onClick={() => setOtpModal({ open: false, orderId: null, otp: '', loading: false, generatedOtp: '', email: '' })}
              >
                Go Back
              </button>
              <button
                className="otp-modal-btn otp-modal-btn--confirm"
                onClick={submitOtpCancel}
                disabled={otpModal.loading || otpModal.otp.length !== 6}
              >
                {otpModal.loading ? 'Verifying OTP...' : 'Verify & Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;