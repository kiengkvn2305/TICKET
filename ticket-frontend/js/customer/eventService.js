/* ==========================================================
   js/customer/eventService.js  (Model)
   Giao tiếp API liên quan đến sự kiện, vé, voucher, đơn hàng.
   Phụ thuộc: common/api.js
   ========================================================== */

const EventService = {
    getAll() {
        return apiFetch("/sukien");
    },

    getById(maSuKien) {
        return apiFetch(`/sukien/${maSuKien}`);
    },

    getTicketsByEvent(maSuKien) {
        return apiFetch(`/ve/sukien/${maSuKien}`);
    },

    getVouchersByEvent(maSuKien) {
        return apiFetch(`/voucher/sukien/${maSuKien}`);
    },

    getVoucherByCode(code, maSuKien) {
        return apiFetch(`/voucher/code/${encodeURIComponent(code)}/sukien/${maSuKien}`);
    },

    getOrganizer(maCongTy) {
        return apiFetch(`/nhatochuc/${maCongTy}`);
    },
};

const OrderService = {
    /**
     * Tạo hoá đơn + chi tiết hóa đơn khi bán vé trực tiếp.
     * maTaiKhoan để null — backend tự tạo KhachHang rỗng.
     */
    purchase(body) {
        return apiFetch("/hoadon/mua", {
            method: "POST",
            body: JSON.stringify(body),
        });
    },

    /**
     * Lấy toàn bộ vé đã bán — dùng cho tab "Vé đã bán" của nhân viên.
     */
    getAll() {
        return apiFetch("/hoadon/tatca");
    },

    /**
     * Lấy vé theo khách hàng — dùng nếu cần lọc riêng.
     */
    getByCustomer(maTaiKhoan) {
        return apiFetch(`/hoadon/khachhang/${maTaiKhoan}`);
    },

    /**
     * Tạo thanh toán với phương thức cụ thể.
     */
    createPayment(body) {
        return apiFetch("/thanhtoan", {
            method: "POST",
            body: JSON.stringify(body),
        });
    },

    requestRefund(body) {
        return apiFetch("/hoanve", {
            method: "POST",
            body: JSON.stringify(body),
        });
    },
};