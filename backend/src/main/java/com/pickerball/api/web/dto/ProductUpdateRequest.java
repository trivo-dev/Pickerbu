package com.pickerball.api.web.dto;

import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import org.springframework.lang.Nullable;

public class ProductUpdateRequest {

    @Nullable
    @Size(max = 255)
    private String title;

    @Nullable private String description;

    @Nullable
    @Size(max = 255)
    private String location;

    @Nullable
    private BigDecimal lat;

    @Nullable
    private BigDecimal lng;

    @Nullable
    private BigDecimal rate;

    @Nullable
    @Size(max = 50)
    private String status;

    @Nullable
    private Long ownerUserId;

    /** When true, clears owner assignment */
    @Nullable
    private Boolean clearOwner;

    @Nullable
    public String getTitle() {
        return title;
    }

    public void setTitle(@Nullable String title) {
        this.title = title;
    }

    @Nullable
    public String getDescription() {
        return description;
    }

    public void setDescription(@Nullable String description) {
        this.description = description;
    }

    @Nullable
    public String getLocation() {
        return location;
    }

    public void setLocation(@Nullable String location) {
        this.location = location;
    }

    @Nullable
    public BigDecimal getLat() {
        return lat;
    }

    public void setLat(@Nullable BigDecimal lat) {
        this.lat = lat;
    }

    @Nullable
    public BigDecimal getLng() {
        return lng;
    }

    public void setLng(@Nullable BigDecimal lng) {
        this.lng = lng;
    }

    @Nullable
    public BigDecimal getRate() {
        return rate;
    }

    public void setRate(@Nullable BigDecimal rate) {
        this.rate = rate;
    }

    @Nullable
    public String getStatus() {
        return status;
    }

    public void setStatus(@Nullable String status) {
        this.status = status;
    }

    @Nullable
    public Long getOwnerUserId() {
        return ownerUserId;
    }

    public void setOwnerUserId(@Nullable Long ownerUserId) {
        this.ownerUserId = ownerUserId;
    }

    @Nullable
    public Boolean getClearOwner() {
        return clearOwner;
    }

    public void setClearOwner(@Nullable Boolean clearOwner) {
        this.clearOwner = clearOwner;
    }
}
