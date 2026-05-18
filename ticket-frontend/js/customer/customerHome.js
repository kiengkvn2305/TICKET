/* ==========================================================
   js/customer/customerHome.js
   ========================================================== */

const currentUser = JSON.parse(localStorage.getItem("user"));

let allEvents        = [];
let cartMap          = {};
let modalTickets     = [];
let currentEvent     = null;
let appliedDiscount  = 0;
let allMyTickets     = [];      // raw list từ API
let activeMyFilter   = "all";   // tab filter hiện tại

/* ── KHỞI ĐỘNG ── */
window.addEventListener("DOMContentLoaded", () => {
    if (!currentUser) { window.location.href = "loginpopup.html"; return; }
    const el = document.getElementById("welcomeName");
    if (el) el.textContent = currentUser.tenDangNhap || "bạn";
    loadAllEvents();
});

/* ========================================================
   TAB CHÍNH
   ======================================================== */
function showTab(tabName) {
    document.querySelectorAll(".tab-btn").forEach(b  => b.classList.remove("active"));
    document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
    document.getElementById("tab-"  + tabName).classList.add("active");
    document.getElementById("pane-" + tabName).classList.add("active");
    if (tabName === "myTickets") loadMyTickets();
    const menu = document.getElementById("menu");
    if (menu) menu.classList.remove("show");
}

/* ========================================================
   SỰ KIỆN
   ======================================================== */
function loadAllEvents() {
    fetch(`${BASE_URL}/sukien`)
        .then(res => { if (!res.ok) throw new Error("Không lấy được danh sách sự kiện"); return res.json(); })
        .then(data => { allEvents = data; renderEvents(data); })
        .catch(err => { document.getElementById("eventGrid").innerHTML = errorState(err.message); });
}

function applyEventFilter() {
    const keyword = document.getElementById("filterEvent").value.trim().toLowerCase();
    const sort    = document.getElementById("filterSort").value;
    let filtered  = allEvents.filter(sk => sk.tenSuKien.toLowerCase().includes(keyword));
    if (sort === "asc")  filtered.sort((a, b) => new Date(a.thoiGianBatDau) - new Date(b.thoiGianBatDau));
    if (sort === "desc") filtered.sort((a, b) => new Date(b.thoiGianBatDau) - new Date(a.thoiGianBatDau));
    renderEvents(filtered);
}

function onGlobalSearch() {
    const keyword = document.getElementById("globalSearch").value.trim().toLowerCase();
    document.getElementById("filterEvent").value = keyword;
    applyEventFilter();
    showTab("events");
}

function renderEvents(data) {
    const grid = document.getElementById("eventGrid");
    if (!data.length) {
        grid.innerHTML = `<div class="empty-state"><div class="empty-icon">🎪</div><p>Không tìm thấy sự kiện nào.</p></div>`;
        return;
    }
    grid.innerHTML = data.map((sk, idx) => `
        <div class="event-card-customer" style="animation-delay:${idx * 0.06}s">
            <div class="card-color-bar"></div>
            <div class="card-body">
                <h3 class="card-event-name">${escHtml(sk.tenSuKien)}</h3>
                <p class="card-event-desc">${escHtml(sk.moTa || "Không có mô tả")}</p>
                <div class="card-dates">
                    <span class="date-badge">📅 Bắt đầu: ${formatDate(sk.thoiGianBatDau)}</span>
                    <span class="date-badge">🏁 Kết thúc: ${formatDate(sk.thoiGianKetThuc)}</span>
                </div>
            </div>
            <div class="card-footer">
                <span class="ticket-count-badge" id="min-price-${sk.maSuKien}">Đang tải...</span>
                <button class="buy-btn" onclick="openBuyModal(${sk.maSuKien})">Mua vé</button>
            </div>
        </div>`).join("");
    data.forEach(sk => loadMinPrice(sk.maSuKien));
}

function loadMinPrice(maSuKien) {
    fetch(`${BASE_URL}/ve/sukien/${maSuKien}`)
        .then(r => r.ok ? r.json() : [])
        .then(tickets => {
            const el = document.getElementById(`min-price-${maSuKien}`);
            if (!el) return;
            if (!tickets || !tickets.length) { el.textContent = "Liên hệ"; return; }
            el.textContent = "Từ " + formatPrice(Math.min(...tickets.map(v => v.gia)));
        })
        .catch(() => { const el = document.getElementById(`min-price-${maSuKien}`); if (el) el.textContent = "—"; });
}

