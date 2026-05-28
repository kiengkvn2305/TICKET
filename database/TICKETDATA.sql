-- =========================================================
-- TICKET DATABASE — Oracle SQL
-- =========================================================

-- =========================================================
-- SEQUENCES
-- =========================================================
CREATE SEQUENCE TAIKHOAN_SEQ  START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE NHANVIEN_SEQ  START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE KHACHHANG_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE NHATOCHUC_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE SUKIEN_SEQ    START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE VE_SEQ        START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE VOUCHER_SEQ   START WITH 1 INCREMENT BY 1;  -- FIX 5: thiếu sequence này
CREATE SEQUENCE HOADON_SEQ    START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE DIADIEM_SEQ   START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE GHE_SEQ       START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE THANHTOAN_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE HOANVE_SEQ    START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE BAOCAO_SEQ    START WITH 1 INCREMENT BY 1;

-- =========================
-- 1. TÀI KHOẢN
-- =========================
CREATE TABLE TAIKHOAN (
    MaTaiKhoan      NUMBER PRIMARY KEY,
    LoaiTaiKhoan    VARCHAR2(50) NOT NULL,
    MatKhau         VARCHAR2(255) NOT NULL,
    TenTaiKhoan     VARCHAR2(255) UNIQUE,
    TrangThai       VARCHAR(255) DEFAULT 'ACTIVE'
);

INSERT INTO TAIKHOAN(MaTaiKhoan, LoaiTaiKhoan, MatKhau, TenTaiKhoan) VALUES 
(TAIKHOAN_SEQ.NEXTVAL, 'Quản lý', '$2a$10$OGTC3KuxfHQ4lo9p1Vk7ZOs/LPwT92yQ/TVwYaZ78OY0IjVa4gqIy', 'manager');

-- =========================
-- 2. KHÁCH HÀNG
-- =========================
CREATE TABLE KHACHHANG (
    MaKhachHang     NUMBER PRIMARY KEY,
    TenKhachHang    VARCHAR2(100),
    Email           VARCHAR2(100),
    SoDienThoai     VARCHAR2(20),
    MaTaiKhoan      NUMBER,
    CONSTRAINT fk_kh_tk FOREIGN KEY (MaTaiKhoan)
        REFERENCES TAIKHOAN(MaTaiKhoan)
);

-- =========================
-- 3. NHÂN VIÊN
-- =========================
CREATE TABLE NHANVIEN (
    MaNhanVien      NUMBER PRIMARY KEY,
    TenNhanVien     VARCHAR2(100),
    Email           VARCHAR2(100),
    SoDienThoai     VARCHAR2(20),
    NgayVaoLam      DATE,
    MaTaiKhoan      NUMBER,
    CONSTRAINT fk_nv_tk FOREIGN KEY (MaTaiKhoan)
        REFERENCES TAIKHOAN(MaTaiKhoan)
);

-- =========================
-- 4. NHÀ TỔ CHỨC
-- =========================
CREATE TABLE NHATOCHUC (
    MaCongTy            NUMBER PRIMARY KEY,
    TenCongTy           VARCHAR2(150),
    TenNguoiDaiDien     VARCHAR2(100),
    DiaChi              VARCHAR2(200),
    Email               VARCHAR2(100),
    SoDienThoai         VARCHAR2(20),
    MaTaiKhoan          NUMBER,
    MaQR                VARCHAR(150),
    CONSTRAINT fk_ct_tk FOREIGN KEY (MaTaiKhoan)
        REFERENCES TAIKHOAN(MaTaiKhoan)
);

-- =========================
-- 5. SỰ KIỆN
-- =========================
CREATE TABLE SUKIEN (
    MaSuKien            NUMBER PRIMARY KEY,
    TenSuKien           VARCHAR2(150) UNIQUE,
    MoTa                VARCHAR2(500),
    ThoiGianBatDau      DATE,
    ThoiGianKetThuc     DATE,
    MaCongTy            NUMBER,
    
    TrangThai           VARCHAR(150),
    MaDiaDiem            NUMBER,
    
    CONSTRAINT fk_sk_dd FOREIGN KEY (MaDiaDiem)
        REFERENCES DIADIEM(MaDiaDiem),
    CONSTRAINT fk_sk_ct FOREIGN KEY (MaCongTy)
        REFERENCES NHATOCHUC(MaCongTy)
);


COMMIT;
-- =========================
-- 6. ĐỊA ĐIỂM
-- =========================
CREATE TABLE DIADIEM (
    MaDiaDiem       NUMBER PRIMARY KEY,
    TenDiaDiem      VARCHAR2(100),
    DiaChi          VARCHAR2(200),
    SucChua         NUMBER,
    LoaiSoDo        VARCHAR2(200)
);

-- =========================
-- 7. VÉ
-- =========================
CREATE TABLE VE (
    MaVe            NUMBER PRIMARY KEY,
    TenVe           VARCHAR2(100),
    LoaiVe          VARCHAR2(50),
    Gia             NUMBER,
    SoLuong         NUMBER(10,0),
    DaBan           NUMBER(10,0),
    TrangThai       VARCHAR2(50),
    MoTa            VARCHAR2(3000),
    MaSuKien        NUMBER,
    CONSTRAINT fk_ve_sk FOREIGN KEY (MaSuKien)
        REFERENCES SUKIEN(MaSuKien),

    CONSTRAINT CK_VE_LV CHECK(LoaiVe IN ('Thường', 'VIP'))
);

-- =========================
-- 8. GHẾ
-- =========================
CREATE TABLE GHE (
    MaGhe           NUMBER PRIMARY KEY,
    KhuVuc          VARCHAR2(50),
    TrangThai       VARCHAR(50),
    MaVe            NUMBER,
    MaDiaDiem       NUMBER,
    MaHoaDon        NUMBER,
    CONSTRAINT fk_ghe_mv FOREIGN KEY (MaVe)
        REFERENCES VE(MaVe),

    CONSTRAINT fk_ghe_hd FOREIGN KEY (MaHoaDon)
        REFERENCES HOADON(MaHoaDon),

    CONSTRAINT fk_ghe_dd FOREIGN KEY (MaDiaDiem)
        REFERENCES DIADIEM(MaDiaDiem)
);

DELETE FROM BAOCAO;
DELETE FROM CHITIETHOADON;
DELETE FROM THANHTOAN;
DELETE FROM HOANVE;
DELETE FROM GHE;
DELETE FROM HOADON;
DELETE FROM VE;
DELETE FROM VOUCHER;
DELETE FROM SUKIEN;
DELETE FROM NHANVIEN;
DELETE FROM KHACHHANG;
DELETE FROM NHATOCHUC;
DELETE FROM TAIKHOAN;
COMMIT;

INSERT INTO TAIKHOAN (MaTaiKhoan, TenTaiKhoan, LoaiTaiKhoan, MatKhau, TrangThai)
VALUES (TAIKHOAN_SEQ.NEXTVAL, 'kien123_t', 'Quản lý', 'Kien2026A', 'Đang hoạt động');

INSERT INTO TAIKHOAN(MaTaiKhoan, TenTaiKhoan, LoaiTaiKhoan, MatKhau, TrangThai) 
VALUES (TAIKHOAN_SEQ.NEXTVAL, 'nhatochuc_quan', 'Nhà tổ chức', 'Quan#842', 'Đang hoạt động');

INSERT INTO TAIKHOAN (MaTaiKhoan, TenTaiKhoan, LoaiTaiKhoan, MatKhau, TrangThai)
VALUES (TAIKHOAN_SEQ.NEXTVAL, 'ntc_nam123', 'Nhà tổ chức', 'NamVip77', 'Đang hoạt động');

INSERT INTO TAIKHOAN(MaTaiKhoan, TenTaiKhoan, LoaiTaiKhoan, MatKhau, TrangThai)
 VALUES (TAIKHOAN_SEQ.NEXTVAL, 'nhatochuc_huy', 'Nhà tổ chức', 'HuyEvent9', 'Đang hoạt động');

INSERT INTO TAIKHOAN (MaTaiKhoan, TenTaiKhoan, LoaiTaiKhoan, MatKhau, TrangThai)
VALUES (TAIKHOAN_SEQ.NEXTVAL, 'tuan1234567', 'Nhà tổ chức', 'TuanStar5', 'Bị khóa');

INSERT INTO TAIKHOAN(MaTaiKhoan, TenTaiKhoan, LoaiTaiKhoan, MatKhau, TrangThai)
 VALUES (TAIKHOAN_SEQ.NEXTVAL, 'giahung_tc', 'Nhân viên', 'Hung456K', 'Đang hoạt động');

INSERT INTO TAIKHOAN(MaTaiKhoan, TenTaiKhoan, LoaiTaiKhoan, MatKhau, TrangThai)
 VALUES (TAIKHOAN_SEQ.NEXTVAL, 'ha_12367', 'Nhân viên', 'Ha2026QW', 'Đang hoạt động');

INSERT INTO TAIKHOAN(MaTaiKhoan, TenTaiKhoan, LoaiTaiKhoan, MatKhau, TrangThai)
 VALUES (TAIKHOAN_SEQ.NEXTVAL, 'hoaiphuong_abc', 'Nhân viên', 'Phuong778', 'Đang hoạt động');

INSERT INTO TAIKHOAN(MaTaiKhoan, TenTaiKhoan, LoaiTaiKhoan, MatKhau, TrangThai)
 VALUES (TAIKHOAN_SEQ.NEXTVAL, 'ducanh_nv', 'Nhân viên', 'DucAnh29', 'Đang hoạt động');

INSERT INTO TAIKHOAN(MaTaiKhoan, TenTaiKhoan, LoaiTaiKhoan, MatKhau, TrangThai)
 VALUES (TAIKHOAN_SEQ.NEXTVAL, 'nv_giabao', 'Nhân viên', 'BaoAdmin7', 'Bị khóa');

INSERT INTO TAIKHOAN(MaTaiKhoan, TenTaiKhoan, LoaiTaiKhoan, MatKhau, TrangThai)
 VALUES (TAIKHOAN_SEQ.NEXTVAL, 'nv_an123', 'Khách hàng', 'An789xyz', 'Đang hoạt động');

INSERT INTO TAIKHOAN(MaTaiKhoan, TenTaiKhoan, LoaiTaiKhoan, MatKhau, TrangThai)
 VALUES (TAIKHOAN_SEQ.NEXTVAL, 'bich_tran', 'Khách hàng', 'Bich@551', 'Đang hoạt động');

