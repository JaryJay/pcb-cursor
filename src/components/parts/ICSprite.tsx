'use client';

import React from 'react';
import type { Component } from '@/lib/schema';
import { coordinateToPoint, BREADBOARD_CONFIG } from '@/lib/breadboard';

interface ICSpriteProps {
  component: Component;
  position: { row: number; column: number; span?: number };
  config: any;
  isSelected?: boolean;
  isHighlighted?: boolean;
  onSelect?: () => void;
}

export function ICSprite({
  component,
  position,
  config,
  isSelected = false,
  isHighlighted = false,
  onSelect
}: ICSpriteProps) {
  const { GRID_SIZE } = BREADBOARD_CONFIG;
  
  // ICs span across the center gap by default
  const pinCount = component.pins.length;
  const span = position.span || Math.max(4, Math.ceil(pinCount / 2)); // Minimum 4 columns
  
  // Calculate positions - ICs go across the center gap
  const topLeftPoint = coordinateToPoint({
    row: 2, // Start at row C (index 2)
    column: position.column,
    section: 'main-top'
  }, config);
  
  const bottomRightPoint = coordinateToPoint({
    row: 2, // Row H (index 2 in bottom section)
    column: position.column + span - 1,
    section: 'main-bottom'
  }, config);

  const centerX = (topLeftPoint.x + bottomRightPoint.x) / 2;
  const centerY = (topLeftPoint.y + bottomRightPoint.y) / 2;
  const width = bottomRightPoint.x - topLeftPoint.x + GRID_SIZE;
  const height = bottomRightPoint.y - topLeftPoint.y + GRID_SIZE * 0.5;
  
  // Pin layout for DIP packages
  const pinsPerSide = Math.ceil(pinCount / 2);
  const pinSpacing = width / (pinsPerSide + 1);
  
  return (
    <g 
      className={`ic-sprite ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}`}
      onClick={onSelect}
      style={{ cursor: onSelect ? 'pointer' : 'default' }}
    >
      {/* Selection/highlight outline */}
      {(isSelected || isHighlighted) && (
        <rect
          x={topLeftPoint.x - 5}
          y={topLeftPoint.y - 5}
          width={width + 10}
          height={height + 10}
          fill="none"
          stroke={isSelected ? '#ffa500' : '#ffff00'}
          strokeWidth={2}
          rx={3}
          opacity={0.7}
        />
      )}
      
      {/* IC body */}
      <rect
        x={topLeftPoint.x}
        y={topLeftPoint.y}
        width={width}
        height={height}
        fill="#2c2c2c"
        stroke="#1a1a1a"
        strokeWidth={1}
        rx={2}
      />
      
      {/* Pin 1 indicator (notch) */}
      <path
        d={`M ${topLeftPoint.x + 5} ${topLeftPoint.y} 
            A 3 3 0 0 0 ${topLeftPoint.x + 11} ${topLeftPoint.y}
            L ${topLeftPoint.x + 11} ${topLeftPoint.y}
            Z`}
        fill="#1a1a1a"
      />
      
      {/* Top pins (1 to n/2) */}
      {Array.from({ length: pinsPerSide }, (_, i) => {
        const pinX = topLeftPoint.x + pinSpacing * (i + 1);
        const pinY = topLeftPoint.y;
        const pinNumber = i + 1;
        
        return (
          <g key={`top-pin-${pinNumber}`}>
            {/* Pin */}
            <rect
              x={pinX - 2}
              y={pinY - 3}
              width={4}
              height={6}
              fill="#C0C0C0"
              stroke="#999"
              strokeWidth={0.5}
            />
            {/* Pin number */}
            <text
              x={pinX}
              y={pinY + 10}
              textAnchor="middle"
              fontSize="6"
              fill="#fff"
              fontFamily="monospace"
            >
              {pinNumber}
            </text>
            {/* Pin lead to breadboard hole */}
            <line
              x1={pinX}
              y1={pinY - 3}
              x2={pinX}
              y2={topLeftPoint.y - 10}
              stroke="#C0C0C0"
              strokeWidth={1}
            />
          </g>
        );
      })}
      
      {/* Bottom pins (n/2+1 to n) - numbered counter-clockwise */}
      {Array.from({ length: pinsPerSide }, (_, i) => {
        const pinX = bottomRightPoint.x - pinSpacing * (i + 1);
        const pinY = bottomRightPoint.y;
        const pinNumber = pinCount - i; // Counter-clockwise numbering
        
        return (
          <g key={`bottom-pin-${pinNumber}`}>
            {/* Pin */}
            <rect
              x={pinX - 2}
              y={pinY - 3}
              width={4}
              height={6}
              fill="#C0C0C0"
              stroke="#999"
              strokeWidth={0.5}
            />
            {/* Pin number */}
            <text
              x={pinX}
              y={pinY - 8}
              textAnchor="middle"
              fontSize="6"
              fill="#fff"
              fontFamily="monospace"
            >
              {pinNumber}
            </text>
            {/* Pin lead to breadboard hole */}
            <line
              x1={pinX}
              y1={pinY + 3}
              x2={pinX}
              y2={bottomRightPoint.y + 10}
              stroke="#C0C0C0"
              strokeWidth={1}
            />
          </g>
        );
      })}
      
      {/* IC label/part number */}
      <text
        x={centerX}
        y={centerY - 5}
        textAnchor="middle"
        fontSize="8"
        fill="#fff"
        fontFamily="monospace"
        fontWeight="bold"
      >
        {component.value || component.kind.toUpperCase()}
      </text>
      
      {/* Reference designator */}
      <text
        x={centerX}
        y={centerY + 5}
        textAnchor="middle"
        fontSize="7"
        fill="#ccc"
        fontFamily="monospace"
      >
        {component.ref}
      </text>
      
      {/* Pin 1 indicator dot */}
      <circle
        cx={topLeftPoint.x + 8}
        cy={topLeftPoint.y + 8}
        r={2}
        fill="#fff"
      />
    </g>
  );
}