/* ========================================================
   MODAL MUA VÉ
   ======================================================== */
function openBuyModal(maSuKien) {
    const sk = allEvents.find(e => e.maSuKien === maSuKien);
    if (!sk) return;

    currentEvent    = sk;
    cartMap         = {};
    appliedDiscount = 0;

    document.getElementById("buyMsg").textContent  = "";
    document.getElementById("buyMsg").className    = "buy-msg";
    const vi = document.getElementById("voucherInput");  if (vi) vi.value = "";
    const vm = document.getElementById("voucherMsg");    if (vm) { vm.textContent = ""; vm.className = "buy-msg"; }
    const vld = document.getElementById("voucherListDrop"); if (vld) vld.style.display = "none";

    document.getElementById("modalEventName").textContent = sk.tenSuKien;
    document.getElementById("modalEventDate").textContent = `📅 ${formatDate(sk.thoiGianBatDau)} → ${formatDate(sk.thoiGianKetThuc)}`;
    document.getElementById("modalTicketList").innerHTML  = `<div class="loading-state"><div class="spinner"></div><p>Đang tải vé...</p></div>`;

    document.getElementById("buyOverlay").style.display = "block";
    const box = document.getElementById("buyModal");
    box.style.display = "block";
    requestAnimationFrame(() => box.classList.add("open"));

    Promise.all([
        fetch(`${BASE_URL}/ve/sukien/${maSuKien}`).then(r => r.ok ? r.json() : []),
        fetch(`${BASE_URL}/voucher/sukien/${maSuKien}`).then(r => r.ok ? r.json() : [])
    ]).then(([tickets, vouchers]) => {
        modalTickets = tickets;
        renderModalTickets(tickets);
        renderVoucherList(vouchers);
    }).catch(err => {
        document.getElementById("modalTicketList").innerHTML = `<p style="color:#dc2626;text-align:center">${err.message}</p>`;
    });
}

function closeBuyModal() {
    const box = document.getElementById("buyModal");
    box.classList.remove("open");
    setTimeout(() => { box.style.display = "none"; document.getElementById("buyOverlay").style.display = "none"; }, 220);
}

function renderModalTickets(tickets) {
    const list         = document.getElementById("modalTicketList");
    const voucherRow   = document.getElementById("voucherRow");
    const modalSummary = document.getElementById("modalSummary");
    const available    = tickets.filter(v => v.trangThai !== "Hết vé");

    if (!available.length) {
        list.innerHTML = `<div class="empty-state"><div class="empty-icon">😔</div><p>Sự kiện này đã hết vé.</p></div>`;
        if (voucherRow)   voucherRow.style.display   = "none";
        if (modalSummary) modalSummary.style.display = "none";
        return;
    }

    list.innerHTML = available.map(ve => `
        <div class="modal-ticket-row">
            <div class="modal-ticket-info">
                <div class="modal-ticket-name">${escHtml(ve.tenVe)}</div>
                <div class="modal-ticket-type">${escHtml(ve.loaiVe || "")}
                    ${ve.trangThai ? `<span class="status-badge ${ve.trangThai === "Còn vé" ? "status-available" : "status-sold"}">${ve.trangThai}</span>` : ""}
                </div>
            </div>
            <div class="modal-ticket-price-tag">${formatPrice(ve.gia)}</div>
            <div class="qty-control">
                <button class="qty-btn" onclick="changeQty(${ve.maVe}, -1, ${ve.gia})">−</button>
                <span class="qty-display" id="qty-${ve.maVe}">0</span>
                <button class="qty-btn" onclick="changeQty(${ve.maVe},  1, ${ve.gia})">+</button>
            </div>
        </div>`).join("");

    if (voucherRow)   voucherRow.style.display   = "";
    if (modalSummary) modalSummary.style.display = "";
    updateTotal();
}

function changeQty(maVe, delta) {
    cartMap[maVe] = Math.max(0, (cartMap[maVe] || 0) + delta);
    const el = document.getElementById(`qty-${maVe}`);
    if (el) el.textContent = cartMap[maVe];
    updateTotal();
}

