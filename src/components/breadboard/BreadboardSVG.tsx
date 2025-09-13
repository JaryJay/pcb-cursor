'use client';

import React from 'react';
import type { BoardConfig } from '@/lib/schema';
import { 
  BREADBOARD_CONFIG, 
  getBreadboardDimensions, 
  coordinateToPoint,
  getRowLabel,
  getColumnLabel,
  type BreadboardCoordinate 
} from '@/lib/breadboard';

interface BreadboardSVGProps {
  config: BoardConfig;
  showGrid?: boolean;
  showLabels?: boolean;
  selectedCoordinate?: BreadboardCoordinate | null;
  onCoordinateClick?: (coordinate: BreadboardCoordinate) => void;
  children?: React.ReactNode;
  className?: string;
}

export function BreadboardSVG({
  config,
  showGrid = true,
  showLabels = true,
  selectedCoordinate = null,
  onCoordinateClick,
  children,
  className = '',
}: BreadboardSVGProps) {
  const dimensions = getBreadboardDimensions(config);
  const { GRID_SIZE, HOLE_RADIUS, COLORS, STANDARD } = BREADBOARD_CONFIG;
  const isHalf = config.kind === 'half';
  const columns = isHalf ? BREADBOARD_CONFIG.HALF.COLUMNS : STANDARD.COLUMNS;

  // Generate holes for each section
  const generateHoles = () => {
    const holes: JSX.Element[] = [];

    // Helper to add holes for a section
    const addHoles = (
      section: BreadboardCoordinate['section'],
      startRow: number,
      rowCount: number,
      isPowerRail: boolean = false
    ) => {
      for (let row = 0; row < rowCount; row++) {
        for (let col = 0; col < columns; col++) {
          const coord: BreadboardCoordinate = { row, column: col, section };
          const point = coordinateToPoint(coord, config);
          const isSelected = selectedCoordinate && 
            selectedCoordinate.section === section &&
            selectedCoordinate.row === row &&
            selectedCoordinate.column === col;

          // Determine hole color
          let holeColor: string = COLORS.HOLES;
          if (isPowerRail) {
            holeColor = row === 0 ? COLORS.POWER_RAIL_POSITIVE : COLORS.POWER_RAIL_NEGATIVE;
          }
          if (isSelected) {
            holeColor = COLORS.SELECTED;
          }

          holes.push(
            <circle
              key={`hole-${section}-${row}-${col}`}
              cx={point.x}
              cy={point.y}
              r={HOLE_RADIUS}
              fill={holeColor}
              stroke={isSelected ? COLORS.SELECTED : 'none'}
              strokeWidth={isSelected ? 2 : 0}
              className={onCoordinateClick ? 'cursor-pointer hover:stroke-orange-400 hover:stroke-2' : ''}
              onClick={() => onCoordinateClick?.(coord)}
            />
          );
        }
      }
    };

    // Top power rails
    addHoles('power-top', 0, STANDARD.POWER_RAIL_ROWS, true);

    // Top main area (A-E)
    addHoles('main-top', STANDARD.POWER_RAIL_ROWS, STANDARD.MAIN_AREA_ROWS);

    // Bottom main area (F-J)
    addHoles('main-bottom', STANDARD.POWER_RAIL_ROWS + STANDARD.MAIN_AREA_ROWS + 1, STANDARD.MAIN_AREA_ROWS);

    // Bottom power rails
    addHoles('power-bottom', STANDARD.POWER_RAIL_ROWS + STANDARD.MAIN_AREA_ROWS + 1 + STANDARD.MAIN_AREA_ROWS, STANDARD.POWER_RAIL_ROWS, true);

    return holes;
  };

  // Generate grid lines
  const generateGridLines = () => {
    if (!showGrid) return null;

    const lines: JSX.Element[] = [];

    // Vertical lines
    for (let col = 0; col <= columns; col++) {
      const x = col * GRID_SIZE;
      lines.push(
        <line
          key={`vline-${col}`}
          x1={x}
          y1={0}
          x2={x}
          y2={dimensions.height}
          stroke={COLORS.GRID_LINES}
          strokeWidth={0.5}
        />
      );
    }

    // Horizontal lines
    const totalRows = STANDARD.POWER_RAIL_ROWS * 2 + STANDARD.MAIN_AREA_ROWS * 2 + 1;
    for (let row = 0; row <= totalRows; row++) {
      const y = row * GRID_SIZE;
      lines.push(
        <line
          key={`hline-${row}`}
          x1={0}
          y1={y}
          x2={dimensions.width}
          y2={y}
          stroke={COLORS.GRID_LINES}
          strokeWidth={0.5}
        />
      );
    }

    return <g className="grid-lines">{lines}</g>;
  };

  // Generate connection indicators (tie points)
  const generateConnections = () => {
    const connections: JSX.Element[] = [];

    // Power rail connections (full width)
    const addPowerRailConnection = (section: 'power-top' | 'power-bottom', row: number) => {
      const startPoint = coordinateToPoint({ row, column: 0, section }, config);
      const endPoint = coordinateToPoint({ row, column: columns - 1, section }, config);
      
      connections.push(
        <line
          key={`power-${section}-${row}`}
          x1={startPoint.x}
          y1={startPoint.y}
          x2={endPoint.x}
          y2={endPoint.y}
          stroke={row === 0 ? COLORS.POWER_RAIL_POSITIVE : COLORS.POWER_RAIL_NEGATIVE}
          strokeWidth={1}
          opacity={0.3}
        />
      );
    };

    // Top power rails
    addPowerRailConnection('power-top', 0);
    addPowerRailConnection('power-top', 1);

    // Bottom power rails
    addPowerRailConnection('power-bottom', 0);
    addPowerRailConnection('power-bottom', 1);

    // Main area tie points (5-column groups)
    const addMainAreaConnections = (section: 'main-top' | 'main-bottom') => {
      for (let row = 0; row < STANDARD.MAIN_AREA_ROWS; row++) {
        for (let tieStart = 0; tieStart < columns; tieStart += 5) {
          const tieEnd = Math.min(tieStart + 4, columns - 1);
          const startPoint = coordinateToPoint({ row, column: tieStart, section }, config);
          const endPoint = coordinateToPoint({ row, column: tieEnd, section }, config);
          
          connections.push(
            <line
              key={`tie-${section}-${row}-${tieStart}`}
              x1={startPoint.x}
              y1={startPoint.y}
              x2={endPoint.x}
              y2={endPoint.y}
              stroke={COLORS.HOLES}
              strokeWidth={1}
              opacity={0.2}
            />
          );
        }
      }
    };

    addMainAreaConnections('main-top');
    addMainAreaConnections('main-bottom');

    return <g className="connections">{connections}</g>;
  };

  // Generate labels
  const generateLabels = () => {
    if (!showLabels) return null;

    const labels: JSX.Element[] = [];

    // Row labels (left side)
    const sections: Array<{ section: BreadboardCoordinate['section'], rows: number }> = [
      { section: 'power-top', rows: STANDARD.POWER_RAIL_ROWS },
      { section: 'main-top', rows: STANDARD.MAIN_AREA_ROWS },
      { section: 'main-bottom', rows: STANDARD.MAIN_AREA_ROWS },
      { section: 'power-bottom', rows: STANDARD.POWER_RAIL_ROWS },
    ];

    sections.forEach(({ section, rows }) => {
      for (let row = 0; row < rows; row++) {
        const coord: BreadboardCoordinate = { row, column: 0, section };
        const point = coordinateToPoint(coord, config);
        const label = getRowLabel(coord);

        if (label) {
          labels.push(
            <text
              key={`row-label-${section}-${row}`}
              x={point.x - 15}
              y={point.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill={COLORS.LABELS}
              fontSize="10"
              fontFamily="monospace"
            >
              {label}
            </text>
          );
        }
      }
    });

    // Column labels (top)
    for (let col = 0; col < columns; col++) {
      const label = getColumnLabel(col);
      if (label) {
        const point = coordinateToPoint({ row: 0, column: col, section: 'power-top' }, config);
        labels.push(
          <text
            key={`col-label-${col}`}
            x={point.x}
            y={point.y - 15}
            textAnchor="middle"
            dominantBaseline="central"
            fill={COLORS.LABELS}
            fontSize="10"
            fontFamily="monospace"
          >
            {label}
          </text>
        );
      }
    }

    return <g className="labels">{labels}</g>;
  };

  // Generate center gap indicator
  const generateCenterGap = () => {
    const gapY = (STANDARD.POWER_RAIL_ROWS + STANDARD.MAIN_AREA_ROWS) * GRID_SIZE;
    return (
      <rect
        x={0}
        y={gapY - 2}
        width={dimensions.width}
        height={4}
        fill={COLORS.BOARD}
        stroke={COLORS.GRID_LINES}
        strokeWidth={1}
      />
    );
  };

  return (
    <div className={`breadboard-container ${className}`}>
      <svg
        viewBox={`-30 -30 ${dimensions.width + 60} ${dimensions.height + 60}`}
        className="w-full h-full"
      >
        {/* Background */}
        <rect
          x={-20}
          y={-20}
          width={dimensions.width + 40}
          height={dimensions.height + 40}
          fill={COLORS.BOARD}
          rx={8}
          ry={8}
          stroke="#ccc"
          strokeWidth={1}
        />

        {/* Grid lines */}
        {generateGridLines()}

        {/* Connection indicators */}
        {generateConnections()}

        {/* Center gap */}
        {generateCenterGap()}

        {/* Holes */}
        {generateHoles()}

        {/* Labels */}
        {generateLabels()}

        {/* Children (components, wires, etc.) */}
        {children}
      </svg>
    </div>
  );
}

export default BreadboardSVG;
