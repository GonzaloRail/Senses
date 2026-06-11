# HU03 Patient Intake Catalog

Este documento lista los valores fijos que el front puede usar para construir
los controles de intake del paciente.

La API recibe los valores seleccionados dentro de:

```json
{
  "intakeInfo": {
    "incomeRangeId": "00000000-0000-4000-8000-000000000003",
    "selections": [
      {
        "intakeOptionId": "20000000-0000-4000-8000-000000000016",
        "isPrimary": false,
        "notes": "Puede pagar en efectivo"
      },
      {
        "intakeOptionId": "20000000-0000-4000-8000-000000000019",
        "isPrimary": true,
        "notes": "Metodo principal: Yape"
      }
    ]
  }
}
```

Regla de uso:

- `SINGLE`: el paciente puede tener solo una opcion de ese grupo.
- `MULTIPLE`: el paciente puede tener dos o mas opciones de ese grupo.
- `isPrimary` sirve para marcar una opcion principal cuando el grupo permite
  multiples valores.

## Endpoints De Catalogo

- `GET /api/v1/patient-intake/catalog`
- `GET /api/v1/patient-intake/option-groups`
- `GET /api/v1/patient-intake/income-ranges`
- `GET /api/v1/patient-intake/consent-types`

Todos aceptan `includeInactive=true|false`.

## IncomeRange

| id | label |
| --- | --- |
| `00000000-0000-4000-8000-000000000001` | Menos de S/ 1025 |
| `00000000-0000-4000-8000-000000000002` | S/ 1025 - S/ 1500 |
| `00000000-0000-4000-8000-000000000003` | S/ 1501 - S/ 2500 |
| `00000000-0000-4000-8000-000000000004` | S/ 2501 - S/ 4000 |
| `00000000-0000-4000-8000-000000000005` | Mas de S/ 4000 |
| `00000000-0000-4000-8000-000000000006` | Prefiere no decirlo |

## IntakeOptionGroup

| code | selectionType | uso sugerido en front |
| --- | --- | --- |
| `ACQUISITION_SOURCE` | `MULTIPLE` | Checkbox/lista multiple |
| `PREFERRED_MODALITY` | `SINGLE` | Radio/select simple |
| `PREFERRED_SCHEDULE` | `MULTIPLE` | Checkbox/lista multiple |
| `PAYMENT_METHOD` | `MULTIPLE` | Checkbox/lista multiple |
| `URGENCY_LEVEL` | `SINGLE` | Radio/select simple |
| `CONTACT_METHOD` | `MULTIPLE` | Checkbox/lista multiple |
| `EMPLOYMENT_STATUS` | `SINGLE` | Radio/select simple |
| `WORK_MODE` | `SINGLE` | Radio/select simple |
| `REQUIRED_SPECIALTY` | `MULTIPLE` | Checkbox/lista multiple |
| `CONSULTATION_REASON_CATEGORY` | `MULTIPLE` | Checkbox/lista multiple |

## IntakeOption

### ACQUISITION_SOURCE - Como nos conocio

| id | code | name | category |
| --- | --- | --- | --- |
| `20000000-0000-4000-8000-000000000001` | `GOOGLE` | Google | `SEARCH_ENGINE` |
| `20000000-0000-4000-8000-000000000002` | `INSTAGRAM` | Instagram | `SOCIAL_MEDIA` |
| `20000000-0000-4000-8000-000000000003` | `FACEBOOK` | Facebook | `SOCIAL_MEDIA` |
| `20000000-0000-4000-8000-000000000004` | `TIKTOK` | TikTok | `SOCIAL_MEDIA` |
| `20000000-0000-4000-8000-000000000005` | `REFERRAL` | Recomendacion | `REFERRAL` |
| `20000000-0000-4000-8000-000000000006` | `FLYER` | Volante | `OFFLINE` |
| `20000000-0000-4000-8000-000000000007` | `AGREEMENT` | Convenio | `PARTNERSHIP` |
| `20000000-0000-4000-8000-000000000008` | `OTHER` | Otro | `OTHER` |

### PREFERRED_MODALITY - Modalidad preferida

| id | code | name |
| --- | --- | --- |
| `20000000-0000-4000-8000-000000000009` | `VIRTUAL` | Virtual |
| `20000000-0000-4000-8000-000000000010` | `IN_PERSON` | Presencial |
| `20000000-0000-4000-8000-000000000011` | `MIXED` | Mixta |

### PREFERRED_SCHEDULE - Horario preferido

