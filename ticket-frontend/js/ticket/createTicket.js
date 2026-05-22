function validateLoaiVe(value){
    return value === "VIP" || value === "Thường";
}

window.addEventListener("DOMContentLoaded", function () {

    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) { window.location.href = "loginpopup.html"; return; }

    fetch(`${BASE_URL}/sukien/creator/${currentUser.maTaiKhoan}`)
        .then(r => { if (!r.ok) throw new Error("Không lấy được sự kiện"); return r.json(); })
        .then(data => {
            const select = document.getElementById("maSuKien");
            // FIX: chỉ hiện sự kiện "Sắp diễn ra" hoặc "Đang tổ chức" — không cho tạo vé cho SK đã xong
            const active = data.filter(sk =>
                sk.trangThai === "Sắp diễn ra" || sk.trangThai === "Đang tổ chức" || !sk.trangThai
            );
            if (active.length === 0) {
                select.innerHTML = `<option value="">-- Không có sự kiện phù hợp --</option>`;
                showMsg("Bạn chưa có sự kiện nào đang hoặc sắp diễn ra.", "err");
                return;
            }
            active.forEach(sk => {
                const opt = document.createElement("option");
                opt.value       = sk.maSuKien;
                opt.textContent = sk.tenSuKien;
                select.appendChild(opt);
            });
        })
        .catch(err => showMsg(err.message, "err"));
});

function onEventChange() {}

function createTicket() {

    const tenVe    = document.getElementById("tenVe").value.trim();
    const loaiVe   = document.getElementById("loaiVe").value.trim();
    const gia      = parseFloat(document.getElementById("gia").value);
    const moTa     = document.getElementById("moTa").value.trim();
    const maSuKien = document.getElementById("maSuKien").value;

    if (!tenVe || !loaiVe || !maSuKien) {
        showMsg("⚠️ Vui lòng nhập đầy đủ thông tin bắt buộc.", "err"); return;
    }
    if (isNaN(gia) || gia < 0) {
        showMsg("⚠️ Giá vé không hợp lệ.", "err"); return;
    }

    const btn = document.querySelector("button.create-btn");
    btn.disabled    = true;
    btn.textContent = "Đang tạo...";

    fetch(`${BASE_URL}/ve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            tenVe, loaiVe,
            gia,
            moTa,
            maSuKien: parseInt(maSuKien),
            trangThai: "available"
        })
    })
    .then(async r => {
        if (!r.ok) { const t = await r.text(); throw new Error(t || "Tạo vé thất bại"); }
        return r.json();
    })
    .then(() => {
        showMsg("✅ Tạo vé thành công! Đang chuyển hướng...", "ok");
        setTimeout(() => window.location.href = "loginCreator.html", 1200);
    })
    .catch(err => {
        showMsg("❌ " + err.message, "err");
        btn.disabled    = false;
        btn.textContent = "Tạo vé";
    });
}

function showMsg(text, type) {
    const el = document.getElementById("msgBox");
    if (!el) return;
    el.textContent  = text;
    el.style.color  = type === "ok" ? "#0d9488" : "#dc2626";
    el.style.fontWeight = "600";
}

function goBack() { window.location.href = "loginCreator.html"; }
async function checkLoaiVeExists(eventId, loaiVe){
    try{
        const response = await fetch(`/api/tickets/check-type?eventId=${eventId}&loaiVe=${encodeURIComponent(loaiVe)}`);
        if(!response.ok) return false;

        const data = await response.json();
        return data.exists === true;
    }catch(err){
        console.error("checkLoaiVeExists error:", err);
        return false;
    }
}