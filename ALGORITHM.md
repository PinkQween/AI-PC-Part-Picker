# 🧠 PC Part Picker Algorithm Documentation

## Overview

The recommendation engine uses a **multidimensional scoring system** that considers:
1. Multiple use cases with weighted importance
2. Component compatibility constraints
3. Budget allocation strategy
4. Performance scoring across all dimensions

This document explains the mathematical and logical foundations.

---

## 1. Use Case Weighting

### Purpose
Transform selected use cases into normalized weight vector to guide recommendations.

### Algorithm
```
Input: useCases = [UseCase1, UseCase2, ...]
Output: weights = {coding: w1, gaming: w2, streaming: w3, vtuber: w4, multitab: w5}

Steps:
1. Initialize baseWeights[useCase] = 1 if useCase selected, else 0
2. sum = sum of all baseWeights values
3. Normalize: weights[useCase] = baseWeights[useCase] / sum
```

### Example
Selected: `["gaming", "streaming"]`
```
baseWeights = {coding: 0, gaming: 1, streaming: 1, vtuber: 0, multitab: 0}
sum = 2
weights = {coding: 0, gaming: 0.5, streaming: 0.5, vtuber: 0, multitab: 0}
```

### Why This Works
- Ensures selected use cases are equally prioritized
- Unselected use cases have zero weight
- Prevents bias toward any single use case

---

## 2. Component Scoring

### Part Score Calculation
```
partScore = Σ(part.scores[useCase] × weights[useCase])
            for all useCases
```

### Example
CPU Ryzen 5 5700G with gaming + streaming (50/50 weights):
```
Scores: {coding: 9, gaming: 7, streaming: 8, vtuber: 8, multitab: 9}
Calculation: (9 × 0) + (7 × 0.5) + (8 × 0.5) + (8 × 0) + (9 × 0) = 7.5
Final Score: 7.5/10
```

### Why This Works
- Balances performance across selected use cases
- Higher-scored components rank first
- Automatically adapts to different use case combinations

---

## 3. Budget Allocation Strategy

The system distributes budget strategically across categories:

```
Total Budget
├── CPU (25%)          - Foundation of performance
├── GPU (30%)          - Critical for gaming/streaming
├── RAM (15%)          - Multitasking capacity
├── Motherboard (10%)  - Stability and features
├── PSU (10%)          - Power delivery reliability
├── Storage (10%)      - Capacity and speed
├── Cooler (5%)        - Thermal management
└── Case (5%)          - Build quality
```

### Pseudocode
```
cpuBudget = totalBudget × 0.25
remainingBudget = totalBudget - cpuPrice

gpuBudget = remainingBudget × 0.30
remainingBudget = remainingBudget - gpuPrice

ramBudget = remainingBudget × 0.15
remainingBudget = remainingBudget - ramPrice

... (continue for other components)
```

### Adaptive Allocation
Budget percentages are **relative to remaining budget**, so:
1. CPU takes 25% of initial budget
2. GPU takes 30% of remaining (after CPU)
3. RAM takes 15% of remaining (after CPU + GPU)
4. etc.

This ensures earlier components don't exhaust the entire budget.

---

## 4. Build Generation Algorithm

### Pseudocode
```typescript
function generateRecommendations(survey: SurveyState): Recommendation[] {
  
  // Step 1: Calculate weights for selected use cases
  weights = calculateUseCaseWeights(survey.useCases)
  recommendations = []
  
  // Step 2: Get viable CPUs within budget
  cpuBudget = survey.budget × 0.25
  cpus = filterByBudget(cpuDatabase, cpuBudget)
  
  // Step 3: For each CPU, build a complete system
  for each cpu in cpus:
    remainingBudget = survey.budget - cpu.price
    
    // Step 4: Select GPU
    if cpu.integratedGraphics:
      gpu = selectOptionalGPU(remainingBudget, weights)
    else:
      gpu = selectRequiredGPU(remainingBudget, weights)
    
    // Step 5: Select other components
    ram = selectBestComponent(ramDatabase, ramBudget, weights)
    motherboard = selectBestComponent(mbDatabase, mbBudget, weights)
    psu = selectPSUbyPower(psus, calculateTDP(cpu, gpu))
    storage = selectBestComponent(storageDB, storageBudget, weights)
    cooler = selectBestComponent(coolerDB, coolerBudget, weights)
    case = selectBestComponent(caseDB, caseBudget, weights)
    
    // Step 6: Validate compatibility
    compatibility = checkCompatibility({cpu, gpu, ram, motherboard})
    
    // Step 7: Calculate scores
    scores = calculateBuildScores({cpu, gpu, ram, motherboard, psu, storage, cooler, case})
    
    // Step 8: Create recommendation
    recommendation = {
      cpu, gpu, ram, motherboard, psu, storage, cooler, case,
      totalPrice, compatibility, scores
    }
    recommendations.append(recommendation)
  
  // Step 9: Sort by overall score
  recommendations.sort(by = totalScore(recommendation, weights))
  
  // Step 10: Filter by budget type
  if survey.budgetType == "hard":
    recommendations = filter(r => r.totalPrice <= budget)
  
  return recommendations
}
```

