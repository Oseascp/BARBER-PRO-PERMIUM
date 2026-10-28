import React, { useState, useEffect } from "react";
import { useBarber } from "../context/BarberContext";
import { ExecutiveReportData, ExecutiveGrowthRecommendation } from "../types";
import {
  Sparkles,
  TrendingUp,
  BarChart3,
  DollarSign,
  Award,
  AlertTriangle,
  CheckCircle2,
  Target,
  Lightbulb,
  ArrowUpRight,
  Download,
  Printer,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  Calendar,
  Users,
  Scissors,
  Zap,
  ChevronDown,
  ChevronUp,
  Star,
  FileText,
  Percent,
  Layers,
  ArrowRight,
} from "lucide-react";

interface AIExecutiveReportViewProps {
  onBackToFinancials?: () => void;
}

export const AIExecutiveReportView: React.FC<AIExecutiveReportViewProps> = ({
  onBackToFinancials,
}) => {
  const { sales, barbers, appointments, clients, products, settings } = useBarber();

  const [focusStrategy, setFocusStrategy] = useState<string>(
    "Crescimento Geral & Maximização de Lucro"
  );
  const [customGoal, setCustomGoal] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [reportData, setReportData] = useState<ExecutiveReportData | null>(null);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [expandedRecId, setExpandedRecId] = useState<string | null>("rec-1");
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  // Calculations for live payload
  const totalGrossRevenue = sales.reduce((acc, s) => acc + s.finalTotal, 0);
  const totalCommissions = sales.reduce((acc, s) => acc + s.commissionAmount, 0);
  const netShopProfit = totalGrossRevenue - totalCommissions;
  const averageTicket = sales.length > 0 ? totalGrossRevenue / sales.length : 0;
  const profitMargin =
    totalGrossRevenue > 0
      ? `${Math.round((netShopProfit / totalGrossRevenue) * 100)}%`
      : "50%";

  // Breakdown de pagamento
  const paymentMethods = sales.reduce(
    (acc, s) => {
      acc[s.paymentMethod] = (acc[s.paymentMethod] || 0) + s.finalTotal;
      return acc;
    },
    {} as Record<string, number>
  );

  // Breakdown de produtos vs serviços
  let totalProductSales = 0;
  let totalServiceSales = 0;
  sales.forEach((s) => {
    s.items.forEach((item) => {
      if (item.type === "product") {
        totalProductSales += item.price * item.quantity;
      } else {
        totalServiceSales += item.price * item.quantity;
      }
    });
  });

  const barbersPerformance = barbers.map((b) => {
    const barberSales = sales.filter((s) => s.barberId === b.id);
    const revenue = barberSales.reduce((acc, s) => acc + s.finalTotal, 0);
    const commission = barberSales.reduce((acc, s) => acc + s.commissionAmount, 0);
    return {
      name: b.name,
      chairNumber: b.chairNumber,
      chairStatus: b.chairStatus,
      rating: b.rating,
      salesCount: barberSales.length,
      revenue,
      commission,
      netShopRetained: revenue - commission,
    };
  });

  const appointmentMetrics = {
    totalAppointments: appointments.length,
    completed: appointments.filter((a) => a.status === "completed").length,
    confirmedOrInChair: appointments.filter(
      (a) => a.status === "confirmed" || a.status === "in_chair"
    ).length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
  };

  const crmMetrics = {
    totalClients: clients.length,
    vipDiamond: clients.filter((c) => c.vipTier === "diamond").length,
    vipGold: clients.filter((c) => c.vipTier === "gold").length,
    vipSilver: clients.filter((c) => c.vipTier === "silver").length,
    vipBronze: clients.filter((c) => c.vipTier === "bronze").length,
  };

  const productSalesSummary = {
    totalProductRevenue: totalProductSales,
    totalServiceRevenue: totalServiceSales,
    productRevenueShare:
      totalGrossRevenue > 0
        ? `${Math.round((totalProductSales / totalGrossRevenue) * 100)}%`
        : "0%",
    totalProductsInInventory: products.length,
  };

  // Generate Report Function
  const generateReport = async () => {
    setLoading(true);
    setLoadingStep(1);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 700);

    try {
      const payload = {
        shopName: settings.name,
        currencySymbol: settings.currencySymbol || "R$",
        financialSummary: {
          grossRevenue: totalGrossRevenue,
          totalCommissions,
          netShopProfit,
          profitMargin,
          salesCount: sales.length,
          averageTicket,
        },
        barbersPerformance,
        paymentMethods,
        productSalesSummary,
        appointmentMetrics,
        crmMetrics,
        focusStrategy,
        customGoal,
      };

      const response = await fetch("/api/ai/executive-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success && result.data) {
        setReportData(result.data);
      }
    } catch (error) {
      console.error("Erro ao gerar relatório executivo com Gemini:", error);
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
      setLoadingStep(0);
    }
  };

  // Auto-generate on first load if no report exists
  useEffect(() => {
    if (!reportData) {
      generateReport();
    }
  }, []);

  const handleCopySummary = () => {
    if (!reportData) return;
    const text = `📊 RELATÓRIO GERENCIAL EXECUTIVO - ${settings.name.toUpperCase()}\nData: ${reportData.generatedAt}\n\n🏆 Score de Saúde Financeira: ${reportData.financialHealthScore}/100 (${reportData.financialHealthLabel})\n\n💡 Resumo Executivo:\n${reportData.executiveSummary}\n\n📈 Métricas Chave:\n- Faturamento Bruto: ${reportData.keyMetricsDiagnosis.grossRevenue}\n- Margem Líquida: ${reportData.keyMetricsDiagnosis.netProfitMargin}\n- Ticket Médio: ${reportData.keyMetricsDiagnosis.averageTicket}\n\n🎯 Principais Iniciativas de Crescimento:\n${reportData.growthRecommendations.map((r, i) => `${i + 1}. ${r.title} (Impacto: ${r.estimatedRevenueBoost})`).join("\n")}`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleStep = (stepKey: string) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepKey]: !prev[stepKey],
    }));
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner com Identidade Dourada & Gemini */}
      <div className="bg-[#181B24] rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 border border-amber-300/50">
              <Sparkles className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl font-black text-slate-100 uppercase tracking-tight">
                  Relatório Gerencial Inteligente
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>GEMINI 3.7 FLASH</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Diagnóstico financeiro avançado, análise de margens por cadeira e plano estratégico de crescimento
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onBackToFinancials && (
              <button
                onClick={onBackToFinancials}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold transition flex items-center space-x-1.5"
              >
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <span>Ver Livro Caixa</span>
              </button>
            )}

            <button
              onClick={handleCopySummary}
              disabled={!reportData || loading}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition flex items-center space-x-1.5 disabled:opacity-50"
            >
              {copiedSummary ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-amber-400" />
                  <span>Copiar Resumo</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              disabled={!reportData || loading}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Imprimir / PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Seletor Estratégico & Parametrização do Relatório */}
      <div className="bg-[#181B24] rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wide">
              Diretriz da Análise com IA
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Consolidando dados de {sales.length} vendas e {barbers.length} barbeiros ativos
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Foco Estratégico Prioritário
            </label>
            <select
              value={focusStrategy}
              onChange={(e) => setFocusStrategy(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="Crescimento Geral & Maximização de Lucro">Crescimento Geral &amp; Lucratividade</option>
              <option value="Aumento do Ticket Médio & Cross-sell de Produtos">Aumento de Ticket Médio &amp; Produtos</option>
              <option value="Otimização de Cadeiras & Redução de Ociosidade">Otimização de Cadeiras &amp; Horários Ociosos</option>
              <option value="Retenção de Clientes VIP & Recorrência Quinzenal">Retenção de Clientes &amp; Clubes VIP</option>
              <option value="Engajamento e Produtividade da Equipe de Barbeiros">Produtividade &amp; Metas de Barbeiros</option>
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Meta Específica ou Desafio da Gestão
            </label>
            <input
              type="text"
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              placeholder="Ex: Atingir R$ 20k de lucro retido com venda de pomadas"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>

          <div className="md:col-span-1 flex items-end">
            <button
              onClick={generateReport}
              disabled={loading}
              id="recalculate-ai-report-btn"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 disabled:opacity-50 h-[38px]"
            >
              <RefreshCw className={`w-4 h-4 stroke-[2.5] ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Processando..." : "Gerar Novo Diagnóstico IA"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading State com passos progressivos */}
      {loading && (
        <div className="bg-[#181B24] rounded-2xl border border-amber-500/30 p-8 shadow-2xl space-y-6 text-center animate-pulse">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center mx-auto text-amber-400 shadow-xl shadow-amber-500/20">
            <Sparkles className="w-8 h-8 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-100 uppercase tracking-tight">
              Analisando Inteligência Financeira &amp; Operacional
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              O modelo Gemini 3.7 Flash está cruzando dados de comandas, comissões, horários de pico e recorrência de clientes...
            </p>
          </div>

          <div className="max-w-lg mx-auto grid grid-cols-4 gap-2 text-left text-[11px]">
            <div
              className={`p-2.5 rounded-xl border ${
                loadingStep >= 1
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                  : "bg-slate-900 border-slate-800 text-slate-500"
              }`}
            >
              <span className="block font-bold">1. Coleta</span>
              <span className="text-[10px]">Vendas e Caixa</span>
            </div>
            <div
              className={`p-2.5 rounded-xl border ${
                loadingStep >= 2
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                  : "bg-slate-900 border-slate-800 text-slate-500"
              }`}
            >
              <span className="block font-bold">2. Margens</span>
              <span className="text-[10px]">Comissões &amp; Lucro</span>
            </div>
            <div
              className={`p-2.5 rounded-xl border ${
                loadingStep >= 3
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                  : "bg-slate-900 border-slate-800 text-slate-500"
              }`}
            >
              <span className="block font-bold">3. IA Gemini</span>
              <span className="text-[10px]">Diagnóstico CFO</span>
            </div>
            <div
              className={`p-2.5 rounded-xl border ${
                loadingStep >= 4
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                  : "bg-slate-900 border-slate-800 text-slate-500"
              }`}
            >
              <span className="block font-bold">4. Ação</span>
              <span className="text-[10px]">Plano 90 Dias</span>
            </div>
          </div>
        </div>
      )}

      {/* Relatório Renderizado */}
      {!loading && reportData && (
        <div className="space-y-6">
          {/* Card Principal: Score de Saúde & Resumo Executivo */}
          <div className="bg-[#181B24] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6 relative overflow-hidden">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
              {/* Score Circular */}
              <div className="flex items-center space-x-5">
                <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-amber-950/40 border-2 border-amber-500/60 flex flex-col items-center justify-center shadow-xl shadow-amber-500/10">
                  <span className="text-3xl font-black text-amber-400 font-mono tracking-tighter">
                    {reportData.financialHealthScore}
                  </span>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    Score / 100
                  </span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      STATUS FINANCEIRO
                    </span>
                    <span className="text-xs text-slate-400">{reportData.generatedAt}</span>
                  </div>
                  <h2 className="text-lg font-black text-slate-100 uppercase tracking-tight mt-1">
                    {reportData.financialHealthLabel}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Período analisado: {reportData.periodAnalyzed}
                  </p>
                </div>
              </div>

              {/* Badges de Destaque Financeiro */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Faturamento Bruto
                  </span>
                  <span className="text-sm font-black text-slate-100 mt-0.5 block">
                    {reportData.keyMetricsDiagnosis.grossRevenue}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Margem Líquida
                  </span>
                  <span className="text-sm font-black text-emerald-400 mt-0.5 block">
                    {reportData.keyMetricsDiagnosis.netProfitMargin}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Ticket Médio
                  </span>
                  <span className="text-sm font-black text-amber-400 mt-0.5 block">
                    {reportData.keyMetricsDiagnosis.averageTicket}
                  </span>
                </div>
              </div>
            </div>

            {/* Resumo Executivo Narrativo */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <FileText className="w-4 h-4" />
                <span>Síntese Diagnóstica da Diretoria</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {reportData.executiveSummary}
                </p>
              </div>
            </div>
          </div>

          {/* Grid: 6 Métricas Operacionais Diagnósticas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-[#181B24] rounded-2xl border border-slate-800 p-4 shadow-lg flex items-center space-x-3.5">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Faturamento Consolidado
                </span>
                <h4 className="text-base font-black text-slate-100 mt-0.5">
                  {reportData.keyMetricsDiagnosis.grossRevenue}
                </h4>
                <span className="text-[10px] text-slate-400">Comandas e produtos liquidados</span>
              </div>
            </div>

            <div className="bg-[#181B24] rounded-2xl border border-slate-800 p-4 shadow-lg flex items-center space-x-3.5">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Retenção Líquida da Casa
                </span>
                <h4 className="text-base font-black text-emerald-400 mt-0.5">
                  {reportData.keyMetricsDiagnosis.netProfitMargin}
                </h4>
                <span className="text-[10px] text-slate-400">Após dedução de repasses</span>
              </div>
            </div>

            <div className="bg-[#181B24] rounded-2xl border border-slate-800 p-4 shadow-lg flex items-center space-x-3.5">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Ticket Médio por Cliente
                </span>
                <h4 className="text-base font-black text-slate-100 mt-0.5">
                  {reportData.keyMetricsDiagnosis.averageTicket}
                </h4>
                <span className="text-[10px] text-slate-400">Serviços somados a produtos</span>
              </div>
            </div>

            <div className="bg-[#181B24] rounded-2xl border border-slate-800 p-4 shadow-lg flex items-center space-x-3.5">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Scissors className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Ocupação das Cadeiras
                </span>
                <h4 className="text-base font-black text-slate-100 mt-0.5">
                  {reportData.keyMetricsDiagnosis.chairUtilizationRate}
                </h4>
                <span className="text-[10px] text-slate-400">Eficiência de uso do espaço</span>
              </div>
            </div>

            <div className="bg-[#181B24] rounded-2xl border border-slate-800 p-4 shadow-lg flex items-center space-x-3.5">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Venda de Produtos (Cross-sell)
                </span>
                <h4 className="text-base font-black text-slate-100 mt-0.5">
                  {reportData.keyMetricsDiagnosis.productSalesRatio}
                </h4>
                <span className="text-[10px] text-slate-400">Pomadas, óleos e shampoos</span>
              </div>
            </div>

            <div className="bg-[#181B24] rounded-2xl border border-slate-800 p-4 shadow-lg flex items-center space-x-3.5">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Taxa de Retorno de Clientes
                </span>
                <h4 className="text-base font-black text-emerald-400 mt-0.5">
                  {reportData.keyMetricsDiagnosis.customerRetentionRate}
                </h4>
                <span className="text-[10px] text-slate-400">Clientes recorrentes &amp; VIP</span>
              </div>
            </div>
          </div>

          {/* Matriz Estratégica: Pontos Fortes vs Vulnerabilidades */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pontos Fortes */}
            <div className="bg-[#181B24] rounded-2xl border border-emerald-500/20 p-5 shadow-xl space-y-3">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-xs text-slate-100 uppercase tracking-wide">
                  Alavancas &amp; Pontos Fortes
                </h3>
              </div>
              <ul className="space-y-2">
                {reportData.keyStrengths.map((str, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Vulnerabilidades */}
            <div className="bg-[#181B24] rounded-2xl border border-amber-500/20 p-5 shadow-xl space-y-3">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-xs text-slate-100 uppercase tracking-wide">
                  Gargalos &amp; Dinheiro na Mesa
                </h3>
              </div>
              <ul className="space-y-2">
                {reportData.criticalVulnerabilities.map((vuln, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span>{vuln}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Plano de Ação de Crescimento Recomendado pelo Gemini */}
          <div className="bg-[#181B24] rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wide">
                  Iniciativas Estratégicas de Crescimento
                </h3>
              </div>
              <span className="text-xs text-amber-400 font-bold">
                {reportData.growthRecommendations.length} Ações Prioritárias
              </span>
            </div>

            <div className="space-y-3">
              {reportData.growthRecommendations.map((rec) => {
                const isExpanded = expandedRecId === rec.id;
                return (
                  <div
                    key={rec.id}
                    className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden transition"
                  >
                    <div
                      onClick={() => setExpandedRecId(isExpanded ? null : rec.id)}
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition gap-4"
                    >
                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-black uppercase shrink-0 ${
                            rec.impact === "high"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : rec.impact === "quick_win"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                          }`}
                        >
                          {rec.impact === "high"
                            ? "Alto Impacto"
                            : rec.impact === "quick_win"
                            ? "Ganho Rápido"
                            : "Médio Impacto"}
                        </span>
                        <div>
                          <h4 className="font-bold text-xs text-slate-100">{rec.title}</h4>
                          <div className="flex items-center space-x-3 text-[10px] text-slate-400 mt-0.5">
                            <span>Prazo: {rec.timeframe}</span>
                            <span>•</span>
                            <span>Complexidade: {rec.difficulty}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 shrink-0">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-black text-xs">
                          {rec.estimatedRevenueBoost}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-4 border-t border-slate-800 bg-slate-950 space-y-3 text-xs">
                        <p className="text-slate-300 leading-relaxed">{rec.description}</p>

                        <div className="space-y-2 pt-2">
                          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                            Passos Práticos de Execução:
                          </span>
                          <div className="space-y-1.5">
                            {rec.actionSteps.map((step, sIdx) => {
                              const stepKey = `${rec.id}-${sIdx}`;
                              const isChecked = !!completedSteps[stepKey];
                              return (
                                <div
                                  key={sIdx}
                                  onClick={() => toggleStep(stepKey)}
                                  className="flex items-start space-x-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition"
                                >
                                  <div
                                    className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                                      isChecked
                                        ? "bg-amber-500 border-amber-400 text-slate-950"
                                        : "border-slate-700 bg-slate-950"
                                    }`}
                                  >
                                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <span
                                    className={`text-xs ${
                                      isChecked
                                        ? "line-through text-slate-500"
                                        : "text-slate-200"
                                    }`}
                                  >
                                    {step}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Combos Inteligentes & Otimização de Margem */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-[#181B24] rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wide">
                  Estratégia de Precificação &amp; Combos Sugeridos
                </h3>
              </div>

              <div className="space-y-3">
                {reportData.strategicPricingInsights.suggestedCombos.map((combo, cIdx) => (
                  <div
                    key={cIdx}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-100">{combo.name}</h4>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black">
                        {combo.suggestedPrice}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{combo.why}</p>
                    <div className="flex items-center space-x-1 text-[10px] text-emerald-400 font-semibold">
                      <span>Projeção de adoção:</span>
                      <span>{combo.projectedAdoption}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200/90 leading-relaxed">
                <span className="font-bold text-amber-300 block mb-0.5">Dica de Margem Líquida:</span>
                {reportData.strategicPricingInsights.marginOptimizationTip}
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#181B24] rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 mb-3">
                  <Award className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wide">
                    Equipe &amp; Produtividade de Cadeiras
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Desempenho da Bancada
                    </span>
                    <p className="text-slate-300">
                      {reportData.barberTeamPerformanceInsight.topPerformer}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Ritmo &amp; Ocupação
                    </span>
                    <p className="text-slate-300">
                      {reportData.barberTeamPerformanceInsight.occupancyObservation}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Premiação &amp; Metas
                    </span>
                    <p className="text-slate-300">
                      {reportData.barberTeamPerformanceInsight.incentiveSuggestion}
                    </p>
                  </div>
                </div>
              </div>

              {/* Projeção 90 dias */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-amber-950/40 border border-amber-500/40 mt-3">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
                  Projeção 90 Dias com o Plano
                </span>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className="text-lg font-black text-slate-100">
                    {reportData.growthForecast90Days.recommendedScenarioGrowth}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    (Conservador: {reportData.growthForecast90Days.conservativeGrowth})
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                  {reportData.growthForecast90Days.projectionSummary}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
