import { CellPosition, CellDataType } from '../types/spreadsheet';

export function getCellId(row: number, col: number): string {
  return `${getColumnLabel(col)}${row + 1}`;
}

export function getColumnLabel(col: number): string {
  let result = '';
  while (col >= 0) {
    result = String.fromCharCode(65 + (col % 26)) + result;
    col = Math.floor(col / 26) - 1;
  }
  return result;
}

export function parseCellId(cellId: string): CellPosition {
  const match = cellId.match(/^([A-Z]+)(\d+)$/);
  if (!match) throw new Error(`Invalid cell ID: ${cellId}`);
  
  const [, colStr, rowStr] = match;
  const col = parseColumnLabel(colStr);
  const row = parseInt(rowStr, 10) - 1;
  
  return { row, col };
}

export function parseColumnLabel(label: string): number {
  let result = 0;
  for (let i = 0; i < label.length; i++) {
    result = result * 26 + (label.charCodeAt(i) - 64);
  }
  return result - 1;
}

export function validateCellValue(value: string, type: CellDataType): boolean {
  switch (type) {
    case 'number':
      return !isNaN(Number(value)) && value.trim() !== '';
    case 'date':
      return !isNaN(Date.parse(value));
    case 'boolean':
      return ['true', 'false', '1', '0', 'yes', 'no'].includes(value.toLowerCase());
    case 'formula':
      return value.startsWith('=');
    case 'text':
    default:
      return true;
  }
}

export function formatCellValue(value: string, type: CellDataType): string {
  switch (type) {
    case 'number':
      const num = Number(value);
      return isNaN(num) ? value : num.toLocaleString();
    case 'date':
      const date = new Date(value);
      return isNaN(date.getTime()) ? value : date.toLocaleDateString();
    case 'boolean':
      const lower = value.toLowerCase();
      if (['true', '1', 'yes'].includes(lower)) return 'TRUE';
      if (['false', '0', 'no'].includes(lower)) return 'FALSE';
      return value;
    default:
      return value;
  }
}

export function inferDataType(value: string): CellDataType {
  if (value.startsWith('=')) return 'formula';
  if (!isNaN(Number(value)) && value.trim() !== '') return 'number';
  if (!isNaN(Date.parse(value)) && value.includes('/') || value.includes('-')) return 'date';
  if (['true', 'false', '1', '0', 'yes', 'no'].includes(value.toLowerCase())) return 'boolean';
  return 'text';
}