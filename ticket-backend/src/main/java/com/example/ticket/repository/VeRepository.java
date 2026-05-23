package com.example.ticket.repository;

import com.example.ticket.model.Ve;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

@Repository
public interface VeRepository extends JpaRepository<Ve, Long> {
    List<Ve> findByMaSuKien(Long maSuKien);
    List<Ve> findByTrangThai(String trangThai);
    List<Ve> findByMaSuKienIn(List<Long> maSuKienIds);
    boolean existsByTenVeAndMaSuKien(String tenVe, Long maSuKien);
    boolean existsByLoaiVeAndMaSuKien(String loaiVe, Long maSuKien);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from Ve v where v.maVe in :ids")
    List<Ve> findAllByIdWithLock(@Param("ids") List<Long> ids);

    @Modifying
    @Query(value = "DELETE FROM VE WHERE MASUKIEN IN " +
                "(SELECT MASUKIEN FROM SUKIEN WHERE MACONGTY = :id)", 
        nativeQuery = true)
    void deleteByMaCongTy(@Param("id") Long id);
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from Ve v where v.maVe = :id")
    Optional<Ve> findByIdWithLock(@Param("id") Long id);

    @Query(value = "SELECT SUM(SOLUONG - DABAN) FROM VE " +
                "WHERE SOLUONG > DABAN",
        nativeQuery = true)
    Integer sumVeTon();
}