package com.jjapartments.backend.dto;

import com.jjapartments.backend.models.Tenant;
import com.jjapartments.backend.models.SubTenant;
import java.util.List;

public class UnitTenantsDTO {
    private List<Tenant> mainTenants;
    private List<SubTenant> subTenants;
    
    public UnitTenantsDTO() {}
    
    public UnitTenantsDTO(List<Tenant> mainTenants, List<SubTenant> subTenants) {
        this.mainTenants = mainTenants;
        this.subTenants = subTenants;
    }
    
    public List<Tenant> getMainTenants() {
        return mainTenants;
    }
    
    public void setMainTenants(List<Tenant> mainTenants) {
        this.mainTenants = mainTenants;
    }
    
    public List<SubTenant> getSubTenants() {
        return subTenants;
    }
    
    public void setSubTenants(List<SubTenant> subTenants) {
        this.subTenants = subTenants;
    }
}