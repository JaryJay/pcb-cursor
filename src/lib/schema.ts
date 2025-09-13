import { z } from 'zod';

// Pin schema for component pins
export const Pin = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['power', 'ground', 'io', 'analog', 'other']),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }).optional(),
});

export type Pin = z.infer<typeof Pin>;

// Component schema for circuit elements
export const Component = z.object({
  id: z.string(),
  ref: z.string(), // e.g., R1, U1, LED1
  kind: z.enum(['resistor', 'led', 'ic', 'capacitor', 'transistor', 'jumper', 'pot', 'button', 'power']),
  value: z.string().optional(), // e.g., "220Ω", "NE555"
  footprint: z.enum(['axial', 'led5mm', 'dip', 'to92', 'radial', 'jumper', 'button', 'power', 'pot']),
  pins: z.array(Pin),
  pinMap: z.record(z.string(), z.string()), // logical->physical mapping, e.g. "VCC"->"8"
  orientation: z.enum(['north', 'south', 'east', 'west']).default('north'),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }).optional(),
  properties: z.record(z.string()).optional(), // Additional properties like color, tolerance, etc.
});

export type Component = z.infer<typeof Component>;

// Net schema for electrical connections
export const Net = z.object({
  id: z.string(),
  name: z.string(),
  nodes: z.array(z.object({
    compId: z.string(),
    pin: z.string(),
  })),
  color: z.string().optional(), // Wire color for visualization
  routed: z.boolean().default(false),
  path: z.array(z.object({
    x: z.number(),
    y: z.number(),
  })).optional(), // Routing path points
});

export type Net = z.infer<typeof Net>;

// Breadboard configuration
export const BoardConfig = z.object({
  kind: z.enum(['full', 'half']),
  columns: z.number(), // e.g., 63 for full, 30 for half
  rows: z.number().default(30), // Standard breadboard rows
  powerRails: z.boolean().default(true),
});

export type BoardConfig = z.infer<typeof BoardConfig>;

// Circuit schema - main data structure
export const Circuit = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  components: z.array(Component),
  nets: z.array(Net),
  board: BoardConfig.default({ kind: 'full', columns: 63 }),
  metadata: z.object({
    created: z.date().default(() => new Date()),
    modified: z.date().default(() => new Date()),
    version: z.string().default('1.0'),
  }).optional(),
});

export type Circuit = z.infer<typeof Circuit>;

// Placement result for positioned components
export const PlacementResult = z.object({
  componentId: z.string(),
  position: z.object({
    row: z.number(),
    column: z.number(),
    span: z.number().default(1), // How many columns the component spans
  }),
  rotation: z.number().default(0), // Rotation in degrees
  conflicts: z.array(z.string()).default([]), // Conflicting components
});

export type PlacementResult = z.infer<typeof PlacementResult>;

// Routing result for wired connections
export const RoutingResult = z.object({
  netId: z.string(),
  segments: z.array(z.object({
    start: z.object({ row: z.number(), column: z.number() }),
    end: z.object({ row: z.number(), column: z.number() }),
    type: z.enum(['horizontal', 'vertical', 'jump']), // Jump for over-the-top connections
    color: z.string(),
  })),
  success: z.boolean(),
  conflicts: z.array(z.string()).default([]),
});

export type RoutingResult = z.infer<typeof RoutingResult>;

// Assembly step for LEGO-style instructions
export const AssemblyStep = z.object({
  id: z.string(),
  stepNumber: z.number(),
  title: z.string(),
  description: z.string(),
  componentsAdded: z.array(z.string()), // Component IDs being added in this step
  connectionsAdded: z.array(z.string()), // Net IDs being connected in this step
  highlights: z.array(z.string()), // Elements to highlight
  callouts: z.array(z.object({
    type: z.enum(['orientation', 'polarity', 'connection', 'warning']),
    message: z.string(),
    componentId: z.string().optional(),
    position: z.object({ x: z.number(), y: z.number() }).optional(),
  })).default([]),
  bomItems: z.array(z.object({
    ref: z.string(),
    description: z.string(),
    quantity: z.number(),
  })).default([]),
});

export type AssemblyStep = z.infer<typeof AssemblyStep>;

// Design Rule Check result
export const DRCResult = z.object({
  id: z.string(),
  type: z.enum(['error', 'warning', 'info']),
  category: z.enum(['short', 'floating', 'unconnected', 'polarity', 'spacing', 'power']),
  message: z.string(),
  componentIds: z.array(z.string()).default([]),
  netIds: z.array(z.string()).default([]),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
  autoFixable: z.boolean().default(false),
});

export type DRCResult = z.infer<typeof DRCResult>;

// Bill of Materials entry
export const BOMEntry = z.object({
  ref: z.string(),
  description: z.string(),
  value: z.string().optional(),
  footprint: z.string(),
  quantity: z.number(),
  distributor: z.string().optional(),
  partNumber: z.string().optional(),
  price: z.number().optional(),
});

export type BOMEntry = z.infer<typeof BOMEntry>;

// Export configuration
export const ExportConfig = z.object({
  format: z.enum(['pdf', 'svg', 'png', 'csv']),
  includeSteps: z.boolean().default(true),
  includeBOM: z.boolean().default(true),
  includeDRC: z.boolean().default(true),
  resolution: z.number().optional(), // For PNG export
  paperSize: z.enum(['a4', 'letter', 'a3']).default('a4'), // For PDF export
});

export type ExportConfig = z.infer<typeof ExportConfig>;

// Validation helpers
export const validateCircuit = (data: unknown): Circuit => {
  return Circuit.parse(data);
};

export const validateComponent = (data: unknown): Component => {
  return Component.parse(data);
};

export const validateNet = (data: unknown): Net => {
  return Net.parse(data);
};
