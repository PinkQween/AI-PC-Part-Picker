import type { PCPart, UseCase, SurveyState, Recommendation } from '../types';
import { 
  cpuDatabase, gpuDatabase, ramDatabase, motherboardDatabase, 
  psuDatabase, storageDatabase, coolerDatabase, caseDatabase 
} from '../data/pcParts';

// Calculate use case weights based on selected use cases
const calculateUseCaseWeights = (useCases: UseCase[]): Record<UseCase, number> => {
  const baseWeights: Record<UseCase, number> = {
    coding: 0,
    gaming: 0,
    streaming: 0,
    vtuber: 0,
    multitab: 0,
    music: 0,
  };

  useCases.forEach(useCase => {
    baseWeights[useCase] = 1;
  });

  // Normalize
  const sum = Object.values(baseWeights).reduce((a, b) => a + b, 0);
  if (sum === 0) return baseWeights;

  Object.keys(baseWeights).forEach(key => {
    baseWeights[key as UseCase] /= sum;
  });

  return baseWeights;
};

// Calculate dimensional score for each part
const calculatePartScore = (part: PCPart, useCaseWeights: Record<UseCase, number>): number => {
  let score = 0;
  Object.entries(useCaseWeights).forEach(([useCase, weight]) => {
    const partScore = part.scores[useCase as UseCase] || 0;
    score += partScore * weight;
  });
  return score;
};

// Filter parts within budget
const filterByBudget = (parts: PCPart[], maxPrice: number): PCPart[] => {
  return parts.filter(part => part.price <= maxPrice);
};

// Check compatibility
const checkCompatibility = (parts: {
  cpu: PCPart;
  gpu: PCPart | null;
  ram: PCPart;
  motherboard: PCPart;
}): { warnings: string[]; compatible: boolean } => {
  const warnings: string[] = [];

  // Check if CPU without integrated graphics needs GPU
  if (!parts.cpu.integratedGraphics && !parts.gpu) {
    warnings.push('CPU does not have integrated graphics - GPU is required');
  }

  // RAM and motherboard DDR compatibility
  const ramDDR = parts.ram.specs.ddr_version;
  
  if (ramDDR === 5 && parts.motherboard.id.includes('b550')) {
    warnings.push('DDR5 RAM incompatible with B550 motherboard');
  }

  // Socket compatibility checks
  const cpuSocket = parts.cpu.id.includes('intel') ? 'intel' : 'amd';
  const mbSocket = parts.motherboard.specs.socket as string;
  
  if (cpuSocket === 'amd' && !mbSocket.includes('AM')) {
    warnings.push('AMD CPU socket incompatible with motherboard');
  }
  
  if (cpuSocket === 'intel' && !mbSocket.includes('LGA')) {
    warnings.push('Intel CPU socket incompatible with motherboard');
  }

  return {
    warnings,
    compatible: warnings.length === 0,
  };
};

// Calculate PSU requirement
const calculatePSURequirement = (cpu: PCPart, gpu: PCPart | null): number => {
  const cpuTDP = (cpu.specs.tdp as number) || 65;
  const gpuPower = gpu ? (gpu.specs.power as number) || 0 : 0;
  const systemOverhead = 100;
  
  return Math.ceil((cpuTDP + gpuPower + systemOverhead) / 50) * 50;
};

