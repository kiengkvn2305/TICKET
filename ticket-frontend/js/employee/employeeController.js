/* ==========================================================
   js/employee/employeeController.js  (Controller)
   Quy trình bán vé trực tiếp — giống customer:
   Mua vé → Chọn ghế → Chọn voucher → Xác nhận → Thanh toán
   ========================================================== */

const currentUser = JSON.parse(localStorage.getItem("user"));

// ── STATE ────────────────────────────────────────────────
let allEvents           = [];
let allVouchersForEvent = [];
let currentEvent        = null;
let finalTotal          = 0;
let paymentMethod       = null;

// ── KHỞI ĐỘNG ────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
    if (!currentUser) { window.location.href = "loginpopup.html"; return; }
    const el = document.getElementById("welcomeName");
    if (el) el.textContent = currentUser.tenDangNhap || "bạn";
    loadAllEvents();
    _injectToastContainer();
});

// ── TAB ──────────────────────────────────────────────────
function onTabSwitch(tabName) {
    if (tabName === "myTickets" && !_ticketsLoaded) loadMyTickets();
}
const _showTab = showTab;
window.showTab = (name) => _showTab(name, onTabSwitch);

// ── SỰ KIỆN ─────────────────────────────────────────────
function loadAllEvents() {
    EventService.getAll()
        .then(data => {
            allEvents = data;
            EventView.renderEvents(data, "openBuyModal");
            data.forEach(sk => loadEventMeta(sk));
        })
        .catch(err => {
            document.getElementById("eventGrid").innerHTML = errorState(err.message);
        });
}

function loadEventMeta(sk) {
    EventService.getTicketsByEvent(sk.maSuKien)
        .then(tickets => EventView.updatePriceStock(sk.maSuKien, tickets))
        .catch(() => {});

    const loadOrg = (maCongTy) =>
        EventService.getOrganizer(maCongTy)
            .then(org => EventView.updateOrganizerCard(sk.maSuKien, org))
            .catch(() => {});

    if (sk.maCongTy) {
        loadOrg(sk.maCongTy);
    } else {
        EventService.getById(sk.maSuKien)
            .then(detail => { if (detail?.maCongTy) loadOrg(detail.maCongTy); })
            .catch(() => {});
    }
}

function applyEventFilter() {
    const kw   = document.getElementById("filterEvent").value.trim().toLowerCase();
    const sort = document.getElementById("filterSort").value;
    let list   = allEvents.filter(sk => sk.tenSuKien.toLowerCase().includes(kw));
    if (sort === "asc")  list.sort((a, b) => new Date(a.thoiGianBatDau) - new Date(b.thoiGianBatDau));
    if (sort === "desc") list.sort((a, b) => new Date(b.thoiGianBatDau) - new Date(a.thoiGianBatDau));
    EventView.renderEvents(list, "openBuyModal");
}

function onGlobalSearch() {
    document.getElementById("filterEvent").value = document.getElementById("globalSearch").value;
    applyEventFilter();
    showTab("events");
}

// ── BƯỚC 1: MODAL CHỌN VÉ ───────────────────────────────
function openBuyModal(maSuKien) {
    const sk = allEvents.find(e => e.maSuKien === maSuKien);
    if (!sk) return;
    currentEvent = sk;
    CartModel.reset();
    EventView.openBuyModal(sk);

    Promise.all([
        EventService.getTicketsByEvent(maSuKien),
        EventService.getVouchersByEvent(maSuKien),
    ]).then(([tickets, vouchers]) => {
        CartModel.setTickets(tickets);
        window._currentTickets = tickets;
        EventView.renderModalTickets(tickets, CartModel, "changeQty", "inputQty");
        EventView.renderTotal(CartModel.getSubtotal(), 0);
        allVouchersForEvent = vouchers;
    }).catch(err => {
        document.getElementById("modalTicketList").innerHTML =
            `<p style="color:#dc2626;text-align:center">${err.message}</p>`;
    });
}

function closeBuyModal() { EventView.closeBuyModal(); }

function changeQty(maVe, delta, maxConLai) {
    const next = CartModel.changeQty(maVe, delta, maxConLai);
    EventView.syncQtyInput(maVe, next);
    EventView.renderTotal(CartModel.getSubtotal(), CartModel.getDiscount());
}

