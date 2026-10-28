import { Appointment, Barber, Service, BarberShopSettings } from "../types";

export interface ICalExportOptions {
  calendarTitle?: string;
  calendarDescription?: string;
  alarmMinutesBefore?: number; // e.g. 30 for 30 minutes before, 0 for no alarm
  barberFilterId?: string; // 'all' or specific barber id
  dateRange?: "selected_day" | "next_7_days" | "next_30_days" | "all_confirmed";
  selectedDate?: string; // YYYY-MM-DD
}

/**
 * Escapes characters according to RFC 5545 iCalendar specification.
 */
function escapeICalText(text: string): string {
  if (!text) return "";
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Formats a Date object into iCalendar local timestamp format (YYYYMMDDTHHMMSS).
 */
function formatICalDateTime(date: Date): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

/**
 * Parses appointment date & timeSlot into Start and End Date objects.
 */
export function getAppointmentStartAndEndDates(
  apt: Appointment,
  services: Service[]
): { startDate: Date; endDate: Date; totalDurationMinutes: number } {
  const [yearStr, monthStr, dayStr] = apt.date.split("-");
  const [hourStr, minuteStr] = apt.timeSlot.split(":");

  const year = parseInt(yearStr, 10) || new Date().getFullYear();
  const month = (parseInt(monthStr, 10) || 1) - 1;
  const day = parseInt(dayStr, 10) || 1;
  const hours = parseInt(hourStr, 10) || 9;
  const minutes = parseInt(minuteStr, 10) || 0;

  const startDate = new Date(year, month, day, hours, minutes, 0);

  // Calculate duration based on services
  const aptServices = services.filter((s) => apt.serviceIds.includes(s.id));
  const totalDurationMinutes =
    aptServices.length > 0
      ? aptServices.reduce((acc, s) => acc + (s.durationMinutes || 30), 0)
      : 45; // Default 45 mins

  const endDate = new Date(startDate.getTime() + totalDurationMinutes * 60 * 1000);

  return { startDate, endDate, totalDurationMinutes };
}

/**
 * Generates an iCalendar VEVENT string for a single appointment.
 */
export function generateVEvent(
  apt: Appointment,
  barbers: Barber[],
  services: Service[],
  settings: BarberShopSettings,
  alarmMinutesBefore: number = 30
): string {
  const barber = barbers.find((b) => b.id === apt.barberId);
  const aptServices = services.filter((s) => apt.serviceIds.includes(s.id));
  const { startDate, endDate, totalDurationMinutes } = getAppointmentStartAndEndDates(apt, services);

  const serviceNames = aptServices.map((s) => s.name).join(" + ") || "Atendimento Personalizado";
  const barberDisplayName = barber ? `${barber.name} (Cadeira #${barber.chairNumber})` : "Barbeiro da Equipe";

  const summary = `💈 ${serviceNames} - ${apt.clientName} | ${settings.name || "Barbearia"}`;

  const descriptionLines = [
    `✂️ SERVIÇOS: ${serviceNames}`,
    `👤 CLIENTE: ${apt.clientName}`,
    `📞 CONTATO: ${apt.clientPhone}`,
    `💈 PROFISSIONAL: ${barberDisplayName}`,
    `⏱️ DURAÇÃO PREVISTA: ${totalDurationMinutes} minutos`,
    `💰 VALOR TOTAL: ${settings.currencySymbol || "R$"}${apt.totalAmount.toFixed(2)}${apt.paid ? " (PAGO)" : " (Pendente no caixa)"}`,
    apt.notes ? `📝 OBSERVAÇÕES: ${apt.notes}` : "",
    `📍 LOCAL: ${settings.name || "Barbearia"} - ${settings.address || "Endereço principal"}`,
    `⚡ AGENDAMENTO SINCRONIZADO VIA BARBER PRO MASTER`,
  ].filter(Boolean);

  const description = descriptionLines.join("\n");
  const location = `${settings.name || "Barbearia"} - ${settings.address || ""}`.trim();
  const uid = `apt-${apt.id}-${startDate.getTime()}@barberpromaster.app`;
  const dtStamp = formatICalDateTime(new Date());
  const dtStart = formatICalDateTime(startDate);
  const dtEnd = formatICalDateTime(endDate);

  let valarmBlock = "";
  if (alarmMinutesBefore > 0) {
    valarmBlock = [
      "BEGIN:VALARM",
      `TRIGGER:-PT${alarmMinutesBefore}M`,
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeICalText(`Lembrete: Atendimento ${apt.clientName} em ${alarmMinutesBefore} minutos`)}`,
      "END:VALARM",
    ].join("\r\n");
  }

  const vEventLines = [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeICalText(summary)}`,
    `DESCRIPTION:${escapeICalText(description)}`,
    `LOCATION:${escapeICalText(location)}`,
    `STATUS:${apt.status === "cancelled" ? "CANCELLED" : "CONFIRMED"}`,
    `ORGANIZER;CN="${escapeICalText(settings.name || "Barbearia")}":mailto:contato@barbearia.com`,
    valarmBlock ? valarmBlock : undefined,
    "END:VEVENT",
  ].filter(Boolean);

  return vEventLines.join("\r\n");
}

/**
 * Builds a complete .ICS (RFC 5545) VCALENDAR file content from a list of appointments.
 */
export function buildICalendarFile(
  appointments: Appointment[],
  barbers: Barber[],
  services: Service[],
  settings: BarberShopSettings,
  options: ICalExportOptions = {}
): string {
  const {
    calendarTitle = `${settings.name || "Barbearia"} - Agendamentos`,
    calendarDescription = "Sincronização de horários de atendimento da barbearia",
    alarmMinutesBefore = 30,
  } = options;

  const events = appointments.map((apt) =>
    generateVEvent(apt, barbers, services, settings, alarmMinutesBefore)
  );

  const vCalendarLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Barber Pro Master//Sistema de Agendamentos v2.5//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeICalText(calendarTitle)}`,
    `X-WR-CALDESC:${escapeICalText(calendarDescription)}`,
    "X-WR-TIMEZONE:America/Sao_Paulo",
    ...events,
    "END:VCALENDAR",
  ];

  return vCalendarLines.join("\r\n");
}

