package com.sensespsicologos.mer.models;

import com.sensespsicologos.mer.common.models.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "clinical_histories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClinicalHistory extends BaseEntity {
    @Column(name = "display_int", nullable = false, unique = true)
    private Integer displayInt;

    @OneToMany(mappedBy = "clinicalHistory", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private Set<PatientTest> patientTests = new HashSet<>();

    @OneToOne(mappedBy = "clinicalHistory", fetch = FetchType.LAZY)
    private Patient patient;

}