INSERT INTO TAIKHOAN(MaTaiKhoan, TenTaiKhoan, LoaiTaiKhoan, MatKhau, TrangThai)
 VALUES (TAIKHOAN_SEQ.NEXTVAL, 'bao123_hoang', 'Khách hàng', 'BaoPro88', 'Đang hoạt động');

INSERT INTO TAIKHOAN(MaTaiKhoan, TenTaiKhoan, LoaiTaiKhoan, MatKhau, TrangThai)
 VALUES (TAIKHOAN_SEQ.NEXTVAL, 'tamtam', 'Khách hàng', 'TamTam90', 'Đang hoạt động');

INSERT INTO TAIKHOAN(MaTaiKhoan, TenTaiKhoan, LoaiTaiKhoan, MatKhau, TrangThai)
 VALUES (TAIKHOAN_SEQ.NEXTVAL, 'nhatminh_phan', 'Khách hàng', 'MinhSky22', 'Đang hoạt động');

INSERT INTO TAIKHOAN(MaTaiKhoan, TenTaiKhoan, LoaiTaiKhoan, MatKhau, TrangThai)
 VALUES (TAIKHOAN_SEQ.NEXTVAL, 'dang_abc', 'Khách hàng', 'Dang7788', 'Đang hoạt động');

INSERT INTO TAIKHOAN(MaTaiKhoan, TenTaiKhoan, LoaiTaiKhoan, MatKhau, TrangThai)
 VALUES (TAIKHOAN_SEQ.NEXTVAL, 'tung_ha', 'Khách hàng', 'TungPass9', 'Đang hoạt động');

INSERT INTO TAIKHOAN(MaTaiKhoan, TenTaiKhoan, LoaiTaiKhoan, MatKhau, TrangThai)
 VALUES (TAIKHOAN_SEQ.NEXTVAL, 'khanhlinh', 'Khách hàng', 'LinhCute7', 'Đang hoạt động');

INSERT INTO TAIKHOAN(MaTaiKhoan, TenTaiKhoan, LoaiTaiKhoan, MatKhau, TrangThai)
 VALUES (TAIKHOAN_SEQ.NEXTVAL, 'giabao_123', 'Khách hàng', 'Bao321TT', 'Bị khóa');

INSERT INTO TAIKHOAN(MaTaiKhoan, TenTaiKhoan, LoaiTaiKhoan, MatKhau, TrangThai)
 VALUES (TAIKHOAN_SEQ.NEXTVAL, 'quynhanh_anh', 'Khách hàng', 'AnhQ2026', 'Đang hoạt động');
 
commit;

INSERT INTO KHACHHANG (MaKhachHang, TenKhachHang, Email, SoDienThoai, MaTaiKhoan)
VALUES (KHACHHANG_SEQ.NEXTVAL, 'Nguyễn Văn An', 'an.nguyen@gmail.com', '0905123456', 11);

INSERT INTO KHACHHANG (MaKhachHang, TenKhachHang, Email, SoDienThoai, MaTaiKhoan)
VALUES (KHACHHANG_SEQ.NEXTVAL, 'Trần Thị Bích', 'bich.tran@gmail.com', '0906234567', 12);

INSERT INTO KHACHHANG (MaKhachHang, TenKhachHang, Email, SoDienThoai, MaTaiKhoan)
VALUES (KHACHHANG_SEQ.NEXTVAL, 'Hoàng Quốc Bảo', 'bao.hoang@gmail.com', '0907345678', 13);

INSERT INTO KHACHHANG (MaKhachHang, TenKhachHang, Email, SoDienThoai, MaTaiKhoan)
VALUES (KHACHHANG_SEQ.NEXTVAL, 'Võ Minh Tâm', 'tam.vo@gmail.com', '0908456789', 14);

INSERT INTO KHACHHANG (MaKhachHang, TenKhachHang, Email, SoDienThoai, MaTaiKhoan)
VALUES (KHACHHANG_SEQ.NEXTVAL, 'Phan Nhật Minh', 'minh.phan@gmail.com', '0909567890', 15);

INSERT INTO KHACHHANG (MaKhachHang, TenKhachHang, Email, SoDienThoai, MaTaiKhoan)
VALUES (KHACHHANG_SEQ.NEXTVAL, 'Ngô Hải Đăng', 'dang.ngo@gmail.com', '0911678901', 16);

INSERT INTO KHACHHANG (MaKhachHang, TenKhachHang, Email, SoDienThoai, MaTaiKhoan)
VALUES (KHACHHANG_SEQ.NEXTVAL, 'Bùi Thanh Tùng', 'tung.bui@gmail.com', '0912789012', 17);

INSERT INTO KHACHHANG (MaKhachHang, TenKhachHang, Email, SoDienThoai, MaTaiKhoan)
VALUES (KHACHHANG_SEQ.NEXTVAL, 'Lý Khánh Linh', 'linh.ly@gmail.com', '0913890123', 18);

INSERT INTO KHACHHANG (MaKhachHang, TenKhachHang, Email, SoDienThoai, MaTaiKhoan)
VALUES (KHACHHANG_SEQ.NEXTVAL, 'Trương Gia Bảo', 'bao.truong@gmail.com', '0914901234', 19);

INSERT INTO KHACHHANG (MaKhachHang, TenKhachHang, Email, SoDienThoai, MaTaiKhoan)
VALUES (KHACHHANG_SEQ.NEXTVAL, 'Đỗ Quỳnh Anh', 'anh.do@gmail.com', '0915012345', 20);


commit;


INSERT INTO NHATOCHUC
(MaCongTy, TenCongTy, TenNguoiDaiDien, DiaChi, Email, SoDienThoai, MaQR, MaTaiKhoan)
VALUES
(NHATOCHUC_SEQ.NEXTVAL, 'Ticketbox', 'Trần Minh Quân',
'24 Nguyễn Huệ, Quận 1, TP.HCM',
'ticketbox@gmail.com', '02838221111', 'QR001', 2);

INSERT INTO NHATOCHUC
(MaCongTy, TenCongTy, TenNguoiDaiDien, DiaChi, Email, SoDienThoai, MaQR, MaTaiKhoan)
VALUES
(NHATOCHUC_SEQ.NEXTVAL, 'Yeah1 Entertainment', 'Lê Hoàng Nam',
'102 Nam Kỳ Khởi Nghĩa, Quận 3, TP.HCM',
'yeah1@gmail.com', '02838222222', 'QR002', 3);

INSERT INTO NHATOCHUC
(MaCongTy, TenCongTy, TenNguoiDaiDien, DiaChi, Email, SoDienThoai, MaQR, MaTaiKhoan)
VALUES
(NHATOCHUC_SEQ.NEXTVAL, 'VieON Events', 'Phạm Quốc Huy',
'15 Duy Tân, Cầu Giấy, Hà Nội',
'vieon.events@gmail.com', '02437373333', 'QR003', 4);

INSERT INTO NHATOCHUC
(MaCongTy, TenCongTy, TenNguoiDaiDien, DiaChi, Email, SoDienThoai, MaQR, MaTaiKhoan)
VALUES
(NHATOCHUC_SEQ.NEXTVAL, 'Galaxy Live', 'Đỗ Minh Tuấn',
'12 Bạch Đằng, Hải Châu, Đà Nẵng',
'galaxylive@gmail.com', '02363884444', 'QR004', 5);


commit;

INSERT INTO NHANVIEN
(MaNhanVien, TenNhanVien, SoDienThoai, Email, NgayVaoLam, MaTaiKhoan)
VALUES
(NHANVIEN_SEQ.NEXTVAL, 'Phạm Gia Hưng', '0903111222', 'hung.pham@gmail.com',
TO_DATE('2023-05-10', 'YYYY-MM-DD'), 6);

INSERT INTO NHANVIEN
(MaNhanVien, TenNhanVien, SoDienThoai, Email, NgayVaoLam, MaTaiKhoan)
VALUES
(NHANVIEN_SEQ.NEXTVAL, 'Đặng Thu Hà', '0903222333', 'ha.dang@gmail.com',
TO_DATE('2023-08-15', 'YYYY-MM-DD'), 7);

INSERT INTO NHANVIEN
(MaNhanVien, TenNhanVien, SoDienThoai, Email, NgayVaoLam, MaTaiKhoan)
VALUES
(NHANVIEN_SEQ.NEXTVAL, 'Nguyễn Hoài Phương', '0903333444', 'phuong.nguyen@gmail.com',
TO_DATE('2024-01-12', 'YYYY-MM-DD'), 8);

INSERT INTO NHANVIEN
(MaNhanVien, TenNhanVien, SoDienThoai, Email, NgayVaoLam, MaTaiKhoan)
VALUES
(NHANVIEN_SEQ.NEXTVAL, 'Trương Đức Anh', '0903444555', 'anh.truong@gmail.com',
TO_DATE('2024-03-20', 'YYYY-MM-DD'), 9);

INSERT INTO NHANVIEN
(MaNhanVien, TenNhanVien, SoDienThoai, Email, NgayVaoLam, MaTaiKhoan)
VALUES
(NHANVIEN_SEQ.NEXTVAL, 'Lý Gia Bảo', '0903555666', 'bao.ly@gmail.com',
TO_DATE('2024-06-01', 'YYYY-MM-DD'), 10);





INSERT INTO DIADIEM
(MaDiaDiem, TenDiaDiem, DiaChi, SucChua, LoaiSoDo)
VALUES
(DIADIEM_SEQ.NEXTVAL, 'Sân vận động Mỹ Đình', 'Nam Từ Liêm, Hà Nội', 40000, 'Hình tròn');

INSERT INTO DIADIEM
(MaDiaDiem, TenDiaDiem, DiaChi, SucChua, LoaiSoDo)
VALUES
(DIADIEM_SEQ.NEXTVAL, 'Trung tâm Hội nghị Quốc gia', 'Nam Từ Liêm, Hà Nội', 3500, 'Hình chữ nhật');

INSERT INTO DIADIEM
(MaDiaDiem, TenDiaDiem, DiaChi, SucChua, LoaiSoDo)
VALUES
(DIADIEM_SEQ.NEXTVAL, 'Nhà hát Lớn Hà Nội', 'Hoàn Kiếm, Hà Nội', 900, 'Hình chữ nhật');

INSERT INTO DIADIEM
(MaDiaDiem, TenDiaDiem, DiaChi, SucChua, LoaiSoDo)
VALUES
(DIADIEM_SEQ.NEXTVAL, 'Sân vận động Quân Khu 7', 'Tân Bình, TP.HCM', 25000, 'Hình tròn');

