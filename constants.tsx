
import React from 'react';
import { LabCategory, Experiment, Apparatus } from './types';

export const EXPERIMENTS: Experiment[] = [
  {
    id: 'moments-2025-alt-b',
    title: 'Principle of Moment',
    category: LabCategory.MECHANICS,
    aim: 'To determine the mass of a meter rule (W) using the principle of moments.',
    apparatus: ['Meter Rule', 'Knife Edge', 'Attached Mass B (100g)', 'Movable Mass A', 'Thread'],
    theory: 'When a meter rule is balanced on a knife edge, the sum of clockwise moments equals the sum of anticlockwise moments. By varying the position of mass A (X), the balance point (Y) changes linearly.',
    formula: 'S = W / (W + 100)',
    variables: {
      x: 'Reciprocal of Distance (X⁻¹)',
      y: 'Ratio Y/X (P)',
      xUnit: 'cm⁻¹',
      yUnit: '',
      columns: [
        { key: 'posX', label: 'Distance X', unit: 'cm' },
        { key: 'x', label: 'Reciprocal X⁻¹', unit: 'cm⁻¹' },
        { key: 'pivotY', label: 'Balance Point Y', unit: 'cm' },
        { key: 'y', label: 'Ratio P (Y/X)', unit: '' },
        { key: 'label', label: 'Observations', unit: 'offset' }
      ]
    }
  },
  {
    id: 'pendulum-01',
    title: 'Simple Pendulum: Determination of g',
    category: LabCategory.MECHANICS,
    aim: 'To determine the acceleration due to gravity (g) using a simple pendulum.',
    apparatus: ['Retort Stand', 'Thread', 'Pendulum Bob', 'Stopwatch', 'Meter Rule'],
    theory: 'The period T of a simple pendulum is given by T = 2π√(L/g). Squaring both sides gives T² = (4π²/g)L.',
    formula: 'T = 2π√(L/g)',
    variables: {
      x: 'Length (L)',
      y: 'Period Squared (T²)',
      xUnit: 'm',
      yUnit: 's²',
      columns: [
        { key: 'x', label: 'Length L', unit: 'm' },
        { key: 'time', label: 'Time t', unit: 's' },
        { key: 'y', label: 'Period T²', unit: 's²' },
        { key: 'label', label: 'Trials', unit: 'osc' }
      ]
    }
  },
  {
    id: 'ohms-01',
    title: "Ohm's Law Verification",
    category: LabCategory.ELECTRICITY,
    aim: "To verify Ohm's law and determine the resistance of a given wire.",
    apparatus: ['Ammeter', 'Voltmeter', 'Rheostat', 'DC Power Source', 'Connecting Wires'],
    theory: "V = IR. A plot of V against I should be a straight line passing through the origin with slope R.",
    formula: 'V = IR',
    variables: {
      x: 'Current (I)',
      y: 'Voltage (V)',
      xUnit: 'A',
      yUnit: 'V',
      columns: [
        { key: 'x', label: 'Current I', unit: 'A' },
        { key: 'y', label: 'Voltage V', unit: 'V' },
        { key: 'resistance', label: 'R (V/I)', unit: 'Ω' }
      ]
    }
  }
];

export const APPARATUS_LIST: Apparatus[] = [
  { id: 'meter-rule', name: 'Meter Rule', category: LabCategory.MECHANICS, icon: '📏' },
  { id: 'knife-edge', name: 'Knife Edge', category: LabCategory.MECHANICS, icon: '📐' },
  { id: 'mass-set', name: 'Standard Masses', category: LabCategory.MECHANICS, icon: '⚖️' },
  { id: 'retort-stand', name: 'Retort Stand', category: LabCategory.MECHANICS, icon: '📍' },
  { id: 'bob', name: 'Pendulum Bob', category: LabCategory.MECHANICS, icon: '🌑' },
  { id: 'stopwatch', name: 'Stopwatch', category: LabCategory.MECHANICS, icon: '⏱️' },
  { id: 'ammeter', name: 'Ammeter', category: LabCategory.ELECTRICITY, icon: '📟' },
  { id: 'voltmeter', name: 'Voltmeter', category: LabCategory.ELECTRICITY, icon: '📟' },
  { id: 'lens-convex', name: 'Convex Lens', category: LabCategory.LIGHT, icon: '🔍' },
  { id: 'glass-block', name: 'Glass Block', category: LabCategory.LIGHT, icon: '🧊' }
];
