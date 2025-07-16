import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Check, X, Sparkles, Zap } from 'lucide-react';
import { blink } from '../blink/client';

interface FormulaBarProps {
  selectedCell: string;
  value: string;
  onValueChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isEditing: boolean;
}

export function FormulaBar({ 
  selectedCell, 
  value, 
  onValueChange, 
  onConfirm, 
  onCancel, 
  isEditing 
}: FormulaBarProps) {
  const [showAISuggestion, setShowAISuggestion] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAISuggestion = async () => {
    if (!value.trim()) return;
    
    setIsGenerating(true);
    try {
      const { text } = await blink.ai.generateText({
        prompt: `You are an Excel expert. For cell ${selectedCell} with current value "${value}", suggest a better formula or completion. If it's already a formula, optimize it. If it's data, suggest a relevant formula. Return only the suggestion, no explanation.`,
        maxTokens: 100
      });
      
      setAiSuggestion(text.trim());
      setShowAISuggestion(true);
    } catch (error) {
      console.error('AI suggestion error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const applyAISuggestion = () => {
    onValueChange(aiSuggestion);
    setShowAISuggestion(false);
    setAiSuggestion('');
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2">
      {/* Cell Reference */}
      <div className="flex items-center gap-2">
        <div className="w-16 h-8 bg-gray-50 border border-gray-200 rounded flex items-center justify-center text-sm font-medium">
          {selectedCell}
        </div>
        
        {isEditing && (
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
              onClick={onConfirm}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              onClick={onCancel}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Formula Input */}
      <div className="flex-1 relative">
        <Input
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder="Enter value or formula (start with =)"
          className="h-8 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
        />
        
        {/* AI Suggestion Indicator */}
        {value && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-0 h-8 w-8 p-0 text-blue-500 hover:text-blue-600"
            onClick={generateAISuggestion}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Zap className="h-4 w-4 animate-pulse" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* AI Suggestion Popup */}
      {showAISuggestion && aiSuggestion && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 shadow-lg z-10 p-3">
          <div className="text-sm text-gray-600 mb-2 flex items-center gap-1">
            <Sparkles className="h-4 w-4 text-blue-500" />
            AI Suggestion:
          </div>
          <div className="text-sm bg-blue-50 p-2 rounded border border-blue-200">
            <code className="font-mono">{aiSuggestion}</code>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" size="sm" onClick={() => setShowAISuggestion(false)}>
              Dismiss
            </Button>
            <Button size="sm" onClick={applyAISuggestion}>
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}