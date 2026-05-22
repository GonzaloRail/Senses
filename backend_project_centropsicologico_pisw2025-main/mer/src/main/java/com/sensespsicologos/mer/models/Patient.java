package com.sensespsicologos.mer.models;

import com.sensespsicologos.mer.common.models.ActiveEntity;
import com.sensespsicologos.mer.types.Gender;
import com.sensespsicologos.mer.types.MaritalStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;


@Entity
@Table(name = "patients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Patient extends ActiveEntity {
    @NotBlank(message = "First name is required")
    @Size(max = 50, message = "First name must not exceed 50 characters")
    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 50, message = "Last name must not exceed 50 characters")
    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    @NotBlank(message = "DNI is required")
    @Pattern(regexp = "^[0-9]{8}$", message = "DNI must be 8 digits")
    @Column(name = "dni", nullable = false, unique = true, length = 8)
    private String dni;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", nullable = false)
    private Gender gender;

    @NotNull(message = "Birthdate is required")
    @Past(message = "Birthdate must be in the past")
    @Column(name = "birthdate", nullable = false)
    private LocalDate birthdate;

    @NotBlank(message = "Education level is required")
    @Size(max = 100, message = "Education level must not exceed 100 characters")
    @Column(name = "education_level", nullable = false, length = 100)
    private String educationLevel;

    @NotBlank(message = "Birth place is required")
    @Size(max = 100, message = "Birth place must not exceed 100 characters")
    @Column(name = "birth_place", nullable = false, length = 100)
    private String birthPlace;

    @NotBlank(message = "Occupation is required")
    @Size(max = 100, message = "Occupation must not exceed 100 characters")
    @Column(name = "occupation", nullable = false, length = 100)
    private String occupation;

    @NotBlank(message = "Address is required")
    @Size(max = 255, message = "Address must not exceed 255 characters")
    @Column(name = "address", nullable = false)
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(name = "marital_status", nullable = false)
    private MaritalStatus maritalStatus;

    @Size(max = 50, message = "Religion must not exceed 50 characters")
    @Column(name = "religion", length = 50)
    private String religion;

    @NotBlank(message = "Occupation location is required")
    @Size(max = 100, message = "Occupation location must not exceed 100 characters")
    @Column(name = "occupation_location", nullable = false, length = 100)
    private String occupationLocation;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9+\\-\\s()]+$", message = "Invalid phone number format")
    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // Parent/Guardian information (for minors)
    @Size(max = 100, message = "Parent full name must not exceed 100 characters")
    @Column(name = "parent_full_name", length = 100)
    private String parentFullName;

    @Pattern(regexp = "^[0-9]{8}$", message = "Parent DNI must be 8 digits")
    @Column(name = "parent_dni", length = 8)
    private String parentDni;

    @Pattern(regexp = "^[0-9+\\-\\s()]+$", message = "Invalid parent phone number format")
    @Column(name = "parent_phone_number")
    private String parentPhoneNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "district_id")
    private District district;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "psychologist_id")
    private User psychologist;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "clinical_history_id", referencedColumnName = "id")
    private ClinicalHistory clinicalHistory;

    @OneToMany(mappedBy = "patient", fetch = FetchType.LAZY)
    private Set<Appointment> appointments = new HashSet<>();
}
