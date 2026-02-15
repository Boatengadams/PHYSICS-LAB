
export enum LabCategory {
  MECHANICS = 'Mechanics',
  LIGHT = 'Optics',
  ELECTRICITY = 'Electricity'
}

export interface Apparatus {
  id: string;
  name: string;
  category: LabCategory;
  icon: string;
}

export interface ExperimentDataPoint {
  id: string;
  [key: string]: any; // Support for dynamic columns
}

export interface TableColumn {
  key: string;
  label: string;
  unit?: string;
}

export interface Experiment {
  id: string;
  title: string;
  category: LabCategory;
  aim: string;
  apparatus: string[];
  theory: string;
  formula: string;
  variables: {
    x: string;
    y: string;
    xUnit: string;
    yUnit: string;
    columns?: TableColumn[]; // Explicit column definitions
  };
}

export interface LabState {
  currentExperiment: Experiment | null;
  dataPoints: ExperimentDataPoint[];
  environmentalSettings: {
    gravity: number;
    airResistance: number;
    realLabMode: boolean;
  };
}
