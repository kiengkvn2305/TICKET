/* =========================
   POPUP
========================= */

function openPopup() {
    document.getElementById("overlay").style.display = "block";
    document.getElementById("popup").style.display = "block";
}

function closePopup() {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("popup").style.display = "none";
}

/* =========================
   DROPDOWN
========================= */

function toggleMenu(event) {
    event.stopPropagation();
    const menu = document.getElementById("menu");
    if (!menu) return;
    menu.classList.toggle("show");
}

window.addEventListener("click", function (event) {
    if (!event.target.closest(".dropdown")) {
        const menu = document.getElementById("menu");
        if (menu) menu.classList.remove("show");
    }
});

/* =========================
   NAVIGATION
========================= */

function register() {
    // FIX: file tên thực là registerPopup.html
    window.location.href = "registerPopup.html";
}

function forget() {
    window.location.href = "forgetPassword.html";
}

function cancelRF() {
    // FIX: file tên thực là loginpopup.html (chữ thường)
    window.location.href = "loginpopup.html";
}

function cancelLogin() {
    parent.closePopup();
}

function logout() {
    localStorage.removeItem("user");
    window.location.href = "index.html";
}

/* =========================
   CREATOR DASHBOARD - CLEAR & NAVIGATE
========================= */

function clearContent() {
    const ticketList = document.getElementById("ticketList");
    const eventList  = document.getElementById("eventList");
    const voucherList = document.getElementById("voucherList");
    if (ticketList)  ticketList.innerHTML  = "";
    if (eventList)   eventList.innerHTML   = "";
    if (voucherList) voucherList.innerHTML = "";
}

function openCreateTicket() {
    window.location.href = "taoVe.html";
}

function openCreateEvent() {
    window.location.href = "taoSuKien.html";
}

function openCreateVoucher() {
    window.location.href = "taoKhuyenMai.html";
}