/* ==========================================================
   js/customer/customerController.js  (Controller)
   Controller dành riêng cho khách hàng.
   Phụ thuộc (common): api, helpers, authGuard, ui
   Phụ thuộc (shared): eventService, cartModel, eventView, myTicketsView
   ========================================================== */

const currentUser = JSON.parse(localStorage.getItem("user"));

// ── STATE ────────────────────────────────────────────────
let allEvents           = [];
let allVouchersForEvent = [];
let currentEvent        = null;
let allMyTickets        = [];
let activeMyFilter      = "all";
let finalTotal          = 0;

// ── KHỞI ĐỘNG ────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
    if (!currentUser) { window.location.href = "loginpopup.html"; return; }
    const el = document.getElementById("welcomeName");
    if (el) el.textContent = currentUser.tenDangNhap || "bạn";
    loadAllEvents();
});

// ── TAB ──────────────────────────────────────────────────
function onTabSwitch(tabName) {
    if (tabName === "myTickets") loadMyTickets();
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

// ── MODAL MUA VÉ ─────────────────────────────────────────
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
        EventView.renderModalTickets(tickets, CartModel, "changeQty", "inputQty");
        EventView.renderTotal(CartModel.getSubtotal(), 0);
        allVouchersForEvent = vouchers;
        EventView.renderVoucherList(vouchers, "selectVoucher");
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

// ── VOUCHER ───────────────────────────────────────────────
function filterVoucherList() {
    const kw = document.getElementById("voucherInput").value.trim().toLowerCase();
    EventView.renderVoucherList(
        allVouchersForEvent.filter(v => v.maCode.toLowerCase().includes(kw)),
        "selectVoucher"
    );
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
            EventView.renderTotal(CartModel.getSubtotal(), CartModel.getDiscount());
            EventView.showVoucherMsg(`✅ Giảm ${CartModel.getDiscount()}%`, "ok");
        })
        .catch(err => {
            CartModel.setDiscount(0);
            EventView.renderTotal(CartModel.getSubtotal(), 0);
            EventView.showVoucherMsg(`❌ ${err.message}`, "err");
        });
}

// ── XÁC NHẬN MUA ─────────────────────────────────────────
function confirmBuy() {
    const items = CartModel.getItems();
    if (!items.length) { EventView.showBuyMsg("Vui lòng chọn ít nhất 1 vé.", "err"); return; }

    const maVoucher = document.getElementById("voucherInput")?.value.trim() || null;
    const btn = document.getElementById("confirmBuyBtn");
    if (btn) { btn.disabled = true; btn.textContent = "Đang xử lý..."; }

    OrderService.purchase({
        maTaiKhoan: currentUser.maTaiKhoan,
        maSuKien:   currentEvent.maSuKien,
        maVoucher:  maVoucher || null,
        items,
    })
    .then(data => {
        EventView.showBuyMsg(`🎉 Mua thành công! Mã HĐ: #${data.maHoaDon}`, "ok");
        CartModel.reset();
        setTimeout(() => { closeBuyModal(); loadAllEvents(); }, 2200);
    })
    .catch(err => EventView.showBuyMsg(err.message, "err"))
    .finally(() => {
        if (btn) { btn.disabled = false; btn.textContent = "Xác nhận mua"; }
    });
}

// ── VÉ CỦA TÔI + HOÀN VÉ → tách sang js/customer/myTicketsController.js ──────

// ── XEM HÓA ĐƠN CHI TIẾT ─────────────────────────────────
window.openHoaDonDetail = function (g) {
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
           </tr>`
        : "";

    const hasPending  = (g.tickets || []).some(v => v.trangThaiHoan === "pending");
    const hasApproved = (g.tickets || []).some(v => v.trangThaiHoan === "approved");
    const hasRejected = (g.tickets || []).some(v => v.trangThaiHoan === "rejected");
    const statusBadge = hasPending
        ? `<span style="background:#fef3c7;color:#92400e;font-size:.75rem;font-weight:700;padding:4px 12px;border-radius:20px">⏳ Có yêu cầu đang chờ hoàn</span>`
        : hasApproved
        ? `<span style="background:#d1fae5;color:#065f46;font-size:.75rem;font-weight:700;padding:4px 12px;border-radius:20px">💚 Đã hoàn (một phần hoặc toàn bộ)</span>`
        : hasRejected
        ? `<span style="background:#fee2e2;color:#991b1b;font-size:.75rem;font-weight:700;padding:4px 12px;border-radius:20px">❌ Có hoàn bị từ chối</span>`
        : `<span style="background:#dcfce7;color:#15803d;font-size:.75rem;font-weight:700;padding:4px 12px;border-radius:20px">✅ Đã thanh toán</span>`;

    // Inject modal nếu chưa có
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
        <div style="text-align:center;margin-bottom:18px">
            <div style="font-size:2.2rem">🎫</div>
            <h2 style="margin:6px 0 4px;font-size:1.2rem;font-family:'Inter',sans-serif">Chi tiết hóa đơn #${g.maHoaDon}</h2>
            <p style="color:#888;font-size:.83rem;margin:0">${formatDate(g.ngayMua)}</p>
        </div>
        <div style="background:#f9fafb;border-radius:12px;padding:12px 14px;margin-bottom:16px;font-size:.85rem;color:#555;line-height:1.7">
            <div>🎪 Sự kiện: <strong style="color:#1a1a2e">${escHtml(g.tenSuKien || "—")}</strong></div>
            ${g.thoiGianBatDau ? `<div>📅 Thời gian: <strong style="color:#1a1a2e">${formatDate(g.thoiGianBatDau)} → ${formatDate(g.thoiGianKetThuc)}</strong></div>` : ""}
            <div style="margin-top:6px">${statusBadge}</div>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:.87rem">
            <thead>
                <tr style="background:#f3f4f6;color:#374151">
                    <th style="padding:8px;text-align:left">Loại vé</th>
                    <th style="padding:8px;text-align:center">SL</th>
                    <th style="padding:8px;text-align:right">Đơn giá</th>
                    <th style="padding:8px;text-align:right">Thành tiền</th>
                </tr>
            </thead>
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

function closeInvoiceModal() {
    const modal   = document.getElementById("invoiceModal");
    const overlay = document.getElementById("invoiceOverlay");
    if (modal)   { modal.classList.remove("open"); setTimeout(() => modal.style.display = "none", 220); }
    if (overlay) overlay.style.display = "none";
}