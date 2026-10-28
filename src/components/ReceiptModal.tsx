import React from "react";
import { useBarber } from "../context/BarberContext";
import { Scissors, Printer, Check, X, QrCode } from "lucide-react";
import { SaleRecord } from "../types";

interface ReceiptModalProps {
  sale: SaleRecord | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, onClose }) => {
  const { settings, barbers } = useBarber();

  if (!sale) return null;

  const barber = barbers.find((b) => b.id === sale.barberId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#181B24] rounded-2xl border border-slate-700 max-w-sm w-full p-6 shadow-2xl space-y-4 max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Comprovante Não Fiscal
          </span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Ticket */}
        <div className="bg-white text-slate-900 rounded-xl p-5 shadow font-mono text-xs space-y-3 print-area">
          <div className="text-center border-b border-slate-300 pb-3">
            <div className="flex items-center justify-center space-x-1 font-black text-sm tracking-tight uppercase">
              <Scissors className="w-4 h-4 mr-1 stroke-[2.5]" />
              <span>{settings.name}</span>
            </div>
            <p className="text-[10px] text-slate-600 mt-0.5">{settings.tagline}</p>
            <p className="text-[10px] text-slate-500">{settings.address}</p>
            <p className="text-[10px] text-slate-500">Tel/WhatsApp: {settings.phone}</p>
          </div>

          <div className="border-b border-slate-300 pb-2 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Data/Hora:</span>
              <span>{sale.createdAt}</span>
            </div>
            <div className="flex justify-between">
              <span>Comanda:</span>
              <span className="font-bold">#{sale.id.slice(-6).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span>Cliente:</span>
              <span className="font-bold">{sale.clientName}</span>
            </div>
            <div className="flex justify-between">
              <span>Barbeiro:</span>
              <span>{barber?.name || "Mestre Barbeiro"}</span>
            </div>
          </div>

          {/* Itens */}
          <div className="border-b border-slate-300 pb-2 space-y-1">
            <div className="flex justify-between font-bold text-[10px] text-slate-500 uppercase">
              <span>Item / Qtd</span>
              <span>Total</span>
            </div>
            {sale.items.map((it, idx) => (
              <div key={idx} className="flex justify-between text-xs">
                <span>
                  {it.quantity}x {it.name}
                </span>
                <span>{settings.currencySymbol}{(it.price * it.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Totais */}
          <div className="space-y-1 text-xs pt-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{settings.currencySymbol}{sale.subtotal.toFixed(2)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Desconto:</span>
                <span>-{settings.currencySymbol}{sale.discount.toFixed(2)}</span>
              </div>
            )}
            {sale.tip > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Gorjeta:</span>
                <span>+{settings.currencySymbol}{sale.tip.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-sm pt-2 border-t border-slate-400">
              <span>TOTAL PAGO:</span>
              <span>{settings.currencySymbol}{sale.finalTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-600 pt-1">
              <span>Forma de Pagto:</span>
              <span className="uppercase font-bold">
                {sale.paymentMethod === "pix"
                  ? "PIX Instantâneo"
                  : sale.paymentMethod === "credit_card"
                  ? "Cartão de Crédito"
                  : sale.paymentMethod === "debit_card"
                  ? "Cartão de Débito"
                  : "Dinheiro"}
              </span>
            </div>
          </div>

          {/* Mensagem de Rodapé */}
          <div className="text-center pt-3 border-t border-dashed border-slate-300 space-y-1">
            <p className="text-[11px] font-bold">Obrigado pela preferência!</p>
            <p className="text-[10px] text-slate-500">
              Apresente este comprovante para acumular selos no Cartão Fidelidade.
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center space-x-2 pt-2">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition flex items-center justify-center space-x-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Cupom</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center justify-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Concluído</span>
          </button>
        </div>
      </div>
    </div>
  );
};
