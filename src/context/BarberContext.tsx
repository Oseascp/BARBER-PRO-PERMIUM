import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import {
  Tenant,
  TenantStatus,
  TenantDataPayload,
  Barber,
  Service,
  ProductItem,
  ClientRecord,
  Appointment,
  SaleRecord,
  BarberShopSettings,
  ChairStatus,
  AppointmentStatus,
  ReminderMessageLog,
  BackupSnapshot,
  BarberShopFullBackup,
} from "../types";
import {
  INITIAL_SETTINGS,
  INITIAL_BARBERS,
  INITIAL_SERVICES,
  INITIAL_PRODUCTS,
  INITIAL_CLIENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_SALES,
} from "../data/initialData";
import {
  INITIAL_TENANTS,
  VINTAGE90_DATA,
  DOMBARBA_DATA,
  generateStarterTenantData,
} from "../data/tenantData";
import { soundEngine } from "../utils/audio";
import {
  ReminderConfig,
  getStoredReminderConfig,
  saveReminderConfig,
  getStoredReminderLogs,
  sendSimulatedReminderApi,
} from "../services/messagingService";
import {
  buildFullBackupPayload,
  createAndStoreSnapshot,
  getStoredSnapshots,
  deleteStoredSnapshot,
  exportBackupToFile,
  getBackupConfig,
  saveBackupConfig,
  BackupConfig,
} from "../services/backupService";

interface BarberContextType {
  // Multi-Tenant Management
  tenants: Tenant[];
  currentTenant: Tenant;
  activeTenantId: string;
  switchTenant: (tenantIdOrSlug: string) => void;
  createTenant: (
    tenantData: Omit<Tenant, "id" | "createdAt"> & { chairsCount?: number },
    templateMode?: "sample" | "blank",
    chairsCount?: number
  ) => Tenant;
  updateTenant: (tenantId: string, updates: Partial<Tenant>) => void;
  deleteTenant: (tenantId: string) => boolean;
  duplicateTenant: (tenantId: string, newName?: string) => Tenant;
  convertTrialToActive: (tenantId: string) => void;

  // Active Tenant Domain Data
  settings: BarberShopSettings;
  barbers: Barber[];
  services: Service[];
  products: ProductItem[];
  clients: ClientRecord[];
  appointments: Appointment[];
  sales: SaleRecord[];
  soundEnabled: boolean;
  reminderConfig: ReminderConfig;
  reminderLogs: ReminderMessageLog[];
  lastBackupTime: string | null;
  backupStatus: "saved" | "saving" | "idle";
  snapshots: BackupSnapshot[];
  backupConfig: BackupConfig;
  setSoundEnabled: (enabled: boolean) => void;
  setBarbers: React.Dispatch<React.SetStateAction<Barber[]>>;
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  setProducts: React.Dispatch<React.SetStateAction<ProductItem[]>>;
  updateProductStock: (productId: string, newStock: number) => void;
  adjustProductStock: (productId: string, delta: number) => void;
  addProduct: (product: Omit<ProductItem, "id">) => ProductItem;
  updateSettings: (newSettings: BarberShopSettings) => void;
  updateChairStatus: (barberId: string, status: ChairStatus) => void;
  startServiceInChair: (barberId: string, clientName: string, durationMinutes?: number) => void;
  addAppointment: (apt: Omit<Appointment, "id" | "createdAt">) => Appointment;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  addClient: (client: Omit<ClientRecord, "id" | "totalVisits" | "totalSpent" | "lastVisitDate" | "loyaltyStamps">) => ClientRecord;
  updateClient: (client: ClientRecord) => void;
  addLoyaltyStamp: (clientId: string) => void;
  processSale: (sale: Omit<SaleRecord, "id" | "createdAt">) => SaleRecord;
  sendAppointmentReminder: (
    appointmentId: string,
    channel?: "whatsapp" | "sms",
    customMessage?: string
  ) => Promise<{ success: boolean; deliveryId?: string; error?: string }>;
  sendBatchReminders: (
    appointmentIds: string[],
    channel?: "whatsapp" | "sms"
  ) => Promise<{ sentCount: number; failedCount: number }>;
  updateReminderConfig: (config: ReminderConfig) => void;
  refreshReminderLogs: () => void;
  playCashRegisterSound: () => void;
  playScissorSound: () => void;
  // Backup operations
  createManualBackup: (label?: string) => BackupSnapshot;
  restoreFromSnapshot: (snapshot: BackupSnapshot) => boolean;
  restoreFromBackupData: (data: BarberShopFullBackup) => boolean;
  exportBackupFile: (customName?: string) => void;
  deleteSnapshotById: (id: string) => void;
  updateBackupConfig: (config: BackupConfig) => void;
  resetToFactoryData: () => void;
}

