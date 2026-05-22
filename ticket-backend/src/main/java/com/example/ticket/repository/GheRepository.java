package com.example.ticket.repository;

import com.example.ticket.model.Ghe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface GheRepository extends JpaRepository<Ghe, Long> {

    /** Lấy tất cả ghế đã đặt theo danh sách maVe */
    @Query("SELECT g FROM Ghe g WHERE g.maVe IN :maVeList")
    List<Ghe> findByMaVeIn(@Param("maVeList") List<Long> maVeList);

    /** Lấy ghế theo danh sách maHoaDon — dùng trong buildResponseList */
    @Query("SELECT g FROM Ghe g WHERE g.maHoaDon IN :maHoaDonList")
    List<Ghe> findByMaHoaDonIn(@Param("maHoaDonList") List<Long> maHoaDonList);

    /**
     * Kiểm tra ghế bị conflict: khuVuc đó đã tồn tại trong các maVe thuộc cùng sự kiện.
     * Dùng trong muaVe() trước khi lưu để tránh 2 người đặt cùng ghế.
     */
    @Query("SELECT g FROM Ghe g WHERE g.khuVuc IN :khuVucList AND g.maVe IN :maVeList")
    List<Ghe> findConflict(@Param("khuVucList") List<String> khuVucList,
                           @Param("maVeList")   List<Long>   maVeList);
                               @Query("""
        SELECT g.khuVuc
        FROM Ghe g
        JOIN Ve v ON g.maVe = v.maVe
        WHERE v.maSuKien = :maSuKien
          AND g.trangThai = 'da_dat'
        """)
    List<String> findBookedSeatsByMaSuKien(@Param("maSuKien") Long maSuKien);
}