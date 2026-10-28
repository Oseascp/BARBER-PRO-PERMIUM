import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from "recharts";
import {
  BarChart3,
  Trophy,
  Scissors,
  DollarSign,
  Award,
  TrendingUp,
  Percent,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Barber, Appointment, SaleRecord, BarberShopSettings } from "../types";

interface BarberProductivityChartProps {
  barbers: Barber[];
  appointments: Appointment[];
  sales: SaleRecord[];
  settings: BarberShopSettings;
  onOpenPOS?: (barberId?: string) => void;
}

type MetricMode = "all" | "cuts" | "revenue" | "commission";

export const BarberProductivityChart: React.FC<BarberProductivityChartProps> = ({
  barbers,
  appointments,
  sales,
  settings,
  onOpenPOS,
}) => {
  const [metricMode, setMetricMode] = useState<MetricMode>("all");
  const [timeFilter, setTimeFilter] = useState<"today" | "all_time">("today");

  const todayStr = new Date().toISOString().split("T")[0];

  // Calculate metrics per barber
  const productivityData = barbers.map((barber) => {
    // Filter sales based on timeFilter
    const barberSales = sales.filter((s) => {
      if (s.barberId !== barber.id) return false;
      if (timeFilter === "today") {
        return (s.createdAt || "").startsWith(todayStr);
      }
      return true;
    });

    const revenue = barberSales.reduce((acc, s) => acc + s.finalTotal, 0);
    const commission = barberSales.reduce((acc, s) => acc + s.commissionAmount, 0);

    // Filter appointments
    const barberApts = appointments.filter((a) => {
      if (a.barberId !== barber.id) return false;
      if (timeFilter === "today") {
        return a.date === todayStr;
      }
      return true;
    });

    const completedCuts = barberApts.filter((a) => a.status === "completed").length;
    const inChairCuts = barberApts.filter((a) => a.status === "in_chair").length;
    const confirmedCuts = barberApts.filter((a) => a.status === "confirmed").length;

    // Total daily volume
    const totalDailyServices = barberSales.length || (completedCuts + inChairCuts);
    const totalScheduled = barberApts.length;

    const avgTicket = totalDailyServices > 0 ? revenue / totalDailyServices : 0;

    return {
      id: barber.id,
      name: barber.name.split(" ")[0], // First name for chart X-axis
      fullName: barber.name,
      chairNumber: barber.chairNumber,
      avatarUrl: barber.avatarUrl,
      cortes: totalDailyServices,
      cortesConcluidos: completedCuts,
      cortesEmAndamento: inChairCuts,
      cortesAgendados: confirmedCuts,
      faturamento: Number(revenue.toFixed(2)),
      comissao: Number(commission.toFixed(2)),
      ticketMedio: Number(avgTicket.toFixed(2)),
      chairStatus: barber.chairStatus,
    };
  });

  // Calculate top performers
  const sortedByRevenue = [...productivityData].sort((a, b) => b.faturamento - a.faturamento);
  const topRevenueBarber = sortedByRevenue[0]?.faturamento > 0 ? sortedByRevenue[0] : null;

  const sortedByCuts = [...productivityData].sort((a, b) => b.cortes - a.cortes);
  const topCutsBarber = sortedByCuts[0]?.cortes > 0 ? sortedByCuts[0] : null;

  const totalCutsTeam = productivityData.reduce((acc, b) => acc + b.cortes, 0);
  const totalRevenueTeam = productivityData.reduce((acc, b) => acc + b.faturamento, 0);
  const avgCutsPerBarber = barbers.length > 0 ? (totalCutsTeam / barbers.length).toFixed(1) : "0";

  // Colors for bars
  const GOLD_COLOR = "#F59E0B";
  const GREEN_COLOR = "#10B981";
  const BLUE_COLOR = "#3B82F6";
  const PURPLE_COLOR = "#8B5CF6";

  return (
    <div className="bg-[#181B24] rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-start space-x-3">
          <div className="p-3 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-base text-slate-100 uppercase tracking-wide">
                Produtividade Diária dos Barbeiros
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                Recharts Visual
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparativo de atendimentos realizados, receita gerada e comissões da equipe.
            </p>
          </div>
        </div>

        {/* Filters and Metric Switches */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Period Toggle */}
          <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setTimeFilter("today")}
              className={`px-3 py-1 font-bold rounded-lg transition ${
                timeFilter === "today"
                  ? "bg-amber-400 text-slate-950 shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Hoje
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter("all_time")}
              className={`px-3 py-1 font-bold rounded-lg transition ${
                timeFilter === "all_time"
                  ? "bg-amber-400 text-slate-950 shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Geral Acumulado
            </button>
          </div>

          {/* Metric Selector */}
          <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setMetricMode("all")}
              className={`px-2.5 py-1 font-bold rounded-lg transition ${
                metricMode === "all"
                  ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Geral (Cortes & R$)
            </button>
            <button
              type="button"
              onClick={() => setMetricMode("cuts")}
              className={`px-2.5 py-1 font-bold rounded-lg transition ${
                metricMode === "cuts"
                  ? "bg-blue-500 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Cortes
            </button>
            <button
              type="button"
              onClick={() => setMetricMode("revenue")}
              className={`px-2.5 py-1 font-bold rounded-lg transition ${
                metricMode === "revenue"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Faturamento
            </button>
            <button
              type="button"
              onClick={() => setMetricMode("commission")}
              className={`px-2.5 py-1 font-bold rounded-lg transition ${
                metricMode === "commission"
                  ? "bg-emerald-500 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Comissões
            </button>
          </div>
        </div>
      </div>

      {/* Quick Summary Podiums / KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Leader in Revenue */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/30 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
              Líder em Vendas {timeFilter === "today" ? "Hoje" : ""}
            </span>
            <p className="text-xs font-black text-slate-100 truncate">
              {topRevenueBarber ? `${topRevenueBarber.fullName}` : "Aguardando Vendas"}
            </p>
            <span className="text-[11px] text-amber-300 font-bold font-mono">
              {topRevenueBarber ? `${settings.currencySymbol}${topRevenueBarber.faturamento.toFixed(2)}` : "R$ 0,00"}
            </span>
          </div>
        </div>

        {/* Leader in Haircuts */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-blue-500/30 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Scissors className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400">
              Maior Volume de Cortes
            </span>
            <p className="text-xs font-black text-slate-100 truncate">
              {topCutsBarber ? `${topCutsBarber.fullName}` : "Aguardando Cortes"}
            </p>
            <span className="text-[11px] text-blue-300 font-bold font-mono">
              {topCutsBarber ? `${topCutsBarber.cortes} atendimentos` : "0 atendimentos"}
            </span>
          </div>
        </div>

        {/* Team Daily Average */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
              Média da Barbearia
            </span>
            <p className="text-xs font-black text-slate-100">
              {avgCutsPerBarber} cortes / profissional
            </p>
            <span className="text-[11px] text-emerald-300 font-bold font-mono">
              Total equipe: {settings.currencySymbol}{totalRevenueTeam.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Recharts Bar Chart Area */}
      <div className="w-full h-[320px] pt-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={productivityData}
            margin={{ top: 15, right: 15, left: -10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#262C3D" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#94a3b8"
              fontSize={12}
              fontWeight="bold"
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
              tickFormatter={(val) => {
                if (metricMode === "cuts") return `${val}`;
                return `${settings.currencySymbol}${val}`;
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0F1117",
                borderColor: "#334155",
                borderRadius: "14px",
                boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.7)",
                fontSize: "12px",
                color: "#f8fafc",
                padding: "12px 14px",
              }}
              cursor={{ fill: "rgba(245, 158, 11, 0.08)" }}
              formatter={(val: any, name: any) => {
                if (name === "faturamento") return [`${settings.currencySymbol}${Number(val).toFixed(2)}`, "Faturamento Total"];
                if (name === "comissao") return [`${settings.currencySymbol}${Number(val).toFixed(2)}`, "Comissão a Receber"];
                if (name === "cortes") return [`${val} atendimentos`, "Volume de Cortes"];
                if (name === "ticketMedio") return [`${settings.currencySymbol}${Number(val).toFixed(2)}`, "Ticket Médio"];
                return [val, name];
              }}
              labelFormatter={(label, payload) => {
                const item = payload?.[0]?.payload;
                return `💈 ${item?.fullName || label} (Cadeira #${item?.chairNumber || ""})`;
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
              formatter={(value) => {
                if (value === "faturamento") return "Faturamento Gerado (R$)";
                if (value === "comissao") return "Comissão Calculada (R$)";
                if (value === "cortes") return "Atendimentos / Cortes (Qtd)";
                if (value === "ticketMedio") return "Ticket Médio (R$)";
                return value;
              }}
            />

            {/* Mode: ALL (Cortes + Faturamento + Comissão) */}
            {metricMode === "all" && (
              <>
                <Bar
                  dataKey="faturamento"
                  name="faturamento"
                  fill={GOLD_COLOR}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                />
                <Bar
                  dataKey="comissao"
                  name="comissao"
                  fill={GREEN_COLOR}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                />
                <Bar
                  dataKey="cortes"
                  name="cortes"
                  fill={BLUE_COLOR}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                />
              </>
            )}

            {/* Mode: CUTS */}
            {metricMode === "cuts" && (
              <Bar
                dataKey="cortes"
                name="cortes"
                fill={BLUE_COLOR}
                radius={[8, 8, 0, 0]}
                maxBarSize={48}
              >
                {productivityData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.cortes === topCutsBarber?.cortes && entry.cortes > 0 ? "#60A5FA" : BLUE_COLOR}
                  />
                ))}
              </Bar>
            )}

            {/* Mode: REVENUE */}
            {metricMode === "revenue" && (
              <Bar
                dataKey="faturamento"
                name="faturamento"
                fill={GOLD_COLOR}
                radius={[8, 8, 0, 0]}
                maxBarSize={48}
              >
                {productivityData.map((entry, index) => (
                  <Cell
                    key={`cell-rev-${index}`}
                    fill={entry.faturamento === topRevenueBarber?.faturamento && entry.faturamento > 0 ? "#FBBF24" : GOLD_COLOR}
                  />
                ))}
              </Bar>
            )}

            {/* Mode: COMMISSION */}
            {metricMode === "commission" && (
              <Bar
                dataKey="comissao"
                name="comissao"
                fill={GREEN_COLOR}
                radius={[8, 8, 0, 0]}
                maxBarSize={48}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Individual Barber Ranking Mini Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
        {productivityData.map((barberData) => (
          <div
            key={barberData.id}
            className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 transition flex items-center justify-between"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-xs">
                #{barberData.chairNumber}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-200 truncate">
                  {barberData.fullName}
                </p>
                <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                  <Scissors className="w-3 h-3 text-blue-400" />
                  <span>{barberData.cortes} cortes</span>
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-black text-amber-400 font-mono block">
                {settings.currencySymbol}{barberData.faturamento.toFixed(2)}
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold font-mono">
                +{settings.currencySymbol}{barberData.comissao.toFixed(2)} com.
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
