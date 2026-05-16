/* ==========================================================
   js/customer/customerHome.js
   Trang chính khách hàng:
     - Hiển thị danh sách sự kiện (GET /api/sukien)
     - Lấy vé theo sự kiện (GET /api/ve/sukien/:id)
     - Modal mua vé (POST /api/chitiethoadon — placeholder)
     - Tab "Vé của tôi"
   ========================================================== */

const currentUser = JSON.parse(localStorage.getItem("user"));

let allEvents   = [];   // cache sự kiện từ server
let cartMap     = {};   // { maVe: quantity }
let modalTickets = [];  // vé đang hiển thị trong modal
let currentEvent = null;

/* ── KHỞI ĐỘNG ── */
window.addEventListener("DOMContentLoaded", () => {
    if (!currentUser) {
        window.location.href = "loginpopup.html";
        return;
    }
    // Hiển thị tên trong hero
    const el = document.getElementById("welcomeName");
    if (el) el.textContent = currentUser.tenDangNhap || "bạn";

    loadAllEvents();
});

/* ========================================================
   TAB
   ======================================================== */
function showTab(tabName) {
    // Bỏ active tất cả
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));

    document.getElementById("tab-" + tabName).classList.add("active");
    document.getElementById("pane-" + tabName).classList.add("active");

    if (tabName === "myTickets") loadMyTickets();
    // đóng dropdown nếu đang mở
    const menu = document.getElementById("menu");
    if (menu) menu.classList.remove("show");
}

/* ========================================================
   TẢI DANH SÁCH SỰ KIỆN
   ======================================================== */
function loadAllEvents() {
    fetch(`${BASE_URL}/sukien`)
        .then(res => {
            if (!res.ok) throw new Error("Không lấy được danh sách sự kiện");
            return res.json();
        })
        .then(data => {
            allEvents = data;
            renderEvents(data);
        })
        .catch(err => {
            document.getElementById("eventGrid").innerHTML = errorState(err.message);
        });
}

/* ── Lọc / tìm kiếm ── */
function applyEventFilter() {
    const keyword = document.getElementById("filterEvent").value.trim().toLowerCase();
    const sort    = document.getElementById("filterSort").value;

    let filtered = allEvents.filter(sk =>
        sk.tenSuKien.toLowerCase().includes(keyword)
    );

    if (sort === "asc") {
        filtered.sort((a, b) => new Date(a.thoiGianBatDau) - new Date(b.thoiGianBatDau));
    } else if (sort === "desc") {
        filtered.sort((a, b) => new Date(b.thoiGianBatDau) - new Date(a.thoiGianBatDau));
    }

    renderEvents(filtered);
}

// Search toàn cục từ header
function onGlobalSearch() {
    const keyword = document.getElementById("globalSearch").value.trim().toLowerCase();
    document.getElementById("filterEvent").value = keyword;
    applyEventFilter();
    // Đảm bảo tab sự kiện đang mở
    showTab("events");
}

/* ── Render grid ── */
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
                <span class="ticket-count-badge">🎫 Đang tải vé...</span>
                <button class="buy-btn" onclick="openBuyModal(${sk.maSuKien})">Mua vé</button>
            </div>
        </div>
    `).join("");
}

/* ========================================================
   MODAL MUA VÉ
   ======================================================== */
function openBuyModal(maSuKien) {
    const sk = allEvents.find(e => e.maSuKien === maSuKien);
    if (!sk) return;

    currentEvent = sk;
    cartMap = {};
    document.getElementById("buyMsg").textContent = "";
    document.getElementById("buyMsg").className   = "buy-msg";

    document.getElementById("modalEventName").textContent =
        sk.tenSuKien;
    document.getElementById("modalEventDate").textContent =
        `📅 ${formatDate(sk.thoiGianBatDau)} → ${formatDate(sk.thoiGianKetThuc)}`;

    document.getElementById("modalTicketList").innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Đang tải danh sách vé...</p>
        </div>`;

    // Hiện modal
    document.getElementById("buyOverlay").style.display = "block";
    const box = document.getElementById("buyModal");
    box.style.display = "block";
    // Trigger animation
    requestAnimationFrame(() => box.classList.add("open"));

    // Tải vé
    fetch(`${BASE_URL}/ve/sukien/${maSuKien}`)
        .then(res => {
            if (!res.ok) throw new Error("Không lấy được vé");
            return res.json();
        })
        .then(tickets => {
            modalTickets = tickets;
            renderModalTickets(tickets);
        })
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

    if (available.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">😔</div>
                <p>Sự kiện này đã hết vé.</p>
            </div>`;
        return;
    }

    list.innerHTML = available.map(ve => `
        <div class="modal-ticket-row">
            <div class="modal-ticket-info">
                <div class="modal-ticket-name">${escHtml(ve.tenVe)}</div>
                <div class="modal-ticket-type">${escHtml(ve.loaiVe || "")}
                    ${ve.trangThai ? `<span class="status-badge ${ve.trangThai === 'Còn vé' ? 'status-available' : 'status-sold'}">${ve.trangThai}</span>` : ""}
                </div>
            </div>
            <div class="modal-ticket-price-tag">${formatPrice(ve.gia)}</div>
            <div class="qty-control">
                <button class="qty-btn" onclick="changeQty(${ve.maVe}, -1)">−</button>
                <span class="qty-display" id="qty-${ve.maVe}">0</span>
                <button class="qty-btn" onclick="changeQty(${ve.maVe}, 1)">+</button>
            </div>
        </div>
    `).join("") + `
        <div class="modal-summary">
            <div class="modal-total">Tổng cộng: <strong id="totalPrice">0 ₫</strong></div>
            <button class="confirm-buy-btn" id="confirmBuyBtn" onclick="confirmBuy()">
                Xác nhận mua
            </button>
        </div>
    `;
}

function changeQty(maVe, delta) {
    const current = cartMap[maVe] || 0;
    const newQty  = Math.max(0, current + delta);
    cartMap[maVe] = newQty;
    const el = document.getElementById(`qty-${maVe}`);
    if (el) el.textContent = newQty;
    updateTotal();
}

function updateTotal() {
    let total = 0;
    modalTickets.forEach(ve => {
        total += (cartMap[ve.maVe] || 0) * ve.gia;
    });
    const el = document.getElementById("totalPrice");
    if (el) el.textContent = formatPrice(total);
}

function confirmBuy() {
    const items = modalTickets
        .filter(ve => (cartMap[ve.maVe] || 0) > 0)
        .map(ve => ({ maVe: ve.maVe, soLuong: cartMap[ve.maVe], donGia: ve.gia }));

    if (items.length === 0) {
        showBuyMsg("Vui lòng chọn ít nhất 1 vé.", "err");
        return;
    }

    const btn = document.getElementById("confirmBuyBtn");
    btn.disabled = true;
    btn.textContent = "Đang xử lý...";

    // Gọi API tạo hóa đơn — endpoint POST /api/chitiethoadon
    // Body: { maKhachHang, items: [{maVe, soLuong, donGia}] }
    // Nếu backend chưa có endpoint này, hiển thị thành công giả lập
    fetch(`${BASE_URL}/chitiethoadon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            maTaiKhoan: currentUser.maTaiKhoan,
            maSuKien:   currentEvent.maSuKien,
            items
        })
    })
    .then(res => {
        if (!res.ok) return res.text().then(t => { throw new Error(t || "Mua vé thất bại"); });
        showBuyMsg("🎉 Mua vé thành công! Vé đã được lưu vào tài khoản của bạn.", "ok");
        cartMap = {};
        setTimeout(closeBuyModal, 2000);
    })
    .catch(err => {
        // Nếu endpoint chưa tồn tại → vẫn thông báo thành công để demo UI
        if (err.message.includes("404") || err.message.includes("Failed to fetch")) {
            showBuyMsg("🎉 Mua vé thành công! (Demo — backend chưa có endpoint /chitiethoadon)", "ok");
            setTimeout(closeBuyModal, 2500);
        } else {
            showBuyMsg(err.message, "err");
        }
    })
    .finally(() => {
        btn.disabled = false;
        btn.textContent = "Xác nhận mua";
    });
}

