# Breadboard Designer

A production-ready Next.js 14 web application for designing breadboard circuits with automatic placement, routing, and LEGO-style assembly instructions.

## Features

✨ **Visual Circuit Design**
- Drag-and-drop component placement
- Comprehensive parts library (resistors, LEDs, ICs, capacitors, etc.)
- Real-time breadboard visualization

🔄 **Auto-Placement & Routing**
- Intelligent component placement algorithms
- Manhattan-style wire routing
- Collision detection and optimization

📋 **LEGO-Style Instructions**
- Step-by-step assembly guide generation
- Component highlighting and callouts
- Printable PDF export

🔍 **Design Rule Checks (DRC)**
- Short circuit detection
- Floating pin warnings
- Polarity checks
- Power rail validation

📤 **Export Options**
- PDF assembly instructions
- SVG/PNG circuit diagrams
- CSV bill of materials (BOM)
- JSON circuit data

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand with Immer
- **Validation**: Zod schemas
- **Graphics**: SVG rendering
- **Testing**: Vitest + Testing Library + Playwright
- **Package Manager**: npm

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pcb-cursor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Visit [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run e2e          # Run end-to-end tests
npm run type-check   # Run TypeScript type checking
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles and Tailwind
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── editor/            # Circuit editor
├── components/            # React components
│   ├── breadboard/        # Breadboard SVG components
│   ├── parts/             # Component sprites
│   └── panels/            # UI panels
├── lib/                   # Core libraries
│   ├── schema.ts          # Zod data schemas
│   ├── store.ts           # Zustand state management
│   ├── breadboard.ts      # Breadboard utilities
│   └── parts-library.ts   # Component templates
├── data/                  # Static data
│   └── seeds/             # Example circuits
└── workers/               # Web Workers
    └── autoroute.ts       # Placement & routing algorithms
```

## Example Circuits

The app includes two example circuits to get you started:

### 1. Basic LED Circuit
- Simple LED with current-limiting resistor
- Perfect for beginners
- Components: LED, 220Ω resistor, 5V power supply

### 2. 555 Timer LED Blinker
- Classic astable 555 timer circuit
- Blinks LED at ~1Hz frequency
- Components: NE555 IC, resistors, capacitor, LED

## Key Components

### Data Models
- **Circuit**: Complete circuit definition with components, nets, and board config
- **Component**: Electronic components with pins, footprints, and properties  
- **Net**: Electrical connections between component pins
- **PlacementResult**: Component positioning on breadboard
- **RoutingResult**: Wire routing paths and colors
- **AssemblyStep**: Step-by-step build instructions

### Core Systems
- **BreadboardSVG**: Renders breadboard grid with holes, rails, and labels
- **ComponentSprites**: SVG representations of electronic components
- **Parts Library**: Pre-defined component templates
- **State Management**: Zustand store with undo/redo support
- **DRC Engine**: Design rule validation

## Usage Guide

### Creating a Circuit
1. Open the editor
2. Drag components from the parts library
3. Connect components by creating nets
4. Use auto-routing for optimal placement
5. Generate assembly instructions
6. Export as PDF, SVG, or CSV

### Keyboard Shortcuts
- `Ctrl/Cmd + Z`: Undo
- `Ctrl/Cmd + Y`: Redo
- `G`: Toggle grid
- `L`: Toggle labels
- `R`: Auto-route circuit
- `S`: Generate steps
- `E`: Export options

## Development

### Code Structure
The codebase follows Next.js 14 App Router conventions with:
- TypeScript for type safety
- Tailwind CSS for styling
- Component-based architecture
- Functional programming patterns

### State Management
Uses Zustand with Immer for:
- Circuit data management
- UI state (selections, panels)
- History tracking (undo/redo)
- Async operations (routing, DRC)

### Testing Strategy
- **Unit Tests**: Vitest for algorithms and utilities
- **Component Tests**: Testing Library for React components
- **E2E Tests**: Playwright for user workflows
- **Type Safety**: TypeScript + Zod validation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality  
5. Run the test suite
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

---

Built with ❤️ by HTN 2025 Team for makers, students, and engineers.
Cursor for PCB design.
