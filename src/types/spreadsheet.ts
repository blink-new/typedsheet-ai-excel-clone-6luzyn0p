export type CellDataType = 'text' | 'number' | 'date' | 'boolean' | 'formula';

export interface CellData {
  value: string;
  type: CellDataType;
  formula?: string;
  formatted?: string;
}

export interface ColumnDefinition {
  id: string;
  name: string;
  type: CellDataType;
  width: number;
}

export interface SpreadsheetData {
  [cellId: string]: CellData;
}

export interface CellPosition {
  row: number;
  col: number;
}

export interface CellRange {
  start: CellPosition;
  end: CellPosition;
}

export interface AICompletion {
  suggestion: string;
  confidence: number;
  type: 'value' | 'formula' | 'pattern';
}