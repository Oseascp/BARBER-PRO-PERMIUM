import React, { useState } from "react";
import { useBarber } from "../context/BarberContext";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Scissors,
  DollarSign,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Phone,
  Send,
  Bot,
  CheckCheck,
  AlertCircle,
  Settings,
  Sparkles,
  RefreshCw,
  Eye,
  History,
  FileText,
  Smartphone,
  Download,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { Appointment, AppointmentStatus } from "../types";
import { generateReminderMessage } from "../services/messagingService";
import { CalendarExportModal } from "./CalendarExportModal";
import {
  generateVEvent,
  downloadICalFile,
  generateGoogleCalendarWebUrl,
} from "../services/calendarExportService";

interface AppointmentsViewProps {
  onOpenNewBooking: () => void;
  onOpenPOS: (barberId?: string, clientName?: string) => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({ onOpenNewBooking, onOpenPOS }) => {
  const {
    appointments,
    barbers,
    services,
    settings,
    updateAppointmentStatus,
    sendAppointmentReminder,
    sendBatchReminders,
    reminderConfig,
    updateReminderConfig,
    reminderLogs,
    refreshReminderLogs,
  } = useBarber();

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [selectedBarberFilter, setSelectedBarberFilter] = useState<string>("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");
  const [selectedReminderFilter, setSelectedReminderFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals & Trigger States
  const [previewAppointment, setPreviewAppointment] = useState<Appointment | null>(null);
  const [previewCustomText, setPreviewCustomText] = useState<string>("");
  const [previewChannel, setPreviewChannel] = useState<"whatsapp" | "sms">("whatsapp");
  const [isSendingSingle, setIsSendingSingle] = useState<boolean>(false);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [showCalendarExportModal, setShowCalendarExportModal] = useState<boolean>(false);
  const [configActiveTab, setConfigActiveTab] = useState<"logs" | "template">("logs");
  const [isBatchSending, setIsBatchSending] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Template editor state inside modal
  const [templateDraft, setTemplateDraft] = useState<string>(reminderConfig.customTemplate || "");
  const [defaultChannelDraft, setDefaultChannelDraft] = useState<"whatsapp" | "sms">(reminderConfig.defaultChannel);

  // Filtered Appointments
  const filteredAppointments = appointments.filter((apt) => {
    const matchesDate = apt.date === selectedDate;
    const matchesBarber = selectedBarberFilter === "all" || apt.barberId === selectedBarberFilter;
    const matchesStatus = selectedStatusFilter === "all" || apt.status === selectedStatusFilter;
    const matchesReminder =
      selectedReminderFilter === "all" ||
      (selectedReminderFilter === "sent" && apt.reminderStatus === "sent") ||
      (selectedReminderFilter === "pending" && (!apt.reminderStatus || apt.reminderStatus === "pending")) ||
      (selectedReminderFilter === "failed" && apt.reminderStatus === "failed");

    const matchesSearch =
      searchQuery.trim() === "" ||
      apt.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.clientPhone.includes(searchQuery);

    return matchesDate && matchesBarber && matchesStatus && matchesReminder && matchesSearch;
  });

  // Sort by timeSlot
  const sortedAppointments = [...filteredAppointments].sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

  // Today stats for reminders
  const dayAppointments = appointments.filter((apt) => apt.date === selectedDate && apt.status !== "cancelled");
  const sentRemindersToday = dayAppointments.filter((apt) => apt.reminderStatus === "sent").length;
  const pendingRemindersToday = dayAppointments.filter(
    (apt) => !apt.reminderStatus || apt.reminderStatus === "pending" || apt.reminderStatus === "failed"
  );

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setFeedbackToast({ message, type });
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  const changeDateByDays = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split("T")[0]);
  };

  // Open Preview Modal
  const handleOpenPreview = (apt: Appointment) => {
    const msg = generateReminderMessage(apt, barbers, services, settings, reminderConfig.customTemplate);
    setPreviewAppointment(apt);
    setPreviewCustomText(msg);
    setPreviewChannel(apt.reminderChannel || reminderConfig.defaultChannel);
  };

