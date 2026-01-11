# 🖥️ PC Part Picker Survey

A modern, intelligent PC build recommendation system built with React, TypeScript, Vite, and Bun. This application provides personalized PC build recommendations based on usage scenarios, budget constraints, and a sophisticated multidimensional scoring system.

## Features

### 🎯 Intelligent Recommendation Engine
- **Multi-Use Case Analysis**: Select multiple use cases (Coding, Gaming, Streaming, VTuber, Multi-Tab Heavy Use)
- **Multidimensional Scoring System**: Components are scored across all use cases to find the best overall fit
- **Automatic Compatibility Checking**: Detects socket incompatibilities, DDR version mismatches, and GPU requirements
- **Smart Budget Allocation**: Intelligently distributes budget across components based on priorities

### 💰 Flexible Budget System
- **Hard Budget**: Strictly adheres to your budget limit
- **Soft Budget**: Can exceed budget by up to 20% if significantly better value
- **Quick Budget Selection**: Pre-set buttons for common budget tiers ($500, $1000, $1500, $2000+)

### 🔧 Component Intelligence
- **Integrated Graphics Support**: Recognizes CPUs with iGPU and marks GPU as optional
- **Power Requirements**: Calculates PSU needs based on CPU/GPU power consumption
- **Socket Compatibility**: Validates CPU and motherboard socket compatibility
- **DDR Version Compatibility**: Ensures RAM and motherboard compatibility

### 📊 Comprehensive Build Analysis
- **Performance Scores**: Visual representation of build suitability for each use case
- **Price Breakdown**: Detailed percentage breakdown of component costs
- **Compatibility Warnings**: Alerts for potential incompatibilities
- **Multiple Recommendations**: Displays multiple build options ranked by overall score

### 🎨 Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Clean Interface**: Intuitive multi-step survey flow
- **Visual Feedback**: Progress indicators and interactive elements
- **Accessibility**: Semantic HTML and proper ARIA labels

## Tech Stack

- **Frontend Framework**: React 19.2 with TypeScript
- **Build Tool**: Vite 7.3 with optimal code splitting
- **Package Manager**: Bun 1.3+ (high-performance alternative to npm/yarn)
- **Styling**: Modern CSS3 with CSS Grid and Flexbox
- **Development**: Hot Module Replacement (HMR) for instant updates

## Installation

### Prerequisites
- Node.js 18+ or Bun 1.3+
- Git (optional)

### Setup with Bun

1. **Clone or navigate to the project directory**
```bash
cd pcpartpicker
```

2. **Install dependencies**
```bash
bun install
```

3. **Start development server**
```bash
bun run dev
```

The app will be available at `http://localhost:5173/`

## Usage

### Survey Flow

1. **Select Use Cases**
   - Choose one or more scenarios you'll use the PC for
   - Multi-select allows for realistic mixed-use scenarios
   - Each selection adjusts recommendation weighting

2. **Set Budget**
   - Enter your total budget or use quick buttons
   - Budget is intelligently distributed across components

3. **Choose Budget Type**
   - **Soft**: Allows exceeding budget if value is significantly better
   - **Hard**: Never exceeds the specified budget

4. **View Recommendations**
   - Multiple build options ranked by suitability
   - Performance scores for each use case
   - Price breakdown with visual charts
   - Compatibility warnings (if any)

### Understanding Recommendations

- **Performance Scores**: 1-10 scale for each use case
  - Higher = Better for that use case
  - Considers all components, weighted by importance
  
- **Price Breakdown**: Shows percentage of budget for each component
  - Helps understand value distribution
  - Compare different builds
  
- **Compatibility**: Green (compatible) or warnings (check before buying)

## Build Configuration

### Budget Allocation Strategy

The system allocates budget strategically:
- **CPU**: 25% - Foundation of performance
- **GPU**: 30% (if discrete) - Critical for gaming/streaming
- **RAM**: 15% - Important for multitasking
- **Motherboard**: 10% - Stability and features
- **PSU**: 10% - Power delivery and stability
- **Storage**: 10% - Capacity and speed
- **Cooler**: 5% - Thermal management
- **Case**: 5% - Build quality and aesthetics

### Scoring Weights

Components contribute to overall score with these weights:
- CPU: 25%
- GPU: 25%
- RAM: 15%
- Motherboard: 10%
- Storage: 10%
- Cooler: 5%
- Case: 5%
- PSU: 5%