| id | code | name |
| --- | --- | --- |
| `20000000-0000-4000-8000-000000000012` | `MORNING` | Manana |
| `20000000-0000-4000-8000-000000000013` | `AFTERNOON` | Tarde |
| `20000000-0000-4000-8000-000000000014` | `NIGHT` | Noche |
| `20000000-0000-4000-8000-000000000015` | `WEEKEND` | Fin de semana |

### PAYMENT_METHOD - Metodo de pago preferido

| id | code | name |
| --- | --- | --- |
| `20000000-0000-4000-8000-000000000016` | `CASH` | Efectivo |
| `20000000-0000-4000-8000-000000000017` | `CARD` | Tarjeta |
| `20000000-0000-4000-8000-000000000018` | `TRANSFER` | Transferencia bancaria |
| `20000000-0000-4000-8000-000000000019` | `YAPE` | Yape |
| `20000000-0000-4000-8000-000000000020` | `PLIN` | Plin |

Ejemplo valido: `CASH` + `YAPE` para un mismo paciente.

### URGENCY_LEVEL - Nivel de urgencia percibida

| id | code | name |
| --- | --- | --- |
| `20000000-0000-4000-8000-000000000021` | `LOW` | Baja |
| `20000000-0000-4000-8000-000000000022` | `MEDIUM` | Media |
| `20000000-0000-4000-8000-000000000023` | `HIGH` | Alta |
| `20000000-0000-4000-8000-000000000024` | `CRITICAL` | Critica / Emergencia |

### CONTACT_METHOD - Medio preferido de contacto

| id | code | name |
| --- | --- | --- |
| `20000000-0000-4000-8000-000000000025` | `WHATSAPP` | WhatsApp |
| `20000000-0000-4000-8000-000000000026` | `PHONE` | Llamada telefonica |
| `20000000-0000-4000-8000-000000000027` | `EMAIL` | Correo electronico |

### EMPLOYMENT_STATUS - Situacion laboral

| id | code | name |
| --- | --- | --- |
| `20000000-0000-4000-8000-000000000028` | `UNEMPLOYED` | Sin trabajo |
| `20000000-0000-4000-8000-000000000029` | `EMPLOYED` | Con trabajo |
| `20000000-0000-4000-8000-000000000030` | `SELF_EMPLOYED` | Independiente |
| `20000000-0000-4000-8000-000000000031` | `STUDENT` | Estudiante |
| `20000000-0000-4000-8000-000000000046` | `RETIRED` | Jubilado/a |

### WORK_MODE - Modo de trabajo

| id | code | name |
| --- | --- | --- |
| `20000000-0000-4000-8000-000000000032` | `REMOTE` | Remoto |
| `20000000-0000-4000-8000-000000000033` | `IN_PERSON` | Presencial |
| `20000000-0000-4000-8000-000000000034` | `MIXED` | Mixto |
| `20000000-0000-4000-8000-000000000047` | `NOT_APPLICABLE` | No aplica |

### REQUIRED_SPECIALTY - Especialidad requerida

| id | code | name |
| --- | --- | --- |
| `20000000-0000-4000-8000-000000000035` | `ANXIETY` | Ansiedad |
| `20000000-0000-4000-8000-000000000036` | `DEPRESSION` | Depresion |
| `20000000-0000-4000-8000-000000000037` | `COUPLES_THERAPY` | Terapia de pareja |
| `20000000-0000-4000-8000-000000000041` | `FAMILY_THERAPY` | Terapia familiar |
| `20000000-0000-4000-8000-000000000042` | `CHILD_PSYCHOLOGY` | Psicologia infantil |
| `20000000-0000-4000-8000-000000000043` | `PSYCHOLOGICAL_EVALUATION` | Evaluacion psicologica |
| `20000000-0000-4000-8000-000000000044` | `VOCATIONAL_GUIDANCE` | Orientacion vocacional |
| `20000000-0000-4000-8000-000000000045` | `OTHER` | Otro |

### CONSULTATION_REASON_CATEGORY - Motivo de consulta categorizado

| id | code | name |
| --- | --- | --- |
| `20000000-0000-4000-8000-000000000038` | `ANXIETY` | Ansiedad |
| `20000000-0000-4000-8000-000000000039` | `DEPRESSION` | Depresion |
| `20000000-0000-4000-8000-000000000040` | `RELATIONSHIP` | Relaciones familiares o pareja |

## ConsentType

| id | code | name |
| --- | --- | --- |
| `30000000-0000-4000-8000-000000000001` | `PERSONAL_DATA` | Tratamiento de datos personales |
| `30000000-0000-4000-8000-000000000002` | `MARKETING` | Contenido psicologico y promociones |