  // Send single simulated reminder
  const handleSendSingleReminder = async (apt: Appointment, channel = previewChannel, customText?: string) => {
    setIsSendingSingle(true);
    const result = await sendAppointmentReminder(apt.id, channel, customText);
    setIsSendingSingle(false);

    if (result.success) {
      showToast(`Lembrete enviado com sucesso para ${apt.clientName}! (${result.deliveryId})`, "success");
      setPreviewAppointment(null);
    } else {
      showToast(`Falha no envio: ${result.error}`, "error");
    }
  };

  // Batch trigger for all pending appointments on selected date
  const handleSendBatchReminders = async () => {
    if (pendingRemindersToday.length === 0) {
      showToast("Todos os agendamentos desta data já receberam lembrete!", "success");
      return;
    }

    setIsBatchSending(true);
    setBatchProgress({ current: 0, total: pendingRemindersToday.length });

    let sent = 0;
    let failed = 0;

    for (let i = 0; i < pendingRemindersToday.length; i++) {
      const apt = pendingRemindersToday[i];
      setBatchProgress({ current: i + 1, total: pendingRemindersToday.length });
      const res = await sendAppointmentReminder(apt.id, reminderConfig.defaultChannel);
      if (res.success) {
        sent++;
      } else {
        failed++;
      }
    }

    setIsBatchSending(false);
    showToast(`Disparo em lote concluído: ${sent} enviados com sucesso${failed > 0 ? `, ${failed} falhas` : ""}.`, "success");
  };

