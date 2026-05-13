function openPopup() {

  document.getElementById("overlay").style.display = "block";

  document.getElementById("popup").style.display = "block";

}

function closePopup() {

  document.getElementById("overlay").style.display = "none";

  document.getElementById("popup").style.display = "none";

}

/* =========================
   CHUYỂN TRANG
========================= */

function register() {

  window.location.href = "registerPopup.html";

}

function forget() {

  window.location.href = "forgetPassword.html";

}

function cancelRF() {

  window.location.href = "loginPopup.html";

}

function cancelLogin() {

  parent.closePopup();

}

function logout() {

  window.parent.location.href = "index.html";

}

function quanLyPhatHanhVe() {

  window.location.href = "quanLyPhatHanhVe.html";

}

function quanLyKhuyenMai() {

  window.location.href = "quanLyKhuyenMai.html";

}

function quanLySuKien() {

  window.location.href = "quanLySuKien.html";

}

function theoDoiDoanhThu() {

  window.location.href = "theoDoiDoanhThu.html";

}

/* =========================
   DROPDOWN MENU
========================= */

function toggleMenu(event) {

  event.stopPropagation();

  const menu =
    document.getElementById("menu");

  if (!menu) {

    console.error("Không tìm thấy #menu");

    return;

  }

  menu.classList.toggle("show");

}

window.addEventListener("click", function(event) {

  if (!event.target.closest(".dropdown")) {

    const menu =
      document.getElementById("menu");

    if (menu) {

      menu.classList.remove("show");

    }

  }

});

/* =========================
   ĐĂNG KÝ
========================= */

function acceptRegister() {

  const username =
    document.getElementById("username").value.trim();

  const password =
    document.getElementById("password").value.trim();

  const role =
    document.querySelector('input[name="role"]:checked');

  // kiểm tra rỗng
  if (
    username === "" ||
    password === "" ||
    role === null
  ) {

    alert("Vui lòng nhập đầy đủ thông tin");

    return;

  }

  const roleValue = role.value;

  fetch("http://localhost:8080/api/taikhoan", {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({

      tenTaiKhoan: username,

      matKhau: password,

      loaiTaiKhoan: roleValue

    })

  })

  .then(async response => {

    const message =
      await response.text();

    if (!response.ok) {

      throw new Error(message);

    }

    return JSON.parse(message);

  })

  .then(data => {

    console.log(data);

    alert("Đăng ký thành công");

    window.location.href =
      "loginPopup.html";

  })

  .catch(error => {

    console.error(error);

    alert(error.message);

  });

}

/* =========================
   ĐĂNG NHẬP
========================= */

function login() {

  const username =
    document.getElementById("username").value.trim();

  const password =
    document.getElementById("password").value.trim();

  if (
    username === "" ||
    password === ""
  ) {

    alert("Vui lòng nhập đầy đủ thông tin");

    return;

  }

  fetch("http://localhost:8080/api/taikhoan/login", {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({

      tenTaiKhoan: username,

      matKhau: password

    })

  })

  .then(response => {

    if (!response.ok) {

      throw new Error(
        "Sai tài khoản hoặc mật khẩu"
      );

    }

    return response.json();

  })

  .then(data => {

    console.log("DATA:", data);

    alert("Đăng nhập thành công");

    // role customer
    if (data.loaiTaiKhoan === "customer") {

      window.parent.location.href =
        "loginCustomer.html";

    }

    // role creator
    else if (data.loaiTaiKhoan === "creator") {

      window.parent.location.href =
        "loginCreator.html";

    }

    // role admin
    else if (data.loaiTaiKhoan === "admin") {

      window.parent.location.href =
        "loginAdmin.html";

    }

    else {

      alert("Không xác định loại tài khoản");

    }

  })

  .catch(error => {

    console.error(error);

    alert(error.message);

  });

}

/* =========================
   QUÊN MẬT KHẨU
========================= */

