import React, { useState } from "react";
import {
  Calendar,
  Download,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  X,
  User,
  Clock,
  Scissors,
  Bell,
  Sparkles,
  Info,
  Check,
  Layers,
} from "lucide-react";
import { Appointment, Barber, Service, BarberShopSettings } from "../types";
import {
  ICalExportOptions,
  buildICalendarFile,
  downloadICalFile,
  filterAppointmentsForExport,
} from "../services/calendarExportService";

interface CalendarExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: Appointment[];
  barbers: Barber[];
  services: Service[];
  settings: BarberShopSettings;
  currentSelectedDate: string;
}

export const CalendarExportModal: React.FC<CalendarExportModalProps> = ({
  isOpen,
  onClose,
  appointments,
  barbers,
  services,
  settings,
  currentSelectedDate,
}) => {
  const [dateRange, setDateRange] = useState<
    "selected_day" | "next_7_days" | "next_30_days" | "all_confirmed"
  >("selected_day");
  const [barberFilterId, setBarberFilterId] = useState<string>("all");
  const [alarmMinutes, setAlarmMinutes] = useState<number>(30);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const exportOptions: ICalExportOptions = {
    dateRange,
    selectedDate: currentSelectedDate,
    barberFilterId,
    alarmMinutesBefore: alarmMinutes,
    calendarTitle:
      barberFilterId !== "all"
        ? `Agenda ${barbers.find((b) => b.id === barberFilterId)?.name || "Barbeiro"} - ${settings.name}`
        : `${settings.name} - Agendamentos Gerais`,
  };

  const matchingAppointments = filterAppointmentsForExport(appointments, exportOptions);

  const handleExport = () => {
    if (matchingAppointments.length === 0) return;

    const selectedBarber = barbers.find((b) => b.id === barberFilterId);
    const barberSlug = selectedBarber ? `-${selectedBarber.name.toLowerCase().replace(/\s+/g, "_")}` : "-equipe";
    const dateSlug = dateRange === "selected_day" ? currentSelectedDate : dateRange;
    const filename = `agendamentos${barberSlug}-${dateSlug}.ics`;

    const icsContent = buildICalendarFile(
      matchingAppointments,
      barbers,
      services,
      settings,
      exportOptions
    );

    downloadICalFile(icsContent, filename);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#181B24] rounded-2xl border border-amber-500/40 max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-scaleUp my-8 text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-start space-x-3">
            <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base text-slate-100">
                  Exportar Agendamentos (.ICS / iCal)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>Experimental</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Sincronize a escala dos barbeiros com o Google Agenda, Microsoft Outlook ou Apple iCalendar.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Compatibility Badges */}
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300">
          <span className="font-semibold text-slate-400">Compatibilidade Universal:</span>
          <span className="px-2 py-0.5 rounded-md bg-blue-950/60 border border-blue-800/40 text-blue-300 font-bold">
            Google Calendar
          </span>
          <span className="px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 font-bold">
            MS Outlook
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-200 font-bold">
            Apple iCal (iOS/Mac)
          </span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 font-bold">
            Android Calendar
          </span>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Option 1: Date Range */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Período dos Agendamentos:</span>
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="selected_day">
                Somente Dia Selecionado ({currentSelectedDate})
              </option>
              <option value="next_7_days">Próximos 7 Dias</option>
              <option value="next_30_days">Próximos 30 Dias</option>
              <option value="all_confirmed">Todos os Confirmados / Ativos</option>
            </select>
          </div>

          {/* Option 2: Barber Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>Filtrar por Barbeiro:</span>
            </label>
            <select
              value={barberFilterId}
              onChange={(e) => setBarberFilterId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">Toda a Barbearia ({barbers.length} profissionais)</option>
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>
                  Cadeira #{b.chairNumber}: {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Option 3: Alarm Notification in iCal */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
              <Bell className="w-3.5 h-3.5 text-purple-400" />
              <span>Notificação / Alarme no Celular:</span>
            </label>
            <select
              value={alarmMinutes}
              onChange={(e) => setAlarmMinutes(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value={15}>15 minutos antes</option>
              <option value={30}>30 minutos antes (Padrão)</option>
              <option value={60}>1 hora antes</option>
              <option value={120}>2 horas antes</option>
              <option value={0}>Sem alarme prévio no arquivo</option>
            </select>
          </div>

          {/* Matching Summary Badge */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-center">
            <span className="text-[11px] text-slate-400">Total de Horários Identificados:</span>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="text-xl font-black text-amber-400">
                {matchingAppointments.length}
              </span>
              <span className="text-xs text-slate-300 font-semibold">
                {matchingAppointments.length === 1 ? "agendamento elegível" : "agendamentos elegíveis"}
              </span>
            </div>
          </div>
        </div>

        {/* Matching Appointments Preview Scroll */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wide text-[10px]">
              Prévia dos Atendimentos Incluídos no .ICS
            </span>
            <span>{matchingAppointments.length} itens</span>
          </div>

          {matchingAppointments.length === 0 ? (
            <div className="p-6 rounded-xl bg-slate-900/50 border border-dashed border-slate-800 text-center text-xs text-slate-500">
              Nenhum agendamento ativo encontrado para este filtro. Modifique o período ou selecione outro barbeiro.
            </div>
          ) : (
            <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/60 divide-y divide-slate-800/60 p-1">
              {matchingAppointments.map((apt) => {
                const barber = barbers.find((b) => b.id === apt.barberId);
                const aptServices = services.filter((s) => apt.serviceIds.includes(s.id));
                return (
                  <div key={apt.id} className="p-2 text-xs flex items-center justify-between">
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="font-mono text-amber-400 font-bold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-[11px]">
                        {apt.date.slice(5)} {apt.timeSlot}
                      </span>
                      <span className="font-bold text-slate-200 truncate">{apt.clientName}</span>
                      <span className="text-slate-500 hidden sm:inline">•</span>
                      <span className="text-slate-400 text-[11px] truncate hidden sm:inline">
                        {aptServices.map((s) => s.name).join(", ")}
                      </span>
                    </div>
                    <span className="text-[11px] text-amber-300/80 font-medium flex-shrink-0 ml-2">
                      {barber?.name || "Barbeiro"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Instructions Toggle */}
        <div className="border-t border-slate-800 pt-3">
          <button
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center space-x-1.5 transition font-semibold"
          >
            <Info className="w-3.5 h-3.5" />
            <span>
              {showInstructions
                ? "Ocultar instruções de sincronização"
                : "Como importar o arquivo no Google Agenda / Outlook?"}
            </span>
          </button>

          {showInstructions && (
            <div className="mt-3 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-2">
              <div>
                <strong className="text-amber-300">No Google Agenda (Web/Celular):</strong>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Acesse <em>calendar.google.com</em> &gt; Ícone de Engrenagem (Configurações) &gt;{" "}
                  <strong>Importar e exportar</strong> &gt; Selecione o arquivo <code>.ics</code> baixado e escolha a agenda do barbeiro.
                </p>
              </div>
              <div>
                <strong className="text-blue-300">No Microsoft Outlook:</strong>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Abra o Outlook &gt; <strong>Arquivo</strong> &gt; <strong>Abrir e Exportar</strong> &gt;{" "}
                  <strong>Importar/Exportar</strong> &gt; Escolha <em>iCalendar (.ics)</em>.
                </p>
              </div>
              <div>
                <strong className="text-emerald-300">No iPhone / iPad / Mac:</strong>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Basta clicar duas vezes ou abrir o arquivo <code>.ics</code> baixado. O aplicativo nativo do Calendário Apple adicionará todos os eventos automaticamente.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <span className="text-[11px] text-slate-400 flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>Padrão aberto RFC 5545 compatível sem necessidade de API externa</span>
          </span>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
            >
              Fechar
            </button>

            <button
              type="button"
              id="confirm-ical-export-btn"
              disabled={matchingAppointments.length === 0}
              onClick={handleExport}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-lg flex items-center justify-center space-x-2 ${
                matchingAppointments.length > 0
                  ? "bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 shadow-amber-500/25 cursor-pointer"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
              }`}
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-950 font-black" />
                  <span>Arquivo .ICS Baixado!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Baixar Arquivo .ICS ({matchingAppointments.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
