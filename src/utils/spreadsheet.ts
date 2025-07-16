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
    case 'number': {
      const num = Number(value);
      return isNaN(num) ? value : num.toLocaleString();
    }
    case 'date': {
      const date = new Date(value);
      return isNaN(date.getTime()) ? value : date.toLocaleDateString();
    }
    case 'boolean': {
      const lower = value.toLowerCase();
      if (['true', '1', 'yes'].includes(lower)) return 'TRUE';
      if (['false', '0', 'no'].includes(lower)) return 'FALSE';
      return value;
    }
    default:
      return value;
  }
}

export function inferDataType(value: string): CellDataType {
  if (value.startsWith('=')) return 'formula';
  if (!isNaN(Number(value)) && value.trim() !== '' && !isNaN(parseFloat(value))) return 'number';
  if (!isNaN(Date.parse(value)) && (value.includes('/') || value.includes('-') || value.includes('.'))) return 'date';
  if (['true', 'false', '1', '0', 'yes', 'no'].includes(value.toLowerCase())) return 'boolean';
  return 'text';
}

export function evaluateFormula(formula: string, data: Record<string, any>): string {
  try {
    // Simple formula evaluation for basic operations
    if (!formula.startsWith('=')) return formula;
    
    let expression = formula.substring(1);
    
    // Replace cell references with values
    expression = expression.replace(/[A-Z]+\d+/g, (cellRef) => {
      const cellData = data[cellRef];
      return cellData?.value || '0';
    });
    
    // Handle basic functions
    expression = expression.replace(/SUM\(([^)]+)\)/g, (match, range) => {
      const values = range.split(',').map((v: string) => parseFloat(v.trim()) || 0);
      return values.reduce((sum: number, val: number) => sum + val, 0).toString();
    });
    
    expression = expression.replace(/AVERAGE\(([^)]+)\)/g, (match, range) => {
      const values = range.split(',').map((v: string) => parseFloat(v.trim()) || 0);
      const sum = values.reduce((sum: number, val: number) => sum + val, 0);
      return (sum / values.length).toString();
    });
    
    // Basic arithmetic evaluation (simplified)
    try {
      // Only allow basic math operations for security
      if (/^[\d+\-*/().\s]+$/.test(expression)) {
        return eval(expression).toString();
      }
    } catch {
      return '#ERROR!';
    }
    
    return expression;
  } catch {
    return '#ERROR!';
  }
}