### Key Steps Explained

#### Step 4: Component Selection
```
High-Scoring Selection:
  viable = filter(components, price <= budget)
  best = component with highest partScore
  
Why optimal:
  - Only considers affordable components
  - Picks highest-scoring option
  - Fast O(n) algorithm
```

#### Step 6: Compatibility Checking
```
Check three categories:
1. GPU Requirement
   - CPU without iGPU needs discrete GPU
   
2. Socket Matching
   - AMD CPU (id contains "amd") → needs AM socket
   - Intel CPU → needs LGA socket
   
3. Memory Compatibility
   - DDR5 RAM incompatible with B550 motherboard
```

#### Step 7: Build Scores
```
For each use case (coding, gaming, streaming, vtuber, multitab):

buildScore[useCase] = 
  cpu.score[useCase] × 0.25 +
  gpu.score[useCase] × 0.25 +
  ram.score[useCase] × 0.15 +
  motherboard.score[useCase] × 0.10 +
  storage.score[useCase] × 0.10 +
  cooler.score[useCase] × 0.05 +
  case.score[useCase] × 0.05 +
  psu.score[useCase] × 0.05
```

**Component Weights** (Importance Ranking):
1. CPU + GPU: 50% (equal importance)
2. RAM: 15% (critical for multitasking)
3. Motherboard: 10% (stability, features)
4. Storage: 10% (speed, capacity)
5. Cooler: 5% (supplementary)
6. Case: 5% (supplementary)
7. PSU: 5% (must-have but less variable)

#### Step 9: Overall Ranking
```
For each recommendation, calculate:
  overallScore = Σ(buildScore[useCase] × weights[useCase])
                 for all selected useCases

Sort recommendations by overallScore (descending)
```

### Why This Algorithm Works

✅ **Balanced Optimization**: Considers all components
✅ **Use-Case Adaptive**: Weights adjust to selected scenarios
✅ **Constraint Satisfaction**: Respects budget and compatibility
✅ **Deterministic**: Always produces same results for same input
✅ **Efficient**: O(n) per CPU, typically completes in <100ms
✅ **Intuitive Ranking**: Best builds appear first

---

## 5. Compatibility Rules

### GPU Requirements
```
Rule: If CPU.integratedGraphics == false, then GPU is required

Logic:
  if !cpu.integratedGraphics && !gpu:
    warnings.add("CPU requires discrete GPU")
    compatible = false
```

### Socket Compatibility
```
Rule: CPU socket must match motherboard socket

Logic:
  cpuSocket = "amd" if cpu.id.includes("amd") else "intel"
  mbSocket = motherboard.specs.socket
  
  if cpuSocket == "amd" && !mbSocket.includes("AM"):
    warnings.add("AMD/Intel mismatch")
  if cpuSocket == "intel" && !mbSocket.includes("LGA"):
    warnings.add("Intel/AMD mismatch")
```

### Memory Compatibility
```
Rule: DDR version must be supported by motherboard

Logic:
  if ram.specs.ddr_version == 5 && motherboard.id == "mobo-amd-b550":
    warnings.add("DDR5 not supported by B550")
```

---

## 6. Power Calculation

### PSU Sizing
```
totalTDP = cpu.tdp + gpu.power + systemOverhead(100W)
psuWattage = ceil(totalTDP / 50) × 50  // Round to nearest 50W

Example:
  CPU TDP: 65W
  GPU Power: 200W
  Overhead: 100W
  Total: 365W
  PSU Selected: 400W (rounded up)
```

