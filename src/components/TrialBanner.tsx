import React, { useState } from "react";
import { useBarber } from "../context/BarberContext";
import {
  Clock,
  Sparkles,
  CreditCard,
  CheckCircle2,
  X,
  Share2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Zap,
} from "lucide-react";

export const TrialBanner: React.FC = () => {
  const { currentTenant, convertTrialToActive, settings } = useBarber();
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  const [copiedPix, setCopiedPix] = useState<boolean>(false);
  const [copiedShareLink, setCopiedShareLink] = useState<boolean>(false);

  // If current tenant is not in trial mode, do not display
  if (currentTenant.status !== "trial") {
    return null;
  }

  // Calculate days remaining
  const now = new Date().getTime();
  let daysRemaining = 7;
  let formattedEndDate = "";

  if (currentTenant.trialEndsAt) {
    const end = new Date(currentTenant.trialEndsAt).getTime();
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    daysRemaining = Math.max(0, diffDays);
    const d = new Date(currentTenant.trialEndsAt);
    formattedEndDate = `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()}`;
  } else {
    // Default fallback
    const futureDate = new Date(now + 7 * 24 * 60 * 60 * 1000);
    formattedEndDate = `${String(futureDate.getDate()).padStart(2, "0")}/${String(
      futureDate.getMonth() + 1
    ).padStart(2, "0")}/${futureDate.getFullYear()}`;
  }

  const pixKey = "financeiro@barberprosaas.com.br";
  const monthlyValue = currentTenant.monthlyFee || 149;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const handleCopyClientBookingLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const link = `${origin}/?tenant=${currentTenant.slug}&tab=booking`;
    navigator.clipboard.writeText(link);
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 2500);
  };

  const handleConfirmActivation = () => {
    convertTrialToActive(currentTenant.id);
    setShowUpgradeModal(false);
  };

  return (
    <>
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-slate-950 px-4 py-2.5 shadow-lg border-b border-amber-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Left: Info */}
          <div className="flex items-center space-x-2.5 text-center sm:text-left">
            <span className="p-1 rounded-lg bg-slate-950/20 text-slate-950 font-black shrink-0">
              <Clock className="w-4 h-4 animate-pulse" />
            </span>
            <div className="text-xs">
              <span className="font-black uppercase tracking-wider bg-slate-950 text-amber-300 px-2 py-0.5 rounded text-[10px] mr-1.5 shadow-sm">
                Período de Teste Grátis
              </span>
              <span className="font-extrabold text-slate-950">
                {daysRemaining > 0
                  ? `Restam ${daysRemaining} ${daysRemaining === 1 ? "dia" : "dias"} de teste gratuito!`
                  : "Período de teste encerrando hoje!"}
              </span>{" "}
              <span className="hidden md:inline text-slate-900 font-medium">
                (Expira em {formattedEndDate}) • Todos os seus agendamentos, clientes e dados estão salvos.
              </span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyClientBookingLink}
              title="Copiar link de agendamento online dos seus clientes"
              className="px-2.5 py-1.5 rounded-xl bg-slate-950/15 hover:bg-slate-950/25 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {copiedShareLink ? "Link Copiado!" : "Link dos Clientes"}
              </span>
            </button>

            <button
              onClick={() => setShowUpgradeModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-300 font-black text-xs uppercase tracking-wide flex items-center space-x-1.5 shadow-md hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Ativar Plano Definitivo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Upgrade / Payment Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181B24] rounded-3xl border border-amber-500/40 max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 text-slate-100 animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-100 uppercase tracking-tight">
                    Ativar Assinatura Barber Pro
                  </h3>
                  <p className="text-xs text-amber-300 font-semibold">
                    {currentTenant.name} • Plano {currentTenant.plan.toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Trial Recap */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-slate-900 border border-amber-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Status Atual:</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {daysRemaining} dias de teste restantes
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ao ativar sua assinatura definitiva, sua barbearia continuará operando sem nenhuma interrupção, com suporte prioritário e todos os agendamentos mantidos.
              </p>
            </div>

            {/* Price & Pix Payment */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                <div>
                  <span className="text-xs text-slate-400 block font-semibold">Mensalidade do Plano:</span>
                  <span className="text-xs text-slate-200">Acesso ilimitado a todas as cadeiras</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-400">
                    {settings.currencySymbol} {monthlyValue}
                  </span>
                  <span className="text-[11px] text-slate-400 block">/mês</span>
                </div>
              </div>

              {/* Pix Info */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Chave PIX para Ativação:</span>
                  </span>
                  <button
                    onClick={handleCopyPix}
                    className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedPix ? "Copiado!" : "Copiar Chave"}</span>
                  </button>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 break-all select-all flex items-center justify-between">
                  <span>{pixKey}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Favorecido: Plataforma Barber Pro SaaS • Ativação Imediata
                </p>
              </div>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Sem fidelidade obrigatória</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Suporte técnico WhatsApp</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="w-full sm:w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
              >
                Continuar Testando Grátis
              </button>
              <button
                type="button"
                onClick={handleConfirmActivation}
                className="w-full sm:w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar e Ativar Agora</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
