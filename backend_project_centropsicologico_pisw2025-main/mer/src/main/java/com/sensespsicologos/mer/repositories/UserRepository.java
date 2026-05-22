package com.sensespsicologos.mer.repositories;


import com.sensespsicologos.mer.models.User;
import com.sensespsicologos.mer.types.RoleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmailAndIsActiveTrue(String email);

    Optional<User> findByIdAndIsActiveTrue(UUID id);

    Optional<User> findByDniAndIsActiveTrue(String dni);

    boolean existsByEmailAndIsActiveTrue(String email);

    boolean existsByDniAndIsActiveTrue(String dni);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :roleType AND u.isActive = true")
    List<User> findByRoleAndIsActiveTrue(@Param("roleType") RoleType roleType);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = 'PSYCHOLOGIST' AND u.isActive = true")
    List<User> findActivePsychologists();

    @Query("SELECT COUNT(p) > 0 FROM Patient p WHERE p.id = :patientId AND p.psychologist.id = :psychologistId")
    boolean isPatientAssignedToPsychologist(@Param("patientId") UUID patientId, @Param("psychologistId") UUID psychologistId);
}