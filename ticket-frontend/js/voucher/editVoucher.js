const params     = new URLSearchParams(window.location.search);
const maVoucher  = params.get("id");

/* =========================
   LOAD DỮ LIỆU
========================= */

window.addEventListener("DOMContentLoaded", function () {

    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) {
        alert("Vui lòng đăng nhập");
        window.location.href = "loginPopup.html";
        return;
    }

    // Load danh sách sự kiện vào dropdown trước
    fetch(`${BASE_URL}/sukien/creator/${currentUser.maTaiKhoan}`)

    .then(response => {
        if (!response.ok) throw new Error("Không lấy được sự kiện");
        return response.json();
    })

    .then(suKiens => {
        const select = document.getElementById("maSuKien");
        suKiens.forEach(sk => {
            select.innerHTML += `<option value="${sk.maSuKien}">${sk.tenSuKien}</option>`;
        });

        // Sau khi có dropdown, load thông tin voucher để điền vào form
        return fetch(`${BASE_URL}/voucher/${maVoucher}`);
    })

    .then(response => {
        if (!response.ok) throw new Error("Không lấy được khuyến mãi");
        return response.json();
    })

    .then(data => {
        document.getElementById("maCode").value       = data.maCode;
        document.getElementById("dieuKien").value     = data.dieuKien || "";
        document.getElementById("mucKhuyenMai").value = data.mucKhuyenMai;
        document.getElementById("luotSuDung").value   = data.luotSuDung;
        document.getElementById("trangThai").value    = data.trangThai;
        document.getElementById("ngayBatDau").value   = data.ngayBatDau;
        document.getElementById("ngayKetThuc").value  = data.ngayKetThuc;

        // Chọn đúng sự kiện trong dropdown
        if (data.maSuKien) {
            document.getElementById("maSuKien").value = data.maSuKien;
        }
    })

    .catch(error => {
        alert(error.message);
    });

});

/* =========================
   CẬP NHẬT KHUYẾN MÃI
========================= */

function updateVoucher() {

    const currentUser = JSON.parse(localStorage.getItem("user"));

    const maCode       = document.getElementById("maCode").value.trim();
    const dieuKien     = document.getElementById("dieuKien").value.trim();
    const mucKhuyenMai = document.getElementById("mucKhuyenMai").value;
    const luotSuDung   = document.getElementById("luotSuDung").value;
    const trangThai    = document.getElementById("trangThai").value.trim();
    const maSuKien     = document.getElementById("maSuKien").value;
    const ngayBatDau   = document.getElementById("ngayBatDau").value;
    const ngayKetThuc  = document.getElementById("ngayKetThuc").value;

    if (!maCode || !mucKhuyenMai || !luotSuDung || !maSuKien || !ngayBatDau || !ngayKetThuc) {
        alert("Vui lòng nhập đầy đủ thông tin");
        return;
    }

    if (ngayKetThuc < ngayBatDau) {
        alert("Ngày kết thúc phải sau ngày bắt đầu");
        return;
    }

    fetch(`${BASE_URL}/voucher/${maVoucher}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            maCode,
            dieuKien,
            mucKhuyenMai: parseFloat(mucKhuyenMai),
            luotSuDung:   parseInt(luotSuDung),
            trangThai,
            maSuKien:     parseInt(maSuKien),
            ngayBatDau,
            ngayKetThuc,
            maTaiKhoan:   currentUser ? currentUser.maTaiKhoan : null
        })
    })

    .then(async response => {
        const text = await response.text();
        if (!response.ok) throw new Error(text);
        return JSON.parse(text);
    })

    .then(() => {
        alert("Cập nhật khuyến mãi thành công");
        window.location.href = "loginCreator.html";
    })

    .catch(error => {
        alert(error.message);
    });
}

function goBack() {
    window.location.href = "loginCreator.html";
}
