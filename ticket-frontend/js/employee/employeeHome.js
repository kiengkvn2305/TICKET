/* ==========================================================
   js/customer/customerHome.js
   - Modal mua vé: hiển thị số còn lại / đã bán / progress bar
   - Event card: hiển thị tên nhà tổ chức
   - Không cho thêm vào giỏ quá số vé còn lại
   ========================================================== */

const currentUser = JSON.parse(localStorage.getItem("user"));

let allEvents        = [];
let cartMap          = {};
let modalTickets     = [];
let currentEvent     = null;
let appliedDiscount  = 0;
let allMyTickets     = [];
let activeMyFilter   = "all";
let paymentMethod = null;
let finalTotal = 0;

window.addEventListener("DOMContentLoaded", () => {
    if (!currentUser) { window.location.href = "loginpopup.html"; return; }
    const el = document.getElementById("welcomeName");
    if (el) el.textContent = currentUser.tenDangNhap || "bạn";
    loadAllEvents();
});

/* ── TAB ─────────────────────────────────────────────────── */
function showTab(tabName) {
    document.querySelectorAll(".tab-btn").forEach(b  => b.classList.remove("active"));
    document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
    document.getElementById("tab-"  + tabName).classList.add("active");
    document.getElementById("pane-" + tabName).classList.add("active");
    if (tabName === "myTickets") loadMyTickets();
    const menu = document.getElementById("menu");
    if (menu) menu.classList.remove("show");
}

/* ── SỰ KIỆN ─────────────────────────────────────────────── */
function loadAllEvents() {
    fetch(`${BASE_URL}/sukien`)
        .then(r => { if (!r.ok) throw new Error("Không lấy được sự kiện"); return r.json(); })
        .then(data => { allEvents = data; renderEvents(data); })
        .catch(err => { document.getElementById("eventGrid").innerHTML = errorState(err.message); });
}

function applyEventFilter() {
    const kw   = document.getElementById("filterEvent").value.trim().toLowerCase();
    const sort = document.getElementById("filterSort").value;
    let list   = allEvents.filter(sk => sk.tenSuKien.toLowerCase().includes(kw));
    if (sort === "asc")  list.sort((a,b) => new Date(a.thoiGianBatDau) - new Date(b.thoiGianBatDau));
    if (sort === "desc") list.sort((a,b) => new Date(b.thoiGianBatDau) - new Date(a.thoiGianBatDau));
    renderEvents(list);
}

