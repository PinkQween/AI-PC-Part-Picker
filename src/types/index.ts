export type UseCase = 
  | 'coding'
  | 'gaming'
  | 'streaming'
  | 'vtuber'
  | 'multitab'
  | 'music';

export type BudgetType = 'strict' | 'soft' | 'flexible';

export type OperatingSystem = 'windows' | 'linux' | 'macos';

export interface SurveyState {
  useCases: UseCase[];
  budget: number | null;
  budgetType: BudgetType;
  storageCapacity: number | null;
  needsWireless: boolean | null;
  needsExpansionSlots: boolean | null;
  needsSoundCard: boolean | null;
  needsCaptureCard: boolean | null;
  operatingSystem: OperatingSystem | null;
}

export interface PCPart {
  id: string;
  name: string;
  category: 'cpu' | 'gpu' | 'ram' | 'motherboard' | 'psu' | 'storage' | 'cooler' | 'case' | 'soundcard' | 'capturecard' | 'wificard';
  price: number;
  specs: Record<string, string | number | boolean>;
  scores: Partial<Record<UseCase, number>>;
  requiresGPU?: boolean;
  integratedGraphics?: boolean;
}

export interface Recommendation {
  cpu: PCPart;
  gpu: PCPart | null;
  ram: PCPart;
  motherboard: PCPart;
  psu: PCPart;
  storage: PCPart;
  cooler: PCPart;
  case: PCPart;
  totalPrice: number;
  compatibility: {
    warnings: string[];
    compatible: boolean;
  };
  scores: Partial<Record<UseCase, number>>;
}

export interface DimensionalScore {
  cpu: number;
  gpu: number;
  ram: number;
  motherboard: number;
  storage: number;
  cooler: number;
  case: number;
  psu: number;
}