INSERT INTO DIADIEM
(MaDiaDiem, TenDiaDiem, DiaChi, SucChua, LoaiSoDo)
VALUES
(DIADIEM_SEQ.NEXTVAL, 'Nhà hát Hòa Bình', 'Quận 10, TP.HCM', 2400, 'Hình chữ nhật');

INSERT INTO DIADIEM
(MaDiaDiem, TenDiaDiem, DiaChi, SucChua, LoaiSoDo)
VALUES
(DIADIEM_SEQ.NEXTVAL, 'Sân khấu Trống Đồng', 'Quận 1, TP.HCM', 1500, 'Hình chữ nhật');

INSERT INTO DIADIEM
(MaDiaDiem, TenDiaDiem, DiaChi, SucChua, LoaiSoDo)
VALUES
(DIADIEM_SEQ.NEXTVAL, 'SECC - Trung tâm Hội chợ và Triển lãm Sài Gòn', 'Quận 7, TP.HCM', 10000, 'Hình chữ nhật');

INSERT INTO DIADIEM
(MaDiaDiem, TenDiaDiem, DiaChi, SucChua, LoaiSoDo)
VALUES
(DIADIEM_SEQ.NEXTVAL, 'Công viên Biển Đông', 'Sơn Trà, Đà Nẵng', 10000, 'Hình tròn');

INSERT INTO DIADIEM
(MaDiaDiem, TenDiaDiem, DiaChi, SucChua, LoaiSoDo)
VALUES
(DIADIEM_SEQ.NEXTVAL, 'Nhà hát Trưng Vương', 'Hải Châu, Đà Nẵng', 1200,'Hình chữ nhật');

INSERT INTO DIADIEM
(MaDiaDiem, TenDiaDiem, DiaChi, SucChua, LoaiSoDo)
VALUES
(DIADIEM_SEQ.NEXTVAL, 'Sân vận động Hòa Xuân', 'Cẩm Lệ, Đà Nẵng', 20000, 'Hình tròn');


INSERT INTO SUKIEN (MaSuKien, TenSuKien, MoTa, ThoiGianBatDau, ThoiGianKetThuc, TrangThai, MaCongTy, MaDiaDiem)
VALUES
(SUKIEN_SEQ.NEXTVAL, 'Anh Trai Say Hi Concert',
'Đêm nhạc sôi động với sự tham gia của nhiều nghệ sĩ trẻ nổi tiếng như HIEUTHUHAI, Rhyder, Isaac và Đức Phúc, mang đến những màn trình diễn âm nhạc và vũ đạo bùng nổ.',
TO_DATE('2026-07-12 19:00','YYYY-MM-DD HH24:MI'),
TO_DATE('2026-07-12 23:00','YYYY-MM-DD HH24:MI'),
'Đang mở bán', 1, 6);

INSERT INTO SUKIEN (MaSuKien, TenSuKien, MoTa, ThoiGianBatDau, ThoiGianKetThuc, TrangThai, MaCongTy, MaDiaDiem)
VALUES
(SUKIEN_SEQ.NEXTVAL, 'Rap Viet All Stars',
'Đại nhạc hội rap quy tụ các nghệ sĩ nổi bật từ Rap Việt với những màn trình diễn hiphop, freestyle và không khí sôi động dành cho giới trẻ.',
TO_DATE('2026-08-20 18:00','YYYY-MM-DD HH24:MI'),
TO_DATE('2026-08-20 23:30','YYYY-MM-DD HH24:MI'),
'Đang mở bán', 2, 1);

INSERT INTO SUKIEN (MaSuKien, TenSuKien, MoTa, ThoiGianBatDau, ThoiGianKetThuc, TrangThai, MaCongTy, MaDiaDiem)
VALUES
(SUKIEN_SEQ.NEXTVAL, 'Da Nang Music Festival',
'Lễ hội âm nhạc ngoài trời tại Đà Nẵng với nhiều ca sĩ, DJ nổi tiếng cùng không gian biển sôi động và các hoạt động giải trí hấp dẫn.',
TO_DATE('2026-06-15 17:00','YYYY-MM-DD HH24:MI'),
TO_DATE('2026-06-15 22:30','YYYY-MM-DD HH24:MI'),
'Đang mở bán', 3, 7);

INSERT INTO SUKIEN (MaSuKien, TenSuKien, MoTa, ThoiGianBatDau, ThoiGianKetThuc, TrangThai, MaCongTy, MaDiaDiem)
VALUES
(SUKIEN_SEQ.NEXTVAL, 'V Heartbeat Live',
'Đêm nhạc giao lưu quy tụ nghệ sĩ Kpop và Việt Nam với sân khấu hiện đại, các màn biểu diễn đặc sắc và hoạt động fan meeting hấp dẫn.',
TO_DATE('2026-09-05 18:30','YYYY-MM-DD HH24:MI'),
TO_DATE('2026-09-05 22:00','YYYY-MM-DD HH24:MI'),
'Đang mở bán', 1, 8);

INSERT INTO SUKIEN (MaSuKien, TenSuKien, MoTa, ThoiGianBatDau, ThoiGianKetThuc, TrangThai, MaCongTy, MaDiaDiem)
VALUES
(SUKIEN_SEQ.NEXTVAL, 'GENfest 2026',
'Lễ hội âm nhạc dành cho giới trẻ với sự tham gia của nhiều ca sĩ, rapper và DJ nổi tiếng. Sự kiện mang phong cách hiện đại với nhiều khu vực trải nghiệm như check-in, trò chơi tương tác, khu ẩm thực và sân khấu biểu diễn ngoài trời. Đây là một trong những sự kiện giải trí lớn nhất trong năm, thu hút đông đảo khán giả trẻ yêu thích âm nhạc và văn hóa đại chúng.',
TO_DATE('2026-11-10 16:00','YYYY-MM-DD HH24:MI'),
TO_DATE('2026-11-10 23:30','YYYY-MM-DD HH24:MI'),
'Đang mở bán', 2, 9);

INSERT INTO SUKIEN (MaSuKien, TenSuKien, MoTa, ThoiGianBatDau, ThoiGianKetThuc, TrangThai, MaCongTy, MaDiaDiem)
VALUES
(SUKIEN_SEQ.NEXTVAL, 'Sky Wave Festival',
'EDM festival ngoài trời được tổ chức với quy mô lớn, quy tụ nhiều DJ nổi tiếng trong nước và quốc tế. Sự kiện sử dụng hệ thống âm thanh công suất lớn, sân khấu LED hiện đại và hiệu ứng ánh sáng laser hoành tráng. Khán giả sẽ được hòa mình vào không gian âm nhạc điện tử bùng nổ, mang lại trải nghiệm lễ hội sôi động và đầy năng lượng.',
TO_DATE('2026-07-25 18:00','YYYY-MM-DD HH24:MI'),
TO_DATE('2026-07-25 23:59','YYYY-MM-DD HH24:MI'),
'Sắp diễn ra', 4, 10);

INSERT INTO SUKIEN (MaSuKien, TenSuKien, MoTa, ThoiGianBatDau, ThoiGianKetThuc, TrangThai, MaCongTy, MaDiaDiem)
VALUES
(SUKIEN_SEQ.NEXTVAL, 'Monsoon Music Festival',
'Lễ hội âm nhạc quốc tế quy tụ nhiều nghệ sĩ đến từ Việt Nam và các quốc gia khác. Sự kiện hướng đến việc kết nối văn hóa thông qua âm nhạc với nhiều thể loại như pop, rock, indie và electronic. Không gian lễ hội được thiết kế mở, kết hợp biểu diễn nghệ thuật, khu trải nghiệm và hoạt động giao lưu cộng đồng yêu nhạc.',
TO_DATE('2026-10-18 17:30','YYYY-MM-DD HH24:MI'),
TO_DATE('2026-10-18 23:00','YYYY-MM-DD HH24:MI'),
'Đang mở bán', 3, 2);

INSERT INTO SUKIEN (MaSuKien, TenSuKien, MoTa, ThoiGianBatDau, ThoiGianKetThuc, TrangThai, MaCongTy, MaDiaDiem)
VALUES
(SUKIEN_SEQ.NEXTVAL, 'Vietnam Idol Gala',
'Đêm gala âm nhạc với sự tham gia của các thí sinh nổi bật từ chương trình Vietnam Idol cùng nhiều khách mời đặc biệt. Chương trình bao gồm các tiết mục biểu diễn trực tiếp, giao lưu khán giả và trao giải cho các phần trình diễn ấn tượng. Đây là sự kiện tổng kết mang tính nghệ thuật cao, thu hút sự quan tâm lớn từ người hâm mộ âm nhạc.',
TO_DATE('2026-08-08 19:00','YYYY-MM-DD HH24:MI'),
TO_DATE('2026-08-08 22:30','YYYY-MM-DD HH24:MI'),
'Đang mở bán', 1, 3);

INSERT INTO SUKIEN (MaSuKien, TenSuKien, MoTa, ThoiGianBatDau, ThoiGianKetThuc, TrangThai, MaCongTy, MaDiaDiem)
VALUES
(SUKIEN_SEQ.NEXTVAL, 'TikTok Music Night',
'Đêm nhạc dành cho cộng đồng sáng tạo nội dung với sự góp mặt của nhiều nghệ sĩ trẻ, TikToker và influencer nổi tiếng. Sự kiện kết hợp biểu diễn âm nhạc, giao lưu trực tiếp và nhiều hoạt động tương tác dành cho người tham dự, tạo nên không gian giải trí hiện đại gắn liền với xu hướng mạng xã hội.',
TO_DATE('2026-09-20 18:00','YYYY-MM-DD HH24:MI'),
TO_DATE('2026-09-20 23:00','YYYY-MM-DD HH24:MI'),
'Đang mở bán', 2, 5);

INSERT INTO SUKIEN (MaSuKien, TenSuKien, MoTa, ThoiGianBatDau, ThoiGianKetThuc, TrangThai, MaCongTy, MaDiaDiem)
VALUES
(SUKIEN_SEQ.NEXTVAL, 'Asia Dance Festival',
'Lễ hội trình diễn dance quốc tế quy tụ nhiều nhóm nhảy nổi tiếng đến từ các quốc gia châu Á. Chương trình bao gồm các phần thi đấu dance cover, hiphop, breaking và biểu diễn nghệ thuật đường phố kết hợp âm nhạc sôi động. Đây là sân chơi nghệ thuật dành cho giới trẻ yêu thích vũ đạo hiện đại.',
TO_DATE('2026-12-01 17:00','YYYY-MM-DD HH24:MI'),
TO_DATE('2026-12-01 22:00','YYYY-MM-DD HH24:MI'),
'Sắp diễn ra', 4, 4);

