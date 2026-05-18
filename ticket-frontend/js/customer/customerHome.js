/* ==========================================================
   js/customer/customerHome.js  —  Ngày 2 + Fix ngày 3
   ========================================================== */

const currentUser = JSON.parse(localStorage.getItem("user"));

let allEvents       = [];
let cartMap         = {};
let modalTickets    = [];
let currentEvent    = null;
let appliedDiscount = 0;   // % giảm giá đang áp dụng (0 = chưa có)

/* ── KHỞI ĐỘNG ── */
window.addEventListener("DOMContentLoaded", () => {
    if (!currentUser) { window.location.href = "loginpopup.html"; return; }

    const el = document.getElementById("welcomeName");
    if (el) el.textContent = currentUser.tenDangNhap || "bạn";

    loadAllEvents();
});

/* ========================================================
   TAB
   ======================================================== */
function showTab(tabName) {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
    document.getElementById("tab-"  + tabName).classList.add("active");
    document.getElementById("pane-" + tabName).classList.add("active");
    if (tabName === "myTickets") loadMyTickets();
    const menu = document.getElementById("menu");
    if (menu) menu.classList.remove("show");
}

/* ========================================================
   TẢI SỰ KIỆN
   ======================================================== */
function loadAllEvents() {
    fetch(`${BASE_URL}/sukien`)
        .then(res => {
            if (!res.ok) throw new Error("Không lấy được danh sách sự kiện");
            return res.json();
        })
        .then(data => { allEvents = data; renderEvents(data); })
        .catch(err => {
            document.getElementById("eventGrid").innerHTML = errorState(err.message);
        });
}

function applyEventFilter() {
    const keyword = document.getElementById("filterEvent").value.trim().toLowerCase();
    const sort    = document.getElementById("filterSort").value;

    let filtered = allEvents.filter(sk =>
        sk.tenSuKien.toLowerCase().includes(keyword)
    );
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
    if (data.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🎪</div>
                <p>Không tìm thấy sự kiện nào.</p>
            </div>`;
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
        </div>
    `).join("");

    // Load giá thấp nhất mỗi sự kiện
    data.forEach(sk => loadMinPrice(sk.maSuKien));
}

function loadMinPrice(maSuKien) {
    fetch(`${BASE_URL}/ve/sukien/${maSuKien}`)
        .then(r => r.ok ? r.json() : [])
        .then(tickets => {
            const el = document.getElementById(`min-price-${maSuKien}`);
            if (!el) return;
            if (!tickets || tickets.length === 0) { el.textContent = "Liên hệ"; return; }
            const min = Math.min(...tickets.map(v => v.gia));
            el.textContent = "Từ " + formatPrice(min);
        })
        .catch(() => {
            const el = document.getElementById(`min-price-${maSuKien}`);
            if (el) el.textContent = "—";
        });
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

    document.getElementById("buyMsg").textContent = "";
    document.getElementById("buyMsg").className   = "buy-msg";
    const vi = document.getElementById("voucherInput");
    if (vi) vi.value = "";
    const vm = document.getElementById("voucherMsg");
    if (vm) { vm.textContent = ""; vm.className = "buy-msg"; }
    document.getElementById("modalEventName").textContent =
        sk.tenSuKien;
    document.getElementById("modalEventDate").textContent =
        `📅 ${formatDate(sk.thoiGianBatDau)} → ${formatDate(sk.thoiGianKetThuc)}`;
    document.getElementById("modalTicketList").innerHTML = `
        <div class="loading-state"><div class="spinner"></div><p>Đang tải vé...</p></div>`;

    document.getElementById("buyOverlay").style.display = "block";
    const box = document.getElementById("buyModal");
    box.style.display = "block";
    requestAnimationFrame(() => box.classList.add("open"));

    fetch(`${BASE_URL}/ve/sukien/${maSuKien}`)
        .then(res => {
            if (!res.ok) throw new Error("Không lấy được danh sách vé");
            return res.json();
        })
        .then(tickets => { modalTickets = tickets; renderModalTickets(tickets); })
        .catch(err => {
            document.getElementById("modalTicketList").innerHTML =
                `<p style="color:#dc2626;text-align:center">${err.message}</p>`;
        });
}

function closeBuyModal() {
    const box = document.getElementById("buyModal");
    box.classList.remove("open");
    setTimeout(() => {
        box.style.display = "none";
        document.getElementById("buyOverlay").style.display = "none";
    }, 220);
}

function renderModalTickets(tickets) {
    const list = document.getElementById("modalTicketList");
    const available = tickets.filter(v => v.trangThai !== "Hết vé");

    const voucherRow  = document.getElementById("voucherRow");
    const modalSummary = document.getElementById("modalSummary");

    if (available.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">😔</div>
                <p>Sự kiện này đã hết vé.</p>
            </div>`;
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
        </div>
    `).join("");

    if (voucherRow)   voucherRow.style.display   = "";
    if (modalSummary) modalSummary.style.display = "";
    updateTotal();
}