/**
 * Downloads a generated .ICS file directly to user's device.
 */
export function downloadICalFile(icsContent: string, filename: string = "agendamentos-barbearia.ics"): void {
  try {
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Falha ao exportar arquivo .ics:", err);
  }
}

/**
 * Generates a direct Google Calendar Web Create Event URL for instant 1-click addition in browser.
 */
export function generateGoogleCalendarWebUrl(
  apt: Appointment,
  barbers: Barber[],
  services: Service[],
  settings: BarberShopSettings
): string {
  const barber = barbers.find((b) => b.id === apt.barberId);
  const aptServices = services.filter((s) => apt.serviceIds.includes(s.id));
  const { startDate, endDate, totalDurationMinutes } = getAppointmentStartAndEndDates(apt, services);

  const serviceNames = aptServices.map((s) => s.name).join(" + ") || "Atendimento";
  const barberDisplayName = barber ? `${barber.name} (Cadeira #${barber.chairNumber})` : "Barbeiro";

  const title = `💈 ${serviceNames} - ${apt.clientName} (${settings.name || "Barbearia"})`;

  const details = [
    `Serviço: ${serviceNames}`,
    `Cliente: ${apt.clientName}`,
    `Telefone: ${apt.clientPhone}`,
    `Barbeiro: ${barberDisplayName}`,
    `Duração: ${totalDurationMinutes} min`,
    `Valor: ${settings.currencySymbol || "R$"}${apt.totalAmount.toFixed(2)}`,
    apt.notes ? `Obs: ${apt.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const location = `${settings.name || "Barbearia"} - ${settings.address || ""}`;

  const formatGCalDate = (d: Date) => {
    return d.toISOString().replace(/-|:|\.\d+/g, "");
  };

  const datesParam = `${formatGCalDate(startDate)}/${formatGCalDate(endDate)}`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: datesParam,
    details: details,
    location: location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Filters appointments based on export criteria.
 */
export function filterAppointmentsForExport(
  appointments: Appointment[],
  options: ICalExportOptions
): Appointment[] {
  const {
    dateRange = "selected_day",
    selectedDate = new Date().toISOString().split("T")[0],
    barberFilterId = "all",
  } = options;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return appointments.filter((apt) => {
    // Only non-cancelled or confirmed
    if (apt.status === "cancelled") return false;

    // Barber filter
    if (barberFilterId !== "all" && apt.barberId !== barberFilterId) {
      return false;
    }

    if (dateRange === "selected_day") {
      return apt.date === selectedDate;
    }

    if (dateRange === "next_7_days") {
      const aptDate = new Date(`${apt.date}T00:00:00`);
      const limit = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return aptDate >= today && aptDate <= limit;
    }

    if (dateRange === "next_30_days") {
      const aptDate = new Date(`${apt.date}T00:00:00`);
      const limit = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      return aptDate >= today && aptDate <= limit;
    }

    if (dateRange === "all_confirmed") {
      return apt.status === "confirmed" || apt.status === "in_chair";
    }

    return true;
  });
}
