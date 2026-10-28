import React, { useState } from "react";
import { useBarber } from "../context/BarberContext";
import {
  Users,
  Search,
  Plus,
  Star,
  Scissors,
  Coffee,
  MessageSquare,
  Award,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Edit2,
  Check,
  Download,
  FileSpreadsheet,
  Crown,
  Medal,
  Shield,
  Sparkles,
  TrendingUp,
  Gift,
  HelpCircle,
  Zap,
  Info,
  ChevronRight,
} from "lucide-react";
import confetti from "canvas-confetti";
import { ClientRecord, VIPTier } from "../types";

export interface LoyaltyBadgeInfo {
  tier: "bronze" | "silver" | "gold" | "diamond";
  name: string;
  badgeTitle: string;
  emoji: string;
  accentColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  cardGlow: string;
  iconBg: string;
  perks: string[];
  nextTier?: {
    name: string;
    emoji: string;
    visitsNeeded: number;
    spentNeeded: number;
    progressPercent: number;
  };
  achievements: { id: string; title: string; icon: string }[];
}

export const getClientLoyaltyBadge = (client: ClientRecord, currencySymbol: string = "R$"): LoyaltyBadgeInfo => {
  const visits = client.totalVisits || 0;
  const spent = client.totalSpent || 0;

  const achievements: { id: string; title: string; icon: string }[] = [];
  if (visits >= 10) achievements.push({ id: "assiduo", title: "Cliente Assíduo (10+ Visitas)", icon: "🔥" });
  if (spent >= 500) achievements.push({ id: "investor", title: `Gasto VIP (${currencySymbol} 500+)`, icon: "💎" });
  if (client.loyaltyStamps >= 8) achievements.push({ id: "stamps", title: "Reta Final Fidelidade", icon: "🎁" });
  if (client.haircutFormula && client.haircutFormula.length > 10) achievements.push({ id: "formula", title: "Ficha Visagista Ativa", icon: "✂️" });

  // Regra de Classificação de Medalha
  if (visits >= 15 || spent >= 1000 || client.vipTier === "diamond") {
    return {
      tier: "diamond",
      name: "Diamante",
      badgeTitle: "Medalha Diamante Imperial",
      emoji: "💎",
      accentColor: "text-purple-300",
      badgeBg: "bg-gradient-to-r from-purple-950/80 via-purple-900/60 to-indigo-950/80",
      badgeBorder: "border-purple-500/60",
      badgeText: "text-purple-200",
      cardGlow: "hover:border-purple-500/50 hover:shadow-purple-500/10",
      iconBg: "from-purple-500 via-indigo-500 to-purple-700 text-white shadow-purple-500/30",
      perks: [
        "Lounge VIP & Bebida Premium Liberada",
        "15% OFF em toda linha de cosméticos",
        "Barboterapia Cortesia no Mês de Aniversário",
        "Prioridade Máxima na Cadeira Master",
      ],
      achievements,
    };
  }

  if (visits >= 10 || spent >= 500 || client.vipTier === "gold") {
    const visitsToDiamond = Math.max(0, 15 - visits);
    const spentToDiamond = Math.max(0, 1000 - spent);
    const progress = Math.min(100, Math.round(Math.max((visits - 10) / 5, (spent - 500) / 500) * 100));

    return {
      tier: "gold",
      name: "Ouro",
      badgeTitle: "Medalha de Ouro Elite",
      emoji: "🥇",
      accentColor: "text-amber-300",
      badgeBg: "bg-gradient-to-r from-amber-950/80 via-amber-900/60 to-yellow-950/80",
      badgeBorder: "border-amber-500/60",
      badgeText: "text-amber-200",
      cardGlow: "hover:border-amber-500/50 hover:shadow-amber-500/10",
      iconBg: "from-amber-400 via-amber-500 to-amber-600 text-slate-950 shadow-amber-500/30",
      perks: [
        "10% OFF em Pomadas e Óleos de Barba",
        "Café Espresso Especial ou Cerveja Gelada",
        "Sobrancelha ou Alinhamento Cortesia",
        "Prioridade na Lista de Espera",
      ],
      nextTier: {
        name: "Diamante Imperial",
        emoji: "💎",
        visitsNeeded: visitsToDiamond,
        spentNeeded: spentToDiamond,
        progressPercent: progress,
      },
      achievements,
    };
  }

  if (visits >= 5 || spent >= 250 || client.vipTier === "silver") {
    const visitsToGold = Math.max(0, 10 - visits);
    const spentToGold = Math.max(0, 500 - spent);
    const progress = Math.min(100, Math.round(Math.max((visits - 5) / 5, (spent - 250) / 250) * 100));

    return {
      tier: "silver",
      name: "Prata",
      badgeTitle: "Medalha de Prata Master",
      emoji: "🥈",
      accentColor: "text-slate-200",
      badgeBg: "bg-gradient-to-r from-slate-800/80 via-slate-700/60 to-slate-800/80",
      badgeBorder: "border-slate-400/60",
      badgeText: "text-slate-100",
      cardGlow: "hover:border-slate-400/50 hover:shadow-slate-400/10",
      iconBg: "from-slate-300 via-slate-400 to-slate-500 text-slate-950 shadow-slate-400/20",
      perks: [
        "5% OFF em Produtos de Bancada",
        "Café Espresso Duplo de Boas-Vindas",
        "Garantia de Horário com Barbeiro Preferido",
      ],
      nextTier: {
        name: "Ouro Elite",
        emoji: "🥇",
        visitsNeeded: visitsToGold,
        spentNeeded: spentToGold,
        progressPercent: progress,
      },
      achievements,
    };
  }

  // Bronze
  const visitsToSilver = Math.max(0, 5 - visits);
  const spentToSilver = Math.max(0, 250 - spent);
  const progress = Math.min(100, Math.round(Math.max(visits / 5, spent / 250) * 100));

  return {
    tier: "bronze",
    name: "Bronze",
    badgeTitle: "Medalha de Bronze Pioneer",
    emoji: "🥉",
    accentColor: "text-amber-400",
    badgeBg: "bg-gradient-to-r from-amber-950/40 via-stone-900/60 to-amber-950/40",
    badgeBorder: "border-amber-700/50",
    badgeText: "text-amber-300",
    cardGlow: "hover:border-amber-700/50",
    iconBg: "from-amber-700 via-amber-800 to-stone-800 text-amber-200 shadow-amber-900/20",
    perks: [
      "Cartão Fidelidade Digital com 10 Selos",
      "Ficha Técnica de Corte Personalizada",
      "Café de Cortesia na Cadeira",
    ],
    nextTier: {
      name: "Prata Master",
      emoji: "🥈",
      visitsNeeded: visitsToSilver,
      spentNeeded: spentToSilver,
      progressPercent: progress,
    },
    achievements,
  };
};