function updateTotal() {
    let total = 0;
    modalTickets.forEach(ve => { total += (cartMap[ve.maVe] || 0) * ve.gia; });
    const el = document.getElementById("totalPrice");
    if (!el) return;
    if (appliedDiscount > 0) {
        const sau = Math.round(total * (1 - appliedDiscount / 100));
        el.innerHTML = `<span style="text-decoration:line-through;color:#aaa;font-weight:400">${formatPrice(total)}</span>
            &nbsp;→&nbsp;<span style="color:#e55">${formatPrice(sau)}</span>
            <span style="font-size:0.8rem;color:#e55;font-weight:600"> (-${appliedDiscount}%)</span>`;
    } else {
        el.textContent = formatPrice(total);
    }
}

let allVouchersForEvent = [];
function renderVoucherList(vouchers) {
    allVouchersForEvent = vouchers;
    const drop = document.getElementById("voucherListDrop");
    if (!drop) return;
    if (!vouchers.length) { drop.style.display = "none"; return; }
    drop.style.display = "block";
    drop.innerHTML = vouchers.map(v => `
        <div class="voucher-drop-item" onclick="selectVoucher('${escHtml(v.maCode)}')">
            <span class="voucher-drop-code">${escHtml(v.maCode)}</span>
            <span class="voucher-drop-pct">-${v.mucKhuyenMai}%</span>
            <span class="voucher-drop-desc">${escHtml(v.dieuKien || "")}</span>
        </div>`).join("");
}
function filterVoucherList() {
    const kw = document.getElementById("voucherInput").value.trim().toLowerCase();
    renderVoucherList(allVouchersForEvent.filter(v => v.maCode.toLowerCase().includes(kw)));
}
function selectVoucher(maCode) {
    document.getElementById("voucherInput").value = maCode;
    applyVoucher();
}

function applyVoucher() {
    const code  = document.getElementById("voucherInput").value.trim();
    const msgEl = document.getElementById("voucherMsg");
    if (!code) { msgEl.textContent = "Vui lòng nhập mã voucher"; msgEl.className = "buy-msg err"; return; }
    msgEl.textContent = "Đang kiểm tra..."; msgEl.className = "buy-msg";
    fetch(`${BASE_URL}/voucher/code/${encodeURIComponent(code)}/sukien/${currentEvent.maSuKien}`)
        .then(async res => { if (!res.ok) { const t = await res.text(); throw new Error(t || "Mã voucher không hợp lệ"); } return res.json(); })
        .then(v => { appliedDiscount = v.mucKhuyenMai || 0; updateTotal(); msgEl.textContent = `✅ Áp dụng thành công! Giảm ${appliedDiscount}%`; msgEl.className = "buy-msg ok"; })
        .catch(err => { appliedDiscount = 0; updateTotal(); msgEl.textContent = `❌ ${err.message}`; msgEl.className = "buy-msg err"; });
}

function confirmBuy() {
    const items = modalTickets.filter(ve => (cartMap[ve.maVe] || 0) > 0)
        .map(ve => ({ maVe: ve.maVe, soLuong: cartMap[ve.maVe], donGia: ve.gia }));
    if (!items.length) { showBuyMsg("Vui lòng chọn ít nhất 1 vé.", "err"); return; }
    const maVoucher = document.getElementById("voucherInput")?.value.trim() || null;
    const btn = document.getElementById("confirmBuyBtn");
    btn.disabled = true; btn.textContent = "Đang xử lý...";
    fetch(`${BASE_URL}/hoadon/mua`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maTaiKhoan: currentUser.maTaiKhoan, maSuKien: currentEvent.maSuKien, maVoucher: maVoucher || null, items })
    })
    .then(async res => { if (!res.ok) { const t = await res.text(); throw new Error(t || "Mua vé thất bại"); } return res.json(); })
    .then(data => {
        let msg = `🎉 Mua vé thành công! Mã hóa đơn: #${data.maHoaDon}`;
        if (data.phanTramGiam) msg += ` — Giảm ${data.phanTramGiam}% → Còn ${formatPrice(data.thanhTienSau)}`;
        showBuyMsg(msg, "ok");
        cartMap = {};
        setTimeout(closeBuyModal, 2500);
    })
    .catch(err => showBuyMsg(err.message, "err"))
    .finally(() => { btn.disabled = false; btn.textContent = "Xác nhận mua"; });
}

function showBuyMsg(text, type) {
    const el = document.getElementById("buyMsg"); el.textContent = text; el.className = "buy-msg " + type;
}

/* ========================================================
   VÉ CỦA TÔI — nhóm theo hóa đơn
   ======================================================== */