function inputQty(maVe, maxConLai) {
    const input = document.getElementById(`qty-${maVe}`);
    const next  = CartModel.setQty(maVe, parseInt(input.value) || 0, maxConLai);
    input.value = next;
    EventView.renderTotal(CartModel.getSubtotal(), CartModel.getDiscount());
}

// ── BƯỚC 2: MỞ SƠ ĐỒ GHẾ (sau khi xác nhận vé) ─────────
function openVoucherModal() {
    const items = CartModel.getItems();
    if (!items.length) {
        EventView.showBuyMsg("Vui lòng chọn ít nhất 1 vé.", "err");
        return;
    }

    const totalQty  = items.reduce((s, it) => s + (it.soLuong || 0), 0) || 1;
    const eventName = document.getElementById("modalEventName")?.textContent || "";
    const eventDate = document.getElementById("modalEventDate")?.textContent || "";

    EventView.closeBuyModal();
    _loadBookedSeatsAndOpenMap(eventName, eventDate, totalQty);
}

function _loadBookedSeatsAndOpenMap(eventName, eventDate, totalQty) {
    apiFetch(`/ghe/sukien/${currentEvent.maSuKien}`)
        .then(bookedSeats => {
            const bookedSet = new Set(bookedSeats.map(g => g.soThuTu));
            openSeatModal(eventName, eventDate, totalQty, bookedSet);
        })
        .catch(() => {
            openSeatModal(eventName, eventDate, totalQty, new Set());
        });
}

// ── BƯỚC 3: MỞ MODAL VOUCHER (sau khi chọn ghế) ─────────
function _proceedToVoucherModal() {
    const subtotal = CartModel.getSubtotal();
    const discount = CartModel.getDiscount();
    finalTotal = Math.round(subtotal * (1 - discount / 100));

    document.getElementById("voucherFinalPrice").textContent =
        finalTotal.toLocaleString("vi-VN") + " ₫";

    EventView.renderVoucherList(allVouchersForEvent, "selectVoucher");
    const vld = document.getElementById("voucherListDrop");
    if (vld) vld.style.display = allVouchersForEvent.length ? "block" : "none";

    const vi = document.getElementById("voucherInput");
    const vm = document.getElementById("voucherMsg");
    if (vi) vi.value = "";
    if (vm) { vm.textContent = ""; vm.className = "buy-msg"; }

    const overlay = document.getElementById("voucherOverlay");
    const modal   = document.getElementById("voucherModal");
    overlay.style.display = "block";
    modal.style.display   = "block";
    requestAnimationFrame(() => modal.classList.add("open"));
}

function closeVoucherModal() {
    const overlay = document.getElementById("voucherOverlay");
    const modal   = document.getElementById("voucherModal");
    modal.classList.remove("open");
    setTimeout(() => {
        overlay.style.display = "none";
        modal.style.display   = "none";
    }, 220);
}

function filterVoucherList() {
    const kw = document.getElementById("voucherInput").value.trim().toLowerCase();
    const filtered = allVouchersForEvent.filter(v => v.maCode.toLowerCase().includes(kw));
    EventView.renderVoucherList(filtered, "selectVoucher");
    const vld = document.getElementById("voucherListDrop");
    if (vld) vld.style.display = "block";
}

function selectVoucher(maCode) {
    document.getElementById("voucherInput").value = maCode;
    applyVoucher();
}

function applyVoucher() {
    const code = document.getElementById("voucherInput").value.trim();
    if (!code) { EventView.showVoucherMsg("Vui lòng nhập mã voucher", "err"); return; }
    EventView.showVoucherMsg("Đang kiểm tra...", "");
    EventService.getVoucherByCode(code, currentEvent.maSuKien)
        .then(v => {
            CartModel.setDiscount(v.mucKhuyenMai || 0);
            const subtotal = CartModel.getSubtotal();
            finalTotal = Math.round(subtotal * (1 - CartModel.getDiscount() / 100));
            document.getElementById("voucherFinalPrice").textContent =
                finalTotal.toLocaleString("vi-VN") + " ₫";
            EventView.showVoucherMsg(`✅ Giảm ${CartModel.getDiscount()}%`, "ok");
        })
        .catch(err => {
            CartModel.setDiscount(0);
            finalTotal = CartModel.getSubtotal();
            document.getElementById("voucherFinalPrice").textContent =
                finalTotal.toLocaleString("vi-VN") + " ₫";
            EventView.showVoucherMsg(`❌ ${err.message}`, "err");
        });
}

