import { useState, useCallback, useRef, useEffect } from 'react';
import { CellPosition, SpreadsheetData, CellData, CellDataType } from '../types/spreadsheet';
import { getCellId, getColumnLabel, formatCellValue, inferDataType, validateCellValue } from '../utils/spreadsheet';
import { Badge } from './ui/badge';

interface SpreadsheetGridProps {
  data: SpreadsheetData;
  onCellChange: (cellId: string, cellData: CellData) => void;
  selectedCell: CellPosition | null;
  onCellSelect: (position: CellPosition) => void;
  onStartEdit: (cellId: string, value: string) => void;
}

const ROWS = 100;
const COLS = 26;
const ROW_HEIGHT = 24;
const COL_WIDTH = 100;

export function SpreadsheetGrid({ 
  data, 
  onCellChange, 
  selectedCell, 
  onCellSelect, 
  onStartEdit 
}: SpreadsheetGridProps) {
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const gridRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCellClick = useCallback((row: number, col: number) => {
    onCellSelect({ row, col });
    setEditingCell(null);
  }, [onCellSelect]);

  const handleCellDoubleClick = useCallback((row: number, col: number) => {
    const cellId = getCellId(row, col);
    const cellData = data[cellId];
    const value = cellData?.value || '';
    setEditingCell(cellId);
    setEditValue(value);
    onStartEdit(cellId, value);
  }, [data, onStartEdit]);

  const handleEditConfirm = useCallback(() => {
    if (!editingCell) return;
    
    const inferredType = inferDataType(editValue);
    const isValid = validateCellValue(editValue, inferredType);
    
    if (isValid) {
      const cellData: CellData = {
        value: editValue,
        type: inferredType,
        formatted: formatCellValue(editValue, inferredType)
      };
      
      if (inferredType === 'formula') {
        cellData.formula = editValue;
      }
      
      onCellChange(editingCell, cellData);
    }
    
    setEditingCell(null);
    setEditValue('');
  }, [editingCell, editValue, onCellChange]);

  const handleEditCancel = useCallback(() => {
    setEditingCell(null);
    setEditValue('');
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!selectedCell) return;

    switch (e.key) {
      case 'Enter':
        if (editingCell) {
          handleEditConfirm();
        } else {
          const newRow = Math.min(selectedCell.row + 1, ROWS - 1);
          onCellSelect({ row: newRow, col: selectedCell.col });
        }
        break;
      case 'Tab':
        e.preventDefault();
        if (editingCell) {
          handleEditConfirm();
        }
        const newCol = Math.min(selectedCell.col + 1, COLS - 1);
        onCellSelect({ row: selectedCell.row, col: newCol });
        break;
      case 'Escape':
        if (editingCell) {
          handleEditCancel();
        }
        break;
      case 'ArrowUp':
        if (!editingCell) {
          e.preventDefault();
          const newRow = Math.max(selectedCell.row - 1, 0);
          onCellSelect({ row: newRow, col: selectedCell.col });
        }
        break;
      case 'ArrowDown':
        if (!editingCell) {
          e.preventDefault();
          const newRow = Math.min(selectedCell.row + 1, ROWS - 1);
          onCellSelect({ row: newRow, col: selectedCell.col });
        }
        break;
      case 'ArrowLeft':
        if (!editingCell) {
          e.preventDefault();
          const newCol = Math.max(selectedCell.col - 1, 0);
          onCellSelect({ row: selectedCell.row, col: newCol });
        }
        break;
      case 'ArrowRight':
        if (!editingCell) {
          e.preventDefault();
          const newCol = Math.min(selectedCell.col + 1, COLS - 1);
          onCellSelect({ row: selectedCell.row, col: newCol });
        }
        break;
      default:
        if (!editingCell && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          const cellId = getCellId(selectedCell.row, selectedCell.col);
          setEditingCell(cellId);
          setEditValue(e.key);
          onStartEdit(cellId, e.key);
        }
        break;
    }
  }, [selectedCell, editingCell, onCellSelect, handleEditConfirm, handleEditCancel, onStartEdit]);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  const getDataTypeColor = (type: CellDataType): string => {
    switch (type) {
      case 'number': return 'bg-blue-100 text-blue-800';
      case 'date': return 'bg-green-100 text-green-800';
      case 'boolean': return 'bg-purple-100 text-purple-800';
      case 'formula': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      ref={gridRef}
      className="flex-1 overflow-auto bg-white"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="relative">
        {/* Column Headers */}
        <div className="sticky top-0 z-20 bg-gray-50 border-b border-gray-300 flex">
          <div className="w-12 h-6 bg-gray-100 border-r border-gray-300" />
          {Array.from({ length: COLS }, (_, col) => (
            <div
              key={col}
              className="flex items-center justify-center border-r border-gray-300 bg-gray-50 text-xs font-medium text-gray-700"
              style={{ width: COL_WIDTH, height: ROW_HEIGHT }}
            >
              {getColumnLabel(col)}
            </div>
          ))}
        </div>

        {/* Grid Rows */}
        {Array.from({ length: ROWS }, (_, row) => (
          <div key={row} className="flex border-b border-gray-200">
            {/* Row Header */}
            <div
              className="flex items-center justify-center border-r border-gray-300 bg-gray-50 text-xs font-medium text-gray-700"
              style={{ width: 48, height: ROW_HEIGHT }}
            >
              {row + 1}
            </div>

            {/* Row Cells */}
            {Array.from({ length: COLS }, (_, col) => {
              const cellId = getCellId(row, col);
              const cellData = data[cellId];
              const isSelected = selectedCell?.row === row && selectedCell?.col === col;
              const isEditing = editingCell === cellId;

              return (
                <div
                  key={col}
                  className={`
                    relative border-r border-gray-200 cursor-cell flex items-center px-1
                    ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}
                    ${cellData?.type === 'formula' ? 'bg-orange-50' : ''}
                  `}
                  style={{ width: COL_WIDTH, height: ROW_HEIGHT }}
                  onClick={() => handleCellClick(row, col)}
                  onDoubleClick={() => handleCellDoubleClick(row, col)}
                >
                  {isEditing ? (
                    <input
                      ref={inputRef}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleEditConfirm}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleEditConfirm();
                        } else if (e.key === 'Escape') {
                          handleEditCancel();
                        }
                      }}
                      className="w-full h-full border-none outline-none bg-white px-1 text-xs"
                    />
                  ) : (
                    <div className="w-full flex items-center justify-between">
                      <span className="text-xs truncate flex-1">
                        {cellData?.formatted || cellData?.value || ''}
                      </span>
                      {cellData?.type && cellData.type !== 'text' && (
                        <Badge 
                          variant="secondary" 
                          className={`ml-1 text-xs px-1 py-0 h-4 ${getDataTypeColor(cellData.type)}`}
                        >
                          {cellData.type.charAt(0).toUpperCase()}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}