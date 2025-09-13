'use client';

import React from 'react';
import type { Component, PlacementResult } from '@/lib/schema';
import { ResistorSprite } from './ResistorSprite';
import { LEDSprite } from './LEDSprite';
import { ICSprite } from './ICSprite';
import { JumperWireSprite } from './JumperWireSprite';

// For now, we'll use a simpler approach without drag and drop
// Components can be selected and then placed by clicking on the breadboard

interface ComponentSpriteProps {
  component: Component;
  placement?: PlacementResult;
  config: any;
  isSelected?: boolean;
  isHighlighted?: boolean;
  onSelect?: () => void;
  // For jumper wires
  startPosition?: { row: number; column: number; section: string };
  endPosition?: { row: number; column: number; section: string };
  wireColor?: string;
}

export function ComponentSprite({
  component,
  placement,
  config,
  isSelected = false,
  isHighlighted = false,
  onSelect,
  startPosition,
  endPosition,
  wireColor
}: ComponentSpriteProps) {
  // Handle jumper wires separately
  if (component.kind === 'jumper' && startPosition && endPosition) {
    return (
      <JumperWireSprite
        component={component}
        startPosition={startPosition}
        endPosition={endPosition}
        config={config}
        color={wireColor}
        isSelected={isSelected}
        isHighlighted={isHighlighted}
        onSelect={onSelect}
      />
    );
  }
  
  // For other components, we need placement information
  if (!placement) {
    return null;
  }

  const position = {
    row: placement.position.row,
    column: placement.position.column,
    span: placement.position.span
  };

  const commonProps = {
    component,
    position,
    config,
    isSelected,
    isHighlighted,
    onSelect
  };

  switch (component.kind) {
    case 'resistor':
      return <ResistorSprite {...commonProps} />;
    
    case 'led':
      return <LEDSprite {...commonProps} />;
    
    case 'ic':
      return <ICSprite {...commonProps} />;
    
    case 'capacitor':
      return <CapacitorSprite {...commonProps} />;
    
    case 'transistor':
      return <TransistorSprite {...commonProps} />;
    
    case 'button':
      return <ButtonSprite {...commonProps} />;
    
    case 'pot':
      return <PotentiometerSprite {...commonProps} />;
    
    case 'power':
      return <PowerSprite {...commonProps} />;
    
    default:
      // Fallback: render as generic component
      return <GenericComponentSprite {...commonProps} />;
  }
}

// Capacitor sprite component
function CapacitorSprite(props: any) {
  const { component, position, config, isSelected, isHighlighted, onSelect } = props;
  const { coordinateToPoint, BREADBOARD_CONFIG } = require('@/lib/breadboard');
  
  const span = position.span || 1;
  const point = coordinateToPoint({
    row: position.row,
    column: position.column,
    section: 'main-top'
  }, config);

  return (
    <g onClick={onSelect} style={{ cursor: onSelect ? 'pointer' : 'default' }}>
      {(isSelected || isHighlighted) && (
        <circle
          cx={point.x}
          cy={point.y}
          r={8}
          fill="none"
          stroke={isSelected ? '#ffa500' : '#ffff00'}
          strokeWidth={2}
          opacity={0.7}
        />
      )}
      
      {/* Capacitor body */}
      <rect
        x={point.x - 6}
        y={point.y - 8}
        width={12}
        height={16}
        fill="#4169E1"
        stroke="#000"
        strokeWidth={1}
        rx={2}
      />
      
      {/* Polarity indicator for electrolytic */}
      {component.footprint === 'radial' && (
        <>
          <text
            x={point.x - 3}
            y={point.y - 2}
            fontSize="8"
            fill="#fff"
            fontFamily="monospace"
            fontWeight="bold"
          >
            +
          </text>
          <line
            x1={point.x + 1}
            y1={point.y - 6}
            x2={point.x + 1}
            y2={point.y + 6}
            stroke="#fff"
            strokeWidth={1}
          />
        </>
      )}
      
      <text
        x={point.x}
        y={point.y - 15}
        textAnchor="middle"
        fontSize="8"
        fill="#333"
        fontFamily="monospace"
      >
        {component.ref}
      </text>
    </g>
  );
}

