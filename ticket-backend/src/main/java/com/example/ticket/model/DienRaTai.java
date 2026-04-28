package com.example.ticket.model;
import jakarta.persistence.*;

@Entity
@Table(name = "DIENRATAI")
public class DienRaTai {
    @EmbeddedId
    private DienRaTaiID id;
    
    private String trangThai;
    
    public DienRaTai(){
        
    }
    
    public DienRaTaiID getID(){
        return id;
    }
    
    public void setID(DienRaTaiID id){
        this.id = id;
    }
    
    public String getTrangThai(){
        return trangThai;
    }
    
    public void setTrangThai(String trangThai){
        this.trangThai = trangThai;
    }
}
