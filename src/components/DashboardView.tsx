import React, { useState } from "react";
import { useBarber } from "../context/BarberContext";
import {
  Scissors,
  Users,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Play,
  Pause,
  ArrowUpRight,
  TrendingUp,
  UserCheck,
  Coffee,
  MessageSquare,
  Sparkles,
  ShoppingBag,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Award,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { Barber, ChairStatus } from "../types";
import { BarberProductivityChart } from "./BarberProductivityChart";

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  onOpenPOS: (barberId?: string, clientName?: string) => void;
  onOpenNewBooking: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenPOS,
  onOpenNewBooking,
}) => {
  const {
    barbers,
    appointments,
    sales,
    clients,
    settings,
    updateChairStatus,
    startServiceInChair,
  } = useBarber();

  const [walkinClientName, setWalkinClientName] = useState("");
  const [walkinBarberId, setWalkinBarberId] = useState(barbers[0]?.id || "");
  const [showWalkinModal, setShowWalkinModal] = useState(false);

  // Today's Date Str
  const todayStr = new Date().toISOString().split("T")[0];
  const todayAppointments = appointments.filter((a) => a.date === todayStr);
  const inChairAppointments = appointments.filter((a) => a.status === "in_chair");
  const completedTodayCount = appointments.filter(
    (a) => a.date === todayStr && a.status === "completed"
  ).length;

  // Revenue calculation for today
  const todayRevenue = sales.reduce((acc, sale) => acc + sale.finalTotal, 0);
  const avgTicket = sales.length > 0 ? todayRevenue / sales.length : 0;
  const activeChairsCount = barbers.filter((b) => b.chairStatus === "in_chair").length;
  const freeChairsCount = barbers.filter((b) => b.chairStatus === "free").length;
  const breakChairsCount = barbers.filter((b) => b.chairStatus === "break").length;
  const totalChairs = barbers.length || 1;
  const occupancyPercentage = Math.round((activeChairsCount / totalChairs) * 100);

  // Tab state for analytics chart
  const [chartMode, setChartMode] = useState<"productivity" | "hourly">("productivity");

  // Recharts Data: Barber Productivity
  const barberProductivityData = barbers.map((b) => {
    const barberSales = sales.filter((s) => s.barberId === b.id);
    const revenue = barberSales.reduce((acc, s) => acc + s.finalTotal, 0);
    const commission = barberSales.reduce((acc, s) => acc + s.commissionAmount, 0);
    const completedApts = appointments.filter(
      (a) => a.barberId === b.id && a.status === "completed"
    ).length;
    const inChairApts = appointments.filter(
      (a) => a.barberId === b.id && a.status === "in_chair"
    ).length;
    const totalClientsCount = barberSales.length || completedApts + inChairApts;

    return {
      id: b.id,
      name: b.name.split(" ")[0],
      fullName: b.name,
      chair: `Cadeira #${b.chairNumber}`,
      faturamento: Number(revenue.toFixed(2)),
      comissao: Number(commission.toFixed(2)),
      atendimentos: totalClientsCount,
      status: b.chairStatus,
      statusLabel: b.chairStatus === "in_chair" ? "Em Atendimento" : b.chairStatus === "free" ? "Livre" : "Pausa",
    };
  });

  // Recharts Data: Real-time Chair Occupancy Pie
  const chairOccupancyData = [
    {
      name: "Em Atendimento",
      value: activeChairsCount,
      color: "#F59E0B", // amber-500
    },
    {
      name: "Cadeira Livre",
      value: freeChairsCount,
      color: "#10B981", // emerald-500
    },
    {
      name: "Em Pausa",
      value: breakChairsCount,
      color: "#64748B", // slate-500
    },
  ].filter((item) => item.value > 0);

  // Recharts Data: Hourly Distribution & Occupancy during the day
  const hourlyData = [
    { hora: "09:00", clientes: 1, ocupacao: 25 },
    { hora: "10:00", clientes: 2, ocupacao: 50 },
    { hora: "11:00", clientes: 3, ocupacao: 75 },
    { hora: "12:00", clientes: 2, ocupacao: 50 },
    { hora: "13:00", clientes: 1, ocupacao: 25 },
    { hora: "14:00", clientes: activeChairsCount > 0 ? activeChairsCount + 1 : 2, ocupacao: occupancyPercentage || 50 },
    { hora: "15:00", clientes: 3, ocupacao: 75 },
    { hora: "16:00", clientes: 4, ocupacao: 100 },
    { hora: "17:00", clientes: 3, ocupacao: 75 },
    { hora: "18:00", clientes: 4, ocupacao: 100 },
    { hora: "19:00", clientes: 2, ocupacao: 50 },
  ];

  const handleStartWalkin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinClientName.trim()) return;
    startServiceInChair(walkinBarberId, walkinClientName.trim(), 40);
    setWalkinClientName("");
    setShowWalkinModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Golden Hero Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#181B24] via-[#1E1B18] to-[#181B24] rounded-2xl border border-amber-500/30 p-6 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-extrabold uppercase tracking-widest flex items-center space-x-1.5 shadow-sm">
                <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                <span>Painel Principal • Gestão Master</span>
              </span>
              <span className="text-amber-400/60 font-mono text-xs hidden sm:inline">
                {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-400 drop-shadow-sm">
              {settings.name}
            </h1>

            <p className="text-xs sm:text-sm text-amber-200/80 max-w-2xl font-medium leading-relaxed">
              {settings.tagline || "Controle em tempo real de bancadas, produtividade da equipe, fluxo de caixa e visagismo inteligente com IA."}
            </p>
          </div>

          <div className="flex items-center space-x-3 self-start md:self-auto">
            <button
              onClick={() => onNavigate("reports")}
              id="dashboard-open-executive-report-btn"
              className="px-3.5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold transition flex items-center space-x-2 shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Relatório IA</span>
            </button>
            <button
              onClick={() => setShowWalkinModal(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-bold transition flex items-center space-x-2 shadow-lg"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Encaixe Rápido</span>
            </button>
            <button
              onClick={onOpenNewBooking}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 text-xs font-black uppercase tracking-wider transition shadow-lg shadow-amber-500/25 flex items-center space-x-2 transform hover:scale-[1.02]"
            >
              <Calendar className="w-4 h-4 text-slate-950" />
              <span>Novo Agendamento</span>
            </button>
          </div>
        </div>
      </div>

      {/* Upper Operational KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Faturamento do Dia */}
        <div className="bg-[#181B24] rounded-2xl border border-amber-500/20 p-4 shadow-lg flex items-center justify-between hover:border-amber-500/40 transition">
          <div>
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Faturamento Hoje
            </span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">
                {settings.currencySymbol}
                {todayRevenue.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-emerald-400 flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +18%
              </span>
            </div>
            <span className="text-[11px] text-amber-400/70 font-medium">{sales.length} vendas registradas</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Cadeiras em Atendimento */}
        <div className="bg-[#181B24] rounded-2xl border border-amber-500/20 p-4 shadow-lg flex items-center justify-between hover:border-amber-500/40 transition">
          <div>
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Cadeiras Ocupadas
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400">
                {activeChairsCount} / {barbers.length}
              </span>
              <span className="text-xs font-semibold text-amber-400">em corte</span>
            </div>
            <span className="text-[11px] text-amber-400/70 font-medium">
              {barbers.length - activeChairsCount} cadeiras disponíveis
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Scissors className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Agendamentos de Hoje */}
        <div className="bg-[#181B24] rounded-2xl border border-amber-500/20 p-4 shadow-lg flex items-center justify-between hover:border-amber-500/40 transition">
          <div>
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Agenda do Dia
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">
                {todayAppointments.length}
              </span>
              <span className="text-xs font-bold text-emerald-400">
                {completedTodayCount} concluídos
              </span>
            </div>
            <span className="text-[11px] text-amber-400/70 font-medium">
              {todayAppointments.length - completedTodayCount} pendentes
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: Ticket Médio */}
        <div className="bg-[#181B24] rounded-2xl border border-amber-500/20 p-4 shadow-lg flex items-center justify-between hover:border-amber-500/40 transition">
          <div>
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Ticket Médio
            </span>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">
                {settings.currencySymbol}
                {avgTicket.toFixed(2)}
              </span>
            </div>
            <span className="text-[11px] text-amber-400/70 font-medium">Serviços + Pomadas/Varejo</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Section: Master Barber Chairs Live Monitor */}
      <div className="bg-[#181B24] rounded-2xl border border-slate-800 p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-amber-300 uppercase tracking-wide">
                Monitor em Tempo Real das Cadeiras
              </h2>
              <p className="text-xs text-amber-200/70">
                Gerencie barbeiros, clientes em atendimento e liberação de cadeira
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowWalkinModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-amber-500/30 text-amber-300 text-xs font-semibold transition flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Encaixe / Sem Hora</span>
            </button>
            <button
              onClick={onOpenNewBooking}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-bold transition shadow flex items-center space-x-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Novo Agendamento</span>
            </button>
          </div>
        </div>

        {/* Chair Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {barbers.map((barber) => {
            const isInChair = barber.chairStatus === "in_chair";
            const isFree = barber.chairStatus === "free";
            const isBreak = barber.chairStatus === "break";

            return (
              <div
                key={barber.id}
                id={`chair-card-${barber.chairNumber}`}
                className={`rounded-xl p-4 border transition flex flex-col justify-between ${
                  isInChair
                    ? "bg-amber-950/20 border-amber-500/40 shadow-lg ring-1 ring-amber-500/20"
                    : isFree
                    ? "bg-slate-900/60 border-slate-800 hover:border-emerald-500/40"
                    : "bg-slate-900/40 border-slate-800/60 opacity-75"
                }`}
              >
                {/* Chair Header */}
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="relative">
                        <img
                          src={barber.avatar}
                          alt={barber.name}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-xl object-cover border border-slate-700 shadow"
                        />
                        <span
                          className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#181B24] ${
                            isInChair
                              ? "bg-amber-500 animate-pulse"
                              : isFree
                              ? "bg-emerald-500"
                              : "bg-slate-500"
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono text-xs font-bold text-amber-400">
                            #{barber.chairNumber}
                          </span>
                          <h3 className="font-bold text-sm text-slate-100 leading-tight">
                            {barber.name.split(" ")[0]}
                          </h3>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{barber.nickname}</p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        isInChair
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : isFree
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {isInChair ? "Em Corte" : isFree ? "Cadeira Livre" : "Em Pausa"}
                    </span>
                  </div>

                  {/* Active Service Status Details */}
                  {isInChair && (
                    <div className="mt-3 bg-slate-950/80 rounded-xl p-2.5 border border-slate-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Cliente na Cadeira:</span>
                        <span className="font-bold text-slate-200 truncate max-w-[110px]">
                          {barber.currentClientName || "Cliente VIP"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Iniciado às: {barber.serviceStartedAt}</span>
                        <span className="text-amber-400 font-bold flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          ~{barber.estimatedMinutesRemaining}m rest.
                        </span>
                      </div>
                      {/* Animated Progress Bar */}
                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full animate-pulse"
                          style={{ width: "65%" }}
                        />
                      </div>
                    </div>
                  )}

                  {isFree && (
                    <div className="mt-3 py-3 px-2 text-center bg-emerald-950/20 rounded-xl border border-emerald-900/30">
                      <p className="text-xs font-semibold text-emerald-400">
                        Pronto para o próximo cliente
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Comissão do Barbeiro: {Math.round(barber.commissionRate * 100)}%
                      </p>
                    </div>
                  )}

                  {isBreak && (
                    <div className="mt-3 py-3 px-2 text-center bg-slate-950/40 rounded-xl border border-slate-800">
                      <Coffee className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                      <p className="text-xs text-slate-400">Pausa para descanso / almoço</p>
                    </div>
                  )}
                </div>

                {/* Chair Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
                  {isInChair && (
                    <>
                      <button
                        onClick={() => updateChairStatus(barber.id, "free")}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition"
                      >
                        Liberar
                      </button>
                      <button
                        onClick={() => onOpenPOS(barber.id, barber.currentClientName)}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-extrabold transition shadow flex items-center justify-center space-x-1"
                      >
                        <DollarSign className="w-3 h-3" />
                        <span>Cobrar</span>
                      </button>
                    </>
                  )}

                  {isFree && (
                    <>
                      <button
                        onClick={() => {
                          const client = prompt("Nome do cliente para sentar na cadeira:");
                          if (client) startServiceInChair(barber.id, client, 40);
                        }}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition flex items-center justify-center space-x-1"
                      >
                        <Play className="w-3 h-3" />
                        <span>Sentar Cliente</span>
                      </button>
                      <button
                        onClick={() => updateChairStatus(barber.id, "break")}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition"
                        title="Colocar em Pausa"
                      >
                        <Pause className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {isBreak && (
                    <button
                      onClick={() => updateChairStatus(barber.id, "free")}
                      className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition"
                    >
                      Retornar ao Trabalho
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Componente Visual de Produtividade Diária por Barbeiro (Recharts) */}
      <BarberProductivityChart
        barbers={barbers}
        appointments={appointments}
        sales={sales}
        settings={settings}
        onOpenPOS={onOpenPOS}
      />

      {/* Dynamic Recharts Analytics: Fluxo por Hora & Ocupação em Tempo Real */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Hourly Peak Flow Area Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-[#181B24] rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-100 uppercase tracking-wide">
                  Fluxo de Clientes por Horário do Dia
                </h3>
                <p className="text-[11px] text-slate-400">
                  Picos de movimento e taxa de ocupação horária
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-blue-400 self-start sm:self-auto">
              Pico Previsto: 16h - 18h
            </span>
          </div>

          {/* Hourly Area Chart */}
          <div className="h-[230px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOcupacao" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorClientes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#232733" vertical={false} />
                <XAxis
                  dataKey="hora"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#334155" }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#334155" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F1117",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#f8fafc",
                  }}
                  formatter={(val: any, name: any) => {
                    if (name === "ocupacao") return [`${val}%`, "Ocupação da Barbearia"];
                    if (name === "clientes") return [`${val} clientes`, "Atendimentos Simultâneos"];
                    return [val, name];
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                  formatter={(value) => (value === "ocupacao" ? "Ocupação (%)" : "Atendimentos Simultâneos")}
                />
                <Area
                  type="monotone"
                  dataKey="ocupacao"
                  name="ocupacao"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorOcupacao)"
                />
                <Area
                  type="monotone"
                  dataKey="clientes"
                  name="clientes"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorClientes)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Real-time Chair Occupancy & Status Donut (5 Cols) */}
        <div className="lg:col-span-5 bg-[#181B24] rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <PieChartIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-sm text-amber-300 uppercase tracking-wide">
                  Ocupação em Tempo Real
                </h3>
                <p className="text-[11px] text-amber-200/70">
                  {activeChairsCount} de {barbers.length} bancadas operando
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-amber-500/40 text-xs font-mono font-black text-amber-400">
              {occupancyPercentage}% Ocupado
            </span>
          </div>

          {/* Donut Chart with Centered KPI */}
          <div className="relative h-[170px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chairOccupancyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={74}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chairOccupancyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#181B24" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F1117",
                    borderColor: "#334155",
                    borderRadius: "10px",
                    fontSize: "12px",
                    color: "#f8fafc",
                  }}
                  formatter={(val: any, name: any) => [`${val} cadeira(s)`, name]}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Centered KPI Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-amber-300">{occupancyPercentage}%</span>
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-400">
                Taxa de Bancada
              </span>
            </div>
          </div>

          {/* Real-time Status Breakdown Badges */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
            <div className="p-2 rounded-xl bg-amber-950/20 border border-amber-500/30 text-center">
              <span className="text-[10px] font-bold text-amber-400 uppercase block">Em Corte</span>
              <span className="text-base font-black text-amber-200">{activeChairsCount}</span>
            </div>
            <div className="p-2 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-center">
              <span className="text-[10px] font-bold text-emerald-400 uppercase block">Livre</span>
              <span className="text-base font-black text-slate-100">{freeChairsCount}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Pausa</span>
              <span className="text-base font-black text-slate-100">{breakChairsCount}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Today's Real-time Agenda Feed (7 Cols) */}
        <div className="lg:col-span-7 bg-[#181B24] rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <h3 className="font-black text-sm text-amber-300 uppercase tracking-wide">
                Fila de Atendimento &amp; Agenda de Hoje
              </h3>
            </div>
            <button
              onClick={() => onNavigate("appointments")}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-0.5"
            >
              <span>Ver Agenda Completa</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
            {todayAppointments.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                Nenhum agendamento marcado para hoje ainda.
              </div>
            ) : (
              todayAppointments.map((apt) => {
                const barber = barbers.find((b) => b.id === apt.barberId);
                const isInProgress = apt.status === "in_chair";
                const isCompleted = apt.status === "completed";

                return (
                  <div
                    key={apt.id}
                    className={`p-3 rounded-xl border flex items-center justify-between transition ${
                      isInProgress
                        ? "bg-amber-950/20 border-amber-500/40"
                        : isCompleted
                        ? "bg-slate-900/30 border-slate-800/60 opacity-60"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex flex-col items-center justify-center w-12 h-10 rounded-lg bg-slate-950 border border-slate-800 text-center">
                        <span className="text-[11px] font-mono font-bold text-amber-400">
                          {apt.timeSlot}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-xs text-slate-100">{apt.clientName}</h4>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase ${
                              isInProgress
                                ? "bg-amber-500/20 text-amber-300"
                                : isCompleted
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-blue-500/20 text-blue-300"
                            }`}
                          >
                            {apt.status === "in_chair"
                              ? "Em Corte"
                              : apt.status === "completed"
                              ? "Concluído"
                              : "Confirmado"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Barbeiro: <strong className="text-slate-300">{barber?.name}</strong> (Cadeira #{barber?.chairNumber})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-200">
                        {settings.currencySymbol}
                        {apt.totalAmount}
                      </span>
                      {!isCompleted && (
                        <button
                          onClick={() => onOpenPOS(apt.barberId, apt.clientName)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-[11px] font-bold border border-slate-700 transition"
                        >
                          Checkout
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Quick VIP Client Formulas & AI Assistant Trigger (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* AI Haircut Assistant Callout Card */}
          <div className="bg-gradient-to-br from-amber-500/15 via-[#181B24] to-[#181B24] rounded-2xl border border-amber-500/30 p-5 shadow-xl space-y-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-sm text-amber-300 uppercase tracking-wide">
                  Consultor de Estilo &amp; Visagismo IA
                </h3>
                <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider">
                  Potencializado por Gemini 3.7 Flash
                </span>
              </div>
            </div>
            <p className="text-xs text-amber-100/80 leading-relaxed">
              Descubra o corte ideal para cada formato de rosto (Oval, Quadrado, Redondo), texturas de fio, harmonia da barba e instruções técnicas de máquina.
            </p>
            <button
              onClick={() => onNavigate("ai-stylist")}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-1.5"
            >
              <span>Abrir Consultor de Visagismo</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Technical Haircut Formulas */}
          <div className="bg-[#181B24] rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <Scissors className="w-4 h-4 text-amber-400" />
                <h3 className="font-black text-xs text-amber-300 uppercase tracking-wide">
                  Fichas Técnicas Recentes de Clientes
                </h3>
              </div>
              <button
                onClick={() => onNavigate("clients")}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-bold"
              >
                Ver CRM ({clients.length})
              </button>
            </div>

            <div className="space-y-2">
              {clients.slice(0, 2).map((cli) => (
                <div key={cli.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-100">{cli.name}</span>
                    <span className="text-[10px] text-amber-400 font-semibold">
                      {cli.loyaltyStamps}/{settings.loyaltyTarget} Selos
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono line-clamp-2">
                    {cli.haircutFormula || "Sem fórmula técnica registrada."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Walk-in Modal */}
      {showWalkinModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181B24] rounded-2xl border border-slate-700 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 uppercase">
                Check-in de Cliente Sem Hora
              </h3>
              <button
                onClick={() => setShowWalkinModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStartWalkin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome do Cliente *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Matheus Guimarães"
                  value={walkinClientName}
                  onChange={(e) => setWalkinClientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Barbeiro / Cadeira
                </label>
                <select
                  value={walkinBarberId}
                  onChange={(e) => setWalkinBarberId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                >
                  {barbers.map((b) => (
                    <option key={b.id} value={b.id}>
                      Cadeira #{b.chairNumber}: {b.name} ({b.chairStatus === "free" ? "Livre" : "Ocupado"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowWalkinModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow"
                >
                  Iniciar Corte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