function changeQty(maVe, delta, gia) {
    const current = cartMap[maVe] || 0;
    cartMap[maVe] = Math.max(0, current + delta);
    const el = document.getElementById(`qty-${maVe}`);
    if (el) el.textContent = cartMap[maVe];
    updateTotal();
}

function updateTotal() {
    let total = 0;
    modalTickets.forEach(ve => {
        total += (cartMap[ve.maVe] || 0) * ve.gia;
    });
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

// Áp dụng voucher — gọi backend lấy % giảm thật, cập nhật tổng ngay
function applyVoucher() {
    const code  = document.getElementById("voucherInput").value.trim();
    const msgEl = document.getElementById("voucherMsg");

    if (!code) {
        msgEl.textContent = "Vui lòng nhập mã voucher";
        msgEl.className   = "buy-msg err";
        return;
    }

    msgEl.textContent = "Đang kiểm tra...";
    msgEl.className   = "buy-msg";

    fetch(`${BASE_URL}/voucher/code/${encodeURIComponent(code)}`)
        .then(async res => {
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Mã voucher không hợp lệ");
            }
            return res.json();
        })
        .then(voucher => {
            if (!voucher.trangThai || voucher.trangThai.toLowerCase() !== "active") {
                throw new Error("Voucher đã hết hạn hoặc không còn hiệu lực");
            }
            const pct = voucher.mucKhuyenMai || 0;
            if (pct <= 0) {
                throw new Error("Voucher này không có giá trị giảm giá");
            }
            appliedDiscount = pct;
            updateTotal();
            msgEl.textContent = `✅ Áp dụng thành công! Giảm ${pct}%`;
            msgEl.className   = "buy-msg ok";
        })
        .catch(err => {
            appliedDiscount = 0;
            updateTotal();
            msgEl.textContent = `❌ ${err.message}`;
            msgEl.className   = "buy-msg err";
        });
}

function confirmBuy() {
    const items = modalTickets
        .filter(ve => (cartMap[ve.maVe] || 0) > 0)
        .map(ve => ({ maVe: ve.maVe, soLuong: cartMap[ve.maVe], donGia: ve.gia }));

    if (items.length === 0) {
        showBuyMsg("Vui lòng chọn ít nhất 1 vé.", "err");
        return;
    }

    const maVoucher = document.getElementById("voucherInput")?.value.trim() || null;

    const btn = document.getElementById("confirmBuyBtn");
    btn.disabled    = true;
    btn.textContent = "Đang xử lý...";

    // FIX: gọi đúng endpoint /api/hoadon/mua với body đúng format
    fetch(`${BASE_URL}/hoadon/mua`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            maTaiKhoan: currentUser.maTaiKhoan,
            maSuKien:   currentEvent.maSuKien,
            maVoucher:  maVoucher || null,
            items
        })
    })
    .then(async res => {
        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || "Mua vé thất bại");
        }
        return res.json();
    })
    .then(data => {
        let msg = `🎉 Mua vé thành công! Mã hóa đơn: #${data.maHoaDon}`;
        if (data.phanTramGiam) {
            msg += ` — Giảm ${data.phanTramGiam}% → Còn ${formatPrice(data.thanhTienSau)}`;
        }
        showBuyMsg(msg, "ok");
        cartMap = {};
        setTimeout(closeBuyModal, 2500);
    })
    .catch(err => {
        // FIX: không fake success — hiện lỗi thật
        showBuyMsg(err.message, "err");
    })
    .finally(() => {
        btn.disabled    = false;
        btn.textContent = "Xác nhận mua";
    });
}

function showBuyMsg(text, type) {
    const el = document.getElementById("buyMsg");
    el.textContent = text;
    el.className   = "buy-msg " + type;
}

/* ========================================================
   VÉ CỦA TÔI — FIX: dùng đúng endpoint /api/hoadon/khachhang/:id
   ======================================================== */
function loadMyTickets() {
    const container = document.getElementById("myTicketsList");
    container.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Đang tải vé của bạn...</p>
        </div>`;

    fetch(`${BASE_URL}/hoadon/khachhang/${currentUser.maTaiKhoan}`)
        .then(res => {
            if (!res.ok) throw new Error("Không lấy được vé");
            return res.json();
        })
        .then(data => renderMyTickets(data))
        .catch(err => {
            container.innerHTML = errorState(err.message);
        });
}

function renderMyTickets(tickets) {
    const container = document.getElementById("myTicketsList");

    if (!tickets || tickets.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🎫</div>
                <p>Bạn chưa có vé nào.<br>
                   <small style="color:#bbb">Mua vé ở tab Sự kiện để bắt đầu!</small>
                </p>
            </div>`;
        return;
    }

    container.innerHTML = tickets.map((ve, idx) => `
        <div class="my-ticket-card" style="animation-delay:${idx * 0.06}s">
            <div class="my-ticket-icon">🎟️</div>
            <div class="my-ticket-info">
                <div class="my-ticket-name">${escHtml(ve.tenVe || "—")}</div>
                <div class="my-ticket-event">📍 ${escHtml(ve.tenSuKien || "—")}</div>
                <div class="my-ticket-meta">
                    Loại: ${escHtml(ve.loaiVe || "—")} &nbsp;|&nbsp;
                    SL: ${ve.soLuong} &nbsp;|&nbsp;
                    Ngày mua: ${formatDate(ve.ngayMua)} &nbsp;|&nbsp;
                    HĐ: #${ve.maHoaDon}
                </div>
            </div>
            <div style="text-align:right; display:flex; flex-direction:column; align-items:flex-end; gap:8px">
                <div class="my-ticket-price">${buildTicketPrice(ve)}</div>
                <span class="status-badge ${ve.trangThai === "Còn vé" ? "status-available" : "status-sold"}">
                    ${escHtml(ve.trangThai || "—")}
                </span>
                <button class="hoan-ve-btn" onclick="openHoanVeModal(${ve.maVe}, ${ve.maHoaDon}, ${ve.soLuong}, '${escHtml(ve.tenVe || "")}')">
                    🔄 Hoàn vé
                </button>
            </div>
        </div>
    `).join("");
}

