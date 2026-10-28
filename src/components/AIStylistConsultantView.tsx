import React, { useState } from "react";
import {
  Sparkles,
  Scissors,
  Check,
  Send,
  Loader2,
  Bot,
  User,
  ShieldCheck,
  Zap,
  Bookmark,
  Share2,
  Copy,
  Layers,
  Award,
} from "lucide-react";
import { AIHaircutConsultationResult } from "../types";

export const AIStylistConsultantView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"consultation" | "chat">("consultation");

  // Form State
  const [faceShape, setFaceShape] = useState<string>("Oval");
  const [hairType, setHairType] = useState<string>("Ondulado / Texturizado");
  const [hairLength, setHairLength] = useState<string>("Médio (4 a 8 cm)");
  const [beardStyle, setBeardStyle] = useState<string>("Barba Curta & Degradê Esculpido");
  const [lifestyle, setLifestyle] = useState<string>("Moderado (3 a 5 min com pomada/pasta)");
  const [customNotes, setCustomNotes] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [consultationResult, setConsultationResult] = useState<AIHaircutConsultationResult | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Chatbot State
  const [chatMessages, setChatMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([
    {
      sender: "ai",
      text: "👋 Olá! Sou o Mestre Barbeiro IA. Pergunte qualquer dúvida sobre sequências de pentes de máquina, disfarces (Skin Fade, Taper, Low Fade), ângulos de tesoura, alinhamento de barba ou produtos adequados!",
    },
  ]);
  const [chatInput, setChatInput] = useState<string>("");
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  const handleGenerateConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/ai/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          faceShape,
          hairType,
          hairLength,
          beardStyle,
          lifestyle,
          notes: customNotes,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setConsultationResult(data.data);
      } else {
        alert("Falha ao gerar consultoria: " + (data.error || "Erro desconhecido"));
      }
    } catch (err: any) {
      console.error("Erro na consultoria:", err);
      alert("Erro ao conectar com o serviço de IA.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setChatLoading(true);

    try {
      const res = await fetch("/api/ai/ask-barber", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      const data = await res.json();
      const reply = data.reply || "Não consegui processar agora. Tente perguntar sobre uma técnica ou corte específico!";
      setChatMessages((prev) => [...prev, { sender: "ai", text: reply }]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Erro de conexão com o assistente." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const copyBarberInstructions = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-[#181B24] rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 border border-amber-300/40">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-black text-slate-100 uppercase tracking-tight">Estilista &amp; Visagista IA</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  GEMINI 3.7 FLASH
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Análise de geometria facial, fórmulas técnicas de máquina e fichas de corte para o barbeiro
              </p>
            </div>
          </div>

          {/* Abas */}
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-1">
            <button
              onClick={() => setActiveTab("consultation")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === "consultation"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Diagnóstico de Corte
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === "chat"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Pergunte ao Barbeiro IA
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: Diagnóstico Visagista */}
      {activeTab === "consultation" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Coluna Esquerda: Formulário de Diagnóstico (5 Cols) */}
          <div className="lg:col-span-5 bg-[#181B24] rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">Perfil do Cliente &amp; Anatomia</h2>
              <p className="text-xs text-slate-400">Configure formato do rosto, textura e preferências</p>
            </div>

            <form onSubmit={handleGenerateConsultation} className="space-y-4">
              {/* Formato do Rosto */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Formato do Rosto</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Oval", "Quadrado", "Redondo", "Diamante", "Coração", "Alongado"].map((shape) => (
                    <button
                      type="button"
                      key={shape}
                      onClick={() => setFaceShape(shape)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold transition border ${
                        faceShape === shape
                          ? "bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm"
                          : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {shape}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textura do Cabelo */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tipo &amp; Textura do Cabelo</label>
                <select
                  value={hairType}
                  onChange={(e) => setHairType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="Liso / Fino">Liso / Fino</option>
                  <option value="Liso / Grosso e Pesado">Liso / Grosso e Pesado</option>
                  <option value="Ondulado / Texturizado">Ondulado / Texturizado</option>
                  <option value="Cacheado (3A a 3C)">Cacheado (3A a 3C)</option>
                  <option value="Crespo / Afro (4A a 4C)">Crespo / Afro (4A a 4C)</option>
                  <option value="Entradas / Rarefação no Topo">Entradas / Rarefação no Topo</option>
                </select>
              </div>

              {/* Comprimento Atual */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Comprimento Atual</label>
                <select
                  value={hairLength}
                  onChange={(e) => setHairLength(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="Curto / Raspado (< 2 cm)">Curto / Raspado (&lt; 2 cm)</option>
                  <option value="Médio (4 a 8 cm)">Médio (4 a 8 cm)</option>
                  <option value="Longo (> 10 cm)">Longo (&gt; 10 cm)</option>
                </select>
              </div>

              {/* Barba */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Estilo de Barba</label>
                <select
                  value={beardStyle}
                  onChange={(e) => setBeardStyle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="Barba Raspada (Lâmina Lisa)">Barba Raspada na Navalha</option>
                  <option value="Barba por Fazer (1-3mm)">Barba por Fazer / Sombreada (1-3mm)</option>
                  <option value="Barba Curta & Degradê Esculpido">Barba Curta com Degradê Esculpido</option>
                  <option value="Barba Cheia / Lenhador Alinhada">Barba Cheia / Lenhador Alinhada</option>
                  <option value="Cavanhaque & Bigode Alinhado">Cavanhaque &amp; Bigode Alinhado</option>
                </select>
              </div>

              {/* Rotina de Cuidado */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tempo Diário de Penteado</label>
                <select
                  value={lifestyle}
                  onChange={(e) => setLifestyle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="Praticidade total (secar com toalha e sair)">Praticidade total (secar com toalha e pronto)</option>
                  <option value="Moderado (3 a 5 min com pomada/pasta)">Moderado (3 a 5 min com pomada ou pasta matte)</option>
                  <option value="Alta definição (escova e secador)">Alta definição (escova, secador e pomada)</option>
                </select>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Observações / Inseguranças do Cliente</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Possui redemoinho duplo, deseja disfarçar orelhas, prefere topo alto."
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                id="generate-consultation-btn"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analisando Anatomia &amp; Proporções...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Gerar Consultoria com IA</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Coluna Direita: Resultados de IA (7 Cols) */}
          <div className="lg:col-span-7 bg-[#181B24] rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
            {!consultationResult && !loading && (
              <div className="text-center py-20 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
                <Scissors className="w-12 h-12 text-amber-500/40 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-200">Motor de Visagismo IA Pronto</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Selecione o formato do rosto e textura à esquerda e clique em Gerar para receber 3 fórmulas de corte e sequências de máquina.
                </p>
              </div>
            )}

            {loading && (
              <div className="text-center py-20 bg-slate-900/40 rounded-xl border border-slate-800 space-y-4 animate-pulse">
                <Loader2 className="w-10 h-10 text-amber-400 mx-auto animate-spin" />
                <div>
                  <h4 className="font-bold text-sm text-slate-200">Mestre Barbeiro IA Calculando Ângulos</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Harmonizando formato {faceShape} com textura {hairType}...
                  </p>
                </div>
              </div>
            )}

            {consultationResult && !loading && (
              <div className="space-y-4 animate-fade-in">
                {/* Título & Resumo */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30">
                  <div className="flex items-center space-x-2 text-amber-400 text-xs font-extrabold uppercase tracking-wider">
                    <Award className="w-4 h-4" />
                    <span>Parecer Visagista Oficial</span>
                  </div>
                  <h3 className="text-base font-black text-slate-100 mt-1">{consultationResult.title}</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {consultationResult.barberInstructionsSummary}
                  </p>
                  {consultationResult.beardGuidance && (
                    <div className="mt-2 pt-2 border-t border-amber-500/20 text-xs text-amber-300/90 font-medium">
                      🧔 Harmonia da Barba: {consultationResult.beardGuidance}
                    </div>
                  )}
                </div>

                {/* 3 Cortes Recomendados */}
                <div className="space-y-3">
                  {consultationResult.topRecommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 transition space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                              #{index + 1}
                            </span>
                            <h4 className="font-bold text-sm text-slate-100">{rec.styleName}</h4>
                          </div>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">{rec.description}</p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <span className="px-2 py-1 rounded-lg bg-emerald-950/80 text-emerald-400 text-xs font-black border border-emerald-800/40">
                            {rec.suitabilityScore}% Afinidade
                          </span>
                        </div>
                      </div>

                      {/* Ficha Técnica para o Barbeiro */}
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-extrabold text-amber-400 uppercase tracking-wider">
                          <span className="flex items-center">
                            <Scissors className="w-3 h-3 mr-1" />
                            Fórmula Técnica para a Cadeira
                          </span>
                          <button
                            onClick={() => copyBarberInstructions(rec.technicalBarberNotes, index)}
                            className="text-[10px] font-bold text-slate-400 hover:text-amber-400 flex items-center"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            {copiedIndex === index ? "Copiado! ✓" : "Copiar Fórmula"}
                          </button>
                        </div>
                        <p className="text-xs text-slate-300 font-mono leading-relaxed">{rec.technicalBarberNotes}</p>
                      </div>

                      {/* Footer: Produtos e Manutenção */}
                      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1">
                        <div className="flex items-center space-x-1">
                          <span className="text-slate-500 font-semibold">Produtos Indicados:</span>
                          <span className="text-amber-300 font-medium">{rec.recommendedProducts.join(", ")}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-slate-500">Manutenção:</span>
                          <span className="text-slate-200 font-semibold">{rec.maintenanceCycle}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Chat com Mestre Barbeiro IA */}
      {activeTab === "chat" && (
        <div className="bg-[#181B24] rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col h-[560px]">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">Assistente Técnico de Barbearia</h3>
              <p className="text-[11px] text-slate-400">Dúvidas sobre disfarces, pentes especiais, tesoura, barboterapia e alinhamento</p>
            </div>
          </div>

          {/* Log de Mensagens */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start space-x-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "ai" && (
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
                    <Scissors className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-lg p-3 rounded-xl text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-amber-500 text-slate-950 font-semibold rounded-tr-none shadow"
                      : "bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none whitespace-pre-line"
                  }`}
                >
                  {msg.text}
                </div>
                {msg.sender === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center flex-shrink-0 border border-slate-700">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
            {chatLoading && (
              <div className="flex items-center space-x-2 text-xs text-amber-400 bg-slate-900 p-2.5 rounded-xl max-w-xs border border-slate-800">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Barber Pro IA formulando resposta técnica...</span>
              </div>
            )}
          </div>

          {/* Input do Chat */}
          <form onSubmit={handleSendChatMessage} className="mt-3 pt-3 border-t border-slate-800 flex items-center space-x-2">
            <input
              type="text"
              placeholder="Ex: Como disfarçar a marca do pente 0.5 para o 1 em cabelo grosso?..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
