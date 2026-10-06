// Funções de formatação usadas em várias páginas.

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatCurrency(value) {
  return currency.format(Number(value) || 0);
}

export const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

/*
  As datas chegam da API como texto "AAAA-MM-DD".
  Elas são tratadas como texto de propósito: new Date("2026-10-05") interpreta
  como meia-noite UTC e, no Brasil, mostraria 04/10.
*/

// "2026-10-05" -> "05/10/2026"
export function formatDate(isoDate) {
  const [year, month, day] = String(isoDate).slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

// "2026-10-05" -> "2026-10" (para agrupar por mês)
export function monthKey(isoDate) {
  return String(isoDate).slice(0, 7);
}

// Mês atual no fuso do usuário, ex.: "2026-10"
export function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// Hoje no formato do <input type="date">, ex.: "2026-10-06"
export function todayISO() {
  const now = new Date();
  return `${currentMonthKey()}-${String(now.getDate()).padStart(2, "0")}`;
}

// "2026-10" -> "Outubro 2026"
export function monthLabel(key) {
  const [year, month] = key.split("-");
  return `${MONTH_NAMES[Number(month) - 1]} ${year}`;
}

// Mensagem de erro amigável a partir de um erro do axios
export function apiErrorMessage(error, fallback = "Algo deu errado. Tente novamente.") {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.request && !error?.response) return "Não foi possível conectar ao servidor.";
  return fallback;
}
