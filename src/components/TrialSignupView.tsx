import React, { useState } from "react";
import { useBarber } from "../context/BarberContext";
import { TenantPlan } from "../types";
import {
  Scissors,
  Zap,
  CheckCircle2,
  Calendar,
  Users,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Clock,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Building2,
  ChevronDown,
  HelpCircle,
} from "lucide-react";

interface TrialSignupViewProps {
  onSuccessNavigate?: (tenantSlug: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const TrialSignupView: React.FC<TrialSignupViewProps> = ({
  onSuccessNavigate,
  onNavigateToTab,
}) => {
  const { createTenant, switchTenant } = useBarber();

  const [shopName, setShopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [city, setCity] = useState("São Paulo - SP");
  const [chairsCount, setChairsCount] = useState<number>(3);
  const [plan, setPlan] = useState<TenantPlan>("pro");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim() || !ownerName.trim()) {
      alert("Por favor, preencha o Nome da Barbearia e Nome do Dono.");
      return;
    }

    setIsSubmitting(true);

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
        status: "trial",
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
      "sample",
      chairsCount
    );

    setTimeout(() => {
      setIsSubmitting(false);
      switchTenant(newTenant.id);
      if (onSuccessNavigate) {
        onSuccessNavigate(newTenant.slug);
      } else if (onNavigateToTab) {
        onNavigateToTab("dashboard");
      }
    }, 400);
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#161822] via-[#12141D] to-[#0D0F15] border border-amber-500/30 p-8 sm:p-12 shadow-2xl text-center sm:text-left">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 fill-amber-300" />
              <span>Experimente Grátis por 7 Dias • Sem Cartão de Crédito</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-100 uppercase tracking-tight leading-tight">
              Coloque sua Barbearia no{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500">
                Piloto Automático
              </span>{" "}
              em 30 Segundos
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Agendamentos pelo WhatsApp que não furam, monitor de cadeiras ao vivo, comissões calculadas automaticamente e frente de caixa descomplicado. Teste completo sem pagar 1 real hoje.
            </p>

            {/* Quick Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-300 font-semibold">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero taxa de adesão</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Ativação instantânea</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Cancele quando quiser</span>
              </div>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="lg:col-span-5">
            <div className="bg-[#181B24]/90 backdrop-blur-md rounded-3xl border border-amber-500/40 p-6 sm:p-7 shadow-2xl space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-[10px] uppercase tracking-wider font-black text-amber-400 block">
                  Acesso Imediato
                </span>
                <h3 className="text-lg font-black text-slate-100 uppercase">
                  Cadastrar Barbearia na Hora
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nome da Barbearia *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Barbearia Elite"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Seu Nome (Dono) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carlos Mendes"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ex: (11) 98765-4321"
                      value={ownerPhone}
                      onChange={(e) => setOwnerPhone(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Quantas Cadeiras / Barbeiros?</span>
                    <span className="text-amber-400 font-extrabold">{chairsCount} Cadeiras</span>
                  </label>
                  <div className="grid grid-cols-5 gap-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setChairsCount(num)}
                        className={`py-1.5 rounded-lg text-xs font-black transition border ${
                          chairsCount === num
                            ? "bg-amber-500 text-slate-950 border-amber-400 shadow-sm"
                            : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-xl shadow-amber-500/25 transition cursor-pointer"
                  >
                    <Zap className="w-4 h-4 fill-slate-950" />
                    <span>
                      {isSubmitting
                        ? "Configurando Barbearia..."
                        : "🚀 Começar Meus 7 Dias Grátis Agora"}
                    </span>
                  </button>
                </div>

                <p className="text-[11px] text-center text-slate-400">
                  Ao clicar, sua barbearia é criada imediatamente. Sem cobranças por 7 dias.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase text-amber-400 tracking-wider">
            O que você vai testar nesses 7 dias
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-100 uppercase tracking-tight">
            Tudo o que sua barbearia precisa em uma única tela
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#181B24] border border-slate-800 space-y-3 hover:border-amber-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-black text-slate-100 uppercase">Agendamento 24h Online</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Seu cliente clica no link pelo WhatsApp ou Instagram e agenda sozinho em 15 segundos, escolhendo barbeiro, corte e horário.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#181B24] border border-slate-800 space-y-3 hover:border-amber-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-black text-slate-100 uppercase">Comissões Automáticas</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Zero dor de cabeça no fim de semana. O sistema divide a porcentagem de cada barbeiro na hora e emite o comprovante.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#181B24] border border-slate-800 space-y-3 hover:border-amber-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-black text-slate-100 uppercase">Monitor de Cadeiras ao Vivo</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Veja em tempo real quem está na Cadeira 1, 2 ou 3, quanto tempo falta e qual o próximo cliente a ser chamado.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#181B24] border border-slate-800 space-y-3 hover:border-amber-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-black text-slate-100 uppercase">Caixa PDV & Estoque</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Venda pomadas, óleos e bebidas junto com o corte. Controle entradas via PIX, Cartão e Dinheiro com recibo na tela.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ for Trial */}
      <section className="bg-[#14161F] rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-5">
        <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
          <HelpCircle className="w-4 h-4" />
          <span>Dúvidas Frequentes sobre o Teste de 7 Dias</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
            <h5 className="font-bold text-slate-100">Preciso colocar cartão de crédito para testar?</h5>
            <p className="text-slate-400 leading-relaxed">
              Não! O teste é 100% gratuito. Você cria sua barbearia na hora apenas informando o nome e WhatsApp.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
            <h5 className="font-bold text-slate-100">O que acontece quando os 7 dias terminarem?</h5>
            <p className="text-slate-400 leading-relaxed">
              Você poderá ativar o plano mensal via PIX ou cartão para continuar usando. Caso não queira, nenhum valor será cobrado.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
            <h5 className="font-bold text-slate-100">Meus agendamentos e clientes continuam salvos?</h5>
            <p className="text-slate-400 leading-relaxed">
              Sim! Todo histórico, clientes, serviços e comissões registrados durante os 7 dias continuam intactos na sua conta.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
            <h5 className="font-bold text-slate-100">Quantos barbeiros posso cadastrar?</h5>
            <p className="text-slate-400 leading-relaxed">
              Você pode cadastrar quantas cadeiras e barbeiros tiver no seu espaço físico, com cálculo de comissão para cada um.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