function onGlobalSearch() {
    document.getElementById("filterEvent").value = document.getElementById("globalSearch").value;
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
        <div class="event-card-customer" style="animation-delay:${idx*0.06}s">
            <div class="card-color-bar"></div>
            <div class="card-body">
                <h3 class="card-event-name">${escHtml(sk.tenSuKien)}</h3>
                <div id="org-${sk.maSuKien}" class="card-organizer">
                    <span style="color:#ccc;font-size:0.78rem">🏢 Đang tải...</span>
                </div>
                <p class="card-event-desc">${escHtml(sk.moTa || "Không có mô tả")}</p>
                <div class="card-dates">
                    <span class="date-badge">📅 ${formatDate(sk.thoiGianBatDau)}</span>
                    <span class="date-badge">🏁 ${formatDate(sk.thoiGianKetThuc)}</span>
                </div>
            </div>
            <div class="card-footer">
                <div>
                    <span class="ticket-count-badge" id="min-price-${sk.maSuKien}">Đang tải...</span>
                    <span id="stock-badge-${sk.maSuKien}" style="display:block;font-size:0.75rem;color:#aaa;margin-top:2px"></span>
                </div>
                <button class="buy-btn" onclick="openBuyModal(${sk.maSuKien})">Bán vé</button>
            </div>
        </div>`).join("");

    data.forEach(sk => loadEventMeta(sk.maSuKien, sk.maCongTy));
}

function loadEventMeta(maSuKien, maCongTy) {
    // Vé: giá + số còn lại
    fetch(`${BASE_URL}/ve/sukien/${maSuKien}`)
        .then(r => r.ok ? r.json() : [])
        .then(tickets => {
            const priceEl = document.getElementById(`min-price-${maSuKien}`);
            const stockEl = document.getElementById(`stock-badge-${maSuKien}`);
            if (priceEl) {
                if (!tickets.length) { priceEl.textContent = "Liên hệ"; return; }
                priceEl.textContent = "Từ " + formatPrice(Math.min(...tickets.map(v => v.gia)));
            }
            if (stockEl) {
                const totalConLai  = tickets.reduce((s, v) => s + (v.conLai  ?? 0), 0);
                const totalSoLuong = tickets.reduce((s, v) => s + (v.soLuong ?? 0), 0);
                if (totalSoLuong > 0) {
                    if (totalConLai === 0)
                        stockEl.innerHTML = `<span style="color:#dc2626;font-weight:700">Hết vé</span>`;
                    else if (totalConLai <= 10)
                        stockEl.innerHTML = `<span style="color:#ea580c;font-weight:700">🔥 Còn ${totalConLai} vé</span>`;
                    else
                        stockEl.textContent = `Còn ${totalConLai.toLocaleString("vi-VN")} vé`;
                }
            }
        }).catch(() => {});

    // Nhà tổ chức (nếu maCongTy có sẵn trong SuKienResponse)
    if (maCongTy) {
        fetchOrganizer(maCongTy, maSuKien);
    } else {
        // Fallback: lấy qua endpoint chi tiết sự kiện
        fetch(`${BASE_URL}/sukien/${maSuKien}`)
            .then(r => r.ok ? r.json() : null)
            .then(sk => { if (sk?.maCongTy) fetchOrganizer(sk.maCongTy, maSuKien); })
            .catch(() => {});
    }
}

function fetchOrganizer(maCongTy, maSuKien) {
    fetch(`${BASE_URL}/nhatochuc/${maCongTy}`)
        .then(r => r.ok ? r.json() : null)
        .then(org => {
            const el = document.getElementById(`org-${maSuKien}`);
            if (!el || !org) return;
            el.innerHTML = `
                <span style="font-size:0.8rem;color:#0d9488;font-weight:600">🏢 ${escHtml(org.tenCongTy || "—")}</span>
                ${org.tenNguoiDaiDien ? `<span style="font-size:0.75rem;color:#888"> · ${escHtml(org.tenNguoiDaiDien)}</span>` : ""}
            `;
        }).catch(() => {
            const el = document.getElementById(`org-${maSuKien}`);
            if (el) el.innerHTML = "";
        });
}

/* ── MODAL MUA VÉ ────────────────────────────────────────── */
function openBuyModal(maSuKien) {
    const sk = allEvents.find(e => e.maSuKien === maSuKien);
    if (!sk) return;
    currentEvent = sk; cartMap = {}; appliedDiscount = 0;

    document.getElementById("buyMsg").textContent = "";
    document.getElementById("buyMsg").className   = "buy-msg";
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
        document.getElementById("modalTicketList").innerHTML =
            `<p style="color:#dc2626;text-align:center">${err.message}</p>`;
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
    if (!tickets.length) {
        list.innerHTML = `<div class="empty-state"><div class="empty-icon">😔</div><p>Sự kiện này chưa có vé nào.</p></div>`;
        if (voucherRow)   voucherRow.style.display   = "none";
        if (modalSummary) modalSummary.style.display = "none";
        return;
    }

    // Kiểm tra có ít nhất 1 vé còn hàng không
    const hasAvailable = tickets.some(v => v.conLai == null || v.conLai > 0);
    if (!hasAvailable) {
        if (voucherRow)   voucherRow.style.display   = "none";
        if (modalSummary) modalSummary.style.display = "none";
    } else {
        if (voucherRow)   voucherRow.style.display   = "";
        if (modalSummary) modalSummary.style.display = "";
    }

    list.innerHTML = tickets.map(ve => {
        const conLai   = ve.conLai  ?? null;
        const soLuong  = ve.soLuong ?? null;
        const daBan    = ve.daBan   ?? null;
        const pct      = soLuong > 0 && daBan != null ? Math.round((daBan / soLuong) * 100) : null;
        const lowStock = conLai != null && conLai > 0 && conLai <= 10;
        const soldOut  = conLai != null && conLai === 0 && soLuong > 0;

        return `
        <div class="modal-ticket-row" style="${soldOut ? 'opacity:0.65' : ''}">
            <div class="modal-ticket-info" style="flex:1">
                <div style="display:flex;align-items:center;gap:8px">
                    <div class="modal-ticket-name">${escHtml(ve.tenVe)}</div>
                    ${soldOut ? '<span style="background:#fee2e2;color:#dc2626;font-size:0.7rem;font-weight:700;padding:2px 8px;border-radius:20px">HẾT VÉ</span>' : ''}
                </div>
                <div class="modal-ticket-type">${escHtml(ve.loaiVe || "")}</div>
                <!-- Số liệu -->
                <div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:7px;align-items:center">
                    ${soLuong != null ? chip(soLuong.toLocaleString("vi-VN") + " vé", "#e0f2fe","#0369a1") : ""}
                    ${daBan   != null ? chip("Đã bán: " + daBan.toLocaleString("vi-VN"), "#f3f4f6","#555") : ""}
                    ${conLai  != null
                        ? lowStock
                            ? chip("🔥 Còn " + conLai, "#fff7ed","#ea580c")
                            : chip("✅ Còn " + conLai.toLocaleString("vi-VN"), "#dcfce7","#15803d")
                        : ""}
                </div>
                ${pct != null ? `
                <div style="background:#f3f4f6;border-radius:20px;height:4px;margin-top:8px;overflow:hidden;max-width:220px">
                    <div style="width:${pct}%;height:100%;background:${pct>=90?"#ef4444":pct>=60?"#f59e0b":"#3cdbd8"};border-radius:20px;transition:width .4s"></div>
                </div>` : ""}
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;min-width:120px">
                <div class="modal-ticket-price-tag">${formatPrice(ve.gia)}</div>
                <div class="qty-control">
                    <button class="qty-btn"
                        onclick="changeQty(${ve.maVe}, -1, ${conLai ?? 9999})"
                        ${soldOut ? 'disabled' : ''}>
                        −
                    </button>

                    <input
                        type="number"
                        min="0"
                        max="${conLai ?? 9999}"
                        value="0"
                        class="qty-input"
                        id="qty-${ve.maVe}"
                        ${soldOut ? 'disabled' : ''}
                        oninput="inputQty(${ve.maVe}, ${conLai ?? 9999})"
                    >

                    <button class="qty-btn"
                        onclick="changeQty(${ve.maVe}, 1, ${conLai ?? 9999})"
                        ${soldOut ? 'disabled' : ''}>
                        +
                    </button>
                </div>
            </div>
        </div>`;
    }).join("");

    updateTotal();
}

function chip(label, bg, color) {
    return `<span style="background:${bg};color:${color};font-size:0.72rem;font-weight:700;padding:2px 9px;border-radius:20px;white-space:nowrap">${label}</span>`;
}

function changeQty(maVe, delta, maxConLai) {

    const current = cartMap[maVe] || 0;

    let next = current + delta;

    if (next < 0) next = 0;

    if (next > maxConLai) {
        next = maxConLai;
    }

    cartMap[maVe] = next;

    const input = document.getElementById(`qty-${maVe}`);

    if (input) {
        input.value = next;
    }

    updateTotal();
}

function inputQty(maVe, maxConLai) {

    const input = document.getElementById(`qty-${maVe}`);

    let value = parseInt(input.value);

    if (isNaN(value) || value < 0) {
        value = 0;
    }

    if (value > maxConLai) {
        value = maxConLai;
    }

    input.value = value;

    cartMap[maVe] = value;

    updateTotal();
}

function updateTotal() {
    let total = 0;
    modalTickets.forEach(ve => { total += (cartMap[ve.maVe] || 0) * ve.gia; });
    const el = document.getElementById("totalPrice"); if (!el) return;
    if (appliedDiscount > 0) {
        const sau = Math.round(total * (1 - appliedDiscount / 100));
        el.innerHTML = `<span style="text-decoration:line-through;color:#aaa;font-weight:400">${formatPrice(total)}</span>
            &nbsp;→&nbsp;<span style="color:#e55">${formatPrice(sau)}</span>
            <span style="font-size:0.8rem;color:#e55;font-weight:600"> (-${appliedDiscount}%)</span>`;
    } else { el.textContent = formatPrice(total); }
}

let allVouchersForEvent = [];
function renderVoucherList(vouchers) {
    allVouchersForEvent = vouchers;
    const drop = document.getElementById("voucherListDrop"); if (!drop) return;
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
function selectVoucher(maCode) { document.getElementById("voucherInput").value = maCode; applyVoucher(); }

function applyVoucher() {
    const code = document.getElementById("voucherInput").value.trim();
    const msgEl = document.getElementById("voucherMsg");
    if (!code) { msgEl.textContent = "Vui lòng nhập mã voucher"; msgEl.className = "buy-msg err"; return; }
    msgEl.textContent = "Đang kiểm tra..."; msgEl.className = "buy-msg";
    fetch(`${BASE_URL}/voucher/code/${encodeURIComponent(code)}/sukien/${currentEvent.maSuKien}`)
        .then(async r => { if (!r.ok) { const t = await r.text(); throw new Error(t || "Không hợp lệ"); } return r.json(); })
        .then(v => { appliedDiscount = v.mucKhuyenMai || 0; updateTotal(); msgEl.textContent = `✅ Giảm ${appliedDiscount}%`; msgEl.className = "buy-msg ok"; })
        .catch(err => { appliedDiscount = 0; updateTotal(); msgEl.textContent = `❌ ${err.message}`; msgEl.className = "buy-msg err"; });
}

function confirmBuy() {

    const items = modalTickets
        .filter(ve => (cartMap[ve.maVe] || 0) > 0)
        .map(ve => ({
            maVe: ve.maVe,
            soLuong: cartMap[ve.maVe],
            donGia: ve.gia
        }));

    if (!items.length) {
        showBuyMsg("Vui lòng chọn vé.", "err");
        return;
    }

    finalTotal = 0;

    items.forEach(i => {
        finalTotal += i.soLuong * i.donGia;
    });

    if (appliedDiscount > 0) {
        finalTotal =
            Math.round(
                finalTotal *
                (1 - appliedDiscount / 100)
            );
    }

    openPaymentModal();
}
function showBuyMsg(text, type) { const el = document.getElementById("buyMsg"); el.textContent = text; el.className = "buy-msg " + type; }

/* ── VÉ CỦA TÔI ──────────────────────────────────────────── */
function loadMyTickets() {
    const container = document.getElementById("myTicketsList");
    container.innerHTML = `<div class="loading-state"><div class="spinner"></div><p>Đang tải...</p></div>`;
    fetch(`${BASE_URL}/hoadon/khachhang/${currentUser.maTaiKhoan}`)
        .then(r => { if (!r.ok) throw new Error("Không lấy được vé"); return r.json(); })
        .then(data => { allMyTickets = data; activeMyFilter = "all"; renderMyTickets(); })
        .catch(err => { document.getElementById("myTicketsList").innerHTML = errorState(err.message); });
}

function applyMyTicketFilter(filter) {
    activeMyFilter = filter;
    document.querySelectorAll(".my-filter-btn").forEach(b => b.classList.toggle("active", b.dataset.filter === filter));
    renderMyTickets();
}

function renderMyTickets() {
    const container = document.getElementById("myTicketsList");
    let filtered = allMyTickets;
    if (activeMyFilter === "pending")  filtered = allMyTickets.filter(v => v.trangThaiHoan === "pending");
    if (activeMyFilter === "approved") filtered = allMyTickets.filter(v => v.trangThaiHoan === "approved");
    if (activeMyFilter === "rejected") filtered = allMyTickets.filter(v => v.trangThaiHoan === "rejected");
    if (activeMyFilter === "normal")   filtered = allMyTickets.filter(v => !v.trangThaiHoan);

    const counts = { all: allMyTickets.length,
        normal:   allMyTickets.filter(v => !v.trangThaiHoan).length,
        pending:  allMyTickets.filter(v => v.trangThaiHoan === "pending").length,
        approved: allMyTickets.filter(v => v.trangThaiHoan === "approved").length,
        rejected: allMyTickets.filter(v => v.trangThaiHoan === "rejected").length };

    const filterBar = `<div class="my-filter-bar">${[
        {key:"all",label:"🎫 Tất cả",cnt:counts.all},
        {key:"normal",label:"✅ Đã thanh toán",cnt:counts.normal},
        {key:"pending",label:"⏳ Đang chờ hoàn",cnt:counts.pending},
        {key:"approved",label:"💚 Hoàn thành công",cnt:counts.approved},
        {key:"rejected",label:"❌ Hoàn thất bại",cnt:counts.rejected}
    ].map(t => `<button class="my-filter-btn ${activeMyFilter===t.key?"active":""}" data-filter="${t.key}" onclick="applyMyTicketFilter('${t.key}')">
        ${t.label}${t.cnt>0?` <span class="filter-count">${t.cnt}</span>`:""}
    </button>`).join("")}</div>`;

    if (!filtered.length) {
        container.innerHTML = filterBar + `<div class="empty-state"><div class="empty-icon">🎫</div>
            <p>${activeMyFilter==="all"?"Bạn chưa có vé nào.":"Không có vé trong mục này."}</p></div>`;
        return;
    }

    const groups = new Map();
    filtered.forEach(ve => {
        if (!groups.has(ve.maHoaDon)) groups.set(ve.maHoaDon, {
            maHoaDon: ve.maHoaDon, ngayMua: ve.ngayMua, tenSuKien: ve.tenSuKien,
            thanhTien: ve.thanhTien, thanhTienGoc: ve.thanhTienGoc, tickets: [] });
        groups.get(ve.maHoaDon).tickets.push(ve);
    });

    const blocksHtml = [...groups.values()].map((g, idx) => {
        const hasPending  = g.tickets.some(v => v.trangThaiHoan === "pending");
        const hasRejected = g.tickets.some(v => v.trangThaiHoan === "rejected");
        const hasApproved = g.tickets.some(v => v.trangThaiHoan === "approved");
        const hasNormal   = g.tickets.some(v => !v.trangThaiHoan);
        const hdBadge = hasPending  ? `<span class="hd-badge badge-pending">⏳ Có yêu cầu đang chờ</span>`
                      : hasRejected ? `<span class="hd-badge badge-rejected">❌ Có hoàn bị từ chối</span>`
                      : hasApproved && !hasNormal ? `<span class="hd-badge badge-approved">💚 Đã hoàn thành công</span>`
                      : hasApproved ? `<span class="hd-badge badge-approved">💚 Một phần đã hoàn</span>`
                      : `<span class="hd-badge badge-paid">✅ Đã thanh toán</span>`;
        const showDiscount = g.thanhTienGoc && g.thanhTien && g.thanhTien < g.thanhTienGoc;
        const priceHtml = showDiscount
            ? `<span class="hd-price-old">${formatPrice(g.thanhTienGoc)}</span><span class="hd-price-new">${formatPrice(g.thanhTien)}</span>`
            : `<span class="hd-price-new">${formatPrice(g.thanhTien || 0)}</span>`;
        const rows = g.tickets.map(ve => `
            <div class="ticket-line ${ve.trangThaiHoan?"ticket-line-hoan":""}">
                <div class="ticket-line-left">
                    <span class="ticket-line-icon">🎟️</span>
                    <div class="ticket-line-info">
                        <div class="ticket-line-name">${escHtml(ve.tenVe||"—")}</div>
                        <div class="ticket-line-meta">${escHtml(ve.loaiVe||"—")} · SL: <strong>${ve.soLuong}</strong> · ${formatPrice(ve.gia)}/vé</div>
                    </div>
                </div>
                <div class="ticket-line-right">
                    <div class="ticket-line-subtotal">${formatPrice(ve.gia*ve.soLuong)}</div>
                    ${buildHoanSection(ve)}
                </div>
            </div>`).join("");
        return `<div class="hoadon-block" style="animation-delay:${idx*0.07}s">
            <div class="hoadon-header">
                <div class="hoadon-header-left">
                    <span class="hoadon-num">Hóa đơn #${g.maHoaDon}</span>
                    <span class="hoadon-date">📅 ${formatDate(g.ngayMua)}</span>
                    <span class="hoadon-event">📍 ${escHtml(g.tenSuKien||"—")}</span>
                </div>
                <div class="hoadon-header-right">${hdBadge}<div class="hoadon-total">${priceHtml}</div></div>
            </div>
            <div class="ticket-lines">${rows}</div>
        </div>`;
    }).join("");

    container.innerHTML = filterBar + blocksHtml;
    injectMyTicketCSS();
}

function buildHoanSection(ve) {
    if (ve.trangThaiHoan === "approved") return `<span class="hoan-badge hoan-approved">💚 Đã hoàn</span>`;
    if (ve.trangThaiHoan === "pending")  return `<span class="hoan-badge hoan-pending">⏳ Chờ duyệt</span>`;
    if (ve.trangThaiHoan === "rejected") return `<span class="hoan-badge hoan-rejected">❌ Bị từ chối</span>
        <button class="hoan-ve-btn" style="margin-top:6px" onclick="openHoanVeModal(${ve.maVe},${ve.maHoaDon},${ve.soLuong},'${escHtml(ve.tenVe||"")}')">🔄 Gửi lại</button>`;
    return `<button class="hoan-ve-btn" onclick="openHoanVeModal(${ve.maVe},${ve.maHoaDon},${ve.soLuong},'${escHtml(ve.tenVe||"")}')">🔄 Hoàn vé</button>`;
}

/* ── MODAL HOÀN VÉ ───────────────────────────────────────── */
let hoanVeData = { maVe:null, maHoaDon:null, soLuongMua:1, hoanQty:1 };
function openHoanVeModal(maVe, maHoaDon, soLuongMua, tenVe) {
    hoanVeData = { maVe, maHoaDon, soLuongMua, hoanQty: 1 };
    document.getElementById("hoanVeInfo").textContent      = `Vé: ${tenVe} — HĐ #${maHoaDon} — Đã mua: ${soLuongMua}`;
    document.getElementById("hoanQtyDisplay").textContent  = 1;
    document.getElementById("hoanQtyMax").textContent      = `(tối đa ${soLuongMua})`;
    document.getElementById("hoanLyDo").value              = "";
    document.getElementById("hoanVeMsg").textContent       = "";
    document.getElementById("hoanVeMsg").className         = "buy-msg";
    document.getElementById("hoanVeOverlay").style.display = "block";
    const box = document.getElementById("hoanVeModal");
    box.style.display = "block";
    requestAnimationFrame(() => box.classList.add("open"));
}
function closeHoanVeModal() {
    const box = document.getElementById("hoanVeModal");
    box.classList.remove("open");
    setTimeout(() => { box.style.display="none"; document.getElementById("hoanVeOverlay").style.display="none"; }, 220);
}
function changeHoanQty(delta) {
    const next = hoanVeData.hoanQty + delta;
    if (next < 1 || next > hoanVeData.soLuongMua) return;
    hoanVeData.hoanQty = next;
    document.getElementById("hoanQtyDisplay").textContent = next;
}
function confirmHoanVe() {
    const lyDo = document.getElementById("hoanLyDo").value.trim();
    const btn  = document.getElementById("confirmHoanBtn");
    const msgEl= document.getElementById("hoanVeMsg");
    btn.disabled = true; btn.textContent = "Đang xử lý..."; msgEl.textContent = "";
    fetch(`${BASE_URL}/hoanve`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ maHoaDon: hoanVeData.maHoaDon, maVe: hoanVeData.maVe, soLuongHoan: hoanVeData.hoanQty, lyDoHoan: lyDo || null })
    })
    .then(async r => { if (!r.ok) { const t = await r.text(); throw new Error(t || "Gửi thất bại"); } return r.json(); })
    .then(data => { msgEl.textContent=`✅ Yêu cầu hoàn #${data.maHoanVe} đã được ghi nhận.`; msgEl.className="buy-msg ok"; btn.textContent="Đã gửi";
        setTimeout(() => { closeHoanVeModal(); loadMyTickets(); }, 2500); })
    .catch(err => { msgEl.textContent=err.message; msgEl.className="buy-msg err"; btn.disabled=false; btn.textContent="Xác nhận hoàn vé"; });
}

