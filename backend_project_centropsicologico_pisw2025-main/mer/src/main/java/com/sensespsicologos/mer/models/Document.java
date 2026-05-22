package com.sensespsicologos.mer.models;

import com.sensespsicologos.mer.common.models.NamedEntity;
import com.sensespsicologos.mer.types.DocumentType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document extends NamedEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false)
    private DocumentType type;

    @NotBlank(message = "FileURL is required")
    @Column(name = "file_url", nullable = false)
    private String fileUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @OneToOne(mappedBy = "document", fetch = FetchType.LAZY)
    private Test test;

    @OneToOne(mappedBy = "document", fetch = FetchType.LAZY)
    private PatientTest patientTest;

    @OneToOne(mappedBy = "document", fetch = FetchType.LAZY)
    private EmployeeLeave employeeLeave;


}
