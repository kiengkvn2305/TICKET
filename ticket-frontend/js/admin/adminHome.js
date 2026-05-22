/* ==========================================================
     js/admin — Admin Dashboard Controller
     API: BASE_URL/taikhoan, BASE_URL/sukien  (từ api.js)
  ========================================================== */

  /* ── GLOBAL STATE ── */
  let allUsersData   = [];
  let allEventsData  = [];
  let currentPage    = 'dashboard';
  let pendingAction  = null;
  let adminLogs      = JSON.parse(localStorage.getItem('adminLogs') || '[]');

  /* ── BOOT ── */
  window.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user) {
      const name = user.hoTen || user.tenDangNhap || 'Admin';
      document.getElementById('avName').textContent = name;
      document.getElementById('welcomeAdmin').textContent = name;
      document.getElementById('avInitial').textContent = name.charAt(0).toUpperCase();
    }
    loadAllData();
  });

  /* ── LOAD ALL DATA ── */
  async function loadAllData() {
    await Promise.all([
      loadUsers(),
      loadEvents()
    ]);
    renderDashboard();
    renderBlockedBadge();
    renderReviewBadge();
  }

  async function refreshDashboard() {
    toast('🔄 Đang làm mới dữ liệu...', 'info');
    await loadAllData();
    toast('✅ Đã cập nhật dữ liệu mới nhất!');
  }

  /* ── LOAD USERS ── */
  async function loadUsers() {
    try {
      const data = await apiFetch('/taikhoan');
      allUsersData = Array.isArray(data) ? data : [];
    } catch (e) {
      allUsersData = [];
    }
    document.getElementById('cnt-users').textContent = allUsersData.length;
  }

  /* ── LOAD EVENTS ── */
  async function loadEvents() {
    try {
      const data = await apiFetch('/sukien/admin');
      allEventsData = Array.isArray(data) ? data : [];
    } catch (e) {
      allEventsData = [];
    }
  }

  /* ── RENDER DASHBOARD ── */
  function renderDashboard() {
    const total   = allUsersData.length;
    const blocked = allUsersData.filter(u => (u.trangThai||'active') === 'blocked').length;
    const active  = total - blocked;
    const pending = allEventsData.filter(e => e.trangThai === 'Chờ duyệt').length;
    const evTotal = allEventsData.length;

    document.getElementById('ds-total').textContent   = total;
    document.getElementById('ds-active').textContent  = active;
    document.getElementById('ds-blocked').textContent = blocked;
    document.getElementById('ds-pending').textContent = pending;
    document.getElementById('ds-events').textContent  = evTotal;

    // Recent users table
    const recentU = allUsersData.slice(-5).reverse();
    document.getElementById('recentUsers').innerHTML = `
      <table>
        <thead><tr><th>Người dùng</th><th>Loại</th><th>Trạng thái</th></tr></thead>
        <tbody>${recentU.map(u => `
          <tr>
            <td><div class="user-cell">
              <div class="uav" style="background:${roleColor(u.loaiTaiKhoan)}">${(u.tenDangNhap||'?').charAt(0)}</div>
              <div><div class="uname">${u.tenDangNhap}</div></div>
            </div></td>
            <td>${roleBadge(u.loaiTaiKhoan)}</td>
            <td>${statusBadge((u.trangThai||'active'))}</td>
          </tr>`).join('')}
        </tbody>
      </table>`;

    // Pending events
    const pendingEvs = allEventsData.filter(e => e.trangThai === 'Chờ duyệt').slice(0, 3);
    if (pendingEvs.length === 0) {
      document.getElementById('recentPending').innerHTML = `<div class="empty-state" style="padding:30px"><div class="es-icon">✅</div><p>Không có sự kiện chờ duyệt</p></div>`;
    } else {
      document.getElementById('recentPending').innerHTML = pendingEvs.map(e => `
        <div class="review-item">
          <div class="review-icon-box">🎟</div>
          <div class="review-content">
            <div class="review-title">${e.tenSuKien}</div>
            <div class="review-meta">NTC: ${e.tenNhaToChuC} · ${e.ngayToChuc}</div>
            <div class="review-actions">
              <button class="btn-action btn-green" onclick="approveEvent(${e.maSuKien})">✅ Duyệt</button>
              <button class="btn-action btn-red"   onclick="rejectEvent(${e.maSuKien})">❌ Từ chối</button>
            </div>
          </div>
        </div>`).join('');
    }
  }

  /* ── NAV BADGES ── */
  function renderBlockedBadge() {
    const n = allUsersData.filter(u => (u.trangThai||'active') === 'blocked').length;
    document.getElementById('cnt-blocked').textContent = n;
  }
  function renderReviewBadge() {
    const n = allEventsData.filter(e => e.trangThai === 'Chờ duyệt').length;
    const v = allEventsData.filter(e => ['Vi phạm','Ẩn'].includes(e.trangThai)).length;
    document.getElementById('cnt-review').textContent = n;
    document.getElementById('cnt-vio').textContent = v;
  }

  /* ── PAGE NAVIGATION ── */
  function goPage(name) {
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('pg-' + name).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => {
      if (n.getAttribute('onclick') && n.getAttribute('onclick').includes("'" + name + "'"))
        n.classList.add('active');
    });
    currentPage = name;
    // Lazy render
    const renders = {
      users:       renderUsersTable,
      customers:   () => renderTypeTable('customers','Khách hàng'),
      organizers:  () => renderTypeTable('organizers','Nhà tổ chức'),
      staffs:      () => renderTypeTable('staffs','Nhân viên'),
      blocked:     renderBlockedTable,
      events:      renderEventsTable,
      review:      renderReviewPage,
      violations:  renderViolationsTable,
      reports:     loadReports,
      logs:        renderLogs,
    };
    if (renders[name]) renders[name]();
  }

  /* ══════════ USER TABLES ══════════ */

  function renderUsersTable(filter) {
    let data = allUsersData;
    const search = (document.getElementById('searchUsers')?.value || '').toLowerCase();
    const role   = document.getElementById('filterRole')?.value || '';
    const status = document.getElementById('filterStatus')?.value || '';
    if (search) data = data.filter(u => (u.tenDangNhap||'').toLowerCase().includes(search));
    if (role)   data = data.filter(u => u.loaiTaiKhoan === role);
    if (status) data = data.filter(u => u.trangThai === status);
    renderUserRows('usersBody', data, true);
  }

  function filterUsers() { renderUsersTable(); }

  function renderTypeTable(tableId, role) {
    const searchId = 'search' + tableId.charAt(0).toUpperCase() + tableId.slice(1);
    const search   = (document.getElementById(searchId)?.value || '').toLowerCase();
    let data = allUsersData.filter(u => u.loaiTaiKhoan === role);
    if (search) data = data.filter(u => (u.tenDangNhap||'').toLowerCase().includes(search));
    renderUserRows(tableId + 'Body', data, false);
  }

  function filterByType(tableId, role) { renderTypeTable(tableId, role); }

  function renderUserRows(tbodyId, data, showRole) {
    const tbody = document.getElementById(tbodyId);
    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="10"><div class="empty-state"><div class="es-icon">😶</div><p>Không tìm thấy tài khoản nào</p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = data.map(u => `
      <tr>
        <td><div class="user-cell">
          <div class="uav" style="background:${roleColor(u.loaiTaiKhoan)}">${(u.tenDangNhap||'?').charAt(0)}</div>
          <div><div class="uname">${u.tenDangNhap}</div></div>
        </div></td>
        ${showRole ? `<td>${roleBadge(u.loaiTaiKhoan)}</td>` : ''}
        <td>${statusBadge((u.trangThai||'active'))}</td>
        <td style="color:var(--gray3);font-size:12px">${u.ngayTao||'—'}</td>
        <td><div class="act-cell">
          ${u.trangThai !== 'blocked'
            ? `<button class="btn-action btn-orange" onclick="confirmBlock(${u.maTaiKhoan}, '${escHtml(u.tenDangNhap)}')">🚫 Chặn</button>`
            : `<button class="btn-action btn-green"  onclick="confirmUnblock(${u.maTaiKhoan}, '${escHtml(u.tenDangNhap)}')">✅ Bỏ chặn</button>`
          }
          <button class="btn-action btn-red" onclick="confirmDelete(${u.maTaiKhoan}, '${escHtml(u.tenDangNhap)}', 'user')">🗑 Xoá</button>
        </div></td>
      </tr>`).join('');
  }

  function renderBlockedTable() {
    const data = allUsersData.filter(u => (u.trangThai||'active') === 'blocked');
    const tbody = document.getElementById('blockedBody');
    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="es-icon">🎉</div><p>Không có tài khoản nào bị chặn</p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = data.map(u => `
      <tr>
        <td><div class="user-cell">
          <div class="uav" style="background:${roleColor(u.loaiTaiKhoan)}">${(u.tenDangNhap||'?').charAt(0)}</div>
          <div><div class="uname">${u.tenDangNhap}</div></div>
        </div></td>
        <td>${roleBadge(u.loaiTaiKhoan)}</td>
        <td style="font-size:12px;color:var(--red)">${u.lyDoChaN||'—'}</td>
        <td style="font-size:12px;color:var(--gray3)">${u.ngayTao||'—'}</td>
        <td><div class="act-cell">
          <button class="btn-action btn-green" onclick="confirmUnblock(${u.maTaiKhoan}, '${escHtml(u.tenDangNhap)}')">✅ Bỏ chặn</button>
          <button class="btn-action btn-red"   onclick="confirmDelete(${u.maTaiKhoan}, '${escHtml(u.tenDangNhap)}', 'user')">🗑 Xoá</button>
        </div></td>
      </tr>`).join('');
  }

  /* ══════════ EVENT TABLES ══════════ */

  function renderEventsTable() {
    let data = allEventsData;
    const search = (document.getElementById('searchEvents')?.value || '').toLowerCase();
    const status = document.getElementById('filterEventStatus')?.value || '';
    if (search) data = data.filter(e => e.tenSuKien.toLowerCase().includes(search));
    if (status) data = data.filter(e => e.trangThai === status);

    const tbody = document.getElementById('eventsBody');
    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="es-icon">📭</div><p>Không tìm thấy sự kiện</p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = data.map(e => `
      <tr>
        <td><div class="user-cell">
          <div class="uav" style="background:var(--teal2);border-radius:6px">🎟</div>
          <div><div class="uname">${e.tenSuKien}</div></div>
        </div></td>
        <td style="font-size:12px">${e.tenNhaToChuC || '—'}</td>
        <td>${eventStatusBadge(e.trangThai)}</td>
        <td style="font-size:12px;color:var(--gray3)">${e.ngayToChuc || '—'}</td>
        <td><div class="act-cell">
          ${e.trangThai === 'Chờ duyệt'
            ? `<button class="btn-action btn-green"  onclick="approveEvent(${e.maSuKien})">✅ Duyệt</button>
               <button class="btn-action btn-orange" onclick="rejectEvent(${e.maSuKien})">❌ Từ chối</button>`
            : ''}
          ${e.trangThai !== 'Ẩn'
            ? `<button class="btn-action btn-gray"   onclick="confirmHideEvent(${e.maSuKien}, '${escHtml(e.tenSuKien)}')">🙈 Ẩn</button>`
            : `<button class="btn-action btn-teal"   onclick="unhideEvent(${e.maSuKien})">👁 Hiện</button>`}
          ${e.trangThai !== 'Vi phạm'
            ? `<button class="btn-action btn-orange" onclick="markViolation(${e.maSuKien}, '${escHtml(e.tenSuKien)}')">⚠️ Vi phạm</button>`
            : `<button class="btn-action btn-green"  onclick="clearViolation(${e.maSuKien})">✅ Xoá vi phạm</button>`}
          <button class="btn-action btn-red" onclick="confirmDelete(${e.maSuKien}, '${escHtml(e.tenSuKien)}', 'event')">🗑 Xoá</button>
        </div></td>
      </tr>`).join('');
  }

  function filterEvents() { renderEventsTable(); }

  function renderReviewPage() {
    const pending = allEventsData.filter(e => e.trangThai === 'Chờ duyệt');
    const el = document.getElementById('reviewList');
    if (!pending.length) {
      el.innerHTML = `<div class="empty-state"><div class="es-icon">🎉</div><p>Tất cả sự kiện đã được kiểm duyệt!</p></div>`;
      return;
    }
    el.innerHTML = pending.map(e => `
      <div class="review-item" id="rev-${e.maSuKien}">
        <div class="review-icon-box">🎟</div>
        <div class="review-content">
          <div class="review-title">${e.tenSuKien}</div>
          <div class="review-meta">📅 ${e.ngayToChuc} &nbsp;|&nbsp; 🏢 NTC: ${e.tenNhaToChuC}</div>
          <div class="review-actions">
            <button class="btn-action btn-green"  onclick="approveEvent(${e.maSuKien})">✅ Phê duyệt</button>
            <button class="btn-action btn-red"    onclick="rejectEvent(${e.maSuKien})">❌ Từ chối</button>
            <button class="btn-action btn-orange" onclick="markViolation(${e.maSuKien}, '${escHtml(e.tenSuKien)}')">⚠️ Đánh vi phạm</button>
          </div>
        </div>
      </div>`).join('');
  }

  function renderViolationsTable() {
    const data = allEventsData.filter(e => ['Vi phạm','Ẩn'].includes(e.trangThai));
    const tbody = document.getElementById('violationsBody');
    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="es-icon">✅</div><p>Không có sự kiện vi phạm</p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = data.map(e => `
      <tr>
        <td><b>${e.tenSuKien}</b></td>
        <td style="font-size:12px">${e.tenNhaToChuC || '—'}</td>
        <td>${eventStatusBadge(e.trangThai)}</td>
        <td><div class="act-cell">
          ${e.trangThai === 'Vi phạm'
            ? `<button class="btn-action btn-green" onclick="clearViolation(${e.maSuKien})">✅ Xoá vi phạm</button>` : ''}
          ${e.trangThai === 'Ẩn'
            ? `<button class="btn-action btn-teal"  onclick="unhideEvent(${e.maSuKien})">👁 Hiện lại</button>` : ''}
          <button class="btn-action btn-red" onclick="confirmDelete(${e.maSuKien}, '${escHtml(e.tenSuKien)}', 'event')">🗑 Xoá vĩnh viễn</button>
        </div></td>
      </tr>`).join('');
  }

  /* ══════════ ACTIONS ══════════ */

  /* Block / Unblock user */
  function confirmBlock(id, name) {
    openConfirm({
      icon: '🚫', title: `Chặn tài khoản`,
      desc: `Bạn có chắc muốn chặn tài khoản <b>${name}</b>? Người dùng sẽ không thể đăng nhập.`,
      showReason: true,
      okClass: 'btn-confirm-red', okText: '🚫 Chặn ngay',
      onConfirm: () => blockUser(id, name)
    });
  }
  async function blockUser(id, name) {
    try {
      await apiFetch(`/taikhoan/${id}/block`, { method: 'PUT' });
    } catch (e) { /* mock */ }
    const reason = document.getElementById('confirmReasonInput').value.trim();
    const u = allUsersData.find(x => x.maTaiKhoan === id);
    if (u) { u.trangThai = 'blocked'; u.lyDoChaN = reason || 'Vi phạm chính sách'; }
    closeConfirm();
    addLog('Chặn tài khoản', name, '✅ Thành công');
    toast(`🚫 Đã chặn tài khoản ${name}`,'warn');
    renderBlockedBadge();
    goPage(currentPage);
  }

  function confirmUnblock(id, name) {
    openConfirm({
      icon: '✅', title: `Bỏ chặn tài khoản`,
      desc: `Bỏ chặn tài khoản <b>${name}</b>?`,
      okClass: 'btn-confirm-teal', okText: '✅ Bỏ chặn',
      onConfirm: () => unblockUser(id, name)
    });
  }
  async function unblockUser(id, name) {
    try { await apiFetch(`/taikhoan/${id}/unblock`, { method: 'PUT' }); } catch(e){}
    const u = allUsersData.find(x => x.maTaiKhoan === id);
    if (u) { u.trangThai = 'active'; u.lyDoChaN = ''; }
    closeConfirm();
    addLog('Bỏ chặn tài khoản', name, '✅ Thành công');
    toast(`✅ Đã bỏ chặn ${name}`);
    renderBlockedBadge();
    goPage(currentPage);
  }

  /* Delete */
  function confirmDelete(id, name, type) {
    openConfirm({
      icon: '🗑', title: `Xoá vĩnh viễn`,
      desc: `Bạn có chắc muốn <b>xoá vĩnh viễn</b> "${name}"?<br>Hành động này <b>không thể hoàn tác</b>.`,
      okClass: 'btn-confirm-red', okText: '🗑 Xoá vĩnh viễn',
      onConfirm: () => deleteItem(id, name, type)
    });
  }
  async function deleteItem(id, name, type) {
    try {
      const endpoint = type === 'user' ? `/taikhoan/${id}` : `/sukien/${id}`;
      await apiFetch(endpoint, { method: 'DELETE' });
    } catch(e){}
    if (type === 'user')  allUsersData  = allUsersData.filter(x => x.maTaiKhoan !== id);
    if (type === 'event') allEventsData = allEventsData.filter(x => x.maSuKien !== id);
    closeConfirm();
    addLog('Xoá ' + (type==='user'?'tài khoản':'sự kiện'), name, '✅ Đã xoá');
    toast(`🗑 Đã xoá "${name}"`, 'warn');
    renderBlockedBadge(); renderReviewBadge();
    renderDashboard();
    goPage(currentPage);
  }

  /* Approve / Reject events */
  async function approveEvent(id) {
    try { await apiFetch(`/sukien/${id}/approve`, { method: 'PUT' }); } catch(e){}
    const ev = allEventsData.find(e => e.maSuKien === id);
    if (ev) ev.trangThai = 'Đã duyệt';
    addLog('Phê duyệt sự kiện', ev?.tenSuKien||'#'+id, '✅ Đã duyệt');
    toast(`✅ Đã duyệt sự kiện "${ev?.tenSuKien}"`);
    renderReviewBadge(); renderDashboard();
    goPage(currentPage);
  }

  function rejectEvent(id) {
    const ev = allEventsData.find(e => e.maSuKien === id);
    openConfirm({
      icon: '❌', title: 'Từ chối sự kiện',
      desc: `Từ chối sự kiện <b>${ev?.tenSuKien}</b>? Nhà tổ chức sẽ được thông báo.`,
      showReason: true,
      okClass: 'btn-confirm-red', okText: '❌ Từ chối',
      onConfirm: async () => {
        try { await apiFetch(`/sukien/${id}/reject`, { method: 'PUT' }); } catch(e){}
        if (ev) ev.trangThai = 'Từ chối';
        closeConfirm();
        addLog('Từ chối sự kiện', ev?.tenSuKien||'#'+id, '❌ Đã từ chối');
        toast(`❌ Đã từ chối sự kiện "${ev?.tenSuKien}"`, 'err');
        renderReviewBadge(); renderDashboard();
        goPage(currentPage);
      }
    });
  }

  /* Hide / Unhide events */
  function confirmHideEvent(id, name) {
    openConfirm({
      icon: '🙈', title: 'Ẩn sự kiện',
      desc: `Ẩn sự kiện <b>${name}</b>? Sự kiện sẽ không còn hiển thị với người dùng.`,
      showReason: true,
      okClass: 'btn-confirm-red', okText: '🙈 Ẩn ngay',
      onConfirm: () => hideEvent(id, name)
    });
  }
  async function hideEvent(id, name) {
    try { await apiFetch(`/sukien/${id}/hide`, { method: 'PUT' }); } catch(e){}
    const ev = allEventsData.find(e => e.maSuKien === id);
    const reason = document.getElementById('confirmReasonInput').value.trim();
    if (ev) { ev.trangThai = 'Ẩn'; }
    closeConfirm();
    addLog('Ẩn sự kiện', name, '✅ Đã ẩn');
    toast(`🙈 Đã ẩn sự kiện "${name}"`, 'warn');
    renderReviewBadge(); goPage(currentPage);
  }
  async function unhideEvent(id) {
    try { await apiFetch(`/sukien/${id}/unhide`, { method: 'PUT' }); } catch(e){}
    const ev = allEventsData.find(e => e.maSuKien === id);
    if (ev) { ev.trangThai = 'Đã duyệt'; }
    addLog('Hiện sự kiện', ev?.tenSuKien||'#'+id, '✅ Đã hiện');
    toast(`👁 Đã hiện lại sự kiện "${ev?.tenSuKien}"`);
    renderReviewBadge(); goPage(currentPage);
  }

  /* Mark / Clear violation */
  function markViolation(id, name) {
    openConfirm({
      icon: '⚠️', title: 'Đánh dấu vi phạm',
      desc: `Đánh dấu sự kiện <b>${name}</b> vi phạm chính sách?`,
      showReason: true,
      okClass: 'btn-confirm-red', okText: '⚠️ Đánh vi phạm',
      onConfirm: async () => {
        try { await apiFetch(`/sukien/${id}/violation`, { method: 'PUT' }); } catch(e){}
        const ev = allEventsData.find(e => e.maSuKien === id);
        const reason = document.getElementById('confirmReasonInput').value.trim();
        if (ev) { ev.trangThai = 'Vi phạm'; }
        closeConfirm();
        addLog('Đánh vi phạm', name, '⚠️ Vi phạm');
        toast(`⚠️ Đã đánh vi phạm "${name}"`, 'warn');
        renderReviewBadge(); goPage(currentPage);
      }
    });
  }
  async function clearViolation(id) {
    const ev = allEventsData.find(e => e.maSuKien === id);
    try { await apiFetch(`/sukien/${id}/clearviolation`, { method: 'PUT' }); } catch(e){}
    if (ev) { ev.trangThai = 'Đã duyệt'; }
    addLog('Xoá vi phạm', ev?.tenSuKien||'#'+id, '✅ Đã xoá vi phạm');
    toast(`✅ Đã xoá vi phạm cho "${ev?.tenSuKien}"`);
    renderReviewBadge(); goPage(currentPage);
  }

  /* ══════════ REPORTS ══════════ */
  function loadReports() {
    const kh  = allUsersData.filter(u => u.loaiTaiKhoan==='Khách hàng').length;
    const ntc = allUsersData.filter(u => u.loaiTaiKhoan==='Nhà tổ chức').length;
    const nv  = allUsersData.filter(u => u.loaiTaiKhoan==='Nhân viên').length;
    const ok  = allEventsData.filter(e => e.trangThai==='Đã duyệt').length;
    const bad = allEventsData.filter(e => ['Vi phạm','Ẩn'].includes(e.trangThai)).length;
    document.getElementById('rp-kh').textContent    = kh;
    document.getElementById('rp-ntc').textContent   = ntc;
    document.getElementById('rp-nv').textContent    = nv;
    document.getElementById('rp-sk-ok').textContent = ok;
    document.getElementById('rp-sk-bad').textContent = bad;

    const total = kh + ntc + nv || 1;
    document.getElementById('reportChart').innerHTML = [
      { label:'Khách hàng',  val:kh,  color:'var(--teal)' },
      { label:'Nhà tổ chức', val:ntc, color:'var(--purple)' },
      { label:'Nhân viên',   val:nv,  color:'var(--orange)' },
    ].map(d => {
      const pct = Math.round(d.val / total * 100);
      return `
        <div style="flex:1;min-width:160px;background:var(--gray1);border-radius:10px;padding:16px 18px">
          <div style="font-size:12px;font-weight:600;color:var(--gray4);margin-bottom:8px">${d.label}</div>
          <div style="font-size:26px;font-weight:800;color:var(--gray5);margin-bottom:6px">${d.val}</div>
          <div style="height:6px;background:var(--gray2);border-radius:3px;overflow:hidden">
            <div style="height:100%;width:${pct}%;background:${d.color};border-radius:3px;transition:width .6s"></div>
          </div>
          <div style="font-size:11px;color:var(--gray3);margin-top:4px">${pct}% tổng người dùng</div>
        </div>`;
    }).join('');
  }

  /* ══════════ LOGS ══════════ */
  function addLog(action, target, result) {
    adminLogs.unshift({
      time: new Date().toLocaleString('vi-VN'),
      action, target, result
    });
    if (adminLogs.length > 100) adminLogs.pop();
    localStorage.setItem('adminLogs', JSON.stringify(adminLogs));
  }
  function renderLogs() {
    if (!adminLogs.length) {
      document.getElementById('logsBody').innerHTML = `<tr class="loading-row"><td colspan="4">Chưa có hoạt động nào.</td></tr>`;
      return;
    }
    document.getElementById('logsBody').innerHTML = adminLogs.map(l => `
      <tr>
        <td style="font-size:12px;color:var(--gray3);white-space:nowrap">${l.time}</td>
        <td><b>${l.action}</b></td>
        <td style="font-size:13px">${l.target}</td>
        <td>${l.result}</td>
      </tr>`).join('');
  }
  function clearLogs() {
    adminLogs = [];
    localStorage.removeItem('adminLogs');
    renderLogs();
    toast('🗑 Đã xoá nhật ký');
  }

  /* ══════════ CONFIRM MODAL ══════════ */
  let _onConfirm = null;
  function openConfirm({ icon, title, desc, showReason, okClass, okText, onConfirm }) {
    document.getElementById('confirmIcon').textContent = icon;
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmDesc').innerHTML = desc;
    document.getElementById('confirmReason').style.display = showReason ? 'block' : 'none';
    document.getElementById('confirmReasonInput').value = '';
    const btn = document.getElementById('confirmOkBtn');
    btn.textContent = okText;
    btn.className = `btn-action ${okClass}`;
    _onConfirm = onConfirm;
    document.getElementById('confirmOverlay').classList.add('open');
  }
  function closeConfirm() {
    document.getElementById('confirmOverlay').classList.remove('open');
    _onConfirm = null;
  }
  function confirmAction() { if (_onConfirm) _onConfirm(); }

  /* ══════════ TOAST ══════════ */
  function toast(msg, type='ok') {
    const c = document.getElementById('toastContainer');
    const el = document.createElement('div');
    el.className = 'toast-msg' + (type==='err' ? ' err' : type==='warn' ? ' warn' : '');
    el.textContent = msg;
    c.appendChild(el);
    setTimeout(() => { el.style.opacity='0'; el.style.transition='opacity .3s'; }, 2600);
    setTimeout(() => el.remove(), 3000);
  }

  /* ══════════ GLOBAL SEARCH ══════════ */
  function globalSearchHandler() {
    const q = document.getElementById('globalSearch').value.trim().toLowerCase();
    if (!q) return;
    const matchUser  = allUsersData.find(u => (u.tenDangNhap||'').toLowerCase().includes(q));
    const matchEvent = allEventsData.find(e => e.tenSuKien.toLowerCase().includes(q));
    if (matchUser) { goPage('users'); document.getElementById('searchUsers').value = q; filterUsers(); }
    else if (matchEvent) { goPage('events'); document.getElementById('searchEvents').value = q; filterEvents(); }
    else toast(`Không tìm thấy "${q}"`, 'warn');
  }

  /* ══════════ NOTIF ══════════ */
  function showNotif() {
    const p = allEventsData.filter(e => e.trangThai === 'Chờ duyệt').length;
    const b = allUsersData.filter(u => (u.trangThai||'active') === 'blocked').length;
    toast(`🔔 ${p} sự kiện chờ duyệt · ${b} tài khoản bị chặn`);
  }

  /* ══════════ BADGE HELPERS ══════════ */
  function roleColor(role) {
    return { 'Khách hàng':'#0d9488','Nhà tổ chức':'#7c3aed','Nhân viên':'#d97706' }[role] || '#6b7280';
  }
  function roleBadge(role) {
    const map = {
      'Khách hàng' : ['badge-kh','🛒'],
      'Nhà tổ chức': ['badge-ntc','🎪'],
      'Nhân viên'  : ['badge-nv','💼'],
      'Admin'      : ['badge-admin','👑'],
    };
    const [cls, icon] = map[role] || ['badge-kh','👤'];
    return `<span class="badge ${cls}">${icon} ${role}</span>`;
  }
  function statusBadge(s) {
    if (s === 'active')  return `<span class="badge badge-active"><span class="badge-dot"></span>Hoạt động</span>`;
    if (s === 'blocked') return `<span class="badge badge-block"><span class="badge-dot"></span>Bị chặn</span>`;
    return `<span class="badge badge-hidden">${s}</span>`;
  }
  function eventStatusBadge(s) {
    const map = {
      'Đã duyệt' : 'badge-approved',
      'Chờ duyệt': 'badge-pending',
      'Ẩn'       : 'badge-hidden',
      'Vi phạm'  : 'badge-violation',
      'Từ chối'  : 'badge-block',
    };
    return `<span class="badge ${map[s]||'badge-hidden'}">${s}</span>`;
  }
  function escHtml(s) { return (s||'').replace(/'/g,"\\'").replace(/"/g,'&quot;'); }