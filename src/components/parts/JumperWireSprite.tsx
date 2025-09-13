'use client';

import React from 'react';
import type { Component } from '@/lib/schema';
import { coordinateToPoint, findPath } from '@/lib/breadboard';

interface JumperWireSpriteProps {
  component: Component;
  startPosition: { row: number; column: number; section: string };
  endPosition: { row: number; column: number; section: string };
  config: any;
  color?: string;
  isSelected?: boolean;
  isHighlighted?: boolean;
  onSelect?: () => void;
}

export function JumperWireSprite({
  component,
  startPosition,
  endPosition,
  config,
  color = '#333333',
  isSelected = false,
  isHighlighted = false,
  onSelect
}: JumperWireSpriteProps) {
  // Calculate wire path
  const startCoord = {
    row: startPosition.row,
    column: startPosition.column,
    section: startPosition.section as any
  };
  
  const endCoord = {
    row: endPosition.row,
    column: endPosition.column,
    section: endPosition.section as any
  };
  
  const pathPoints = findPath(startCoord, endCoord, config);
  
  // Create SVG path string
  const pathString = pathPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
  
  // Wire appearance
  const strokeWidth = isSelected ? 4 : (isHighlighted ? 3 : 2);
  const wireColor = isSelected ? '#ffa500' : (isHighlighted ? '#ffff00' : color);
  
  return (
    <g 
      className={`jumper-wire-sprite ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}`}
      onClick={onSelect}
      style={{ cursor: onSelect ? 'pointer' : 'default' }}
    >
      {/* Wire shadow/outline for visibility */}
      <path
        d={pathString}
        fill="none"
        stroke="#000"
        strokeWidth={strokeWidth + 1}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.3}
      />
      
      {/* Main wire */}
      <path
        d={pathString}
        fill="none"
        stroke={wireColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.9}
      />
      
      {/* Wire ends (connector tips) */}
      {pathPoints.length > 0 && (
        <>
          {/* Start connector */}
          <circle
            cx={pathPoints[0].x}
            cy={pathPoints[0].y}
            r={strokeWidth / 2 + 1}
            fill={wireColor}
            stroke="#333"
            strokeWidth={0.5}
          />
          
          {/* End connector */}
          <circle
            cx={pathPoints[pathPoints.length - 1].x}
            cy={pathPoints[pathPoints.length - 1].y}
            r={strokeWidth / 2 + 1}
            fill={wireColor}
            stroke="#333"
            strokeWidth={0.5}
          />
        </>
      )}
      
      {/* Wire label (for identification) */}
      {pathPoints.length > 1 && (
        <text
          x={(pathPoints[0].x + pathPoints[pathPoints.length - 1].x) / 2}
          y={(pathPoints[0].y + pathPoints[pathPoints.length - 1].y) / 2 - 5}
          textAnchor="middle"
          fontSize="6"
          fill="#333"
          fontFamily="monospace"
          opacity={0.7}
        >
          {component.ref}
        </text>
      )}
    </g>
  );
}
