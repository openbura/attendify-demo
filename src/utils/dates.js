const DAY_IN_MS = 24 * 60 * 60 * 1000;

function pad(value) {
  return String(value).padStart(2, "0");
}

function startOfLocalDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toDate(value = new Date()) {
  if (value instanceof Date) return startOfLocalDay(value);
  if (typeof value === "string") {
    const [day, month, year] = value.split("/").map(Number);
    if (Number.isFinite(day) && Number.isFinite(month) && Number.isFinite(year)) {
      return new Date(year, month - 1, day);
    }
  }
  return startOfLocalDay(new Date(value));
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function addMonths(date, months) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function getLastDayOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function formatDate(value = new Date()) {
  const date = toDate(value);
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function getTodayDate(date = new Date()) {
  return formatDate(date);
}

export function isSameDate(left, right) {
  return formatDate(left) === formatDate(right);
}

export function isCurrentMonth(value, referenceDate = new Date()) {
  const date = toDate(value);
  const reference = toDate(referenceDate);
  return date.getMonth() === reference.getMonth() && date.getFullYear() === reference.getFullYear();
}

export function getMonthId(date = new Date()) {
  const value = toDate(date);
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}`;
}

export function getDefaultReportMonthId(date = new Date()) {
  return getMonthId(date);
}

export function getMonthLabel(monthId = getDefaultReportMonthId(), language = "en") {
  const [year, month] = monthId.split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  const locale = language === "he" ? "he-IL" : "en-US";
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(date);
}

export function getCurrentMonthRange(referenceDate = new Date()) {
  const today = toDate(referenceDate);
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  return {
    id: getMonthId(today),
    start: formatDate(start),
    end: formatDate(today),
  };
}

export function getReportMonths(referenceDate = new Date(), count = 12) {
  const today = toDate(referenceDate);
  return Array.from({ length: count }, (_, index) => {
    const monthDate = addMonths(today, -index);
    const isCurrent = monthDate.getMonth() === today.getMonth() && monthDate.getFullYear() === today.getFullYear();
    const endDate = isCurrent ? today : getLastDayOfMonth(monthDate);
    return {
      id: getMonthId(monthDate),
      label: getMonthLabel(getMonthId(monthDate), "en"),
      heLabel: getMonthLabel(getMonthId(monthDate), "he"),
      start: formatDate(new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)),
      end: formatDate(endDate),
    };
  });
}

export function getReportMonth(monthId = getDefaultReportMonthId(), referenceDate = new Date()) {
  const months = getReportMonths(referenceDate);
  return months.find((month) => month.id === monthId) || months[0];
}

export function getReportRangeLabel(monthId = getDefaultReportMonthId(), referenceDate = new Date()) {
  const month = getReportMonth(monthId, referenceDate);
  return `${month.start} - ${month.end}`;
}

export function getReportDates(monthId = getDefaultReportMonthId(), referenceDate = new Date()) {
  const month = getReportMonth(monthId, referenceDate);
  const start = toDate(month.start);
  const end = toDate(month.end);
  const dates = [];

  for (let cursor = end; cursor >= start; cursor = addDays(cursor, -1)) {
    dates.push(formatDate(cursor));
  }

  return dates;
}

export function getCurrentMonthDates(referenceDate = new Date()) {
  return getReportDates(getDefaultReportMonthId(referenceDate), referenceDate);
}

export function getRelativeDateString(dayOffset, referenceDate = new Date()) {
  return formatDate(addDays(toDate(referenceDate), dayOffset));
}

export function isDateInMonth(dateValue, monthId = getDefaultReportMonthId()) {
  return getMonthId(toDate(dateValue)) === monthId;
}
