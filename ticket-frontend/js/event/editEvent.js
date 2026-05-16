const params    = new URLSearchParams(window.location.search);
const maSuKien  = params.get("id");

/* =========================
   LOAD SỰ KIỆN
========================= */

window.addEventListener("DOMContentLoaded", function () {

    fetch(`${BASE_URL}/sukien/${maSuKien}`)

    .then(response => {
        if (!response.ok) throw new Error("Không lấy được sự kiện");
        return response.json();
    })

    .then(data => {
        document.getElementById("tenSuKien").value       = data.tenSuKien;
        document.getElementById("moTa").value            = data.moTa;
        document.getElementById("thoiGianBatDau").value  = data.thoiGianBatDau;
        document.getElementById("thoiGianKetThuc").value = data.thoiGianKetThuc;
    })

    .catch(error => {
        alert(error.message);
    });

});

/* =========================
   CẬP NHẬT SỰ KIỆN
========================= */

function updateEvent() {

    const tenSuKien       = document.getElementById("tenSuKien").value.trim();
    const moTa            = document.getElementById("moTa").value.trim();
    const thoiGianBatDau  = document.getElementById("thoiGianBatDau").value;
    const thoiGianKetThuc = document.getElementById("thoiGianKetThuc").value;

    fetch(`${BASE_URL}/sukien/${maSuKien}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenSuKien, moTa, thoiGianBatDau, thoiGianKetThuc })
    })

    .then(async response => {
        const message = await response.text();
        if (!response.ok) throw new Error(message);
        return JSON.parse(message);
    })

    .then(() => {
        alert("Cập nhật thành công");
        window.location.href = "loginCreator.html";
    })

    .catch(error => {
        alert(error.message);
    });
}

function goBack() {
    window.location.href = "loginCreator.html";
}
