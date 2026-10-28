import React, { useState, useEffect, useRef } from "react";
import { useBarber } from "../context/BarberContext";
import {
  Settings,
  Scissors,
  Save,
  Clock,
  Award,
  DollarSign,
  Plus,
  Trash2,
  Check,
  Building,
  Building2,
  Store,
  Phone,
  MapPin,
  Sun,
  Moon,
  Palette,
  Sparkles,
  ShieldCheck,
  HardDrive,
  Download,
  Upload,
  RotateCcw,
  Calendar,
  Package,
  Users,
  AlertTriangle,
  RefreshCw,
  FileCheck,
  History,
  ArrowRight,
} from "lucide-react";
import { BarberShopSettings, Barber, Service, BackupSnapshot, BarberShopFullBackup } from "../types";
import {
  validateAndParseBackupFile,
  getLocalStorageUsageStats,
  BackupConfig,
} from "../services/backupService";

export const SettingsView: React.FC = () => {
  const {
    tenants,
    currentTenant,
    switchTenant,
    settings,
    updateSettings,
    barbers,
    setBarbers,
    services,
    products,
    clients,
    appointments,
    sales,
    snapshots,
    backupConfig,
    updateBackupConfig,
    createManualBackup,
    restoreFromSnapshot,
    restoreFromBackupData,
    exportBackupFile,
    deleteSnapshotById,
    resetToFactoryData,
    lastBackupTime,
    backupStatus,
  } = useBarber();

  const [formSettings, setFormSettings] = useState<BarberShopSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [manualLabel, setManualLabel] = useState<string>("");
  const [backupActionToast, setBackupActionToast] = useState<string | null>(null);
  const [snapshotToRestore, setSnapshotToRestore] = useState<BackupSnapshot | null>(null);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importedBackupData, setImportedBackupData] = useState<BarberShopFullBackup | null>(null);
  const [storageStats, setStorageStats] = useState(() => getLocalStorageUsageStats());

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Refresh storage stats on changes
  useEffect(() => {
    setStorageStats(getLocalStorageUsageStats());
  }, [snapshots, appointments, sales, clients, products]);

  // Keep formSettings in sync if external change happens
  useEffect(() => {
    setFormSettings((prev) => ({
      ...prev,
      themeMode: settings.themeMode || "dark",
    }));
  }, [settings.themeMode]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formSettings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCreateSnapshot = () => {
    const label = manualLabel.trim() ? manualLabel.trim() : undefined;
    createManualBackup(label);
    setManualLabel("");
    setBackupActionToast("Ponto de Restauração criado com sucesso!");
    setTimeout(() => setBackupActionToast(null), 3000);
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = validateAndParseBackupFile(content);
      if (!result.valid || !result.data) {
        setImportError(result.error || "Arquivo de backup inválido.");
        return;
      }
      setImportedBackupData(result.data);
    };
    reader.onerror = () => {
      setImportError("Não foi possível ler o arquivo.");
    };
    reader.readAsText(file);
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const confirmRestoreImported = () => {
    if (!importedBackupData) return;
    const ok = restoreFromBackupData(importedBackupData);
    if (ok) {
      setImportedBackupData(null);
      setBackupActionToast("Backup importado e restaurado com sucesso!");
      setTimeout(() => setBackupActionToast(null), 3500);
    } else {
      setImportError("Erro ao aplicar os dados do arquivo de backup.");
    }
  };

  const confirmRestoreSnapshot = () => {
    if (!snapshotToRestore) return;
    const ok = restoreFromSnapshot(snapshotToRestore);
    if (ok) {
      setSnapshotToRestore(null);
      setBackupActionToast("Sistema restaurado para o ponto selecionado!");
      setTimeout(() => setBackupActionToast(null), 3500);
    }
  };

  const handleFactoryResetConfirm = () => {
    resetToFactoryData();
    setShowResetModal(false);
    setBackupActionToast("Dados resetados para padrão de fábrica (Snapshot de segurança gerado)!");
    setTimeout(() => setBackupActionToast(null), 3500);
  };

  const handleAddBarber = () => {
    const newId = `barber-${Date.now()}`;
    const nextChair = barbers.length + 1;
    const newBarber: Barber = {
      id: newId,
      name: "Novo Barbeiro",
      nickname: "Especialista em Degradê",
      title: "Mestre Barbeiro",
      chairNumber: nextChair,
      chairStatus: "free",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
      rating: 5.0,
      reviewCount: 1,
      commissionRate: 0.5,
      specialties: ["Degradê", "Navalha"],
      bio: "Profissional especializado em cortes modernos e clássicos.",
    };
    setBarbers([...barbers, newBarber]);
  };

  const handleRemoveBarber = (id: string) => {
    if (barbers.length <= 1) {
      alert("A barbearia precisa ter pelo menos um barbeiro ativo.");
      return;
    }
    setBarbers(barbers.filter((b) => b.id !== id));
  };

  const totalRevenueAllTime = sales.reduce((acc, s) => acc + (s.finalTotal || 0), 0);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-[#181B24] rounded-2xl border border-slate-800 p-5 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wide">
              Configurações da Barbearia &amp; Parâmetros
            </h2>
            <p className="text-xs text-slate-400">
              Dados da unidade, horários de atendimento, regras de comissão e fidelidade VIP
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold animate-fade-in">
            <Check className="w-4 h-4" />
            <span>Configurações Salvas!</span>
          </div>
        )}
      </div>

      {/* Multi-Tenant SaaS Workspace Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                SaaS Multi-Tenant
              </span>
              <span className="text-xs text-slate-400">
                Barbearia Ativa: <strong className="text-slate-100">{currentTenant.name}</strong>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Você está editando os parâmetros desta barbearia específica. As alterações ficam salvas apenas nesta unidade.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <div className="text-right hidden md:block">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total de Unidades</span>
            <span className="text-xs font-black text-amber-400">{tenants.length} Barbearias Ativas</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Bloco: Aparência & Tema Visual (Claro / Escuro) com Destaque Amber-Gold */}
        <div className="bg-[#181B24] rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wide">
                Aparência &amp; Tema Visual
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Identidade Amber-Gold</span>
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Alterne entre o tema Claro e Escuro de acordo com sua preferência ou iluminação da bancada. Ambas as versões mantêm a assinatura visual dourada de alto padrão.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Opção Modo Escuro Imperial */}
            <div
              id="theme-select-dark"
              onClick={() => {
                const updated: BarberShopSettings = { ...formSettings, themeMode: "dark" };
                setFormSettings(updated);
                updateSettings(updated);
              }}
              className={`p-4 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden ${
                (formSettings.themeMode || "dark") === "dark"
                  ? "bg-slate-900/90 border-amber-500 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500/30"
                  : "bg-slate-900/40 border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 shadow-inner">
                    <Moon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h4 className="font-black text-xs text-slate-100 uppercase tracking-wide">Modo Escuro Imperial</h4>
                      {(formSettings.themeMode || "dark") === "dark" && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500 text-slate-950">ATIVO</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">Superfície Charcoal luxo com acentos dourados e âmbar</p>
                  </div>
                </div>
                {(formSettings.themeMode || "dark") === "dark" && (
                  <span className="p-1 rounded-full bg-amber-500 text-slate-950 shadow">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                )}
              </div>

              {/* Mini Preview Box */}
              <div className="p-2.5 rounded-lg bg-[#0E1015] border border-slate-800 flex items-center justify-between text-[10px]">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-slate-300 font-medium">Barber Pro</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                    R$ 85,00
                  </span>
                  <span className="px-2 py-0.5 rounded bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black uppercase">
                    Receber
                  </span>
                </div>
              </div>
            </div>

            {/* Opção Modo Claro Dourado */}
            <div
              id="theme-select-light"
              onClick={() => {
                const updated: BarberShopSettings = { ...formSettings, themeMode: "light" };
                setFormSettings(updated);
                updateSettings(updated);
              }}
              className={`p-4 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden ${
                formSettings.themeMode === "light"
                  ? "bg-slate-900/90 border-amber-500 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500/30"
                  : "bg-slate-900/40 border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-700 shadow-inner">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h4 className="font-black text-xs text-slate-100 uppercase tracking-wide">Modo Claro Dourado</h4>
                      {formSettings.themeMode === "light" && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500 text-slate-950">ATIVO</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">Canvas claro e limpo com botões e destaques âmbar ouro</p>
                  </div>
                </div>
                {formSettings.themeMode === "light" && (
                  <span className="p-1 rounded-full bg-amber-500 text-slate-950 shadow">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                )}
              </div>

              {/* Mini Preview Box */}
              <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-between text-[10px]">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-600" />
                  <span className="text-slate-800 font-medium">Barber Pro</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 font-bold">
                    R$ 85,00
                  </span>
                  <span className="px-2 py-0.5 rounded bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black uppercase">
                    Receber
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bloco 1: Identidade da Barbearia */}
        <div className="bg-[#181B24] rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Building className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wide">
              Identidade &amp; Contato
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nome da Barbearia</label>
              <input
                type="text"
                value={formSettings.name}
                onChange={(e) => setFormSettings({ ...formSettings, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Slogan / Tagline</label>
              <input
                type="text"
                value={formSettings.tagline}
                onChange={(e) => setFormSettings({ ...formSettings, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">WhatsApp / Telefone</label>
              <input
                type="text"
                value={formSettings.phone}
                onChange={(e) => setFormSettings({ ...formSettings, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Endereço da Unidade</label>
              <input
                type="text"
                value={formSettings.address}
                onChange={(e) => setFormSettings({ ...formSettings, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Bloco 2: Regras Operacionais & Comissões */}
        <div className="bg-[#181B24] rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Clock className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wide">
              Horários de Atendimento &amp; Fidelidade
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Abertura</label>
              <input
                type="time"
                value={formSettings.openTime}
                onChange={(e) => setFormSettings({ ...formSettings, openTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Fechamento</label>
              <input
                type="time"
                value={formSettings.closeTime}
                onChange={(e) => setFormSettings({ ...formSettings, closeTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Selos para Corte Grátis</label>
              <input
                type="number"
                min={5}
                max={20}
                value={formSettings.loyaltyTarget}
                onChange={(e) => setFormSettings({ ...formSettings, loyaltyTarget: parseInt(e.target.value) || 10 })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Comissão Padrão (%)</label>
              <input
                type="number"
                min={10}
                max={90}
                value={Math.round(formSettings.defaultCommissionRate * 100)}
                onChange={(e) =>
                  setFormSettings({
                    ...formSettings,
                    defaultCommissionRate: (parseFloat(e.target.value) || 50) / 100,
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Bloco 3: Barbeiros & Cadeiras */}
        <div className="bg-[#181B24] rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Scissors className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wide">
                Equipe de Barbeiros ({barbers.length} Cadeiras)
              </h3>
            </div>
            <button
              type="button"
              onClick={handleAddBarber}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Adicionar Barbeiro</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {barbers.map((b, idx) => (
              <div
                key={b.id}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={b.avatar}
                    alt={b.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-slate-100">{b.name}</h4>
                    <p className="text-[11px] text-amber-400">
                      Cadeira #{b.chairNumber} • {Math.round(b.commissionRate * 100)}% Comissão
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveBarber(b.id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 transition"
                  title="Remover Barbeiro"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Botão de Salvar */}
        <div className="flex justify-end">
          <button
            type="submit"
            id="save-settings-btn"
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Todas as Configurações</span>
          </button>
        </div>
      </form>

      {/* ========================================================================= */}
      {/* SEÇÃO PRINCIPAL: SISTEMA DE BACKUP PERIÓDICO & SEGURANÇA DOS DADOS */}
      {/* ========================================================================= */}
      <div className="bg-[#181B24] rounded-2xl border border-emerald-500/30 p-6 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        {/* Header da Seção de Backup */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-start space-x-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base text-slate-100 uppercase tracking-wide">
                  Backup Periódico &amp; Proteção de Dados
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>LocalStorage Ativo</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Garante que agendamentos, clientes, estoque e finanças nunca sejam perdidos por refresh, fechamento ou falha do navegador.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              id="export-backup-btn"
              onClick={() => exportBackupFile()}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/40 text-slate-200 text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
              title="Baixar arquivo JSON completo com todos os dados"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Exportar Arquivo (.JSON)</span>
            </button>

            <button
              type="button"
              id="import-backup-trigger-btn"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/40 text-slate-200 text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
              title="Restaurar sistema a partir de um arquivo JSON salvo anteriormente"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>Restaurar de Arquivo</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelected}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {/* Feedback Toast */}
        {backupActionToast && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{backupActionToast}</span>
          </div>
        )}

        {/* Import Error Banner */}
        {importError && (
          <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{importError}</span>
          </div>
        )}

        {/* Cards de Métricas e Integridade do Sistema */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-semibold">Agendamentos</span>
            </div>
            <p className="text-base font-extrabold text-slate-100">{appointments.length}</p>
            <p className="text-[10px] text-emerald-400 mt-0.5">100% Protegidos</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-semibold">Vendas Realizadas</span>
            </div>
            <p className="text-base font-extrabold text-slate-100">{sales.length}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">R$ {totalRevenueAllTime.toFixed(2)}</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[11px] font-semibold">Clientes no CRM</span>
            </div>
            <p className="text-base font-extrabold text-slate-100">{clients.length}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Histórico e Fidelidade</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
              <Package className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[11px] font-semibold">Produtos em Estoque</span>
            </div>
            <p className="text-base font-extrabold text-slate-100">{products.length}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Catálogo &amp; Lotes</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 col-span-2 sm:col-span-1">
            <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
              <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-semibold">Uso no Navegador</span>
            </div>
            <p className="text-base font-extrabold text-slate-100">~{storageStats.usedKB} KB</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{storageStats.totalKeys} chaves locais</p>
          </div>
        </div>

        {/* Configurações de Frequência & Criação Manual de Ponto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Caixa 1: Frequência do Backup Automático */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-200">Rotina de Salvamento Automático</h4>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={backupConfig.autoBackupEnabled}
                  onChange={(e) => updateBackupConfig({ ...backupConfig, autoBackupEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <p className="text-[11px] text-slate-400">
              O sistema salva automaticamente uma imagem completa do estado a cada intervalo e também ao fechar/recarregar a página.
            </p>

            <div className="flex items-center space-x-3 pt-1">
              <span className="text-xs text-slate-300 font-semibold">Intervalo de Varredura:</span>
              <select
                value={backupConfig.intervalMinutes}
                disabled={!backupConfig.autoBackupEnabled}
                onChange={(e) =>
                  updateBackupConfig({
                    ...backupConfig,
                    intervalMinutes: parseInt(e.target.value) || 1,
                  })
                }
                className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              >
                <option value={1}>A cada 1 minuto (Recomendado)</option>
                <option value={2}>A cada 2 minutos</option>
                <option value={5}>A cada 5 minutos</option>
                <option value={10}>A cada 10 minutos</option>
              </select>
            </div>
          </div>

          {/* Caixa 2: Ponto de Restauração Manual Imediato */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2">
              <History className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-slate-200">Criar Ponto de Restauração Imediato</h4>
            </div>
            <p className="text-[11px] text-slate-400">
              Gere um snapshot manual antes de grandes fechamentos de caixa ou modificações de preços.
            </p>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Identificador opcional (ex: Fechamento Turno Manhã)"
                value={manualLabel}
                onChange={(e) => setManualLabel(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                id="create-manual-snapshot-btn"
                onClick={handleCreateSnapshot}
                disabled={backupStatus === "saving"}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md flex-shrink-0"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Criar Ponto</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabela de Pontos de Restauração Locais (Snapshots) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HardDrive className="w-4 h-4 text-slate-400" />
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Pontos de Restauração Salvos no Navegador ({snapshots.length})
              </h4>
            </div>
            <span className="text-[11px] text-slate-400">
              Último backup: <strong className="text-slate-200">{lastBackupTime || "Recentemente"}</strong>
            </span>
          </div>

          {snapshots.length === 0 ? (
            <div className="p-6 rounded-xl bg-slate-900/50 border border-dashed border-slate-800 text-center text-xs text-slate-500">
              Nenhum ponto de restauração gravado ainda. O sistema gravará um snapshot automaticamente.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-2.5">Ponto / Motivo</th>
                    <th className="px-4 py-2.5">Data &amp; Horário</th>
                    <th className="px-4 py-2.5">Registros Salvos</th>
                    <th className="px-4 py-2.5">Faturamento Salvo</th>
                    <th className="px-4 py-2.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                  {snapshots.map((snap, idx) => {
                    const isLatest = idx === 0;
                    return (
                      <tr key={snap.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                snap.reason === "manual"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  : snap.reason === "before_reset"
                                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              }`}
                            >
                              {snap.reason === "manual"
                                ? "Manual"
                                : snap.reason === "before_reset"
                                ? "Segurança"
                                : "Periódico"}
                            </span>
                            <span className="font-semibold text-slate-200">{snap.label}</span>
                            {isLatest && (
                              <span className="px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 text-[9px] font-bold">
                                Mais Recente
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">{snap.humanDate}</td>
                        <td className="px-4 py-3">
                          <div className="text-[11px] text-slate-300">
                            <span>{snap.stats?.appointmentsCount || 0} agendamentos</span> •{" "}
                            <span>{snap.stats?.salesCount || 0} vendas</span> •{" "}
                            <span>{snap.stats?.clientsCount || 0} clientes</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-emerald-400">
                          R$ {(snap.stats?.totalRevenue || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              type="button"
                              onClick={() => setSnapshotToRestore(snap)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold transition flex items-center space-x-1"
                              title="Restaurar barbearia para este momento"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Restaurar</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteSnapshotById(snap.id)}
                              className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                              title="Excluir este snapshot"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Zona de Redefinição com Snapshot Preventivo */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 bg-red-950/20 p-4 rounded-xl border border-red-500/20">
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <div>
              <h5 className="text-xs font-bold text-red-200">Redefinição de Fábrica dos Dados</h5>
              <p className="text-[11px] text-red-300/70">
                Restaura dados de demonstração originais. O sistema criará um snapshot de segurança antes do reset.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="factory-reset-btn"
            onClick={() => setShowResetModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-bold transition flex-shrink-0"
          >
            Redefinir Dados de Fábrica
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL DE CONFIRMAÇÃO: RESTAURAR SNAPSHOT ESPECÍFICO */}
      {/* ========================================================================= */}
      {snapshotToRestore && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#181B24] rounded-2xl border border-emerald-500/40 max-w-md w-full p-6 space-y-4 shadow-2xl animate-scaleUp text-slate-100">
            <div className="flex items-center space-x-3 text-emerald-400">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-100">Restaurar Ponto de Dados</h3>
                <p className="text-xs text-slate-400">{snapshotToRestore.humanDate}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Você está prestes a restaurar o estado da barbearia para o snapshot:{" "}
              <strong className="text-emerald-300">"{snapshotToRestore.label}"</strong>.
            </p>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-[11px] space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Agendamentos:</span>
                <span className="font-bold text-slate-200">{snapshotToRestore.stats?.appointmentsCount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vendas Registradas:</span>
                <span className="font-bold text-slate-200">{snapshotToRestore.stats?.salesCount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Faturamento no Ponto:</span>
                <span className="font-bold text-emerald-400">
                  R$ {(snapshotToRestore.stats?.totalRevenue || 0).toFixed(2)}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-amber-400/90 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Um backup preventivo do estado atual será criado antes da restauração.</span>
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setSnapshotToRestore(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                id="confirm-restore-btn"
                onClick={confirmRestoreSnapshot}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition shadow-md shadow-emerald-900/30 flex items-center space-x-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirmar e Restaurar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE CONFIRMAÇÃO: RESTAURAR DE ARQUIVO JSON */}
      {/* ========================================================================= */}
      {importedBackupData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#181B24] rounded-2xl border border-amber-500/40 max-w-md w-full p-6 space-y-4 shadow-2xl animate-scaleUp text-slate-100">
            <div className="flex items-center space-x-3 text-amber-400">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-100">Arquivo de Backup Validado</h3>
                <p className="text-xs text-slate-400">Criado em: {importedBackupData.humanDate || importedBackupData.timestamp}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              O arquivo foi analisado e está íntegro. Deseja carregar esses dados no sistema agora?
            </p>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-[11px] space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Nome da Barbearia:</span>
                <span className="font-bold text-slate-200">{importedBackupData.settings?.shopName || "Barbearia"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Agendamentos:</span>
                <span className="font-bold text-slate-200">{importedBackupData.appointments?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vendas:</span>
                <span className="font-bold text-slate-200">{importedBackupData.sales?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Barbeiros:</span>
                <span className="font-bold text-slate-200">{importedBackupData.barbers?.length || 0}</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setImportedBackupData(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
              >
                Descartar
              </button>
              <button
                type="button"
                id="confirm-import-btn"
                onClick={confirmRestoreImported}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-xs font-bold text-slate-950 transition shadow-md flex items-center space-x-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Aplicar Backup Importado</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE CONFIRMAÇÃO: REDEFINIÇÃO DE FÁBRICA */}
      {/* ========================================================================= */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#181B24] rounded-2xl border border-red-500/40 max-w-md w-full p-6 space-y-4 shadow-2xl animate-scaleUp text-slate-100">
            <div className="flex items-center space-x-3 text-red-400">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-100">Confirmar Reset de Fábrica</h3>
                <p className="text-xs text-red-400">Ação de Alta Sensibilidade</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Todos os registros atuais serão substituídos pelo modelo inicial padrão. Antes disso, o sistema criará
              automaticamente um ponto de segurança chamado{" "}
              <strong className="text-amber-300">"Segurança Pré-Reset de Fábrica"</strong> no histórico de snapshots.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                id="confirm-factory-reset-btn"
                onClick={handleFactoryResetConfirm}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition shadow-md shadow-red-900/30 flex items-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sim, Redefinir Dados</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
