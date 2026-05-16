function handleCreateEvent() {

    const tenSuKien      = document.getElementById("tenSuKien").value.trim();
    const moTa           = document.getElementById("moTa").value.trim();
    const thoiGianBatDau = document.getElementById("thoiGianBatDau").value;
    const thoiGianKetThuc= document.getElementById("thoiGianKetThuc").value;

    if (tenSuKien === "" || moTa === "" || thoiGianBatDau === "" || thoiGianKetThuc === "") {
        alert("Vui lòng nhập đầy đủ thông tin");
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) {
        alert("Vui lòng đăng nhập");
        window.location.href = "loginPopup.html";
        return;
    }

    fetch(`${BASE_URL}/sukien`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            tenSuKien,
            moTa,
            thoiGianBatDau,
            thoiGianKetThuc,
            maTaiKhoan: currentUser.maTaiKhoan
        })
    })

    // FIX: dùng response.json() trực tiếp. Khi lỗi, GlobalExceptionHandler trả String body
    // nên dùng response.text() để đọc message lỗi, tránh JSON.parse lỗi.
    .then(async response => {
        if (!response.ok) {
            const message = await response.text();
            throw new Error(message);
        }
        return response.json();
    })

    .then(() => {
        alert("Tạo sự kiện thành công");
        window.location.href = "loginCreator.html";
    })

    .catch(error => {
        alert(error.message);
    });
}

function goBack() {
    window.location.href = "loginCreator.html";
}