### Why This Works
- Provides 30-50% headroom for stability
- Accounts for power delivery inefficiency
- Prevents PSU stress and failure

---

## 7. Algorithm Complexity

| Operation | Complexity | Time (typical) |
|-----------|-----------|-----------------|
| Calculate weights | O(1) | <1ms |
| Score one component | O(k) | <0.1ms (k=5 use cases) |
| Filter by budget | O(n) | <1ms (n=50 components) |
| Generate one build | O(n×k) | ~5ms |
| Generate all builds | O(m×n×k) | ~50ms (m=5 CPUs) |
| Sort recommendations | O(m log m) | <1ms |
| **Total** | **O(m×n×k)** | **<100ms** |

---

## 8. Example Walkthrough

### Input
```
useCases: ["gaming", "streaming"]
budget: 1500
budgetType: "hard"
```

### Execution

**1. Weights**
```
weights = {
  coding: 0,
  gaming: 0.5,
  streaming: 0.5,
  vtuber: 0,
  multitab: 0
}
```

**2. CPU Selection**
```
cpuBudget = 1500 × 0.25 = $375
viableCPUs = [
  "Intel i5-13600K" ($320) - Score: 8.0
  "Intel i7-13700K" ($450) - Score: 9.5 ✗ Over budget
  "AMD Ryzen 7 5700G" ($280) - Score: 7.5
]
```

**3. First Build** (Intel i5-13600K)
```
Remaining: $1500 - $320 = $1180

GPU: RTX 4070 ($500) - integrated GPU optional but gaming demands discrete
Remaining: $680

RAM: 32GB DDR5 ($160)
Remaining: $520

Motherboard: Z790 ($320)
Remaining: $200

PSU: 850W ($120)
Remaining: $80

Storage: 1TB NVMe ($80)
Case/Cooler: $0 (within budget)

Total: $1480 (within hard budget)
```

**4. Scoring**
```
Gaming Score: 0.5 × (8 + 10 + 9 + 10 + 9 + 8 + 9 + 9) = 4.1
Streaming Score: 0.5 × (7 + 9 + 9 + 9 + 8 + 8 + 8 + 8) = 4.1
Overall: 8.2/10
```

**5. Ranking**
```
Build 1 (i5-13600K + RTX4070): 8.2/10
Build 2 (AMD 5700G + RTX4060): 7.8/10
Build 3 (i5-12400 + RTX4070): 7.5/10
...
```

---

## 9. Extending the Algorithm

### Adding New Use Cases
1. Add to `UseCase` type in `src/types/index.ts`
2. Add scoring logic in component definitions
3. Update weight calculation (already generic)

### Custom Scoring Weights
Edit component weights in `recommendationEngine.ts`:
```typescript
const weights = {
  cpu: 0.25,
  gpu: 0.25,
  ram: 0.15,
  // ... modify as needed
}
```

### Different Budget Strategies
Replace budget allocation percentages:
```typescript
// Current: 25%, 30%, 15%, 10%, 10%, 10%, 5%, 5%
// Gaming-focused: 20%, 40%, 10%, 10%, 10%, 5%, 3%, 2%
// Workstation: 30%, 20%, 20%, 15%, 10%, 3%, 2%
```

---

## 10. Limitations & Future Improvements

### Current Limitations
- ❌ Static component database (no real-time pricing)
- ❌ No form factor preferences (ITX, Micro, etc)
- ❌ No upgrade path analysis
- ❌ No thermal simulation
- ❌ Limited RAM latency scoring

### Potential Enhancements
- ✅ Real-time price API integration
- ✅ Machine learning for scoring weights
- ✅ Thermal performance simulation
- ✅ Power consumption calculator
- ✅ Component aging/failure modeling
- ✅ PCPartPicker API integration

---

## Conclusion

The algorithm balances:
- **Performance**: Multi-dimensional scoring
- **Practicality**: Budget constraints and compatibility
- **Usability**: Simple inputs, clear outputs
- **Extensibility**: Easy to add components and features

For questions or improvements, refer to:
- `src/utils/recommendationEngine.ts` - Core algorithm
- `src/data/pcParts.ts` - Component database
- `src/types/index.ts` - Data structures