  // Fallback to manual WhatsApp Web
  const handleManualWhatsApp = (phone: string, name: string, time: string) => {
    const text = encodeURIComponent(
      `Olá ${name}! Lembrete da ${settings.name}: Seu horário está confirmado para ${selectedDate} às ${time}. Responda SIM para confirmar seu atendimento. 💈`
    );
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${text}`, "_blank");
  };

  const handleSaveTemplate = () => {
    updateReminderConfig({
      ...reminderConfig,
      customTemplate: templateDraft,
      defaultChannel: defaultChannelDraft,
    });
    showToast("Configurações e modelo de lembrete salvos com sucesso!", "success");
  };

  // Sincronização Individual de Calendário (.ICS & Google Calendar)
  const handleDownloadSingleICS = (apt: Appointment) => {
    const vEvent = generateVEvent(apt, barbers, services, settings, 30);
    const vCalendarLines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Barber Pro Master//Agendamento Individual//PT-BR",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      `X-WR-CALNAME:${settings.name || "Barbearia"}`,
      "X-WR-TIMEZONE:America/Sao_Paulo",
      vEvent,
      "END:VCALENDAR",
    ].join("\r\n");

    const barber = barbers.find((b) => b.id === apt.barberId);
    const barberSlug = barber ? `-${barber.name.toLowerCase().replace(/\s+/g, "_")}` : "";
    const filename = `agendamento-${apt.clientName.toLowerCase().replace(/\s+/g, "_")}${barberSlug}-${apt.date}.ics`;
    downloadICalFile(vCalendarLines, filename);
    showToast(`Arquivo .ics gerado com sucesso para ${apt.clientName}!`, "success");
  };

  const handleOpenGoogleCalendar = (apt: Appointment) => {
    const url = generateGoogleCalendarWebUrl(apt, barbers, services, settings);
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Feedback */}
      {feedbackToast && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-xl border shadow-2xl flex items-center space-x-3 transition transform animate-bounce ${
            feedbackToast.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-200"
              : "bg-red-950/90 border-red-500/50 text-red-200"
          }`}
        >
          {feedbackToast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400" />
          )}
          <span className="text-xs font-bold">{feedbackToast.message}</span>
        </div>
      )}

      {/* Header & Date Controls */}
      <div className="bg-[#181B24] rounded-2xl border border-slate-800 p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-amber-300 uppercase tracking-wide">Agenda da Barbearia</h2>
                <p className="text-xs text-amber-200/70">
                  Gerencie a agenda diária, cadeiras dos barbeiros, check-in e disparos de lembretes automáticos
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Date Navigator */}
            <div className="flex items-center space-x-1 bg-slate-900 border border-slate-700 rounded-xl p-1">
              <button
                onClick={() => changeDateByDays(-1)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                title="Dia anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-amber-400 px-2 py-1 focus:outline-none cursor-pointer"
              />
              <button
                onClick={() => changeDateByDays(1)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                title="Próximo dia"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              Hoje
            </button>

            {/* Exportar .ICS / Google Agenda */}
            <button
              type="button"
              id="open-calendar-export-btn"
              onClick={() => setShowCalendarExportModal(true)}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-amber-400 text-xs font-bold transition flex items-center space-x-1.5 shadow-sm group"
              title="Exportar horários para Google Agenda, Outlook ou Apple iCal (.ics)"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition" />
              <span>Exportar .ICS</span>
              <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[9px] font-extrabold border border-purple-500/30">
                Beta
              </span>
            </button>

            <button
              onClick={onOpenNewBooking}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20 flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Novo Agendamento</span>
            </button>
          </div>
        </div>

        {/* Central de Automação de Lembretes Banner */}
        <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-[#13151D] to-amber-950/30 border border-purple-500/30 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex-shrink-0">
              <Bot className="w-5 h-5 text-purple-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black uppercase text-purple-300 tracking-wider">
                  Robô de Lembretes Automáticos (API Simulada)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Gateway Ativo</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {sentRemindersToday} de {dayAppointments.length} clientes notificados para esta data •{" "}
                <span className="text-amber-400 font-bold">{pendingRemindersToday.length} pendentes</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Batch Send Button */}
            <button
              onClick={handleSendBatchReminders}
              disabled={isBatchSending || pendingRemindersToday.length === 0}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md flex items-center space-x-1.5 ${
                pendingRemindersToday.length > 0 && !isBatchSending
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/25 cursor-pointer transform hover:scale-[1.02]"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
              }`}
            >
              {isBatchSending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-300" />
                  <span>
                    Disparando ({batchProgress.current}/{batchProgress.total})...
                  </span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Disparar Todos de Hoje ({pendingRemindersToday.length})</span>
                </>
              )}
            </button>

            {/* Config & Logs Modal Trigger */}
            <button
              onClick={() => {
                refreshReminderLogs();
                setShowConfigModal(true);
              }}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-slate-100 text-xs font-semibold transition flex items-center space-x-1.5"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>Histórico &amp; Modelos ({reminderLogs.length})</span>
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por cliente ou telefone..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Barber Filter */}
          <div className="relative">
            <select
              value={selectedBarberFilter}
              onChange={(e) => setSelectedBarberFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">Todos os Barbeiros ({barbers.length})</option>
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>
                  Cadeira #{b.chairNumber}: {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">Todos os Status</option>
              <option value="confirmed">Confirmado</option>
              <option value="in_chair">Em Atendimento</option>
              <option value="completed">Concluído</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          {/* Reminder Status Filter */}
          <div className="relative">
            <select
              value={selectedReminderFilter}
              onChange={(e) => setSelectedReminderFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">Status do Lembrete (Todos)</option>
              <option value="sent">Lembrete Enviado ({sentRemindersToday})</option>
              <option value="pending">Lembrete Pendente ({pendingRemindersToday.length})</option>
              <option value="failed">Falha no Envio</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-[#181B24] rounded-2xl border border-slate-800 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Exibindo {sortedAppointments.length} agendamentos para {selectedDate}
          </span>
        </div>

        {sortedAppointments.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
            <CalendarIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-sm text-slate-300">Nenhum agendamento encontrado</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Não há agendamentos cadastrados para esta data e filtros selecionados.
            </p>
            <button
              onClick={onOpenNewBooking}
              className="mt-4 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
            >
              Agendar Horário para {selectedDate}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedAppointments.map((apt) => {
              const barber = barbers.find((b) => b.id === apt.barberId);
              const srvList = services.filter((s) => apt.serviceIds.includes(s.id));
              const isInChair = apt.status === "in_chair";
              const isCompleted = apt.status === "completed";
              const isCancelled = apt.status === "cancelled";
              const isReminderSent = apt.reminderStatus === "sent";
              const isReminderSending = apt.reminderStatus === "sending";
              const isReminderFailed = apt.reminderStatus === "failed";

              return (
                <div
                  key={apt.id}
                  className={`p-4 rounded-xl border transition flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                    isInChair
                      ? "bg-amber-950/20 border-amber-500/50 shadow-md ring-1 ring-amber-500/20"
                      : isCompleted
                      ? "bg-slate-900/30 border-slate-800/80 opacity-70"
                      : isCancelled
                      ? "bg-red-950/10 border-red-900/30 opacity-60"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {/* Left: Time & Client Details */}
                  <div className="flex items-start space-x-4 min-w-0">
                    <div className="flex flex-col items-center justify-center w-16 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center flex-shrink-0">
                      <Clock className="w-3.5 h-3.5 text-amber-400 mb-0.5" />
                      <span className="text-sm font-black text-amber-400">{apt.timeSlot}</span>
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-base text-slate-100 truncate">{apt.clientName}</span>

                        {/* Status Tag */}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            isInChair
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : isCompleted
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : isCancelled
                              ? "bg-red-500/20 text-red-300 border border-red-500/30"
                              : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          }`}
                        >
                          {apt.status === "in_chair"
                            ? "Em Corte"
                            : apt.status === "completed"
                            ? "Concluído"
                            : apt.status === "cancelled"
                            ? "Cancelado"
                            : "Confirmado"}
                        </span>

                        {/* Reminder Status Badge */}
                        {isReminderSent && (
                          <span
                            title={`Disparado via ${apt.reminderChannel?.toUpperCase()} • ID: ${apt.reminderDeliveryId || "OK"}`}
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-700/50 flex items-center space-x-1"
                          >
                            <CheckCheck className="w-3 h-3 text-emerald-400" />
                            <span>
                              Lembrete Enviado{" "}
                              {apt.reminderSentAt
                                ? new Date(apt.reminderSentAt).toLocaleTimeString("pt-BR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : ""}
                            </span>
                          </span>
                        )}

                        {isReminderSending && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-500/40 flex items-center space-x-1 animate-pulse">
                            <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                            <span>Enviando Lembrete...</span>
                          </span>
                        )}

                        {isReminderFailed && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950/60 text-red-400 border border-red-700/50 flex items-center space-x-1">
                            <AlertCircle className="w-3 h-3 text-red-400" />
                            <span>Falha no Envio</span>
                          </span>
                        )}

                        {!isReminderSent && !isReminderSending && !isReminderFailed && !isCancelled && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800/80 text-slate-400 border border-slate-700/60 flex items-center space-x-1">
                            <span>Lembrete Pendente</span>
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-300 font-medium flex flex-wrap items-center gap-2">
                        <span className="text-amber-400 font-semibold">
                          {srvList.map((s) => s.name).join(" + ") || "Corte Personalizado"}
                        </span>
                        <span>•</span>
                        <span className="text-slate-400">
                          Cadeira #{barber?.chairNumber}: {barber?.name}
                        </span>
                        <span>•</span>
                        <span className="text-slate-200 font-bold">
                          {settings.currencySymbol}
                          {apt.totalAmount}
                        </span>
                        {apt.paid && (
                          <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40 font-bold">
                            PAGO ✓
                          </span>
                        )}
                        <span>•</span>
                        <span className="text-slate-400 font-mono text-[11px]">{apt.clientPhone}</span>
                      </div>

                      {apt.notes && (
                        <p className="text-[11px] text-slate-400 italic">Obs: {apt.notes}</p>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center space-x-2 justify-end flex-wrap gap-y-2">
                    {/* Disparar Lembrete Automático / Visualizar */}
                    {!isCancelled && !isCompleted && (
                      <div className="flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
                        <button
                          onClick={() => handleSendSingleReminder(apt)}
                          disabled={isSendingSingle}
                          title="Enviar lembrete imediato via robô de mensagens (API simulada)"
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                            isReminderSent
                              ? "bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                              : "bg-purple-600 hover:bg-purple-500 text-white shadow-sm"
                          }`}
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isReminderSent ? "Reenviar" : "Lembrete IA"}</span>
                        </button>

                        <button
                          onClick={() => handleOpenPreview(apt)}
                          title="Ver prévia da mensagem e personalizar antes de disparar"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Manual WhatsApp Link */}
                    <button
                      onClick={() => handleManualWhatsApp(apt.clientPhone, apt.clientName, apt.timeSlot)}
                      title="Abrir no WhatsApp Web manualmente"
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 text-xs font-semibold border border-emerald-800/40 transition flex items-center space-x-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>

                    {/* Sincronizar Calendário Individual (.ICS & Google Calendar) */}
                    {!isCancelled && (
                      <div className="flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
                        <button
                          type="button"
                          onClick={() => handleDownloadSingleICS(apt)}
                          title="Baixar evento .ics para sincronizar no Google Agenda / Outlook / Apple iCal"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition flex items-center space-x-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold hidden sm:inline">.ICS</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenGoogleCalendar(apt)}
                          title="Adicionar evento diretamente no Google Agenda (Web)"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition flex items-center space-x-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold hidden sm:inline">GCal</span>
                        </button>
                      </div>
                    )}

                    {/* Status Dropdown */}
                    <select
                      value={apt.status}
                      onChange={(e) => updateAppointmentStatus(apt.id, e.target.value as AppointmentStatus)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700 focus:outline-none"
                    >
                      <option value="confirmed">Confirmado</option>
                      <option value="in_chair">Em Atendimento</option>
                      <option value="completed">Concluído</option>
                      <option value="cancelled">Cancelado</option>
                    </select>

                    {/* Checkout Button */}
                    {!isCompleted && !isCancelled && (
                      <button
                        onClick={() => onOpenPOS(apt.barberId, apt.clientName)}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 text-xs font-black uppercase transition shadow flex items-center space-x-1"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Receber</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Preview & Personalização de Lembrete Individual */}
      {previewAppointment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181B24] rounded-2xl border border-slate-700 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">Prévia do Lembrete de Agendamento</h3>
                  <p className="text-xs text-slate-400">Cliente: {previewAppointment.clientName}</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewAppointment(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Canal Selection */}
            <div className="flex items-center justify-between bg-slate-900 p-2 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 font-semibold">Canal de Envio:</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setPreviewChannel("whatsapp")}
                  className={`px-3 py-1 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                    previewChannel === "whatsapp"
                      ? "bg-emerald-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Bot</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewChannel("sms")}
                  className={`px-3 py-1 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                    previewChannel === "sms"
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>SMS Gateway</span>
                </button>
              </div>
            </div>

            {/* Simulated WhatsApp Chat Balloon */}
            <div className="bg-[#0B141A] p-4 rounded-xl border border-[#222E35] space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Simulação de Mensagem no Celular do Cliente ({previewAppointment.clientPhone})
              </span>
              <div className="bg-[#005C4B] text-slate-100 p-3.5 rounded-xl rounded-tl-none shadow-md text-xs leading-relaxed whitespace-pre-wrap font-sans">
                {previewCustomText}
                <div className="text-right text-[10px] text-emerald-200/70 mt-2 font-mono flex items-center justify-end space-x-1">
                  <span>{new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                  <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                </div>
              </div>
            </div>

            {/* Editable Custom Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Editar Mensagem antes de disparar:</span>
                <span className="text-[11px] text-slate-500">{previewCustomText.length} caracteres</span>
              </label>
              <textarea
                rows={4}
                value={previewCustomText}
                onChange={(e) => setPreviewCustomText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono leading-relaxed"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setPreviewAppointment(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleSendSingleReminder(previewAppointment, previewChannel, previewCustomText)}
                disabled={isSendingSingle}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-wider transition shadow-lg flex items-center space-x-1.5"
              >
                {isSendingSingle ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Transmitindo...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Disparar Agora via API</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Histórico de Logs & Configurações da API de Lembretes */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181B24] rounded-2xl border border-slate-700 max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">Central de Lembretes &amp; Gateway de Mensagens</h3>
                  <p className="text-xs text-slate-400">Logs de entrega e parametrização do robô de notificações</p>
                </div>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setConfigActiveTab("logs")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                  configActiveTab === "logs"
                    ? "bg-amber-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Histórico de Envios ({reminderLogs.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setConfigActiveTab("template")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                  configActiveTab === "template"
                    ? "bg-amber-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Configurar Modelo &amp; Tags</span>
              </button>
            </div>

            {/* Tab 1: Logs */}
            {configActiveTab === "logs" ? (
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {reminderLogs.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    Nenhum lembrete foi disparado ainda nesta sessão.
                  </div>
                ) : (
                  reminderLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-200">{log.clientName}</span>
                          <span className="text-slate-400 font-mono text-[11px]">({log.clientPhone})</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 text-[10px] font-bold flex items-center space-x-1">
                          <CheckCheck className="w-3 h-3" />
                          <span>Entregue ({log.deliveryId})</span>
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                        <span>Horário Marcado: {log.date} às {log.timeSlot}</span>
                        <span>•</span>
                        <span>Canal: {log.channel.toUpperCase()}</span>
                        <span>•</span>
                        <span>Disparado em: {new Date(log.timestamp).toLocaleTimeString("pt-BR")}</span>
                      </div>

                      <p className="p-2 rounded bg-slate-950 text-[11px] text-slate-300 font-mono whitespace-pre-wrap">
                        {log.messageBody}
                      </p>
                    </div>
                  ))
                )}
              </div>
            ) : (
              /* Tab 2: Template & Parameters */
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200">Canal de Envio Padrão:</label>
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="defaultChannelDraft"
                        value="whatsapp"
                        checked={defaultChannelDraft === "whatsapp"}
                        onChange={() => setDefaultChannelDraft("whatsapp")}
                        className="text-amber-500"
                      />
                      <span>WhatsApp Business Gateway (Recomendado)</span>
                    </label>
                    <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="defaultChannelDraft"
                        value="sms"
                        checked={defaultChannelDraft === "sms"}
                        onChange={() => setDefaultChannelDraft("sms")}
                        className="text-amber-500"
                      />
                      <span>SMS Direct Gateway</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200">Modelo de Mensagem de Lembrete:</label>
                  <textarea
                    rows={6}
                    value={templateDraft}
                    onChange={(e) => setTemplateDraft(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono leading-relaxed"
                  />
                </div>

                {/* Tag Helper List */}
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-[11px] space-y-1">
                  <span className="font-bold text-amber-400 uppercase tracking-wide block">
                    Tags Dinâmicas Disponíveis:
                  </span>
                  <div className="grid grid-cols-2 gap-1 text-slate-400 font-mono">
                    <span>{"{clientName}"} → Nome do Cliente</span>
                    <span>{"{shopName}"} → Nome da Barbearia</span>
                    <span>{"{date}"} → Data do Corte (DD/MM/AAAA)</span>
                    <span>{"{time}"} → Horário Agendado</span>
                    <span>{"{services}"} → Serviços Escolhidos</span>
                    <span>{"{barberName}"} → Barbeiro & Cadeira</span>
                    <span>{"{address}"} → Endereço da Loja</span>
                    <span>{"{phone}"} → Telefone de Contato</span>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleSaveTemplate}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Exportação de Calendário (.ICS) */}
      <CalendarExportModal
        isOpen={showCalendarExportModal}
        onClose={() => setShowCalendarExportModal(false)}
        appointments={appointments}
        barbers={barbers}
        services={services}
        settings={settings}
        currentSelectedDate={selectedDate}
      />
    </div>
  );
};