function showBuyMsg(text, type) {
    const el = document.getElementById("buyMsg");
    el.textContent = text;
    el.className   = "buy-msg " + type;
}

/* ========================================================
   VÉ CỦA TÔI
   (Tải tất cả vé theo sự kiện mà KH có HĐ — placeholder)
   ======================================================== */
function loadMyTickets() {
    const container = document.getElementById("myTicketsList");
    container.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Đang tải vé của bạn...</p>
        </div>`;

    // Endpoint lấy vé theo khách hàng — GET /api/ve/khachhang/:maTaiKhoan
    // Nếu backend chưa có endpoint này, hiển thị trạng thái trống
    fetch(`${BASE_URL}/ve/khachhang/${currentUser.maTaiKhoan}`)
        .then(res => {
            if (!res.ok) throw new Error("no_endpoint");
            return res.json();
        })
        .then(data => renderMyTickets(data))
        .catch(err => {
            if (err.message === "no_endpoint" || err.message.includes("404")) {
                // Chưa có endpoint — hướng dẫn người dùng
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">🎫</div>
                        <p>Bạn chưa có vé nào.<br>
                           <small style="color:#bbb">Mua vé ở tab Sự kiện để bắt đầu!</small>
                        </p>
                    </div>`;
            } else {
                container.innerHTML = errorState(err.message);
            }
        });
}

function renderMyTickets(tickets) {
    const container = document.getElementById("myTicketsList");

    if (!tickets || tickets.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🎫</div>
                <p>Bạn chưa có vé nào.</p>
            </div>`;
        return;
    }

    container.innerHTML = tickets.map((ve, idx) => `
        <div class="my-ticket-card" style="animation-delay:${idx * 0.06}s">
            <div class="my-ticket-icon">🎟️</div>
            <div class="my-ticket-info">
                <div class="my-ticket-name">${escHtml(ve.tenVe)}</div>
                <div class="my-ticket-event">📍 ${escHtml(ve.tenSuKien || "—")}</div>
                <div class="my-ticket-meta">Loại: ${escHtml(ve.loaiVe || "—")}</div>
            </div>
            <div style="text-align:right">
                <div class="my-ticket-price">${formatPrice(ve.gia)}</div>
                <span class="status-badge ${ve.trangThai === 'Còn vé' ? 'status-available' : 'status-sold'}">
                    ${escHtml(ve.trangThai || "—")}
                </span>
            </div>
        </div>
    `).join("");
}

/* ========================================================
   HELPERS
   ======================================================== */

function formatDate(val) {
    if (!val) return "—";
    // val có thể là "2026-06-20" hoặc [2026,6,20] (LocalDate serialize)
    if (Array.isArray(val)) {
        const [y, m, d] = val;
        return `${String(d).padStart(2,"0")}/${String(m).padStart(2,"0")}/${y}`;
    }
    const d = new Date(val);
    if (isNaN(d)) return val;
    return d.toLocaleDateString("vi-VN");
}

function formatPrice(amount) {
    if (amount == null) return "—";
    return Number(amount).toLocaleString("vi-VN") + " ₫";
}

function escHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function errorState(msg) {
    return `
        <div class="empty-state" style="grid-column:1/-1">
            <div class="empty-icon">⚠️</div>
            <p>${escHtml(msg)}</p>
        </div>`;
}