function forgetPassword() {

  const username =
    document.getElementById("username").value.trim();

  const email =
    document.getElementById("email").value.trim();

  if (
    username === "" ||
    email === ""
  ) {

    alert("Vui lòng nhập đầy đủ thông tin");

    return;

  }

  fetch(
    "http://localhost:8080/api/taikhoan/forget-password",
    {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({

        tenTaiKhoan: username,

        email: email

      })

    }
  )

  .then(async response => {

    const message =
      await response.text();

    if (!response.ok) {

      throw new Error(message);

    }

    return message;

  })

  .then(message => {

    alert(message);

    window.location.href =
      "loginPopup.html";

  })

  .catch(error => {

    console.error(error);

    alert(error.message);

  });

}

/* =========================
   LOAD DANH SÁCH VÉ
========================= */

function loadTickets() {

  fetch("http://localhost:8080/api/ve")

  .then(response => {

    if (!response.ok) {

      throw new Error(
        "Không lấy được danh sách vé"
      );

    }

    return response.json();

  })

  .then(data => {

    console.log(data);

    const ticketList =
      document.getElementById("ticketList");

    ticketList.innerHTML = "";

    // không có dữ liệu
    if (data.length === 0) {

      ticketList.innerHTML = `
        <p>Không có vé nào</p>
      `;

      return;

    }

    data.forEach(ve => {

      ticketList.innerHTML += `

        <div class="ticket-card">

          <h2>${ve.tenVe}</h2>

          <p>
            Loại vé:
            ${ve.loaiVe}
          </p>

          <p>
            Giá:
            ${ve.gia}
          </p>

          <p>
            Trạng thái:
            ${ve.trangThai}
          </p>

          <p>
            Mô tả:
            ${ve.moTa}
          </p>

        </div>

      `;

    });

  })

  .catch(error => {

    console.error(error);

    alert(error.message);

  });

}

/* =========================
   LOAD DANH SÁCH SỰ KIỆN
========================= */

function loadEvents() {

  fetch("http://localhost:8080/api/sukien")

  .then(response => {

    if (!response.ok) {

      throw new Error(
        "Không lấy được sự kiện"
      );

    }

    return response.json();

  })

  .then(data => {

    const eventList =
      document.getElementById("eventList");

    eventList.innerHTML = "";

    // không có dữ liệu
    if (data.length === 0) {

      eventList.innerHTML = `
        <p>Không có sự kiện nào</p>
      `;

      return;

    }

    data.forEach(sk => {

      eventList.innerHTML += `

        <div class="event-card">

          <h2>
            ${sk.tenSuKien}
          </h2>

          <p>
            Mô tả:
            ${sk.moTa}
          </p>

          <p>
            Thời gian bắt đầu:
            ${sk.thoiGianBatDau}
          </p>

          <p>
            Thời gian kết thúc:
            ${sk.thoiGianKetThuc}
          </p>

          <div class="event-actions">

            <button
              class="edit-btn"
              onclick="editEvent(${sk.maSuKien})">

              Chỉnh sửa

            </button>

            <button
              class="delete-btn"
              onclick="deleteEvent(${sk.maSuKien})">

              Xóa

            </button>

          </div>

        </div>

      `;

    });

  })

  .catch(error => {

    console.error(error);

    alert(error.message);

  });

}

function deleteEvent(maSuKien) {

  const confirmDelete =
    confirm("Bạn có chắc muốn xóa?");

  if (!confirmDelete) {

    return;

  }

  fetch(
    `http://localhost:8080/api/sukien/${maSuKien}`,
    {
      method: "DELETE"
    }
  )

  .then(response => {
    if (!response.ok) {
      throw new Error(
        "Xóa thất bại"
      );
    }
    alert("Xóa thành công");
    loadEvents();
  })

  .catch(error => {
    console.error(error);
    alert(error.message);
  });
}

function editEvent(maSuKien) {
  alert(
    "Chỉnh sửa sự kiện ID: " + maSuKien
  );
}