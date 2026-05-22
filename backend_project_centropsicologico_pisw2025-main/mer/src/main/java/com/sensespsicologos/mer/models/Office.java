package com.sensespsicologos.mer.models;

import com.sensespsicologos.mer.common.models.NamedActiveEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.Set;

@Entity
@Table(name = "offices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Office extends NamedActiveEntity {

    @NotBlank(message = "Type is required")
    @Size(max = 50, message = "Type must not exceed 50 characters")
    @Column(name = "type", nullable = false, length = 50)
    private String type;

    @Positive(message = "Capacity must be positive")
    @Column(name = "capacity", nullable = false)
    private Integer capacity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @OneToMany(mappedBy = "office", fetch = FetchType.LAZY)
    private Set<Appointment> appointments;

    @OneToMany(mappedBy = "office", fetch = FetchType.LAZY)
    private Set<ItemInstance> itemInstances;

    @OneToMany(mappedBy = "office", fetch = FetchType.LAZY)
    private Set<WorkSchedule> workSchedules;
}
