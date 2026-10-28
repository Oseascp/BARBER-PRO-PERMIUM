export type TenantPlan = "starter" | "pro" | "enterprise" | "vip";
export type TenantStatus = "active" | "trial" | "past_due" | "suspended";

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  address: string;
  city?: string;
  plan: TenantPlan;
  status: TenantStatus;
  monthlyFee: number; // Valor da assinatura SaaS em R$
  createdAt: string;
  trialStartedAt?: string;
  trialEndsAt?: string;
  logo?: string;
  brandColor?: string;
  chairsCount?: number;
  settings: BarberShopSettings;
}

export interface TenantDataPayload {
  settings: BarberShopSettings;
  barbers: Barber[];
  services: Service[];
  products: ProductItem[];
  clients: ClientRecord[];
  appointments: Appointment[];
  sales: SaleRecord[];
}

export type ChairStatus = "free" | "in_chair" | "break";

export interface Barber {
  id: string;
  name: string;
  nickname: string;
  title: string;
  chairNumber: number;
  chairStatus: ChairStatus;
  avatar: string;
  rating: number;
  reviewCount: number;
  commissionRate: number; // e.g. 0.5 for 50%
  specialties: string[];
  bio: string;
  currentClientName?: string;
  serviceStartedAt?: string;
  estimatedMinutesRemaining?: number;
}

export type ServiceCategory = "haircut" | "beard" | "combo" | "treatment" | "vip";

export interface Service {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  description: string;
  popular?: boolean;
  category?: ServiceCategory;
  image?: string;
}

export type AppointmentStatus = "confirmed" | "in_chair" | "completed" | "cancelled";
export type ReminderStatus = "pending" | "sending" | "sent" | "failed";

export interface ReminderMessageLog {
  id: string;
  appointmentId: string;
  clientName: string;
  clientPhone: string;
  date: string;
  timeSlot: string;
  barberName: string;
  channel: "whatsapp" | "sms";
  status: "delivered" | "sent" | "failed";
  timestamp: string;
  messageBody: string;
  deliveryId: string;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  barberId: string;
  serviceIds: string[];
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:mm
  status: AppointmentStatus;
  notes?: string;
  totalAmount: number;
  paid: boolean;
  createdAt: string;
  reminderStatus?: ReminderStatus;
  reminderSentAt?: string;
  reminderChannel?: "whatsapp" | "sms";
  reminderDeliveryId?: string;
  reminderAutoScheduled?: boolean;
}

export type VIPTier = "bronze" | "silver" | "gold" | "diamond";

export interface ClientRecord {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  totalVisits: number;
  totalSpent: number;
  lastVisitDate: string;
  loyaltyStamps: number; // e.g. out of 10
  favoriteBarberId: string;
  haircutFormula: string; // Ficha técnica de máquina / degradê
  preferredBeverage?: string;
  vipTier: VIPTier;
  notes?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  description?: string;
  volume?: string;
}

export type PaymentMethod = "pix" | "credit_card" | "debit_card" | "cash";

export interface SaleRecord {
  id: string;
  barberId: string;
  clientName: string;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    type: "service" | "product";
  }[];
  subtotal: number;
  discount: number;
  tip: number;
  finalTotal: number;
  paymentMethod: PaymentMethod;
  commissionAmount: number;
  createdAt: string;
}

// Aliases for compatibility
export type POSSale = SaleRecord;
export type Sale = SaleRecord;

export interface HaircutRecommendation {
  styleName: string;
  suitabilityScore: number;
  description: string;
  technicalBarberNotes: string;
  recommendedProducts: string[];
  maintenanceCycle: string;
}

export interface AIHaircutConsultationResult {
  title: string;
  faceShapeAnalysis?: string;
  topRecommendations: HaircutRecommendation[];
  beardGuidance: string;
  barberInstructionsSummary: string;
}

export interface BarberShopSettings {
  name: string;
  tagline: string;
  phone: string;
  address: string;
  openTime: string;
  closeTime: string;
  currencySymbol: string;
  loyaltyTarget: number;
  defaultCommissionRate: number;
  themeMode?: "dark" | "light";
}

export type ShopSettings = BarberShopSettings;

export interface ExecutiveGrowthRecommendation {
  id: string;
  title: string;
  category: "pricing" | "retention" | "cross_sell" | "chair_occupancy" | "marketing";
  impact: "high" | "medium" | "quick_win";
  estimatedRevenueBoost: string;
  difficulty: "fácil" | "médio" | "estratégico";
  timeframe: string;
  description: string;
  actionSteps: string[];
}

export interface ExecutiveReportData {
  generatedAt: string;
  periodAnalyzed: string;
  financialHealthScore: number;
  financialHealthLabel: string;
  executiveSummary: string;
  keyMetricsDiagnosis: {
    grossRevenue: string;
    netProfitMargin: string;
    averageTicket: string;
    chairUtilizationRate: string;
    productSalesRatio: string;
    customerRetentionRate: string;
  };
  keyStrengths: string[];
  criticalVulnerabilities: string[];
  growthRecommendations: ExecutiveGrowthRecommendation[];
  strategicPricingInsights: {
    currentAverageTicket: string;
    suggestedCombos: {
      name: string;
      suggestedPrice: string;
      projectedAdoption: string;
      why: string;
    }[];
    marginOptimizationTip: string;
  };
  barberTeamPerformanceInsight: {
    topPerformer: string;
    occupancyObservation: string;
    incentiveSuggestion: string;
  };
  growthForecast90Days: {
    conservativeGrowth: string;
    recommendedScenarioGrowth: string;
    projectionSummary: string;
  };
}

export interface BackupStats {
  appointmentsCount: number;
  salesCount: number;
  clientsCount: number;
  productsCount: number;
  servicesCount: number;
  barbersCount: number;
  totalRevenue: number;
}

export interface BarberShopFullBackup {
  version: string;
  timestamp: string;
  humanDate: string;
  settings: BarberShopSettings;
  barbers: Barber[];
  services: Service[];
  products: ProductItem[];
  clients: ClientRecord[];
  appointments: Appointment[];
  sales: SaleRecord[];
  soundEnabled: boolean;
  stats: BackupStats;
}

export interface BackupSnapshot {
  id: string;
  timestamp: string;
  humanDate: string;
  label: string;
  reason: "periodic" | "manual" | "before_reset" | "critical_action";
  stats: BackupStats;
  payload: BarberShopFullBackup;
}