function loadMyTickets() {
    const container = document.getElementById("myTicketsList");
    container.innerHTML = `<div class="loading-state"><div class="spinner"></div><p>Đang tải vé của bạn...</p></div>`;

    fetch(`${BASE_URL}/hoadon/khachhang/${currentUser.maTaiKhoan}`)
        .then(res => { if (!res.ok) throw new Error("Không lấy được vé"); return res.json(); })
        .then(data => { allMyTickets = data; activeMyFilter = "all"; renderMyTickets(); })
        .catch(err => { document.getElementById("myTicketsList").innerHTML = errorState(err.message); });
}

/* ── Filter tab ── */
function applyMyTicketFilter(filter) {
    activeMyFilter = filter;
    document.querySelectorAll(".my-filter-btn").forEach(b =>
        b.classList.toggle("active", b.dataset.filter === filter)
    );
    renderMyTickets();
}

/* ── Nhóm danh sách vé theo maHoaDon ── */
function renderMyTickets() {
    const container = document.getElementById("myTicketsList");

    // ── Lọc theo tab ──
    let filtered = allMyTickets;
    if (activeMyFilter === "pending")  filtered = allMyTickets.filter(v => v.trangThaiHoan === "pending");
    if (activeMyFilter === "approved") filtered = allMyTickets.filter(v => v.trangThaiHoan === "approved");
    if (activeMyFilter === "rejected") filtered = allMyTickets.filter(v => v.trangThaiHoan === "rejected");
    if (activeMyFilter === "normal")   filtered = allMyTickets.filter(v => !v.trangThaiHoan);

    // ── Filter bar ──
    const counts = {
        all:      allMyTickets.length,
        normal:   allMyTickets.filter(v => !v.trangThaiHoan).length,
        pending:  allMyTickets.filter(v => v.trangThaiHoan === "pending").length,
        approved: allMyTickets.filter(v => v.trangThaiHoan === "approved").length,
        rejected: allMyTickets.filter(v => v.trangThaiHoan === "rejected").length,
    };

    const filterBar = `
        <div class="my-filter-bar">
            ${[
                { key: "all",      label: "🎫 Tất cả",           cnt: counts.all },
                { key: "normal",   label: "✅ Đã thanh toán",     cnt: counts.normal },
                { key: "pending",  label: "⏳ Đang chờ hoàn",     cnt: counts.pending },
                { key: "approved", label: "💚 Hoàn thành công",   cnt: counts.approved },
                { key: "rejected", label: "❌ Hoàn thất bại",     cnt: counts.rejected },
            ].map(t => `
                <button class="my-filter-btn ${activeMyFilter === t.key ? "active" : ""}"
                        data-filter="${t.key}" onclick="applyMyTicketFilter('${t.key}')">
                    ${t.label}
                    ${t.cnt > 0 ? `<span class="filter-count">${t.cnt}</span>` : ""}
                </button>`).join("")}
        </div>`;

    if (!filtered.length) {
        container.innerHTML = filterBar + `
            <div class="empty-state">
                <div class="empty-icon">🎫</div>
                <p>${activeMyFilter === "all" ? "Bạn chưa có vé nào." : "Không có vé trong mục này."}</p>
            </div>`;
        return;
    }

    // ── Nhóm theo maHoaDon ──
    const groups = new Map();
    filtered.forEach(ve => {
        const hdId = ve.maHoaDon;
        if (!groups.has(hdId)) {
            groups.set(hdId, {
                maHoaDon:     ve.maHoaDon,
                ngayMua:      ve.ngayMua,
                tenSuKien:    ve.tenSuKien,
                thanhTien:    ve.thanhTien,
                thanhTienGoc: ve.thanhTienGoc,
                tickets:      []
            });
        }
        groups.get(hdId).tickets.push(ve);
    });

    const blocksHtml = [...groups.values()].map((group, gIdx) => {
        // ── Trạng thái tổng của hóa đơn (worst-case: pending > rejected > approved > null) ──
        const hasApproved = group.tickets.some(v => v.trangThaiHoan === "approved");
        const hasPending  = group.tickets.some(v => v.trangThaiHoan === "pending");
        const hasRejected = group.tickets.some(v => v.trangThaiHoan === "rejected");
        const hasNormal   = group.tickets.some(v => !v.trangThaiHoan);

        // ── Badge hóa đơn ──
        let hdBadge = "";
        if (hasPending)       hdBadge = `<span class="hd-badge badge-pending">⏳ Có yêu cầu hoàn đang chờ</span>`;
        else if (hasRejected) hdBadge = `<span class="hd-badge badge-rejected">❌ Có yêu cầu hoàn bị từ chối</span>`;
        else if (hasApproved && !hasNormal) hdBadge = `<span class="hd-badge badge-approved">💚 Đã hoàn thành công</span>`;
        else if (hasApproved) hdBadge = `<span class="hd-badge badge-approved">💚 Một phần đã hoàn</span>`;
        else                  hdBadge = `<span class="hd-badge badge-paid">✅ Đã thanh toán</span>`;

        // ── Giá hóa đơn ──
        const showDiscount = group.thanhTienGoc && group.thanhTien && group.thanhTien < group.thanhTienGoc;
        const priceHtml = showDiscount
            ? `<span class="hd-price-old">${formatPrice(group.thanhTienGoc)}</span>
               <span class="hd-price-new">${formatPrice(group.thanhTien)}</span>`
            : `<span class="hd-price-new">${formatPrice(group.thanhTien || group.tickets.reduce((s, v) => s + v.gia * v.soLuong, 0))}</span>`;

        // ── Từng dòng vé ──
        const ticketRows = group.tickets.map(ve => {
            const hoanSection = buildHoanSection(ve);
            return `
                <div class="ticket-line ${ve.trangThaiHoan ? "ticket-line-hoan" : ""}">
                    <div class="ticket-line-left">
                        <span class="ticket-line-icon">🎟️</span>
                        <div class="ticket-line-info">
                            <div class="ticket-line-name">${escHtml(ve.tenVe || "—")}</div>
                            <div class="ticket-line-meta">
                                ${escHtml(ve.loaiVe || "—")} &nbsp;·&nbsp;
                                SL: <strong>${ve.soLuong}</strong> &nbsp;·&nbsp;
                                ${formatPrice(ve.gia)} / vé
                            </div>
                        </div>
                    </div>
                    <div class="ticket-line-right">
                        <div class="ticket-line-subtotal">${formatPrice(ve.gia * ve.soLuong)}</div>
                        ${hoanSection}
                    </div>
                </div>`;
        }).join("");

        return `
            <div class="hoadon-block" style="animation-delay:${gIdx * 0.07}s">
                <!-- HEADER HÓA ĐƠN -->
                <div class="hoadon-header">
                    <div class="hoadon-header-left">
                        <span class="hoadon-num">Hóa đơn #${group.maHoaDon}</span>
                        <span class="hoadon-date">📅 ${formatDate(group.ngayMua)}</span>
                        <span class="hoadon-event">📍 ${escHtml(group.tenSuKien || "—")}</span>
                    </div>
                    <div class="hoadon-header-right">
                        ${hdBadge}
                        <div class="hoadon-total">${priceHtml}</div>
                    </div>
                </div>

                <!-- DANH SÁCH VÉ BÊN TRONG HÓA ĐƠN -->
                <div class="ticket-lines">
                    ${ticketRows}
                </div>
            </div>`;
    }).join("");

    container.innerHTML = filterBar + blocksHtml;
    injectMyTicketCSS();
}