/* ── INJECT CSS ──────────────────────────────────────────── */
function injectMyTicketCSS() {
    if (document.getElementById("my-ticket-style")) return;
    const s = document.createElement("style"); s.id="my-ticket-style";
    s.textContent = `
    .my-filter-bar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px}
    .my-filter-btn{display:flex;align-items:center;gap:6px;padding:8px 16px;border-radius:20px;border:1.5px solid #e0e0e0;background:#f8f9fb;font-size:.83rem;font-weight:600;color:#666;cursor:pointer;font-family:'Inter',sans-serif;transition:.18s}
    .my-filter-btn:hover{border-color:#0d9488;color:#0d9488}
    .my-filter-btn.active{background:#0d9488;border-color:#0d9488;color:#fff}
    .filter-count{background:rgba(0,0,0,.12);font-size:.75rem;font-weight:700;padding:1px 7px;border-radius:20px;min-width:20px;text-align:center}
    .my-filter-btn.active .filter-count{background:rgba(255,255,255,.25)}
    .hoadon-block{background:#fff;border-radius:18px;box-shadow:0 2px 12px rgba(0,0,0,.07);overflow:hidden;margin-bottom:18px;animation:fadeUp .4s ease both}
    .hoadon-header{display:flex;align-items:flex-start;justify-content:space-between;padding:18px 22px 14px;flex-wrap:wrap;gap:10px;border-bottom:1px solid #f0f0f0;background:#fafafa}
    .hoadon-header-left{display:flex;flex-direction:column;gap:4px}
    .hoadon-num{font-size:1rem;font-weight:800;color:#1a1a2e;font-family:'Inter',sans-serif}
    .hoadon-date,.hoadon-event{font-size:.82rem;color:#888;font-family:'Inter',sans-serif}
    .hoadon-event{color:#555;font-weight:600}
    .hoadon-header-right{display:flex;flex-direction:column;align-items:flex-end;gap:6px}
    .hoadon-total{display:flex;align-items:baseline;gap:8px}
    .hd-price-old{font-size:.82rem;color:#bbb;text-decoration:line-through;font-family:'Inter',sans-serif}
    .hd-price-new{font-size:1.15rem;font-weight:800;color:#0d9488;font-family:'Inter',sans-serif}
    .hd-badge{font-size:.75rem;font-weight:700;padding:4px 12px;border-radius:20px;font-family:'Inter',sans-serif}
    .badge-paid{background:#dcfce7;color:#15803d}.badge-pending{background:#fef3c7;color:#92400e}
    .badge-rejected{background:#fee2e2;color:#991b1b}.badge-approved{background:#d1fae5;color:#065f46}
    .ticket-lines{padding:0 22px 6px}
    .ticket-line{display:flex;align-items:flex-start;justify-content:space-between;padding:14px 0;border-bottom:1px solid #f5f5f5;gap:12px;flex-wrap:wrap}
    .ticket-line:last-child{border-bottom:none}
    .ticket-line-hoan{background:#fffbf0;border-radius:10px;padding:14px 12px;margin:4px -12px}
    .ticket-line-left{display:flex;align-items:flex-start;gap:12px;flex:1}
    .ticket-line-icon{font-size:1.5rem;min-width:28px}
    .ticket-line-name{font-size:.95rem;font-weight:700;color:#1a1a2e;font-family:'Inter',sans-serif;margin-bottom:3px}
    .ticket-line-meta{font-size:.8rem;color:#888;font-family:'Inter',sans-serif}
    .ticket-line-right{display:flex;flex-direction:column;align-items:flex-end;gap:6px;min-width:120px}
    .ticket-line-subtotal{font-size:1rem;font-weight:700;color:#1a1a2e;font-family:'Inter',sans-serif}
    .hoan-badge{font-size:.75rem;font-weight:700;padding:3px 10px;border-radius:20px;display:inline-block;font-family:'Inter',sans-serif}
    .hoan-approved{background:#d1fae5;color:#065f46}.hoan-pending{background:#fef3c7;color:#92400e}.hoan-rejected{background:#fee2e2;color:#991b1b}
    .card-organizer{margin-bottom:6px;min-height:18px}
    `;
    document.head.appendChild(s);
}

