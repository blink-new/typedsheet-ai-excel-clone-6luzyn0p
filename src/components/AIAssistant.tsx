import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Sparkles, Send, Loader2, X } from 'lucide-react';
import { blink } from '../blink/client';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onSuggestionApply: (suggestion: string) => void;
  selectedCell: string;
  cellValue: string;
}

export function AIAssistant({ 
  isOpen, 
  onClose, 
  onSuggestionApply, 
  selectedCell, 
  cellValue 
}: AIAssistantProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleGenerateSuggestions = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    try {
      const { text } = await blink.ai.generateText({
        prompt: `You are an Excel formula expert. Based on this request: "${prompt}" and current cell ${selectedCell} with value "${cellValue}", provide 3 different Excel formulas or values that would be helpful. Return only the formulas/values, one per line, without explanations.`,
        maxTokens: 200
      });
      
      const suggestionList = text.split('\n').filter(s => s.trim()).slice(0, 3);
      setSuggestions(suggestionList);
    } catch (error) {
      console.error('AI suggestion error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySuggestion = (suggestion: string) => {
    onSuggestionApply(suggestion);
    setPrompt('');
    setSuggestions([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <Card className="w-96 max-h-[80vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            AI Assistant
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600">
            Selected cell: <Badge variant="outline">{selectedCell}</Badge>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">What would you like to do?</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'Calculate the sum of column A', 'Generate a date formula', 'Create a percentage calculation'"
              className="min-h-[80px]"
            />
          </div>

          <Button 
            onClick={handleGenerateSuggestions}
            disabled={!prompt.trim() || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Get AI Suggestions
              </>
            )}
          </Button>

          {suggestions.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">AI Suggestions:</label>
              {suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-center gap-2">
                  <code className="flex-1 bg-gray-100 p-2 rounded text-sm font-mono">
                    {suggestion}
                  </code>
                  <Button 
                    size="sm" 
                    onClick={() => handleApplySuggestion(suggestion)}
                  >
                    Apply
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>Quick tips:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Ask for formulas: "Sum all values in column A"</li>
              <li>Request calculations: "Calculate 15% tax on B2"</li>
              <li>Generate patterns: "Create a date sequence"</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}