/* ── Build phần hoàn vé cho từng dòng vé ── */
function buildHoanSection(ve) {
    if (ve.trangThaiHoan === "approved") {
        return `<span class="hoan-badge hoan-approved">💚 Hoàn thành công</span>`;
    }
    if (ve.trangThaiHoan === "pending") {
        return `<span class="hoan-badge hoan-pending">⏳ Đang chờ duyệt</span>`;
    }
    if (ve.trangThaiHoan === "rejected") {
        return `
            <span class="hoan-badge hoan-rejected">❌ Hoàn bị từ chối</span>
            <button class="hoan-ve-btn" style="margin-top:6px"
                onclick="openHoanVeModal(${ve.maVe}, ${ve.maHoaDon}, ${ve.soLuong}, '${escHtml(ve.tenVe || "")}')">
                🔄 Gửi lại
            </button>`;
    }
    // Chưa hoàn → nút hoàn vé
    return `
        <button class="hoan-ve-btn"
            onclick="openHoanVeModal(${ve.maVe}, ${ve.maHoaDon}, ${ve.soLuong}, '${escHtml(ve.tenVe || "")}')">
            🔄 Hoàn vé
        </button>`;
}

/* ── CSS inject (chạy 1 lần) ── */
function injectMyTicketCSS() {
    if (document.getElementById("my-ticket-style")) return;
    const style = document.createElement("style");
    style.id = "my-ticket-style";
    style.textContent = `
    /* Filter bar */
    .my-filter-bar {
        display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px;
    }
    .my-filter-btn {
        display: flex; align-items: center; gap: 6px;
        padding: 8px 16px; border-radius: 20px;
        border: 1.5px solid #e0e0e0; background: #f8f9fb;
        font-size: 0.83rem; font-weight: 600; color: #666;
        cursor: pointer; font-family: 'Inter', sans-serif; transition: 0.18s;
    }
    .my-filter-btn:hover  { border-color: #0d9488; color: #0d9488; }
    .my-filter-btn.active { background: #0d9488; border-color: #0d9488; color: #fff; }
    .filter-count {
        background: rgba(0,0,0,0.12); color: inherit;
        font-size: 0.75rem; font-weight: 700;
        padding: 1px 7px; border-radius: 20px; min-width: 20px; text-align: center;
    }
    .my-filter-btn.active .filter-count { background: rgba(255,255,255,0.25); }

    /* Hóa đơn block */
    .hoadon-block {
        background: #fff; border-radius: 18px;
        box-shadow: 0 2px 12px rgba(0,0,0,0.07);
        overflow: hidden; margin-bottom: 18px;
        animation: fadeUp 0.4s ease both;
    }
    .hoadon-header {
        display: flex; align-items: flex-start; justify-content: space-between;
        padding: 18px 22px 14px; flex-wrap: wrap; gap: 10px;
        border-bottom: 1px solid #f0f0f0; background: #fafafa;
    }
    .hoadon-header-left {
        display: flex; flex-direction: column; gap: 4px;
    }
    .hoadon-num {
        font-size: 1rem; font-weight: 800; color: #1a1a2e;
        font-family: 'Inter', sans-serif;
    }
    .hoadon-date {
        font-size: 0.82rem; color: #999; font-family: 'Inter', sans-serif;
    }
    .hoadon-event {
        font-size: 0.85rem; color: #555; font-weight: 600;
        font-family: 'Inter', sans-serif;
    }
    .hoadon-header-right {
        display: flex; flex-direction: column; align-items: flex-end; gap: 6px;
    }
    .hoadon-total {
        display: flex; align-items: baseline; gap: 8px;
    }
    .hd-price-old {
        font-size: 0.82rem; color: #bbb; text-decoration: line-through;
        font-family: 'Inter', sans-serif;
    }
    .hd-price-new {
        font-size: 1.15rem; font-weight: 800; color: #0d9488;
        font-family: 'Inter', sans-serif;
    }

    /* Hóa đơn badges */
    .hd-badge {
        font-size: 0.75rem; font-weight: 700;
        padding: 4px 12px; border-radius: 20px;
        font-family: 'Inter', sans-serif;
    }
    .badge-paid     { background: #dcfce7; color: #15803d; }
    .badge-pending  { background: #fef3c7; color: #92400e; }
    .badge-rejected { background: #fee2e2; color: #991b1b; }
    .badge-approved { background: #d1fae5; color: #065f46; }

    /* Danh sách vé */
    .ticket-lines {
        padding: 0 22px 6px;
    }
    .ticket-line {
        display: flex; align-items: flex-start; justify-content: space-between;
        padding: 14px 0; border-bottom: 1px solid #f5f5f5; gap: 12px; flex-wrap: wrap;
    }
    .ticket-line:last-child { border-bottom: none; }
    .ticket-line-hoan { background: #fffbf0; border-radius: 10px; padding: 14px 12px; margin: 4px -12px; }

    .ticket-line-left {
        display: flex; align-items: flex-start; gap: 12px; flex: 1;
    }
    .ticket-line-icon { font-size: 1.5rem; min-width: 28px; }
    .ticket-line-name {
        font-size: 0.95rem; font-weight: 700; color: #1a1a2e;
        font-family: 'Inter', sans-serif; margin-bottom: 3px;
    }
    .ticket-line-meta {
        font-size: 0.8rem; color: #888; font-family: 'Inter', sans-serif;
    }

    .ticket-line-right {
        display: flex; flex-direction: column; align-items: flex-end; gap: 6px;
        min-width: 120px;
    }
    .ticket-line-subtotal {
        font-size: 1rem; font-weight: 700; color: #1a1a2e;
        font-family: 'Inter', sans-serif;
    }

    /* Hoàn vé badges per-ticket */
    .hoan-badge {
        font-size: 0.75rem; font-weight: 700;
        padding: 3px 10px; border-radius: 20px;
        font-family: 'Inter', sans-serif; display: inline-block;
    }
    .hoan-approved { background: #d1fae5; color: #065f46; }
    .hoan-pending  { background: #fef3c7; color: #92400e; }
    .hoan-rejected { background: #fee2e2; color: #991b1b; }
    `;
    document.head.appendChild(style);
}

