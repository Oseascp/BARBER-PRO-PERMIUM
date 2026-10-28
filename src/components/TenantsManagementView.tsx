import React, { useState } from "react";
import { useBarber } from "../context/BarberContext";
import { Tenant, TenantPlan, TenantStatus } from "../types";
import {
  Building2,
  Plus,
  Search,
  ExternalLink,
  CheckCircle2,
  Copy,
  Scissors,
  Users,
  DollarSign,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Edit3,
  Trash2,
  CopyPlus,
  ArrowRight,
  Store,
  Sparkles,
  Calendar,
  X,
  CreditCard,
  Check,
  HelpCircle,
  Send,
  Zap,
  CheckCircle,
  Target,
  Clock,
  Smartphone,
} from "lucide-react";

interface TenantsManagementViewProps {
  onNavigateToDashboard: () => void;
  onOpenBookingForTenant: (slug: string) => void;
  onNavigateToSalesKit?: () => void;
  onOpenFastTrial?: () => void;
}

export const TenantsManagementView: React.FC<TenantsManagementViewProps> = ({
  onNavigateToDashboard,
  onOpenBookingForTenant,
  onNavigateToSalesKit,
  onOpenFastTrial,
}) => {
  const {
    tenants,
    currentTenant,
    activeTenantId,
    switchTenant,
    createTenant,
    updateTenant,
    deleteTenant,
    duplicateTenant,
    convertTrialToActive,
    settings,
  } = useBarber();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTrialGuideModal, setShowTrialGuideModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [copiedTenantId, setCopiedTenantId] = useState<string | null>(null);

  // Billing Guide & WhatsApp Invoicing Modal State
  const [showBillingGuideModal, setShowBillingGuideModal] = useState<boolean>(false);
  const [selectedBillingTenant, setSelectedBillingTenant] = useState<Tenant | null>(null);
  const [userPixKey, setUserPixKey] = useState<string>("financeiro@seusistema.com.br");
  const [calculatorClientsCount, setCalculatorClientsCount] = useState<number>(15);
  const [calculatorAvgPrice, setCalculatorAvgPrice] = useState<number>(149);
  const [copiedInvoiceMessage, setCopiedInvoiceMessage] = useState<boolean>(false);

  // New Tenant Form State
  const [newShopName, setNewShopName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newOwnerName, setNewOwnerName] = useState("");
  const [newOwnerPhone, setNewOwnerPhone] = useState("");
  const [newOwnerEmail, setNewOwnerEmail] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newCity, setNewCity] = useState("São Paulo - SP");
  const [newPlan, setNewPlan] = useState<TenantPlan>("pro");
  const [newMonthlyFee, setNewMonthlyFee] = useState<number>(149);
  const [newTemplateMode, setNewTemplateMode] = useState<"sample" | "blank">("sample");

  // Filtered tenants
  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPlan =
      filterPlan === "all" ||
      (filterPlan === "trial" ? t.status === "trial" : t.plan === filterPlan);
    return matchesSearch && matchesPlan;
  });

  // Global Multi-Tenant Metrics
  const totalTenantsCount = tenants.length;
  const totalMRR = tenants.reduce((acc, t) => acc + (t.monthlyFee || 0), 0);
  const totalChairs = tenants.reduce((acc, t) => acc + (t.chairsCount || 3), 0);
  const activeTenantsCount = tenants.filter((t) => t.status === "active").length;
  const trialTenantsCount = tenants.filter((t) => t.status === "trial").length;

  const handleNameChange = (name: string) => {
    setNewShopName(name);
    const autoSlug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    setNewSlug(autoSlug);
  };

  const handlePlanChange = (plan: TenantPlan) => {
    setNewPlan(plan);
    if (plan === "starter") setNewMonthlyFee(89);
    else if (plan === "pro") setNewMonthlyFee(149);
    else if (plan === "vip" || plan === "enterprise") setNewMonthlyFee(249);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShopName.trim() || !newOwnerName.trim()) {
      alert("Preencha ao menos o Nome da Barbearia e Nome do Proprietário.");
      return;
    }

    createTenant(
      {
        name: newShopName.trim(),
        slug: newSlug.trim() || `barbearia-${Date.now()}`,
        tagline: "Barbearia de Alto Padrão & Gestão Profissional",
        ownerName: newOwnerName.trim(),
        ownerEmail: newOwnerEmail.trim() || "contato@barbearia.com.br",
        ownerPhone: newOwnerPhone.trim() || "(11) 98765-4321",
        address: newAddress.trim() || "Rua Principal, 100",
        city: newCity.trim(),
        plan: newPlan,
        status: "active",
        monthlyFee: Number(newMonthlyFee) || 149,
        settings: {
          name: newShopName.trim(),
          tagline: "Barbearia de Alto Padrão & Gestão Profissional",
          phone: newOwnerPhone.trim() || "(11) 98765-4321",
          address: newAddress.trim() || "Rua Principal, 100",
          openTime: "08:30",
          closeTime: "20:00",
          currencySymbol: "R$",
          loyaltyTarget: 10,
          defaultCommissionRate: 0.5,
          themeMode: "dark",
        },
      },
      newTemplateMode
    );

    // Reset form
    setNewShopName("");
    setNewSlug("");
    setNewOwnerName("");
    setNewOwnerPhone("");
    setNewOwnerEmail("");
    setNewAddress("");
    setShowCreateModal(false);

    onNavigateToDashboard();
  };

  const handleCopyBookingLink = (tenant: Tenant) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const directUrl = `${origin}/?tenant=${tenant.slug}&tab=booking`;
    navigator.clipboard.writeText(directUrl);
    setCopiedTenantId(tenant.id);
    setTimeout(() => {
      setCopiedTenantId(null);
    }, 2500);
  };

  const handleSwitchAndEnter = (tenantId: string) => {
    switchTenant(tenantId);
    onNavigateToDashboard();
  };

  const handleOpenBillingModalForTenant = (tenant: Tenant) => {
    setSelectedBillingTenant(tenant);
    setShowBillingGuideModal(true);
  };

  const generateWhatsAppInvoiceMessage = (tenant: Tenant) => {
    return `Olá ${tenant.ownerName}, tudo bem? Aqui é da equipe Barber Pro Master!\n\nSegue a fatura da assinatura mensal do seu sistema de gestão da barbearia *${tenant.name}*:\n\n💳 *Plano:* ${tenant.plan.toUpperCase()}\n✂️ *Cadeiras/Equipe:* ${tenant.chairsCount || 3} cadeiras\n💰 *Valor Mensal:* R$ ${tenant.monthlyFee?.toFixed(2) || "149,00"}\n🔑 *Chave PIX:* ${userPixKey}\n\nAssim que realizar o pagamento, nos envie o comprovante por aqui. Seu sistema continua 100% ativo!`;
  };

  const handleCopyWhatsAppInvoice = (tenant: Tenant) => {
    const text = generateWhatsAppInvoiceMessage(tenant);
    navigator.clipboard.writeText(text);
    setCopiedInvoiceMessage(true);
    setTimeout(() => setCopiedInvoiceMessage(false), 2500);
  };

  const handleSendWhatsAppInvoiceDirect = (tenant: Tenant) => {
    const text = encodeURIComponent(generateWhatsAppInvoiceMessage(tenant));
    const cleanPhone = tenant.ownerPhone.replace(/\D/g, "");
    const targetUrl = cleanPhone
      ? `https://wa.me/55${cleanPhone}?text=${text}`
      : `https://wa.me/?text=${text}`;
    window.open(targetUrl, "_blank");
  };

  const getPlanBadge = (plan: TenantPlan) => {
    switch (plan) {
      case "vip":
      case "enterprise":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500/20 to-amber-600/30 text-amber-300 border border-amber-500/50 flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>VIP Enterprise</span>
          </span>
        );
      case "pro":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3 text-sky-400" />
            <span>Plano PRO</span>
          </span>
        );
      case "starter":
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1">
            <span>Starter</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Intro */}
      <div className="bg-gradient-to-r from-slate-900 via-[#151922] to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-amber-500/5 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-1.5">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Arquitetura Multi-Tenant SaaS • Painel Master</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100 uppercase tracking-wide">
              Gestão de Barbearias &amp; Clientes SaaS
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl mt-1">
              Gerencie cada barbearia como um cliente independente com banco de dados isolado,
              assinatura mensal, link de agendamento próprio e acesso instantâneo ao painel.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* 1. Fast Onboarding 7-day trial on the spot */}
            <button
              onClick={() => (onOpenFastTrial ? onOpenFastTrial() : setShowCreateModal(true))}
              className="flex items-center space-x-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs sm:text-sm font-black shadow-lg shadow-amber-500/25 transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>⚡ Cadastrar 7 Dias de Teste (Na Hora)</span>
            </button>

            {/* 2. Trial Strategy & Sales Script Guide */}
            <button
              onClick={() => setShowTrialGuideModal(true)}
              className="flex items-center space-x-2 px-4 py-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs sm:text-sm font-bold border border-amber-500/40 transition cursor-pointer shadow"
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Roteiro dos 7 Dias (Script de Vendas)</span>
            </button>

            {onNavigateToSalesKit && (
              <button
                onClick={onNavigateToSalesKit}
                className="flex items-center space-x-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold border border-slate-700 transition cursor-pointer shadow"
              >
                <Target className="w-4 h-4 text-amber-400" />
                <span>Kit de Vendas</span>
              </button>
            )}

            <button
              onClick={() => {
                setSelectedBillingTenant(currentTenant);
                setShowBillingGuideModal(true);
              }}
              className="flex items-center space-x-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold border border-slate-700 transition cursor-pointer shadow"
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Como Receber o Dinheiro (SaaS)</span>
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold border border-slate-700 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nova Barbearia (Manual)</span>
            </button>
          </div>
        </div>

        {/* Global SaaS KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Barbearias Totais</span>
              <Store className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-slate-100">{totalTenantsCount}</div>
            <span className="text-[11px] text-emerald-400 font-semibold">
              {activeTenantsCount} pagantes ativos
            </span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5">
            <div className="flex items-center justify-between text-amber-300 text-xs mb-1">
              <span>Em Teste Grátis</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-300">{trialTenantsCount}</div>
            <span className="text-[11px] text-amber-400/90 font-semibold">
              7 dias cortesia
            </span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>MRR SaaS Mensal</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">
              R$ {totalMRR.toFixed(2)}
            </div>
            <span className="text-[11px] text-slate-400">Receita na sua conta</span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Total de Cadeiras</span>
              <Scissors className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-black text-slate-100">{totalChairs}</div>
            <span className="text-[11px] text-slate-400">Profissionais na rede</span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Barbearia Ativa</span>
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-base font-black text-amber-300 truncate">
              {currentTenant.name}
            </div>
            <span className="text-[11px] text-slate-400 truncate block">
              /{currentTenant.slug}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#12141C] border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, dono, cidade ou link..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-400 font-semibold hidden md:inline">Filtrar:</span>
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Todos os Status / Planos</option>
            <option value="trial">⏳ Em Teste Grátis (7 Dias)</option>
            <option value="starter">Plano Starter (R$ 89)</option>
            <option value="pro">Plano Pro (R$ 149)</option>
            <option value="vip">Plano VIP (R$ 249)</option>
          </select>
        </div>
      </div>

      {/* Tenants Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {filteredTenants.map((tenant) => {
          const isCurrentActive = tenant.id === activeTenantId;
          const isCopied = copiedTenantId === tenant.id;

          return (
            <div
              key={tenant.id}
              className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-lg ${
                isCurrentActive
                  ? "bg-[#141824] border-amber-500/70 shadow-amber-500/10 ring-1 ring-amber-500/30"
                  : "bg-[#12141C] border-slate-800 hover:border-slate-700"
              }`}
            >
              {/* Card Header */}
              <div className="p-5 border-b border-slate-800/80">
                {isCurrentActive && (
                  <div className="mb-3 px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-black uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center space-x-1.5">
                      <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                      <span>Barbearia Ativa no Sistema</span>
                    </span>
                    <span className="text-[10px] text-amber-200">Painel Conectado</span>
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-amber-400 font-black text-lg overflow-hidden shrink-0 shadow">
                      {tenant.logo ? (
                        <img src={tenant.logo} alt={tenant.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{tenant.name.slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-100 text-base leading-tight">
                        {tenant.name}
                      </h3>
                      <div className="flex items-center space-x-1 text-xs text-slate-400 mt-0.5">
                        <span className="text-amber-400 font-semibold">/{tenant.slug}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {tenant.status === "trial" ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/50 flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>7 Dias Grátis</span>
                      </span>
                    ) : (
                      getPlanBadge(tenant.plan)
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-3 line-clamp-1 italic">
                  "{tenant.tagline || tenant.settings?.tagline || "Barbearia de Alto Padrão"}"
                </p>
              </div>

              {/* Card Info Body */}
              <div className="p-5 space-y-3 text-xs text-slate-300 flex-1">
                <div className="flex items-center space-x-2 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                  <span className="truncate">{tenant.address || "Endereço não informado"}</span>
                </div>

                <div className="flex items-center space-x-2 text-slate-400">
                  <Users className="w-3.5 h-3.5 text-sky-400/80 shrink-0" />
                  <span>
                    Dono: <strong className="text-slate-200 font-semibold">{tenant.ownerName}</strong>
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-slate-400">
                  <Phone className="w-3.5 h-3.5 text-emerald-400/80 shrink-0" />
                  <span className="text-slate-300 font-mono">{tenant.ownerPhone}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">
                      Mensalidade SaaS
                    </span>
                    <span className="text-sm font-extrabold text-emerald-400 font-mono">
                      R$ {tenant.monthlyFee?.toFixed(2) || "149.00"}/mês
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">
                      Cadeiras / Equipe
                    </span>
                    <span className="text-sm font-extrabold text-slate-200">
                      {tenant.chairsCount || 3} Cadeiras
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Actions Footer */}
              <div className="p-4 bg-slate-950/60 border-t border-slate-800/80 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSwitchAndEnter(tenant.id)}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition ${
                      isCurrentActive
                        ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-100"
                    }`}
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>{isCurrentActive ? "Painel Conectado" : "Entrar no Painel"}</span>
                  </button>

                  <button
                    onClick={() => handleCopyBookingLink(tenant)}
                    className={`py-2 px-3 rounded-xl font-semibold text-xs border flex items-center justify-center space-x-1.5 transition ${
                      isCopied
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                        : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700/80"
                    }`}
                    title="Copiar Link de Agendamento desta Barbearia"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Link Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-amber-400" />
                        <span>Link de Agendamento</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Direct Monthly Invoicing / Trial Conversion Button */}
                {tenant.status === "trial" ? (
                  <button
                    onClick={() => convertTrialToActive(tenant.id)}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 text-xs font-black flex items-center justify-center space-x-1.5 transition shadow cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Ativar Plano Definitivo (Converter Trial)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenBillingModalForTenant(tenant)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 hover:border-emerald-500/50 text-emerald-400 text-xs font-bold flex items-center justify-center space-x-2 transition"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Cobrar Mensalidade (R$ {tenant.monthlyFee?.toFixed(2)}/mês)</span>
                  </button>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[11px] text-slate-500">
                  <button
                    onClick={() => setEditingTenant(tenant)}
                    className="hover:text-amber-400 flex items-center space-x-1 transition"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Editar Dados</span>
                  </button>

                  <button
                    onClick={() => {
                      const duplicateName = prompt(
                        `Digite o nome para a nova barbearia duplicada a partir de "${tenant.name}":`,
                        `${tenant.name} (Nova Unidade)`
                      );
                      if (duplicateName) duplicateTenant(tenant.id, duplicateName);
                    }}
                    className="hover:text-sky-400 flex items-center space-x-1 transition"
                  >
                    <CopyPlus className="w-3 h-3" />
                    <span>Duplicar</span>
                  </button>

                  {tenants.length > 1 && (
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `Tem certeza que deseja excluir permanentemente a barbearia "${tenant.name}"? Todos os agendamentos e vendas desta unidade serão removidos.`
                          )
                        ) {
                          deleteTenant(tenant.id);
                        }
                      }}
                      className="hover:text-rose-400 flex items-center space-x-1 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Excluir</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: SaaS Billing & Money Flow Guide */}
      {showBillingGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#151822] rounded-2xl border border-slate-700 max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-slate-100 uppercase">
                  Como Funciona o Recebimento &amp; Cobrança SaaS (MRR)
                </h3>
              </div>
              <button
                onClick={() => setShowBillingGuideModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. Onde vai o dinheiro */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                <DollarSign className="w-4 h-4" />
                <span>Para onde vai o valor das mensalidades?</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-emerald-300">O valor vai 100% direto para a SUA CONTA BANCÁRIA!</strong> Você é o dono da plataforma de software. Quando você vende o sistema para uma barbearia por R$ 149/mês, esse valor entra como seu faturamento recorrente.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-[11px] gap-2 mt-2">
                <div className="text-center sm:text-left">
                  <span className="text-slate-500 block">Cliente (Dono da Barbearia)</span>
                  <span className="font-bold text-slate-200">Paga R$ 149 / mês</span>
                </div>
                <div className="text-emerald-400 font-bold">➔ PIX / Cartão ➔</div>
                <div className="text-center sm:text-right">
                  <span className="text-slate-500 block">Sua Conta Bancária (PIX)</span>
                  <span className="font-bold text-emerald-400">Você Recebe R$ 149 / mês</span>
                </div>
              </div>
            </div>

            {/* 2. Como Funciona a Cobrança Automática */}
            <div className="space-y-3 text-xs text-slate-300">
              <h4 className="font-bold text-slate-200 uppercase tracking-wide flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Como Automatizar a Cobrança Mensal no Brasil:</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center space-x-2 font-bold text-slate-100">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
                      1
                    </span>
                    <span>Asaas (asaas.com)</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Líder em cobrança recorrente no Brasil. Você cria sua conta gratuita, cadastra seu banco e cria uma cobrança mensal por cliente. Ele cobra automaticamente no cartão de crédito ou envia o PIX no WhatsApp do cliente com lembrete todo mês!
                  </p>
                </div>

                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center space-x-2 font-bold text-slate-100">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs">
                      2
                    </span>
                    <span>Mercado Pago / Stripe</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Permite criar um link de assinatura recorrente (Plano Mensal). O dono da barbearia cadastra o cartão uma única vez e é debitado todo mês automaticamente com o dinheiro caindo no seu saldo.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Modelo Cadeira + Barbeiro vs Plano Fixo */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
              <div className="font-bold text-slate-200 uppercase tracking-wide">
                Qual Modelo de Precificação Escolher?
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-amber-400 block">Opção A: Planos Fixos (Mais Fácil de Vender)</span>
                  <ul className="text-slate-400 space-y-0.5 text-[11px] list-disc list-inside">
                    <li>Starter: R$ 89/mês (até 2 barbeiros)</li>
                    <li>PRO: R$ 149/mês (até 5 barbeiros)</li>
                    <li>VIP Enterprise: R$ 249/mês (ilimitado)</li>
                  </ul>
                  <span className="text-[10px] text-slate-500 block pt-1">
                    Ideal para o cliente não ter surpresa no fim do mês.
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-sky-400 block">Opção B: Base + Valor por Cadeira/Barbeiro</span>
                  <p className="text-slate-400 text-[11px]">
                    Exemplo: <strong>R$ 59,00 base + R$ 25,00 por cadeira ativa</strong>.
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Uma barbearia com 4 barbeiros paga: 59 + (4 * 25) = <strong>R$ 159,00/mês</strong>.
                  </p>
                  <span className="text-[10px] text-slate-500 block pt-1">
                    Seu faturamento cresce automaticamente quando o cliente cresce!
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Simulador Interativo de Faturamento */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                  Simulador de Faturamento Mensal Recorrente (MRR)
                </span>
                <span className="text-xs text-emerald-400 font-extrabold font-mono">
                  R$ {(calculatorClientsCount * calculatorAvgPrice).toFixed(2)} / mês
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">
                    Número de Barbearias Clientes: <strong>{calculatorClientsCount}</strong>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={calculatorClientsCount}
                    onChange={(e) => setCalculatorClientsCount(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">
                    Mensalidade Média: <strong>R$ {calculatorAvgPrice}/mês</strong>
                  </label>
                  <input
                    type="range"
                    min={49}
                    max={299}
                    step={10}
                    value={calculatorAvgPrice}
                    onChange={(e) => setCalculatorAvgPrice(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                <span>Com <strong>{calculatorClientsCount} barbearias</strong> você fatura todo mês:</span>
                <strong className="text-sm font-black font-mono">
                  R$ {(calculatorClientsCount * calculatorAvgPrice).toFixed(2)} / mês (R$ {(calculatorClientsCount * calculatorAvgPrice * 12).toFixed(2)} / ano)
                </strong>
              </div>
            </div>

            {/* 5. Gerador Instantâneo de Cobrança PIX para Enviar no WhatsApp */}
            {selectedBillingTenant && (
              <div className="bg-[#181B24] p-4 rounded-xl border border-amber-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Send className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-slate-100 uppercase">
                      Gerar Cobrança Instantânea: {selectedBillingTenant.name}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-400 font-mono">
                    R$ {selectedBillingTenant.monthlyFee?.toFixed(2)} / mês
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">Sua Chave PIX (Para receber o valor):</label>
                    <input
                      type="text"
                      value={userPixKey}
                      onChange={(e) => setUserPixKey(e.target.value)}
                      placeholder="CNPJ, E-mail, Celular ou Chave Aleatória"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div className="flex items-end space-x-2">
                    <button
                      type="button"
                      onClick={() => handleCopyWhatsAppInvoice(selectedBillingTenant)}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center space-x-1.5 transition"
                    >
                      {copiedInvoiceMessage ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Texto Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-amber-400" />
                          <span>Copiar Mensagem</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendWhatsAppInvoiceDirect(selectedBillingTenant)}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition shadow"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Abrir no WhatsApp</span>
                    </button>
                  </div>
                </div>

                {/* Previsão do texto formatado */}
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 font-mono whitespace-pre-line leading-relaxed">
                  {generateWhatsAppInvoiceMessage(selectedBillingTenant)}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowBillingGuideModal(false)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold transition cursor-pointer"
              >
                Entendi, Fechar Guia
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create New Tenant */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#151822] rounded-2xl border border-slate-700 max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Store className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-slate-100 uppercase">
                  Cadastrar Nova Barbearia Parceira (SaaS)
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome da Barbearia *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Barbearia Don Corleone"
                  value={newShopName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Slug / Link Único da Barbearia *
                  </label>
                  <div className="flex items-center rounded-xl bg-slate-900 border border-slate-700 px-3 py-2">
                    <span className="text-xs text-slate-500 mr-1">/?tenant=</span>
                    <input
                      type="text"
                      required
                      placeholder="don-corleone"
                      value={newSlug}
                      onChange={(e) => setNewSlug(e.target.value)}
                      className="w-full bg-transparent text-xs text-amber-400 font-semibold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nome do Proprietário / Dono *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Eduardo Don"
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    WhatsApp Comercial do Dono *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(11) 98765-4321"
                    value={newOwnerPhone}
                    onChange={(e) => setNewOwnerPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    E-mail de Contato
                  </label>
                  <input
                    type="email"
                    placeholder="dono@barbearia.com.br"
                    value={newOwnerEmail}
                    onChange={(e) => setNewOwnerEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Endereço Completo
                  </label>
                  <input
                    type="text"
                    placeholder="Rua Augusta, 1200 - Consolação"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cidade / UF</label>
                  <input
                    type="text"
                    placeholder="São Paulo - SP"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* SaaS Plan & Monthly Fee */}
              <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  Plano de Assinatura SaaS
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handlePlanChange("starter")}
                    className={`p-2.5 rounded-xl border text-center transition ${
                      newPlan === "starter"
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    <div className="text-xs">Starter</div>
                    <div className="text-sm font-extrabold mt-0.5">R$ 89/mês</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePlanChange("pro")}
                    className={`p-2.5 rounded-xl border text-center transition ${
                      newPlan === "pro"
                        ? "bg-sky-500/20 border-sky-500 text-sky-300 font-bold"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    <div className="text-xs">PRO</div>
                    <div className="text-sm font-extrabold mt-0.5">R$ 149/mês</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePlanChange("vip")}
                    className={`p-2.5 rounded-xl border text-center transition ${
                      newPlan === "vip"
                        ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    <div className="text-xs">VIP Enterprise</div>
                    <div className="text-sm font-extrabold mt-0.5">R$ 249/mês</div>
                  </button>
                </div>

                <div className="flex items-center space-x-3 pt-1">
                  <span className="text-xs text-slate-400">Mensalidade Personalizada:</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-slate-500 font-bold">R$</span>
                    <input
                      type="number"
                      value={newMonthlyFee}
                      onChange={(e) => setNewMonthlyFee(Number(e.target.value))}
                      className="w-24 px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-emerald-400 font-bold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Template Mode */}
              <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-300 block">
                  Estrutura Inicial de Dados:
                </span>
                <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="templateMode"
                    checked={newTemplateMode === "sample"}
                    onChange={() => setNewTemplateMode("sample")}
                    className="text-amber-500 focus:ring-amber-500"
                  />
                  <span>
                    <strong>Modelo Completo de Demonstração (Recomendado):</strong> Cria 2 barbeiros,
                    serviços clássicos e produtos cosméticos de exemplo prontos para testar ao vivo.
                  </span>
                </label>

                <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="templateMode"
                    checked={newTemplateMode === "blank"}
                    onChange={() => setNewTemplateMode("blank")}
                    className="text-amber-500 focus:ring-amber-500"
                  />
                  <span>
                    <strong>Barbearia Limpa:</strong> Apenas estrutura básica para o cliente
                    cadastrar seus barbeiros e serviços do zero.
                  </span>
                </label>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-extrabold shadow-lg shadow-amber-500/20 transition cursor-pointer"
                >
                  Criar Barbearia &amp; Acessar Painel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Tenant */}
      {editingTenant && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#151822] rounded-2xl border border-slate-700 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-slate-100 uppercase">
                  Editar Barbearia: {editingTenant.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingTenant(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Nome da Barbearia</label>
                <input
                  type="text"
                  value={editingTenant.name}
                  onChange={(e) =>
                    setEditingTenant({ ...editingTenant, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Proprietário / Dono</label>
                <input
                  type="text"
                  value={editingTenant.ownerName}
                  onChange={(e) =>
                    setEditingTenant({ ...editingTenant, ownerName: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">WhatsApp Comercial</label>
                <input
                  type="tel"
                  value={editingTenant.ownerPhone}
                  onChange={(e) =>
                    setEditingTenant({ ...editingTenant, ownerPhone: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Endereço</label>
                <input
                  type="text"
                  value={editingTenant.address}
                  onChange={(e) =>
                    setEditingTenant({ ...editingTenant, address: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Plano SaaS</label>
                  <select
                    value={editingTenant.plan}
                    onChange={(e) =>
                      setEditingTenant({
                        ...editingTenant,
                        plan: e.target.value as TenantPlan,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100"
                  >
                    <option value="starter">Starter</option>
                    <option value="pro">Pro</option>
                    <option value="vip">VIP Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Mensalidade (R$)
                  </label>
                  <input
                    type="number"
                    value={editingTenant.monthlyFee}
                    onChange={(e) =>
                      setEditingTenant({
                        ...editingTenant,
                        monthlyFee: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono text-emerald-400 font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingTenant(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateTenant(editingTenant.id, editingTenant);
                    setEditingTenant(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Como Oferecer 7 Dias de Teste & Cadastrar na Hora */}
      {showTrialGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#151822] rounded-3xl border border-amber-500/40 max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto text-slate-100 animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-100 uppercase tracking-tight">
                    Como Oferecer 7 Dias de Teste &amp; Cadastrar na Hora
                  </h3>
                  <p className="text-xs text-amber-300 font-semibold">
                    Estratégia comercial prática para colocar a barbearia no ar em 30 segundos
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTrialGuideModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: The Zero-Friction Pitch */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <span className="text-amber-400 font-black text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <span>1.</span>
                <span>O Script de Abordagem (Zero Resistência)</span>
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                A melhor forma de oferecer é <strong>não tentar vender</strong> no primeiro contato. Você oferece como cortesia para ele testar com a equipe:
              </p>
              <div className="p-3 rounded-xl bg-slate-950 font-mono text-xs text-slate-300 border border-slate-800/90 leading-relaxed italic">
                "Fala [Nome do Dono]! Não vim te vender nada hoje. Criei um sistema que coloca o agendamento da sua barbearia no WhatsApp e calcula a comissão dos seus barbeiros sem erro. Quero deixar rodando <strong>7 dias grátis</strong> aqui pra vocês verem a diferença. Leva 30 segundos no meu celular pra cadastrar suas cadeiras. Posso colocar no ar agora?"
              </div>
            </div>

            {/* Step 2: Instant Registration On The Spot */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <span className="text-sky-400 font-black text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <span>2.</span>
                <span>O Cadastro na Hora (Leva 30 Segundos no Celular)</span>
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Você não precisa de computador nem de burocracia:
              </p>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li>Clique no botão amarelo <strong>"⚡ Teste 7 Dias"</strong> no topo da tela.</li>
                <li>Digite apenas: <em>Nome da Barbearia</em>, <em>Nome do Dono</em>, <em>WhatsApp</em> e a <em>quantidade de cadeiras</em>.</li>
                <li>Clique em <strong>"Ativar Teste de 7 Dias Agora"</strong>.</li>
                <li>O sistema cria a barbearia isolada instantaneamente com serviços modelos e cadeiras prontas!</li>
              </ul>
            </div>

            {/* Step 3: Immediate WhatsApp Delivery */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <span className="text-emerald-400 font-black text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <span>3.</span>
                <span>Disparo Imediato no WhatsApp do Dono</span>
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Assim que a barbearia é criada, a tela já mostra o botão <strong>"Disparar Acesso no WhatsApp do Dono"</strong>. Ao clicar, o WhatsApp abre com o link do painel dele e o link que ele já pode colocar na bio do Instagram ou mandar pros clientes dele agendarem!
              </p>
            </div>

            {/* Step 4: The 7-Day Conversion Timeline */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <span className="text-purple-400 font-black text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <span>4.</span>
                <span>O Funil dos 7 Dias para Fechar a Mensalidade (MRR)</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <strong className="text-amber-400 block">Dia 1 (Ativação):</strong>
                  <span className="text-slate-400 text-[11px]">
                    Cadastro na hora + mandar o link de agendamento no WhatsApp dele.
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <strong className="text-sky-400 block">Dia 3 (Primeiro Valor):</strong>
                  <span className="text-slate-400 text-[11px]">
                    Mensagem rápida: "Viu como os clientes agendaram direto sem você precisar digitar?"
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <strong className="text-emerald-400 block">Dia 5 (Comissões):</strong>
                  <span className="text-slate-400 text-[11px]">
                    Mostrar o relatório de fechamento de comissões sem dor de cabeça no fim de semana.
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <strong className="text-purple-400 block">Dia 7 (Fechamento PIX):</strong>
                  <span className="text-slate-400 text-[11px]">
                    Enviar a chave PIX de R$ 149 para manter o painel e os agendamentos no ar!
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => setShowTrialGuideModal(false)}
                className="w-full sm:w-1/3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
              >
                Entendi, Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowTrialGuideModal(false);
                  if (onOpenFastTrial) onOpenFastTrial();
                  else setShowCreateModal(true);
                }}
                className="w-full sm:w-2/3 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/25 transition cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Abrir Cadastro Expresso de 7 Dias Agora</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