/* ========================================================
   HELPERS
   ======================================================== */

// Hiển thị giá vé trong "Vé của tôi": gạch ngang giá gốc nếu có giảm voucher
function buildTicketPrice(ve) {
    const goc = ve.thanhTienGoc;
    const sau = ve.thanhTien;
    // Nếu có giảm giá (thanhTien < thanhTienGoc) thì hiện cả 2
    if (goc && sau && sau < goc) {
        return `<span style="text-decoration:line-through;color:#aaa;font-size:0.85rem;font-weight:400">${formatPrice(goc)}</span>
                <br><span style="color:#e55;font-weight:700">${formatPrice(sau)}</span>`;
    }
    // Không có voucher → hiện thanhTien hoặc tính từ donGia
    return formatPrice(sau || (ve.gia * ve.soLuong));
}

function formatDate(val) {
    if (!val) return "—";
    if (Array.isArray(val)) {
        const [y, m, d] = val;
        return `${String(d).padStart(2,"0")}/${String(m).padStart(2,"0")}/${y}`;
    }
    const d = new Date(val);
    return isNaN(d) ? val : d.toLocaleDateString("vi-VN");
}

function formatPrice(amount) {
    if (amount == null) return "—";
    return Number(amount).toLocaleString("vi-VN") + " ₫";
}

function escHtml(str) {
    return String(str || "")
        .replace(/&/g, "&amp;").replace(/</g, "&lt;")
        .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function errorState(msg) {
    return `<div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">⚠️</div>
        <p>${escHtml(msg)}</p>
    </div>`;
}

/* ========================================================
   HOÀN VÉ
   ======================================================== */
let hoanVeData = { maVe: null, maHoaDon: null, soLuongMua: 1, hoanQty: 1 };

function openHoanVeModal(maVe, maHoaDon, soLuongMua, tenVe) {
    hoanVeData = { maVe, maHoaDon, soLuongMua, hoanQty: 1 };

    document.getElementById("hoanVeInfo").textContent =
        `Vé: ${tenVe} — HĐ #${maHoaDon} — Đã mua: ${soLuongMua} vé`;
    document.getElementById("hoanQtyDisplay").textContent = 1;
    document.getElementById("hoanQtyMax").textContent = `(tối đa ${soLuongMua})`;
    document.getElementById("hoanLyDo").value = "";
    document.getElementById("hoanVeMsg").textContent = "";
    document.getElementById("hoanVeMsg").className = "buy-msg";

    document.getElementById("hoanVeOverlay").style.display = "block";
    const box = document.getElementById("hoanVeModal");
    box.style.display = "block";
    requestAnimationFrame(() => box.classList.add("open"));
}

function closeHoanVeModal() {
    const box = document.getElementById("hoanVeModal");
    box.classList.remove("open");
    setTimeout(() => {
        box.style.display = "none";
        document.getElementById("hoanVeOverlay").style.display = "none";
    }, 220);
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
    const msgEl = document.getElementById("hoanVeMsg");

    btn.disabled    = true;
    btn.textContent = "Đang xử lý...";
    msgEl.textContent = "";

    fetch(`${BASE_URL}/hoanve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            maHoaDon:    hoanVeData.maHoaDon,
            maVe:        hoanVeData.maVe,
            soLuongHoan: hoanVeData.hoanQty,
            lyDoHoan:    lyDo || null
        })
    })
    .then(async res => {
        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || "Gửi yêu cầu hoàn vé thất bại");
        }
        return res.json();
    })
    .then(data => {
        msgEl.textContent = `✅ Yêu cầu hoàn vé #${data.maHoanVe} đã được ghi nhận. Chúng tôi sẽ xử lý trong vòng 3–5 ngày làm việc.`;
        msgEl.className   = "buy-msg ok";
        btn.textContent   = "Đã gửi";
        setTimeout(closeHoanVeModal, 3000);
    })
    .catch(err => {
        msgEl.textContent = err.message;
        msgEl.className   = "buy-msg err";
        btn.disabled    = false;
        btn.textContent = "Xác nhận hoàn vé";
    });
}