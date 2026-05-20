const params   = new URLSearchParams(window.location.search);
const maSuKien = params.get("id");

window.addEventListener("DOMContentLoaded", function () {

    fetch(`${BASE_URL}/sukien/${maSuKien}`)
        .then(r => { if (!r.ok) throw new Error("Không lấy được sự kiện"); return r.json(); })
        .then(data => {
            document.getElementById("tenSuKien").value       = data.tenSuKien || "";
            document.getElementById("moTa").value            = data.moTa      || "";
            // FIX: backend trả array [y,m,d,h,m,s] hoặc ISO string — cần normalize về datetime-local
            document.getElementById("thoiGianBatDau").value  = toDatetimeLocal(data.thoiGianBatDau);
            document.getElementById("thoiGianKetThuc").value = toDatetimeLocal(data.thoiGianKetThuc);

            // Set min sau khi load
            document.getElementById("thoiGianBatDau").addEventListener("change", () => {
                document.getElementById("thoiGianKetThuc").min =
                    document.getElementById("thoiGianBatDau").value;
            });
        })
        .catch(err => showMsg("❌ " + err.message, "err"));
});

function updateEvent() {

    const tenSuKien       = document.getElementById("tenSuKien").value.trim();
    const moTa            = document.getElementById("moTa").value.trim();
    const thoiGianBatDau  = document.getElementById("thoiGianBatDau").value;
    const thoiGianKetThuc = document.getElementById("thoiGianKetThuc").value;

    if (!tenSuKien || !thoiGianBatDau || !thoiGianKetThuc) {
        showMsg("⚠️ Vui lòng điền đầy đủ thông tin bắt buộc.", "err"); return;
    }
    if (thoiGianKetThuc < thoiGianBatDau) {
        showMsg("⚠️ Ngày kết thúc phải sau ngày bắt đầu.", "err"); return;
    }

    const btn = document.querySelector(".create-btn, .button-group button");
    if (btn) { btn.disabled = true; btn.textContent = "Đang cập nhật..."; }

    fetch(`${BASE_URL}/sukien/${maSuKien}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenSuKien, moTa, thoiGianBatDau, thoiGianKetThuc })
    })
    .then(async r => {
        if (!r.ok) { const t = await r.text(); throw new Error(t || "Cập nhật thất bại"); }
        return r.json();
    })
    .then(() => {
        showMsg("✅ Cập nhật thành công! Đang chuyển hướng...", "ok");
        setTimeout(() => window.location.href = "loginCreator.html", 1200);
    })
    .catch(err => {
        showMsg("❌ " + err.message, "err");
        if (btn) { btn.disabled = false; btn.textContent = "Cập nhật sự kiện"; }
    });
}

/* ── helpers ── */

// FIX: normalize datetime từ array [y,m,d] hoặc ISO string → "YYYY-MM-DDTHH:mm"
function toDatetimeLocal(val) {
    if (!val) return "";
    if (Array.isArray(val)) {
        const [y, mo, d, h = 0, mi = 0] = val;
        return `${y}-${pad(mo)}-${pad(d)}T${pad(h)}:${pad(mi)}`;
    }
    // ISO string → cắt bỏ seconds/timezone
    const dt = new Date(val);
    if (isNaN(dt)) return val;
    return dt.toISOString().slice(0, 16);
}

function pad(n) { return String(n).padStart(2, "0"); }

function showMsg(text, type) {
    let el = document.getElementById("msgBox");
    if (!el) {
        el = document.createElement("div");
        el.id = "msgBox";
        el.style.cssText = "margin:10px 0;font-size:.88rem;font-weight:600";
        document.querySelector(".button-group")?.insertAdjacentElement("beforebegin", el);
    }
    el.textContent = text;
    el.style.color = type === "ok" ? "#0d9488" : "#dc2626";
}

function goBack() { window.location.href = "loginCreator.html"; }