function openPopup() {
  document.getElementById("overlay").style.display = "block";
  document.getElementById("popup").style.display = "block";
}

function closePopup() {
  document.getElementById("overlay").style.display = "none";
  document.getElementById("popup").style.display = "none";
}

function toggleMenu(event) {
  event.stopPropagation();

  const menu = document.getElementById("menu");

  if (!menu) {
    console.error("Không tìm thấy #menu");
    return;
  }

  menu.classList.toggle("show");
}

// click ngoài → đóng
window.onclick = function () {
  const menu = document.getElementById("menu");
  if (menu) menu.classList.remove("show");
};


function logout() {
    window.location.href = "index.html";
}


fetch("http://localhost:8080/api/taikhoan")