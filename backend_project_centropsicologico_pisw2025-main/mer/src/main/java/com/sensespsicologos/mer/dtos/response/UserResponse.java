package com.sensespsicologos.mer.dtos.response;

import lombok.Builder;
import lombok.Data;
import java.util.Set;


@Data
@Builder
public class UserResponse {
    private String id;
    private String email;
    private String firstName;
    private String lastName;
    private String dni;
    private String csp;
    private Set<String> roles;
    private String fullName;

    public String getFullName() {
        return firstName + " " + lastName;
    }
}