const BarberContext = createContext<BarberContextType | null>(null);

const STORAGE_KEYS = {
  TENANTS_LIST: "barberpro_tenants_registry_v1",
  ACTIVE_TENANT_ID: "barberpro_active_tenant_id_v1",
  SOUND: "barberpro_sound_pt_v2",
};

const getTenantKey = (tenantId: string, entity: string) => `barberpro_t_${tenantId}_${entity}_v1`;

// Helpers to load initial tenant data with fallback and legacy migration
function getInitialTenantData(tenantId: string): TenantDataPayload {
  try {
    const rawSettings = localStorage.getItem(getTenantKey(tenantId, "settings"));
    const rawBarbers = localStorage.getItem(getTenantKey(tenantId, "barbers"));
    const rawServices = localStorage.getItem(getTenantKey(tenantId, "services"));
    const rawProducts = localStorage.getItem(getTenantKey(tenantId, "products"));
    const rawClients = localStorage.getItem(getTenantKey(tenantId, "clients"));
    const rawAppointments = localStorage.getItem(getTenantKey(tenantId, "appointments"));
    const rawSales = localStorage.getItem(getTenantKey(tenantId, "sales"));

    if (tenantId === "tenant-imperial") {
      // Check legacy keys for imperial
      const legacySettings = localStorage.getItem("barberpro_settings_pt_v2");
      const legacyBarbers = localStorage.getItem("barberpro_barbers_pt_v2");
      const legacyServices = localStorage.getItem("barberpro_services_pt_v2");
      const legacyProducts = localStorage.getItem("barberpro_products_pt_v2");
      const legacyClients = localStorage.getItem("barberpro_clients_pt_v2");
      const legacyAppointments = localStorage.getItem("barberpro_appointments_pt_v2");
      const legacySales = localStorage.getItem("barberpro_sales_pt_v2");

      return {
        settings: rawSettings ? JSON.parse(rawSettings) : (legacySettings ? JSON.parse(legacySettings) : INITIAL_SETTINGS),
        barbers: rawBarbers ? JSON.parse(rawBarbers) : (legacyBarbers ? JSON.parse(legacyBarbers) : INITIAL_BARBERS),
        services: rawServices ? JSON.parse(rawServices) : (legacyServices ? JSON.parse(legacyServices) : INITIAL_SERVICES),
        products: rawProducts ? JSON.parse(rawProducts) : (legacyProducts ? JSON.parse(legacyProducts) : INITIAL_PRODUCTS),
        clients: rawClients ? JSON.parse(rawClients) : (legacyClients ? JSON.parse(legacyClients) : INITIAL_CLIENTS),
        appointments: rawAppointments ? JSON.parse(rawAppointments) : (legacyAppointments ? JSON.parse(legacyAppointments) : INITIAL_APPOINTMENTS),
        sales: rawSales ? JSON.parse(rawSales) : (legacySales ? JSON.parse(legacySales) : INITIAL_SALES),
      };
    } else if (tenantId === "tenant-vintage90") {
      return {
        settings: rawSettings ? JSON.parse(rawSettings) : VINTAGE90_DATA.settings,
        barbers: rawBarbers ? JSON.parse(rawBarbers) : VINTAGE90_DATA.barbers,
        services: rawServices ? JSON.parse(rawServices) : VINTAGE90_DATA.services,
        products: rawProducts ? JSON.parse(rawProducts) : VINTAGE90_DATA.products,
        clients: rawClients ? JSON.parse(rawClients) : VINTAGE90_DATA.clients,
        appointments: rawAppointments ? JSON.parse(rawAppointments) : VINTAGE90_DATA.appointments,
        sales: rawSales ? JSON.parse(rawSales) : VINTAGE90_DATA.sales,
      };
    } else if (tenantId === "tenant-dombarba") {
      return {
        settings: rawSettings ? JSON.parse(rawSettings) : DOMBARBA_DATA.settings,
        barbers: rawBarbers ? JSON.parse(rawBarbers) : DOMBARBA_DATA.barbers,
        services: rawServices ? JSON.parse(rawServices) : DOMBARBA_DATA.services,
        products: rawProducts ? JSON.parse(rawProducts) : DOMBARBA_DATA.products,
        clients: rawClients ? JSON.parse(rawClients) : DOMBARBA_DATA.clients,
        appointments: rawAppointments ? JSON.parse(rawAppointments) : DOMBARBA_DATA.appointments,
        sales: rawSales ? JSON.parse(rawSales) : DOMBARBA_DATA.sales,
      };
    } else {
      // Dynamic tenant
      return {
        settings: rawSettings ? JSON.parse(rawSettings) : INITIAL_SETTINGS,
        barbers: rawBarbers ? JSON.parse(rawBarbers) : [],
        services: rawServices ? JSON.parse(rawServices) : [],
        products: rawProducts ? JSON.parse(rawProducts) : [],
        clients: rawClients ? JSON.parse(rawClients) : [],
        appointments: rawAppointments ? JSON.parse(rawAppointments) : [],
        sales: rawSales ? JSON.parse(rawSales) : [],
      };
    }
  } catch (err) {
    console.error("Erro ao carregar dados do tenant:", tenantId, err);
    return {
      settings: INITIAL_SETTINGS,
      barbers: INITIAL_BARBERS,
      services: INITIAL_SERVICES,
      products: INITIAL_PRODUCTS,
      clients: INITIAL_CLIENTS,
      appointments: INITIAL_APPOINTMENTS,
      sales: INITIAL_SALES,
    };
  }
}

