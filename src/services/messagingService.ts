import { Appointment, Barber, Service, BarberShopSettings, ReminderMessageLog } from "../types";

export interface ReminderConfig {
  autoRemindersEnabled: boolean;
  hoursBeforeAppointment: number; // e.g. 2 hours before
  defaultChannel: "whatsapp" | "sms";
  customTemplate?: string;
}

export const DEFAULT_REMINDER_CONFIG: ReminderConfig = {
  autoRemindersEnabled: true,
  hoursBeforeAppointment: 2,
  defaultChannel: "whatsapp",
  customTemplate:
    "💈 Olá, *{clientName}*!\n\nLembramos que você tem um horário agendado na *{shopName}*:\n\n📅 *Data:* {date}\n⏰ *Horário:* {time}\n✂️ *Serviço(s):* {services}\n👤 *Barbeiro:* {barberName}\n📍 *Endereço:* {address}\n\nPor favor, responda *SIM* para confirmar ou avise se precisar reagendar. Até logo!",
};

const STORAGE_KEY_REMINDER_LOGS = "barberpro_reminder_logs_v1";
const STORAGE_KEY_REMINDER_CONFIG = "barberpro_reminder_config_v1";

/**
 * Builds a friendly, formatted reminder message body for WhatsApp/SMS
 */
export function generateReminderMessage(
  appointment: Appointment,
  barbers: Barber[],
  services: Service[],
  settings: BarberShopSettings,
  template = DEFAULT_REMINDER_CONFIG.customTemplate || ""
): string {
  const barber = barbers.find((b) => b.id === appointment.barberId);
  const srvList = services.filter((s) => appointment.serviceIds.includes(s.id));
  const srvNames = srvList.map((s) => s.name).join(" + ") || "Corte Personalizado";
  const barberName = barber ? `Cadeira #${barber.chairNumber} - ${barber.name}` : "Equipe da Barbearia";

  // Format date to Brazilian format
  const [year, month, day] = appointment.date.split("-");
  const formattedDate = `${day}/${month}/${year}`;

  return template
    .replace(/{clientName}/g, appointment.clientName)
    .replace(/{shopName}/g, settings.name || "Barbearia")
    .replace(/{date}/g, formattedDate)
    .replace(/{time}/g, appointment.timeSlot)
    .replace(/{services}/g, srvNames)
    .replace(/{barberName}/g, barberName)
    .replace(/{address}/g, settings.address || "Rua dos Barbeiros, 500 - Jardins, SP")
    .replace(/{phone}/g, settings.phone || "(11) 3456-7890");
}

/**
 * Simulated Gateway Call to WhatsApp / SMS Provider API
 */
export async function sendSimulatedReminderApi(
  appointment: Appointment,
  barbers: Barber[],
  services: Service[],
  settings: BarberShopSettings,
  channel: "whatsapp" | "sms" = "whatsapp",
  customMessage?: string
): Promise<{
  success: boolean;
  deliveryId: string;
  timestamp: string;
  messageBody: string;
  error?: string;
}> {
  // Simulate realistic network delay to messaging provider (600ms - 1200ms)
  const delay = Math.floor(Math.random() * 600) + 600;
  await new Promise((resolve) => setTimeout(resolve, delay));

  // Phone validation check
  const cleanPhone = appointment.clientPhone.replace(/[^0-9]/g, "");
  if (!cleanPhone || cleanPhone.length < 8) {
    return {
      success: false,
      deliveryId: `ERR-${Date.now()}`,
      timestamp: new Date().toISOString(),
      messageBody: "",
      error: "Número de telefone inválido para envio do lembrete.",
    };
  }

  const messageBody = customMessage || generateReminderMessage(appointment, barbers, services, settings);
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const deliveryId = `${channel === "whatsapp" ? "WPP-MSG" : "SMS-GW"}-${randomSuffix}`;
  const timestamp = new Date().toISOString();

  // Save to local logs
  const barber = barbers.find((b) => b.id === appointment.barberId);
  const newLog: ReminderMessageLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    appointmentId: appointment.id,
    clientName: appointment.clientName,
    clientPhone: appointment.clientPhone,
    date: appointment.date,
    timeSlot: appointment.timeSlot,
    barberName: barber ? barber.name : "Barbeiro",
    channel,
    status: "delivered",
    timestamp,
    messageBody,
    deliveryId,
  };

  saveReminderLog(newLog);

  return {
    success: true,
    deliveryId,
    timestamp,
    messageBody,
  };
}

export function getStoredReminderLogs(): ReminderMessageLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REMINDER_LOGS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveReminderLog(log: ReminderMessageLog) {
  try {
    const current = getStoredReminderLogs();
    const updated = [log, ...current].slice(0, 100); // keep last 100 logs
    localStorage.setItem(STORAGE_KEY_REMINDER_LOGS, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save reminder log", e);
  }
}

export function getStoredReminderConfig(): ReminderConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REMINDER_CONFIG);
    return raw ? JSON.parse(raw) : DEFAULT_REMINDER_CONFIG;
  } catch {
    return DEFAULT_REMINDER_CONFIG;
  }
}

export function saveReminderConfig(config: ReminderConfig) {
  try {
    localStorage.setItem(STORAGE_KEY_REMINDER_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error("Failed to save reminder config", e);
  }
}
