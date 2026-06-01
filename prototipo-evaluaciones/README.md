# 📝 Modificación #1: Creador de Formularios Inline con Opción Múltiple (Administrador)

Este directorio contiene el prototipo y la documentación para la implementación del **Flujo de Trabajo Híbrido** en el módulo de evaluaciones de Senses Psicólogos.

En esta actualización, hemos llevado la experiencia de usuario a un nivel superior: **integramos un diseñador de Opción Múltiple interactivo directamente en nuestro maquetador inline de ancho completo**, permitiendo crear opciones de respuesta dinámicas al estilo Google Forms.

---

## 🔍 ¿Qué se ha modificado en el código del Proyecto?

### 1. Esquema de Validación Zod (`TestFormSchema.ts`)
* **Archivo modificado**: [TestFormSchema.ts](file:///d:/PIS/frontend_project_centropsicologico_pisw2025-main/src/shared/interfaces/forms/TestFormSchema.ts)
* **Cambio**: El campo `testFile` es opcional, soportando pruebas de formularios digitales y opciones múltiples sin archivos adjuntos.

### 2. Panel Maquetador Inline en el Formulario Base (`EvaluationBaseForm.tsx`)
* **Archivo modificado**: [EvaluationBaseForm.tsx](file:///d:/PIS/frontend_project_centropsicologico_pisw2025-main/src/features/evaluations/components/EvaluationBaseForm.tsx)
* **El Cambio Clave (Opción Múltiple)**:
  - Añadimos el botón **`+ Opción Múltiple`** (con un icono elegante de listado `ListPlus` en color morado).
  - Al hacer clic, se agrega una pregunta del tipo **`select`** y se inicializan dos opciones por defecto: *"Opción A"* y *"Opción B"*.
  - **Editor de Opciones Dinámico**: Si la pregunta es de tipo `select`, se despliega un sub-panel lateral de color morado con:
    * Un input de texto para cada opción creada.
    * Un botón de eliminar (`X`) para cada opción individual.
    * Un botón de **`+ Opción`** (dashed en color morado) para añadir nuevas opciones de respuesta de manera ilimitada.
  - Al hacer clic en **"Guardar Formulario"**, el componente toma las preguntas con todas sus opciones, las serializa en un JSON string y las inyecta de forma transparente en el listado general de la evaluación.

---

## 🛠️ Cómo Probar la Experiencia en Vivo

1. Abre tu navegador en la aplicación real (`http://localhost:5173`).
2. Entra como **Administrador** (`admin@gmail.com` / `Password123!`).
3. Ve a **Gestión de Evaluaciones** ➡️ **Administrar** sobre cualquier evaluación.
4. Haz clic en el botón verde **`+ Crear Formulario Digital`**.
5. Haz clic en el botón morado **`+ Opción Múltiple`**.
6. **¡Verás la magia interactiva!**
   - Se creará una pregunta con un panel morado abajo que muestra sus opciones de respuesta.
   - Intenta cambiar el nombre de las opciones o añadir más opciones con el botón `+ Opción`.
   - Puedes eliminar opciones haciendo clic en la pequeña `X` al lado de cada una.
7. Haz clic en **"Guardar Formulario"** y verás cómo tu nuevo formulario híbrido con opción múltiple se agrega a tu listado con éxito.

---

## 🤝 Contrato de Datos para el Backend (Compañero de Back)

Cuando se diseña una pregunta de opción múltiple, el array JSON en `templateContent` tendrá esta estructura expandida:

```json
{
  "id": "campo_177998",
  "label": "Frecuencia de síntomas",
  "type": "select",
  "required": true,
  "options": [
    "Nunca",
    "A veces",
    "Frecuentemente",
    "Siempre"
  ]
}
```

Tu compañero de Backend no tiene que hacer nada extra: este objeto JSON viaja exactamente igual como un string plano en la columna `templateContent`. ¡Toda la potencia de parseo y renderizado la manejas tú en el Frontend!
