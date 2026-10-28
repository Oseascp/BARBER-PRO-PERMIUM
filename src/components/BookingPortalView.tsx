import React, { useState } from "react";
import { useBarber } from "../context/BarberContext";
import {
  Scissors,
  Calendar as CalendarIcon,
  Clock,
  User,
  Check,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Star,
  DollarSign,
  Phone,
  Mail,
  FileText,
  Share2,
  Download,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Service, Barber, Appointment } from "../types";
import {
  generateVEvent,
  downloadICalFile,
  generateGoogleCalendarWebUrl,
} from "../services/calendarExportService";

export const BookingPortalView: React.FC = () => {
  const { services, barbers, settings, addAppointment, appointments, currentTenant } = useBarber();

  const [copiedPortalLink, setCopiedPortalLink] = useState<boolean>(false);

  const handleSharePortalLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const directUrl = `${origin}/?tenant=${currentTenant?.slug || "imperial"}&tab=booking`;
    navigator.clipboard.writeText(directUrl);
    setCopiedPortalLink(true);
    setTimeout(() => setCopiedPortalLink(false), 2500);
  };

  const [step, setStep] = useState<number>(1);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(["srv-1"]);
  const [selectedBarberId, setSelectedBarberId] = useState<string>("any");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("11:00");
  const [clientName, setClientName] = useState<string>("");
  const [clientPhone, setClientPhone] = useState<string>("");
  const [clientEmail, setClientEmail] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);

  // Horários disponíveis
  const ALL_SLOTS = [
    "08:30", "09:15", "10:00", "10:45", "11:30",
    "12:15", "13:00", "13:45", "14:30", "15:15",
    "16:00", "16:45", "17:30", "18:15", "19:00"
  ];

  // Totais
  const selectedServices = services.filter((s) => selectedServiceIds.includes(s.id));
  const totalPrice = selectedServices.reduce((acc, s) => acc + s.price, 0);
  const totalDuration = selectedServices.reduce((acc, s) => acc + s.durationMinutes, 0);

  const selectedBarber = barbers.find((b) => b.id === selectedBarberId);

  const toggleService = (srvId: string) => {
    if (selectedServiceIds.includes(srvId)) {
      if (selectedServiceIds.length > 1) {
        setSelectedServiceIds(selectedServiceIds.filter((id) => id !== srvId));
      }
    } else {
      setSelectedServiceIds([...selectedServiceIds, srvId]);
    }
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) {
      alert("Por favor, preencha seu nome e telefone/WhatsApp.");
      return;
    }

    let assignedBarberId = selectedBarberId;
    if (assignedBarberId === "any") {
      const barberCounts = barbers.map((b) => ({
        id: b.id,
        count: appointments.filter((a) => a.date === selectedDate && a.barberId === b.id).length,
      }));
      barberCounts.sort((a, b) => a.count - b.count);
      assignedBarberId = barberCounts[0]?.id || barbers[0].id;
    }

    const newApt = addAppointment({
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientEmail: clientEmail.trim() || undefined,
      barberId: assignedBarberId,
      serviceIds: selectedServiceIds,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      status: "confirmed",
      notes: notes.trim() || undefined,
      totalAmount: totalPrice,
      paid: false,
    });

    setCreatedAppointment(newApt);
    setStep(5);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#F59E0B", "#EAB308", "#ffffff", "#10B981"],
      });
    } catch (err) {
      // ignore
    }
  };

  const generateICSFile = () => {
    if (!createdAppointment) return;
    const vEvent = generateVEvent(createdAppointment, barbers, services, settings, 30);
    const vCalendarLines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Barber Pro Master//Agendamento Online//PT-BR",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      `X-WR-CALNAME:${settings.name || "Barbearia"}`,
      "X-WR-TIMEZONE:America/Sao_Paulo",
      vEvent,
      "END:VCALENDAR",
    ].join("\r\n");

    const filename = `agendamento-${createdAppointment.date}-${createdAppointment.timeSlot.replace(":", "")}.ics`;
    downloadICalFile(vCalendarLines, filename);
  };

  const handleOpenGoogleCalendar = () => {
    if (!createdAppointment) return;
    const url = generateGoogleCalendarWebUrl(createdAppointment, barbers, services, settings);
    window.open(url, "_blank");
  };

  const shareViaWhatsApp = () => {
    if (!createdAppointment) return;
    const barber = barbers.find((b) => b.id === createdAppointment.barberId);
    const text = encodeURIComponent(
      `💈 Agendamento Confirmado na ${settings.name}!\n📅 Data: ${createdAppointment.date} às ${createdAppointment.timeSlot}\n✂️ Serviços: ${selectedServices.map((s) => s.name).join(", ")}\n👤 Barbeiro: ${barber?.name}\n📍 Endereço: ${settings.address}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Portal Header */}
      <div className="text-center py-6">
        <span className="px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-widest shadow-sm">
          Autoatendimento Online
        </span>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight mt-3 text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-400 drop-shadow-sm">
          Reserve Sua Cadeira • {currentTenant?.name || settings.name}
        </h1>
        <p className="text-xs sm:text-sm text-amber-200/80 max-w-lg mx-auto mt-2 font-medium">
          Escolha os tratamentos, selecione seu profissional favorito e escolha o melhor horário.
        </p>

        {/* Tenant Info & Direct Link Share Button */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-slate-400">
          <span className="font-semibold text-slate-300">
            📍 {currentTenant?.address || settings.address}
          </span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <button
            onClick={handleSharePortalLink}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-400 font-bold flex items-center space-x-1.5 transition text-[11px]"
            title="Copiar Link de Agendamento desta barbearia"
          >
            {copiedPortalLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Link Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Copiar Link Desta Barbearia</span>
              </>
            )}
          </button>
        </div>

        {/* Steps Progress Indicator */}
        {step < 5 && (
          <div className="flex items-center justify-center space-x-2 sm:space-x-4 mt-6">
            {[
              { num: 1, label: "Serviços" },
              { num: 2, label: "Barbeiro" },
              { num: 3, label: "Horário" },
              { num: 4, label: "Dados" },
            ].map((s) => (
              <div key={s.num} className="flex items-center space-x-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold transition ${
                    step === s.num
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 ring-2 ring-amber-400/40"
                      : step > s.num
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
                </div>
                <span className={`text-xs font-semibold hidden sm:inline ${step === s.num ? "text-amber-400" : "text-slate-500"}`}>
                  {s.label}
                </span>
                {s.num < 4 && <div className="w-4 sm:w-8 h-0.5 bg-slate-800"></div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STEP 1: Selecionar Serviços */}
      {step === 1 && (
        <div className="bg-[#181B24] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-100 uppercase tracking-wide">1. Escolha os Serviços &amp; Tratamentos</h2>
              <p className="text-xs text-slate-400">Você pode selecionar um ou múltiplos serviços para seu atendimento</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Tempo estimado: </span>
              <span className="text-xs font-bold text-amber-400">~{totalDuration} min</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {services.map((srv) => {
              const isSelected = selectedServiceIds.includes(srv.id);
              return (
                <div
                  key={srv.id}
                  id={`service-select-${srv.id}`}
                  onClick={() => toggleService(srv.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                    isSelected
                      ? "bg-amber-950/20 border-amber-500/50 shadow-md ring-1 ring-amber-500/20"
                      : "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center border ${
                            isSelected ? "bg-amber-500 border-amber-500 text-slate-950" : "border-slate-600 bg-slate-800"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <h3 className="font-bold text-sm text-slate-100">{srv.name}</h3>
                      </div>
                      <span className="text-sm font-black text-amber-400">
                        {settings.currencySymbol}
                        {srv.price}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{srv.description}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1 text-slate-500" />
                      {srv.durationMinutes} minutos
                    </span>
                    {srv.popular && (
                      <span className="text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                        ★ Mais Escolhido
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">Serviços Selecionados: </span>
              <span className="text-sm font-bold text-slate-100">{selectedServices.length} itens</span>
              <span className="text-sm font-black text-amber-400 ml-2">
                ({settings.currencySymbol}{totalPrice})
              </span>
            </div>
            <button
              onClick={() => setStep(2)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition shadow flex items-center space-x-1.5"
            >
              <span>Avançar: Barbeiro</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Escolha o Barbeiro */}
      {step === 2 && (
        <div className="bg-[#181B24] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-100 uppercase tracking-wide">2. Escolha o seu Mestre Barbeiro</h2>
              <p className="text-xs text-slate-400">Selecione seu profissional favorito ou a primeira cadeira livre</p>
            </div>
            <button onClick={() => setStep(1)} className="text-xs text-slate-400 hover:text-slate-200 flex items-center">
              <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Voltar
            </button>
          </div>

          {/* Opção Qualquer Barbeiro */}
          <div
            id="barber-select-any"
            onClick={() => setSelectedBarberId("any")}
            className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
              selectedBarberId === "any"
                ? "bg-amber-950/20 border-amber-500/50 ring-1 ring-amber-500/20"
                : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-700/30 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100">Primeiro Barbeiro Disponível</h3>
                <p className="text-xs text-slate-400">Recomendado para máxima flexibilidade e rapidez de atendimento</p>
              </div>
            </div>
            <div
              className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                selectedBarberId === "any" ? "bg-amber-500 border-amber-500 text-slate-950" : "border-slate-600"
              }`}
            >
              {selectedBarberId === "any" && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </div>

          {/* Barbeiros Individuais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {barbers.map((b) => {
              const isSelected = selectedBarberId === b.id;
              return (
                <div
                  key={b.id}
                  id={`barber-select-${b.id}`}
                  onClick={() => setSelectedBarberId(b.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition flex items-start justify-between ${
                    isSelected
                      ? "bg-amber-950/20 border-amber-500/50 ring-1 ring-amber-500/20"
                      : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <img
                      src={b.avatar}
                      alt={b.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover border border-amber-500/30 shadow flex-shrink-0"
                    />
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h3 className="font-bold text-sm text-slate-100">{b.name}</h3>
                      </div>
                      <p className="text-xs text-amber-400/90 font-medium">{b.title}</p>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-1">
                        <span className="flex items-center text-amber-400">
                          <Star className="w-3 h-3 fill-current mr-0.5" />
                          {b.rating} ({b.reviewCount})
                        </span>
                        <span>•</span>
                        <span>Cadeira #{b.chairNumber}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{b.bio}</p>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ml-2 ${
                      isSelected ? "bg-amber-500 border-amber-500 text-slate-950" : "border-slate-600"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
            >
              Voltar
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition shadow flex items-center space-x-1.5"
            >
              <span>Avançar: Data &amp; Horário</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Data e Horário */}
      {step === 3 && (
        <div className="bg-[#181B24] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-100 uppercase tracking-wide">3. Escolha a Data &amp; Horário</h2>
              <p className="text-xs text-slate-400">Horários disponíveis para a duração selecionada ({totalDuration} min)</p>
            </div>
            <button onClick={() => setStep(2)} className="text-xs text-slate-400 hover:text-slate-200 flex items-center">
              <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Voltar
            </button>
          </div>

          {/* Seletor de Data */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Selecione o Dia
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-400 font-bold text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
              />
              <span className="text-xs text-slate-400">Horário da Barbearia: {settings.openTime} às {settings.closeTime}</span>
            </div>
          </div>

          {/* Grade de Horários */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Horários Livres para {selectedDate}
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
              {ALL_SLOTS.map((slot) => {
                const isSelected = selectedTimeSlot === slot;
                const isBooked = appointments.some(
                  (a) => a.date === selectedDate && a.timeSlot === slot && (selectedBarberId === "any" ? false : a.barberId === selectedBarberId)
                );

                return (
                  <button
                    key={slot}
                    disabled={isBooked}
                    id={`time-slot-${slot.replace(":", "-")}`}
                    onClick={() => setSelectedTimeSlot(slot)}
                    className={`py-3 px-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center ${
                      isBooked
                        ? "bg-slate-900/40 text-slate-600 border border-slate-800/40 cursor-not-allowed line-through"
                        : isSelected
                        ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 ring-2 ring-amber-400"
                        : "bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700"
                    }`}
                  >
                    <span>{slot}</span>
                    <span className={`text-[9px] font-normal mt-0.5 ${isSelected ? "text-slate-900" : "text-slate-500"}`}>
                      {isBooked ? "Ocupado" : "Disponível"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
            >
              Voltar
            </button>
            <button
              onClick={() => setStep(4)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition shadow flex items-center space-x-1.5"
            >
              <span>Avançar: Seus Dados</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Informações do Cliente & Revisão */}
      {step === 4 && (
        <div className="bg-[#181B24] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-100 uppercase tracking-wide">4. Seus Dados &amp; Revisão</h2>
              <p className="text-xs text-slate-400">Onde você receberá a confirmação instantânea do seu agendamento</p>
            </div>
            <button onClick={() => setStep(3)} className="text-xs text-slate-400 hover:text-slate-200 flex items-center">
              <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Voltar
            </button>
          </div>

          <form onSubmit={handleConfirmBooking} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nome Completo *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Pedro Henrique"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">WhatsApp / Celular *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="Ex: (11) 98765-4321"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">E-mail (Opcional)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="Ex: pedro.henrique@email.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Preferências de Corte / Observações</label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <textarea
                    rows={2}
                    placeholder="Ex: Degradê médio, manter franja texturizada, couro sensível."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Resumo */}
            <div className="bg-slate-950/80 rounded-xl p-4 border border-amber-500/30 space-y-2">
              <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">Resumo do Agendamento</h4>
              <div className="text-xs text-slate-300 flex justify-between">
                <span>Data &amp; Horário:</span>
                <span className="font-bold text-slate-100">
                  {selectedDate} às {selectedTimeSlot}
                </span>
              </div>
              <div className="text-xs text-slate-300 flex justify-between">
                <span>Barbeiro:</span>
                <span className="font-bold text-slate-100">
                  {selectedBarber ? `${selectedBarber.name} (Cadeira #${selectedBarber.chairNumber})` : "Primeiro Disponível"}
                </span>
              </div>
              <div className="text-xs text-slate-300 flex justify-between">
                <span>Serviços ({selectedServices.length}):</span>
                <span className="font-bold text-slate-100 text-right">
                  {selectedServices.map((s) => s.name).join(", ")}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-200">Valor Total no Caixa:</span>
                <span className="text-xl font-black text-amber-400">
                  {settings.currencySymbol}
                  {totalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
              >
                Voltar
              </button>
              <button
                type="submit"
                id="confirm-booking-submit-btn"
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm transition shadow-lg shadow-amber-500/20 flex items-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>CONFIRMAR AGENDAMENTO</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 5: Ticket de Confirmação */}
      {step === 5 && createdAppointment && (
        <div className="bg-[#181B24] rounded-2xl border border-amber-500/40 p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 mx-auto flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 border border-emerald-300/40">
            <Check className="w-9 h-9 stroke-[3]" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/40">
              Agendamento Confirmado
            </span>
            <h2 className="text-2xl font-black text-slate-100 uppercase tracking-tight mt-2">
              Tudo pronto, {createdAppointment.clientName}!
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Sua reserva foi guardada com sucesso na {settings.name}.
            </p>
          </div>

          {/* Ticket Digital */}
          <div className="max-w-md mx-auto bg-slate-950 rounded-2xl border border-slate-800 p-5 text-left shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                  {settings.name.toUpperCase()}
                </span>
                <h3 className="text-sm font-bold text-slate-100">{createdAppointment.clientName}</h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500">CÓDIGO</span>
                <p className="text-xs font-mono font-bold text-slate-300">{createdAppointment.id.slice(-6).toUpperCase()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 py-3 border-b border-slate-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase">DATA</span>
                <p className="font-bold text-slate-200">{createdAppointment.date}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase">HORÁRIO</span>
                <p className="font-bold text-amber-400">{createdAppointment.timeSlot}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase">BARBEIRO</span>
                <p className="font-bold text-slate-200">{barbers.find((b) => b.id === createdAppointment.barberId)?.name}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase">VALOR</span>
                <p className="font-bold text-slate-200">{settings.currencySymbol}{createdAppointment.totalAmount}</p>
              </div>
            </div>

            <div className="pt-3 text-[11px] text-slate-400 space-y-1">
              <p>📍 {settings.address}</p>
              <p>📞 {settings.phone}</p>
            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleOpenGoogleCalendar}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-blue-500/20"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Adicionar no Google Agenda</span>
            </button>

            <button
              onClick={generateICSFile}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition flex items-center space-x-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Salvar Arquivo (.ics)</span>
            </button>

            <button
              onClick={shareViaWhatsApp}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center space-x-1.5"
            >
              <Share2 className="w-4 h-4" />
              <span>Enviar no WhatsApp</span>
            </button>

            <button
              onClick={() => {
                setStep(1);
                setSelectedServiceIds(["srv-1"]);
                setCreatedAppointment(null);
                setClientName("");
                setClientPhone("");
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition"
            >
              Fazer Outro Agendamento
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
