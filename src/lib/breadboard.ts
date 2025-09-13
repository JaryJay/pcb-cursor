import type { BoardConfig } from './schema';

// Breadboard physical dimensions and grid constants
export const BREADBOARD_CONFIG = {
  // Grid spacing in SVG units
  GRID_SIZE: 10,
  HOLE_RADIUS: 2,
  
  // Standard breadboard layout
  STANDARD: {
    COLUMNS: 63,
    ROWS: 30,
    POWER_RAIL_ROWS: 2,
    MAIN_AREA_ROWS: 5, // A-E and F-J
  },
  
  // Half-size breadboard
  HALF: {
    COLUMNS: 30,
    ROWS: 30,
    POWER_RAIL_ROWS: 2,
    MAIN_AREA_ROWS: 5,
  },
  
  // Colors
  COLORS: {
    BOARD: '#f0f0f0',
    HOLES: '#333',
    GRID_LINES: '#ddd',
    POWER_RAIL_POSITIVE: '#ff4444',
    POWER_RAIL_NEGATIVE: '#4444ff',
    LABELS: '#666',
    SELECTED: '#ffa500',
    WIRE_DEFAULT: '#333',
  },
  
  // Wire colors by net type
  WIRE_COLORS: {
    POWER: '#ff0000',      // Red for VCC/power
    GROUND: '#000000',     // Black for GND
    SIGNAL: '#00aa00',     // Green for signals
    ANALOG: '#0066cc',     // Blue for analog
    CLOCK: '#ff6600',      // Orange for clocks
    DATA: '#8800cc',       // Purple for data lines
  },
} as const;

// Breadboard coordinate system
export interface BreadboardCoordinate {
  row: number;    // 0-based row index
  column: number; // 0-based column index
  section: 'power-top' | 'power-bottom' | 'main-top' | 'main-bottom' | 'center-gap';
}

export interface BreadboardPoint {
  x: number;
  y: number;
}

// Convert breadboard coordinate to SVG point
export function coordinateToPoint(coord: BreadboardCoordinate, config: BoardConfig): BreadboardPoint {
  const { GRID_SIZE, STANDARD } = BREADBOARD_CONFIG;
  const isHalf = config.kind === 'half';
  const maxColumns = isHalf ? BREADBOARD_CONFIG.HALF.COLUMNS : STANDARD.COLUMNS;
  
  // Clamp column to valid range
  const column = Math.max(0, Math.min(coord.column, maxColumns - 1));
  
  let x = column * GRID_SIZE;
  let y = 0;
  
  switch (coord.section) {
    case 'power-top':
      y = coord.row * GRID_SIZE;
      break;
    case 'main-top':
      y = (STANDARD.POWER_RAIL_ROWS + coord.row) * GRID_SIZE;
      break;
    case 'center-gap':
      y = (STANDARD.POWER_RAIL_ROWS + STANDARD.MAIN_AREA_ROWS) * GRID_SIZE;
      break;
    case 'main-bottom':
      y = (STANDARD.POWER_RAIL_ROWS + STANDARD.MAIN_AREA_ROWS + 1 + coord.row) * GRID_SIZE;
      break;
    case 'power-bottom':
      y = (STANDARD.POWER_RAIL_ROWS + STANDARD.MAIN_AREA_ROWS + 1 + STANDARD.MAIN_AREA_ROWS + coord.row) * GRID_SIZE;
      break;
  }
  
  return { x, y };
}

// Convert SVG point to breadboard coordinate
export function pointToCoordinate(point: BreadboardPoint, config: BoardConfig): BreadboardCoordinate {
  const { GRID_SIZE, STANDARD } = BREADBOARD_CONFIG;
  
  const column = Math.round(point.x / GRID_SIZE);
  const gridRow = Math.round(point.y / GRID_SIZE);
  
  // Determine section based on y position
  if (gridRow < STANDARD.POWER_RAIL_ROWS) {
    return {
      row: gridRow,
      column,
      section: 'power-top',
    };
  } else if (gridRow < STANDARD.POWER_RAIL_ROWS + STANDARD.MAIN_AREA_ROWS) {
    return {
      row: gridRow - STANDARD.POWER_RAIL_ROWS,
      column,
      section: 'main-top',
    };
  } else if (gridRow === STANDARD.POWER_RAIL_ROWS + STANDARD.MAIN_AREA_ROWS) {
    return {
      row: 0,
      column,
      section: 'center-gap',
    };
  } else if (gridRow < STANDARD.POWER_RAIL_ROWS + STANDARD.MAIN_AREA_ROWS + 1 + STANDARD.MAIN_AREA_ROWS) {
    return {
      row: gridRow - (STANDARD.POWER_RAIL_ROWS + STANDARD.MAIN_AREA_ROWS + 1),
      column,
      section: 'main-bottom',
    };
  } else {
    return {
      row: gridRow - (STANDARD.POWER_RAIL_ROWS + STANDARD.MAIN_AREA_ROWS + 1 + STANDARD.MAIN_AREA_ROWS),
      column,
      section: 'power-bottom',
    };
  }
}

