'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCircuitStore } from '@/lib/store';
import { validateCircuit, type Circuit } from '@/lib/schema';
import BreadboardSVG from '@/components/breadboard/BreadboardSVG';
import { ComponentSprite } from '@/components/parts/ComponentSprite';
import ledCircuitData from '@/data/seeds/led-circuit.json';
import blinkerCircuitData from '@/data/seeds/555-blinker.json';

function EditorContent() {
  const searchParams = useSearchParams();
  const { circuit, setCircuit, generateBOM, runDRC } = useCircuitStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
              <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
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
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
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
            <div className="bg-gray-100 rounded-lg p-4" style={{ minHeight: '400px' }}>
              <BreadboardSVG
                config={circuit.board}
                showGrid={true}
                showLabels={true}
                className="w-full h-full"
              >
                {/* Render components when placement is available */}
                {circuit.components.map((component) => {
                  // For now, just render a simple placeholder
                  // In full implementation, this would use actual placement data
                  return (
                    <g key={component.id}>
                      <text
                        x={50}
                        y={50}
                        fontSize="12"
                        fill="#666"
                        textAnchor="middle"
                      >
                        {component.ref}: {component.value || component.kind}
                      </text>
                    </g>
                  );
                })}
              </BreadboardSVG>
            </div>
          </div>

          {/* Component List */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Components</h3>
            </div>
            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {circuit.components.map((component) => (
                  <div
                    key={component.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{component.ref}</h4>
                        <p className="text-sm text-gray-600 capitalize">{component.kind}</p>
                        {component.value && (
                          <p className="text-sm text-blue-600">{component.value}</p>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {component.pins.length} pins
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Nets List */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Nets</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {circuit.nets.map((net) => (
                  <div
                    key={net.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: net.color || '#333' }}
                      />
                      <span className="font-medium text-gray-900">{net.name}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {net.nodes.length} connection{net.nodes.length !== 1 ? 's' : ''}
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