INSERT INTO SUKIEN (MaSuKien, TenSuKien, MoTa, ThoiGianBatDau, ThoiGianKetThuc, TrangThai, MaCongTy, MaDiaDiem)
VALUES
(SUKIEN_SEQ.NEXTVAL, 'Born Pink World Tour',
'Concert quốc tế của nhóm nhạc BLACKPINK được tổ chức với quy mô lớn tại sân vận động Mỹ Đình. Sự kiện mang đến các tiết mục biểu diễn nổi bật cùng hệ thống âm thanh, ánh sáng hiện đại và sân khấu được đầu tư hoành tráng. Người hâm mộ sẽ được thưởng thức những ca khúc nổi tiếng và các phần giao lưu đặc biệt cùng nghệ sĩ trong một đêm nhạc đẳng cấp thế giới.',
TO_DATE('2026-09-28 19:00','YYYY-MM-DD HH24:MI'),
TO_DATE('2026-09-28 23:00','YYYY-MM-DD HH24:MI'),
'Đang mở bán', 1, 1);

INSERT INTO SUKIEN (MaSuKien, TenSuKien, MoTa, ThoiGianBatDau, ThoiGianKetThuc, TrangThai, MaCongTy, MaDiaDiem)
VALUES
(SUKIEN_SEQ.NEXTVAL, 'Sơn Tùng M-TP Live Stage',
'Show diễn cá nhân của Sơn Tùng M-TP với nhiều tiết mục được đầu tư công phu và dàn dựng chuyên nghiệp. Sự kiện hứa hẹn mang đến không khí bùng nổ với các ca khúc nổi tiếng, phần biểu diễn live band và hiệu ứng sân khấu hiện đại, tạo nên trải nghiệm âm nhạc ấn tượng cho người hâm mộ.',
TO_DATE('2026-07-30 19:00','YYYY-MM-DD HH24:MI'),
TO_DATE('2026-07-30 22:30','YYYY-MM-DD HH24:MI'),
'Đang mở bán', 2, 6);

INSERT INTO SUKIEN (MaSuKien, TenSuKien, MoTa, ThoiGianBatDau, ThoiGianKetThuc, TrangThai, MaCongTy, MaDiaDiem)
VALUES
(SUKIEN_SEQ.NEXTVAL, 'SpaceSpeakers Concert',
'Đêm nhạc của SpaceSpeakers quy tụ nhiều rapper, producer và ca sĩ nổi tiếng trong cộng đồng underground Việt Nam. Sự kiện kết hợp rap, EDM và hiphop hiện đại cùng hiệu ứng sân khấu sống động, mang lại trải nghiệm âm nhạc mạnh mẽ và cá tính dành cho khán giả trẻ.',
TO_DATE('2026-08-14 18:00','YYYY-MM-DD HH24:MI'),
TO_DATE('2026-08-14 23:00','YYYY-MM-DD HH24:MI'),
'Đang mở bán', 3, 5);

INSERT INTO SUKIEN (MaSuKien, TenSuKien, MoTa, ThoiGianBatDau, ThoiGianKetThuc, TrangThai, MaCongTy, MaDiaDiem)
VALUES
(SUKIEN_SEQ.NEXTVAL, 'Lễ hội pháo hoa Đà Nẵng',
'Sự kiện trình diễn pháo hoa quốc tế kết hợp âm nhạc và ánh sáng nghệ thuật. Các đội thi đến từ nhiều quốc gia mang đến những màn trình diễn pháo hoa đặc sắc bên bờ sông Hàn, tạo nên không gian lễ hội du lịch hấp dẫn và thu hút đông đảo du khách.',
TO_DATE('2026-06-28 18:00','YYYY-MM-DD HH24:MI'),
TO_DATE('2026-06-28 23:30','YYYY-MM-DD HH24:MI'),
'Đang mở bán', 4, 7);

INSERT INTO SUKIEN (MaSuKien, TenSuKien, MoTa, ThoiGianBatDau, ThoiGianKetThuc, TrangThai, MaCongTy, MaDiaDiem)
VALUES
(SUKIEN_SEQ.NEXTVAL, 'K-POP FEST Hanoi',
'Lễ hội âm nhạc Kpop tại Hà Nội với sự tham gia của nhiều nghệ sĩ Hàn Quốc và ca sĩ Việt Nam nổi tiếng. Chương trình được tổ chức với sân khấu hiện đại, hiệu ứng hình ảnh sống động cùng các hoạt động giao lưu, biểu diễn dance cover và fan meeting dành cho người hâm mộ.',
TO_DATE('2026-10-02 18:30','YYYY-MM-DD HH24:MI'),
TO_DATE('2026-10-02 23:00','YYYY-MM-DD HH24:MI'),
'Đang mở bán', 1, 2);

INSERT INTO SUKIEN (MaSuKien, TenSuKien, MoTa, ThoiGianBatDau, ThoiGianKetThuc, TrangThai, MaCongTy, MaDiaDiem)
VALUES
(SUKIEN_SEQ.NEXTVAL, 'Acoustic Chill Night',
'Đêm nhạc acoustic với không gian nhẹ nhàng và gần gũi dành cho khán giả yêu thích âm nhạc thư giãn. Sự kiện có sự góp mặt của nhiều ca sĩ indie và acoustic band, mang đến những giai điệu mộc mạc, cảm xúc và gần gũi với người nghe.',
TO_DATE('2026-05-20 19:00','YYYY-MM-DD HH24:MI'),
TO_DATE('2026-05-20 22:00','YYYY-MM-DD HH24:MI'),
'Đã kết thúc', 2, 9);

INSERT INTO SUKIEN (MaSuKien, TenSuKien, MoTa, ThoiGianBatDau, ThoiGianKetThuc, TrangThai, MaCongTy, MaDiaDiem)
VALUES
(SUKIEN_SEQ.NEXTVAL, 'DJ Summer Party',
'Đại tiệc âm nhạc điện tử mùa hè với sự tham gia của nhiều DJ nổi tiếng. Sự kiện mang đến không gian âm nhạc sôi động với hệ thống ánh sáng laser, sân khấu LED hiện đại và hiệu ứng âm thanh mạnh mẽ, tạo nên bữa tiệc giải trí bùng nổ cho giới trẻ.',
TO_DATE('2026-07-18 20:00','YYYY-MM-DD HH24:MI'),
TO_DATE('2026-07-19 00:00','YYYY-MM-DD HH24:MI'),
'Sắp diễn ra', 3, 8);

INSERT INTO SUKIEN (MaSuKien, TenSuKien, MoTa, ThoiGianBatDau, ThoiGianKetThuc, TrangThai, MaCongTy, MaDiaDiem)
VALUES
(SUKIEN_SEQ.NEXTVAL, 'Hiphop Showcase Vietnam',
'Chương trình biểu diễn hiphop và street dance với sự tham gia của nhiều dancer và rapper nổi tiếng trong nước. Sự kiện còn có các phần thi đấu freestyle, giao lưu nghệ sĩ và hoạt động trải nghiệm văn hóa hiphop hiện đại dành cho cộng đồng yêu nhạc.',
TO_DATE('2026-09-12 17:30','YYYY-MM-DD HH24:MI'),
TO_DATE('2026-09-12 22:30','YYYY-MM-DD HH24:MI'),
'Đang mở bán', 4, 3);

INSERT INTO SUKIEN (MaSuKien, TenSuKien, MoTa, ThoiGianBatDau, ThoiGianKetThuc, TrangThai, MaCongTy, MaDiaDiem)
VALUES
(SUKIEN_SEQ.NEXTVAL, 'Indie Music Festival',
'Sự kiện âm nhạc dành cho các nghệ sĩ indie với nhiều tiết mục biểu diễn acoustic, pop và alternative. Không gian lễ hội được thiết kế mở với khu ẩm thực, check-in và hoạt động giao lưu cộng đồng yêu nhạc indie, tạo nên trải nghiệm nghệ thuật gần gũi và sáng tạo.',
TO_DATE('2026-11-21 18:00','YYYY-MM-DD HH24:MI'),
TO_DATE('2026-11-21 23:00','YYYY-MM-DD HH24:MI'),
'Đang mở bán', 2, 7);

INSERT INTO SUKIEN (MaSuKien, TenSuKien, MoTa, ThoiGianBatDau, ThoiGianKetThuc, TrangThai, MaCongTy, MaDiaDiem)
VALUES
(SUKIEN_SEQ.NEXTVAL, 'Countdown New Year 2027',
'Đại nhạc hội chào đón năm mới 2027 với sự tham gia của nhiều nghệ sĩ nổi tiếng. Chương trình được tổ chức ngoài trời với sân khấu lớn, hiệu ứng ánh sáng và pháo hoa nghệ thuật, mang đến không khí đón năm mới sôi động và đáng nhớ cho khán giả.',
TO_DATE('2026-12-31 19:00','YYYY-MM-DD HH24:MI'),
TO_DATE('2027-01-01 00:30','YYYY-MM-DD HH24:MI'),
'Sắp diễn ra', 1, 1);

COMMIT;

INSERT INTO VE 
(MaVe, TenVe, LoaiVe, Gia, TrangThai, MoTa, MaSuKien)
VALUES
(VE_SEQ.NEXTVAL, 'Galaxy Zone', 'VIP', 2500000,
'Đang mở bán',
'Khu vực VIP gần sân khấu, quà lưu niệm đặc biệt', 5);

INSERT INTO VE
(MaVe, TenVe, LoaiVe, Gia, TrangThai, MoTa, MaSuKien)
VALUES
(VE_SEQ.NEXTVAL, 'Freedom Pass', 'Thường', 900000,
'Đang mở bán',
'Khu vực tiêu chuẩn dành cho khán giả', 5);



INSERT INTO VE
(MaVe, TenVe, LoaiVe, Gia, TrangThai, MoTa, MaSuKien)
VALUES
(VE_SEQ.NEXTVAL, 'Sky Lounge', 'VIP', 4500000,
'Đang mở bán',
'Khu vực VIP riêng và gặp gỡ nghệ sĩ', 6);

