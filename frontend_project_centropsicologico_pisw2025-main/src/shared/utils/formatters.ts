export function getBirthdateString(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();

  return `${day}/${month}/${year}`;
}

export function calculateAgeString(birthDate: Date): string {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();
  const birthMonth = birthDate.getMonth();
  const birthDay = birthDate.getDate();

  if (
    currentMonth < birthMonth ||
    (currentMonth === birthMonth && currentDay < birthDay)
  ) {
    age--;
  }

  return age.toString();
}

type Gender = "MALE" | "FEMALE" | "LGBTQ" | "NOT_SPECIFIED";
type MaritalStatus = "SINGLE" | "MARRIED" | "WIDOWED" | "DIVORCED" | "COHABITANT";

export function translateGender(gender: Gender): string {
  switch (gender) {
    case "MALE":
      return "Masculino";
    case "FEMALE":
      return "Femenino";
    case "LGBTQ":
      return "LGBTQ+";
    case "NOT_SPECIFIED":
      return "No especificado";
    default:
      return "Desconocido";
  }
}

export function translateMaritalStatus(status: MaritalStatus): string {
  switch (status) {
    case "SINGLE":
      return "Soltero(a)";
    case "MARRIED":
      return "Casado(a)";
    case "WIDOWED":
      return "Viudo(a)";
    case "DIVORCED":
      return "Divorciado(a)";
    case "COHABITANT":
      return "Conviviente";
    default:
      return "Desconocido";
  }
}