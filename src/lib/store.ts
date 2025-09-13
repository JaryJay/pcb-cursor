import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import type { 
  Circuit, 
  Component, 
  Net, 
  PlacementResult, 
  RoutingResult, 
  AssemblyStep, 
  DRCResult, 
  BOMEntry 
} from './schema';

export interface CircuitState {
  // Core circuit data
  circuit: Circuit | null;
  selectedComponent: string | null;
  selectedNet: string | null;
  
  // Placement and routing results
  placements: PlacementResult[];
  routings: RoutingResult[];
  
  // Assembly instructions
  assemblySteps: AssemblyStep[];
  currentStep: number;
  
  // Design rule checks
  drcResults: DRCResult[];
  showDRCPanel: boolean;
  
  // BOM data
  bomEntries: BOMEntry[];
  
  // UI state
  isAutoRouting: boolean;
  isGeneratingSteps: boolean;
  showGrid: boolean;
  showLabels: boolean;
  showColors: boolean;
  currentTool: 'select' | 'wire' | 'component';
  
  // History for undo/redo
  history: Circuit[];
  historyIndex: number;
  maxHistorySize: number;
  
  // Panel visibility
  panelStates: {
    library: boolean;
    netlist: boolean;
    drc: boolean;
    steps: boolean;
    bom: boolean;
  };
}

export interface CircuitActions {
  // Circuit management
  setCircuit: (circuit: Circuit) => void;
  updateCircuit: (updater: (draft: Circuit) => void) => void;
  
  // Component management
  addComponent: (component: Component) => void;
  updateComponent: (id: string, component: Partial<Component>) => void;
  removeComponent: (id: string) => void;
  selectComponent: (id: string | null) => void;
  
  // Net management
  addNet: (net: Net) => void;
  updateNet: (id: string, net: Partial<Net>) => void;
  removeNet: (id: string) => void;
  selectNet: (id: string | null) => void;
  
  // Placement and routing
  setPlacement: (placements: PlacementResult[]) => void;
  setRouting: (routings: RoutingResult[]) => void;
  autoRoute: () => Promise<void>;
  
  // Assembly steps
  setAssemblySteps: (steps: AssemblyStep[]) => void;
  setCurrentStep: (step: number) => void;
  generateSteps: () => Promise<void>;
  
  // DRC
  setDRCResults: (results: DRCResult[]) => void;
  runDRC: () => Promise<void>;
  toggleDRCPanel: () => void;
  
  // BOM
  setBOMEntries: (entries: BOMEntry[]) => void;
  generateBOM: () => void;
  
  // UI actions
  setTool: (tool: 'select' | 'wire' | 'component') => void;
  toggleGrid: () => void;
  toggleLabels: () => void;
  toggleColors: () => void;
  
  // History
  pushToHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Panel management
  togglePanel: (panel: keyof CircuitState['panelStates']) => void;
  setPanelState: (panel: keyof CircuitState['panelStates'], state: boolean) => void;
}

const initialState: CircuitState = {
  circuit: null,
  selectedComponent: null,
  selectedNet: null,
  placements: [],
  routings: [],
  assemblySteps: [],
  currentStep: 0,
  drcResults: [],
  showDRCPanel: false,
  bomEntries: [],
  isAutoRouting: false,
  isGeneratingSteps: false,
  showGrid: true,
  showLabels: true,
  showColors: true,
  currentTool: 'select',
  history: [],
  historyIndex: -1,
  maxHistorySize: 50,
  panelStates: {
    library: true,
    netlist: true,
    drc: false,
    steps: false,
    bom: false,
  },
};