INSERT INTO VE
(MaVe, TenVe, LoaiVe, Gia, TrangThai, MoTa, MaSuKien)
VALUES
(VE_SEQ.NEXTVAL, 'Street Wave', 'Thường', 700000,
'Đang mở bán',
'Khu vực đứng tự do gần sân khấu', 6);



INSERT INTO VE
(MaVe, TenVe, LoaiVe, Gia, TrangThai, MoTa, MaSuKien)
VALUES
(VE_SEQ.NEXTVAL, 'Golden Flow', 'VIP', 2200000,
'Đang mở bán',
'Khu vực trung tâm sân khấu', 7);

INSERT INTO VE
(MaVe, TenVe, LoaiVe, Gia, TrangThai, MoTa, MaSuKien)
VALUES
(VE_SEQ.NEXTVAL, 'Standard Entry', 'Thường', 800000,
'Đang mở bán',
'Khu vực phổ thông với tầm nhìn tốt', 7);



INSERT INTO VE
(MaVe, TenVe, LoaiVe, Gia, TrangThai, MoTa, MaSuKien)
VALUES
(VE_SEQ.NEXTVAL, 'Diamond Seat', 'VIP', 5000000,
'Đang mở bán',
'Ghế VIP sát sân khấu và ưu tiên check-in', 8);

INSERT INTO VE
(MaVe, TenVe, LoaiVe, Gia, TrangThai, MoTa, MaSuKien)
VALUES
(VE_SEQ.NEXTVAL, 'Open Ground', 'Thường', 650000,
'Đang mở bán',
'Khu vực tự do dành cho khán giả phổ thông', 8);



INSERT INTO VE
(MaVe, TenVe, LoaiVe, Gia, TrangThai, MoTa, MaSuKien)
VALUES
(VE_SEQ.NEXTVAL, 'Royal Lounge', 'VIP', 3800000,
'Đang mở bán',
'Không gian VIP riêng biệt với phục vụ đồ uống', 9);

INSERT INTO VE
(MaVe, TenVe, LoaiVe, Gia, TrangThai, MoTa, MaSuKien)
VALUES
(VE_SEQ.NEXTVAL, 'Festival Pass', 'Thường', 750000,
'Đang mở bán',
'Vé tham gia toàn bộ khu vực lễ hội', 9);



INSERT INTO VE
(MaVe, TenVe, LoaiVe, Gia, TrangThai, MoTa, MaSuKien)
VALUES
(VE_SEQ.NEXTVAL, 'Elite Zone', 'VIP', 4200000,
'Đang mở bán',
'Khu vực cao cấp với chỗ ngồi riêng', 10);

INSERT INTO VE
(MaVe, TenVe, LoaiVe, Gia, TrangThai, MoTa, MaSuKien)
VALUES
(VE_SEQ.NEXTVAL, 'Basic Entry', 'Thường', 500000,
'Đang mở bán',
'Khu vực tiêu chuẩn tiết kiệm', 10);




INSERT INTO VOUCHER
(MaVoucher, MaCode, DanhSachSuKien, MucKhuyenMai,
NgayBatDau, NgayKetThuc, TrangThai,
LuotSuDung, SoLuong, MaCongTy)
VALUES
(
VOUCHER_SEQ.NEXTVAL,
'SUMMER10',
'5,6,7',
10,
TO_DATE('2026-05-01','YYYY-MM-DD'),
TO_DATE('2026-08-30','YYYY-MM-DD'),
'Đang hoạt động',
50,
100,
1
);

INSERT INTO VOUCHER
(MaVoucher, MaCode, DanhSachSuKien, MucKhuyenMai,
NgayBatDau, NgayKetThuc, TrangThai,
LuotSuDung, SoLuong, MaCongTy)
VALUES
(
VOUCHER_SEQ.NEXTVAL,
'RAP20',
'8,9',
20,
TO_DATE('2026-06-01','YYYY-MM-DD'),
TO_DATE('2026-08-20','YYYY-MM-DD'),
'Đang hoạt động',
30,
50,
2
);

INSERT INTO VOUCHER
(MaVoucher, MaCode, DanhSachSuKien, MucKhuyenMai,
NgayBatDau, NgayKetThuc, TrangThai,
LuotSuDung, SoLuong, MaCongTy)
VALUES
(
VOUCHER_SEQ.NEXTVAL,
'MUSIC15',
'10,11,12',
15,
TO_DATE('2026-07-01','YYYY-MM-DD'),
TO_DATE('2026-09-30','YYYY-MM-DD'),
'Đang hoạt động',
80,
150,
3
);

INSERT INTO VOUCHER
(MaVoucher, MaCode, DanhSachSuKien, MucKhuyenMai,
NgayBatDau, NgayKetThuc, TrangThai,
LuotSuDung, SoLuong, MaCongTy)
VALUES
(
VOUCHER_SEQ.NEXTVAL,
'EDM25',
'13,14',
25,
TO_DATE('2026-06-15','YYYY-MM-DD'),
TO_DATE('2026-07-30','YYYY-MM-DD'),
'Đang hoạt động',
40,
70,
4
);

INSERT INTO VOUCHER
(MaVoucher, MaCode, DanhSachSuKien, MucKhuyenMai,
NgayBatDau, NgayKetThuc, TrangThai,
LuotSuDung, SoLuong, MaCongTy)
VALUES
(
VOUCHER_SEQ.NEXTVAL,
'KPOP30',
'15,16',
30,
TO_DATE('2026-08-01','YYYY-MM-DD'),
TO_DATE('2026-10-05','YYYY-MM-DD'),
'Đang hoạt động',
20,
40,
1
);

INSERT INTO VOUCHER
(MaVoucher, MaCode, DanhSachSuKien, MucKhuyenMai,
NgayBatDau, NgayKetThuc, TrangThai,
LuotSuDung, SoLuong, MaCongTy)
VALUES
(
VOUCHER_SEQ.NEXTVAL,
'FESTIVAL5',
'17,18,19',
5,
TO_DATE('2026-05-20','YYYY-MM-DD'),
TO_DATE('2026-10-20','YYYY-MM-DD'),
'Đang hoạt động',
120,
300,
2
);

INSERT INTO VOUCHER
(MaVoucher, MaCode, DanhSachSuKien, MucKhuyenMai,
NgayBatDau, NgayKetThuc, TrangThai,
LuotSuDung, SoLuong, MaCongTy)
VALUES
(
VOUCHER_SEQ.NEXTVAL,
'NEWYEAR50',
'20',
50,
TO_DATE('2026-12-01','YYYY-MM-DD'),
TO_DATE('2026-12-31','YYYY-MM-DD'),
'Đang hoạt động',
10,
20,
1
);

INSERT INTO VOUCHER
(MaVoucher, MaCode, DanhSachSuKien, MucKhuyenMai,
NgayBatDau, NgayKetThuc, TrangThai,
LuotSuDung, SoLuong, MaCongTy)
VALUES
(
VOUCHER_SEQ.NEXTVAL,
'INDIE10',
'21',
10,
TO_DATE('2026-09-01','YYYY-MM-DD'),
TO_DATE('2026-11-25','YYYY-MM-DD'),
'Đang hoạt động',
15,
50,
2
);

INSERT INTO VOUCHER
(MaVoucher, MaCode, DanhSachSuKien, MucKhuyenMai,
NgayBatDau, NgayKetThuc, TrangThai,
LuotSuDung, SoLuong, MaCongTy)
VALUES
(
VOUCHER_SEQ.NEXTVAL,
'VIPONLY',
'22,23,24',
15,
TO_DATE('2026-07-01','YYYY-MM-DD'),
TO_DATE('2026-12-31','YYYY-MM-DD'),
'Đang hoạt động',
60,
100,
1
);

INSERT INTO VOUCHER
(MaVoucher, MaCode, DanhSachSuKien, MucKhuyenMai,
NgayBatDau, NgayKetThuc, TrangThai,
LuotSuDung, SoLuong, MaCongTy)
VALUES
(
VOUCHER_SEQ.NEXTVAL,
'FLASHSALE',
'6,12,18',
20,
TO_DATE('2026-06-01','YYYY-MM-DD'),
TO_DATE('2026-07-01','YYYY-MM-DD'),
'Hết hạn',
100,
100,
3
);





INSERT INTO HOADON
(MaHoaDon, NgayLap, TrangThai, ThanhTien, 
MaKhachHang, MaNhanVien, MaVoucher)
VALUES
(
HOADON_SEQ.NEXTVAL,
TO_DATE('2026-06-01','YYYY-MM-DD'),
'Đã thanh toán',
5000000,
1,
1,
1
);

INSERT INTO HOADON
(MaHoaDon, NgayLap, TrangThai, ThanhTien, 
MaKhachHang, MaNhanVien, MaVoucher)
VALUES
(
HOADON_SEQ.NEXTVAL,
TO_DATE('2026-06-03','YYYY-MM-DD'),
'Đã thanh toán',
2200000,
2,
2,
2
);

INSERT INTO HOADON
(MaHoaDon, NgayLap, TrangThai, ThanhTien, 
MaKhachHang, MaNhanVien, MaVoucher)
VALUES
(
HOADON_SEQ.NEXTVAL,
TO_DATE('2026-06-05','YYYY-MM-DD'),
'Chờ thanh toán',
1800000,
3,
3,
NULL
);

INSERT INTO HOADON
(MaHoaDon, NgayLap, TrangThai, ThanhTien, 
MaKhachHang, MaNhanVien, MaVoucher)
VALUES
(
HOADON_SEQ.NEXTVAL,
TO_DATE('2026-06-06','YYYY-MM-DD'),
'Đã thanh toán',
3500000,
4,
4,
3
);

INSERT INTO HOADON
(MaHoaDon, NgayLap, TrangThai, ThanhTien, 
MaKhachHang, MaNhanVien, MaVoucher)
VALUES
(
HOADON_SEQ.NEXTVAL,
TO_DATE('2026-06-08','YYYY-MM-DD'),
'Đã hủy',
900000,
5,
5,
NULL
);

INSERT INTO HOADON
(MaHoaDon, NgayLap, TrangThai, ThanhTien, 
MaKhachHang, MaNhanVien, MaVoucher)
VALUES
(
HOADON_SEQ.NEXTVAL,
TO_DATE('2026-06-10','YYYY-MM-DD'),
'Đã thanh toán',
4200000,
6,
1,
5
);

INSERT INTO HOADON
(MaHoaDon, NgayLap, TrangThai, ThanhTien, 
MaKhachHang, MaNhanVien, MaVoucher)
VALUES
(
HOADON_SEQ.NEXTVAL,
TO_DATE('2026-06-12','YYYY-MM-DD'),
'Đã thanh toán',
2500000,
7,
2,
1
);