/* ========================================================
   MODAL HOÀN VÉ
   ======================================================== */
let hoanVeData = { maVe: null, maHoaDon: null, soLuongMua: 1, hoanQty: 1 };

function openHoanVeModal(maVe, maHoaDon, soLuongMua, tenVe) {
    hoanVeData = { maVe, maHoaDon, soLuongMua, hoanQty: 1 };
    document.getElementById("hoanVeInfo").textContent       = `Vé: ${tenVe} — HĐ #${maHoaDon} — Đã mua: ${soLuongMua} vé`;
    document.getElementById("hoanQtyDisplay").textContent   = 1;
    document.getElementById("hoanQtyMax").textContent       = `(tối đa ${soLuongMua})`;
    document.getElementById("hoanLyDo").value               = "";
    document.getElementById("hoanVeMsg").textContent        = "";
    document.getElementById("hoanVeMsg").className          = "buy-msg";
    document.getElementById("hoanVeOverlay").style.display  = "block";
    const box = document.getElementById("hoanVeModal");
    box.style.display = "block";
    requestAnimationFrame(() => box.classList.add("open"));
}

function closeHoanVeModal() {
    const box = document.getElementById("hoanVeModal");
    box.classList.remove("open");
    setTimeout(() => { box.style.display = "none"; document.getElementById("hoanVeOverlay").style.display = "none"; }, 220);
}

