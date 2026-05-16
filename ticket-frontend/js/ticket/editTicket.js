const params = new URLSearchParams(window.location.search);
const maVe   = params.get("id");

/* =========================
   LOAD VÉ
========================= */

window.addEventListener("DOMContentLoaded", function () {

    fetch(`${BASE_URL}/ve/${maVe}`)

    .then(response => {
        if (!response.ok) throw new Error("Không lấy được vé");
        return response.json();
    })

    .then(data => {
        document.getElementById("tenVe").value    = data.tenVe;
        document.getElementById("loaiVe").value   = data.loaiVe;
        document.getElementById("gia").value      = data.gia;
        document.getElementById("trangThai").value= data.trangThai;
        document.getElementById("moTa").value     = data.moTa;
    })

    .catch(error => {
        alert(error.message);
    });

});

/* =========================
   CẬP NHẬT VÉ
========================= */

function updateTicket() {

    const tenVe    = document.getElementById("tenVe").value.trim();
    const loaiVe   = document.getElementById("loaiVe").value.trim();
    const gia      = document.getElementById("gia").value;
    const trangThai= document.getElementById("trangThai").value.trim();
    const moTa     = document.getElementById("moTa").value.trim();

    fetch(`${BASE_URL}/ve/${maVe}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenVe, loaiVe, gia, trangThai, moTa })
    })

    // FIX: tách error (text) và success (json)
    .then(async response => {
        if (!response.ok) {
            const message = await response.text();
            throw new Error(message);
        }
        return response.json();
    })

    .then(() => {
        alert("Cập nhật vé thành công");
        window.location.href = "loginCreator.html";
    })

    .catch(error => {
        alert(error.message);
    });
}

function goBack() {
    window.location.href = "loginCreator.html";
}