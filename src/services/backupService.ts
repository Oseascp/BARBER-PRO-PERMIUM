import {
  BarberShopFullBackup,
  BackupSnapshot,
  BackupStats,
  BarberShopSettings,
  Barber,
  Service,
  ProductItem,
  ClientRecord,
  Appointment,
  SaleRecord,
} from "../types";

export const BACKUP_STORAGE_KEYS = {
  LATEST_BACKUP: "barberpro_auto_backup_latest_v2",
  SNAPSHOTS: "barberpro_backup_snapshots_v2",
  CONFIG: "barberpro_backup_config_v2",
};

export interface BackupConfig {
  autoBackupEnabled: boolean;
  intervalMinutes: number; // e.g. 1 minute
  maxSnapshots: number; // e.g. 8
  lastAutoBackupTimestamp?: string;
}

const DEFAULT_BACKUP_CONFIG: BackupConfig = {
  autoBackupEnabled: true,
  intervalMinutes: 1,
  maxSnapshots: 8,
};

export function getBackupConfig(): BackupConfig {
  try {
    const raw = localStorage.getItem(BACKUP_STORAGE_KEYS.CONFIG);
    return raw ? { ...DEFAULT_BACKUP_CONFIG, ...JSON.parse(raw) } : DEFAULT_BACKUP_CONFIG;
  } catch {
    return DEFAULT_BACKUP_CONFIG;
  }
}

export function saveBackupConfig(config: BackupConfig): void {
  try {
    localStorage.setItem(BACKUP_STORAGE_KEYS.CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error("Erro ao salvar configurações de backup:", err);
  }
}

export function computeBackupStats(
  appointments: Appointment[],
  sales: SaleRecord[],
  clients: ClientRecord[],
  products: ProductItem[],
  services: Service[],
  barbers: Barber[]
): BackupStats {
  const totalRevenue = sales.reduce((acc, s) => acc + (s.finalTotal || 0), 0);
  return {
    appointmentsCount: appointments.length,
    salesCount: sales.length,
    clientsCount: clients.length,
    productsCount: products.length,
    servicesCount: services.length,
    barbersCount: barbers.length,
    totalRevenue,
  };
}

export function buildFullBackupPayload(
  settings: BarberShopSettings,
  barbers: Barber[],
  services: Service[],
  products: ProductItem[],
  clients: ClientRecord[],
  appointments: Appointment[],
  sales: SaleRecord[],
  soundEnabled: boolean
): BarberShopFullBackup {
  const now = new Date();
  const humanDate = now.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const stats = computeBackupStats(appointments, sales, clients, products, services, barbers);

  return {
    version: "2.5",
    timestamp: now.toISOString(),
    humanDate,
    settings,
    barbers,
    services,
    products,
    clients,
    appointments,
    sales,
    soundEnabled,
    stats,
  };
}

export function getStoredSnapshots(): BackupSnapshot[] {
  try {
    const raw = localStorage.getItem(BACKUP_STORAGE_KEYS.SNAPSHOTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSnapshotsToStorage(snapshots: BackupSnapshot[]): void {
  try {
    localStorage.setItem(BACKUP_STORAGE_KEYS.SNAPSHOTS, JSON.stringify(snapshots));
  } catch (err) {
    console.error("Falha ao salvar snapshots no localStorage:", err);
  }
}

export function createAndStoreSnapshot(
  payload: BarberShopFullBackup,
  reason: "periodic" | "manual" | "before_reset" | "critical_action" = "periodic",
  customLabel?: string
): BackupSnapshot {
  const now = new Date();
  const id = `snap-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  
  let label = customLabel;
  if (!label) {
    if (reason === "periodic") {
      label = `Backup Periódico Automático (${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })})`;
    } else if (reason === "manual") {
      label = `Ponto Manual do Barbeiro (${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })})`;
    } else if (reason === "before_reset") {
      label = "Segurança Pré-Restauração de Fábrica";
    } else {
      label = `Registro Operacional (${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })})`;
    }
  }

  const snapshot: BackupSnapshot = {
    id,
    timestamp: payload.timestamp,
    humanDate: payload.humanDate,
    label,
    reason,
    stats: payload.stats,
    payload,
  };

  // Update latest auto backup cache
  try {
    localStorage.setItem(BACKUP_STORAGE_KEYS.LATEST_BACKUP, JSON.stringify(payload));
  } catch (e) {
    console.warn("Storage warning:", e);
  }

  // Update snapshots ring buffer
  const config = getBackupConfig();
  const existing = getStoredSnapshots();
  
  // If periodic, keep maxSnapshots, but retain manual and before_reset snapshots if possible
  const updated = [snapshot, ...existing].slice(0, config.maxSnapshots || 8);
  saveSnapshotsToStorage(updated);

  return snapshot;
}

export function deleteStoredSnapshot(snapshotId: string): BackupSnapshot[] {
  const existing = getStoredSnapshots();
  const filtered = existing.filter((s) => s.id !== snapshotId);
  saveSnapshotsToStorage(filtered);
  return filtered;
}

export function clearAllSnapshots(): void {
  localStorage.removeItem(BACKUP_STORAGE_KEYS.SNAPSHOTS);
}

export function exportBackupToFile(payload: BarberShopFullBackup, customName?: string): void {
  try {
    const dataStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const dateSlug = new Date().toISOString().slice(0, 10);
    const filename = customName || `barber-pro-backup-${dateSlug}-${Date.now().toString().slice(-4)}.json`;

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Erro ao exportar arquivo de backup:", err);
  }
}

export function validateAndParseBackupFile(rawText: string): {
  valid: boolean;
  data?: BarberShopFullBackup;
  error?: string;
} {
  try {
    const parsed = JSON.parse(rawText);
    if (!parsed || typeof parsed !== "object") {
      return { valid: false, error: "Arquivo JSON inválido ou vazio." };
    }

    // Validate essential keys
    if (!Array.isArray(parsed.appointments)) {
      return { valid: false, error: "Estrutura inválida: lista de agendamentos ausente." };
    }
    if (!Array.isArray(parsed.sales)) {
      return { valid: false, error: "Estrutura inválida: lista de vendas ausente." };
    }
    if (!Array.isArray(parsed.barbers)) {
      return { valid: false, error: "Estrutura inválida: lista de barbeiros ausente." };
    }
    if (!Array.isArray(parsed.services)) {
      return { valid: false, error: "Estrutura inválida: lista de serviços ausente." };
    }
    if (!Array.isArray(parsed.clients)) {
      return { valid: false, error: "Estrutura inválida: lista de clientes ausente." };
    }

    return { valid: true, data: parsed as BarberShopFullBackup };
  } catch (err: any) {
    return { valid: false, error: `Erro na leitura do arquivo: ${err?.message || "Formato inválido"}` };
  }
}

export function getLocalStorageUsageStats(): {
  usedKB: number;
  totalKeys: number;
  lastBackupDate: string | null;
} {
  try {
    let totalLength = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalLength += (localStorage[key]?.length || 0) + key.length;
      }
    }
    const usedKB = Math.round((totalLength * 2) / 1024); // UTF-16 characters ~2 bytes
    const snapshots = getStoredSnapshots();
    const lastBackupDate = snapshots.length > 0 ? snapshots[0].humanDate : null;

    return {
      usedKB,
      totalKeys: Object.keys(localStorage).length,
      lastBackupDate,
    };
  } catch {
    return { usedKB: 0, totalKeys: 0, lastBackupDate: null };
  }
}
