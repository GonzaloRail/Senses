package com.sensespsicologos.mer.models;

import com.sensespsicologos.mer.common.models.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "patient_tests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientTest extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_id")
    private Test test;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "clinical_history_id")
    private ClinicalHistory clinicalHistory;

    @Builder.Default
    @Column(name = "is_general_doc", nullable = false)
    private Boolean isGeneralDoc = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "completed_by_id")
    private User completedBy;

    @Column(name = "completed_at", nullable = false)
    private Instant completedAt;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "document_id", referencedColumnName = "id")
    private Document document;

    @PrePersist
    protected void onCreate() {
        if (completedAt == null) {
            completedAt = Instant.now();
        }
    }
}