// ── BƯỚC 4: XÁC NHẬN → MỞ THANH TOÁN ───────────────────
function finalConfirmBuy() {
    closeVoucherModal();
    // Cập nhật finalTotal trước khi mở modal thanh toán
    finalTotal = CartModel.getTotal();
    _openPaymentModal();
}

function _openPaymentModal() {
    const overlay = document.getElementById("paymentOverlay");
    const modal   = document.getElementById("paymentModal");
    overlay.style.display = "block";
    modal.style.display   = "block";
    requestAnimationFrame(() => modal.classList.add("open"));

    document.getElementById("bankSection").style.display  = "none";
    document.getElementById("cashSection").style.display  = "none";
    document.getElementById("paymentMsg").textContent     = "";
    document.getElementById("paymentTotal").textContent   =
        finalTotal.toLocaleString("vi-VN") + " ₫";
}

function closePaymentModal() {
    const modal   = document.getElementById("paymentModal");
    const overlay = document.getElementById("paymentOverlay");
    modal.classList.remove("open");
    setTimeout(() => {
        modal.style.display   = "none";
        overlay.style.display = "none";
    }, 220);
}

// ── BƯỚC 5: CHỌN PHƯƠNG THỨC & THANH TOÁN ───────────────
function selectPaymentMethod(method) {
    paymentMethod = method;
    document.getElementById("bankSection").style.display =
        method === "CHUYEN_KHOAN" ? "block" : "none";
    document.getElementById("cashSection").style.display =
        method === "TIEN_MAT" ? "block" : "none";
}

function calcCashBack() {
    const receive = Number(document.getElementById("cashReceive").value) || 0;
    const change  = receive - finalTotal;
    document.getElementById("cashBack").value = change > 0
        ? change.toLocaleString("vi-VN") + " ₫" : "0 ₫";
}

function confirmTransferPaid() {
    _doCompletePayment({ phuongThuc: "CHUYEN_KHOAN", tienKhachDua: null, tienTraLai: null });
}

function confirmCashPayment() {
    const receive = Number(document.getElementById("cashReceive").value) || 0;
    if (receive < finalTotal) {
        document.getElementById("paymentMsg").textContent = "⚠️ Tiền khách đưa không đủ";
        return;
    }
    _doCompletePayment({
        phuongThuc:   "TIEN_MAT",
        tienKhachDua: receive,
        tienTraLai:   receive - finalTotal,
    });
}

// ── XỬ LÝ HOÀN TẤT THANH TOÁN ───────────────────────────
async function _doCompletePayment(paymentInfo) {
    document.getElementById("paymentMsg").textContent = "⏳ Đang xử lý...";

    const maVoucher     = document.getElementById("voucherInput")?.value.trim() || null;
    const selectedSeats = _buildSelectedSeats();

    try {
        // Bước 1: Tạo hóa đơn
        const hoaDon = await apiFetch("/hoadon/mua", {
            method: "POST",
            body: JSON.stringify({
                maTaiKhoan: null,
                maNhanVien: currentUser.maNhanVien,
                maSuKien:   currentEvent.maSuKien,
                maVoucher:  maVoucher || null,
                items:      CartModel.getItems(),
                ghes:       selectedSeats,
            }),
        });

        // Bước 2: Tạo thanh toán
        const thanhToan = await apiFetch("/thanhtoan", {
            method: "POST",
            body: JSON.stringify({
                maHoaDon:   hoaDon.maHoaDon,
                phuongThuc: paymentInfo.phuongThuc,
                soTien:     hoaDon.thanhTienSau,
                trangThai:  "THANH_CONG",
            }),
        });

        // Bước 3: Hoàn tất
        closePaymentModal();
        window._selectedSeats = [];
        CartModel.reset();
        _showInvoiceModal(hoaDon, thanhToan, paymentInfo);
        showToast(`✅ Bán vé thành công! Hóa đơn #${hoaDon.maHoaDon}`, "success");
        _ticketsLoaded = false;
        loadAllEvents();

    } catch (err) {
        document.getElementById("paymentMsg").textContent = `❌ ${err.message}`;
    }
}

