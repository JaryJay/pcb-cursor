'use client';

import React from 'react';
import type { Component } from '@/lib/schema';
import { coordinateToPoint, BREADBOARD_CONFIG } from '@/lib/breadboard';

interface ResistorSpriteProps {
  component: Component;
  position: { row: number; column: number; span?: number };
  config: any;
  isSelected?: boolean;
  isHighlighted?: boolean;
  onSelect?: () => void;
}

export function ResistorSprite({
  component,
  position,
  config,
  isSelected = false,
  isHighlighted = false,
  onSelect
}: ResistorSpriteProps) {
  const { GRID_SIZE } = BREADBOARD_CONFIG;
  const span = position.span || 2; // Default 2-column span for axial components
  
  // Calculate position
  const startPoint = coordinateToPoint({
    row: position.row,
    column: position.column,
    section: 'main-top' // Default placement
  }, config);
  
  const endPoint = coordinateToPoint({
    row: position.row,
    column: position.column + span - 1,
    section: 'main-top'
  }, config);

  const centerX = (startPoint.x + endPoint.x) / 2;
  const centerY = startPoint.y;
  const width = Math.abs(endPoint.x - startPoint.x) + GRID_SIZE;
  
  // Color coding based on resistance value
  const getResistorColors = (value?: string) => {
    const colors = ['#8B4513', '#FF0000', '#FFA500', '#FFFF00']; // Brown, Red, Orange, Yellow default
    
    if (!value) return colors;
    
    // Simple color coding for common values
    if (value.includes('220')) return ['#FF0000', '#FF0000', '#8B4513']; // Red, Red, Brown
    if (value.includes('330')) return ['#FFA500', '#FFA500', '#8B4513']; // Orange, Orange, Brown
    if (value.includes('470')) return ['#FFFF00', '#800080', '#8B4513']; // Yellow, Violet, Brown
    if (value.includes('1k') || value.includes('1000')) return ['#8B4513', '#000000', '#FF0000']; // Brown, Black, Red
    if (value.includes('10k')) return ['#8B4513', '#000000', '#FFA500']; // Brown, Black, Orange
    
    return colors;
  };

  const resistorColors = getResistorColors(component.value);
  
  return (
    <g 
      className={`resistor-sprite ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}`}
      onClick={onSelect}
      style={{ cursor: onSelect ? 'pointer' : 'default' }}
    >
      {/* Selection/highlight outline */}
      {(isSelected || isHighlighted) && (
        <rect
          x={centerX - width/2 - 2}
          y={centerY - 8}
          width={width + 4}
          height={16}
          fill="none"
          stroke={isSelected ? '#ffa500' : '#ffff00'}
          strokeWidth={2}
          rx={2}
          opacity={0.7}
        />
      )}
      
      {/* Component body */}
      <rect
        x={centerX - width/2 + 8}
        y={centerY - 4}
        width={width - 16}
        height={8}
        fill="#f0e68c"
        stroke="#8b4513"
        strokeWidth={1}
        rx={1}
      />
      
      {/* Color bands */}
      {resistorColors.slice(0, 3).map((color, index) => (
        <rect
          key={index}
          x={centerX - width/2 + 12 + index * 6}
          y={centerY - 4}
          width={2}
          height={8}
          fill={color}
        />
      ))}
      
      {/* Tolerance band (usually gold/silver) */}
      <rect
        x={centerX + width/2 - 14}
        y={centerY - 4}
        width={2}
        height={8}
        fill="#FFD700" // Gold for 5% tolerance
      />
      
      {/* Lead wires */}
      <line
        x1={startPoint.x}
        y1={startPoint.y}
        x2={centerX - width/2 + 8}
        y2={centerY}
        stroke="#C0C0C0"
        strokeWidth={2}
      />
      <line
        x1={centerX + width/2 - 8}
        y1={centerY}
        x2={endPoint.x}
        y2={endPoint.y}
        stroke="#C0C0C0"
        strokeWidth={2}
      />
      
      {/* Reference designator */}
      <text
        x={centerX}
        y={centerY - 12}
        textAnchor="middle"
        fontSize="8"
        fill="#333"
        fontFamily="monospace"
      >
        {component.ref}
      </text>
      
      {/* Value label */}
      {component.value && (
        <text
          x={centerX}
          y={centerY + 16}
          textAnchor="middle"
          fontSize="7"
          fill="#666"
          fontFamily="monospace"
        >
          {component.value}
        </text>
      )}
    </g>
  );
}
