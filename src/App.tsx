import { useState, useCallback } from 'react';
import { Ribbon } from './components/Ribbon';
import { FormulaBar } from './components/FormulaBar';
import { SpreadsheetGrid } from './components/SpreadsheetGrid';
import { StatusBar } from './components/StatusBar';
import { CellPosition, SpreadsheetData, CellData } from './types/spreadsheet';
import { getCellId } from './utils/spreadsheet';

function App() {
  const [data, setData] = useState<SpreadsheetData>({});
  const [selectedCell, setSelectedCell] = useState<CellPosition>({ row: 0, col: 0 });
  const [formulaValue, setFormulaValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleCellChange = useCallback((cellId: string, cellData: CellData) => {
    setData(prev => ({
      ...prev,
      [cellId]: cellData
    }));
    setIsEditing(false);
    setFormulaValue('');
  }, []);

  const handleCellSelect = useCallback((position: CellPosition) => {
    setSelectedCell(position);
    const cellId = getCellId(position.row, position.col);
    const cellData = data[cellId];
    setFormulaValue(cellData?.value || '');
    setIsEditing(false);
  }, [data]);

  const handleStartEdit = useCallback((cellId: string, value: string) => {
    setFormulaValue(value);
    setIsEditing(true);
  }, []);

  const handleFormulaConfirm = useCallback(() => {
    if (selectedCell) {
      const cellId = getCellId(selectedCell.row, selectedCell.col);
      // This would normally trigger the same logic as SpreadsheetGrid's confirm
      // For now, we'll let the grid handle it
      setIsEditing(false);
    }
  }, [selectedCell]);

  const handleFormulaCancel = useCallback(() => {
    const cellId = getCellId(selectedCell.row, selectedCell.col);
    const cellData = data[cellId];
    setFormulaValue(cellData?.value || '');
    setIsEditing(false);
  }, [selectedCell, data]);

  const selectedCellId = getCellId(selectedCell.row, selectedCell.col);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Title Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">T</span>
          </div>
          TypedSheet
          <span className="text-sm font-normal text-gray-500">- AI-Powered Excel Clone</span>
        </h1>
      </div>

      {/* Ribbon */}
      <Ribbon />

      {/* Formula Bar */}
      <FormulaBar
        selectedCell={selectedCellId}
        value={formulaValue}
        onValueChange={setFormulaValue}
        onConfirm={handleFormulaConfirm}
        onCancel={handleFormulaCancel}
        isEditing={isEditing}
      />

      {/* Main Grid */}
      <SpreadsheetGrid
        data={data}
        onCellChange={handleCellChange}
        selectedCell={selectedCell}
        onCellSelect={handleCellSelect}
        onStartEdit={handleStartEdit}
      />

      {/* Status Bar */}
      <StatusBar selectedCell={selectedCell} data={data} />
    </div>
  );
}

export default App;