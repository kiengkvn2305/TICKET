let allEvents = [];

function loadEvents() {

    clearContent();

    const eventList = document.getElementById("eventList");

    eventList.innerHTML = `
        <div class="top-actions">
            <button class="create-btn" onclick="openCreateEvent()">Tạo sự kiện</button>
        </div>
        <div class="filter-panel">
            <input type="text" id="filterTenSuKien" placeholder="Tìm theo tên sự kiện..." oninput="applyEventFilter()" />
        </div>
        <div id="eventContent"></div>
    `;

    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) {
        alert("Vui lòng đăng nhập");
        window.location.href = "loginPopup.html";
        return;
    }

    fetch(`${BASE_URL}/sukien/creator/${currentUser.maTaiKhoan}`)

    .then(response => {
        if (!response.ok) throw new Error("Không lấy được sự kiện");
        return response.json();
    })

    .then(data => {
        allEvents = data;
        renderEvents(data);
    })

    .catch(error => {
        alert(error.message);
    });
}

function applyEventFilter() {
    const tenSuKien = document.getElementById("filterTenSuKien").value.trim().toLowerCase();
    const filtered  = allEvents.filter(sk =>
        sk.tenSuKien.toLowerCase().includes(tenSuKien)
    );
    renderEvents(filtered);
}

function renderEvents(data) {

    const container = document.getElementById("eventContent");
    if (!container) return;

    if (data.length === 0) {
        container.innerHTML = "<p>Không có sự kiện nào</p>";
        return;
    }

    let html = "";
    data.forEach(sk => {
        html += `
            <div class="event-card">
                <h2>Tên sự kiện: ${sk.tenSuKien}</h2>
                <p>Mô tả: ${sk.moTa}</p>
                <p>Thời gian bắt đầu: ${sk.thoiGianBatDau}</p>
                <p>Thời gian kết thúc: ${sk.thoiGianKetThuc}</p>
                <div class="event-actions">
                    <button class="edit-btn"   onclick="editEvent(${sk.maSuKien})">Chỉnh sửa</button>
                    <button class="delete-btn" onclick="deleteEvent(${sk.maSuKien})">Xóa</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function editEvent(maSuKien) {
    window.location.href = `editSuKien.html?id=${maSuKien}`;
}

function deleteEvent(maSuKien) {

    if (!confirm("Bạn có chắc muốn xóa sự kiện này?")) return;

    fetch(`${BASE_URL}/sukien/${maSuKien}`, { method: "DELETE" })

    .then(response => {
        if (!response.ok) throw new Error("Xóa thất bại");
        alert("Xóa thành công");
        loadEvents();
    })

    .catch(error => {
        alert(error.message);
    });
}