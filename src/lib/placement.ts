import type { Component, PlacementResult, BoardConfig } from './schema';
import { BREADBOARD_CONFIG, type BreadboardCoordinate } from './breadboard';

export interface PlacementOptions {
  preferredSection?: 'main-top' | 'main-bottom' | 'power-top' | 'power-bottom';
  avoidOverlap?: boolean;
  minSpacing?: number;
}

export class PlacementEngine {
  public occupancyMap: Map<string, string> = new Map(); // coordinate -> componentId

  constructor(private config: BoardConfig) {}

  public getCoordinateKey(row: number, column: number, section: string): string {
    return `${section}-${row}-${column}`;
  }

  private isOccupied(row: number, column: number, section: string): boolean {
    return this.occupancyMap.has(this.getCoordinateKey(row, column, section));
  }

  public markOccupied(row: number, column: number, section: string, componentId: string, span: number = 1): void {
    for (let col = column; col < column + span; col++) {
      this.occupancyMap.set(this.getCoordinateKey(row, col, section), componentId);
    }
  }

  private getComponentSpan(component: Component): number {
    switch (component.kind) {
      case 'resistor':
      case 'led':
        return 2; // Most axial components span 2 holes minimum
      case 'ic':
        return Math.max(4, Math.ceil(component.pins.length / 2)); // DIP packages
      case 'capacitor':
        return component.footprint === 'radial' ? 1 : 2;
      case 'transistor':
        return 1; // TO-92 usually fits in one tie point
      case 'button':
        return 2; // Tactile switches span 2 tie points
      case 'pot':
        return 1; // Variable resistors
      case 'power':
        return 3; // Power supplies need more space
      default:
        return 1;
    }
  }

  private getPreferredSection(component: Component): BreadboardCoordinate['section'] {
    switch (component.kind) {
      case 'power':
        return 'power-top';
      case 'ic':
        return 'main-top'; // ICs typically go across center gap
      case 'led':
      case 'resistor':
      case 'capacitor':
      case 'transistor':
      case 'button':
      case 'pot':
        return 'main-top'; // Most components start on top
      default:
        return 'main-top';
    }
  }

  private findAvailablePosition(
    component: Component, 
    preferredSection?: string,
    targetRow?: number,
    targetColumn?: number
  ): PlacementResult | null {
    const span = this.getComponentSpan(component);
    const section = preferredSection || this.getPreferredSection(component);
    const maxColumns = this.config.kind === 'half' 
      ? BREADBOARD_CONFIG.HALF.COLUMNS 
      : BREADBOARD_CONFIG.STANDARD.COLUMNS;

    // If specific position requested, try it first
    if (targetRow !== undefined && targetColumn !== undefined) {
      if (targetColumn + span <= maxColumns) {
        let canPlace = true;
        for (let col = targetColumn; col < targetColumn + span; col++) {
          if (this.isOccupied(targetRow, col, section)) {
            canPlace = false;
            break;
          }
        }
        
        if (canPlace) {
          return {
            componentId: component.id,
            position: {
              row: targetRow,
              column: targetColumn,
              span: span
            },
            rotation: 0,
            conflicts: []
          };
        }
      }
    }

    // Find first available position
    const maxRows = section.includes('power') ? 2 : BREADBOARD_CONFIG.STANDARD.MAIN_AREA_ROWS;
    
    for (let row = 0; row < maxRows; row++) {
      for (let col = 0; col <= maxColumns - span; col++) {
        let canPlace = true;
        
        // Check if all required positions are free
        for (let spanCol = col; spanCol < col + span; spanCol++) {
          if (this.isOccupied(row, spanCol, section)) {
            canPlace = false;
            break;
          }
        }
        
        if (canPlace) {
          return {
            componentId: component.id,
            position: {
              row: row,
              column: col,
              span: span
            },
            rotation: 0,
            conflicts: []
          };
        }
      }
    }

    return null; // No available position found
  }

  placeComponent(
    component: Component, 
    options: PlacementOptions = {},
    targetRow?: number,
    targetColumn?: number
  ): PlacementResult | null {
    const placement = this.findAvailablePosition(
      component, 
      options.preferredSection,
      targetRow,
      targetColumn
    );

    if (placement) {
      // Mark positions as occupied
      this.markOccupied(
        placement.position.row, 
        placement.position.column, 
        options.preferredSection || this.getPreferredSection(component),
        component.id,
        placement.position.span
      );
    }

    return placement;
  }

  removeComponent(componentId: string): void {
    // Remove all occupied positions for this component
    const keysToDelete: string[] = [];
    this.occupancyMap.forEach((id, key) => {
      if (id === componentId) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.occupancyMap.delete(key));
  }

  public clearOccupancy(): void {
    this.occupancyMap.clear();
  }

  placeComponents(components: Component[]): PlacementResult[] {
    const results: PlacementResult[] = [];
    
    // Sort components by placement priority (power first, then ICs, then others)
    const sortedComponents = [...components].sort((a, b) => {
      const priority = { power: 0, ic: 1, resistor: 2, led: 3, capacitor: 4, transistor: 5 };
      return (priority[a.kind as keyof typeof priority] || 9) - (priority[b.kind as keyof typeof priority] || 9);
    });

    for (const component of sortedComponents) {
      const placement = this.placeComponent(component);
      if (placement) {
        results.push(placement);
      } else {
        // Create a placement result with conflicts
        results.push({
          componentId: component.id,
          position: { row: 0, column: 0, span: 1 },
          rotation: 0,
          conflicts: ['No available position found']
        });
      }
    }

    return results;
  }

  // Get visual representation of occupancy (for debugging)
  getOccupancyGrid(section: string = 'main-top'): string[][] {
    const maxColumns = this.config.kind === 'half' 
      ? BREADBOARD_CONFIG.HALF.COLUMNS 
      : BREADBOARD_CONFIG.STANDARD.COLUMNS;
    const maxRows = section.includes('power') ? 2 : BREADBOARD_CONFIG.STANDARD.MAIN_AREA_ROWS;
    
    const grid: string[][] = [];
    for (let row = 0; row < maxRows; row++) {
      grid[row] = [];
      for (let col = 0; col < maxColumns; col++) {
        const key = this.getCoordinateKey(row, col, section);
        grid[row][col] = this.occupancyMap.get(key) || '.';
      }
    }
    
    return grid;
  }
}

// Utility function to create a placement engine and place all components
export function autoPlaceComponents(
  components: Component[], 
  config: BoardConfig
): PlacementResult[] {
  const engine = new PlacementEngine(config);
  return engine.placeComponents(components);
}

// Utility to place a single component at a specific position
export function placeSingleComponent(
  component: Component,
  config: BoardConfig,
  existingPlacements: PlacementResult[],
  targetRow?: number,
  targetColumn?: number,
  preferredSection?: string
): PlacementResult | null {
  const engine = new PlacementEngine(config);
  
  // Mark existing placements as occupied
  existingPlacements.forEach(placement => {
    if (placement.componentId !== component.id) { // Don't mark self as occupied
      const section = preferredSection || 'main-top';
      for (let col = placement.position.column; col < placement.position.column + placement.position.span; col++) {
        engine.occupancyMap.set(
          engine.getCoordinateKey(placement.position.row, col, section),
          placement.componentId
        );
      }
    }
  });

  return engine.placeComponent(
    component, 
    { preferredSection: preferredSection as any },
    targetRow,
    targetColumn
  );
}