INSERT INTO HOADON
(MaHoaDon, NgayLap, TrangThai, ThanhTien, 
MaKhachHang, MaNhanVien, MaVoucher)
VALUES
(
HOADON_SEQ.NEXTVAL,
TO_DATE('2026-06-15','YYYY-MM-DD'),
'Đã thanh toán',
1500000,
8,
3,
NULL
);

INSERT INTO HOADON
(MaHoaDon, NgayLap, TrangThai, ThanhTien, 
MaKhachHang, MaNhanVien, MaVoucher)
VALUES
(
HOADON_SEQ.NEXTVAL,
TO_DATE('2026-06-18','YYYY-MM-DD'),
'Chờ thanh toán',
1200000,
9,
4,
8
);

INSERT INTO HOADON
(MaHoaDon, NgayLap, TrangThai, ThanhTien, 
MaKhachHang, MaNhanVien, MaVoucher)
VALUES
(
HOADON_SEQ.NEXTVAL,
TO_DATE('2026-06-20','YYYY-MM-DD'),
'Đã thanh toán',
6000000,
10,
5,
7
);

INSERT INTO HOADON
(MaHoaDon, NgayLap, TrangThai, ThanhTien, 
MaKhachHang, MaNhanVien, MaVoucher)
VALUES
(
HOADON_SEQ.NEXTVAL,
TO_DATE('2026-06-22','YYYY-MM-DD'),
'Đã thanh toán',
2700000,
1,
1,
9
);

INSERT INTO HOADON
(MaHoaDon, NgayLap, TrangThai, ThanhTien, 
MaKhachHang, MaNhanVien, MaVoucher)
VALUES
(
HOADON_SEQ.NEXTVAL,
TO_DATE('2026-06-25','YYYY-MM-DD'),
'Đã hủy',
850000,
2,
2,
NULL
);

INSERT INTO HOADON
(MaHoaDon, NgayLap, TrangThai, ThanhTien, 
MaKhachHang, MaNhanVien, MaVoucher)
VALUES
(
HOADON_SEQ.NEXTVAL,
TO_DATE('2026-06-27','YYYY-MM-DD'),
'Đã thanh toán',
3000000,
3,
3,
4
);

INSERT INTO HOADON
(MaHoaDon, NgayLap, TrangThai, ThanhTien, 
MaKhachHang, MaNhanVien, MaVoucher)
VALUES
(
HOADON_SEQ.NEXTVAL,
TO_DATE('2026-06-28','YYYY-MM-DD'),
'Đã thanh toán',
2000000,
4,
4,
6
);

INSERT INTO HOADON
(MaHoaDon, NgayLap, TrangThai, ThanhTien, 
MaKhachHang, MaNhanVien, MaVoucher)
VALUES
(
HOADON_SEQ.NEXTVAL,
TO_DATE('2026-06-30','YYYY-MM-DD'),
'Đã thanh toán',
4500000,
5,
5,
5
);
commit;

INSERT INTO GHE (MaGhe, KhuVuc, TrangThai, MaDiaDiem, MaVe, MaHoaDon)
VALUES (GHE_SEQ.NEXTVAL, 'A', 'Trống', 6, 6, 1);

INSERT INTO GHE (MaGhe, KhuVuc, TrangThai, MaDiaDiem, MaVe, MaHoaDon)
VALUES (GHE_SEQ.NEXTVAL, 'A', 'Đã đặt', 6, 6, 1);

INSERT INTO GHE (MaGhe, KhuVuc, TrangThai, MaDiaDiem, MaVe, MaHoaDon)
VALUES (GHE_SEQ.NEXTVAL, 'A', 'Trống', 6, 7, 2);

INSERT INTO GHE (MaGhe, KhuVuc, TrangThai, MaDiaDiem, MaVe, MaHoaDon)
VALUES (GHE_SEQ.NEXTVAL, 'A', 'Đã đặt', 6, 7, 2);



INSERT INTO GHE (MaGhe, KhuVuc, TrangThai, MaDiaDiem, MaVe, MaHoaDon)
VALUES (GHE_SEQ.NEXTVAL, 'B', 'Trống', 1, 8, 3);

INSERT INTO GHE (MaGhe, KhuVuc, TrangThai, MaDiaDiem, MaVe, MaHoaDon)
VALUES (GHE_SEQ.NEXTVAL, 'B', 'Đã đặt', 1, 8, 3);

INSERT INTO GHE (MaGhe, KhuVuc, TrangThai, MaDiaDiem, MaVe, MaHoaDon)
VALUES (GHE_SEQ.NEXTVAL, 'B', 'Đã đặt', 1, 9, 4);

INSERT INTO GHE (MaGhe, KhuVuc, TrangThai, MaDiaDiem, MaVe, MaHoaDon)
VALUES (GHE_SEQ.NEXTVAL, 'B', 'Trống', 1, 9, 4);

INSERT INTO GHE (MaGhe, KhuVuc, TrangThai, MaDiaDiem, MaVe, MaHoaDon)
VALUES (GHE_SEQ.NEXTVAL, 'A', 'Trống', 1, 6, 1);

INSERT INTO GHE (MaGhe, KhuVuc, TrangThai, MaDiaDiem, MaVe, MaHoaDon)
VALUES (GHE_SEQ.NEXTVAL, 'A', 'Đã đặt', 1, 6, 1);

INSERT INTO GHE (MaGhe, KhuVuc, TrangThai, MaDiaDiem, MaVe, MaHoaDon)
VALUES (GHE_SEQ.NEXTVAL, 'A', 'Trống', 2, 7, 2);

INSERT INTO GHE (MaGhe, KhuVuc, TrangThai, MaDiaDiem, MaVe, MaHoaDon)
VALUES (GHE_SEQ.NEXTVAL, 'A', 'Đã đặt', 2, 7, 2);



INSERT INTO GHE (MaGhe, KhuVuc, TrangThai, MaDiaDiem, MaVe, MaHoaDon)
VALUES (GHE_SEQ.NEXTVAL, 'B', 'Trống', 3, 8, 3);

INSERT INTO GHE (MaGhe, KhuVuc, TrangThai, MaDiaDiem, MaVe, MaHoaDon)
VALUES (GHE_SEQ.NEXTVAL, 'B', 'Đã đặt', 3, 8, 3);

INSERT INTO GHE (MaGhe, KhuVuc, TrangThai, MaDiaDiem, MaVe, MaHoaDon)
VALUES (GHE_SEQ.NEXTVAL, 'B', 'Đã đặt', 4, 9, 4);

INSERT INTO GHE (MaGhe, KhuVuc, TrangThai, MaDiaDiem, MaVe, MaHoaDon)
VALUES (GHE_SEQ.NEXTVAL, 'B', 'Trống', 4, 9, 4);



INSERT INTO GHE (MaGhe, KhuVuc, TrangThai, MaDiaDiem, MaVe, MaHoaDon)
VALUES (GHE_SEQ.NEXTVAL, 'C', 'Trống', 5, 10, 5);

INSERT INTO GHE (MaGhe, KhuVuc, TrangThai, MaDiaDiem, MaVe, MaHoaDon)
VALUES (GHE_SEQ.NEXTVAL, 'C', 'Đã đặt', 5, 10, 5);

INSERT INTO GHE (MaGhe, KhuVuc, TrangThai, MaDiaDiem, MaVe, MaHoaDon)
VALUES (GHE_SEQ.NEXTVAL, 'C', 'Đã đặt', 6, 11, 6);



INSERT INTO GHE (MaGhe, KhuVuc, TrangThai, MaDiaDiem, MaVe, MaHoaDon)
VALUES (GHE_SEQ.NEXTVAL, 'D', 'Trống', 7, 12, 7);

INSERT INTO GHE (MaGhe, KhuVuc, TrangThai, MaDiaDiem, MaVe, MaHoaDon)
VALUES (GHE_SEQ.NEXTVAL, 'D', 'Đã đặt', 7, 12, 7);

INSERT INTO GHE (MaGhe, KhuVuc, TrangThai, MaDiaDiem, MaVe, MaHoaDon)
VALUES (GHE_SEQ.NEXTVAL, 'D', 'Trống', 8, 13, 8);

INSERT INTO GHE (MaGhe, KhuVuc, TrangThai, MaDiaDiem, MaVe, MaHoaDon)
VALUES (GHE_SEQ.NEXTVAL, 'D', 'Đã đặt', 8, 13, 8);



INSERT INTO GHE (MaGhe, KhuVuc, TrangThai, MaDiaDiem, MaVe, MaHoaDon)
VALUES (GHE_SEQ.NEXTVAL, 'E', 'Trống', 9, 14, 9);

INSERT INTO GHE (MaGhe, KhuVuc, TrangThai, MaDiaDiem, MaVe, MaHoaDon)
VALUES (GHE_SEQ.NEXTVAL, 'E', 'Đã đặt', 9, 14, 9);



INSERT INTO GHE (MaGhe, KhuVuc, TrangThai, MaDiaDiem, MaVe, MaHoaDon)
VALUES (GHE_SEQ.NEXTVAL, 'F', 'Trống', 10, 15, 10);

INSERT INTO GHE (MaGhe, KhuVuc, TrangThai, MaDiaDiem, MaVe, MaHoaDon)
VALUES (GHE_SEQ.NEXTVAL, 'F', 'Đã đặt', 10, 15, 10);



INSERT INTO GHE (MaGhe, KhuVuc, TrangThai, MaDiaDiem, MaVe, MaHoaDon)
VALUES (GHE_SEQ.NEXTVAL, 'G', 'Trống', 1, 16, 11);

INSERT INTO GHE (MaGhe, KhuVuc, TrangThai, MaDiaDiem, MaVe, MaHoaDon)
VALUES (GHE_SEQ.NEXTVAL, 'G', 'Đã đặt', 1, 16, 11);



INSERT INTO GHE (MaGhe, KhuVuc, TrangThai, MaDiaDiem, MaVe, MaHoaDon)
VALUES (GHE_SEQ.NEXTVAL, 'H', 'Trống', 2, 17, 12);

INSERT INTO GHE (MaGhe, KhuVuc, TrangThai, MaDiaDiem, MaVe, MaHoaDon)
VALUES (GHE_SEQ.NEXTVAL, 'H', 'Đã đặt', 2, 17, 12);

commit;

INSERT INTO CHITIETHOADON
(MaHoaDon, MaVe, DonGia, SoLuong)
VALUES (3, 7, 1800000, 1);

