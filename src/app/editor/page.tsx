'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCircuitStore } from '@/lib/store';
import { validateCircuit, type Circuit, type Component } from '@/lib/schema';
import BreadboardSVG from '@/components/breadboard/BreadboardSVG';
import { ComponentSprite } from '@/components/parts/ComponentSprite';
import { LibraryPanel } from '@/components/panels/LibraryPanel';
import { autoPlaceComponents, placeSingleComponent } from '@/lib/placement';
import { pointToCoordinate } from '@/lib/breadboard';
import { createComponentFromTemplate, generateRefDesignator, getPartById, type PartTemplate } from '@/lib/parts-library';
import ledCircuitData from '@/data/seeds/led-circuit.json';
import blinkerCircuitData from '@/data/seeds/555-blinker.json';

function EditorContent() {
  const searchParams = useSearchParams();
  const {
    circuit,
    selectedComponent,
    placements,
    setCircuit,
    setPlacement,
    addComponent,
    selectComponent,
    moveComponent,
    pushToHistory,
    generateBOM,
    runDRC
  } = useCircuitStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moveMode, setMoveMode] = useState<string | null>(null); // componentId being moved

  useEffect(() => {
    const loadExampleCircuit = async () => {
      try {
        setIsLoading(true);
        
        const example = searchParams.get('example');
        
        // Simple fallback circuit for testing
        const simpleFallback = {
          id: 'simple-test',
          name: 'Simple Test Circuit',
          description: 'Basic circuit for testing',
          components: [
            {
              id: 'led1',
              ref: 'LED1',
              kind: 'led' as const,
              value: 'red',
              footprint: 'led5mm' as const,
              pins: [
                { id: 'led1-anode', name: 'anode', type: 'io' as const },
                { id: 'led1-cathode', name: 'cathode', type: 'io' as const }
              ],
              pinMap: { anode: '1', cathode: '2' },
              orientation: 'north' as const
            }
          ],
          nets: [
            {
              id: 'test-net',
              name: 'TEST',
              nodes: [
                { compId: 'led1', pin: 'anode' }
              ]
            }
          ],
          board: {
            kind: 'full' as const,
            columns: 63
          }
        };
        
        let circuitData: any;
        
        try {
          switch (example) {
            case 'led-circuit':
              circuitData = ledCircuitData;
              break;
            case '555-blinker':
              circuitData = blinkerCircuitData;
              break;
            default:
              // Default to LED circuit for demo
              circuitData = ledCircuitData;
              break;
          }

          // Transform and validate circuit data
          const transformedData = {
            ...circuitData,
            metadata: circuitData.metadata ? {
              ...circuitData.metadata,
              created: new Date(circuitData.metadata.created),
              modified: new Date(circuitData.metadata.modified),
            } : undefined
          };
          
          console.log('Attempting to validate circuit:', transformedData);
          const validatedCircuit = validateCircuit(transformedData);
          setCircuit(validatedCircuit);
        } catch (validationError) {
          console.warn('Seed circuit validation failed, using fallback:', validationError);
          // Try the simple fallback
          const validatedCircuit = validateCircuit(simpleFallback);
          setCircuit(validatedCircuit);
        }
        
        // Generate initial BOM and run DRC
        await generateBOM();
        await runDRC();
        
      } catch (err) {
        console.error('Failed to load circuit:', err);
        if (err instanceof Error) {
          setError(`Failed to load circuit: ${err.message}`);
        } else {
          setError('Failed to load circuit data. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadExampleCircuit();
  }, [searchParams, setCircuit, generateBOM, runDRC]);

  // Auto-place components when circuit is loaded
  useEffect(() => {
    console.log('🔄 Auto-placement useEffect:', { 
      hasCircuit: !!circuit, 
      componentCount: circuit?.components.length || 0, 
      placementCount: placements.length 
    });
    
    if (circuit && circuit.components.length > 0 && placements.length === 0) {
      console.log('🔄 Running auto-placement for components:', circuit.components);
      const newPlacements = autoPlaceComponents(circuit.components, circuit.board);
      console.log('🔄 Generated placements:', newPlacements);
      setPlacement(newPlacements);
    }
  }, [circuit, placements.length, setPlacement]);

  // Auto-route handler
  const handleAutoRoute = async () => {
    if (!circuit) return;
    
    // Re-run auto-placement
    const newPlacements = autoPlaceComponents(circuit.components, circuit.board);
    setPlacement(newPlacements);
  };

  // Handle entering move mode
  const handleStartMove = (componentId: string) => {
    console.log('🟨 handleStartMove called:', componentId);
    setMoveMode(componentId);
    selectComponent(componentId);
  };

  // Handle canceling move mode
  const handleCancelMove = () => {
    setMoveMode(null);
  };

  // Handle component placement/move
  const handleBreadboardClick = (coord: { row: number; column: number; section: string }) => {
    console.log('🟦 handleBreadboardClick called:', { coord, moveMode });
    if (moveMode && circuit) {
      console.log('🟩 Moving component:', moveMode, 'to position:', coord);
      // Move the component to the clicked position
      pushToHistory();
      moveComponent(moveMode, coord.row, coord.column, coord.section);
      setMoveMode(null);
    }
  };


  // Drag and drop handlers
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    
    try {
      const data = JSON.parse(event.dataTransfer.getData('application/json'));
      
      if (data.type === 'component-template') {
        // Handle dropping a new component from library
        const template: PartTemplate = data.template;
        
        if (!circuit) return;
        
        // Generate unique ID and reference designator
        const componentId = `${template.id}-${Date.now()}`;
        const existingRefs = circuit.components.map(c => c.ref);
        const refDesignator = generateRefDesignator(template.component.kind, existingRefs);
        
        // Create component instance
        const newComponent = createComponentFromTemplate(template, componentId, refDesignator);
        
        // Get drop position on breadboard
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Convert to breadboard coordinates (simplified)
        const coord = pointToCoordinate({ x, y }, circuit.board);
        
        // Add component and place it
        pushToHistory();
        addComponent(newComponent);
        
        // Try to place at dropped position
        const newPlacement = placeSingleComponent(
          newComponent,
          circuit.board,
          placements,
          coord.row,
          coord.column,
          coord.section
        );
        
        if (newPlacement) {
          setPlacement([...placements, newPlacement]);
        }
      }
      
    } catch (err) {
      console.error('Failed to handle drop:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading circuit...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Circuit</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!circuit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No circuit loaded</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">
              {circuit.name}
            </h1>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleAutoRoute}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                title="Auto-place all components"
              >
                Auto Route
              </button>
              <button className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                Generate Steps
              </button>
              <button className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-700">
                Export PDF
              </button>
            </div>
          </div>
          {circuit.description && (
            <p className="text-sm text-gray-600 mt-1">{circuit.description}</p>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex gap-6 p-6">
        {/* Left Panel - Parts Library */}
        <div className="w-80 flex-shrink-0">
          <LibraryPanel className="h-full" />
        </div>

        {/* Center - Breadboard */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Breadboard View</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Components: {circuit.components.length}</span>
                <span>Nets: {circuit.nets.length}</span>
                <span>Board: {circuit.board.kind} ({circuit.board.columns} columns)</span>
              </div>
            </div>
            
            {/* Breadboard SVG Container */}
            <div 
              className="bg-gray-100 rounded-lg p-4 relative" 
              style={{ minHeight: '400px' }}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {moveMode ? (
                <div className="absolute top-2 left-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded z-10 flex items-center gap-2">
                  🔄 Click where you want to move the component
                  <button 
                    onClick={handleCancelMove}
                    className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="absolute top-2 left-2 text-xs text-gray-500 bg-white px-2 py-1 rounded z-10">
                  💡 Drag components from library or click Auto Route
                </div>
              )}
              
              <BreadboardSVG
                config={circuit.board}
                showGrid={true}
                showLabels={true}
                className="w-full h-full"
                onCoordinateClick={handleBreadboardClick}
              >
                {/* Render placed components */}
                {placements.map((placement) => {
                  const component = circuit.components.find(c => c.id === placement.componentId);
                  if (!component) return null;
                  
                  return (
                    <ComponentSprite
                      key={component.id}
                      component={component}
                      placement={placement}
                      config={circuit.board}
                      isSelected={selectedComponent === component.id}
                      onSelect={() => selectComponent(component.id)}
                    />
                  );
                })}
              </BreadboardSVG>
            </div>
          </div>
        </div>
        
        {/* Right Panel - Circuit Info */}
        <div className="w-80 flex-shrink-0 space-y-6">
          {/* Debug Info */}
          <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-3 text-xs">
            <h4 className="font-semibold text-yellow-800">Debug Info</h4>
            <p>Components: {circuit.components.length}</p>
            <p>Placements: {placements.length}</p>
            <p>Move Mode: {moveMode || 'None'}</p>
            <p>Selected: {selectedComponent || 'None'}</p>
          </div>

          {/* Component List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Components ({circuit.components.length})</h3>
            </div>
            <div className="p-4 max-h-60 overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                {circuit.components.map((component) => {
                  const isPlaced = placements.some(p => p.componentId === component.id);
                  return (
                    <div
                      key={component.id}
                      className={`border rounded-lg p-3 transition-colors ${
                        selectedComponent === component.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => selectComponent(component.id)}
                        >
                          <h4 className="font-medium text-gray-900 text-sm">{component.ref}</h4>
                          <p className="text-xs text-gray-600 capitalize">{component.kind}</p>
                          {component.value && (
                            <p className="text-xs text-blue-600">{component.value}</p>
                          )}
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                          <div className={`text-xs px-2 py-1 rounded ${
                            isPlaced ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {isPlaced ? 'Placed' : 'Unplaced'}
                          </div>
                          <p className="text-xs text-gray-500">{component.pins.length} pins</p>
                          {isPlaced && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartMove(component.id);
                              }}
                              className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                              disabled={moveMode === component.id}
                            >
                              {moveMode === component.id ? 'Moving...' : 'Move'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Nets List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Nets ({circuit.nets.length})</h3>
            </div>
            <div className="p-4 max-h-40 overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                {circuit.nets.map((net) => (
                  <div
                    key={net.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: net.color || '#333' }}
                      />
                      <span className="text-sm font-medium text-gray-900">{net.name}</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {net.nodes.length} node{net.nodes.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>
    }>
      <EditorContent />
    </Suspense>
  );
}