export const useCircuitStore = create<CircuitState & CircuitActions>()(
  subscribeWithSelector(
    immer((set, get) => ({
      ...initialState,

      // Circuit management
      setCircuit: (circuit) => set((state) => {
        state.circuit = circuit;
        state.selectedComponent = null;
        state.selectedNet = null;
        state.placements = [];
        state.routings = [];
        state.assemblySteps = [];
        state.currentStep = 0;
        state.drcResults = [];
        state.bomEntries = [];
        state.history = [];
        state.historyIndex = -1;
      }),

      updateCircuit: (updater) => set((state) => {
        if (state.circuit) {
          updater(state.circuit);
        }
      }),

      // Component management
      addComponent: (component) => set((state) => {
        if (state.circuit) {
          state.circuit.components.push(component);
        }
      }),

      updateComponent: (id, updates) => set((state) => {
        if (state.circuit) {
          const index = state.circuit.components.findIndex(c => c.id === id);
          if (index !== -1) {
            Object.assign(state.circuit.components[index], updates);
          }
        }
      }),

      removeComponent: (id) => set((state) => {
        if (state.circuit) {
          // Remove component
          state.circuit.components = state.circuit.components.filter(c => c.id !== id);
          
          // Remove nets connected to this component
          state.circuit.nets = state.circuit.nets.filter(net => 
            !net.nodes.some(node => node.compId === id)
          );
          
          // Update nets to remove nodes from this component
          state.circuit.nets.forEach(net => {
            net.nodes = net.nodes.filter(node => node.compId !== id);
          });
          
          // Clear selection if this component was selected
          if (state.selectedComponent === id) {
            state.selectedComponent = null;
          }
        }
      }),

      selectComponent: (id) => set((state) => {
        state.selectedComponent = id;
        state.selectedNet = null; // Clear net selection
      }),

      // Net management
      addNet: (net) => set((state) => {
        if (state.circuit) {
          state.circuit.nets.push(net);
        }
      }),

      updateNet: (id, updates) => set((state) => {
        if (state.circuit) {
          const index = state.circuit.nets.findIndex(n => n.id === id);
          if (index !== -1) {
            Object.assign(state.circuit.nets[index], updates);
          }
        }
      }),

      removeNet: (id) => set((state) => {
        if (state.circuit) {
          state.circuit.nets = state.circuit.nets.filter(n => n.id !== id);
          
          if (state.selectedNet === id) {
            state.selectedNet = null;
          }
        }
      }),

      selectNet: (id) => set((state) => {
        state.selectedNet = id;
        state.selectedComponent = null; // Clear component selection
      }),

      // Placement and routing
      setPlacement: (placements) => set((state) => {
        state.placements = placements;
      }),

      setRouting: (routings) => set((state) => {
        state.routings = routings;
      }),

      autoRoute: async () => {
        const state = get();
        if (!state.circuit) return;

        set((draft) => {
          draft.isAutoRouting = true;
        });

        try {
          // This will be implemented with the Web Worker
          // For now, just a placeholder
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set((draft) => {
            draft.isAutoRouting = false;
          });
        } catch (error) {
          set((draft) => {
            draft.isAutoRouting = false;
          });
          console.error('Auto-routing failed:', error);
        }
      },

      // Assembly steps
      setAssemblySteps: (steps) => set((state) => {
        state.assemblySteps = steps;
        state.currentStep = 0;
      }),

      setCurrentStep: (step) => set((state) => {
        state.currentStep = Math.max(0, Math.min(step, state.assemblySteps.length - 1));
      }),

      generateSteps: async () => {
        const state = get();
        if (!state.circuit) return;

        set((draft) => {
          draft.isGeneratingSteps = true;
        });

        try {
          // This will be implemented with the step generator
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set((draft) => {
            draft.isGeneratingSteps = false;
          });
        } catch (error) {
          set((draft) => {
            draft.isGeneratingSteps = false;
          });
          console.error('Step generation failed:', error);
        }
      },

      // DRC
      setDRCResults: (results) => set((state) => {
        state.drcResults = results;
      }),

      runDRC: async () => {
        const state = get();
        if (!state.circuit) return;

        try {
          // This will be implemented with the DRC engine
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Placeholder DRC results
          set((draft) => {
            draft.drcResults = [];
          });
        } catch (error) {
          console.error('DRC failed:', error);
        }
      },

      toggleDRCPanel: () => set((state) => {
        state.showDRCPanel = !state.showDRCPanel;
      }),

      // BOM
      setBOMEntries: (entries) => set((state) => {
        state.bomEntries = entries;
      }),

      generateBOM: () => {
        const state = get();
        if (!state.circuit) return;

        const bomMap = new Map<string, BOMEntry>();
        
        state.circuit.components.forEach(component => {
          const key = `${component.value || component.kind}_${component.footprint}`;
          
          if (bomMap.has(key)) {
            bomMap.get(key)!.quantity++;
          } else {
            bomMap.set(key, {
              ref: component.ref,
              description: `${component.kind} ${component.value || ''}`.trim(),
              value: component.value,
              footprint: component.footprint,
              quantity: 1,
            });
          }
        });

        set((draft) => {
          draft.bomEntries = Array.from(bomMap.values());
        });
      },

      // UI actions
      setTool: (tool) => set((state) => {
        state.currentTool = tool;
      }),

      toggleGrid: () => set((state) => {
        state.showGrid = !state.showGrid;
      }),

      toggleLabels: () => set((state) => {
        state.showLabels = !state.showLabels;
      }),

      toggleColors: () => set((state) => {
        state.showColors = !state.showColors;
      }),

      // History
      pushToHistory: () => set((state) => {
        if (state.circuit) {
          // Remove future history if we're not at the end
          if (state.historyIndex < state.history.length - 1) {
            state.history = state.history.slice(0, state.historyIndex + 1);
          }
          
          // Add current state to history
          state.history.push(JSON.parse(JSON.stringify(state.circuit)));
          
          // Limit history size
          if (state.history.length > state.maxHistorySize) {
            state.history.shift();
          } else {
            state.historyIndex++;
          }
        }
      }),

      undo: () => {
        const state = get();
        if (state.canUndo()) {
          set((draft) => {
            draft.historyIndex--;
            if (draft.history[draft.historyIndex]) {
              draft.circuit = JSON.parse(JSON.stringify(draft.history[draft.historyIndex]));
            }
          });
        }
      },

      redo: () => {
        const state = get();
        if (state.canRedo()) {
          set((draft) => {
            draft.historyIndex++;
            if (draft.history[draft.historyIndex]) {
              draft.circuit = JSON.parse(JSON.stringify(draft.history[draft.historyIndex]));
            }
          });
        }
      },

      canUndo: () => {
        const state = get();
        return state.historyIndex > 0;
      },

      canRedo: () => {
        const state = get();
        return state.historyIndex < state.history.length - 1;
      },

      // Panel management
      togglePanel: (panel) => set((state) => {
        state.panelStates[panel] = !state.panelStates[panel];
      }),

      setPanelState: (panel, panelState) => set((state) => {
        state.panelStates[panel] = panelState;
      }),
    }))
  )
);

// Selector hooks for performance
export const useCircuit = () => useCircuitStore(state => state.circuit);
export const useSelectedComponent = () => useCircuitStore(state => state.selectedComponent);
export const useSelectedNet = () => useCircuitStore(state => state.selectedNet);
export const usePlacements = () => useCircuitStore(state => state.placements);
export const useRoutings = () => useCircuitStore(state => state.routings);
export const useAssemblySteps = () => useCircuitStore(state => state.assemblySteps);
export const useCurrentStep = () => useCircuitStore(state => state.currentStep);
export const useDRCResults = () => useCircuitStore(state => state.drcResults);
export const useBOMEntries = () => useCircuitStore(state => state.bomEntries);
export const useCurrentTool = () => useCircuitStore(state => state.currentTool);
export const usePanelStates = () => useCircuitStore(state => state.panelStates);