// Transistor sprite component
function TransistorSprite(props: any) {
  const { component, position, config, isSelected, isHighlighted, onSelect } = props;
  const { coordinateToPoint } = require('@/lib/breadboard');
  
  const point = coordinateToPoint({
    row: position.row,
    column: position.column,
    section: 'main-top'
  }, config);

  return (
    <g onClick={onSelect} style={{ cursor: onSelect ? 'pointer' : 'default' }}>
      {(isSelected || isHighlighted) && (
        <circle
          cx={point.x}
          cy={point.y}
          r={10}
          fill="none"
          stroke={isSelected ? '#ffa500' : '#ffff00'}
          strokeWidth={2}
          opacity={0.7}
        />
      )}
      
      {/* TO-92 package body */}
      <path
        d={`M ${point.x - 6} ${point.y + 6} 
            A 6 6 0 0 1 ${point.x + 6} ${point.y + 6}
            L ${point.x + 6} ${point.y - 2}
            L ${point.x - 6} ${point.y - 2}
            Z`}
        fill="#2c2c2c"
        stroke="#1a1a1a"
        strokeWidth={1}
      />
      
      {/* Flat side indicator */}
      <line
        x1={point.x - 6}
        y1={point.y - 2}
        x2={point.x + 6}
        y2={point.y - 2}
        stroke="#666"
        strokeWidth={2}
      />
      
      <text
        x={point.x}
        y={point.y - 15}
        textAnchor="middle"
        fontSize="8"
        fill="#333"
        fontFamily="monospace"
      >
        {component.ref}
      </text>
    </g>
  );
}

// Button sprite component
function ButtonSprite(props: any) {
  const { component, position, config, isSelected, isHighlighted, onSelect } = props;
  const { coordinateToPoint } = require('@/lib/breadboard');
  
  const point = coordinateToPoint({
    row: position.row,
    column: position.column,
    section: 'main-top'
  }, config);

  return (
    <g onClick={onSelect} style={{ cursor: onSelect ? 'pointer' : 'default' }}>
      {(isSelected || isHighlighted) && (
        <rect
          x={point.x - 10}
          y={point.y - 8}
          width={20}
          height={16}
          fill="none"
          stroke={isSelected ? '#ffa500' : '#ffff00'}
          strokeWidth={2}
          rx={2}
          opacity={0.7}
        />
      )}
      
      {/* Button body */}
      <rect
        x={point.x - 8}
        y={point.y - 6}
        width={16}
        height={12}
        fill="#8c8c8c"
        stroke="#666"
        strokeWidth={1}
        rx={2}
      />
      
      {/* Button actuator */}
      <rect
        x={point.x - 4}
        y={point.y - 4}
        width={8}
        height={8}
        fill="#bbb"
        stroke="#999"
        strokeWidth={1}
        rx={1}
      />
      
      <text
        x={point.x}
        y={point.y - 15}
        textAnchor="middle"
        fontSize="8"
        fill="#333"
        fontFamily="monospace"
      >
        {component.ref}
      </text>
    </g>
  );
}

