import React, { useState } from "react";
import { useBarber } from "../context/BarberContext";
import {
  Send,
  Sparkles,
  MessageSquare,
  Copy,
  Check,
  Zap,
  Users,
  Calendar,
  Share2,
  Loader2,
  Gift,
  Flame,
} from "lucide-react";

export const AIMarketingView: React.FC = () => {
  const { settings, clients } = useBarber();

  const [campaignType, setCampaignType] = useState<string>("Recuperação de Inativos (+15 dias sem corte)");
  const [discountOffer, setDiscountOffer] = useState<string>("Toalha Quente Aromática de Cortesia");
  const [targetAudience, setTargetAudience] = useState<string>("Clientes que não cortam há mais de 15 dias");
  const [tone, setTone] = useState<string>("Moderno, acolhedor e com termos clássicos de barbearia");

  const [loading, setLoading] = useState<boolean>(false);
  const [generatedMessages, setGeneratedMessages] = useState<
    { channel: string; title: string; content: string }[]
  >([
    {
      channel: "WhatsApp",
      title: "Recuperação VIP WhatsApp",
      content: `✂️ Fala [Nome do Cliente], tudo certo? Aqui é o seu barbeiro da ${settings.name}!\n\nPercebi que já faz algumas semanas desde o seu último corte. Seu cabelo e barba merecem aquele alinhamento de respeito para o fim de semana!\n\n💈 Agendando seu horário hoje, você ganha uma *Toalha Quente Aromática de Cortesia* na sua barba!\n👉 Agende seu horário aqui: [Link de Agendamento]`,
    },
    {
      channel: "SMS",
      title: "SMS Direto & Vagas Limitadas",
      content: `💈 Cabelo na régua: a ${settings.name} tem horários VIP abertos para hoje. Garanta seu corte aqui: [Link de Agendamento]`,
    },
    {
      channel: "Instagram / Broadcast",
      title: "Legenda para Redes Sociais & Stories",
      content: `✂️ Horários de quinta, sexta e sábado liberados na ${settings.name}! Não deixe para a última hora. Garanta seu degradê na navalha, corte na tesoura e barboterapia completa. Link na bio! 💈⚡`,
    },
  ]);

  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleGenerateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/ai/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignType,
          discount: discountOffer,
          audience: targetAudience,
          tone,
          shopName: settings.name,
        }),
      });

      const data = await res.json();
      if (data.success && data.messages) {
        setGeneratedMessages(data.messages);
      } else {
        alert("Falha ao gerar mensagens de marketing.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao conectar com o serviço de IA.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2500);
  };

  const sendTestWhatsApp = (content: string) => {
    const encoded = encodeURIComponent(content.replace("[Nome do Cliente]", "Campeão").replace("[Link de Agendamento]", window.location.origin));
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-[#181B24] rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 border border-amber-300/40">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-slate-100 uppercase tracking-tight">Marketing &amp; Mensagens IA</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                GEMINI 3.7 FLASH
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Copywriting de alta conversão para WhatsApp, SMS e Redes Sociais com foco em preencher a agenda
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna Esquerda: Configurador de Campanha (5 Cols) */}
        <div className="lg:col-span-5 bg-[#181B24] rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">Configurar Campanha</h2>
            <p className="text-xs text-slate-400">Defina o objetivo, benefício e tom de voz</p>
          </div>

          <form onSubmit={handleGenerateCampaign} className="space-y-4">
            {/* Tipo de Campanha */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Objetivo da Campanha</label>
              <select
                value={campaignType}
                onChange={(e) => setCampaignType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="Recuperação de Inativos (+15 dias sem corte)">Recuperação de Inativos (+15 dias sem vir)</option>
                <option value="Alinhamento de Sexta / Fim de Semana">Alinhamento de Sexta / Fim de Semana</option>
                <option value="Oferta Especial Barboterapia & Toalha Quente">Oferta Barboterapia &amp; Toalha Quente</option>
                <option value="Aniversariantes do Mês VIP">Aniversariantes do Mês VIP</option>
                <option value="Horários de Encaixe com Vagas de Última Hora">Vagas de Última Hora / Encaixe Hoje</option>
              </select>
            </div>

            {/* Bônus / Oferta */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Benefício / Cortesia / Gancho</label>
              <input
                type="text"
                value={discountOffer}
                onChange={(e) => setDiscountOffer(e.target.value)}
                placeholder="Ex: Toalha Quente Aromática de Cortesia ou 10% OFF"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Público-Alvo */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Público-Alvo</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="Clientes que não cortam há mais de 15 dias">Clientes Sumidos (+15 dias)</option>
                <option value="Clientes VIP Gold e Diamond">Membros VIP Gold e Diamond</option>
                <option value="Todos os clientes cadastrados">Todos os Clientes Cadastrados ({clients.length})</option>
              </select>
            </div>

            {/* Tom de Voz */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tom de Voz</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="Moderno, acolhedor e com termos clássicos de barbearia">Moderno, descontraído &amp; acolhedor</option>
                <option value="Executivo, sofisticado e polido">Executivo, sofisticado e refinado</option>
                <option value="Urgente com vagas limitadas para hoje">Urgência com vagas limitadas</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              id="generate-marketing-btn"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Gerando Textos com IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Gerar Mensagens de Campanha</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Coluna Direita: Mensagens Geradas (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {generatedMessages.map((msg, idx) => (
            <div
              key={idx}
              className="bg-[#181B24] rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      msg.channel === "WhatsApp"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : msg.channel === "SMS"
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    }`}
                  >
                    {msg.channel}
                  </span>
                  <h3 className="font-bold text-xs text-slate-200">{msg.title}</h3>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => copyToClipboard(msg.content, idx)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition flex items-center space-x-1"
                  >
                    {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIdx === idx ? "Copiado!" : "Copiar"}</span>
                  </button>

                  {msg.channel === "WhatsApp" && (
                    <button
                      onClick={() => sendTestWhatsApp(msg.content)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center space-x-1"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Abrir no WhatsApp</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-sans">
                  {msg.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