// Check if two coordinates are electrically connected
export function areCoordinatesConnected(coord1: BreadboardCoordinate, coord2: BreadboardCoordinate): boolean {
  // Same section and row means connected
  if (coord1.section === coord2.section && coord1.row === coord2.row) {
    // Power rails run the full length
    if (coord1.section.includes('power')) {
      return true;
    }
    
    // Main area ties are only 5 columns wide
    if (coord1.section.includes('main')) {
      const tie1Start = Math.floor(coord1.column / 5) * 5;
      const tie2Start = Math.floor(coord2.column / 5) * 5;
      return tie1Start === tie2Start;
    }
  }
  
  return false;
}

// Get all coordinates in the same electrical connection
export function getConnectedCoordinates(coord: BreadboardCoordinate, config: BoardConfig): BreadboardCoordinate[] {
  const connected: BreadboardCoordinate[] = [];
  const isHalf = config.kind === 'half';
  const maxColumns = isHalf ? BREADBOARD_CONFIG.HALF.COLUMNS : BREADBOARD_CONFIG.STANDARD.COLUMNS;
  
  if (coord.section.includes('power')) {
    // Power rails connect all columns in the same row
    for (let col = 0; col < maxColumns; col++) {
      connected.push({
        row: coord.row,
        column: col,
        section: coord.section,
      });
    }
  } else if (coord.section.includes('main')) {
    // Main area ties connect 5 columns in the same row
    const tieStart = Math.floor(coord.column / 5) * 5;
    const tieEnd = Math.min(tieStart + 5, maxColumns);
    
    for (let col = tieStart; col < tieEnd; col++) {
      connected.push({
        row: coord.row,
        column: col,
        section: coord.section,
      });
    }
  }
  
  return connected;
}

// Calculate breadboard dimensions
export function getBreadboardDimensions(config: BoardConfig): { width: number; height: number } {
  const { GRID_SIZE, STANDARD } = BREADBOARD_CONFIG;
  const isHalf = config.kind === 'half';
  const columns = isHalf ? BREADBOARD_CONFIG.HALF.COLUMNS : STANDARD.COLUMNS;
  
  const width = columns * GRID_SIZE;
  const height = (STANDARD.POWER_RAIL_ROWS * 2 + STANDARD.MAIN_AREA_ROWS * 2 + 1) * GRID_SIZE;
  
  return { width, height };
}

// Generate row labels (A-J, +, -)
export function getRowLabel(coord: BreadboardCoordinate): string {
  switch (coord.section) {
    case 'power-top':
      return coord.row === 0 ? '+' : '-';
    case 'main-top':
      return String.fromCharCode(65 + coord.row); // A, B, C, D, E
    case 'main-bottom':
      return String.fromCharCode(70 + coord.row); // F, G, H, I, J
    case 'power-bottom':
      return coord.row === 0 ? '+' : '-';
    default:
      return '';
  }
}

// Generate column labels (1, 5, 10, 15, ...)
export function getColumnLabel(column: number): string {
  if (column === 0 || (column + 1) % 5 === 0) {
    return (column + 1).toString();
  }
  return '';
}

// Path finding for wire routing
export function findPath(start: BreadboardCoordinate, end: BreadboardCoordinate, config: BoardConfig): BreadboardPoint[] {
  const startPoint = coordinateToPoint(start, config);
  const endPoint = coordinateToPoint(end, config);
  
  // Simple Manhattan routing for now
  const path: BreadboardPoint[] = [startPoint];
  
  // Go horizontal first, then vertical
  if (startPoint.x !== endPoint.x) {
    path.push({ x: endPoint.x, y: startPoint.y });
  }
  
  if (startPoint.y !== endPoint.y) {
    path.push(endPoint);
  }
  
  return path;
}

// Wire color assignment
export function getWireColor(netName: string): string {
  const name = netName.toLowerCase();
  
  if (name.includes('vcc') || name.includes('vdd') || name.includes('+') || name.includes('power')) {
    return BREADBOARD_CONFIG.WIRE_COLORS.POWER;
  }
  if (name.includes('gnd') || name.includes('vss') || name.includes('-') || name.includes('ground')) {
    return BREADBOARD_CONFIG.WIRE_COLORS.GROUND;
  }
  if (name.includes('clk') || name.includes('clock')) {
    return BREADBOARD_CONFIG.WIRE_COLORS.CLOCK;
  }
  if (name.includes('data') || name.includes('sda') || name.includes('scl')) {
    return BREADBOARD_CONFIG.WIRE_COLORS.DATA;
  }
  if (name.includes('analog') || name.includes('adc')) {
    return BREADBOARD_CONFIG.WIRE_COLORS.ANALOG;
  }
  
  // Default to signal color
  return BREADBOARD_CONFIG.WIRE_COLORS.SIGNAL;
}
