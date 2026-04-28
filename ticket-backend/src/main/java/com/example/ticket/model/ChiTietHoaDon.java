package com.example.ticket.model;
import jakarta.persistence.*;

@Entity
@Table(name = "CHITIETHOADON")
public class ChiTietHoaDon {
    @EmbeddedId
    private ChiTietHoaDonID id;
    
    private long donGia;
    private int soLuong;
    
    public ChiTietHoaDonID getID(){
        return id;
    }
    
    public void setID(ChiTietHoaDonID id){
        this.id = id;
    }
    
    public long getDonGia(){
        return this.donGia;
    }
    
    public void setDonGia(long donGia){
        this.donGia = donGia;
    }
    
    public int getSoLuong(){
        return this.soLuong;
    }
    
    public void setSoLuong(int soLuong){
        this.soLuong = soLuong;
    }
}
