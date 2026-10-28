import React, { useState } from "react";
import { useBarber } from "../context/BarberContext";
import { Tenant, TenantPlan } from "../types";
import {
  Zap,
  Scissors,
  CheckCircle2,
  X,
  Share2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Building2,
  Users,
  Smartphone,
  Send,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
} from "lucide-react";

interface FastTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessNavigate?: (tenantSlug: string) => void;
}

export const FastTrialModal: React.FC<FastTrialModalProps> = ({
  isOpen,
  onClose,
  onSuccessNavigate,
}) => {
  const { createTenant, switchTenant } = useBarber();

  const [shopName, setShopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [city, setCity] = useState("São Paulo - SP");
  const [chairsCount, setChairsCount] = useState<number>(3);
  const [plan, setPlan] = useState<TenantPlan>("pro");
  const [templateMode, setTemplateMode] = useState<"sample" | "blank">("sample");

  // Success state
  const [createdTenant, setCreatedTenant] = useState<Tenant | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedBookingLink, setCopiedBookingLink] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!shopName.trim() || !ownerName.trim()) {
      alert("Por favor, preencha o Nome da Barbearia e Nome do Dono.");
      return;
    }

    const cleanSlug = shopName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const fee = plan === "starter" ? 89 : plan === "pro" ? 149 : 249;

    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const newTenant = createTenant(
      {
        name: shopName.trim(),
        slug: cleanSlug || `barbearia-${Date.now()}`,
        tagline: "Barbearia de Alto Padrão & Gestão Profissional",
        ownerName: ownerName.trim(),
        ownerEmail: `${cleanSlug || "contato"}@barbeariapro.com.br`,
        ownerPhone: ownerPhone.trim() || "(11) 98765-4321",
        address: `${city} - Brasil`,
        city: city.trim(),
        plan: plan,
        status: "trial", // 7 days trial!
        monthlyFee: fee,
        trialStartedAt: now.toISOString(),
        trialEndsAt: trialEndsAt,
        chairsCount: chairsCount,
        settings: {
          name: shopName.trim(),
          tagline: "Barbearia de Alto Padrão & Gestão Profissional",
          phone: ownerPhone.trim() || "(11) 98765-4321",
          address: `${city} - Brasil`,
          openTime: "08:30",
          closeTime: "20:00",
          currencySymbol: "R$",
          loyaltyTarget: 10,
          defaultCommissionRate: 0.5,
          themeMode: "dark",
        },
      },
      templateMode,
      chairsCount
    );

    setCreatedTenant(newTenant);
  };

  const getBaseUrl = () => {
    return typeof window !== "undefined" ? window.location.origin : "";
  };

  const tenantAdminLink = createdTenant
    ? `${getBaseUrl()}/?tenant=${createdTenant.slug}&tab=dashboard`
    : "";

  const tenantBookingLink = createdTenant
    ? `${getBaseUrl()}/?tenant=${createdTenant.slug}&tab=booking`
    : "";

  const handleCopyAdminLink = () => {
    navigator.clipboard.writeText(tenantAdminLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyBookingLink = () => {
    navigator.clipboard.writeText(tenantBookingLink);
    setCopiedBookingLink(true);
    setTimeout(() => setCopiedBookingLink(false), 2500);
  };

  const handleSendWhatsAppAccess = () => {
    if (!createdTenant) return;
    const cleanPhone = ownerPhone.replace(/\D/g, "");
    const d = new Date(createdTenant.trialEndsAt || Date.now() + 7 * 24 * 60 * 60 * 1000);
    const dateFormatted = `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()}`;

    const message = `Fala ${ownerName.trim() || "Amigo"}! 💈\n\nConforme conversamos, o sistema da *${createdTenant.name}* já está liberado com *7 DIAS DE TESTE GRÁTIS* (sem custos até ${dateFormatted})!\n\n💻 *Seu Painel Administrativo:*\n${tenantAdminLink}\n\n📅 *Link para seus Clientes Agendarem pelo WhatsApp:*\n${tenantBookingLink}\n\nJá configurei suas ${chairsCount} cadeiras e serviços modelos para você testar com a equipe na prática. Qualquer dúvida estou à disposição! 🚀`;

    const encoded = encodeURIComponent(message);
    const waUrl = cleanPhone
      ? `https://wa.me/55${cleanPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;

    window.open(waUrl, "_blank");
  };

  const handleFinishAndEnter = () => {
    if (createdTenant) {
      switchTenant(createdTenant.id);
      if (onSuccessNavigate) {
        onSuccessNavigate(createdTenant.slug);
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#181B24] rounded-3xl border border-amber-500/40 max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 text-slate-100 my-8">
        {/* If Tenant was successfully created */}
        {createdTenant ? (
          <div className="space-y-6 animate-fade-in">
            {/* Header Success */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-block">
                ⚡ 7 Dias de Teste Grátis Ativados
              </span>
              <h2 className="text-2xl font-black text-slate-100 uppercase tracking-tight">
                {createdTenant.name}
              </h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                O ambiente da barbearia foi configurado com sucesso e já está pronto para uso na hora com {chairsCount} cadeiras!
              </p>
            </div>

            {/* Quick Action: Send on WhatsApp */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/40 space-y-3">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wide">
                <Smartphone className="w-4 h-4" />
                <span>Envio Imediato para o Dono</span>
              </div>
              <p className="text-xs text-slate-300">
                Clique no botão abaixo para abrir o WhatsApp e enviar as instruções e os links de acesso diretamente para <strong className="text-emerald-300">{ownerName}</strong>:
              </p>
              <button
                onClick={handleSendWhatsAppAccess}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/25 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Disparar Acesso no WhatsApp do Dono</span>
              </button>
            </div>

            {/* Generated Links Box */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Link do Painel da Barbearia:</span>
                  </span>
                  <button
                    onClick={handleCopyAdminLink}
                    className="text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedLink ? "Copiado!" : "Copiar"}</span>
                  </button>
                </div>
                <div className="p-2 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-300 truncate border border-slate-800">
                  {tenantAdminLink}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-sky-400" />
                    <span>Link do Portal dos Clientes (Agendamento Online):</span>
                  </span>
                  <button
                    onClick={handleCopyBookingLink}
                    className="text-sky-400 hover:text-sky-300 font-bold flex items-center space-x-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedBookingLink ? "Copiado!" : "Copiar"}</span>
                  </button>
                </div>
                <div className="p-2 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-300 truncate border border-slate-800">
                  {tenantBookingLink}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-1/3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={handleFinishAndEnter}
                className="w-full sm:w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow-lg shadow-amber-500/20 transition cursor-pointer"
              >
                <span>Entrar no Painel da Barbearia Agora</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Form for immediate registration */
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-100 uppercase tracking-tight">
                    Cadastro Expresso • 7 Dias Grátis
                  </h3>
                  <p className="text-xs text-amber-300 font-semibold">
                    Cadastre a barbearia na frente do cliente em 30 segundos
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info badge */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center space-x-2.5 text-xs text-amber-200">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Sem atrito:</strong> O cliente ganha 7 dias de acesso total imediatamente. Não exige cartão de crédito e não cobra nada hoje.
              </span>
            </div>

            {/* Inputs */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nome da Barbearia *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Barbearia Vip Moema"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nome do Proprietário / Dono *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Rafael Silva"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    WhatsApp do Dono *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ex: (11) 98765-4321"
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Cidade / Bairro
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: São Paulo - SP"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Plano de Teste
                  </label>
                  <select
                    value={plan}
                    onChange={(e) => setPlan(e.target.value as TenantPlan)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="starter">Starter (R$ 89/mês)</option>
                    <option value="pro">Pro Recomendado (R$ 149/mês)</option>
                    <option value="vip">VIP Enterprise (R$ 249/mês)</option>
                  </select>
                </div>
              </div>

              {/* Number of Chairs Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Quantidade de Cadeiras / Barbeiros na Barbearia:</span>
                  <span className="text-amber-400 font-extrabold">{chairsCount} Cadeiras</span>
                </label>
                <div className="grid grid-cols-6 gap-1.5">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setChairsCount(num)}
                      className={`py-2 rounded-xl text-xs font-extrabold transition cursor-pointer border ${
                        chairsCount === num
                          ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md"
                          : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                      }`}
                    >
                      {num} {num === 1 ? "Cadeira" : "Cadeiras"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Template Mode Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Dados de Inicialização
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    onClick={() => setTemplateMode("sample")}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      templateMode === "sample"
                        ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850"
                    }`}
                  >
                    <span className="text-xs font-bold block text-slate-100">
                      Com Exemplo Pronto (Recomendado)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Já vem com cortes, preços e equipe configurados para encantar na hora.
                    </span>
                  </div>

                  <div
                    onClick={() => setTemplateMode("blank")}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      templateMode === "blank"
                        ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850"
                    }`}
                  >
                    <span className="text-xs font-bold block text-slate-100">
                      Em Branco (Clean)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Apenas o barbeiro chefe criado, catálogo limpo para preencher.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Guarantees */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>7 dias de teste grátis</span>
              </span>
              <span>●</span>
              <span>Sem fidelidade</span>
              <span>●</span>
              <span>Isolamento total de dados</span>
            </div>

            {/* Buttons */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/25 transition cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Ativar Teste de 7 Dias Agora</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
