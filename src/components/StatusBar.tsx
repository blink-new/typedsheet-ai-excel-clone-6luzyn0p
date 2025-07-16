import { CellPosition, SpreadsheetData } from '../types/spreadsheet';
import { getCellId } from '../utils/spreadsheet';

interface StatusBarProps {
  selectedCell: CellPosition | null;
  data: SpreadsheetData;
}

export function StatusBar({ selectedCell, data }: StatusBarProps) {
  const cellId = selectedCell ? getCellId(selectedCell.row, selectedCell.col) : '';
  const cellData = cellId ? data[cellId] : null;
  
  const totalCells = Object.keys(data).length;
  const cellsWithData = Object.values(data).filter(cell => cell.value.trim() !== '').length;

  return (
    <div className="bg-gray-50 border-t border-gray-200 px-4 py-1 flex items-center justify-between text-xs text-gray-600">
      <div className="flex items-center gap-4">
        <span>Ready</span>
        {selectedCell && (
          <>
            <span>Cell: {cellId}</span>
            {cellData && (
              <>
                <span>Type: {cellData.type}</span>
                {cellData.value && (
                  <span>Value: {cellData.value}</span>
                )}
              </>
            )}
          </>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <span>Cells: {cellsWithData}/{totalCells}</span>
        <span>Sheet1</span>
      </div>
    </div>
  );
}