/* ── HELPERS ─────────────────────────────────────────────── */
function formatDate(val) {
    if (!val) return "—";
    if (Array.isArray(val)) { const [y,m,d]=val; return `${String(d).padStart(2,"0")}/${String(m).padStart(2,"0")}/${y}`; }
    const d = new Date(val); return isNaN(d) ? val : d.toLocaleDateString("vi-VN");
}
function formatPrice(n) { return Number(n||0).toLocaleString("vi-VN")+" ₫"; }
function escHtml(s) { return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function errorState(msg) { return `<div class="empty-state"><div class="empty-icon">⚠️</div><p>${escHtml(msg)}</p></div>`; }

function openPaymentModal() {
    // Ẩn buyModal trước để không chồng lên paymentModal
    const buyBox = document.getElementById("buyModal");
    buyBox.classList.remove("open");
    buyBox.style.display = "none";
    document.getElementById("buyOverlay").style.display = "none";

    document.getElementById("paymentOverlay").style.display = "block";
    const pm = document.getElementById("paymentModal");
    pm.style.display = "block";
    requestAnimationFrame(() => pm.classList.add("open"));

    document.getElementById("bankSection").style.display = "none";
    document.getElementById("cashSection").style.display = "none";
    document.getElementById("paymentMsg").textContent = "";
}

function closePaymentModal() {
    const pm = document.getElementById("paymentModal");
    pm.classList.remove("open");
    setTimeout(() => {
        pm.style.display = "none";
        document.getElementById("paymentOverlay").style.display = "none";
    }, 220);
}
function selectPaymentMethod(method) {

    paymentMethod = method;

    document.getElementById("bankSection")
        .style.display =
            method === "CHUYEN_KHOAN"
            ? "block"
            : "none";

    document.getElementById("cashSection")
        .style.display =
            method === "TIEN_MAT"
            ? "block"
            : "none";
}
function calcCashBack() {

    const receive =
        Number(
            document.getElementById("cashReceive").value
        ) || 0;

    const back = receive - finalTotal;

    document.getElementById("cashBack")
        .value =
            back > 0
            ? formatPrice(back)
            : "0 ₫";
}
function confirmTransferPaid() {

    completePayment({
        phuongThuc: "CHUYEN_KHOAN",
        tienKhachDua: null,
        tienTraLai: null
    });
}
function confirmCashPayment() {

    const receive =
        Number(
            document.getElementById("cashReceive").value
        ) || 0;

    if (receive < finalTotal) {

        document.getElementById("paymentMsg")
            .textContent =
                "Tiền khách đưa không đủ";

        return;
    }

    completePayment({
        phuongThuc: "TIEN_MAT",
        tienKhachDua: receive,
        tienTraLai: receive - finalTotal
    });
}

function completePayment(paymentInfo) {

    const items = modalTickets
        .filter(ve => (cartMap[ve.maVe] || 0) > 0)
        .map(ve => ({
            maVe: ve.maVe,
            soLuong: cartMap[ve.maVe],
            donGia: ve.gia
        }));

    const maVoucher =
        document.getElementById("voucherInput")
            ?.value.trim() || null;

    fetch(`${BASE_URL}/hoadon/mua`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            maTaiKhoan: currentUser.maTaiKhoan,

            maSuKien: currentEvent.maSuKien,

            maVoucher: maVoucher,

            payment: paymentInfo,

            items: items
        })
    })

    .then(async r => {

        if (!r.ok) {

            const t = await r.text();

            throw new Error(t);
        }

        return r.json();
    })

    .then(data => {

        document.getElementById("paymentMsg").textContent = "✅ Thanh toán thành công! Đang cập nhật...";
        setTimeout(() => {
            closePaymentModal();
            loadAllEvents();
        }, 1500);
    })

    .catch(err => {

        document.getElementById("paymentMsg")
            .textContent = err.message;
    });
}