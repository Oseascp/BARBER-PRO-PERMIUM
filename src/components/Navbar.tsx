import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useBarber } from "../context/BarberContext";
import {
  Scissors,
  LayoutDashboard,
  Calendar,
  CreditCard,
  Sparkles,
  Users,
  Send,
  BarChart3,
  Settings,
  Volume2,
  VolumeX,
  PlusCircle,
  Clock,
  ExternalLink,
  Sun,
  Moon,
  ShieldCheck,
  HardDrive,
  RefreshCw,
  Check,
  Building2,
  Store,
  ChevronDown,
  Plus,
  ArrowRight,
  Target,
  Zap,
} from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenBookingPortal: () => void;
  onOpenFastTrial?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenBookingPortal,
  onOpenFastTrial,
}) => {
  const {
    tenants,
    currentTenant,
    activeTenantId,
    switchTenant,
    settings,
    updateSettings,
    barbers,
    soundEnabled,
    setSoundEnabled,
    appointments,
    lastBackupTime,
    backupStatus,
    createManualBackup,
  } = useBarber();

  const [showBackupPopover, setShowBackupPopover] = useState(false);
  const [showTenantDropdown, setShowTenantDropdown] = useState(false);
  const [backupSuccessToast, setBackupSuccessToast] = useState(false);

  const isLight = settings.themeMode === "light";

  const handleToggleTheme = () => {
    updateSettings({
      ...settings,
      themeMode: isLight ? "dark" : "light",
    });
  };

  const handleQuickBackup = (e: React.MouseEvent) => {
    e.stopPropagation();
    createManualBackup("Backup Rápido Navbar");
    setBackupSuccessToast(true);
    setTimeout(() => {
      setBackupSuccessToast(false);
      setShowBackupPopover(false);
    }, 2000);
  };

  const activeInChairCount = barbers.filter((b) => b.chairStatus === "in_chair").length;
  const todayDateStr = new Date().toISOString().split("T")[0];
  const todayAppointmentsCount = appointments.filter((a) => a.date === todayDateStr).length;

  const NAV_ITEMS = [
    { id: "dashboard", label: "Painel Geral", icon: LayoutDashboard },
    { id: "appointments", label: "Agenda", icon: Calendar, badge: todayAppointmentsCount },
    { id: "pos", label: "Caixa PDV", icon: CreditCard },
    { id: "ai-stylist", label: "Estilista IA", icon: Sparkles, highlight: true },
    { id: "clients", label: "Clientes & VIP", icon: Users },
    { id: "marketing", label: "Marketing IA", icon: Send },
    { id: "reports", label: "Financeiro", icon: BarChart3 },
    { id: "tenants", label: "Barbearias SaaS", icon: Building2, badge: tenants.length },
    { id: "sales-kit", label: "Kit de Vendas", icon: Target, highlight: true },
    { id: "trial-signup", label: "Teste 7 Dias", icon: Zap, highlight: true },
    { id: "settings", label: "Configurações", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#12141C]/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      {/* Upper Brand & Quick Status Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Identity & Tenant Selector */}
        <div className="flex items-center space-x-3">
          <div
            onClick={() => setActiveTab("dashboard")}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 border border-amber-300/40 cursor-pointer transform hover:scale-105 transition"
          >
            <Scissors className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1
                onClick={() => setActiveTab("dashboard")}
                className="font-black text-base sm:text-lg tracking-wider uppercase text-amber-400 hover:text-amber-300 cursor-pointer drop-shadow-sm transition"
              >
                BARBER PRO PREMIUM
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm">
                SAAS
              </span>
            </div>
            <p className="text-[11px] text-amber-200/70 hidden sm:block font-medium truncate max-w-[220px]">
              {settings.name || "Sistema Master Multi-Tenant"}
            </p>
          </div>

          {/* Tenant Switcher Pill Dropdown */}
          <div className="relative ml-2 sm:ml-4">
            <button
              onClick={() => setShowTenantDropdown(!showTenantDropdown)}
              className="flex items-center space-x-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 border border-amber-500/40 hover:border-amber-400 text-left transition group cursor-pointer shadow-sm"
              title="Alternar entre Barbearias (Multi-Tenant)"
            >
              <Store className="w-3.5 h-3.5 text-amber-400 shrink-0 group-hover:scale-110 transition" />
              <div className="max-w-[110px] sm:max-w-[160px]">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-400/90 block leading-tight">
                  Barbearia Ativa
                </span>
                <span className="text-xs font-bold text-slate-100 truncate block">
                  {currentTenant.name}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-amber-400 transition" />
            </button>

            {/* Tenant Dropdown Popover */}
            <AnimatePresence>
              {showTenantDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 mt-2 w-80 p-3 bg-[#181B24] rounded-2xl border border-slate-700 shadow-2xl z-50 space-y-2 text-slate-100"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 px-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                      <Building2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Barbearias Cadastradas ({tenants.length})</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                      Multi-Tenant
                    </span>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1 pr-0.5 scrollbar-thin">
                    {tenants.map((t) => {
                      const isSelected = t.id === activeTenantId;
                      return (
                        <div
                          key={t.id}
                          onClick={() => {
                            switchTenant(t.id);
                            setShowTenantDropdown(false);
                          }}
                          className={`p-2.5 rounded-xl transition cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? "bg-amber-500/15 border border-amber-500/40 text-amber-300"
                              : "bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 text-slate-300"
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-400 shrink-0">
                              {t.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-100 truncate">
                                {t.name}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">
                                {t.city || t.address} • {t.chairsCount || 3} cadeiras
                              </p>
                            </div>
                          </div>

                          {isSelected && (
                            <Check className="w-4 h-4 text-amber-400 shrink-0 ml-2" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-slate-800 space-y-1.5">
                    <button
                      onClick={() => {
                        setShowTenantDropdown(false);
                        onOpenFastTrial?.();
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black flex items-center justify-center space-x-1.5 transition shadow-sm"
                    >
                      <Zap className="w-3.5 h-3.5 fill-slate-950" />
                      <span>+ Cadastrar Teste 7 Dias (Na Hora)</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowTenantDropdown(false);
                        setActiveTab("tenants");
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center space-x-1.5 transition"
                    >
                      <Building2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Gerenciar Barbearias (Painel SaaS)</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Center: Live Chair Quick Pill */}
        <div className="hidden lg:flex items-center space-x-3 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800">
          <div className="flex items-center space-x-1.5 text-xs text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold">{activeInChairCount} de {barbers.length} Cadeiras em Atendimento</span>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Backup Status Pill & Quick Action */}
          <div className="relative">
            <button
              id="nav-backup-status-btn"
              onClick={() => setShowBackupPopover(!showBackupPopover)}
              title="Status do Backup Local Automático"
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-xs text-slate-300 transition group"
            >
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                  backupStatus === "saving" ? "bg-amber-400" : "bg-emerald-400"
                } opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  backupStatus === "saving" ? "bg-amber-500" : "bg-emerald-500"
                }`}></span>
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition" />
              <span className="text-[11px] font-bold text-slate-300 hidden xl:inline">
                {backupStatus === "saving" ? "Salvando..." : "Backup"}
              </span>
            </button>

            {/* Popover Dropdown */}
            <AnimatePresence>
              {showBackupPopover && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-72 p-4 bg-[#181B24] rounded-2xl border border-slate-700 shadow-2xl z-50 space-y-3 text-slate-100"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-100">Proteção de Dados Local</h4>
                        <p className="text-[10px] text-emerald-400 flex items-center space-x-1">
                          <span>●</span> <span>Auto-Backup a cada 1 min</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 space-y-1 bg-slate-900/70 p-2.5 rounded-xl border border-slate-800">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Último Ponto:</span>
                      <span className="font-semibold text-slate-200">
                        {lastBackupTime ? lastBackupTime.split(" ")[1] || lastBackupTime : "Agora"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span className="text-emerald-400 font-bold">100% Sincronizado</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Persistência:</span>
                      <span className="text-slate-200">Navegador LocalStorage</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <button
                      onClick={handleQuickBackup}
                      disabled={backupStatus === "saving"}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-900/30"
                    >
                      {backupSuccessToast ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-200" />
                          <span>Ponto Criado com Sucesso!</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className={`w-3.5 h-3.5 ${backupStatus === "saving" ? "animate-spin" : ""}`} />
                          <span>Forçar Backup Imediato</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setShowBackupPopover(false);
                        setActiveTab("settings");
                      }}
                      className="w-full py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition text-center"
                    >
                      Gerenciar Pontos &amp; Exportar JSON
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Theme Switcher Toggle */}
          <button
            id="nav-theme-toggle-btn"
            onClick={handleToggleTheme}
            title={isLight ? "Mudar para Modo Escuro Imperial" : "Mudar para Modo Claro Dourado"}
            className={`p-2 rounded-xl border transition flex items-center space-x-1.5 ${
              isLight
                ? "bg-amber-100/80 border-amber-300 text-amber-700 hover:bg-amber-100"
                : "bg-slate-900 border-amber-500/40 text-amber-400 hover:bg-slate-800"
            }`}
          >
            {isLight ? (
              <>
                <Sun className="w-4 h-4 text-amber-600" />
                <span className="text-[11px] font-bold hidden xl:inline">Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-amber-400" />
                <span className="text-[11px] font-bold hidden xl:inline">Escuro</span>
              </>
            )}
          </button>

          {/* Sound Synthesizer Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? "Efeitos Sonoros Ativados" : "Efeitos Sonoros Desativados"}
            className={`p-2 rounded-xl border transition ${
              soundEnabled
                ? "bg-slate-900 border-amber-500/40 text-amber-400"
                : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Fast 7-Day Trial Button */}
          <button
            onClick={onOpenFastTrial}
            id="nav-fast-trial-btn"
            title="Cadastrar Barbearia em Teste de 7 Dias na Hora (30 segundos)"
            className="px-2.5 sm:px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-extrabold text-xs transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">⚡ Teste 7 Dias</span>
          </button>

          {/* Client Booking Self-Service Portal Button */}
          <button
            onClick={onOpenBookingPortal}
            id="nav-booking-portal-btn"
            className="px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs tracking-wide transition shadow-lg shadow-amber-500/20 flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Agendar Online</span>
            <span className="sm:hidden">Agendar</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Sub-Bar (Responsive Scrollable Tabs) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/80">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center space-x-2 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap group ${
                  isActive
                    ? "text-slate-950"
                    : item.highlight
                    ? "text-amber-300 hover:text-amber-200"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                }`}
              >
                {/* Motion Sliding Pill Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="navbar-active-tab-indicator"
                    className="absolute inset-0 bg-amber-500 rounded-xl shadow-md shadow-amber-500/20"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}

                {/* Optional Highlight border for special tabs when inactive */}
                {!isActive && item.highlight && (
                  <div className="absolute inset-0 rounded-xl bg-amber-500/10 border border-amber-500/30 -z-0" />
                )}

                <span className="relative z-10 flex items-center space-x-2">
                  <Icon
                    className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 ${
                      isActive
                        ? "text-slate-950"
                        : item.highlight
                        ? "text-amber-400"
                        : "text-slate-400 group-hover:text-slate-200"
                    }`}
                  />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black transition-colors ${
                        isActive
                          ? "bg-slate-950 text-amber-400"
                          : "bg-slate-800 text-slate-200 group-hover:bg-slate-700"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