export const BarberProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Tenants Registry
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TENANTS_LIST);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Erro ao carregar lista de tenants:", e);
    }
    return INITIAL_TENANTS;
  });

  // 2. Active Tenant ID determination (URL param check -> localStorage -> default imperial)
  const [activeTenantId, setActiveTenantId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const urlTenantParam = urlParams.get("tenant") || urlParams.get("b");
      if (urlTenantParam) {
        const found = INITIAL_TENANTS.find(
          (t) => t.id === urlTenantParam || t.slug === urlTenantParam
        );
        if (found) return found.id;
      }
    }
    const savedActive = localStorage.getItem(STORAGE_KEYS.ACTIVE_TENANT_ID);
    return savedActive || "tenant-imperial";
  });

  // Current tenant object reference
  const currentTenant = tenants.find((t) => t.id === activeTenantId) || tenants[0] || INITIAL_TENANTS[0];

  // 3. Isolated State per Active Tenant
  const initialData = getInitialTenantData(currentTenant.id);

  const [settings, setSettings] = useState<BarberShopSettings>(initialData.settings);
  const [barbers, setBarbers] = useState<Barber[]>(initialData.barbers);
  const [services, setServices] = useState<Service[]>(initialData.services);
  const [products, setProducts] = useState<ProductItem[]>(initialData.products);
  const [clients, setClients] = useState<ClientRecord[]>(initialData.clients);
  const [appointments, setAppointments] = useState<Appointment[]>(initialData.appointments);
  const [sales, setSales] = useState<SaleRecord[]>(initialData.sales);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SOUND);
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [reminderConfig, setReminderConfig] = useState<ReminderConfig>(() => {
    return getStoredReminderConfig();
  });

  const [reminderLogs, setReminderLogs] = useState<ReminderMessageLog[]>(() => {
    return getStoredReminderLogs();
  });

  const [backupConfig, setBackupConfig] = useState<BackupConfig>(() => {
    return getBackupConfig();
  });

  const [snapshots, setSnapshots] = useState<BackupSnapshot[]>(() => {
    return getStoredSnapshots();
  });

  const [lastBackupTime, setLastBackupTime] = useState<string | null>(() => {
    const existing = getStoredSnapshots();
    return existing.length > 0 ? existing[0].humanDate : null;
  });

  const [backupStatus, setBackupStatus] = useState<"saved" | "saving" | "idle">("saved");

  // Keep tenants list in localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TENANTS_LIST, JSON.stringify(tenants));
  }, [tenants]);

  // Keep active tenant in localStorage and URL
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TENANT_ID, activeTenantId);
  }, [activeTenantId]);

  // Save current domain data to current tenant storage key
  useEffect(() => {
    if (!activeTenantId) return;
    localStorage.setItem(getTenantKey(activeTenantId, "settings"), JSON.stringify(settings));
    // Also sync tenant settings in tenants list
    setTenants((prev) =>
      prev.map((t) =>
        t.id === activeTenantId
          ? { ...t, name: settings.name, settings: settings }
          : t
      )
    );
  }, [settings, activeTenantId]);

  useEffect(() => {
    if (!activeTenantId) return;
    localStorage.setItem(getTenantKey(activeTenantId, "barbers"), JSON.stringify(barbers));
    // Sync chair count in tenants list
    setTenants((prev) =>
      prev.map((t) => (t.id === activeTenantId ? { ...t, chairsCount: barbers.length } : t))
    );
  }, [barbers, activeTenantId]);

  useEffect(() => {
    if (!activeTenantId) return;
    localStorage.setItem(getTenantKey(activeTenantId, "services"), JSON.stringify(services));
  }, [services, activeTenantId]);

  useEffect(() => {
    if (!activeTenantId) return;
    localStorage.setItem(getTenantKey(activeTenantId, "products"), JSON.stringify(products));
  }, [products, activeTenantId]);

  useEffect(() => {
    if (!activeTenantId) return;
    localStorage.setItem(getTenantKey(activeTenantId, "clients"), JSON.stringify(clients));
  }, [clients, activeTenantId]);

  useEffect(() => {
    if (!activeTenantId) return;
    localStorage.setItem(getTenantKey(activeTenantId, "appointments"), JSON.stringify(appointments));
  }, [appointments, activeTenantId]);

  useEffect(() => {
    if (!activeTenantId) return;
    localStorage.setItem(getTenantKey(activeTenantId, "sales"), JSON.stringify(sales));
  }, [sales, activeTenantId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SOUND, JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  // Ref to always access latest state in periodic timers without stale closures
  const stateRef = useRef({
    activeTenantId,
    settings,
    barbers,
    services,
    products,
    clients,
    appointments,
    sales,
    soundEnabled,
  });

  useEffect(() => {
    stateRef.current = {
      activeTenantId,
      settings,
      barbers,
      services,
      products,
      clients,
      appointments,
      sales,
      soundEnabled,
    };
  }, [activeTenantId, settings, barbers, services, products, clients, appointments, sales, soundEnabled]);

  // Multi-Tenant Operations
  const switchTenant = useCallback(
    (tenantIdOrSlug: string) => {
      const target = tenants.find(
        (t) => t.id === tenantIdOrSlug || t.slug === tenantIdOrSlug
      );
      if (!target) {
        console.warn("Tenant não encontrado para alternar:", tenantIdOrSlug);
        return;
      }

      if (target.id === activeTenantId) return;

      // 1. Flush current tenant data explicitly to localStorage
      const curr = stateRef.current;
      localStorage.setItem(getTenantKey(curr.activeTenantId, "settings"), JSON.stringify(curr.settings));
      localStorage.setItem(getTenantKey(curr.activeTenantId, "barbers"), JSON.stringify(curr.barbers));
      localStorage.setItem(getTenantKey(curr.activeTenantId, "services"), JSON.stringify(curr.services));
      localStorage.setItem(getTenantKey(curr.activeTenantId, "products"), JSON.stringify(curr.products));
      localStorage.setItem(getTenantKey(curr.activeTenantId, "clients"), JSON.stringify(curr.clients));
      localStorage.setItem(getTenantKey(curr.activeTenantId, "appointments"), JSON.stringify(curr.appointments));
      localStorage.setItem(getTenantKey(curr.activeTenantId, "sales"), JSON.stringify(curr.sales));

      // 2. Load target tenant data
      const nextData = getInitialTenantData(target.id);
      setActiveTenantId(target.id);
      setSettings(nextData.settings);
      setBarbers(nextData.barbers);
      setServices(nextData.services);
      setProducts(nextData.products);
      setClients(nextData.clients);
      setAppointments(nextData.appointments);
      setSales(nextData.sales);

      // 3. Update URL with tenant query parameter quietly
      if (typeof window !== "undefined") {
        try {
          const url = new URL(window.location.href);
          url.searchParams.set("tenant", target.slug);
          window.history.replaceState({}, "", url.toString());
        } catch {
          // Ignore
        }
      }

      if (soundEnabled) soundEngine.playScissorSnip();
    },
    [tenants, activeTenantId, soundEnabled]
  );

  const createTenant = (
    tenantData: Omit<Tenant, "id" | "createdAt"> & { chairsCount?: number },
    templateMode: "sample" | "blank" = "sample",
    customChairsCount?: number
  ): Tenant => {
    const newId = `tenant-${Date.now()}`;
    const cleanSlug = tenantData.slug
      ? tenantData.slug.toLowerCase().replace(/[^a-z0-9-]/g, "")
      : tenantData.name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");

    const chairsCount = customChairsCount || tenantData.chairsCount || 2;

    const starterData = generateStarterTenantData(
      tenantData.name,
      tenantData.ownerName,
      tenantData.ownerPhone,
      tenantData.address,
      tenantData.settings?.currencySymbol || "R$",
      templateMode,
      chairsCount
    );

    const now = new Date();
    const isTrial = tenantData.status === "trial";
    const trialStartedAt = isTrial
      ? tenantData.trialStartedAt || now.toISOString()
      : undefined;
    const trialEndsAt = isTrial
      ? tenantData.trialEndsAt ||
        new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    const newTenant: Tenant = {
      ...tenantData,
      id: newId,
      slug: cleanSlug || newId,
      createdAt: now.toISOString(),
      trialStartedAt,
      trialEndsAt,
      chairsCount: starterData.barbers.length,
      settings: starterData.settings,
    };

    // Save initial domain payload for this tenant
    localStorage.setItem(getTenantKey(newId, "settings"), JSON.stringify(starterData.settings));
    localStorage.setItem(getTenantKey(newId, "barbers"), JSON.stringify(starterData.barbers));
    localStorage.setItem(getTenantKey(newId, "services"), JSON.stringify(starterData.services));
    localStorage.setItem(getTenantKey(newId, "products"), JSON.stringify(starterData.products));
    localStorage.setItem(getTenantKey(newId, "clients"), JSON.stringify(starterData.clients));
    localStorage.setItem(getTenantKey(newId, "appointments"), JSON.stringify(starterData.appointments));
    localStorage.setItem(getTenantKey(newId, "sales"), JSON.stringify(starterData.sales));

    // Add to tenants list
    setTenants((prev) => [newTenant, ...prev]);

    // Immediately switch to the newly created tenant
    setTimeout(() => {
      switchTenant(newId);
    }, 50);

    return newTenant;
  };

  const convertTrialToActive = (tenantId: string) => {
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === tenantId) {
          return {
            ...t,
            status: "active" as TenantStatus,
          };
        }
        return t;
      })
    );
    if (soundEnabled) soundEngine.playSuccess();
  };

  const updateTenant = (tenantId: string, updates: Partial<Tenant>) => {
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === tenantId) {
          const updated = { ...t, ...updates };
          if (updates.name && t.id === activeTenantId) {
            setSettings((s) => ({ ...s, name: updates.name! }));
          }
          return updated;
        }
        return t;
      })
    );
  };

  const deleteTenant = (tenantId: string): boolean => {
    if (tenants.length <= 1) {
      alert("Não é possível excluir a única barbearia cadastrada.");
      return false;
    }

    const filtered = tenants.filter((t) => t.id !== tenantId);
    setTenants(filtered);

    // If current tenant is the deleted one, switch to the first remaining
    if (activeTenantId === tenantId && filtered.length > 0) {
      switchTenant(filtered[0].id);
    }

    // Clean up storage
    localStorage.removeItem(getTenantKey(tenantId, "settings"));
    localStorage.removeItem(getTenantKey(tenantId, "barbers"));
    localStorage.removeItem(getTenantKey(tenantId, "services"));
    localStorage.removeItem(getTenantKey(tenantId, "products"));
    localStorage.removeItem(getTenantKey(tenantId, "clients"));
    localStorage.removeItem(getTenantKey(tenantId, "appointments"));
    localStorage.removeItem(getTenantKey(tenantId, "sales"));

    return true;
  };

  const duplicateTenant = (tenantId: string, newName?: string): Tenant => {
    const source = tenants.find((t) => t.id === tenantId);
    const sourceData = getInitialTenantData(tenantId);

    const name = newName || `${source?.name || "Barbearia"} (Cópia)`;
    const newId = `tenant-${Date.now()}`;
    const slug = `${source?.slug || "barbearia"}-copia-${Math.floor(Math.random() * 1000)}`;

    const duplicatedTenant: Tenant = {
      ...(source || INITIAL_TENANTS[0]),
      id: newId,
      slug: slug,
      name: name,
      createdAt: new Date().toISOString(),
      settings: {
        ...sourceData.settings,
        name: name,
      },
      chairsCount: sourceData.barbers.length,
    };

    localStorage.setItem(getTenantKey(newId, "settings"), JSON.stringify(duplicatedTenant.settings));
    localStorage.setItem(getTenantKey(newId, "barbers"), JSON.stringify(sourceData.barbers));
    localStorage.setItem(getTenantKey(newId, "services"), JSON.stringify(sourceData.services));
    localStorage.setItem(getTenantKey(newId, "products"), JSON.stringify(sourceData.products));
    localStorage.setItem(getTenantKey(newId, "clients"), JSON.stringify(sourceData.clients));
    localStorage.setItem(getTenantKey(newId, "appointments"), JSON.stringify(sourceData.appointments));
    localStorage.setItem(getTenantKey(newId, "sales"), JSON.stringify(sourceData.sales));

    setTenants((prev) => [duplicatedTenant, ...prev]);
    return duplicatedTenant;
  };

  // Periodic automatic backup executor
  const performAutoBackup = useCallback(() => {
    if (!backupConfig.autoBackupEnabled) return;
    setBackupStatus("saving");

    try {
      const current = stateRef.current;
      const payload = buildFullBackupPayload(
        current.settings,
        current.barbers,
        current.services,
        current.products,
        current.clients,
        current.appointments,
        current.sales,
        current.soundEnabled
      );

      const snapshot = createAndStoreSnapshot(payload, "periodic");
      setSnapshots(getStoredSnapshots());
      setLastBackupTime(snapshot.humanDate);
      setBackupStatus("saved");
    } catch (err) {
      console.error("Falha no auto-backup periódico:", err);
      setBackupStatus("idle");
    }
  }, [backupConfig.autoBackupEnabled]);

  // Setup periodic auto-backup interval
  useEffect(() => {
    if (!backupConfig.autoBackupEnabled) return;

    const existing = getStoredSnapshots();
    if (existing.length === 0) {
      performAutoBackup();
    }

    const intervalMs = Math.max(30000, (backupConfig.intervalMinutes || 1) * 60 * 1000);
    const timer = setInterval(() => {
      performAutoBackup();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [backupConfig.autoBackupEnabled, backupConfig.intervalMinutes, performAutoBackup]);

  // Flush backup before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const current = stateRef.current;
      const payload = buildFullBackupPayload(
        current.settings,
        current.barbers,
        current.services,
        current.products,
        current.clients,
        current.appointments,
        current.sales,
        current.soundEnabled
      );
      createAndStoreSnapshot(payload, "periodic", "Backup de Saída do Navegador");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Backup methods
  const createManualBackup = (label?: string): BackupSnapshot => {
    setBackupStatus("saving");
    const payload = buildFullBackupPayload(
      settings,
      barbers,
      services,
      products,
      clients,
      appointments,
      sales,
      soundEnabled
    );

    const snapshot = createAndStoreSnapshot(payload, "manual", label);
    const updatedSnapshots = getStoredSnapshots();
    setSnapshots(updatedSnapshots);
    setLastBackupTime(snapshot.humanDate);
    setBackupStatus("saved");
    if (soundEnabled) soundEngine.playCashRegister();
    return snapshot;
  };

  const restoreFromBackupData = (data: BarberShopFullBackup): boolean => {
    try {
      const currentPayload = buildFullBackupPayload(
        settings,
        barbers,
        services,
        products,
        clients,
        appointments,
        sales,
        soundEnabled
      );
      createAndStoreSnapshot(currentPayload, "before_reset", "Snapshot de Segurança Pré-Restauração");

      if (data.settings) setSettings(data.settings);
      if (data.barbers && Array.isArray(data.barbers)) setBarbers(data.barbers);
      if (data.services && Array.isArray(data.services)) setServices(data.services);
      if (data.products && Array.isArray(data.products)) setProducts(data.products);
      if (data.clients && Array.isArray(data.clients)) setClients(data.clients);
      if (data.appointments && Array.isArray(data.appointments)) setAppointments(data.appointments);
      if (data.sales && Array.isArray(data.sales)) setSales(data.sales);
      if (typeof data.soundEnabled === "boolean") setSoundEnabled(data.soundEnabled);

      setSnapshots(getStoredSnapshots());
      setLastBackupTime(new Date().toLocaleString("pt-BR"));
      setBackupStatus("saved");
      if (soundEnabled) soundEngine.playCashRegister();
      return true;
    } catch (err) {
      console.error("Erro ao restaurar backup:", err);
      return false;
    }
  };

  const restoreFromSnapshot = (snapshot: BackupSnapshot): boolean => {
    if (!snapshot || !snapshot.payload) return false;
    return restoreFromBackupData(snapshot.payload);
  };

  const exportBackupFile = (customName?: string) => {
    const payload = buildFullBackupPayload(
      settings,
      barbers,
      services,
      products,
      clients,
      appointments,
      sales,
      soundEnabled
    );
    exportBackupToFile(payload, customName);
  };

  const deleteSnapshotById = (id: string) => {
    const remaining = deleteStoredSnapshot(id);
    setSnapshots(remaining);
  };

  const resetToFactoryData = () => {
    const currentPayload = buildFullBackupPayload(
      settings,
      barbers,
      services,
      products,
      clients,
      appointments,
      sales,
      soundEnabled
    );
    createAndStoreSnapshot(currentPayload, "before_reset", "Segurança Pré-Reset de Fábrica");

    setSettings(INITIAL_SETTINGS);
    setBarbers(INITIAL_BARBERS);
    setServices(INITIAL_SERVICES);
    setProducts(INITIAL_PRODUCTS);
    setClients(INITIAL_CLIENTS);
    setAppointments(INITIAL_APPOINTMENTS);
    setSales(INITIAL_SALES);
    setSoundEnabled(true);
    setSnapshots(getStoredSnapshots());
  };

  const refreshReminderLogs = () => {
    setReminderLogs(getStoredReminderLogs());
  };

  const updateReminderConfig = (newConfig: ReminderConfig) => {
    setReminderConfig(newConfig);
    saveReminderConfig(newConfig);
  };

  const updateBackupConfig = (newConfig: BackupConfig) => {
    setBackupConfig(newConfig);
    saveBackupConfig(newConfig);
  };

  // Audio helpers
  const playCashRegisterSound = () => {
    if (soundEnabled) soundEngine.playCashRegister();
  };

  const playScissorSound = () => {
    if (soundEnabled) soundEngine.playScissorSnip();
  };

  // Actions
  const updateSettings = (newSettings: BarberShopSettings) => {
    setSettings(newSettings);
  };

  const updateChairStatus = (barberId: string, status: ChairStatus) => {
    setBarbers((prev) =>
      prev.map((b) => {
        if (b.id === barberId) {
          if (status === "free") {
            return {
              ...b,
              chairStatus: "free",
              currentClientName: undefined,
              serviceStartedAt: undefined,
              estimatedMinutesRemaining: undefined,
            };
          }
          return { ...b, chairStatus: status };
        }
        return b;
      })
    );
  };

  const startServiceInChair = (barberId: string, clientName: string, durationMinutes = 35) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    setBarbers((prev) =>
      prev.map((b) => {
        if (b.id === barberId) {
          return {
            ...b,
            chairStatus: "in_chair",
            currentClientName: clientName,
            serviceStartedAt: timeStr,
            estimatedMinutesRemaining: durationMinutes,
          };
        }
        return b;
      })
    );

    if (soundEnabled) soundEngine.playScissorSnip();
  };

  const addAppointment = (aptData: Omit<Appointment, "id" | "createdAt">): Appointment => {
    const newAppointment: Appointment = {
      ...aptData,
      id: `apt-${Date.now()}`,
      createdAt: new Date().toISOString(),
      reminderStatus: "pending",
    };

    setAppointments((prev) => [newAppointment, ...prev]);

    // Check if client exists, otherwise create
    const existingClient = clients.find(
      (c) => c.phone.replace(/\D/g, "") === aptData.clientPhone.replace(/\D/g, "")
    );

    if (!existingClient) {
      addClient({
        name: aptData.clientName,
        phone: aptData.clientPhone,
        favoriteBarberId: aptData.barberId,
        haircutFormula: "Corte degradê / alinhamento padrão",
        vipTier: "bronze",
        notes: aptData.notes,
      });
    }

    if (soundEnabled) soundEngine.playNotification();
    return newAppointment;
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          if (status === "in_chair") {
            const barber = barbers.find((b) => b.id === a.barberId);
            if (barber) {
              startServiceInChair(barber.id, a.clientName, 40);
            }
          }
          return { ...a, status };
        }
        return a;
      })
    );
  };

  const addClient = (
    clientData: Omit<ClientRecord, "id" | "totalVisits" | "totalSpent" | "lastVisitDate" | "loyaltyStamps">
  ): ClientRecord => {
    const newClient: ClientRecord = {
      ...clientData,
      id: `cli-${Date.now()}`,
      totalVisits: 1,
      totalSpent: 0,
      lastVisitDate: new Date().toISOString().split("T")[0],
      loyaltyStamps: 1,
      avatar:
        clientData.avatar ||
        `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 50000000)}?auto=format&fit=crop&w=150&q=80`,
    };

    setClients((prev) => [newClient, ...prev]);
    return newClient;
  };

  const updateClient = (updatedClient: ClientRecord) => {
    setClients((prev) => prev.map((c) => (c.id === updatedClient.id ? updatedClient : c)));
  };

  const addLoyaltyStamp = (clientId: string) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === clientId) {
          const newStamps = c.loyaltyStamps + 1;
          const nextTier =
            newStamps >= 15 ? "diamond" : newStamps >= 10 ? "gold" : newStamps >= 5 ? "silver" : "bronze";
          return {
            ...c,
            loyaltyStamps: newStamps,
            vipTier: nextTier,
          };
        }
        return c;
      })
    );
    if (soundEnabled) soundEngine.playLevelUp();
  };

  const processSale = (saleData: Omit<SaleRecord, "id" | "createdAt">): SaleRecord => {
    const newSale: SaleRecord = {
      ...saleData,
      id: `sale-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setSales((prev) => [newSale, ...prev]);

    // Reduz estoque dos produtos vendidos
    saleData.items.forEach((item) => {
      if (item.type === "product") {
        adjustProductStock(item.id, -item.quantity);
      }
    });

    // Atualiza estatísticas do cliente se identificado
    setClients((prev) => {
      const idx = prev.findIndex(
        (c) => c.name.toLowerCase().trim() === saleData.clientName.toLowerCase().trim()
      );
      if (idx !== -1) {
        const target = prev[idx];
        const updated = {
          ...target,
          totalVisits: target.totalVisits + 1,
          totalSpent: target.totalSpent + saleData.finalTotal,
          lastVisitDate: new Date().toISOString().split("T")[0],
          loyaltyStamps: target.loyaltyStamps + 1,
        };
        const updatedList = [...prev];
        updatedList[idx] = updated;
        return updatedList;
      } else {
        return prev;
      }
    });

    // Se o barbeiro estava com este cliente na cadeira, libera a cadeira
    setBarbers((prev) =>
      prev.map((b) => {
        if (b.id === saleData.barberId && b.chairStatus === "in_chair") {
          return {
            ...b,
            chairStatus: "free",
            currentClientName: undefined,
            serviceStartedAt: undefined,
            estimatedMinutesRemaining: undefined,
          };
        }
        return b;
      })
    );

    return newSale;
  };

  const updateProductStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: Math.max(0, newStock) } : p))
    );
  };

  const adjustProductStock = (productId: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: Math.max(0, p.stock + delta) } : p))
    );
  };

  const addProduct = (productData: Omit<ProductItem, "id">): ProductItem => {
    const newProduct: ProductItem = {
      ...productData,
      id: `prd-${Date.now()}`,
    };
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const sendAppointmentReminder = async (
    appointmentId: string,
    channel: "whatsapp" | "sms" = reminderConfig.defaultChannel,
    customMessage?: string
  ): Promise<{ success: boolean; deliveryId?: string; error?: string }> => {
    const targetApt = appointments.find((a) => a.id === appointmentId);
    if (!targetApt) {
      return { success: false, error: "Agendamento não encontrado." };
    }

    setAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? { ...a, reminderStatus: "sending" } : a))
    );

    try {
      const res = await sendSimulatedReminderApi(
        targetApt,
        barbers,
        services,
        settings,
        channel,
        customMessage
      );

      if (res.success) {
        setAppointments((prev) =>
          prev.map((a) =>
            a.id === appointmentId
              ? {
                  ...a,
                  reminderStatus: "sent",
                  reminderSentAt: res.timestamp,
                  reminderChannel: channel,
                  reminderDeliveryId: res.deliveryId,
                }
              : a
          )
        );
        refreshReminderLogs();
        return { success: true, deliveryId: res.deliveryId };
      } else {
        setAppointments((prev) =>
          prev.map((a) =>
            a.id === appointmentId
              ? {
                  ...a,
                  reminderStatus: "failed",
                }
              : a
          )
        );
        return { success: false, error: res.error || "Falha no envio do lembrete." };
      }
    } catch (e: any) {
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === appointmentId
            ? {
                ...a,
                reminderStatus: "failed",
              }
            : a
        )
      );
      return { success: false, error: e?.message || "Erro de rede no gateway de mensagens." };
    }
  };

  const sendBatchReminders = async (
    appointmentIds: string[],
    channel: "whatsapp" | "sms" = reminderConfig.defaultChannel
  ): Promise<{ sentCount: number; failedCount: number }> => {
    let sentCount = 0;
    let failedCount = 0;

    for (const id of appointmentIds) {
      const result = await sendAppointmentReminder(id, channel);
      if (result.success) {
        sentCount++;
      } else {
        failedCount++;
      }
    }

    return { sentCount, failedCount };
  };

  return (
    <BarberContext.Provider
      value={{
        tenants,
        currentTenant,
        activeTenantId,
        switchTenant,
        createTenant,
        updateTenant,
        deleteTenant,
        duplicateTenant,
        convertTrialToActive,
        settings,
        barbers,
        services,
        products,
        clients,
        appointments,
        sales,
        soundEnabled,
        reminderConfig,
        reminderLogs,
        lastBackupTime,
        backupStatus,
        snapshots,
        backupConfig,
        setSoundEnabled,
        setBarbers,
        setServices,
        setProducts,
        updateProductStock,
        adjustProductStock,
        addProduct,
        updateSettings,
        updateChairStatus,
        startServiceInChair,
        addAppointment,
        updateAppointmentStatus,
        addClient,
        updateClient,
        addLoyaltyStamp,
        processSale,
        sendAppointmentReminder,
        sendBatchReminders,
        updateReminderConfig,
        refreshReminderLogs,
        playCashRegisterSound,
        playScissorSound,
        createManualBackup,
        restoreFromSnapshot,
        restoreFromBackupData,
        exportBackupFile,
        deleteSnapshotById,
        updateBackupConfig,
        resetToFactoryData,
      }}
    >
      {children}
    </BarberContext.Provider>
  );
};

export const useBarber = () => {
  const context = useContext(BarberContext);
  if (!context) {
    throw new Error("useBarber deve ser usado dentro de um BarberProvider");
  }
  return context;
};
