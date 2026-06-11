# HU03 Frontend Form Contract

Este contrato resume los valores que el frontend necesita para construir el
formulario de paciente/intake sin depender de detalles internos del backend.

## Fuente Recomendada

Usar en runtime:

```http
GET /api/v1/patient-intake/catalog
```

Este endpoint devuelve:

- `optionGroups`: selects, radios y multiselects.
- `incomeRanges`: rangos de ingreso.
- `consentTypes`: consentimientos.

Tambien queda exportado el snapshot machine-readable en:

```text
docs/hu03-frontend-form-values.json
```

## Endpoints Que Usa El Formulario

```text
GET  /api/v1/patient-intake/catalog
GET  /api/v1/regions
GET  /api/v1/provinces/region/:id
GET  /api/v1/districts/province/:id
POST /api/v1/patients
PUT  /api/v1/patients/:id
GET  /api/v1/patients/:id
GET  /api/v1/users/:id
```

`regionId` y `provinceId` son solo para filtrar en frontend. El backend recibe
solo `districtId`.

## Enums Fijos

### `gender`

| value | label |
| --- | --- |
| `MALE` | Masculino |
| `FEMALE` | Femenino |
| `LGBTQ` | LGBTQ+ |
| `NOT_SPECIFIED` | No especificado |

### `maritalStatus`

| value | label |
| --- | --- |
| `SINGLE` | Soltero/a |
| `MARRIED` | Casado/a |
| `WIDOWED` | Viudo/a |
| `DIVORCED` | Divorciado/a |
| `COHABITANT` | Conviviente |

## Campos Obligatorios Para Crear Paciente

```ts
[
  "firstName",
  "lastName",
  "dni",
  "gender",
  "birthdate",
  "educationLevel",
  "birthPlace",
  "occupation",
  "maritalStatus",
  "occupationLocation",
  "phoneNumber",
  "address",
  "districtId"
]
```

## Mapeo De Campos Del Prototipo

El backend acepta estos nombres directamente en el body. Tambien acepta el
formato normalizado `intakeInfo`.

| Campo frontend | Backend |
| --- | --- |
| `livesWith` | `intakeInfo.livesWithText` |
| `numChildren` | `intakeInfo.childrenCount` |
| `guardianName` | `intakeInfo.guardianName` |
| `guardianPhone` | `intakeInfo.guardianPhone` |
| `mainReason` | `intakeInfo.mainConsultationReason` |
| `howLong` | `intakeInfo.situationDurationText` |
| `previousTherapy` | `intakeInfo.hadPreviousTherapy` |
| `psychiatricMedication` | `intakeInfo.takesPsychiatricMedication` |
| `comparedOtherCenters` | `intakeInfo.comparedOtherCenters` |
| `whoReferred` | `intakeInfo.referredByName` |
| `whatAttractedAttention` | `intakeInfo.attractionNote` |
| `incomeRange` | `intakeInfo.incomeRangeId` |
| `howFoundUs` | `intakeInfo.selections` |
| `preferredModality` | `intakeInfo.selections` |
| `preferredSchedule` | `intakeInfo.selections` |
| `paymentMethods` | `intakeInfo.selections` |
| `urgencyLevel` | `intakeInfo.selections` |
| `preferredContact` | `intakeInfo.selections` |
| `employmentStatus` | `intakeInfo.selections` |
| `workMode` | `intakeInfo.selections` |
| `requiredSpecialty` | `intakeInfo.selections` |
| `workSector` | `intakeInfo.extraData.frontend.workSector` |
| `acceptDataPolicy` | `consents[PERSONAL_DATA]` |
| `acceptCommunications` | `consents[MARKETING]` |
| `acceptPromotions` | `consents[MARKETING]` |

## Grupos De Opciones

| frontendField | group code | selectionType |
| --- | --- | --- |
| `howFoundUs` | `ACQUISITION_SOURCE` | `MULTIPLE` |
| `preferredModality` | `PREFERRED_MODALITY` | `SINGLE` |
| `preferredSchedule` | `PREFERRED_SCHEDULE` | `MULTIPLE` |
| `paymentMethods` | `PAYMENT_METHOD` | `MULTIPLE` |
| `urgencyLevel` | `URGENCY_LEVEL` | `SINGLE` |
| `preferredContact` | `CONTACT_METHOD` | `MULTIPLE` |
| `employmentStatus` | `EMPLOYMENT_STATUS` | `SINGLE` |
| `workMode` | `WORK_MODE` | `SINGLE` |
| `requiredSpecialty` | `REQUIRED_SPECIALTY` | `MULTIPLE` |
| `consultationReasonCategory` | `CONSULTATION_REASON_CATEGORY` | `MULTIPLE` |

