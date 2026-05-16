function loadTickets() {

    clearContent();

    const ticketList = document.getElementById("ticketList");

    ticketList.innerHTML = `
        <div class="top-actions">
            <button class="create-btn" onclick="openCreateTicket()">Tạo vé</button>
        </div>
    `;

    fetch(`${BASE_URL}/ve`)

    .then(response => {
        if (!response.ok) throw new Error("Không lấy được danh sách vé");
        return response.json();
    })

    .then(data => {

        if (data.length === 0) {
            ticketList.innerHTML += "<p>Không có vé nào</p>";
            return;
        }

        data.forEach(ve => {
            ticketList.innerHTML += `
                <div class="ticket-card">
                    <h2>${ve.tenVe}</h2>
                    <p>Loại vé: ${ve.loaiVe}</p>
                    <p>Giá: ${ve.gia}</p>
                    <p>Trạng thái: ${ve.trangThai}</p>
                    <p>Mô tả: ${ve.moTa}</p>
                </div>
                <div class="event-actions">
                    <button class="edit-btn"   onclick="editTicket(${ve.maVe})">Chỉnh sửa</button>
                    <button class="delete-btn" onclick="deleteTicket(${ve.maVe})">Xóa</button>
                </div>
            `;
        });

    })

    .catch(error => {
        alert(error.message);
    });
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