INSERT INTO CHITIETHOADON
(MaHoaDon, MaVe, DonGia, SoLuong)
VALUES (4, 10, 3500000, 1);

INSERT INTO CHITIETHOADON
(MaHoaDon, MaVe, DonGia, SoLuong)
VALUES (5, 8, 900000, 1);

INSERT INTO CHITIETHOADON
(MaHoaDon, MaVe, DonGia, SoLuong)
VALUES (6, 17, 4200000, 1);

INSERT INTO CHITIETHOADON
(MaHoaDon, MaVe, DonGia, SoLuong)
VALUES (7, 6, 2500000, 1);

INSERT INTO CHITIETHOADON
(MaHoaDon, MaVe, DonGia, SoLuong)
VALUES (8, 15, 1500000, 1);

INSERT INTO CHITIETHOADON
(MaHoaDon, MaVe, DonGia, SoLuong)
VALUES (9, 16, 1200000, 1);

INSERT INTO CHITIETHOADON
(MaHoaDon, MaVe, DonGia, SoLuong)
VALUES (10, 17, 3000000, 2);

INSERT INTO CHITIETHOADON
(MaHoaDon, MaVe, DonGia, SoLuong)
VALUES (11, 14, 2700000, 1);

INSERT INTO CHITIETHOADON
(MaHoaDon, MaVe, DonGia, SoLuong)
VALUES (12, 9, 850000, 1);

INSERT INTO CHITIETHOADON
(MaHoaDon, MaVe, DonGia, SoLuong)
VALUES (13, 13, 3000000, 1);

INSERT INTO CHITIETHOADON
(MaHoaDon, MaVe, DonGia, SoLuong)
VALUES (14, 11, 1000000, 2);

INSERT INTO CHITIETHOADON
(MaHoaDon, MaVe, DonGia, SoLuong)
VALUES (15, 7, 4500000, 1);


INSERT INTO THANHTOAN
(MaThanhToan, PhuongThuc, ThoiGian, SoTien, TrangThai, MaHoaDon)
VALUES
(THANHTOAN_SEQ.NEXTVAL, 'Chuyển khoản ngân hàng',
TO_DATE('2026-06-01 19:20','YYYY-MM-DD HH24:MI'),
5000000, 'Thành công', 1);

INSERT INTO THANHTOAN
(MaThanhToan, PhuongThuc, ThoiGian, SoTien, TrangThai, MaHoaDon)
VALUES
(THANHTOAN_SEQ.NEXTVAL, 'Chuyển khoản ngân hàng',
TO_DATE('2026-06-03 14:15','YYYY-MM-DD HH24:MI'),
2200000, 'Thành công', 2);

INSERT INTO THANHTOAN
(MaThanhToan, PhuongThuc, ThoiGian, SoTien, TrangThai, MaHoaDon)
VALUES
(THANHTOAN_SEQ.NEXTVAL, 'Chuyển khoản ngân hàng',
TO_DATE('2026-06-05 10:40','YYYY-MM-DD HH24:MI'),
1800000, 'Đang xử lý', 3);

INSERT INTO THANHTOAN
(MaThanhToan, PhuongThuc, ThoiGian, SoTien, TrangThai, MaHoaDon)
VALUES
(THANHTOAN_SEQ.NEXTVAL, 'Tiền mặt',
TO_DATE('2026-06-06 21:10','YYYY-MM-DD HH24:MI'),
3500000, 'Thành công', 4);

INSERT INTO THANHTOAN
(MaThanhToan, PhuongThuc, ThoiGian, SoTien, TrangThai, MaHoaDon)
VALUES
(THANHTOAN_SEQ.NEXTVAL, 'Tiền mặt',
TO_DATE('2026-06-08 09:30','YYYY-MM-DD HH24:MI'),
900000, 'Thất bại', 5);

INSERT INTO THANHTOAN
(MaThanhToan, PhuongThuc, ThoiGian, SoTien, TrangThai, MaHoaDon)
VALUES
(THANHTOAN_SEQ.NEXTVAL, 'Chuyển khoản ngân hàng',
TO_DATE('2026-06-10 18:00','YYYY-MM-DD HH24:MI'),
4200000, 'Thành công', 6);

INSERT INTO THANHTOAN
(MaThanhToan, PhuongThuc, ThoiGian, SoTien, TrangThai, MaHoaDon)
VALUES
(THANHTOAN_SEQ.NEXTVAL, 'Tiền mặt',
TO_DATE('2026-06-12 15:20','YYYY-MM-DD HH24:MI'),
2500000, 'Thành công', 7);

INSERT INTO THANHTOAN
(MaThanhToan, PhuongThuc, ThoiGian, SoTien, TrangThai, MaHoaDon)
VALUES
(THANHTOAN_SEQ.NEXTVAL, 'Tiền mặt',
TO_DATE('2026-06-15 11:45','YYYY-MM-DD HH24:MI'),
1500000, 'Thành công', 8);

INSERT INTO THANHTOAN
(MaThanhToan, PhuongThuc, ThoiGian, SoTien, TrangThai, MaHoaDon)
VALUES
(THANHTOAN_SEQ.NEXTVAL, 'Chuyển khoản ngân hàng',
TO_DATE('2026-06-18 16:30','YYYY-MM-DD HH24:MI'),
1200000, 'Đang xử lý', 9);

INSERT INTO THANHTOAN
(MaThanhToan, PhuongThuc, ThoiGian, SoTien, TrangThai, MaHoaDon)
VALUES
(THANHTOAN_SEQ.NEXTVAL, 'Tiền mặt',
TO_DATE('2026-06-20 20:00','YYYY-MM-DD HH24:MI'),
6000000, 'Thành công', 10);

INSERT INTO THANHTOAN
(MaThanhToan, PhuongThuc, ThoiGian, SoTien, TrangThai, MaHoaDon)
VALUES
(THANHTOAN_SEQ.NEXTVAL, 'Chuyển khoản ngân hàng',
TO_DATE('2026-06-22 13:25','YYYY-MM-DD HH24:MI'),
2700000, 'Thành công', 11);

INSERT INTO THANHTOAN
(MaThanhToan, PhuongThuc, ThoiGian, SoTien, TrangThai, MaHoaDon)
VALUES
(THANHTOAN_SEQ.NEXTVAL, 'Tiền mặt',
TO_DATE('2026-06-25 08:10','YYYY-MM-DD HH24:MI'),
850000, 'Đã hoàn tiền', 12);

INSERT INTO THANHTOAN
(MaThanhToan, PhuongThuc, ThoiGian, SoTien, TrangThai, MaHoaDon)
VALUES
(THANHTOAN_SEQ.NEXTVAL, 'Chuyển khoản ngân hàng',
TO_DATE('2026-06-27 19:45','YYYY-MM-DD HH24:MI'),
3000000, 'Thành công', 13);

INSERT INTO THANHTOAN
(MaThanhToan, PhuongThuc, ThoiGian, SoTien, TrangThai, MaHoaDon)
VALUES
(THANHTOAN_SEQ.NEXTVAL, 'Tiền mặt',
TO_DATE('2026-06-28 17:15','YYYY-MM-DD HH24:MI'),
2000000, 'Thành công', 14);

INSERT INTO THANHTOAN
(MaThanhToan, PhuongThuc, ThoiGian, SoTien, TrangThai, MaHoaDon)
VALUES
(THANHTOAN_SEQ.NEXTVAL, 'Tiền mặt',
TO_DATE('2026-06-30 22:05','YYYY-MM-DD HH24:MI'),
4500000, 'Thành công', 15);




INSERT INTO HOANVE
(MaHoanVe, ThoiGianHoan, LyDoHoan,
TrangThaiHoan, MaVe, MaHoaDon, MaGhe)
VALUES
(
HOANVE_SEQ.NEXTVAL,
TO_DATE('2026-06-09 10:15','YYYY-MM-DD HH24:MI'),
'Bận công việc cá nhân',
'Đã hoàn tiền',
8,
5,
8
);

INSERT INTO HOANVE
(MaHoanVe, ThoiGianHoan, LyDoHoan,
TrangThaiHoan, MaVe, MaHoaDon, MaGhe)
VALUES
(
HOANVE_SEQ.NEXTVAL,
TO_DATE('2026-06-14 14:30','YYYY-MM-DD HH24:MI'),
'Không thể tham gia sự kiện',
'Đã hoàn tiền',
11,
8,
12
);

INSERT INTO HOANVE
(MaHoanVe, ThoiGianHoan, LyDoHoan,
TrangThaiHoan, MaVe, MaHoaDon, MaGhe)
VALUES
(
HOANVE_SEQ.NEXTVAL,
TO_DATE('2026-06-18 09:20','YYYY-MM-DD HH24:MI'),
'Trùng lịch cá nhân',
'Chờ xử lý',
16,
9,
13
);

INSERT INTO HOANVE
(MaHoanVe, ThoiGianHoan, LyDoHoan,
TrangThaiHoan, MaVe, MaHoaDon, MaGhe)
VALUES
(
HOANVE_SEQ.NEXTVAL,
TO_DATE('2026-06-21 16:45','YYYY-MM-DD HH24:MI'),
'Sự kiện thay đổi thời gian',
'Đã hoàn tiền',
17,
10,
19
);

INSERT INTO HOANVE
(MaHoanVe, ThoiGianHoan, LyDoHoan,
TrangThaiHoan, MaVe, MaHoaDon, MaGhe)
VALUES
(
HOANVE_SEQ.NEXTVAL,
TO_DATE('2026-06-26 11:10','YYYY-MM-DD HH24:MI'),
'Đặt nhầm loại vé',
'Đã hoàn tiền',
9,
12,
32
);

INSERT INTO HOANVE
(MaHoanVe, ThoiGianHoan, LyDoHoan,
TrangThaiHoan, MaVe, MaHoaDon, MaGhe)
VALUES
(
HOANVE_SEQ.NEXTVAL,
TO_DATE('2026-06-29 15:40','YYYY-MM-DD HH24:MI'),
'Không sắp xếp được thời gian',
'Đang xử lý',
13,
13,
33
);

INSERT INTO HOANVE
(MaHoanVe, ThoiGianHoan, LyDoHoan,
TrangThaiHoan, MaVe, MaHoaDon, MaGhe)
VALUES
(
HOANVE_SEQ.NEXTVAL,
TO_DATE('2026-07-01 13:00','YYYY-MM-DD HH24:MI'),
'Lý do sức khỏe',
'Đã hoàn tiền',
6,
7,
34
);

