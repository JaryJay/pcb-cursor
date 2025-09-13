import type { Component } from './schema';

export interface PartTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  component: Omit<Component, 'id' | 'ref'>;
  icon?: string;
}

export const PARTS_LIBRARY: PartTemplate[] = [
  // Resistors
  {
    id: 'resistor-220',
    name: '220Ω Resistor',
    description: 'Standard carbon film resistor, 5% tolerance, 1/4W',
    category: 'Resistors',
    component: {
      kind: 'resistor',
      value: '220Ω',
      footprint: 'axial',
      pins: [
        { id: 'pin1', name: 'pin1', type: 'io' },
        { id: 'pin2', name: 'pin2', type: 'io' }
      ],
      pinMap: { pin1: '1', pin2: '2' },
      orientation: 'north',
      properties: { tolerance: '5%', power: '0.25W' }
    }
  },
  {
    id: 'resistor-1k',
    name: '1kΩ Resistor', 
    description: 'Standard carbon film resistor, 5% tolerance, 1/4W',
    category: 'Resistors',
    component: {
      kind: 'resistor',
      value: '1kΩ',
      footprint: 'axial',
      pins: [
        { id: 'pin1', name: 'pin1', type: 'io' },
        { id: 'pin2', name: 'pin2', type: 'io' }
      ],
      pinMap: { pin1: '1', pin2: '2' },
      orientation: 'north',
      properties: { tolerance: '5%', power: '0.25W' }
    }
  },
  {
    id: 'resistor-10k',
    name: '10kΩ Resistor',
    description: 'Standard carbon film resistor, 5% tolerance, 1/4W',
    category: 'Resistors',
    component: {
      kind: 'resistor',
      value: '10kΩ',
      footprint: 'axial',
      pins: [
        { id: 'pin1', name: 'pin1', type: 'io' },
        { id: 'pin2', name: 'pin2', type: 'io' }
      ],
      pinMap: { pin1: '1', pin2: '2' },
      orientation: 'north',
      properties: { tolerance: '5%', power: '0.25W' }
    }
  },
  {
    id: 'resistor-470k',
    name: '470kΩ Resistor',
    description: 'Standard carbon film resistor, 5% tolerance, 1/4W',
    category: 'Resistors',
    component: {
      kind: 'resistor',
      value: '470kΩ',
      footprint: 'axial',
      pins: [
        { id: 'pin1', name: 'pin1', type: 'io' },
        { id: 'pin2', name: 'pin2', type: 'io' }
      ],
      pinMap: { pin1: '1', pin2: '2' },
      orientation: 'north',
      properties: { tolerance: '5%', power: '0.25W' }
    }
  },

  // LEDs
  {
    id: 'led-red',
    name: 'Red LED',
    description: '5mm red LED, 2.0V forward voltage, 20mA',
    category: 'LEDs',
    component: {
      kind: 'led',
      value: 'red',
      footprint: 'led5mm',
      pins: [
        { id: 'anode', name: 'anode', type: 'io' },
        { id: 'cathode', name: 'cathode', type: 'io' }
      ],
      pinMap: { anode: '1', cathode: '2' },
      orientation: 'north',
      properties: { color: 'red', voltage_drop: '2.0V', current: '20mA' }
    }
  },
  {
    id: 'led-green',
    name: 'Green LED',
    description: '5mm green LED, 2.1V forward voltage, 20mA',
    category: 'LEDs',
    component: {
      kind: 'led',
      value: 'green',
      footprint: 'led5mm',
      pins: [
        { id: 'anode', name: 'anode', type: 'io' },
        { id: 'cathode', name: 'cathode', type: 'io' }
      ],
      pinMap: { anode: '1', cathode: '2' },
      orientation: 'north',
      properties: { color: 'green', voltage_drop: '2.1V', current: '20mA' }
    }
  },
  {
    id: 'led-blue',
    name: 'Blue LED',
    description: '5mm blue LED, 3.2V forward voltage, 20mA',
    category: 'LEDs',
    component: {
      kind: 'led',
      value: 'blue',
      footprint: 'led5mm',
      pins: [
        { id: 'anode', name: 'anode', type: 'io' },
        { id: 'cathode', name: 'cathode', type: 'io' }
      ],
      pinMap: { anode: '1', cathode: '2' },
      orientation: 'north',
      properties: { color: 'blue', voltage_drop: '3.2V', current: '20mA' }
    }
  },

  // Integrated Circuits
  {
    id: 'ic-555',
    name: 'NE555 Timer',
    description: '555 Timer IC in DIP-8 package',
    category: 'ICs',
    component: {
      kind: 'ic',
      value: 'NE555',
      footprint: 'dip',
      pins: [
        { id: 'gnd', name: 'GND', type: 'ground' },
        { id: 'trig', name: 'TRIG', type: 'io' },
        { id: 'out', name: 'OUT', type: 'io' },
        { id: 'reset', name: 'RESET', type: 'io' },
        { id: 'ctrl', name: 'CTRL', type: 'io' },
        { id: 'thr', name: 'THR', type: 'io' },
        { id: 'dis', name: 'DIS', type: 'io' },
        { id: 'vcc', name: 'VCC', type: 'power' }
      ],
      pinMap: {
        GND: '1', TRIG: '2', OUT: '3', RESET: '4',
        CTRL: '5', THR: '6', DIS: '7', VCC: '8'
      },
      orientation: 'north',
      properties: { package: 'DIP-8', description: '555 Timer IC' }
    }
  },

  // Capacitors
  {
    id: 'cap-ceramic-100nf',
    name: '100nF Ceramic Capacitor',
    description: 'Multi-layer ceramic capacitor, 50V',
    category: 'Capacitors',
    component: {
      kind: 'capacitor',
      value: '100nF',
      footprint: 'axial',
      pins: [
        { id: 'pin1', name: 'pin1', type: 'io' },
        { id: 'pin2', name: 'pin2', type: 'io' }
      ],
      pinMap: { pin1: '1', pin2: '2' },
      orientation: 'north',
      properties: { voltage: '50V', type: 'ceramic' }
    }
  },
  {
    id: 'cap-electrolytic-10uf',
    name: '10µF Electrolytic Capacitor',
    description: 'Polarized electrolytic capacitor, 25V',
    category: 'Capacitors',
    component: {
      kind: 'capacitor',
      value: '10µF',
      footprint: 'radial',
      pins: [
        { id: 'positive', name: 'positive', type: 'io' },
        { id: 'negative', name: 'negative', type: 'io' }
      ],
      pinMap: { positive: '1', negative: '2' },
      orientation: 'north',
      properties: { voltage: '25V', type: 'electrolytic' }
    }
  },

  // Transistors
  {
    id: 'transistor-2n3904',
    name: '2N3904 NPN Transistor',
    description: 'General purpose NPN bipolar junction transistor',
    category: 'Transistors',
    component: {
      kind: 'transistor',
      value: '2N3904',
      footprint: 'to92',
      pins: [
        { id: 'emitter', name: 'emitter', type: 'io' },
        { id: 'base', name: 'base', type: 'io' },
        { id: 'collector', name: 'collector', type: 'io' }
      ],
      pinMap: { emitter: '1', base: '2', collector: '3' },
      orientation: 'north',
      properties: { type: 'NPN', package: 'TO-92' }
    }
  },

  // Switches/Buttons
  {
    id: 'button-tactile',
    name: 'Tactile Push Button',
    description: '12mm tactile push button switch',
    category: 'Switches',
    component: {
      kind: 'button',
      value: 'SPST',
      footprint: 'button',
      pins: [
        { id: 'pin1', name: 'pin1', type: 'io' },
        { id: 'pin2', name: 'pin2', type: 'io' },
        { id: 'pin3', name: 'pin3', type: 'io' },
        { id: 'pin4', name: 'pin4', type: 'io' }
      ],
      pinMap: { pin1: '1', pin2: '2', pin3: '3', pin4: '4' },
      orientation: 'north',
      properties: { type: 'momentary', actuation_force: '160gf' }
    }
  },

  // Potentiometers
  {
    id: 'pot-10k',
    name: '10kΩ Potentiometer',
    description: 'Linear taper potentiometer, 10kΩ',
    category: 'Variable',
    component: {
      kind: 'pot',
      value: '10kΩ',
      footprint: 'pot',
      pins: [
        { id: 'pin1', name: 'pin1', type: 'io' },
        { id: 'wiper', name: 'wiper', type: 'io' },
        { id: 'pin3', name: 'pin3', type: 'io' }
      ],
      pinMap: { pin1: '1', wiper: '2', pin3: '3' },
      orientation: 'north',
      properties: { taper: 'linear', power: '0.125W' }
    }
  },

  // Power supplies
  {
    id: 'power-5v',
    name: '5V Power Supply',
    description: '5V DC power supply',
    category: 'Power',
    component: {
      kind: 'power',
      value: '5V',
      footprint: 'power',
      pins: [
        { id: 'positive', name: 'positive', type: 'power' },
        { id: 'negative', name: 'negative', type: 'ground' }
      ],
      pinMap: { positive: '1', negative: '2' },
      orientation: 'north',
      properties: { voltage: '5V', type: 'DC' }
    }
  },
  {
    id: 'power-9v',
    name: '9V Battery',
    description: '9V DC battery',
    category: 'Power',
    component: {
      kind: 'power',
      value: '9V',
      footprint: 'power',
      pins: [
        { id: 'positive', name: 'positive', type: 'power' },
        { id: 'negative', name: 'negative', type: 'ground' }
      ],
      pinMap: { positive: '1', negative: '2' },
      orientation: 'north',
      properties: { voltage: '9V', type: 'battery' }
    }
  }
];

