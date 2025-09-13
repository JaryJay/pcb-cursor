'use client';

import React, { useState } from 'react';
import { Search, Package } from 'lucide-react';
import { 
  PARTS_LIBRARY, 
  getCategories, 
  getPartsByCategory, 
  searchParts,
  createComponentFromTemplate,
  generateRefDesignator,
  type PartTemplate 
} from '@/lib/parts-library';
import { useCircuitStore } from '@/lib/store';

interface LibraryPanelProps {
  className?: string;
}

export function LibraryPanel({ className = '' }: LibraryPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { circuit, addComponent, pushToHistory } = useCircuitStore();

  const categories = getCategories();
  const filteredParts = searchQuery
    ? searchParts(searchQuery)
    : getPartsByCategory(selectedCategory);

  const handleDragStart = (event: React.DragEvent, template: PartTemplate) => {
    event.dataTransfer.setData('application/json', JSON.stringify({
      type: 'component-template',
      template: template
    }));
    event.dataTransfer.effectAllowed = 'copy';
  };

  const handleAddComponent = (template: PartTemplate) => {
    if (!circuit) return;

    // Generate unique ID and reference designator
    const componentId = `${template.id}-${Date.now()}`;
    const existingRefs = circuit.components.map(c => c.ref);
    const refDesignator = generateRefDesignator(template.component.kind, existingRefs);

    // Create component instance
    const newComponent = createComponentFromTemplate(template, componentId, refDesignator);

    // Add to history and circuit
    pushToHistory();
    addComponent(newComponent);
  };

  return (
    <div className={`panel ${className}`}>
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          <h3 className="font-semibold">Parts Library</h3>
        </div>
      </div>

      <div className="panel-content">
        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search parts..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Categories */}
        {!searchQuery && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedCategory === '' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    selectedCategory === category 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Parts Grid */}
        <div className="parts-grid">
          {filteredParts.map((template) => (
            <div
              key={template.id}
              className="part-card group"
              draggable
              onDragStart={(e) => handleDragStart(e, template)}
              onClick={() => handleAddComponent(template)}
              title={`${template.description}\nClick to add or drag to breadboard`}
            >
              <div className="flex flex-col items-center text-center">
                {/* Component Icon/Preview */}
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-2 group-hover:bg-blue-100">
                  <ComponentIcon kind={template.component.kind} />
                </div>
                
                {/* Component Info */}
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900 leading-tight">
                    {template.name}
                  </p>
                  {template.component.value && (
                    <p className="text-xs text-blue-600">
                      {template.component.value}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    {template.component.pins.length} pins
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredParts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No parts found</p>
            {searchQuery && (
              <p className="text-sm mt-1">Try a different search term</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Component icon helper
function ComponentIcon({ kind }: { kind: string }) {
  const iconMap: Record<string, string> = {
    resistor: '⚡',
    led: '💡',
    ic: '🔲',
    capacitor: '⚡',
    transistor: '🔺',
    button: '⭕',
    pot: '🎛️',
    power: '🔋',
    jumper: '━'
  };

  return (
    <span className="text-2xl">
      {iconMap[kind] || '📦'}
    </span>
  );
}
