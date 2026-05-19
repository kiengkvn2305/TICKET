/* ==========================================================
   js/ticket/ticketList.js  —  Quản lý vé (Creator)
   Hiển thị: Tổng niêm yết / Đã bán / Còn lại
   ========================================================== */

let allTickets = [];

function loadTickets() {
    clearContent();
    const ticketList = document.getElementById("ticketList");
    ticketList.innerHTML = `
        <div class="top-actions">
            <button class="create-btn" onclick="openCreateTicket()">+ Tạo vé mới</button>
        </div>
        <div class="filter-panel">
            <input type="text" id="filterTenVe"     placeholder="🔍 Tìm theo tên vé..."    oninput="applyTicketFilter()" />
            <input type="text" id="filterTenSuKien" placeholder="🔍 Tìm theo sự kiện..."   oninput="applyTicketFilter()" />
        </div>
        <div id="ticketContent"></div>
    `;

    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) { window.location.href = "loginpopup.html"; return; }

    fetch(`${BASE_URL}/ve/creator/${currentUser.maTaiKhoan}`)
        .then(r => { if (!r.ok) throw new Error("Không lấy được danh sách vé"); return r.json(); })
        .then(data => { allTickets = data; renderTickets(data); })
        .catch(err => {
            document.getElementById("ticketContent").innerHTML =
                `<div style="text-align:center;padding:40px;color:#e55">⚠️ ${err.message}</div>`;
        });
}

function applyTicketFilter() {
    const tenVe     = document.getElementById("filterTenVe").value.trim().toLowerCase();
    const tenSuKien = document.getElementById("filterTenSuKien").value.trim().toLowerCase();
    const filtered  = allTickets.filter(ve =>
        ve.tenVe.toLowerCase().includes(tenVe) &&
        (ve.tenSuKien || "").toLowerCase().includes(tenSuKien)
    );
    renderTickets(filtered);
}

