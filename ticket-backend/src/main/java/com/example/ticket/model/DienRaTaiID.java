package com.example.ticket.model;
import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class DienRaTaiID implements Serializable{
    private int maDiaDiem;
    private String tenDiaDiem;
    public DienRaTaiID(){
        
    }
    
    public DienRaTaiID(int maDiaDiem, String tenDiaDiem){
        this.maDiaDiem = maDiaDiem;
        this.tenDiaDiem = tenDiaDiem;
    }
    
    public int getMaDiaDiem(){
        return maDiaDiem;
    }
    
    public void setMaDiaDiem(int maDiaDiem){
        this.maDiaDiem = maDiaDiem;
    }
    
    public String getTenDiaDiem(){
        return tenDiaDiem;
    }
    
    public void setTenDiaDiem(String tenDiaDiem){
        this.tenDiaDiem = tenDiaDiem;
    }
    
    @Override
    public boolean equals(Object o){
        if (this == o) return true;
        if (!(o instanceof DienRaTaiID)) return false;
        DienRaTaiID that = (DienRaTaiID) o;
        return ((maDiaDiem == that.maDiaDiem) && (tenDiaDiem.equals(that.tenDiaDiem)));
    }
    
    @Override
    public int hashCode(){
        return Objects.hash(maDiaDiem, tenDiaDiem);
    }
}
