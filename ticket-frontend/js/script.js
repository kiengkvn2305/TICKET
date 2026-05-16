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

  fetch("http://localhost:8080/api/taikhoan/register", {

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

        if (!response.ok) {

            const message =
                await response.text();

            throw new Error(message);

        }

        return response.text();

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

      tenDangNhap: username,

      matKhau: password

    })

  })

  .then(async response => {

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
    }

    return response.json();

  })

  .then(data => {

    console.log("DATA:", data);

    // LƯU USER TRƯỚC
    localStorage.setItem(
      "user",
      JSON.stringify(data)
    );

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
   CLEAR CONTENT
========================= */

function clearContent() {

    document.getElementById("ticketList")
        .innerHTML = "";

    document.getElementById("eventList")
        .innerHTML = "";

    document.getElementById("voucherList")
        .innerHTML = "";

}

/* =========================
   LOAD DANH SÁCH VÉ
========================= */

function loadTickets() {

    clearContent();

    const ticketList =
        document.getElementById("ticketList");

    // nút tạo vé
    ticketList.innerHTML = `

        <div class="top-actions">

            <button
                class="create-btn"
                onclick="openCreateTicket()">

                Tạo vé

            </button>

        </div>

    `;

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

        // không có dữ liệu
        if (data.length === 0) {

            ticketList.innerHTML += `
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

    clearContent();

    const eventList =
        document.getElementById("eventList");

    // nút tạo sự kiện
    eventList.innerHTML = `

        <div class="top-actions">

            <button
                class="create-btn"
                onclick="openCreateEvent()">

                Tạo sự kiện

            </button>

        </div>

    `;

    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) {
        alert("Vui lòng đăng nhập");
        window.location.href = "loginPopup.html";
        return;
    }
    fetch(
        `http://localhost:8080/api/sukien/creator/${currentUser.maTaiKhoan}`
    )

    .then(response => {

        if (!response.ok) {

            throw new Error(
                "Không lấy được sự kiện"
            );

        }

        return response.json();

    })

    .then(data => {

        // không có event
        if (data.length === 0) {

            eventList.innerHTML += `
                <p>Không có sự kiện nào</p>
            `;

            return;

        }

        data.forEach(sk => {

            eventList.innerHTML += `

                <div class="event-card">

                    <h2>
                        Tên sự kiện: ${sk.tenSuKien}
                    </h2>

                    <p>
                       Mô tả: ${sk.moTa}
                    </p>

                    <p>
                        Thời gian băt đầu: ${sk.thoiGianBatDau}
                    </p>

                    <p>
                        Thời gian kết thúc: ${sk.thoiGianKetThuc}
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

/* =========================
   DELETE EVENT
========================= */

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

/* =========================
   EDIT EVENT
========================= */

function editEvent(maSuKien) {
    window.location.href =
        `editSuKien.html?id=${maSuKien}`;
}

/* =========================
   LOAD VOUCHER
========================= */

function loadVouchers() {

    clearContent();

    const voucherList =
        document.getElementById("voucherList");

    // nút tạo voucher
    voucherList.innerHTML = `

        <div class="top-actions">

            <button
                class="create-btn"
                onclick="openCreateVoucher()">

                Tạo khuyến mãi

            </button>

        </div>

    `;

    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) {
        alert("Vui lòng đăng nhập");
        window.location.href = "loginPopup.html";
        return;
    }
    fetch(
        `http://localhost:8080/api/voucher/creator/${currentUser.maTaiKhoan}`
    )

    .then(response => {

        if (!response.ok) {

            throw new Error(
                "Không lấy được voucher"
            );

        }

        return response.json();

    })

    .then(data => {

        // không có voucher
        if (data.length === 0) {

            voucherList.innerHTML += `
                <p>Không có khuyến mãi nào</p>
            `;

            return;

        }

        data.forEach(voucher => {

            voucherList.innerHTML += `

                <div class="event-card">

                    <h2>
                        ${voucher.maCode}
                    </h2>

                    <p>
                        Điều kiện:
                        ${voucher.dieuKien}
                    </p>

                    <p>
                        Mức giảm:
                        ${voucher.mucKhuyenMai}
                    </p>

                    <p>
                        Trạng thái:
                        ${voucher.trangThai}
                    </p>

                    <p>
                        Lượt sử dụng:
                        ${voucher.luotSuDung}
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
   CREATE BUTTONS
========================= */

function openCreateTicket() {

    alert("Mở form tạo vé");

}

function openCreateVoucher() {

    alert("Mở form tạo khuyến mãi");

}

function openCreateEvent() {

    window.location.href =
        "taoSuKien.html";

}

function handleCreateEvent() {

    const tenSuKien =
        document.getElementById(
            "tenSuKien"
        ).value.trim();

    const moTa =
        document.getElementById(
            "moTa"
        ).value.trim();

    const thoiGianBatDau =
        document.getElementById(
            "thoiGianBatDau"
        ).value;

    const thoiGianKetThuc =
        document.getElementById(
            "thoiGianKetThuc"
        ).value;

    if (
        tenSuKien === "" ||
        moTa === "" ||
        thoiGianBatDau === "" ||
        thoiGianKetThuc === ""
    ) {

        alert("Vui lòng nhập đầy đủ");

        return;

    }

    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) {
        alert("Vui lòng đăng nhập");
        window.location.href = "loginPopup.html";
        return;
    }
    fetch(
        "http://localhost:8080/api/sukien",
        {

            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({

                tenSuKien:
                    tenSuKien,

                moTa:
                    moTa,

                thoiGianBatDau:
                    thoiGianBatDau,

                thoiGianKetThuc:
                    thoiGianKetThuc,

                maTaiKhoan:
                    currentUser.maTaiKhoan

            })

        }
    )

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

        alert("Tạo sự kiện thành công");

        window.location.href =
            "loginCreator.html";

    })

    .catch(error => {

        console.error(error);

        alert(error.message);

    });

}