export const generateRecommendations = (survey: SurveyState): Recommendation[] => {
  if (survey.useCases.length === 0 || !survey.budget) {
    return [];
  }

  const useCaseWeights = calculateUseCaseWeights(survey.useCases);
  const recommendations: Recommendation[] = [];

  // More intelligent CPU budget allocation - start smaller for lower budgets
  let cpuBudget: number;
  if (survey.budget <= 500) {
    cpuBudget = survey.budget * 0.18;
  } else if (survey.budget <= 1000) {
    cpuBudget = survey.budget * 0.22;
  } else {
    cpuBudget = survey.budget * 0.25;
  }

  const availableCPUs = filterByBudget(cpuDatabase, cpuBudget);

  if (availableCPUs.length === 0) {
    // Fallback: use the cheapest CPU if none fit in budget
    const cheapestCPU = cpuDatabase[0];
    availableCPUs.push(cheapestCPU);
  }

  // Generate recommendations for each CPU
  availableCPUs.forEach(cpu => {
    const remainingBudget = survey.budget! - cpu.price;

    // Select GPU
    let gpu: PCPart | null = null;
    const gpuBudget = Math.max(0, remainingBudget * 0.25);
    
    if (!cpu.integratedGraphics) {
      // Must have GPU
      const requiredGPUs = gpuDatabase.filter(
        g => g.id !== 'gpu-integrated' && g.price <= gpuBudget
      );
      if (requiredGPUs.length > 0) {
        gpu = requiredGPUs.reduce((best, current) => 
          calculatePartScore(current, useCaseWeights) > calculatePartScore(best, useCaseWeights)
            ? current
            : best
        );
      }
    } else {
      // Optional GPU - check if budget allows and beneficial
      const optionalGPUs = gpuDatabase.filter(g => g.price <= gpuBudget);
      if (optionalGPUs.length > 0 && gpuBudget > 100) {
        const discreteGPU = optionalGPUs.find(g => g.id !== 'gpu-integrated');
        if (discreteGPU && 
            (survey.useCases.includes('gaming') || survey.useCases.includes('streaming'))) {
          gpu = discreteGPU;
        }
      }
      
      if (!gpu) {
        // Use integrated graphics
        gpu = gpuDatabase.find(g => g.id === 'gpu-integrated') || null;
      }
    }

    const gpuPrice = gpu?.price || 0;
    const afterGPUBudget = remainingBudget - gpuPrice;

    // Select RAM (prioritize for multitab and streaming)
    const ramBudget = Math.max(0, afterGPUBudget * 0.18);
    const availableRAM = filterByBudget(ramDatabase, ramBudget);
    const ram = availableRAM.length > 0
      ? availableRAM.reduce((best, current) => 
          calculatePartScore(current, useCaseWeights) > calculatePartScore(best, useCaseWeights)
            ? current
            : best
        )
      : ramDatabase[0];

    const ramPrice = ram.price;
    const afterRAMBudget = afterGPUBudget - ramPrice;

    // Select Motherboard
    const mbBudget = Math.max(0, afterRAMBudget * 0.2);
    const availableMB = filterByBudget(motherboardDatabase, mbBudget);
    const motherboard = availableMB.length > 0
      ? availableMB.reduce((best, current) => 
          calculatePartScore(current, useCaseWeights) > calculatePartScore(best, useCaseWeights)
            ? current
            : best
        )
      : motherboardDatabase[0];

    const mbPrice = motherboard.price;
    const afterMBBudget = afterRAMBudget - mbPrice;

    // Select PSU based on power requirements
    const psuRequirement = calculatePSURequirement(cpu, gpu);
    const psuBudget = Math.max(0, afterMBBudget * 0.12);
    const availablePSU = filterByBudget(psuDatabase, psuBudget).filter(
      p => (p.specs.wattage as number) >= psuRequirement
    );
    const psu = availablePSU.length > 0
      ? availablePSU[0]
      : psuDatabase.find(p => (p.specs.wattage as number) >= psuRequirement) || psuDatabase[0];

    const psuPrice = psu.price;
    const afterPSUBudget = afterMBBudget - psuPrice;

    // Select Storage
    const storageBudget = Math.max(0, afterPSUBudget * 0.25);
    const availableStorage = filterByBudget(storageDatabase, storageBudget);
    const storage = availableStorage.length > 0
      ? availableStorage.reduce((best, current) => 
          calculatePartScore(current, useCaseWeights) > calculatePartScore(best, useCaseWeights)
            ? current
            : best
        )
      : storageDatabase[0];

    const storagePrice = storage.price;
    const afterStorageBudget = afterPSUBudget - storagePrice;

    // Select Cooler (important for high-performance builds)
    const coolerBudget = Math.max(0, afterStorageBudget * 0.15);
    const availableCooler = filterByBudget(coolerDatabase, coolerBudget);
    const cooler = availableCooler.length > 0
      ? availableCooler.reduce((best, current) => 
          calculatePartScore(current, useCaseWeights) > calculatePartScore(best, useCaseWeights)
            ? current
            : best
        )
      : coolerDatabase[0];

    const coolerPrice = cooler.price;
    const afterCoolerBudget = afterStorageBudget - coolerPrice;

    // Select Case
    const caseBudget = Math.max(0, afterCoolerBudget);
    const availableCase = filterByBudget(caseDatabase, caseBudget);
    const pcCase = availableCase.length > 0
      ? availableCase.reduce((best, current) => 
          calculatePartScore(current, useCaseWeights) > calculatePartScore(best, useCaseWeights)
            ? current
            : best
        )
      : caseDatabase[0];

    const totalPrice = 
      cpu.price + gpuPrice + ram.price + motherboard.price + 
      psu.price + storage.price + cooler.price + pcCase.price;

    // Check compatibility
    const compatibility = checkCompatibility({ cpu, gpu, ram, motherboard });

    // Calculate overall scores
    const scores: Partial<Record<UseCase, number>> = {};
    const useCasesArray = ['coding', 'gaming', 'streaming', 'vtuber', 'multitab', 'music'] as const;
    
    useCasesArray.forEach(useCase => {
      scores[useCase] = Math.round(
        (
          (cpu.scores[useCase] || 0) * 0.25 +
          (gpu?.scores[useCase] || 0) * 0.25 +
          (ram.scores[useCase] || 0) * 0.15 +
          (motherboard.scores[useCase] || 0) * 0.1 +
          (storage.scores[useCase] || 0) * 0.1 +
          (cooler.scores[useCase] || 0) * 0.05 +
          (pcCase.scores[useCase] || 0) * 0.05 +
          (psu.scores[useCase] || 0) * 0.05
        ) * 10
      ) / 10;
    });

    recommendations.push({
      cpu,
      gpu,
      ram,
      motherboard,
      psu,
      storage,
      cooler,
      case: pcCase,
      totalPrice,
      compatibility,
      scores,
    });
  });

  // Sort by total score for selected use cases
  return recommendations.sort((a, b) => {
    const aScore = survey.useCases.reduce((sum, useCase) => 
      sum + ((a.scores[useCase] || 0) * useCaseWeights[useCase]), 0
    );
    const bScore = survey.useCases.reduce((sum, useCase) => 
      sum + ((b.scores[useCase] || 0) * useCaseWeights[useCase]), 0
    );
    return bScore - aScore;
  }).filter(rec => {
    if (survey.budgetType === 'strict') {
      return rec.totalPrice <= survey.budget!;
    } else if (survey.budgetType === 'soft') {
      return rec.totalPrice <= survey.budget! * 1.1;
    }
    return true;
  });
};
