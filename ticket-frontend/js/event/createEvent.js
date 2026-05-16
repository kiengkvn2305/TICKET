async function handleCreateEvent() {

    const btn = document.querySelector("button.create-btn");
    if (btn.disabled) return;

    const tenSuKien       = document.getElementById("tenSuKien").value.trim();
    const moTa            = document.getElementById("moTa").value.trim();
    const thoiGianBatDau  = document.getElementById("thoiGianBatDau").value;
    const thoiGianKetThuc = document.getElementById("thoiGianKetThuc").value;

    if (!tenSuKien || !moTa || !thoiGianBatDau || !thoiGianKetThuc) {
        alert("Vui lòng nhập đầy đủ thông tin");
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) {
        alert("Vui lòng đăng nhập");
        window.location.href = "loginpopup.html";
        return;
    }

    btn.disabled = true;
    btn.textContent = "Đang tạo...";

    try {
        const response = await fetch(`${BASE_URL}/sukien`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tenSuKien, moTa, thoiGianBatDau, thoiGianKetThuc,
                maTaiKhoan: currentUser.maTaiKhoan
            })
        });

        // ← THÊM: hiện status để biết backend trả gì
        //alert("Status: " + response.status);

        if (!response.ok) {
            const msg = await response.text();
            alert("Lỗi backend: " + msg);
            throw new Error(msg);
        }

        const data = await response.json();
        // ← THÊM: xác nhận data nhận được
        //alert("Response OK: " + JSON.stringify(data));

        alert("Tạo sự kiện thành công!");
        window.location.href = "loginCreator.html";

    } catch (error) {
        alert("Catch: " + error.message);
        btn.disabled = false;
        btn.textContent = "Tạo sự kiện";
    }
}

function goBack() {
    window.location.href = "loginCreator.html";
}