// Potentiometer sprite component
function PotentiometerSprite(props: any) {
  const { component, position, config, isSelected, isHighlighted, onSelect } = props;
  const { coordinateToPoint } = require('@/lib/breadboard');
  
  const point = coordinateToPoint({
    row: position.row,
    column: position.column,
    section: 'main-top'
  }, config);

  return (
    <g onClick={onSelect} style={{ cursor: onSelect ? 'pointer' : 'default' }}>
      {(isSelected || isHighlighted) && (
        <circle
          cx={point.x}
          cy={point.y}
          r={12}
          fill="none"
          stroke={isSelected ? '#ffa500' : '#ffff00'}
          strokeWidth={2}
          opacity={0.7}
        />
      )}
      
      {/* Potentiometer body */}
      <circle
        cx={point.x}
        cy={point.y}
        r={8}
        fill="#4682B4"
        stroke="#2F4F4F"
        strokeWidth={1}
      />
      
      {/* Wiper indicator */}
      <line
        x1={point.x}
        y1={point.y}
        x2={point.x + 6}
        y2={point.y - 2}
        stroke="#fff"
        strokeWidth={2}
        strokeLinecap="round"
      />
      
      <text
        x={point.x}
        y={point.y - 20}
        textAnchor="middle"
        fontSize="8"
        fill="#333"
        fontFamily="monospace"
      >
        {component.ref}
      </text>
    </g>
  );
}

// Power supply sprite component
function PowerSprite(props: any) {
  const { component, position, config, isSelected, isHighlighted, onSelect } = props;
  const { coordinateToPoint } = require('@/lib/breadboard');
  
  const point = coordinateToPoint({
    row: position.row,
    column: position.column,
    section: 'power-top'
  }, config);

  return (
    <g onClick={onSelect} style={{ cursor: onSelect ? 'pointer' : 'default' }}>
      {(isSelected || isHighlighted) && (
        <rect
          x={point.x - 15}
          y={point.y - 10}
          width={30}
          height={20}
          fill="none"
          stroke={isSelected ? '#ffa500' : '#ffff00'}
          strokeWidth={2}
          rx={3}
          opacity={0.7}
        />
      )}
      
      {/* Power supply body */}
      <rect
        x={point.x - 12}
        y={point.y - 8}
        width={24}
        height={16}
        fill="#DC143C"
        stroke="#8B0000"
        strokeWidth={1}
        rx={2}
      />
      
      {/* Voltage label */}
      <text
        x={point.x}
        y={point.y + 2}
        textAnchor="middle"
        fontSize="8"
        fill="#fff"
        fontFamily="monospace"
        fontWeight="bold"
      >
        {component.value || '5V'}
      </text>
      
      <text
        x={point.x}
        y={point.y - 20}
        textAnchor="middle"
        fontSize="8"
        fill="#333"
        fontFamily="monospace"
      >
        {component.ref}
      </text>
    </g>
  );
}

// Generic component fallback
function GenericComponentSprite(props: any) {
  const { component, position, config, isSelected, isHighlighted, onSelect } = props;
  const { coordinateToPoint } = require('@/lib/breadboard');
  
  const point = coordinateToPoint({
    row: position.row,
    column: position.column,
    section: 'main-top'
  }, config);

  return (
    <g onClick={onSelect} style={{ cursor: onSelect ? 'pointer' : 'default' }}>
      {(isSelected || isHighlighted) && (
        <rect
          x={point.x - 8}
          y={point.y - 8}
          width={16}
          height={16}
          fill="none"
          stroke={isSelected ? '#ffa500' : '#ffff00'}
          strokeWidth={2}
          rx={2}
          opacity={0.7}
        />
      )}
      
      {/* Generic component body */}
      <rect
        x={point.x - 6}
        y={point.y - 6}
        width={12}
        height={12}
        fill="#808080"
        stroke="#555"
        strokeWidth={1}
        rx={1}
      />
      
      <text
        x={point.x}
        y={point.y + 2}
        textAnchor="middle"
        fontSize="6"
        fill="#fff"
        fontFamily="monospace"
      >
        {component.kind.charAt(0).toUpperCase()}
      </text>
      
      <text
        x={point.x}
        y={point.y - 15}
        textAnchor="middle"
        fontSize="8"
        fill="#333"
        fontFamily="monospace"
      >
        {component.ref}
      </text>
    </g>
  );
}

export default ComponentSprite;
