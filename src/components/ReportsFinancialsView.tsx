import React, { useState } from "react";
import { useBarber } from "../context/BarberContext";
import { AIExecutiveReportView } from "./AIExecutiveReportView";
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  CreditCard,
  Users,
  Scissors,
  Download,
  Calendar,
  CheckCircle2,
  PieChart,
  ArrowUpRight,
  Sparkles,
  Award,
  Layers,
  Lightbulb,
} from "lucide-react";

export const ReportsFinancialsView: React.FC = () => {
  const { sales, barbers, settings } = useBarber();

  const [activeSubTab, setActiveSubTab] = useState<"financials" | "ai-executive">("financials");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("today");

  // Totais
  const totalGrossRevenue = sales.reduce((acc, s) => acc + s.finalTotal, 0);
  const totalCommissions = sales.reduce((acc, s) => acc + s.commissionAmount, 0);
  const netShopProfit = totalGrossRevenue - totalCommissions;

  // Breakdown por Barbeiro
  const barberPerformance = barbers.map((b) => {
    const barberSales = sales.filter((s) => s.barberId === b.id);
    const revenue = barberSales.reduce((acc, s) => acc + s.finalTotal, 0);
    const commission = barberSales.reduce((acc, s) => acc + s.commissionAmount, 0);
    return {
      barber: b,
      salesCount: barberSales.length,
      revenue,
      commission,
    };
  });

  // Exportar CSV simples
  const exportCSV = () => {
    const headers = "ID,Data,Cliente,Barbeiro,Metodo,Subtotal,Desconto,Gorjeta,Total,Comissao\n";
    const rows = sales
      .map(
        (s) =>
          `"${s.id}","${s.createdAt}","${s.clientName}","${barbers.find((b) => b.id === s.barberId)?.name || ""}","${s.paymentMethod}",${s.subtotal},${s.discount},${s.tip},${s.finalTotal},${s.commissionAmount}`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `relatorio-financeiro-barberpro-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (activeSubTab === "ai-executive") {
    return <AIExecutiveReportView onBackToFinancials={() => setActiveSubTab("financials")} />;
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header com Abas de Navegação */}
      <div className="bg-[#181B24] rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wide">
              Relatórios Financeiros &amp; Repasse de Comissões
            </h2>
            <p className="text-xs text-slate-400">
              Acompanhamento de fluxo de caixa, divisões por barbeiro e lucro líquido
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sub Tab Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setActiveSubTab("financials")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeSubTab === "financials"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Livro Caixa
            </button>
            <button
              onClick={() => setActiveSubTab("ai-executive")}
              id="open-ai-executive-report-tab"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                activeSubTab === "ai-executive"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "text-amber-400 hover:text-amber-300"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Relatório IA</span>
            </button>
          </div>

          <button
            onClick={exportCSV}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Banner de Acesso Rápido ao Relatório Gerencial Inteligente */}
      <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-amber-950/30 rounded-2xl border border-amber-500/30 p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 shrink-0">
            <Sparkles className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-black text-slate-100 uppercase tracking-tight">
                Relatório Gerencial Inteligente (Gemini 3.7 Flash)
              </h3>
              <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                NOVO
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Obtenha um diagnóstico executivo completo com score financeiro, análise de ociosidade de cadeiras e 4 planos de ação estratégicos para alavancar a receita.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveSubTab("ai-executive")}
          id="launch-ai-executive-report-btn"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20 flex items-center space-x-2 shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Acessar Relatório Inteligente</span>
        </button>
      </div>

      {/* 4 Cards de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#181B24] rounded-2xl border border-slate-800 p-4 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Faturamento Bruto
          </span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-2xl font-black text-slate-100">
              {settings.currencySymbol}
              {totalGrossRevenue.toFixed(2)}
            </span>
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
            {sales.length} vendas registradas
          </span>
        </div>

        <div className="bg-[#181B24] rounded-2xl border border-slate-800 p-4 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Comissões dos Barbeiros
          </span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-2xl font-black text-amber-400">
              {settings.currencySymbol}
              {totalCommissions.toFixed(2)}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Repasses automáticos aos barbeiros</span>
        </div>

        <div className="bg-[#181B24] rounded-2xl border border-slate-800 p-4 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Lucro Líquido da Barbearia
          </span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-2xl font-black text-emerald-400">
              {settings.currencySymbol}
              {netShopProfit.toFixed(2)}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Após retenção de comissões</span>
        </div>

        <div className="bg-[#181B24] rounded-2xl border border-slate-800 p-4 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Ticket Médio por Venda
          </span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-2xl font-black text-slate-100">
              {settings.currencySymbol}
              {sales.length > 0 ? (totalGrossRevenue / sales.length).toFixed(2) : "0.00"}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Média de cortes + produtos</span>
        </div>
      </div>

      {/* Desempenho por Barbeiro & Repasses */}
      <div className="bg-[#181B24] rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Scissors className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wide">
              Desempenho &amp; Comissões por Barbeiro
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {barberPerformance.map(({ barber, salesCount, revenue, commission }) => (
            <div
              key={barber.id}
              className="bg-slate-900/60 rounded-xl border border-slate-800 p-4 space-y-3"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={barber.avatar}
                  alt={barber.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-xl object-cover border border-slate-700 shadow"
                />
                <div>
                  <h4 className="font-bold text-sm text-slate-100 leading-tight">{barber.name}</h4>
                  <span className="text-[11px] text-amber-400 font-semibold">
                    Cadeira #{barber.chairNumber} ({Math.round(barber.commissionRate * 100)}% Comissão)
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Atendimentos:</span>
                  <span className="font-bold text-slate-200">{salesCount} clientes</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Produção Total:</span>
                  <span className="font-bold text-slate-200">
                    {settings.currencySymbol}{revenue.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800 text-xs">
                  <span className="text-amber-400 font-semibold">Comissão a Pagar:</span>
                  <span className="text-sm font-black text-amber-400">
                    {settings.currencySymbol}{commission.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => alert(`Comissão de ${barber.name} no valor de ${settings.currencySymbol}${commission.toFixed(2)} marcada como paga.`)}
                className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                Registrar Repasse
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Histórico Recente de Comandas */}
      <div className="bg-[#181B24] rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wide">
              Histórico de Vendas &amp; Comandas
            </h3>
          </div>
          <span className="text-xs text-slate-400">{sales.length} vendas registradas</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">Hora</th>
                <th className="pb-3 font-semibold">Cliente</th>
                <th className="pb-3 font-semibold">Barbeiro</th>
                <th className="pb-3 font-semibold">Itens</th>
                <th className="pb-3 font-semibold">Pagamento</th>
                <th className="pb-3 font-semibold text-right">Comissão</th>
                <th className="pb-3 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sales.slice(0, 10).map((sale) => {
                const barber = barbers.find((b) => b.id === sale.barberId);
                return (
                  <tr key={sale.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 font-mono text-slate-400">{sale.createdAt}</td>
                    <td className="py-3 font-bold text-slate-100">{sale.clientName}</td>
                    <td className="py-3 text-slate-300">{barber?.name}</td>
                    <td className="py-3 text-slate-400">
                      {sale.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                        {sale.paymentMethod === "pix"
                          ? "PIX"
                          : sale.paymentMethod === "credit_card"
                          ? "Crédito"
                          : sale.paymentMethod === "debit_card"
                          ? "Débito"
                          : "Dinheiro"}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono text-amber-400">
                      {settings.currencySymbol}{sale.commissionAmount.toFixed(2)}
                    </td>
                    <td className="py-3 text-right font-bold font-mono text-slate-100">
                      {settings.currencySymbol}{sale.finalTotal.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