// Map ghế đã chọn → maVe theo loại (VIP / Thường)
function _buildSelectedSeats() {
    const allT = window._currentTickets || [];
    return (window._selectedSeats || []).map(seatId => {
        const isVip  = seatId.charAt(0) <= "C";
        const vipT   = allT.find(t => (t.loaiVe || "").toUpperCase().includes("VIP"));
        const normT  = allT.find(t => !(t.loaiVe || "").toUpperCase().includes("VIP"));
        const matchT = isVip ? (vipT || allT[0]) : (normT || allT[0]);
        return { khuVuc: seatId, maVe: matchT?.maVe };
    });
}

// ── MODAL HÓA ĐƠN SAU BÁN ────────────────────────────────
function _showInvoiceModal(hoaDon, thanhToan, paymentInfo) {
    const fmt       = (n) => Number(n).toLocaleString("vi-VN") + " ₫";
    const fmtMethod = (m) => m === "TIEN_MAT" ? "💵 Tiền mặt" : "📱 Chuyển khoản";
    const now  = new Date();
    const date = now.toLocaleDateString("vi-VN");
    const time = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

    const chiTietRows = (hoaDon.chiTiet || []).map(ct => `
        <tr>
            <td style="padding:6px 8px">Vé #${ct.maVe}</td>
            <td style="padding:6px 8px;text-align:center">${ct.soLuong}</td>
            <td style="padding:6px 8px;text-align:right">${fmt(ct.donGia)}</td>
            <td style="padding:6px 8px;text-align:right;font-weight:600">${fmt(ct.donGia * ct.soLuong)}</td>
        </tr>
    `).join("");

    const discountRow = hoaDon.phanTramGiam
        ? `<tr style="color:#16a34a">
               <td colspan="3" style="padding:6px 8px;text-align:right">Giảm giá (${hoaDon.phanTramGiam}%)</td>
               <td style="padding:6px 8px;text-align:right">-${fmt(hoaDon.thanhTienGoc - hoaDon.thanhTienSau)}</td>
           </tr>`
        : "";

    const cashInfo = paymentInfo.tienKhachDua != null
        ? `<div style="display:flex;justify-content:space-between;margin-top:6px;font-size:.9rem;color:#555">
               <span>Tiền khách đưa</span><span>${fmt(paymentInfo.tienKhachDua)}</span>
           </div>
           <div style="display:flex;justify-content:space-between;font-size:.9rem;color:#555">
               <span>Tiền trả lại</span><span>${fmt(paymentInfo.tienTraLai)}</span>
           </div>`
        : "";

    if (!document.getElementById("invoiceModal")) {
        document.body.insertAdjacentHTML("beforeend", `
            <div id="invoiceOverlay" class="modal-overlay" onclick="closeInvoiceModal()" style="display:none"></div>
            <div id="invoiceModal" class="modal-box" style="display:none;max-width:520px">
                <button class="modal-close" onclick="closeInvoiceModal()">✕</button>
                <div id="invoiceContent"></div>
                <div style="text-align:right;margin-top:20px">
                    <button class="confirm-buy-btn" onclick="closeInvoiceModal()">Đóng</button>
                </div>
            </div>
        `);
    }

    document.getElementById("invoiceContent").innerHTML = `
        <div style="text-align:center;margin-bottom:16px">
            <div style="font-size:2rem">🎫</div>
            <h2 style="margin:4px 0;font-size:1.25rem">Hóa đơn bán vé</h2>
            <p style="color:#888;font-size:.85rem;margin:0">${date} · ${time}</p>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:.85rem;color:#666;margin-bottom:12px">
            <span>Mã hóa đơn: <strong style="color:#111">#${hoaDon.maHoaDon}</strong></span>
            <span>Mã TT: <strong style="color:#111">#${thanhToan.maThanhToan}</strong></span>
        </div>
        <div style="background:#f9fafb;border-radius:10px;padding:10px;margin-bottom:14px;font-size:.85rem;color:#555">
            <div>🎪 Sự kiện: <strong style="color:#111">${currentEvent?.tenSuKien || "—"}</strong></div>
            <div style="margin-top:4px">👤 Nhân viên: <strong style="color:#111">${currentUser.tenDangNhap}</strong></div>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:.88rem">
            <thead>
                <tr style="background:#f3f4f6;color:#374151">
                    <th style="padding:6px 8px;text-align:left">Loại vé</th>
                    <th style="padding:6px 8px;text-align:center">SL</th>
                    <th style="padding:6px 8px;text-align:right">Đơn giá</th>
                    <th style="padding:6px 8px;text-align:right">Thành tiền</th>
                </tr>
            </thead>
            <tbody>${chiTietRows}</tbody>
            <tfoot>
                ${discountRow}
                <tr style="border-top:2px solid #e5e7eb">
                    <td colspan="3" style="padding:8px;text-align:right;font-weight:700">Tổng cộng</td>
                    <td style="padding:8px;text-align:right;font-weight:700;color:#dc2626;font-size:1rem">${fmt(hoaDon.thanhTienSau)}</td>
                </tr>
            </tfoot>
        </table>
        <div style="margin-top:14px;padding:10px;background:#f0fdf4;border-radius:10px;font-size:.88rem">
            <div style="display:flex;justify-content:space-between">
                <span>Phương thức</span>
                <strong>${fmtMethod(thanhToan.phuongThuc)}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;margin-top:4px">
                <span>Trạng thái</span>
                <strong style="color:#16a34a">✅ ${thanhToan.trangThai}</strong>
            </div>
            ${cashInfo}
        </div>
    `;

    document.getElementById("invoiceOverlay").style.display = "block";
    document.getElementById("invoiceModal").style.display   = "block";
    requestAnimationFrame(() => document.getElementById("invoiceModal").classList.add("open"));
}

