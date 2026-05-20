/* ==========================================================
   js/ticket/ticketList.js
   Quản lý vé - Creator
========================================================== */

let allTickets = [];

/* ==========================================================
   LOAD
========================================================== */

async function loadTickets() {

    clearContent();

    const ticketList = document.getElementById("ticketList");

    ticketList.innerHTML = `
        <div class="top-actions">
            <button class="create-btn" onclick="openCreateTicket()">
                + Tạo vé mới
            </button>
        </div>

        <div class="filter-panel">
            <input
                type="text"
                id="filterTenVe"
                placeholder="🔍 Tìm theo tên vé..."
                oninput="applyTicketFilter()"
            />

            <input
                type="text"
                id="filterTenSuKien"
                placeholder="🔍 Tìm theo sự kiện..."
                oninput="applyTicketFilter()"
            />
        </div>

        <div id="ticketContent">
            <div class="ticket-loading">
                Đang tải danh sách vé...
            </div>
        </div>
    `;

    injectTicketCSS();

    const currentUser = JSON.parse(localStorage.getItem("user"));

    if (!currentUser) {
        window.location.href = "loginpopup.html";
        return;
    }

    try {

        const response = await fetch(
            `${BASE_URL}/ve/creator/${currentUser.maTaiKhoan}`
        );

        if (!response.ok) {
            throw new Error("Không lấy được danh sách vé");
        }

        const data = await response.json();

        allTickets = Array.isArray(data)
            ? data
            : [];

        renderTickets(allTickets);

    } catch (err) {

        document.getElementById("ticketContent").innerHTML = `
            <div class="ticket-error">
                ⚠️ ${escHtml(err.message)}
            </div>
        `;
    }
}


/* ==========================================================
   FILTER
========================================================== */

function applyTicketFilter() {

    const tenVe = (
        document.getElementById("filterTenVe").value || ""
    )
        .trim()
        .toLowerCase();

    const tenSuKien = (
        document.getElementById("filterTenSuKien").value || ""
    )
        .trim()
        .toLowerCase();

    const filtered = allTickets.filter(ve => {

        const ticketName = String(ve.tenVe || "")
            .toLowerCase();

        const eventName = String(ve.tenSuKien || "")
            .toLowerCase();

        return (
            ticketName.includes(tenVe) &&
            eventName.includes(tenSuKien)
        );
    });

    renderTickets(filtered);
}


/* ==========================================================
   RENDER
========================================================== */

function renderTickets(data) {

    const container =
        document.getElementById("ticketContent");

    if (!container) return;

    if (!Array.isArray(data) || data.length === 0) {

        container.innerHTML = `
            <div class="ticket-empty">
                <div class="ticket-empty-icon">
                    🎫
                </div>

                <p>
                    Không có vé nào.
                </p>
            </div>
        `;

        return;
    }

    /* ==============================
       GROUP BY EVENT
    ============================== */

    const grouped = {};

    data.forEach(ve => {

        const key = ve.maSuKien || "unknown";

        if (!grouped[key]) {

            grouped[key] = {
                tenSuKien: ve.tenSuKien || "—",
                ves: []
            };
        }

        grouped[key].ves.push(ve);
    });

    let html = "";

    Object.values(grouped).forEach(group => {

        const tongNiemYet = group.ves.reduce(
            (s, v) => s + Number(v.soLuong || 0),
            0
        );

        const tongDaBan = group.ves.reduce(
            (s, v) => s + Number(v.daBan || 0),
            0
        );

        const tongConLai = Math.max(
            tongNiemYet - tongDaBan,
            0
        );

        const tyLe = tongNiemYet > 0
            ? Math.round((tongDaBan / tongNiemYet) * 100)
            : 0;

        html += `
            <div class="event-group">

                <div class="event-header">

                    <h2 class="event-title">
                        📍 ${escHtml(group.tenSuKien)}
                    </h2>

                    <div class="ticket-stats">

                        ${statChip(
                            "📦 Niêm yết",
                            tongNiemYet,
                            "info"
                        )}

                        ${statChip(
                            "🎟 Đã bán",
                            tongDaBan,
                            "success"
                        )}

                        ${statChip(
                            "✅ Còn lại",
                            tongConLai,
                            tongConLai === 0
                                ? "danger"
                                : "green"
                        )}
                    </div>
                </div>

                <div class="progress-wrapper">
                    <div
                        class="progress-bar"
                        style="width:${tyLe}%"
                    ></div>
                </div>
        `;

        group.ves.forEach(ve => {

            const total = Number(ve.soLuong || 0);

            const sold = Number(ve.daBan || 0);

            const remain = Math.max(total - sold, 0);

            const soldPercent = total > 0
                ? Math.round((sold / total) * 100)
                : 0;

            const soldOut =
                remain === 0 &&
                total > 0;

            html += `
                <div class="ticket-card ${soldOut ? "sold-out" : ""}">

                    ${soldOut
                        ? `<span class="sold-badge">
                                HẾT VÉ
                           </span>`
                        : ""
                    }

                    <div class="ticket-header">

                        <div>

                            <p class="ticket-name">
                                ${escHtml(ve.tenVe)}
                            </p>

                            <p class="ticket-type">
                                ${escHtml(ve.loaiVe || "—")}
                            </p>
                        </div>

                        <p class="ticket-price">
                            ${fmtPrice(ve.gia)}
                        </p>
                    </div>

                    <div class="ticket-stats">

                        ${statChip(
                            "📦 Niêm yết",
                            total,
                            "info"
                        )}

                        ${statChip(
                            "🎟 Đã bán",
                            sold,
                            "success"
                        )}

                        ${statChip(
                            "✅ Còn lại",
                            remain,
                            remain === 0
                                ? "danger"
                                : "green"
                        )}
                    </div>

                    <div class="mini-progress">

                        <div
                            class="mini-progress-bar"
                            style="width:${soldPercent}%"
                        ></div>

                    </div>

                    ${ve.moTa
                        ? `
                            <p class="ticket-desc">
                                ${escHtml(ve.moTa)}
                            </p>
                        `
                        : ""
                    }

                    <div class="event-actions">

                        <button
                            class="edit-btn"
                            onclick="editTicket(${ve.maVe})"
                        >
                            ✏️ Sửa
                        </button>

                        <button
                            class="delete-btn"
                            onclick="deleteTicket(${ve.maVe}, ${sold})"
                            ${sold > 0 ? "disabled" : ""}
                        >
                            🗑 Xóa
                        </button>

                    </div>
                </div>
            `;
        });

        html += `</div>`;
    });

    container.innerHTML = html;
}


