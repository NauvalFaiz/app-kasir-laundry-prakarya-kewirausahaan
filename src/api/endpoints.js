import api from './axios';

// ============================================================
// AUTH
// ============================================================
export const loginAPI = (data) => api.post('/login', data);
export const logoutAPI = () => api.post('/logout');
export const getProfileAPI = () => api.get('/user');
export const updateProfileAPI = (data) => api.put('/user', data);

export const registerUserAPI = (data) => api.post('/register', data);
export const registerOwnerAPI = (data) => api.post('/register/owner', data);
export const registerCourierAPI = (data) => api.post('/register/courier', data);

// ============================================================
// ORDERS (User)
// ============================================================
export const createOrderAPI = (data) => api.post('/orders', data);
export const myOrdersAPI = () => api.get('/my-orders');

// ============================================================
// COURIER
// ============================================================
export const assignOrderAPI = (data) => api.post('/courier/assign', data);
export const updateStepAPI = (data) => api.post('/courier/step', data);
export const inputWeightAPI = (data) => api.post('/courier/weight', data);
export const deliveryBackAPI = (data) => api.post('/courier/delivery-back', data);
export const courierConfirmPaymentAPI = (id) => api.post(`/courier/orders/${id}/confirm`);

// ============================================================
// OWNER
// ============================================================
export const ownerDashboardAPI = () => api.get('/owner/dashboard');
export const ownerOrdersAPI = () => api.get('/owner/orders');
export const receiveOrderAPI = (id) => api.post(`/owner/orders/${id}/receive`);
export const confirmPaymentAPI = (id) => api.post(`/owner/orders/${id}/confirm`);
export const updateOrderStatusAPI = (id, data) => api.post(`/owner/orders/${id}/status`, data);
export const getServicesAPI = () => api.get('/owner/services');
export const addServiceAPI = (data) => api.post('/owner/services', data);
export const updateServiceAPI = (id, data) => api.put(`/owner/services/${id}`, data);
export const createOfflineOrderAPI = (data) => api.post('/owner/orders/offline', data);
export const deleteOrderAPI = (id) => api.delete(`/owner/orders/${id}`);

// ============================================================
// ADMIN
// ============================================================
export const getLaundriesAPI = () => api.get('/admin/laundries');
export const addLaundryAPI = (data) => api.post('/admin/laundry', data);
export const approveOwnerAPI = (id) => api.post(`/admin/laundries/${id}/approve`);
export const approveCourierAPI = (id) => api.post(`/admin/couriers/${id}/approve`);
export const adminOrdersAPI = () => api.get('/admin/orders');
export const adminUpdateOrderAPI = (id, data) => api.post(`/admin/orders/${id}/status`, data);
export const activeCouriersAPI = () => api.get('/admin/couriers/active');
export const getAllCouriersAPI = () => api.get('/admin/couriers');
export const adminAddServiceAPI = (data) => api.post('/admin/services', data);

// ============================================================
// REVIEWS
// ============================================================
export const postReviewAPI = (data) => api.post('/reviews', data);
export const getReviewsAPI = (owner_id) => api.get(`/reviews/${owner_id}`);