INSERT INTO HOANVE
(MaHoanVe, ThoiGianHoan, LyDoHoan,
TrangThaiHoan, MaVe, MaHoaDon, MaGhe)
VALUES
(
HOANVE_SEQ.NEXTVAL,
TO_DATE('2026-07-03 18:25','YYYY-MM-DD HH24:MI'),
'Đổi kế hoạch cá nhân',
'Chờ xử lý',
17,
6,
35
);

INSERT INTO HOANVE
(MaHoanVe, ThoiGianHoan, LyDoHoan,
TrangThaiHoan, MaVe, MaHoaDon, MaGhe)
VALUES
(
HOANVE_SEQ.NEXTVAL,
TO_DATE('2026-07-05 09:50','YYYY-MM-DD HH24:MI'),
'Mua dư vé',
'Đang xử lý',
14,
14,
36
);

INSERT INTO HOANVE
(MaHoanVe, ThoiGianHoan, LyDoHoan,
TrangThaiHoan, MaVe, MaHoaDon, MaGhe)
VALUES
(
HOANVE_SEQ.NEXTVAL,
TO_DATE('2026-07-06 20:10','YYYY-MM-DD HH24:MI'),
'Không thể đến địa điểm tổ chức',
'Đã hoàn tiền',
15,
11,
37
);

INSERT INTO BAOCAO
(MaBaoCao, DoanhThu, NgayBatDau, NgayKetThuc,
SoVeDaBan, SoVeTon, MaNhanVien)
VALUES
(BAOCAO_SEQ.NEXTVAL,
250000000,
TO_DATE('2026-06-01','YYYY-MM-DD'),
TO_DATE('2026-06-30','YYYY-MM-DD'),
3200, 1800, 1);

INSERT INTO BAOCAO(MaBaoCao, DoanhThu, NgayBatDau, NgayKetThuc,
SoVeDaBan, SoVeTon, MaNhanVien)
VALUES
(BAOCAO_SEQ.NEXTVAL,
180000000,
TO_DATE('2026-07-01','YYYY-MM-DD'),
TO_DATE('2026-07-31','YYYY-MM-DD'),
2500, 1200, 2);

INSERT INTO BAOCAO(MaBaoCao, DoanhThu, NgayBatDau, NgayKetThuc,
SoVeDaBan, SoVeTon, MaNhanVien)
VALUES
(BAOCAO_SEQ.NEXTVAL,
320000000,
TO_DATE('2026-08-01','YYYY-MM-DD'),
TO_DATE('2026-08-31','YYYY-MM-DD'),
4100, 900, 3);

INSERT INTO BAOCAO(MaBaoCao, DoanhThu, NgayBatDau, NgayKetThuc,
SoVeDaBan, SoVeTon, MaNhanVien)
VALUES
(BAOCAO_SEQ.NEXTVAL,
145000000,
TO_DATE('2026-09-01','YYYY-MM-DD'),
TO_DATE('2026-09-30','YYYY-MM-DD'),
2100, 1400, 4);

INSERT INTO BAOCAO(MaBaoCao, DoanhThu, NgayBatDau, NgayKetThuc,
SoVeDaBan, SoVeTon, MaNhanVien)
VALUES
(BAOCAO_SEQ.NEXTVAL,
410000000,
TO_DATE('2026-10-01','YYYY-MM-DD'),
TO_DATE('2026-10-31','YYYY-MM-DD'),
5200, 700, 5);

INSERT INTO BAOCAO(MaBaoCao, DoanhThu, NgayBatDau, NgayKetThuc,
SoVeDaBan, SoVeTon, MaNhanVien)
VALUES
(BAOCAO_SEQ.NEXTVAL,
275000000,
TO_DATE('2026-11-01','YYYY-MM-DD'),
TO_DATE('2026-11-30','YYYY-MM-DD'),
3600, 1000, 1);

INSERT INTO BAOCAO(MaBaoCao, DoanhThu, NgayBatDau, NgayKetThuc,
SoVeDaBan, SoVeTon, MaNhanVien)
VALUES
(BAOCAO_SEQ.NEXTVAL,
500000000,
TO_DATE('2026-12-01','YYYY-MM-DD'),
TO_DATE('2026-12-31','YYYY-MM-DD'),
6800, 500, 2);

INSERT INTO BAOCAO(MaBaoCao, DoanhThu, NgayBatDau, NgayKetThuc,
SoVeDaBan, SoVeTon, MaNhanVien)
VALUES
(BAOCAO_SEQ.NEXTVAL,
195000000,
TO_DATE('2027-01-01','YYYY-MM-DD'),
TO_DATE('2027-01-31','YYYY-MM-DD'),
2400, 1600, 3);

INSERT INTO BAOCAO(MaBaoCao, DoanhThu, NgayBatDau, NgayKetThuc,
SoVeDaBan, SoVeTon, MaNhanVien)
VALUES
(BAOCAO_SEQ.NEXTVAL,
225000000,
TO_DATE('2027-02-01','YYYY-MM-DD'),
TO_DATE('2027-02-28','YYYY-MM-DD'),
2900, 1300, 4);

INSERT INTO BAOCAO(MaBaoCao, DoanhThu, NgayBatDau, NgayKetThuc,
SoVeDaBan, SoVeTon, MaNhanVien)
VALUES
(BAOCAO_SEQ.NEXTVAL,
340000000,
TO_DATE('2027-03-01','YYYY-MM-DD'),
TO_DATE('2027-03-31','YYYY-MM-DD'),
4500, 850, 5);

commit;
-- =========================
-- 9. VOUCHER
-- =========================
CREATE TABLE VOUCHER (
    MaVoucher       NUMBER PRIMARY KEY,
    MaCode          VARCHAR2(50),
    DanhSachSuKien  VARCHAR2(500),
    MucKhuyenMai    NUMBER,
    NgayBatDau      DATE,
    NgayKetThuc     DATE,
    TrangThai       VARCHAR2(50),
    SoLuong         NUMBER DEFAULT 0,
    LuotSuDung      NUMBER,
    MaCongTy        NUMBER,
    CONSTRAINT fk_vc_ct FOREIGN KEY (MaCongTy)
        REFERENCES NHATOCHUC(MaCongTy)  
);

-- =========================
-- 10. HÓA ĐƠN
-- =========================
CREATE TABLE HOADON (
    MaHoaDon        NUMBER PRIMARY KEY,
    NgayLap         DATE,
    TrangThai       VARCHAR2(50),
    ThanhTien       NUMBER,
    MaKhachHang     NUMBER,
    MaNhanVien      NUMBER,
    MaVoucher       NUMBER,

    CONSTRAINT fk_hd_kh FOREIGN KEY (MaKhachHang)
        REFERENCES KHACHHANG(MaKhachHang),
    CONSTRAINT fk_hd_nv FOREIGN KEY (MaNhanVien)
        REFERENCES NHANVIEN(MaNhanVien),
    CONSTRAINT fk_hd_vc FOREIGN KEY (MaVoucher)
        REFERENCES VOUCHER(MaVoucher)
);

-- =========================
-- 11. CHI TIẾT HÓA ĐƠN
-- =========================
CREATE TABLE CHITIETHOADON (
    MaVe            NUMBER,
    MaHoaDon        NUMBER,
    DonGia          NUMBER,
    SoLuong         NUMBER,

    PRIMARY KEY (MaVe, MaHoaDon),

    CONSTRAINT fk_cthd_ve FOREIGN KEY (MaVe)
        REFERENCES VE(MaVe),
    CONSTRAINT fk_cthd_hd FOREIGN KEY (MaHoaDon)
        REFERENCES HOADON(MaHoaDon)
);

-- =========================
-- 12. THANH TOÁN
-- =========================
CREATE TABLE THANHTOAN (
    MaThanhToan     NUMBER PRIMARY KEY,
    SoTien          NUMBER,
    ThoiGian        DATE,
    PhuongThuc      VARCHAR2(50),
    TrangThai       VARCHAR2(50),
    MaHoaDon        NUMBER,
    CONSTRAINT fk_tt_hd FOREIGN KEY (MaHoaDon)
        REFERENCES HOADON(MaHoaDon)
);

-- =========================
-- 13. HOÀN VÉ
-- =========================
CREATE TABLE HOANVE (
    MaHoanVe        NUMBER PRIMARY KEY,
    MaHoaDon        NUMBER,
    MaGhe           NUMBER,
    ThoiGianHoan    DATE,
    LyDoHoan        VARCHAR2(255),
    TrangThaiHoan   VARCHAR2(50),
    CONSTRAINT fk_hv_hd FOREIGN KEY (MaHoaDon) REFERENCES HOADON(MaHoaDon),
    CONSTRAINT fk_hv_ghe FOREIGN KEY (MaGhe)     REFERENCES Ghe(MaGhe)
);

-- =========================
-- 14. BÁO CÁO
-- =========================
CREATE TABLE BAOCAO (
    MaBaoCao        NUMBER PRIMARY KEY,
    DoanhThu        NUMBER,
    NgayBatDau      DATE,
    NgayKetThuc     DATE,
    SoVeDaBan       NUMBER,
    SoVeTon         NUMBER,
    MaNhanVien      NUMBER,
    CONSTRAINT fk_bc_nv FOREIGN KEY (MaNhanVien)
        REFERENCES NHANVIEN(MaNhanVien)
)

//Có gì để xóa hết bảng cho nó dễ
BEGIN
   FOR t IN (
      SELECT table_name
      FROM user_tables
   )
   LOOP
      EXECUTE IMMEDIATE
         'DROP TABLE ' || t.table_name || ' CASCADE CONSTRAINTS';
   END LOOP;
END;
/
BEGIN
   FOR s IN (
      SELECT sequence_name
      FROM user_sequences
   )
   LOOP
      EXECUTE IMMEDIATE
         'DROP SEQUENCE ' || s.sequence_name;
   END LOOP;
END;
/

ALTER TABLE GHE DROP COLUMN MAHOADON;
-- FK liên kết với HoaDon
ALTER TABLE GHE ADD CONSTRAINT fk_ghe_hd
    FOREIGN KEY (MaHoaDon) REFERENCES HOADON(MaHoaDon);


    
----------Nháp--------------------------
UPDATE SUKIEN
SET TRANGTHAI = 'Đã tổ chức'
WHERE TRANGTHAI = 'Đã kết thúc';
commit;

SELECT COUNT(*)
FROM GHE
WHERE MaHoaDon = 107;