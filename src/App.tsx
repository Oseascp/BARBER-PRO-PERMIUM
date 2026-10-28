import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BarberProvider, useBarber } from "./context/BarberContext";
import { Navbar } from "./components/Navbar";
import { DashboardView } from "./components/DashboardView";
import { AppointmentsView } from "./components/AppointmentsView";
import { BookingPortalView } from "./components/BookingPortalView";
import { AIStylistConsultantView } from "./components/AIStylistConsultantView";
import { ClientsCRMView } from "./components/ClientsCRMView";
import { POSView } from "./components/POSView";
import { AIMarketingView } from "./components/AIMarketingView";
import { ReportsFinancialsView } from "./components/ReportsFinancialsView";
import { SettingsView } from "./components/SettingsView";
import { TenantsManagementView } from "./components/TenantsManagementView";
import { SalesPresentationKitView } from "./components/SalesPresentationKitView";
import { TrialBanner } from "./components/TrialBanner";
import { FastTrialModal } from "./components/FastTrialModal";
import { TrialSignupView } from "./components/TrialSignupView";
import { ReceiptModal } from "./components/ReceiptModal";
import { SaleRecord } from "./types";
import { Scissors, Calendar, UserPlus, Sparkles, X, Building2 } from "lucide-react";

function MainApp() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [posBarberId, setPosBarberId] = useState<string | undefined>(undefined);
  const [posClientName, setPosClientName] = useState<string | undefined>(undefined);
  const [receiptSale, setReceiptSale] = useState<SaleRecord | null>(null);

  // Modal rápido de agendamento manual
  const [showQuickBookingModal, setShowQuickBookingModal] = useState<boolean>(false);
  const [showFastTrialModal, setShowFastTrialModal] = useState<boolean>(false);
  const { barbers, services, addAppointment, settings, currentTenant, tenants } = useBarber();

  const isLight = settings.themeMode === "light";

  // Check URL parameter for initial tab/view
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get("tab") || urlParams.get("view");
      if (tabParam) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  useEffect(() => {
    if (isLight) {
      document.documentElement.classList.add("theme-light");
    } else {
      document.documentElement.classList.remove("theme-light");
    }
  }, [isLight]);

  const [qbName, setQbName] = useState<string>("");
  const [qbPhone, setQbPhone] = useState<string>("");
  const [qbBarberId, setQbBarberId] = useState<string>(barbers[0]?.id || "");
  const [qbServiceId, setQbServiceId] = useState<string>(services[0]?.id || "");
  const [qbDate, setQbDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [qbTime, setQbTime] = useState<string>("14:00");
  const [qbNotes, setQbNotes] = useState<string>("");

  const handleOpenPOSFromChair = (barberId?: string, clientName?: string) => {
    setPosBarberId(barberId);
    setPosClientName(clientName);
    setActiveTab("pos");
  };

  const handleQuickBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qbName.trim() || !qbPhone.trim()) return;

    const srv = services.find((s) => s.id === qbServiceId);

    addAppointment({
      clientName: qbName.trim(),
      clientPhone: qbPhone.trim(),
      barberId: qbBarberId,
      serviceIds: [qbServiceId],
      date: qbDate,
      timeSlot: qbTime,
      status: "confirmed",
      notes: qbNotes.trim() || undefined,
      totalAmount: srv ? srv.price : 45,
      paid: false,
    });

    setQbName("");
    setQbPhone("");
    setQbNotes("");
    setShowQuickBookingModal(false);
  };

  return (
    <div
      className={`min-h-screen ${
        isLight ? "theme-light bg-[#F4F6F9] text-slate-900" : "bg-[#0E1015] text-slate-100"
      } flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 transition-colors duration-200`}
    >
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBookingPortal={() => setActiveTab("booking")}
        onOpenFastTrial={() => setShowFastTrialModal(true)}
      />

      {/* Trial Countdown & Upgrade Banner (Visible when active tenant is in 7-day trial) */}
      <TrialBanner />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="w-full"
          >
            {activeTab === "dashboard" && (
              <DashboardView
                onNavigate={(tab) => setActiveTab(tab)}
                onOpenPOS={handleOpenPOSFromChair}
                onOpenNewBooking={() => setShowQuickBookingModal(true)}
              />
            )}

            {activeTab === "appointments" && (
              <AppointmentsView
                onOpenNewBooking={() => setShowQuickBookingModal(true)}
                onOpenPOS={handleOpenPOSFromChair}
              />
            )}

            {activeTab === "booking" && <BookingPortalView />}

            {activeTab === "trial-signup" && (
              <TrialSignupView
                onNavigateToTab={(tab) => setActiveTab(tab)}
                onSuccessNavigate={() => setActiveTab("dashboard")}
              />
            )}

            {activeTab === "ai-stylist" && <AIStylistConsultantView />}

            {activeTab === "clients" && <ClientsCRMView />}

            {activeTab === "pos" && (
              <POSView
                initialBarberId={posBarberId}
                initialClientName={posClientName}
                onOpenReceipt={(sale) => setReceiptSale(sale)}
              />
            )}

            {activeTab === "marketing" && <AIMarketingView />}

            {activeTab === "reports" && <ReportsFinancialsView />}

            {activeTab === "tenants" && (
              <TenantsManagementView
                onNavigateToDashboard={() => setActiveTab("dashboard")}
                onOpenBookingForTenant={() => setActiveTab("booking")}
                onNavigateToSalesKit={() => setActiveTab("sales-kit")}
                onOpenFastTrial={() => setShowFastTrialModal(true)}
              />
            )}

            {activeTab === "sales-kit" && (
              <SalesPresentationKitView
                onNavigateToTab={(tab) => setActiveTab(tab)}
                onOpenFastTrial={() => setShowFastTrialModal(true)}
              />
            )}

            {activeTab === "settings" && <SettingsView />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#0B0D12] py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Scissors className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-slate-400">{currentTenant.name}</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-500">
              Multi-Tenant SaaS • {tenants.length} Barbearias Conectadas
            </span>
          </div>
          <span className="text-[11px] text-slate-600">
            Versão 3.0 Multi-Tenant Pro Master • Português (Brasil)
          </span>
        </div>
      </footer>

      {/* Quick Booking Modal */}
      {showQuickBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181B24] rounded-2xl border border-slate-700 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-slate-100 uppercase">Novo Agendamento Rápido</h3>
              </div>
              <button
                onClick={() => setShowQuickBookingModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickBookingSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome do Cliente *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Matheus Guimarães"
                  value={qbName}
                  onChange={(e) => setQbName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp / Telefone *</label>
                <input
                  type="tel"
                  required
                  placeholder="Ex: (11) 98765-4321"
                  value={qbPhone}
                  onChange={(e) => setQbPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Barbeiro</label>
                  <select
                    value={qbBarberId}
                    onChange={(e) => setQbBarberId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                  >
                    {barbers.map((b) => (
                      <option key={b.id} value={b.id}>
                        Cadeira #{b.chairNumber}: {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Serviço</label>
                  <select
                    value={qbServiceId}
                    onChange={(e) => setQbServiceId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({settings.currencySymbol}{s.price})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Data</label>
                  <input
                    type="date"
                    value={qbDate}
                    onChange={(e) => setQbDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Horário</label>
                  <input
                    type="time"
                    value={qbTime}
                    onChange={(e) => setQbTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Observações de Corte</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Pente #1 na base, disfarçado na tesoura..."
                  value={qbNotes}
                  onChange={(e) => setQbNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowQuickBookingModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow"
                >
                  Confirmar Horário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Comprovante de Pagamento */}
      <ReceiptModal sale={receiptSale} onClose={() => setReceiptSale(null)} />

      {/* Modal de Cadastro Expresso 7 Dias de Teste Grátis */}
      <FastTrialModal
        isOpen={showFastTrialModal}
        onClose={() => setShowFastTrialModal(false)}
        onSuccessNavigate={() => setActiveTab("dashboard")}
      />
    </div>
  );
}

export default function App() {
  return (
    <BarberProvider>
      <MainApp />
    </BarberProvider>
  );
}