function changeHoanQty(delta) {
    const next = hoanVeData.hoanQty + delta;
    if (next < 1 || next > hoanVeData.soLuongMua) return;
    hoanVeData.hoanQty = next;
    document.getElementById("hoanQtyDisplay").textContent = next;
}

function confirmHoanVe() {
    const lyDo  = document.getElementById("hoanLyDo").value.trim();
    const btn   = document.getElementById("confirmHoanBtn");
    const msgEl = document.getElementById("hoanVeMsg");
    btn.disabled = true; btn.textContent = "Đang xử lý..."; msgEl.textContent = "";
    fetch(`${BASE_URL}/hoanve`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maHoaDon: hoanVeData.maHoaDon, maVe: hoanVeData.maVe, soLuongHoan: hoanVeData.hoanQty, lyDoHoan: lyDo || null })
    })
    .then(async res => { if (!res.ok) { const t = await res.text(); throw new Error(t || "Gửi yêu cầu thất bại"); } return res.json(); })
    .then(data => {
        msgEl.textContent = `✅ Yêu cầu hoàn vé #${data.maHoanVe} đã được ghi nhận. Chúng tôi sẽ xử lý trong 3–5 ngày làm việc.`;
        msgEl.className   = "buy-msg ok";
        btn.textContent   = "Đã gửi";
        setTimeout(() => { closeHoanVeModal(); loadMyTickets(); }, 2800);
    })
    .catch(err => { msgEl.textContent = err.message; msgEl.className = "buy-msg err"; btn.disabled = false; btn.textContent = "Xác nhận hoàn vé"; });
}

/* ========================================================
   HELPERS
   ======================================================== */
function formatDate(val) {
    if (!val) return "—";
    if (Array.isArray(val)) { const [y,m,d] = val; return `${String(d).padStart(2,"0")}/${String(m).padStart(2,"0")}/${y}`; }
    const d = new Date(val);
    return isNaN(d) ? val : d.toLocaleDateString("vi-VN");
}
function formatPrice(amount) {
    if (amount == null) return "—";
    return Number(amount).toLocaleString("vi-VN") + " ₫";
}
function escHtml(str) {
    return String(str || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
function errorState(msg) {
    return `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">⚠️</div><p>${escHtml(msg)}</p></div>`;
}