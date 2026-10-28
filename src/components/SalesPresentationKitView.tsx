import React, { useState } from "react";
import { useBarber } from "../context/BarberContext";
import {
  Presentation,
  Target,
  Calculator,
  MessageSquare,
  FileText,
  Sparkles,
  CheckCircle2,
  Copy,
  Send,
  TrendingUp,
  DollarSign,
  Scissors,
  ShieldCheck,
  Award,
  ArrowRight,
  Clock,
  Printer,
  Share2,
  Play,
  Check,
  Zap,
  Users,
  Store,
  ChevronRight,
  HelpCircle,
  Smartphone,
  Calendar,
  AlertCircle,
} from "lucide-react";

interface SalesPresentationKitViewProps {
  onNavigateToTab: (tab: string) => void;
  onOpenFastTrial?: () => void;
}

export const SalesPresentationKitView: React.FC<SalesPresentationKitViewProps> = ({
  onNavigateToTab,
  onOpenFastTrial,
}) => {
  const { currentTenant, tenants } = useBarber();

  const [activeSubTab, setActiveSubTab] = useState<
    "pitch" | "calculator" | "scripts" | "proposal" | "tour"
  >("pitch");

  // Pitch Deck Slide State
  const [pitchSlide, setPitchSlide] = useState<number>(0);

  // ROI Calculator State
  const [roiBarbersCount, setRoiBarbersCount] = useState<number>(3);
  const [roiPricePerCut, setRoiPricePerCut] = useState<number>(55);
  const [roiMonthlyNoShows, setRoiMonthlyNoShows] = useState<number>(18);
  const [roiHoursOnCommission, setRoiHoursOnCommission] = useState<number>(12);
  const [selectedPlanPrice, setSelectedPlanPrice] = useState<number>(149);

  // Calculations
  const monthlyLossWithNoShows = roiMonthlyNoShows * roiPricePerCut;
  const estimatedRecoveredRevenue = Math.round(monthlyLossWithNoShows * 0.7); // 70% reduction in no-shows
  const netProfitWithSystem = estimatedRecoveredRevenue - selectedPlanPrice;
  const roiMultiplier = Math.max(1, Math.round(estimatedRecoveredRevenue / selectedPlanPrice));

  // Proposal Generator State
  const [clientShopName, setClientShopName] = useState<string>("Barbearia Silva & Filhos");
  const [clientOwnerName, setClientOwnerName] = useState<string>("Marcos Silva");
  const [clientCity, setClientCity] = useState<string>("São Paulo - SP");
  const [proposalPlan, setProposalPlan] = useState<"starter" | "pro" | "vip">("pro");
  const [proposalPrice, setProposalPrice] = useState<number>(149);
  const [freeTrialDays, setFreeTrialDays] = useState<number>(7);
  const [copiedProposalText, setCopiedProposalText] = useState<boolean>(false);

  // Copy status for scripts
  const [copiedScriptIndex, setCopiedScriptIndex] = useState<number | null>(null);

  const PITCH_SLIDES = [
    {
      title: "O Maior Desafio do Dono de Barbearia",
      subtitle: "Tempo perdido com caderninho e dinheiro sumindo no fim do mês",
      badge: "Problema Real",
      color: "from-rose-500/20 to-amber-500/10",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-rose-500/30 space-y-2">
              <span className="text-rose-400 font-extrabold text-xs uppercase block">1. Clientes que Faltam (No-Show)</span>
              <p className="text-xs text-slate-300">
                O cliente marca e não aparece. A cadeira fica vazia e o barbeiro perde a comissão e a barbearia o faturamento.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/30 space-y-2">
              <span className="text-amber-400 font-extrabold text-xs uppercase block">2. Fechamento de Comissões</span>
              <p className="text-xs text-slate-300">
                Todo fim de semana horas calculando porcentagem de cada barbeiro na calculadora, gerando desconfiança e estresse.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/80 border border-sky-500/30 space-y-2">
              <span className="text-sky-400 font-extrabold text-xs uppercase block">3. WhatsApp Travando</span>
              <p className="text-xs text-slate-300">
                Dono respondendo cliente de madrugada ou perdendo agendamentos enquanto está ocupado na cadeira cortando cabelo.
              </p>
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-center font-bold">
            💡 Como o BARBER PRO resolve tudo isso em 1 único sistema por menos de R$ 5 por dia?
          </div>
        </div>
      ),
    },
    {
      title: "PDV Frente de Caixa & Comissões Automáticas",
      subtitle: "Acabe com a confusão financeira da equipe em 1 clique",
      badge: "Módulo Caixa",
      color: "from-emerald-500/20 to-teal-500/10",
      content: (
        <div className="space-y-3.5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2.5">
              <div className="flex items-start space-x-2 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Cálculo Automático por Barbeiro:</strong> Defina comissões de 50%, 55%, 60% e o sistema calcula centavo por centavo a cada serviço ou produto vendido.</span>
              </div>
              <div className="flex items-start space-x-2 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Comprovante Digital &amp; Recibo:</strong> Emissão instantânea de recibo com detalhes de corte e gorjeta.</span>
              </div>
              <div className="flex items-start space-x-2 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Baixa Automática de Estoque:</strong> Vendeu uma pomada ou cerveja? O estoque é atualizado em tempo real.</span>
              </div>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center flex flex-col justify-center items-center">
              <span className="text-[11px] text-slate-400 uppercase font-bold">Economia Média de Tempo</span>
              <span className="text-3xl font-black text-emerald-400 my-1">15 Horas / mês</span>
              <span className="text-xs text-slate-300">Tempo livre para o dono cortar mais cabelo ou descansar</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Agendamento Online 24h & Lembretes no WhatsApp",
      subtitle: "Sua barbearia agendando clientes até de madrugada sem esforço",
      badge: "Zero Faltas",
      color: "from-sky-500/20 to-indigo-500/10",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <span className="text-sky-400 font-bold text-xs uppercase flex items-center space-x-1.5">
                <Smartphone className="w-4 h-4" />
                <span>Link Próprio da Barbearia</span>
              </span>
              <p className="text-xs text-slate-300">
                O cliente entra pelo celular, vê as fotos dos barbeiros, escolhe o serviço e seleciona o melhor horário disponível na grade em 30 segundos.
              </p>
            </div>
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <span className="text-emerald-400 font-bold text-xs uppercase flex items-center space-x-1.5">
                <Send className="w-4 h-4" />
                <span>Confirmações &amp; Lembretes</span>
              </span>
              <p className="text-xs text-slate-300">
                Lembrete automático com data, horário, barbeiro e endereço enviado direto para o WhatsApp do cliente 2 horas antes do atendimento.
              </p>
            </div>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 text-center font-bold">
            🎯 Redução comprovada de até 70% nos esquecimentos e clientes que faltam!
          </div>
        </div>
      ),
    },
    {
      title: "Diferencial Exclusivo: Inteligência Artificial & Visagismo",
      subtitle: "A única plataforma com Consultor de Estilo e Marketing IA integrados",
      badge: "Inovação",
      color: "from-amber-500/20 to-yellow-500/10",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-amber-500/30 space-y-1.5">
              <span className="text-amber-400 font-bold text-xs uppercase flex items-center space-x-1">
                <Sparkles className="w-4 h-4" />
                <span>Consultor Visagista IA</span>
              </span>
              <p className="text-xs text-slate-300">
                Diagnóstico técnico de corte de acordo com o formato do rosto (oval, quadrado, redondo), textura do fio e estilo de barba para encantar o cliente na cadeira.
              </p>
            </div>
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-amber-500/30 space-y-1.5">
              <span className="text-amber-400 font-bold text-xs uppercase flex items-center space-x-1">
                <Target className="w-4 h-4" />
                <span>Campanhas de Resgate IA</span>
              </span>
              <p className="text-xs text-slate-300">
                Cria textos irresistíveis de WhatsApp para trazer de volta clientes que não cortam há mais de 15 dias, enchendo a agenda de terça e quarta-feira.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Proposta Irrecusável: 7 Dias de Teste Grátis",
      subtitle: "Implantação em 5 minutos, sem fidelidade e sem risco",
      badge: "Fechamento",
      color: "from-amber-500/30 to-emerald-500/20",
      content: (
        <div className="space-y-4 text-center">
          <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-2">
            <span className="text-amber-400 font-black text-sm uppercase block">Oferta de Boas-Vindas</span>
            <p className="text-xs text-slate-300">
              Cadastramos sua barbearia agora em 5 minutos. Você e seus barbeiros usam a semana inteira. Se não economizarem tempo e não aprovarem, não pagam nada!
            </p>
            <div className="pt-2">
              <span className="text-xs text-slate-400">Planos a partir de apenas: </span>
              <strong className="text-lg text-emerald-400 font-black">R$ 89,00 / mês</strong>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const SALES_SCRIPTS = [
    {
      title: "Script 1: Abordagem Presencial (Cadastrar na Hora em 30 Segundos)",
      description: "O script definitivo para quando você visitar uma barbearia pessoalmente e quebrar qualquer resistência.",
      text: `Fala [Nome do Dono], tudo bom? Cara, vi o movimento da sua barbearia e o padrão de corte de vocês, sensacional!

Não vim aqui te vender nada hoje nem te tomar tempo. Eu sou o desenvolvedor da plataforma Barber Pro aqui na região.

O sistema faz 3 coisas que mudam o seu dia a dia:
1. Seus clientes agendam sozinhos pelo WhatsApp 24h sem você precisar parar a tesoura pra responder
2. Lembretes automáticos que reduzem o esquecimento (no-show) em mais de 70%
3. No fim da semana, divide a comissão de cada barbeiro na hora em 1 clique

Quero deixar rodando aqui na sua barbearia por 7 dias grátis pra você e sua equipe testarem na prática. Se não aprovar, não me deve 1 centavo.

Leva 30 segundos no meu celular pra eu cadastrar seu nome e suas cadeiras. Posso colocar no ar agora?`,
    },
    {
      title: "Script 2: Primeiro Contato Rápido no WhatsApp (Abordagem Fria)",
      description: "Ideal para mandar para donos de barbearias que você encontrou no Google Maps ou Instagram.",
      text: `Fala [Nome do Dono], tudo certo? Vi as fotos da [Nome da Barbearia] no Instagram, parabéns pelo padrão dos cortes!

Trabalho exclusivamente com sistemas de gestão e agendamento para barbearias. Desenvolvemos uma plataforma que:
1. Elimina as faltas com lembretes automáticos no WhatsApp
2. Fecha as comissões dos seus barbeiros em 1 clique no final do dia
3. Dá um link elegante de agendamento online para colocar na bio do Instagram

Você teria 3 minutinhos amanhã para eu te mostrar como funciona na prática? Posso liberar 7 dias de teste grátis para você testar com seus barbeiros sem compromisso e sem precisar de cartão!`,
    },
    {
      title: "Script 3: Quebra de Objeção ('Já uso caderninho / planilha e dá certo')",
      description: "Use quando o dono disser que já anota tudo no papel ou no Excel.",
      text: `Entendo perfeitamente, [Nome do Dono]! O papel funciona muito bem no início. 

A grande questão é quanto tempo e dinheiro você perde:
- Quando um cliente falta sem avisar, você perde R$ 50 a R$ 70 na hora.
- No fim da semana, você perde 2 a 3 horas calculando quanto repassar para cada barbeiro.

Nosso sistema se paga sozinho: recuperando apenas 2 cortes por mês com os lembretes automáticos, a mensalidade já sai de graça e você ainda ganha 15 horas livres no mês.

Bora fazer um teste de 7 dias sem custo? Eu cadastro seus barbeiros em 30 segundos para você ver a diferença.`,
    },
    {
      title: "Script 4: Quebra de Objeção ('Achei caro' ou 'Não tenho dinheiro agora')",
      description: "Use para mostrar que o sistema dá lucro ao invés de despesa.",
      text: `Te entendo, [Nome do Dono]! Cuidar dos custos da barbearia é fundamental.

Mas faz uma conta rápida comigo: nosso plano custa R$ 149 por mês. Isso dá menos de R$ 5 por dia — é menos do que o valor de UMA pomada ou UM corte por mês!

Se o sistema te ajudar a evitar que 2 clientes faltem no mês, ele já colocou mais de R$ 100 de lucro líquido no seu bolso. 

Você não gasta nada para testar: te dou 7 dias grátis. Se não gostar, cancela sem pagar nada. O que acha?`,
    },
    {
      title: "Script 5: Acompanhamento Dia 3 do Teste (Comprovação de Valor)",
      description: "Mande no 3º dia para engajar o dono e mostrar os primeiros resultados.",
      text: `Fala [Nome do Dono]! Como estão indo os primeiros dias com o Barber Pro?

Passei para dar uma dica rápida: vi que alguns clientes já usaram o link para marcar horário. Notou como economiza seu tempo de ficar digitando no WhatsApp enquanto corta cabelo?

Qualquer dúvida com o fechamento de comissões ou cadastro de novos barbeiros me dá um toque aqui!`,
    },
    {
      title: "Script 6: Fechamento no Dia 7 (Envio do PIX da Mensalidade)",
      description: "Mensagem objetiva no 7º dia para converter o trial em cliente pagante definitivo.",
      text: `Fala [Nome do Dono], tudo ótimo? 💈

Hoje encerram os 7 dias de cortesia do Barber Pro na [Nome da Barbearia]!

Vi que a equipe usou bastante e todos os seus agendamentos, clientes e histórico de cortes já estão cadastrados com segurança.

Para manter o sistema ativo sem interrupção e continuar recebendo agendamentos 24h, segue a chave PIX do seu plano PRO (R$ 149,00/mês):

🔑 Chave PIX: [Sua Chave PIX aqui]
Favorecido: [Seu Nome ou Empresa]
Valor: R$ 149,00

Assim que fizer o PIX, me manda o comprovante por aqui que já emito a confirmação e garanto seu acesso pelos próximos 30 dias! 🚀`,
    },
  ];

  const handleCopyScript = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedScriptIndex(index);
    setTimeout(() => setCopiedScriptIndex(null), 2500);
  };

  const handlePrintProposal = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-14">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#161a24] to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-1.5">
              <Target className="w-4 h-4 text-amber-400" />
              <span>Kit de Vendas &amp; Demonstração Comercial para Donos de Barbearia</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100 uppercase tracking-wide">
              Central do Vendedor • Barber Pro SaaS
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl mt-1">
              Ferramentas interativas, calculadora de retorno (ROI), roteiros de abordagem no WhatsApp
              e proposta comercial pronta para você apresentar e fechar clientes com facilidade.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenFastTrial && (
              <button
                onClick={onOpenFastTrial}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>⚡ Cadastrar Teste 7 Dias na Hora</span>
              </button>
            )}

            <button
              onClick={() => onNavigateToTab("tenants")}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
            >
              <Store className="w-4 h-4 text-amber-400" />
              <span>Ver Barbearias Cadastradas</span>
            </button>
          </div>
        </div>

        {/* Sub-tabs Navigation */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pt-6 border-t border-slate-800/80 mt-6 scrollbar-none">
          {[
            { id: "pitch", label: "Apresentação Interativa (Slides)", icon: Presentation },
            { id: "calculator", label: "Calculadora de Retorno (ROI)", icon: Calculator },
            { id: "scripts", label: "Scripts de WhatsApp & Vendas", icon: MessageSquare },
            { id: "proposal", label: "Proposta Comercial", icon: FileText },
            { id: "tour", label: "Roteiro de Demonstração (3 min)", icon: Play },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                    : "bg-slate-950/60 hover:bg-slate-800 text-slate-300 border border-slate-800"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-slate-950" : "text-amber-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-TAB 1: APRESENTAÇÃO INTERATIVA (PITCH SLIDES) */}
      {activeSubTab === "pitch" && (
        <div className="space-y-4">
          <div className="bg-[#12141C] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            {/* Slide Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  {PITCH_SLIDES[pitchSlide].badge} • Slide {pitchSlide + 1} de {PITCH_SLIDES.length}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-wide mt-2">
                  {PITCH_SLIDES[pitchSlide].title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {PITCH_SLIDES[pitchSlide].subtitle}
                </p>
              </div>

              <div className="flex items-center space-x-1.5">
                {PITCH_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPitchSlide(idx)}
                    className={`w-3 h-3 rounded-full transition ${
                      pitchSlide === idx ? "bg-amber-400 scale-125" : "bg-slate-700 hover:bg-slate-600"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Slide Body */}
            <div className="min-h-[220px] flex flex-col justify-center">
              {PITCH_SLIDES[pitchSlide].content}
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-6">
              <button
                disabled={pitchSlide === 0}
                onClick={() => setPitchSlide((p) => Math.max(0, p - 1))}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold disabled:opacity-30 disabled:pointer-events-none transition"
              >
                ← Slide Anterior
              </button>

              <button
                onClick={() => onNavigateToTab("dashboard")}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold border border-slate-700 transition flex items-center space-x-1.5"
              >
                <span>Mostrar Sistema ao Vivo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                disabled={pitchSlide === PITCH_SLIDES.length - 1}
                onClick={() => setPitchSlide((p) => Math.min(PITCH_SLIDES.length - 1, p + 1))}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold disabled:opacity-30 disabled:pointer-events-none transition shadow"
              >
                Próximo Slide →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: CALCULADORA DE RETORNO DO INVESTIMENTO (ROI) */}
      {activeSubTab === "calculator" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs Section */}
          <div className="lg:col-span-6 bg-[#12141C] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                <Calculator className="w-4 h-4" />
                <span>Simulador de Lucro para o Cliente</span>
              </div>
              <h3 className="text-lg font-black text-slate-100 uppercase">
                Quanto o Cliente Deixa de Perder Todo Mês?
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Preencha os dados reais da barbearia do cliente durante a conversa para mostrar que o sistema se paga sozinho.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 font-semibold mb-1">
                  <span>Número de Barbeiros na Equipe:</span>
                  <span className="text-amber-400 font-bold">{roiBarbersCount} barbeiros</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={15}
                  value={roiBarbersCount}
                  onChange={(e) => setRoiBarbersCount(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-semibold mb-1">
                  <span>Valor Médio do Corte de Cabelo:</span>
                  <span className="text-emerald-400 font-bold">R$ {roiPricePerCut},00</span>
                </div>
                <input
                  type="range"
                  min={25}
                  max={150}
                  step={5}
                  value={roiPricePerCut}
                  onChange={(e) => setRoiPricePerCut(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-semibold mb-1">
                  <span>Clientes que Faltam por Mês sem Avisar (No-shows):</span>
                  <span className="text-rose-400 font-bold">{roiMonthlyNoShows} faltas / mês</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={60}
                  value={roiMonthlyNoShows}
                  onChange={(e) => setRoiMonthlyNoShows(Number(e.target.value))}
                  className="w-full accent-rose-500"
                />
                <span className="text-[10px] text-slate-500">Média de 1 a 2 faltas por barbeiro por semana</span>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-semibold mb-1">
                  <span>Horas Gastas Fechando Comissões no Papel:</span>
                  <span className="text-sky-400 font-bold">{roiHoursOnCommission} horas / mês</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={30}
                  value={roiHoursOnCommission}
                  onChange={(e) => setRoiHoursOnCommission(Number(e.target.value))}
                  className="w-full accent-sky-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="block text-slate-400 font-semibold mb-1.5">Plano Sugerido:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPlanPrice(89)}
                    className={`p-2 rounded-xl border text-center transition ${
                      selectedPlanPrice === 89
                        ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold"
                        : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    Starter R$ 89
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPlanPrice(149)}
                    className={`p-2 rounded-xl border text-center transition ${
                      selectedPlanPrice === 149
                        ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold"
                        : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    PRO R$ 149
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPlanPrice(249)}
                    className={`p-2 rounded-xl border text-center transition ${
                      selectedPlanPrice === 249
                        ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold"
                        : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    VIP R$ 249
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-6 bg-[#12141C] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                Resultado do Diagnóstico
              </span>
              <h3 className="text-xl font-black text-slate-100 uppercase">
                O Sistema se Paga Sozinho no Primeiro Mês
              </h3>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-rose-300 font-bold uppercase block">
                    Prejuízo Mensal Atual (Sem o Barber Pro)
                  </span>
                  <span className="text-xs text-slate-400">Com clientes que esquecem e faltam</span>
                </div>
                <div className="text-xl font-black text-rose-400 font-mono">
                  - R$ {monthlyLossWithNoShows.toFixed(2)}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-emerald-300 font-bold uppercase block">
                    Receita Recuperada com Lembretes WhatsApp
                  </span>
                  <span className="text-xs text-slate-400">Redução estimada de 70% nos no-shows</span>
                </div>
                <div className="text-xl font-black text-emerald-400 font-mono">
                  + R$ {estimatedRecoveredRevenue.toFixed(2)}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Investimento no Sistema:</span>
                  <span className="font-bold text-slate-100">R$ {selectedPlanPrice.toFixed(2)} / mês</span>
                </div>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Tempo de Gestão Economizado:</span>
                  <span className="font-bold text-sky-400">{roiHoursOnCommission} horas livres</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-emerald-400 pt-2 border-t border-slate-800">
                  <span>Lucro Líquido Adicionado:</span>
                  <span className="font-mono text-base">+ R$ {netProfitWithSystem.toFixed(2)} / mês</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-center">
              <span className="text-xs text-amber-200 font-bold block">
                🎯 Retorno de {roiMultiplier}x sobre o valor da mensalidade!
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Recuperando apenas {Math.ceil(selectedPlanPrice / roiPricePerCut)} cortes por mês, a assinatura já sai de graça.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: SCRIPTS PRONTOS DE WHATSAPP E INSTAGRAM */}
      {activeSubTab === "scripts" && (
        <div className="space-y-4">
          <div className="bg-[#12141C] border border-slate-800 rounded-2xl p-5 shadow">
            <h3 className="text-base font-bold text-slate-100 uppercase">
              Roteiros Prontos de Abordagem &amp; Quebra de Objeções
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Copie e cole diretamente nas conversas com donos de barbearia no WhatsApp ou Instagram.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SALES_SCRIPTS.map((script, idx) => {
              const isCopied = copiedScriptIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-[#12141C] border border-slate-800 rounded-2xl p-5 shadow flex flex-col justify-between space-y-3"
                >
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">{script.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5 italic">{script.description}</p>
                    <div className="mt-3 p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-300 font-mono whitespace-pre-line leading-relaxed">
                      {script.text}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleCopyScript(script.text, idx)}
                      className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition ${
                        isCopied
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Texto Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-amber-400" />
                          <span>Copiar Mensagem</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: GERADOR DE PROPOSTA COMERCIAL */}
      {activeSubTab === "proposal" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Customizer */}
          <div className="lg:col-span-5 bg-[#12141C] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
                Personalizar Proposta
              </span>
              <h3 className="text-lg font-black text-slate-100 uppercase">
                Dados do Cliente
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Nome da Barbearia do Cliente</label>
                <input
                  type="text"
                  value={clientShopName}
                  onChange={(e) => setClientShopName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Nome do Dono / Responsável</label>
                <input
                  type="text"
                  value={clientOwnerName}
                  onChange={(e) => setClientOwnerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Cidade / Estado</label>
                <input
                  type="text"
                  value={clientCity}
                  onChange={(e) => setClientCity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Plano Proposto</label>
                  <select
                    value={proposalPlan}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setProposalPlan(val);
                      if (val === "starter") setProposalPrice(89);
                      else if (val === "pro") setProposalPrice(149);
                      else setProposalPrice(249);
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100"
                  >
                    <option value="starter">Starter (R$ 89)</option>
                    <option value="pro">PRO (R$ 149)</option>
                    <option value="vip">VIP Enterprise (R$ 249)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Dias de Teste Grátis</label>
                  <select
                    value={freeTrialDays}
                    onChange={(e) => setFreeTrialDays(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100"
                  >
                    <option value={7}>7 Dias Grátis</option>
                    <option value={10}>10 Dias Grátis</option>
                    <option value={14}>14 Dias Grátis</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handlePrintProposal}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center space-x-1.5 transition border border-slate-700"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / PDF</span>
                </button>
              </div>
            </div>
          </div>

          {/* Proposal Document Preview */}
          <div className="lg:col-span-7 bg-[#151824] border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-5 text-slate-200">
            {/* Document Header */}
            <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                  <Scissors className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-amber-400 uppercase tracking-wider text-sm">
                    BARBER PRO MASTER
                  </h4>
                  <span className="text-[10px] text-slate-400">Proposta Comercial de Tecnologia SaaS</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Data da Proposta</span>
                <span className="text-xs font-bold text-slate-300">
                  {new Date().toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>

            {/* Target Client */}
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider block mb-1">
                Apresentada para:
              </span>
              <h3 className="text-base font-extrabold text-slate-100">{clientShopName}</h3>
              <p className="text-xs text-slate-400">
                Aos cuidados de: <strong>{clientOwnerName}</strong> • {clientCity}
              </p>
            </div>

            {/* Inclusions */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-300 uppercase tracking-wide block">
                O que está incluso na sua assinatura:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Agendamento Online 24h</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Lembretes Automáticos WhatsApp</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>PDV com Comissão Automática</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Monitor de Cadeiras ao Vivo</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>CRM &amp; Fidelidade VIP</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Consultor de Visagismo IA</span>
                </div>
              </div>
            </div>

            {/* Conditions & Price */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-400 block">
                  Plano Selecionado: {proposalPlan.toUpperCase()}
                </span>
                <span className="text-xs text-slate-300">Sem taxa de adesão • Sem fidelidade</span>
                <span className="text-[11px] text-emerald-400 font-bold block mt-0.5">
                  ✓ Inclui {freeTrialDays} Dias de Teste Gratuito
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Investimento</span>
                <div className="text-2xl font-black text-amber-400 font-mono">
                  R$ {proposalPrice.toFixed(2)} <span className="text-xs text-slate-400">/mês</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: ROTEIRO DE DEMONSTRAÇÃO DE 3 MINUTOS */}
      {activeSubTab === "tour" && (
        <div className="bg-[#12141C] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
              Guia Prático para o Vendedor
            </span>
            <h3 className="text-lg font-black text-slate-100 uppercase">
              Roteiro de Demonstração de 3 Minutos ao Vivo
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Siga estes 4 passos simples quando estiver na barbearia do cliente ou fazendo uma chamada de vídeo.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-3">
              <span className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                1
              </span>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-200 text-sm">Minuto 1: O Painel com Cadeiras em Tempo Real</h4>
                <p className="text-xs text-slate-400">
                  Abra a tela do <strong>Dashboard</strong>. Mostre que o dono vê quem está cortando em cada cadeira, o tempo restante e o faturamento do dia. Diga: <em>"Você sabe exatamente quem está produzindo na sua barbearia mesmo quando não estiver aqui."</em>
                </p>
                <button
                  onClick={() => onNavigateToTab("dashboard")}
                  className="mt-2 text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center space-x-1"
                >
                  <span>Abrir Tela do Dashboard</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-3">
              <span className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                2
              </span>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-200 text-sm">Minuto 2: Fechar uma Comanda no Caixa (PDV)</h4>
                <p className="text-xs text-slate-400">
                  Abra o <strong>Caixa PDV</strong>, selecione um corte e um produto (ex: pomada). Finalize a venda no PIX e mostre: <em>"Veja aqui, a comissão do seu barbeiro foi calculada na hora e a pomada já deu baixa no estoque."</em>
                </p>
                <button
                  onClick={() => onNavigateToTab("pos")}
                  className="mt-2 text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center space-x-1"
                >
                  <span>Abrir Tela do Caixa PDV</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-3">
              <span className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                3
              </span>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-200 text-sm">Minuto 3: O Link de Agendamento no Celular dele</h4>
                <p className="text-xs text-slate-400">
                  Abra o <strong>Portal de Agendamento Online</strong> ou mande o link para o WhatsApp dele abrir no próprio smartphone. Diga: <em>"Esse é o link que vai ficar na bio do seu Instagram para os clientes agendarem direto com seus barbeiros."</em>
                </p>
                <button
                  onClick={() => onNavigateToTab("booking")}
                  className="mt-2 text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center space-x-1"
                >
                  <span>Abrir Portal de Agendamento</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-slate-950 border border-emerald-500/40 flex items-start space-x-3">
              <span className="w-7 h-7 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                4
              </span>
              <div className="space-y-1">
                <h4 className="font-bold text-emerald-300 text-sm">O Fechamento da Venda:</h4>
                <p className="text-xs text-slate-300 font-medium">
                  <em>"[Nome], leva 5 minutos para eu cadastrar seus barbeiros e seus serviços. Vou liberar 7 dias gratuitos para você e sua equipe testarem essa semana. Se você não gostar, não paga nada. Posso cadastrar agora?"</em>
                </p>
                <button
                  onClick={() => onNavigateToTab("tenants")}
                  className="mt-2 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center space-x-1"
                >
                  <span>Cadastrar Barbearia Agora</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