function closeInvoiceModal() {
    const modal   = document.getElementById("invoiceModal");
    const overlay = document.getElementById("invoiceOverlay");
    if (modal)   { modal.classList.remove("open"); setTimeout(() => modal.style.display = "none", 220); }
    if (overlay) overlay.style.display = "none";
}

// ── XEM HÓA ĐƠN CHI TIẾT (từ tab Vé đã bán) ─────────────
window.openHoaDonDetail = function (g) {
    if (!document.getElementById("invoiceModal")) {
        document.body.insertAdjacentHTML("beforeend", `
            <div id="invoiceOverlay" class="modal-overlay" onclick="closeInvoiceModal()" style="display:none"></div>
            <div id="invoiceModal" class="modal-box" style="display:none;max-width:520px">
                <button class="modal-close" onclick="closeInvoiceModal()">✕</button>
                <div id="invoiceContent"></div>
                <div style="text-align:right;margin-top:20px">
                    <button class="confirm-buy-btn" onclick="closeInvoiceModal()">Đóng</button>
                </div>
            </div>
        `);
    }

    const fmt = (n) => Number(n || 0).toLocaleString("vi-VN") + " ₫";
    const showDiscount = g.thanhTienGoc && g.thanhTien && g.thanhTien < g.thanhTienGoc;

    const rows = (g.tickets || []).map(ve => `
        <tr>
            <td style="padding:7px 8px">
                <div style="font-weight:600;color:#1a1a2e">${escHtml(ve.tenVe || "—")}</div>
                <div style="font-size:.78rem;color:#888">${escHtml(ve.loaiVe || "")}</div>
            </td>
            <td style="padding:7px 8px;text-align:center">${ve.soLuong}</td>
            <td style="padding:7px 8px;text-align:right">${fmt(ve.gia)}</td>
            <td style="padding:7px 8px;text-align:right;font-weight:700">${fmt(ve.gia * ve.soLuong)}</td>
        </tr>
    `).join("");

    const discountRow = showDiscount
        ? `<tr style="color:#16a34a">
               <td colspan="3" style="padding:6px 8px;text-align:right;font-size:.88rem">Giảm giá (voucher)</td>
               <td style="padding:6px 8px;text-align:right">-${fmt(g.thanhTienGoc - g.thanhTien)}</td>
           </tr>` : "";

    const hasPending  = (g.tickets || []).some(v => v.trangThaiHoan === "pending");
    const hasApproved = (g.tickets || []).some(v => v.trangThaiHoan === "approved");
    const hasRejected = (g.tickets || []).some(v => v.trangThaiHoan === "rejected");
    const statusBadge = hasPending
        ? `<span style="background:#fef3c7;color:#92400e;font-size:.75rem;font-weight:700;padding:4px 12px;border-radius:20px">⏳ Chờ hoàn</span>`
        : hasApproved
        ? `<span style="background:#d1fae5;color:#065f46;font-size:.75rem;font-weight:700;padding:4px 12px;border-radius:20px">💚 Đã hoàn</span>`
        : hasRejected
        ? `<span style="background:#fee2e2;color:#991b1b;font-size:.75rem;font-weight:700;padding:4px 12px;border-radius:20px">❌ Hoàn bị từ chối</span>`
        : `<span style="background:#dcfce7;color:#15803d;font-size:.75rem;font-weight:700;padding:4px 12px;border-radius:20px">✅ Đã thanh toán</span>`;

    document.getElementById("invoiceContent").innerHTML = `
        <div style="text-align:center;margin-bottom:18px">
            <div style="font-size:2.2rem">🎫</div>
            <h2 style="margin:6px 0 4px;font-size:1.2rem">Chi tiết hóa đơn #${g.maHoaDon}</h2>
            <p style="color:#888;font-size:.83rem;margin:0">${formatDate(g.ngayMua)}</p>
        </div>
        <div style="background:#f9fafb;border-radius:12px;padding:12px 14px;margin-bottom:16px;font-size:.85rem;color:#555;line-height:1.7">
            <div>🎪 Sự kiện: <strong style="color:#1a1a2e">${escHtml(g.tenSuKien || "—")}</strong></div>
            ${g.thoiGianBatDau ? `<div>📅 Thời gian: <strong style="color:#1a1a2e">${formatDate(g.thoiGianBatDau)} → ${formatDate(g.thoiGianKetThuc)}</strong></div>` : ""}
            <div style="margin-top:6px">${statusBadge}</div>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:.87rem">
            <thead><tr style="background:#f3f4f6;color:#374151">
                <th style="padding:8px;text-align:left">Loại vé</th>
                <th style="padding:8px;text-align:center">SL</th>
                <th style="padding:8px;text-align:right">Đơn giá</th>
                <th style="padding:8px;text-align:right">Thành tiền</th>
            </tr></thead>
            <tbody>${rows}</tbody>
            <tfoot>
                ${discountRow}
                <tr style="border-top:2px solid #e5e7eb">
                    <td colspan="3" style="padding:10px 8px;text-align:right;font-weight:700;font-size:.95rem">Tổng cộng</td>
                    <td style="padding:10px 8px;text-align:right;font-weight:800;color:#0d9488;font-size:1.1rem">${fmt(g.thanhTien || 0)}</td>
                </tr>
            </tfoot>
        </table>
    `;

    const overlay = document.getElementById("invoiceOverlay");
    const modal   = document.getElementById("invoiceModal");
    overlay.style.display = "block";
    modal.style.display   = "block";
    requestAnimationFrame(() => modal.classList.add("open"));
};