// Utility functions
export function getPartsByCategory(category?: string): PartTemplate[] {
  if (!category) return PARTS_LIBRARY;
  return PARTS_LIBRARY.filter(part => part.category === category);
}

export function getCategories(): string[] {
  const categories = new Set(PARTS_LIBRARY.map(part => part.category));
  return Array.from(categories).sort();
}

export function getPartById(id: string): PartTemplate | undefined {
  return PARTS_LIBRARY.find(part => part.id === id);
}

export function searchParts(query: string): PartTemplate[] {
  const lowerQuery = query.toLowerCase();
  return PARTS_LIBRARY.filter(part =>
    part.name.toLowerCase().includes(lowerQuery) ||
    part.description.toLowerCase().includes(lowerQuery) ||
    part.component.value?.toLowerCase().includes(lowerQuery) ||
    part.category.toLowerCase().includes(lowerQuery)
  );
}

// Generate a component instance from a template
export function createComponentFromTemplate(
  template: PartTemplate,
  instanceId: string,
  refDesignator: string
): Component {
  return {
    id: instanceId,
    ref: refDesignator,
    ...template.component,
    pins: template.component.pins.map(pin => ({
      ...pin,
      id: `${instanceId}-${pin.id}`
    }))
  };
}

// Auto-generate reference designators
export function generateRefDesignator(kind: Component['kind'], existingRefs: string[]): string {
  const prefixes: Record<Component['kind'], string> = {
    resistor: 'R',
    led: 'LED',
    ic: 'U',
    capacitor: 'C',
    transistor: 'Q',
    jumper: 'W',
    pot: 'RV',
    button: 'SW',
    power: 'PS'
  };

  const prefix = prefixes[kind] || 'X';
  let counter = 1;
  let ref: string;

  do {
    ref = `${prefix}${counter}`;
    counter++;
  } while (existingRefs.includes(ref));

  return ref;
}
