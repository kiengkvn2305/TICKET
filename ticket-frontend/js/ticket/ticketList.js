let allTickets = []; // ✅ Lưu toàn bộ data để filter không cần gọi lại API

function loadTickets() {

    clearContent();

    const ticketList = document.getElementById("ticketList");

    ticketList.innerHTML = `
        <div class="top-actions">
            <button class="create-btn" onclick="openCreateTicket()">Tạo vé</button>
        </div>
        <div class="filter-panel">
            <input type="text" id="filterTenVe"    placeholder="Tìm theo tên vé..." oninput="applyTicketFilter()" />
            <input type="text" id="filterTenSuKien" placeholder="Tìm theo sự kiện..." oninput="applyTicketFilter()" />
        </div>
        <div id="ticketContent"></div>
    `;

    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) {
        alert("Vui lòng đăng nhập");
        window.location.href = "loginPopup.html";
        return;
    }

    fetch(`${BASE_URL}/ve/creator/${currentUser.maTaiKhoan}`)

    .then(response => {
        if (!response.ok) throw new Error("Không lấy được danh sách vé");
        return response.json();
    })

    .then(data => {
        allTickets = data;
        renderTickets(data);
    })

    .catch(error => {
        alert(error.message);
    });
}

function applyTicketFilter() {
    const tenVe     = document.getElementById("filterTenVe").value.trim().toLowerCase();
    const tenSuKien = document.getElementById("filterTenSuKien").value.trim().toLowerCase();

    const filtered = allTickets.filter(ve =>
        ve.tenVe.toLowerCase().includes(tenVe) &&
        // FIX: tenSuKien có thể null nếu SuKien bị xóa → TypeError crash
        (ve.tenSuKien || "").toLowerCase().includes(tenSuKien)
    );

    renderTickets(filtered);
}

function renderTickets(data) {

    const container = document.getElementById("ticketContent");

    if (!container) return;

    if (data.length === 0) {
        container.innerHTML = "<p>Không có vé nào</p>";
        return;
    }

    // Group theo sự kiện
    const grouped = {};
    data.forEach(ve => {
        const key = ve.maSuKien;
        if (!grouped[key]) {
            grouped[key] = { tenSuKien: ve.tenSuKien, ves: [] };
        }
        grouped[key].ves.push(ve);
    });

    let html = "";
    Object.values(grouped).forEach(group => {
        html += `<div class="event-group"><h2>Sự kiện: ${group.tenSuKien}</h2>`;
        group.ves.forEach(ve => {
            html += `
                <div class="ticket-card">
                    <p><strong>Tên vé: ${ve.tenVe}</strong></p>
                    <p>Loại vé: ${ve.loaiVe}</p>
                    <p>Giá: ${ve.gia}</p>
                    <p>Mô tả: ${ve.moTa}</p>
                    <div class="event-actions">
                        <button class="edit-btn"   onclick="editTicket(${ve.maVe})">Chỉnh sửa</button>
                        <button class="delete-btn" onclick="deleteTicket(${ve.maVe})">Xóa</button>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
    });

    container.innerHTML = html;
}

function editTicket(maVe) {
    window.location.href = `editVe.html?id=${maVe}`;
}

function deleteTicket(maVe) {

    if (!confirm("Bạn có chắc muốn xóa vé này?")) return;

    fetch(`${BASE_URL}/ve/${maVe}`, { method: "DELETE" })

    .then(response => {
        if (!response.ok) throw new Error("Xóa vé thất bại");
        alert("Xóa vé thành công");
        loadTickets();
    })

    .catch(error => {
        alert(error.message);
    });
}