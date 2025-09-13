'use client';

import React from 'react';
import type { Component } from '@/lib/schema';
import { coordinateToPoint, BREADBOARD_CONFIG } from '@/lib/breadboard';

interface LEDSpriteProps {
  component: Component;
  position: { row: number; column: number; span?: number };
  config: any;
  isSelected?: boolean;
  isHighlighted?: boolean;
  onSelect?: () => void;
}

export function LEDSprite({
  component,
  position,
  config,
  isSelected = false,
  isHighlighted = false,
  onSelect
}: LEDSpriteProps) {
  const { GRID_SIZE } = BREADBOARD_CONFIG;
  const span = position.span || 1; // LEDs typically span 1 column but cross the center gap
  
  // Calculate position - LEDs typically go across the center gap
  const topPoint = coordinateToPoint({
    row: position.row,
    column: position.column,
    section: 'main-top'
  }, config);
  
  const bottomPoint = coordinateToPoint({
    row: position.row,
    column: position.column,
    section: 'main-bottom'
  }, config);

  const centerX = topPoint.x;
  const centerY = (topPoint.y + bottomPoint.y) / 2;
  
  // Get LED color from component properties
  const getLEDColor = (component: Component): string => {
    const color = component.properties?.color || component.value;
    if (!color) return '#ff4444'; // Default red
    
    const colorMap: Record<string, string> = {
      'red': '#ff4444',
      'green': '#44ff44',
      'blue': '#4444ff',
      'yellow': '#ffff44',
      'orange': '#ff8844',
      'white': '#ffffff',
      'amber': '#ffaa00',
    };
    
    return colorMap[color.toLowerCase()] || '#ff4444';
  };

  const ledColor = getLEDColor(component);
  
  return (
    <g 
      className={`led-sprite ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}`}
      onClick={onSelect}
      style={{ cursor: onSelect ? 'pointer' : 'default' }}
    >
      {/* Selection/highlight outline */}
      {(isSelected || isHighlighted) && (
        <circle
          cx={centerX}
          cy={centerY}
          r={10}
          fill="none"
          stroke={isSelected ? '#ffa500' : '#ffff00'}
          strokeWidth={2}
          opacity={0.7}
        />
      )}
      
      {/* LED body (dome shape) */}
      <circle
        cx={centerX}
        cy={centerY}
        r={6}
        fill={ledColor}
        stroke="#333"
        strokeWidth={1}
        opacity={0.8}
      />
      
      {/* LED body base (darker) */}
      <circle
        cx={centerX}
        cy={centerY}
        r={6}
        fill="url(#ledGradient)"
        stroke="#333"
        strokeWidth={1}
      />
      
      {/* Gradient definition for LED */}
      <defs>
        <radialGradient id="ledGradient" cx="30%" cy="30%">
          <stop offset="0%" stopColor={ledColor} stopOpacity="0.3"/>
          <stop offset="70%" stopColor={ledColor} stopOpacity="0.7"/>
          <stop offset="100%" stopColor="#333" stopOpacity="0.9"/>
        </radialGradient>
      </defs>
      
      {/* Flat side indicator (cathode) */}
      <path
        d={`M ${centerX - 6} ${centerY - 3} L ${centerX - 6} ${centerY + 3}`}
        stroke="#666"
        strokeWidth={2}
        strokeLinecap="round"
      />
      
      {/* Anode (+) lead wire */}
      <line
        x1={centerX + 2}
        y1={centerY + 6}
        x2={topPoint.x}
        y2={topPoint.y}
        stroke="#FFD700"
        strokeWidth={2}
      />
      
      {/* Cathode (-) lead wire - shorter */}
      <line
        x1={centerX - 2}
        y1={centerY + 6}
        x2={bottomPoint.x}
        y2={bottomPoint.y}
        stroke="#C0C0C0"
        strokeWidth={2}
      />
      
      {/* Polarity indicators */}
      <text
        x={centerX + 8}
        y={centerY - 2}
        fontSize="8"
        fill="#ff0000"
        fontFamily="monospace"
        fontWeight="bold"
      >
        +
      </text>
      <text
        x={centerX - 12}
        y={centerY - 2}
        fontSize="8"
        fill="#333"
        fontFamily="monospace"
        fontWeight="bold"
      >
        -
      </text>
      
      {/* Reference designator */}
      <text
        x={centerX}
        y={centerY - 15}
        textAnchor="middle"
        fontSize="8"
        fill="#333"
        fontFamily="monospace"
      >
        {component.ref}
      </text>
      
      {/* Value/Color label */}
      {component.value && (
        <text
          x={centerX}
          y={centerY + 20}
          textAnchor="middle"
          fontSize="7"
          fill="#666"
          fontFamily="monospace"
        >
          {component.value}
        </text>
      )}
      
      {/* Light rays when highlighted (simulating LED on) */}
      {isHighlighted && (
        <g opacity={0.6}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <line
              key={i}
              x1={centerX}
              y1={centerY}
              x2={centerX + Math.cos(angle * Math.PI / 180) * 15}
              y2={centerY + Math.sin(angle * Math.PI / 180) * 15}
              stroke={ledColor}
              strokeWidth={1}
              opacity={0.5}
            />
          ))}
        </g>
      )}
    </g>
  );
}
