import React, { useState } from "react";
import { useBarber } from "../context/BarberContext";
import {
  CreditCard,
  DollarSign,
  Scissors,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Receipt,
  User,
  QrCode,
  Banknote,
  CheckCircle2,
  Percent,
  Sparkles,
  Package,
  AlertTriangle,
  AlertCircle,
  Search,
  Filter,
  Copy,
  Check,
  PlusCircle,
  Layers,
  ArrowRight,
  TrendingDown,
} from "lucide-react";
import confetti from "canvas-confetti";
import { PaymentMethod, SaleRecord, ProductItem } from "../types";

interface POSViewProps {
  initialBarberId?: string;
  initialClientName?: string;
  onOpenReceipt: (sale: SaleRecord) => void;
}

export const POSView: React.FC<POSViewProps> = ({
  initialBarberId,
  initialClientName,
  onOpenReceipt,
}) => {
  const {
    services,
    products,
    barbers,
    clients,
    settings,
    processSale,
    addLoyaltyStamp,
    playCashRegisterSound,
    updateProductStock,
    adjustProductStock,
    addProduct,
  } = useBarber();

  const [selectedBarberId, setSelectedBarberId] = useState<string>(
    initialBarberId || barbers[0]?.id || ""
  );
  const [clientName, setClientName] = useState<string>(initialClientName || "Cliente Avulso");
  const [selectedCategory, setSelectedCategory] = useState<"services" | "products" | "inventory">("services");

  // Itens na comanda
  const [cartItems, setCartItems] = useState<
    { id: string; name: string; price: number; quantity: number; type: "service" | "product" }[]
  >([]);

  // Descontos e gorjetas
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");

  // Estado da Gestão de Estoque
  const [stockSearchQuery, setStockSearchQuery] = useState<string>("");
  const [stockFilterType, setStockFilterType] = useState<"all" | "low" | "pomade" | "shampoo" | "beard">("all");
  const [showAddProductModal, setShowAddProductModal] = useState<boolean>(false);
  const [copiedSupplierOrder, setCopiedSupplierOrder] = useState<boolean>(false);
  const [stockActionToast, setStockActionToast] = useState<string | null>(null);

  // Formulário de Novo Produto
  const [newProdName, setNewProdName] = useState<string>("");
  const [newProdCategory, setNewProdCategory] = useState<string>("pomade");
  const [newProdPrice, setNewProdPrice] = useState<number>(45);
  const [newProdStock, setNewProdStock] = useState<number>(10);
  const [newProdVolume, setNewProdVolume] = useState<string>("100g");
  const [newProdDescription, setNewProdDescription] = useState<string>("");

  // Barbeiro selecionado
  const currentBarber = barbers.find((b) => b.id === selectedBarberId);

  // Cálculos de Comanda
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountVal = (subtotal * discountPercent) / 100;
  const finalTotal = Math.max(0, subtotal - discountVal + tipAmount);

  // Cálculo de comissão
  const barberCommission =
    subtotal * (currentBarber?.commissionRate || settings.defaultCommissionRate) + tipAmount;

  // Itens de baixo estoque (< 5 unidades)
  const lowStockThreshold = 5;
  const lowStockProducts = products.filter((p) => p.stock < lowStockThreshold);
  const outOfStockProducts = products.filter((p) => p.stock === 0);
  const totalStockUnits = products.reduce((acc, p) => acc + p.stock, 0);
  const totalStockRetailValue = products.reduce((acc, p) => acc + p.stock * p.price, 0);

  const addItemToCart = (item: { id: string; name: string; price: number; stock?: number }, type: "service" | "product") => {
    if (type === "product") {
      const prod = products.find((p) => p.id === item.id);
      if (prod && prod.stock <= 0) {
        setStockActionToast(`⚠️ "${item.name}" está esgotado no estoque!`);
        setTimeout(() => setStockActionToast(null), 3000);
        return;
      }

      // Check current quantity in cart
      const currentInCart = cartItems.find((i) => i.id === item.id)?.quantity || 0;
      if (prod && currentInCart + 1 > prod.stock) {
        setStockActionToast(`⚠️ Limite de estoque atingido (${prod.stock} disponíveis)`);
        setTimeout(() => setStockActionToast(null), 3000);
        return;
      }
    }

    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1, type }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            if (item.type === "product" && delta > 0) {
              const prod = products.find((p) => p.id === id);
              if (prod && newQty > prod.stock) {
                setStockActionToast(`⚠️ Quantidade máxima disponível em estoque: ${prod.stock}`);
                setTimeout(() => setStockActionToast(null), 3000);
                return item;
              }
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as any
    );
  };

  const removeItem = (id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleStockAdjustment = (productId: string, delta: number, productName: string) => {
    adjustProductStock(productId, delta);
    setStockActionToast(`Estoque de "${productName}" ajustado (${delta > 0 ? `+${delta}` : delta} un.)`);
    setTimeout(() => setStockActionToast(null), 2500);
  };

  const handleCopySupplierOrder = () => {
    const itemsToRestock = products.filter((p) => p.stock < lowStockThreshold);
    if (itemsToRestock.length === 0) {
      alert("Nenhum produto está em estado de baixo estoque (< 5 unid.) no momento.");
      return;
    }

    let text = `📦 *PEDIDO DE REPOSIÇÃO - ${settings.name.toUpperCase()}*\n`;
    text += `📅 Data: ${new Date().toLocaleDateString("pt-BR")}\n`;
    text += `⚠️ *Itens com Estoque Baixo / Crítico (< 5 unidades):*\n\n`;

    itemsToRestock.forEach((p) => {
      const needed = Math.max(12, (10 - p.stock));
      text += `• *${p.name}* (${p.volume || p.category})\n  - Estoque atual: ${p.stock} un. | Sugestão pedido: +${needed} un.\n`;
    });

    text += `\n💈 Solicitação gerada automaticamente pelo Sistema Barber Pro.`;

    navigator.clipboard.writeText(text);
    setCopiedSupplierOrder(true);
    setStockActionToast("✅ Lista de reposição copiada para a área de transferência!");
    setTimeout(() => {
      setCopiedSupplierOrder(false);
      setStockActionToast(null);
    }, 4000);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    addProduct({
      name: newProdName.trim(),
      category: newProdCategory,
      price: Number(newProdPrice) || 0,
      stock: Number(newProdStock) || 0,
      volume: newProdVolume.trim() || undefined,
      description: newProdDescription.trim() || undefined,
    });

    setShowAddProductModal(false);
    setNewProdName("");
    setNewProdDescription("");
    setNewProdStock(10);
    setStockActionToast(`✅ Produto "${newProdName}" cadastrado no estoque!`);
    setTimeout(() => setStockActionToast(null), 3000);
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert("Adicione pelo menos um serviço ou produto à comanda.");
      return;
    }

    const saleRecord = processSale({
      barberId: selectedBarberId,
      clientName: clientName.trim() || "Cliente Avulso",
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        type: item.type,
      })),
      subtotal,
      discount: discountVal,
      tip: tipAmount,
      finalTotal,
      paymentMethod,
      commissionAmount: barberCommission,
    });

    // Se cliente existir no CRM, adiciona selo
    const matchedClient = clients.find((c) => c.name.toLowerCase() === clientName.toLowerCase());
    if (matchedClient) {
      addLoyaltyStamp(matchedClient.id);
    }

    playCashRegisterSound();

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        colors: ["#10B981", "#F59E0B", "#ffffff"],
      });
    } catch (err) {}

    // Limpa comanda
    setCartItems([]);
    setDiscountPercent(0);
    setTipAmount(0);

    // Abre comprovante
    onOpenReceipt(saleRecord);
  };

  // Filtragem na aba de Gestão de Estoque
  const filteredInventoryProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(stockSearchQuery.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(stockSearchQuery.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(stockSearchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (stockFilterType === "low") return p.stock < lowStockThreshold;
    if (stockFilterType === "pomade") return p.category === "pomade";
    if (stockFilterType === "shampoo") return p.category === "shampoo";
    if (stockFilterType === "beard") return p.category === "beard";
    return true;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-16">
      {/* Coluna Esquerda: Catálogo de Serviços, Produtos & Gestão de Estoque (7 Cols) */}
      <div className="lg:col-span-7 space-y-4">
        {/* Seletor de Barbeiro e Cliente */}
        <div className="bg-[#181B24] rounded-2xl border border-slate-800 p-4 shadow-xl grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Barbeiro Atendente
            </label>
            <select
              value={selectedBarberId}
              onChange={(e) => setSelectedBarberId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-amber-400 font-bold focus:outline-none"
            >
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>
                  Cadeira #{b.chairNumber}: {b.name} ({Math.round(b.commissionRate * 100)}% Comissão)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Cliente da Comanda
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Nome do cliente..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Banner de Alerta de Baixo Estoque (Se houver itens < 5 unidades) */}
        {lowStockProducts.length > 0 && selectedCategory !== "inventory" && (
          <div
            onClick={() => setSelectedCategory("inventory")}
            className="p-3 rounded-xl bg-gradient-to-r from-amber-950/80 via-red-950/40 to-amber-950/80 border border-amber-500/50 flex items-center justify-between cursor-pointer hover:border-amber-400 transition shadow-lg group"
          >
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <AlertTriangle className="w-4 h-4 animate-pulse text-amber-400" />
              </div>
              <div>
                <h4 className="text-xs font-black text-amber-300 flex items-center space-x-1.5">
                  <span>Alerta de Baixo Estoque: {lowStockProducts.length} produto(s) abaixo de 5 unidades!</span>
                </h4>
                <p className="text-[11px] text-amber-200/80">
                  {lowStockProducts.map((p) => `${p.name.split(" ")[0]} (${p.stock} un)`).slice(0, 3).join(", ")}
                  {lowStockProducts.length > 3 ? "..." : ""}
                </p>
              </div>
            </div>
            <button className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-[11px] font-black uppercase tracking-wider flex items-center space-x-1 group-hover:bg-amber-400 transition shrink-0">
              <span>Gerenciar Estoque</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Toast Notificador de Ação */}
        {stockActionToast && (
          <div className="p-2.5 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 text-xs font-bold flex items-center justify-between shadow-lg">
            <span>{stockActionToast}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
        )}

        {/* Abas do Catálogo e Gestão de Estoque */}
        <div className="bg-[#181B24] rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setSelectedCategory("services")}
                id="pos-tab-services"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap ${
                  selectedCategory === "services"
                    ? "bg-amber-500 text-slate-950 shadow"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                <Scissors className="w-4 h-4" />
                <span>Serviços ({services.length})</span>
              </button>

              <button
                onClick={() => setSelectedCategory("products")}
                id="pos-tab-products"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap ${
                  selectedCategory === "products"
                    ? "bg-amber-500 text-slate-950 shadow"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Pomadas &amp; Varejo ({products.length})</span>
              </button>

              <button
                onClick={() => setSelectedCategory("inventory")}
                id="pos-tab-inventory"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap relative ${
                  selectedCategory === "inventory"
                    ? "bg-amber-500 text-slate-950 shadow"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Gestão de Estoque</span>
                {lowStockProducts.length > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 text-[10px] font-black rounded-full ${
                      selectedCategory === "inventory"
                        ? "bg-slate-950 text-amber-400"
                        : "bg-red-500/90 text-white animate-pulse"
                    }`}
                  >
                    {lowStockProducts.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Conteúdo da Aba 1: Serviços */}
          {selectedCategory === "services" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
              {services.map((srv) => (
                <div
                  key={srv.id}
                  onClick={() => addItemToCart(srv, "service")}
                  className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 cursor-pointer transition flex items-center justify-between group"
                >
                  <div>
                    <h4 className="font-bold text-xs text-slate-100 group-hover:text-amber-400 transition">
                      {srv.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{srv.durationMinutes} min</p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-sm text-amber-400">
                      {settings.currencySymbol}
                      {srv.price}
                    </span>
                    <button className="mt-1 px-2 py-0.5 rounded bg-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950 text-[10px] font-bold text-slate-300 block transition">
                      + Adicionar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Conteúdo da Aba 2: Venda de Pomadas & Varejo */}
          {selectedCategory === "products" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
              {products.map((prd) => {
                const isLow = prd.stock < lowStockThreshold;
                const isOut = prd.stock === 0;

                return (
                  <div
                    key={prd.id}
                    onClick={() => addItemToCart(prd, "product")}
                    className={`p-3.5 rounded-xl bg-slate-900/70 border transition flex items-center justify-between group ${
                      isOut
                        ? "border-red-900/40 opacity-70 cursor-not-allowed bg-red-950/10"
                        : isLow
                        ? "border-amber-500/40 hover:border-amber-400 hover:bg-slate-900 cursor-pointer"
                        : "border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 cursor-pointer"
                    }`}
                  >
                    <div className="pr-2 min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <h4 className="font-bold text-xs text-slate-100 group-hover:text-amber-400 transition truncate">
                          {prd.name}
                        </h4>
                      </div>

                      {/* Badge de Alerta de Estoque */}
                      <div className="flex items-center space-x-1.5 mt-1">
                        {isOut ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-red-500/20 text-red-400 border border-red-500/30 flex items-center space-x-1">
                            <AlertCircle className="w-2.5 h-2.5" />
                            <span>Esgotado (0 un)</span>
                          </span>
                        ) : isLow ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center space-x-1">
                            <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
                            <span>Baixo Estoque ({prd.stock} un)</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">
                            Estoque: <strong className="text-slate-300">{prd.stock} unid.</strong>
                          </span>
                        )}
                        {prd.volume && (
                          <span className="text-[9px] text-slate-500 font-mono">({prd.volume})</span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-black text-sm text-amber-400">
                        {settings.currencySymbol}
                        {prd.price}
                      </span>
                      <button
                        disabled={isOut}
                        className={`mt-1 px-2 py-0.5 rounded text-[10px] font-bold block transition ${
                          isOut
                            ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                            : "bg-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-300"
                        }`}
                      >
                        {isOut ? "Esgotado" : "+ Adicionar"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Conteúdo da Aba 3: Gestão de Estoque Completa */}
          {selectedCategory === "inventory" && (
            <div className="space-y-4">
              {/* Cards de Métricas de Estoque */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Total em Estoque</span>
                  <span className="text-lg font-black text-slate-100 font-mono">{totalStockUnits} un.</span>
                </div>

                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-300 uppercase block">Baixo Estoque (&lt;5)</span>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <span className="text-lg font-black text-amber-400 font-mono">{lowStockProducts.length} itens</span>
                </div>

                <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/40">
                  <span className="text-[10px] font-bold text-red-300 uppercase block">Esgotados (0)</span>
                  <span className="text-lg font-black text-red-400 font-mono">{outOfStockProducts.length} itens</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Valor Varejo Total</span>
                  <span className="text-sm font-black text-emerald-400 font-mono">
                    {settings.currencySymbol} {totalStockRetailValue.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Barra de Ações & Filtros de Estoque */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filtrar por nome, categoria..."
                    value={stockSearchQuery}
                    onChange={(e) => setStockSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={handleCopySupplierOrder}
                    title="Copiar lista de compras para WhatsApp do Fornecedor"
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 text-xs font-bold transition flex items-center space-x-1 shadow"
                  >
                    {copiedSupplierOrder ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSupplierOrder ? "Copiado!" : "Lista Reposição"}</span>
                  </button>

                  <button
                    onClick={() => setShowAddProductModal(true)}
                    id="add-stock-product-btn"
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center space-x-1 shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Novo Produto</span>
                  </button>
                </div>
              </div>

              {/* Filtro por Tags */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
                {[
                  { id: "all", label: "Todos" },
                  { id: "low", label: `⚠️ Baixo Estoque (${lowStockProducts.length})` },
                  { id: "pomade", label: "Pomadas & Ceras" },
                  { id: "shampoo", label: "Shampoos" },
                  { id: "beard", label: "Barba & Balms" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setStockFilterType(tab.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap ${
                      stockFilterType === tab.id
                        ? "bg-amber-500 text-slate-950 shadow"
                        : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Lista Detalhada de Gestão de Estoque com Botões de Ajuste Rápido */}
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {filteredInventoryProducts.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    Nenhum produto encontrado com os filtros atuais.
                  </div>
                ) : (
                  filteredInventoryProducts.map((p) => {
                    const isLow = p.stock < lowStockThreshold;
                    const isOut = p.stock === 0;

                    return (
                      <div
                        key={p.id}
                        className={`p-3 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isOut
                            ? "bg-red-950/20 border-red-900/60"
                            : isLow
                            ? "bg-amber-950/20 border-amber-500/40"
                            : "bg-slate-900/80 border-slate-800"
                        }`}
                      >
                        {/* Info do Produto */}
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h5 className="font-bold text-xs text-slate-100">{p.name}</h5>
                            {isOut ? (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-red-500/20 text-red-400 border border-red-500/40">
                                🔴 Esgotado
                              </span>
                            ) : isLow ? (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                ⚠️ Baixo Estoque (&lt; 5)
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                ✅ Estoque Saudável
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                            <span>Preço Venda: <strong className="text-amber-400 font-mono">{settings.currencySymbol}{p.price}</strong></span>
                            {p.volume && <span>Vol: <strong className="text-slate-300">{p.volume}</strong></span>}
                            <span>Categoria: <strong className="text-slate-300 capitalize">{p.category}</strong></span>
                          </div>
                        </div>

                        {/* Controles Rápidos de Reposição */}
                        <div className="flex items-center space-x-2 self-end sm:self-auto">
                          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                            <button
                              onClick={() => handleStockAdjustment(p.id, -1, p.name)}
                              title="Diminuir 1 unidade"
                              className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center transition"
                            >
                              -1
                            </button>

                            <div className="px-3 text-center">
                              <span
                                className={`font-mono text-sm font-black ${
                                  isOut ? "text-red-400" : isLow ? "text-amber-400" : "text-slate-100"
                                }`}
                              >
                                {p.stock}
                              </span>
                              <span className="text-[9px] text-slate-500 block">unid.</span>
                            </div>

                            <button
                              onClick={() => handleStockAdjustment(p.id, 1, p.name)}
                              title="Adicionar 1 unidade"
                              className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold flex items-center justify-center transition"
                            >
                              +1
                            </button>

                            <button
                              onClick={() => handleStockAdjustment(p.id, 5, p.name)}
                              title="Repor +5 unidades"
                              className="px-2 h-7 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-black flex items-center justify-center transition border border-amber-500/30"
                            >
                              +5
                            </button>

                            <button
                              onClick={() => handleStockAdjustment(p.id, 10, p.name)}
                              title="Repor +10 unidades"
                              className="px-2 h-7 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-black flex items-center justify-center transition border border-emerald-500/30"
                            >
                              +10
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Coluna Direita: Comanda Atual & Fechamento de Venda (5 Cols) */}
      <div className="lg:col-span-5 bg-[#181B24] rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Receipt className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wide">Comanda de Caixa</h3>
            </div>
            {cartItems.length > 0 && (
              <button
                onClick={() => setCartItems([])}
                className="text-[11px] text-red-400 hover:text-red-300 font-semibold"
              >
                Limpar Tudo
              </button>
            )}
          </div>

          {/* Lista de Itens na Comanda */}
          <div className="mt-3 space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {cartItems.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                Comanda vazia. Clique nos serviços ou pomadas ao lado para adicionar.
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <h5 className="font-bold text-slate-100 truncate">{item.name}</h5>
                    <span className="text-[10px] text-slate-400">
                      {settings.currencySymbol}{item.price} cada
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Controles de Quantidade */}
                    <div className="flex items-center space-x-1 bg-slate-950 rounded-lg p-0.5 border border-slate-800">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 text-slate-400 hover:text-slate-200"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-1.5 font-bold text-slate-200 text-xs">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 text-slate-400 hover:text-slate-200"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-bold text-amber-400 w-14 text-right font-mono">
                      {settings.currencySymbol}
                      {(item.price * item.quantity).toFixed(2)}
                    </span>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Ajustes de Desconto e Gorjeta */}
          <div className="mt-4 pt-3 border-t border-slate-800 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Desconto (%)</label>
                <div className="flex items-center space-x-1">
                  {[0, 5, 10, 15].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setDiscountPercent(pct)}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition ${
                        discountPercent === pct
                          ? "bg-amber-500 text-slate-950 border-amber-500"
                          : "bg-slate-900 text-slate-400 border-slate-800"
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Gorjeta Barbeiro</label>
                <div className="flex items-center space-x-1">
                  {[0, 5, 10, 20].map((tip) => (
                    <button
                      key={tip}
                      type="button"
                      onClick={() => setTipAmount(tip)}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition ${
                        tipAmount === tip
                          ? "bg-amber-500 text-slate-950 border-amber-500"
                          : "bg-slate-900 text-slate-400 border-slate-800"
                      }`}
                    >
                      +{tip}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Método de Pagamento */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Forma de Pagamento</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: "pix", label: "PIX", icon: QrCode },
                  { id: "credit_card", label: "Crédito", icon: CreditCard },
                  { id: "debit_card", label: "Débito", icon: CreditCard },
                  { id: "cash", label: "Dinheiro", icon: Banknote },
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                      className={`py-2 px-1 rounded-xl text-[11px] font-bold transition flex flex-col items-center justify-center border ${
                        paymentMethod === m.id
                          ? "bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm"
                          : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 mb-1" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Resumo Financeiro & Botão de Fechamento */}
        <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Subtotal:</span>
            <span>{settings.currencySymbol}{subtotal.toFixed(2)}</span>
          </div>

          {discountVal > 0 && (
            <div className="flex justify-between text-xs text-red-400">
              <span>Desconto ({discountPercent}%):</span>
              <span>-{settings.currencySymbol}{discountVal.toFixed(2)}</span>
            </div>
          )}

          {tipAmount > 0 && (
            <div className="flex justify-between text-xs text-emerald-400">
              <span>Gorjeta:</span>
              <span>+{settings.currencySymbol}{tipAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between items-baseline pt-2 border-t border-slate-800">
            <div>
              <span className="text-xs text-slate-400 block">Total a Cobrar:</span>
              <span className="text-[10px] text-amber-400 font-mono">
                Comissão Barbeiro: {settings.currencySymbol}{barberCommission.toFixed(2)}
              </span>
            </div>
            <span className="text-2xl font-black text-amber-400 font-mono">
              {settings.currencySymbol}
              {finalTotal.toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cartItems.length === 0}
            id="pos-checkout-btn"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider transition shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>FINALIZAR VENDA &amp; RECIBO</span>
          </button>
        </div>
      </div>

      {/* Modal de Cadastro de Novo Produto no Estoque */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181B24] rounded-2xl border border-slate-700 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-slate-100 uppercase">Novo Produto de Varejo</h3>
              </div>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome do Produto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cera Modeladora Teia 120g"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Categoria</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="pomade">Pomada / Cera</option>
                    <option value="shampoo">Shampoo / Condicionador</option>
                    <option value="beard">Barba / Balm / Óleo</option>
                    <option value="accessory">Acessórios / Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Volume / Gramatura</label>
                  <input
                    type="text"
                    placeholder="Ex: 120g, 250ml"
                    value={newProdVolume}
                    onChange={(e) => setNewProdVolume(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Preço de Venda ({settings.currencySymbol})</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Estoque Inicial (unid.)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descrição / Benefício</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Fixação forte com acabamento fosco sem resíduos."
                  value={newProdDescription}
                  onChange={(e) => setNewProdDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow"
                >
                  Cadastrar no Estoque
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