Para los valores exactos de cada grupo, usar
`docs/hu03-frontend-form-values.json` o el endpoint `/patient-intake/catalog`.

## Payload Compatible Con El Prototipo

El backend acepta esto:

```json
{
  "firstName": "Juan Carlos",
  "lastName": "Perez Gomez",
  "dni": "75124386",
  "gender": "MALE",
  "birthdate": "2000-01-01T00:00:00.000Z",
  "educationLevel": "Universitario",
  "birthPlace": "Lima",
  "occupation": "Estudiante",
  "maritalStatus": "SINGLE",
  "religion": "Catolica",
  "occupationLocation": "Lima",
  "phoneNumber": "953286336",
  "address": "Av. Siempre Viva 123",
  "districtId": "010101",
  "livesWith": "Con sus padres",
  "numChildren": "2",
  "mainReason": "Ansiedad frecuente",
  "howLong": "3 meses",
  "previousTherapy": "Si",
  "psychiatricMedication": "No",
  "urgencyLevel": "Media",
  "preferredModality": "Presencial",
  "preferredSchedule": "Manana, Tarde",
  "requiredSpecialty": "Ansiedad, Depresion",
  "preferredContact": "WhatsApp, Correo electronico",
  "howFoundUs": "Instagram, Google",
  "whoReferred": "Ana Torres",
  "comparedOtherCenters": "No",
  "whatAttractedAttention": "La atencion especializada",
  "employmentStatus": "Estudiante",
  "workSector": "Educacion",
  "workMode": "Mixto",
  "incomeRange": "S/ 1501 - S/ 2500",
  "paymentMethods": "Yape, Tarjeta",
  "acceptDataPolicy": true,
  "acceptCommunications": true
}
```

## Payload Normalizado Recomendado

Si el frontend ya consume el catalogo, puede mandar IDs directamente:

```json
{
  "firstName": "Juan Carlos",
  "lastName": "Perez Gomez",
  "dni": "75124386",
  "gender": "MALE",
  "birthdate": "2000-01-01T00:00:00.000Z",
  "educationLevel": "Universitario",
  "birthPlace": "Lima",
  "occupation": "Estudiante",
  "maritalStatus": "SINGLE",
  "occupationLocation": "Lima",
  "phoneNumber": "953286336",
  "address": "Av. Siempre Viva 123",
  "districtId": "010101",
  "intakeInfo": {
    "livesWithText": "Con sus padres",
    "childrenCount": 2,
    "mainConsultationReason": "Ansiedad frecuente",
    "situationDurationText": "3 meses",
    "hadPreviousTherapy": true,
    "takesPsychiatricMedication": false,
    "incomeRangeId": "00000000-0000-4000-8000-000000000003",
    "selections": [
      { "intakeOptionId": "20000000-0000-4000-8000-000000000002" },
      { "intakeOptionId": "20000000-0000-4000-8000-000000000010" },
      { "intakeOptionId": "20000000-0000-4000-8000-000000000019" }
    ],
    "extraData": {
      "frontend": {
        "workSector": "Educacion"
      }
    }
  },
  "consents": [
    {
      "consentTypeId": "30000000-0000-4000-8000-000000000001",
      "accepted": true
    },
    {
      "consentTypeId": "30000000-0000-4000-8000-000000000002",
      "accepted": true
    }
  ]
}
```

## Reglas

- `SINGLE`: enviar una opcion de ese grupo.
- `MULTIPLE`: enviar una o mas opciones de ese grupo.
- `regionId` y `provinceId` no se envian al backend.
- `districtId` si se envia.
- `age` no se envia; se calcula en frontend desde `birthdate`.
- Para compatibilidad, el backend acepta booleanos como `true/false` o strings
  tipo `"Si"` / `"No"`.