function renderTickets(data) {
    const container = document.getElementById("ticketContent");
    if (!container) return;

    if (!data.length) {
        container.innerHTML = `
            <div style="text-align:center;padding:60px 20px;color:#bbb">
                <div style="font-size:3rem;margin-bottom:12px">🎫</div>
                <p>Chưa có vé nào. Hãy tạo vé cho sự kiện của bạn!</p>
            </div>`;
        return;
    }

    // Group theo sự kiện
    const grouped = {};
    data.forEach(ve => {
        const key = ve.maSuKien;
        if (!grouped[key]) grouped[key] = { tenSuKien: ve.tenSuKien || "—", ves: [] };
        grouped[key].ves.push(ve);
    });

    let html = "";
    Object.values(grouped).forEach(group => {
        // Tổng thống kê cả nhóm sự kiện
        const tongNiemYet = group.ves.reduce((s, v) => s + (v.soLuong || 0), 0);
        const tongDaBan   = group.ves.reduce((s, v) => s + (v.daBan   || 0), 0);
        const tongConLai  = group.ves.reduce((s, v) => s + (v.conLai  || 0), 0);
        const tyLe        = tongNiemYet > 0 ? Math.round((tongDaBan / tongNiemYet) * 100) : 0;

        html += `
            <div class="event-group">
                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:14px">
                    <h2 style="margin:0;font-size:1.05rem;font-weight:700;color:#1a1a2e">📍 ${escHtml(group.tenSuKien)}</h2>
                    <div style="display:flex;gap:10px;flex-wrap:wrap">
                        ${statChip("📦 Niêm yết", tongNiemYet, "#e0f2fe", "#0369a1")}
                        ${statChip("🎟 Đã bán",   tongDaBan,   "#dcfce7", "#15803d")}
                        ${statChip("✅ Còn lại",  tongConLai,  tongConLai === 0 ? "#fee2e2" : "#f0fdf4", tongConLai === 0 ? "#dc2626" : "#16a34a")}
                    </div>
                </div>
                <!-- Progress bar -->
                <div style="background:#f3f4f6;border-radius:20px;height:7px;margin-bottom:16px;overflow:hidden">
                    <div style="width:${tyLe}%;height:100%;background:linear-gradient(90deg,#0d9488,#3cdbd8);border-radius:20px;transition:width 0.4s"></div>
                </div>
        `;

        group.ves.forEach(ve => {
            const sold    = ve.daBan   || 0;
            const total   = ve.soLuong || 0;
            const remain  = ve.conLai  || 0;
            const pct     = total > 0 ? Math.round((sold / total) * 100) : 0;
            const soldOut = remain === 0 && total > 0;

            html += `
                <div class="ticket-card" style="position:relative;${soldOut ? "opacity:0.75" : ""}">
                    ${soldOut ? `<span style="position:absolute;top:14px;right:14px;background:#fee2e2;color:#dc2626;font-size:0.72rem;font-weight:700;padding:3px 10px;border-radius:20px">HẾT VÉ</span>` : ""}
                    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap">
                        <div>
                            <p style="margin:0 0 2px;font-size:1rem;font-weight:700;color:#1a1a2e">${escHtml(ve.tenVe)}</p>
                            <p style="margin:0 0 6px;font-size:0.82rem;color:#888">${escHtml(ve.loaiVe || "—")}</p>
                        </div>
                        <p style="margin:0;font-size:1.1rem;font-weight:800;color:#0d9488;white-space:nowrap">${fmtPrice(ve.gia)}</p>
                    </div>

                    <!-- Số liệu vé -->
                    <div style="display:flex;gap:10px;margin:10px 0 8px;flex-wrap:wrap">
                        ${statChip("📦 Niêm yết", total,  "#e0f2fe", "#0369a1")}
                        ${statChip("🎟 Đã bán",   sold,   "#dcfce7", "#15803d")}
                        ${statChip("✅ Còn lại",  remain, remain === 0 && total > 0 ? "#fee2e2" : "#f0fdf4", remain === 0 && total > 0 ? "#dc2626" : "#16a34a")}
                    </div>

                    <!-- Mini progress bar -->
                    <div style="background:#f3f4f6;border-radius:20px;height:5px;margin-bottom:12px;overflow:hidden">
                        <div style="width:${pct}%;height:100%;background:${pct >= 90 ? "#ef4444" : "#3cdbd8"};border-radius:20px"></div>
                    </div>

                    ${ve.moTa ? `<p style="margin:0 0 12px;font-size:0.82rem;color:#888">${escHtml(ve.moTa)}</p>` : ""}

                    <div class="event-actions">
                        <button class="edit-btn"   onclick="editTicket(${ve.maVe})">✏️ Sửa</button>
                        <button class="delete-btn" onclick="deleteTicket(${ve.maVe})">🗑 Xóa</button>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
    });

    container.innerHTML = html;
    injectTicketCSS();
}

/* ── Chip nhỏ hiển thị số liệu ── */
function statChip(label, value, bg, color) {
    return `<span style="background:${bg};color:${color};font-size:0.78rem;font-weight:700;
        padding:4px 12px;border-radius:20px;white-space:nowrap">
        ${label}: ${Number(value).toLocaleString("vi-VN")}</span>`;
}

function editTicket(maVe) {
    window.location.href = `editVe.html?id=${maVe}`;
}

function deleteTicket(maVe) {
    if (!confirm("Bạn có chắc muốn xóa vé này?")) return;
    fetch(`${BASE_URL}/ve/${maVe}`, { method: "DELETE" })
        .then(async r => {
            if (!r.ok) { const t = await r.text(); throw new Error(t || "Xóa thất bại"); }
            loadTickets();
        })
        .catch(err => alert(err.message));
}

/* Helpers */
function fmtPrice(n) { return Number(n).toLocaleString("vi-VN") + " ₫"; }
function escHtml(s) {
    return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function injectTicketCSS() {
    if (document.getElementById("ticket-list-style")) return;
    const s = document.createElement("style");
    s.id = "ticket-list-style";
    s.textContent = `
        .ticket-card {
            background: #fff;
            border-radius: 14px;
            padding: 18px 20px;
            margin-bottom: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            transition: box-shadow 0.2s;
        }
        .ticket-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.1); }
        .event-group {
            background: #f8f9fb;
            border-radius: 16px;
            padding: 18px 18px 6px;
            margin-bottom: 20px;
        }
    `;
    document.head.appendChild(s);
}