### Use Case Scoring

Each component is scored 1-10 for:
- **Coding**: Development speed, responsiveness, multitasking
- **Gaming**: Frame rates, rendering capability, vram
- **Streaming**: Encoding capability, throughput, stability
- **VTuber**: Avatar processing, encoding, streaming quality
- **Multi-Tab**: RAM capacity, storage, responsive cores

## Project Structure

```
src/
├── components/
│   ├── SurveyStep.tsx       # Multi-step survey UI
│   └── Recommendations.tsx  # Build display and analysis
├── data/
│   └── pcParts.ts          # Component database
├── types/
│   └── index.ts            # TypeScript interfaces
├── utils/
│   └── recommendationEngine.ts  # Core algorithm
├── App.tsx                 # Main app component
├── App.css                 # Styling
└── main.tsx                # Entry point
```

## Development

### Available Scripts

```bash
# Start dev server with HMR
bun run dev

# Build for production
bun run build

# Preview production build locally
bun run preview

# Type checking
bun run check

# Linting
bun run lint
```

### Hot Module Replacement

Changes to any component automatically update in the browser without full reload - perfect for iterating on UI and recommendation logic.

## Performance Optimizations

- **Code Splitting**: Vite automatically splits code into chunks
- **Tree Shaking**: Unused code removed during build
- **CSS Minification**: Styles compressed for production
- **Lazy Components**: React components loaded on demand
- **Memo Optimization**: useMemo prevents unnecessary recalculations

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari, Chrome Mobile

## PC Parts Database

### Components Included
- **CPUs**: AMD Ryzen, Intel Core (with and without iGPU)
- **GPUs**: NVIDIA RTX series, AMD Radeon, Integrated Graphics
- **RAM**: DDR4 and DDR5 options from 16GB to 64GB
- **Motherboards**: AM4, AM5, LGA1700 sockets
- **PSUs**: 750W to 1000W Gold efficiency
- **Storage**: NVMe SSDs from 500GB to 2TB
- **Coolers**: Air and liquid cooling solutions
- **Cases**: Premium ATX cases with good airflow

## Extending the Database

To add new components, edit `src/data/pcParts.ts`:

```typescript
export const cpuDatabase: PCPart[] = [
  {
    id: 'unique-id',
    name: 'Product Name',
    category: 'cpu',
    price: 299,
    specs: { cores: 8, threads: 16, tdp: 105 },
    integratedGraphics: true,
    scores: {
      coding: 8,
      gaming: 9,
      streaming: 8,
      vtuber: 8,
      multitab: 9,
    },
  },
];
```

## Algorithm Details

### Multidimensional Scoring

1. **Use Case Weighting**: Normalize selected use cases to create weight vector
2. **Component Scoring**: Calculate weighted score for each component
3. **Budget Filtering**: Remove components exceeding allocated budget
4. **Selection**: Choose highest-scoring component for each category
5. **Compatibility Validation**: Check socket, DDR, GPU requirements
6. **Overall Ranking**: Sort by aggregate score across all selected use cases

### Compatibility Rules

- **GPU Detection**: CPU without iGPU must have discrete GPU
- **Socket Matching**: CPU socket must match motherboard
- **DDR Version**: RAM and motherboard must support same DDR version
- **Power Validation**: PSU wattage must exceed total system TDP

## Future Enhancements

- [ ] Real-time pricing API integration
- [ ] GPU encoding capability detection
- [ ] Thermal simulation
- [ ] Power consumption calculator
- [ ] Build sharing/export to PDF
- [ ] Compatibility with popular retailers
- [ ] Custom component pricing
- [ ] Upgrade path recommendations
- [ ] RGB lighting preferences
- [ ] Form factor customization (ITX, Micro, etc)

## License

MIT - Feel free to use and modify for personal or commercial projects.

## Contributing

This is a demonstration project. For improvements or suggestions, consider forking and submitting pull requests.

## Support

For issues or questions:
1. Check the algorithm logic in `src/utils/recommendationEngine.ts`
2. Review component database in `src/data/pcParts.ts`
3. Inspect TypeScript types in `src/types/index.ts`

---

Built with ❤️ using React, TypeScript, Vite, and Bun