// ── TOAST THÔNG BÁO ───────────────────────────────────────
function _injectToastContainer() {
    if (document.getElementById("toast-container")) return;
    const el = document.createElement("div");
    el.id = "toast-container";
    el.style.cssText = `
        position:fixed;top:24px;right:24px;z-index:99999;
        display:flex;flex-direction:column;gap:10px;pointer-events:none;
    `;
    document.body.appendChild(el);
}

function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const colors = {
        success: { bg: "#ecfdf5", border: "#6ee7b7", text: "#065f46" },
        error:   { bg: "#fef2f2", border: "#fca5a5", text: "#991b1b" },
        info:    { bg: "#eff6ff", border: "#93c5fd", text: "#1e40af" },
    };
    const c = colors[type] || colors.success;
    const toast = document.createElement("div");
    toast.style.cssText = `
        background:${c.bg};border:1.5px solid ${c.border};color:${c.text};
        padding:14px 20px;border-radius:14px;font-size:.92rem;font-weight:600;
        font-family:'Inter',sans-serif;box-shadow:0 4px 20px rgba(0,0,0,.12);
        pointer-events:auto;max-width:360px;
        animation:toastIn .3s ease;transition:opacity .4s,transform .4s;
    `;
    toast.textContent = message;
    if (!document.getElementById("toast-keyframes")) {
        const style = document.createElement("style");
        style.id = "toast-keyframes";
        style.textContent = `@keyframes toastIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}`;
        document.head.appendChild(style);
    }
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(40px)";
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

// ── VÉ ĐÃ BÁN + HOÀN VÉ → js/employee/employeeMyTicketsController.js ──
