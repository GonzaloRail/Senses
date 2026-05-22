package com.sensespsicologos.mer.common.models;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import lombok.*;
import lombok.experimental.SuperBuilder;

@MappedSuperclass
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public abstract class ActiveEntity extends BaseEntity{

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