export const ClientsCRMView: React.FC = () => {
  const { clients, barbers, settings, addLoyaltyStamp, addClient, updateClient } = useBarber();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedMedalFilter, setSelectedMedalFilter] = useState<string>("all");
  const [showAddClientModal, setShowAddClientModal] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [editingClient, setEditingClient] = useState<ClientRecord | null>(null);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  // Formulário de Cliente
  const [newClientName, setNewClientName] = useState<string>("");
  const [newClientPhone, setNewClientPhone] = useState<string>("");
  const [newClientEmail, setNewClientEmail] = useState<string>("");
  const [newClientFormula, setNewClientFormula] = useState<string>("");
  const [newClientFavBarber, setNewClientFavBarber] = useState<string>(barbers[0]?.id || "barber-1");
  const [newClientBeverage, setNewClientBeverage] = useState<string>("Café Espresso Duplo");
  const [newClientTier, setNewClientTier] = useState<VIPTier>("bronze");
  const [newClientNotes, setNewClientNotes] = useState<string>("");

  // Map each client with badge info
  const clientsWithBadges = clients.map((c) => ({
    ...c,
    badgeInfo: getClientLoyaltyBadge(c, settings.currencySymbol || "R$"),
  }));

  // Counts by medal tier
  const goldCount = clientsWithBadges.filter((c) => c.badgeInfo.tier === "gold").length;
  const silverCount = clientsWithBadges.filter((c) => c.badgeInfo.tier === "silver").length;
  const bronzeCount = clientsWithBadges.filter((c) => c.badgeInfo.tier === "bronze").length;
  const diamondCount = clientsWithBadges.filter((c) => c.badgeInfo.tier === "diamond").length;

  const filteredClients = clientsWithBadges.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.haircutFormula && c.haircutFormula.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesMedal = selectedMedalFilter === "all" || c.badgeInfo.tier === selectedMedalFilter;
    return matchesSearch && matchesMedal;
  });

  const handlePunchStamp = (client: ClientRecord) => {
    addLoyaltyStamp(client.id);
    if (client.loyaltyStamps + 1 >= settings.loyaltyTarget) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          colors: ["#F59E0B", "#10B981", "#ffffff", "#EAB308"],
        });
      } catch (e) {
        // ignore
      }
    }
  };

  const handleOpenWhatsApp = (client: ClientRecord) => {
    const badge = getClientLoyaltyBadge(client, settings.currencySymbol || "R$");
    const text = encodeURIComponent(
      `Olá ${client.name}! 💈 Aqui é da ${settings.name}.\nVocê é nosso cliente com ${badge.badgeTitle} ${badge.emoji} com ${client.totalVisits} visitas e ${client.loyaltyStamps}/${settings.loyaltyTarget} selos no Cartão Fidelidade!\nQue tal renovar seu visual esta semana e aproveitar seus benefícios exclusivos? Responda para confirmar seu horário!`
    );
    window.open(`https://wa.me/${client.phone.replace(/[^0-9]/g, "")}?text=${text}`, "_blank");
  };

  // Função de Exportação de Clientes em CSV com suporte a UTF-8 BOM
  const handleExportCSV = (onlyMedalVIP: boolean = false) => {
    const listToExport = onlyMedalVIP
      ? clientsWithBadges.filter((c) => c.badgeInfo.tier === "gold" || c.badgeInfo.tier === "diamond" || c.badgeInfo.tier === "silver")
      : filteredClients;

    if (listToExport.length === 0) {
      alert("Nenhum cliente encontrado para exportação.");
      return;
    }

    const headers = [
      "ID",
      "Nome Completo",
      "Telefone / WhatsApp",
      "E-mail",
      "Medalha de Fidelidade",
      "Nível VIP",
      "Selos Fidelidade",
      "Meta Fidelidade",
      "Corte Grátis Disponível",
      "Total de Visitas",
      "Total Gasto (R$)",
      "Barbeiro Preferido",
      "Bebida Preferida",
      "Ficha Técnica de Corte",
      "Observações",
    ];

    const escapeCSV = (value: string | number | undefined | null) => {
      if (value === undefined || value === null) return '""';
      const str = String(value).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = listToExport.map((client) => {
      const barber = barbers.find((b) => b.id === client.favoriteBarberId);
      const isRewardReady = client.loyaltyStamps >= settings.loyaltyTarget ? "SIM" : "NÃO";

      return [
        escapeCSV(client.id),
        escapeCSV(client.name),
        escapeCSV(client.phone),
        escapeCSV(client.email || ""),
        escapeCSV(`${client.badgeInfo.badgeTitle} (${client.badgeInfo.name})`),
        escapeCSV(client.vipTier.toUpperCase()),
        escapeCSV(client.loyaltyStamps),
        escapeCSV(settings.loyaltyTarget),
        escapeCSV(isRewardReady),
        escapeCSV(client.totalVisits),
        escapeCSV(client.totalSpent.toFixed(2)),
        escapeCSV(barber ? barber.name : "Qualquer"),
        escapeCSV(client.preferredBeverage || ""),
        escapeCSV(client.haircutFormula || ""),
        escapeCSV(client.notes || ""),
      ].join(";");
    });

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);
    const suffix = onlyMedalVIP ? "medalhas-vip" : selectedMedalFilter !== "all" ? `medalha-${selectedMedalFilter}` : "lista-completa";
    link.setAttribute("href", url);
    link.setAttribute("download", `clientes-${suffix}-${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportSuccessMessage(`Planilha CSV exportada com sucesso (${listToExport.length} clientes com medalhas)!`);
    setTimeout(() => setExportSuccessMessage(null), 4000);
  };

  const handleSaveNewClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim() || !newClientPhone.trim()) return;

    if (editingClient) {
      updateClient({
        ...editingClient,
        name: newClientName.trim(),
        phone: newClientPhone.trim(),
        email: newClientEmail.trim(),
        haircutFormula: newClientFormula.trim(),
        favoriteBarberId: newClientFavBarber,
        preferredBeverage: newClientBeverage,
        vipTier: newClientTier,
        notes: newClientNotes.trim(),
      });
      setEditingClient(null);
    } else {
      addClient({
        name: newClientName.trim(),
        phone: newClientPhone.trim(),
        email: newClientEmail.trim(),
        haircutFormula: newClientFormula.trim() || "Mid skin fade com pente #0.5 na base, topo texturizado",
        favoriteBarberId: newClientFavBarber,
        preferredBeverage: newClientBeverage,
        vipTier: newClientTier,
        notes: newClientNotes.trim(),
      });
    }

    setShowAddClientModal(false);
    resetForm();
  };

  const resetForm = () => {
    setNewClientName("");
    setNewClientPhone("");
    setNewClientEmail("");
    setNewClientFormula("");
    setNewClientFavBarber(barbers[0]?.id || "barber-1");
    setNewClientBeverage("Café Espresso Duplo");
    setNewClientTier("bronze");
    setNewClientNotes("");
    setEditingClient(null);
  };

  const openEditModal = (client: ClientRecord) => {
    setEditingClient(client);
    setNewClientName(client.name);
    setNewClientPhone(client.phone);
    setNewClientEmail(client.email || "");
    setNewClientFormula(client.haircutFormula || "");
    setNewClientFavBarber(client.favoriteBarberId);
    setNewClientBeverage(client.preferredBeverage || "Café Espresso Duplo");
    setNewClientTier(client.vipTier);
    setNewClientNotes(client.notes || "");
    setShowAddClientModal(true);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header & CRM Controls */}
      <div className="bg-[#181B24] rounded-2xl border border-slate-800 p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black text-amber-300 uppercase tracking-wide">
                  CRM de Clientes &amp; Níveis de Fidelidade
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Medalhas Virtuais
                </span>
              </div>
              <p className="text-xs text-amber-200/70">
                Badges de Ouro, Prata e Bronze calculadas por histórico de visitas, gastos e benefícios VIP
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            {/* Botão de Ver Regras dos Níveis */}
            <button
              onClick={() => setShowRulesModal(true)}
              id="view-loyalty-rules-btn"
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs transition shadow flex items-center space-x-1.5"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Regras de Medalhas</span>
            </button>

            {/* Botão de Exportar Medalhas VIPs em CSV */}
            <button
              onClick={() => handleExportCSV(true)}
              title="Baixar lista segmentada de clientes com Medalhas de Ouro, Prata e Diamante"
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 hover:text-amber-200 font-bold text-xs transition shadow flex items-center space-x-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-400" />
              <span>Exportar VIPs (CSV)</span>
            </button>

            {/* Cadastrar Novo Cliente */}
            <button
              onClick={() => {
                resetForm();
                setShowAddClientModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20 flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Novo Cliente</span>
            </button>
          </div>
        </div>

        {/* Feedback de Exportação */}
        {exportSuccessMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{exportSuccessMessage}</span>
            </div>
            <span className="text-[10px] text-emerald-400/80 font-mono">Compatível com Excel, Google Planilhas &amp; WhatsApp Marketing</span>
          </div>
        )}
      </div>

      {/* Grid de Cards de Resumo dos Níveis de Fidelidade / Medalhas Virtuais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Badge Ouro */}
        <div
          onClick={() => setSelectedMedalFilter(selectedMedalFilter === "gold" ? "all" : "gold")}
          className={`cursor-pointer rounded-2xl border p-4 transition shadow-lg relative overflow-hidden flex flex-col justify-between ${
            selectedMedalFilter === "gold"
              ? "bg-gradient-to-br from-amber-950/90 via-amber-900/50 to-slate-900 border-amber-400 ring-2 ring-amber-400/40"
              : "bg-[#181B24] border-amber-500/30 hover:border-amber-400/70"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 font-black text-lg shadow-md shadow-amber-500/20 border border-amber-300">
              🥇
            </div>
            <span className="text-2xl font-black text-amber-400 font-mono">{goldCount}</span>
          </div>
          <div className="mt-3">
            <div className="flex items-center space-x-1">
              <h4 className="text-xs font-black text-slate-100 uppercase tracking-tight">Medalha de Ouro</h4>
              <Crown className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="text-[10px] text-amber-200/80 mt-0.5">10+ Visitas ou {settings.currencySymbol} 500+ gastos</p>
            <span className="inline-block mt-1 text-[9px] font-bold text-amber-400/90 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40">
              10% OFF + Bebida + Aniversário
            </span>
          </div>
        </div>

        {/* Badge Prata */}
        <div
          onClick={() => setSelectedMedalFilter(selectedMedalFilter === "silver" ? "all" : "silver")}
          className={`cursor-pointer rounded-2xl border p-4 transition shadow-lg relative overflow-hidden flex flex-col justify-between ${
            selectedMedalFilter === "silver"
              ? "bg-gradient-to-br from-slate-800/90 via-slate-700/50 to-slate-900 border-slate-300 ring-2 ring-slate-300/40"
              : "bg-[#181B24] border-slate-600/40 hover:border-slate-400/70"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 flex items-center justify-center text-slate-950 font-black text-lg shadow-md shadow-slate-400/20 border border-slate-200">
              🥈
            </div>
            <span className="text-2xl font-black text-slate-200 font-mono">{silverCount}</span>
          </div>
          <div className="mt-3">
            <div className="flex items-center space-x-1">
              <h4 className="text-xs font-black text-slate-100 uppercase tracking-tight">Medalha de Prata</h4>
              <Medal className="w-3.5 h-3.5 text-slate-300" />
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">5+ Visitas ou {settings.currencySymbol} 250+ gastos</p>
            <span className="inline-block mt-1 text-[9px] font-bold text-slate-300 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
              5% OFF Cosméticos + Café
            </span>
          </div>
        </div>

        {/* Badge Bronze */}
        <div
          onClick={() => setSelectedMedalFilter(selectedMedalFilter === "bronze" ? "all" : "bronze")}
          className={`cursor-pointer rounded-2xl border p-4 transition shadow-lg relative overflow-hidden flex flex-col justify-between ${
            selectedMedalFilter === "bronze"
              ? "bg-gradient-to-br from-amber-950/60 via-stone-900 to-slate-900 border-amber-600 ring-2 ring-amber-600/40"
              : "bg-[#181B24] border-amber-800/30 hover:border-amber-700/60"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-700 via-amber-800 to-stone-800 flex items-center justify-center text-amber-200 font-black text-lg shadow-md shadow-amber-900/20 border border-amber-600/60">
              🥉
            </div>
            <span className="text-2xl font-black text-amber-500 font-mono">{bronzeCount}</span>
          </div>
          <div className="mt-3">
            <div className="flex items-center space-x-1">
              <h4 className="text-xs font-black text-slate-100 uppercase tracking-tight">Medalha de Bronze</h4>
              <Shield className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">1 a 4 Visitas (Iniciante Fiel)</p>
            <span className="inline-block mt-1 text-[9px] font-bold text-amber-400/80 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-900/40">
              Cartão 10 Selos + Ficha
            </span>
          </div>
        </div>

        {/* Badge Diamante */}
        <div
          onClick={() => setSelectedMedalFilter(selectedMedalFilter === "diamond" ? "all" : "diamond")}
          className={`cursor-pointer rounded-2xl border p-4 transition shadow-lg relative overflow-hidden flex flex-col justify-between ${
            selectedMedalFilter === "diamond"
              ? "bg-gradient-to-br from-purple-950/90 via-purple-900/50 to-slate-900 border-purple-400 ring-2 ring-purple-400/40"
              : "bg-[#181B24] border-purple-500/30 hover:border-purple-400/70"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-indigo-500 to-purple-700 flex items-center justify-center text-white font-black text-lg shadow-md shadow-purple-500/20 border border-purple-300">
              💎
            </div>
            <span className="text-2xl font-black text-purple-300 font-mono">{diamondCount}</span>
          </div>
          <div className="mt-3">
            <div className="flex items-center space-x-1">
              <h4 className="text-xs font-black text-slate-100 uppercase tracking-tight">Diamante Imperial</h4>
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <p className="text-[10px] text-purple-200/80 mt-0.5">15+ Visitas ou {settings.currencySymbol} 1.000+ gastos</p>
            <span className="inline-block mt-1 text-[9px] font-bold text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/40">
              15% OFF + Lounge Master
            </span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-[#181B24] rounded-2xl border border-slate-800 p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar cliente por nome, telefone ou ficha técnica..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Filtro por Medalha */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
            Medalha:
          </span>
          {[
            { id: "all", label: "Todas", count: clients.length },
            { id: "gold", label: "🥇 Ouro", count: goldCount },
            { id: "silver", label: "🥈 Prata", count: silverCount },
            { id: "bronze", label: "🥉 Bronze", count: bronzeCount },
            { id: "diamond", label: "💎 Diamante", count: diamondCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedMedalFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center space-x-1 ${
                selectedMedalFilter === tab.id
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedMedalFilter === tab.id
                    ? "bg-slate-950 text-amber-400 font-mono"
                    : "bg-slate-800 text-slate-400 font-mono"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Cards de Clientes com Sistema de Medalhas Virtuais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredClients.map((client) => {
          const barber = barbers.find((b) => b.id === client.favoriteBarberId);
          const isRewardReady = client.loyaltyStamps >= settings.loyaltyTarget;
          const badge = client.badgeInfo;

          return (
            <div
              key={client.id}
              className={`bg-[#181B24] rounded-2xl border border-slate-800 p-5 shadow-xl transition space-y-4 flex flex-col justify-between ${badge.cardGlow}`}
            >
              <div className="space-y-3.5">
                {/* Cabeçalho do Cliente & Badge Virtual */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3.5">
                    <div className="relative">
                      <img
                        src={
                          client.avatar ||
                          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
                        }
                        alt={client.name}
                        referrerPolicy="no-referrer"
                        className="w-13 h-13 rounded-2xl object-cover border-2 border-slate-700 shadow-md"
                      />
                      {/* Mini Medalha no Avatar */}
                      <span className="absolute -bottom-1 -right-1 text-sm bg-slate-950 rounded-full p-0.5 border border-slate-700 shadow">
                        {badge.emoji}
                      </span>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className="font-black text-base text-slate-100">{client.name}</h3>
                        {/* Virtual Medal Badge */}
                        <div
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase flex items-center space-x-1 border shadow-sm ${badge.badgeBg} ${badge.badgeBorder} ${badge.badgeText}`}
                        >
                          <span>{badge.emoji}</span>
                          <span>{badge.badgeTitle}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1">
                        <span>📞 {client.phone}</span>
                        {client.preferredBeverage && (
                          <span className="flex items-center text-amber-400 font-medium">
                            <Coffee className="w-3 h-3 mr-1" />
                            {client.preferredBeverage}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => openEditModal(client)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition shrink-0"
                    title="Editar Perfil do Cliente"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Bloco de Progresso para a Próxima Medalha */}
                {badge.nextTier ? (
                  <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1.5 text-slate-300 font-semibold text-[11px]">
                        <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                        <span>Próximo Nível: <strong className="text-amber-300">{badge.nextTier.emoji} {badge.nextTier.name}</strong></span>
                      </div>
                      <span className="text-[10px] font-mono text-amber-400 font-bold">
                        {badge.nextTier.progressPercent}% Concluído
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(5, badge.nextTier.progressPercent)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Faltam <strong>{badge.nextTier.visitsNeeded}</strong> visitas</span>
                      <span>ou <strong>{settings.currencySymbol} {badge.nextTier.spentNeeded.toFixed(0)}</strong> em consumo</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-purple-950/30 rounded-xl p-2.5 border border-purple-500/30 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 text-purple-300 font-bold text-[11px]">
                      <Crown className="w-4 h-4 text-purple-400" />
                      <span>Nível Máximo Desbloqueado! (Diamante Imperial)</span>
                    </div>
                    <span className="text-[10px] bg-purple-500/20 text-purple-200 px-2 py-0.5 rounded font-black border border-purple-500/30">
                      VIP SUPREMO
                    </span>
                  </div>
                )}

                {/* Vantagens e Benefícios Desbloqueados pela Medalha */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Gift className="w-3 h-3 text-amber-400" />
                      <span>Vantagens Desbloqueadas ({badge.name}):</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {badge.perks.slice(0, 2).map((perk, pIdx) => (
                      <div
                        key={pIdx}
                        className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[10px] text-slate-300 flex items-center space-x-1.5"
                      >
                        <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fórmula Técnica de Corte */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <Scissors className="w-3 h-3" />
                      <span>Ficha Técnica do Corte &amp; Pentes</span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-normal">Barbeiro: {barber?.name.split(" ")[0] || "Qualquer"}</span>
                  </div>
                  <p className="text-xs font-mono text-slate-300 leading-relaxed line-clamp-2">
                    {client.haircutFormula || "Nenhuma instrução de degradê registrada."}
                  </p>
                </div>

                {/* Cartão Fidelidade Digital */}
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-200">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span>Cartão Fidelidade ({client.loyaltyStamps} / {settings.loyaltyTarget} Selos)</span>
                    </div>
                    {isRewardReady ? (
                      <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60 animate-pulse">
                        🎁 CORTE GRÁTIS DISPONÍVEL!
                      </span>
                    ) : (
                      <button
                        onClick={() => handlePunchStamp(client)}
                        className="text-[10px] font-bold text-amber-400 hover:text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40 transition"
                      >
                        + Carimbar Selo
                      </button>
                    )}
                  </div>

                  {/* 10 Selos */}
                  <div className="grid grid-cols-10 gap-1">
                    {Array.from({ length: settings.loyaltyTarget }).map((_, idx) => {
                      const isStamped = idx < client.loyaltyStamps;
                      const isLast = idx === settings.loyaltyTarget - 1;
                      return (
                        <div
                          key={idx}
                          onClick={() => handlePunchStamp(client)}
                          title={`Selo #${idx + 1}`}
                          className={`h-6 rounded-lg flex items-center justify-center text-[10px] font-bold cursor-pointer transition ${
                            isStamped
                              ? "bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 shadow-sm"
                              : isLast
                              ? "bg-amber-950/40 border border-dashed border-amber-500/50 text-amber-400 hover:bg-amber-900/40"
                              : "bg-slate-950 border border-slate-800 text-slate-600 hover:border-slate-700"
                          }`}
                        >
                          {isStamped ? (
                            <Scissors className="w-3 h-3 transform -rotate-45" />
                          ) : isLast ? (
                            "★"
                          ) : (
                            idx + 1
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Rodapé com Estatísticas Financeiras & Botão de WhatsApp */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-3">
                  <span>
                    Visitas: <strong className="text-slate-100 font-mono">{client.totalVisits}</strong>
                  </span>
                  <span>
                    Total: <strong className="text-amber-400 font-mono">{settings.currencySymbol}{client.totalSpent}</strong>
                  </span>
                </div>

                <button
                  onClick={() => handleOpenWhatsApp(client)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 text-xs font-bold border border-emerald-700/50 transition flex items-center space-x-1.5 shadow"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp VIP</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Regras de Níveis de Fidelidade e Medalhas Virtuais */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181B24] rounded-2xl border border-slate-700 max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-100 uppercase">
                    Sistema de Níveis &amp; Medalhas Virtuais
                  </h3>
                  <p className="text-xs text-slate-400">
                    Como seus clientes sobem de nível e quais vantagens ganham em cada medalha
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Ouro */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 border border-amber-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">🥇</span>
                    <h4 className="font-black text-amber-300 text-sm uppercase">Medalha de Ouro (Gold Elite)</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    10+ VISITAS ou {settings.currencySymbol} 500+ GASTOS
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Para clientes VIP que frequentam quinzenalmente ou consomem produtos de alta performance.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-200">
                  <span className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>10% OFF em cosméticos</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Barboterapia cortesia no aniversário</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Bebida especial ou Cerveja IPA</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Prioridade na lista de agendamento</span>
                  </span>
                </div>
              </div>

              {/* Prata */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-800/60 via-slate-900 to-slate-800/40 border border-slate-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">🥈</span>
                    <h4 className="font-black text-slate-200 text-sm uppercase">Medalha de Prata (Silver Master)</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-700 text-slate-200 border border-slate-500/40">
                    5+ VISITAS ou {settings.currencySymbol} 250+ GASTOS
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Para clientes regulares que já criaram vínculo de confiança com seu barbeiro preferido.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-200">
                  <span className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>5% OFF em produtos de bancada</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Café Espresso Duplo de cortesia</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Garantia de atendimento preferencial</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Cartão Fidelidade com bônus de selo</span>
                  </span>
                </div>
              </div>

              {/* Bronze */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/20 border border-amber-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">🥉</span>
                    <h4 className="font-black text-amber-500 text-sm uppercase">Medalha de Bronze (Pioneer)</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-950/60 text-amber-400 border border-amber-800/40">
                    1 a 4 VISITAS
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Porta de entrada no Clube Barber Pro. O cliente já começa pontuando no Cartão Fidelidade digital.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-200">
                  <span className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Ficha técnica de máquina registrada</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Cartão Fidelidade com meta de 10 selos</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Café de boas-vindas na cadeira</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Lembretes automáticos via WhatsApp</span>
                  </span>
                </div>
              </div>

              {/* Diamante */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-purple-950/40 border border-purple-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">💎</span>
                    <h4 className="font-black text-purple-300 text-sm uppercase">Medalha Diamante Imperial (Lendário)</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    15+ VISITAS ou {settings.currencySymbol} 1.000+ GASTOS
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  O mais alto patamar de fidelidade e prestígio na casa. Acesso total ao lounge executivo e benefícios ilimitados.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowRulesModal(false)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow"
              >
                Entendi as Regras
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cadastro / Edição de Cliente */}
      {showAddClientModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181B24] rounded-2xl border border-slate-700 max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 uppercase">
                {editingClient ? "Editar Perfil do Cliente" : "Cadastrar Novo Cliente VIP"}
              </h3>
              <button
                onClick={() => setShowAddClientModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewClient} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Samuel Rodrigues"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Celular / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="(11) 98765-4321"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail</label>
                  <input
                    type="email"
                    placeholder="cliente@email.com"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ficha Técnica de Corte (Instruções de Máquina)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Mid fade pente #0.5 na base, topo texturizado 4cm, costeleta quadrada."
                  value={newClientFormula}
                  onChange={(e) => setNewClientFormula(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Barbeiro Preferido</label>
                  <select
                    value={newClientFavBarber}
                    onChange={(e) => setNewClientFavBarber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                  >
                    {barbers.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Categoria VIP</label>
                  <select
                    value={newClientTier}
                    onChange={(e) => setNewClientTier(e.target.value as VIPTier)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="bronze">🥉 Bronze VIP</option>
                    <option value="silver">🥈 Silver VIP</option>
                    <option value="gold">🥇 Gold VIP</option>
                    <option value="diamond">💎 Diamond VIP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Bebida de Cortesia Preferida</label>
                <input
                  type="text"
                  placeholder="Ex: Café Espresso Duplo, Água com Gás, Cerveja IPA, Whiskey"
                  value={newClientBeverage}
                  onChange={(e) => setNewClientBeverage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddClientModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow"
                >
                  {editingClient ? "Salvar Alterações" : "Cadastrar Cliente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