/* ==========================================================
   CHIP
========================================================== */

function statChip(label, value, type) {

    return `
        <span class="stat-chip ${type}">
            ${label}: ${Number(value).toLocaleString("vi-VN")}
        </span>
    `;
}


/* ==========================================================
   EDIT
========================================================== */

function editTicket(maVe) {

    window.location.href =
        `editVe.html?id=${maVe}`;
}


/* ==========================================================
   DELETE
========================================================== */

async function deleteTicket(maVe, daBan) {

    if (daBan > 0) {
        alert("Không thể xóa vé đã bán");
        return;
    }

    if (!confirm("Bạn có chắc muốn xóa vé này?")) {
        return;
    }

    try {

        const response = await fetch(
            `${BASE_URL}/ve/${maVe}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {

            const text = await response.text();

            throw new Error(
                text || "Xóa thất bại"
            );
        }

        loadTickets();

    } catch (err) {

        alert(err.message);
    }
}


/* ==========================================================
   HELPERS
========================================================== */

function fmtPrice(n) {

    return Number(n || 0)
        .toLocaleString("vi-VN") + " ₫";
}


function escHtml(str) {

    return String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ==========================================================
   CSS
========================================================== */

function injectTicketCSS() {

    if (
        document.getElementById("ticket-list-style")
    ) {
        return;
    }

    const style = document.createElement("style");

    style.id = "ticket-list-style";

    style.textContent = `

        .ticket-loading,
        .ticket-error,
        .ticket-empty {
            text-align: center;
            padding: 50px 20px;
        }

        .ticket-error {
            color: #dc2626;
        }

        .ticket-empty-icon {
            font-size: 3rem;
            margin-bottom: 12px;
        }

        .event-group {
            background: #f8f9fb;
            border-radius: 16px;
            padding: 18px;
            margin-bottom: 20px;
        }

        .event-header {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            flex-wrap: wrap;
            margin-bottom: 14px;
        }

        .event-title {
            margin: 0;
            font-size: 1.05rem;
            font-weight: 700;
            color: #1a1a2e;
        }

        .ticket-card {
            position: relative;
            background: #fff;
            border-radius: 14px;
            padding: 18px 20px;
            margin-bottom: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            transition: 0.2s;
        }

        .ticket-card:hover {
            box-shadow: 0 6px 20px rgba(0,0,0,0.1);
        }

        .sold-out {
            opacity: 0.75;
        }

        .sold-badge {
            position: absolute;
            top: 14px;
            right: 14px;
            background: #fee2e2;
            color: #dc2626;
            font-size: 0.72rem;
            font-weight: 700;
            padding: 3px 10px;
            border-radius: 20px;
        }

        .ticket-header {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            flex-wrap: wrap;
        }

        .ticket-name {
            margin: 0 0 4px;
            font-size: 1rem;
            font-weight: 700;
        }

        .ticket-type {
            margin: 0;
            font-size: 0.82rem;
            color: #888;
        }

        .ticket-price {
            margin: 0;
            font-size: 1.1rem;
            font-weight: 800;
            color: #0d9488;
        }

        .ticket-stats {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin: 10px 0;
        }

        .stat-chip {
            font-size: 0.78rem;
            font-weight: 700;
            padding: 4px 12px;
            border-radius: 20px;
            white-space: nowrap;
        }

        .stat-chip.info {
            background: #e0f2fe;
            color: #0369a1;
        }

        .stat-chip.success {
            background: #dcfce7;
            color: #15803d;
        }

        .stat-chip.green {
            background: #f0fdf4;
            color: #16a34a;
        }

        .stat-chip.danger {
            background: #fee2e2;
            color: #dc2626;
        }

        .progress-wrapper,
        .mini-progress {
            background: #f3f4f6;
            border-radius: 20px;
            overflow: hidden;
        }

        .progress-wrapper {
            height: 7px;
            margin-bottom: 16px;
        }

        .mini-progress {
            height: 5px;
            margin-bottom: 12px;
        }

        .progress-bar,
        .mini-progress-bar {
            height: 100%;
            background: linear-gradient(
                90deg,
                #0d9488,
                #3cdbd8
            );
        }

        .ticket-desc {
            margin: 0 0 12px;
            font-size: 0.82rem;
            color: #888;
        }
    `;

    document.head.appendChild(style);
}