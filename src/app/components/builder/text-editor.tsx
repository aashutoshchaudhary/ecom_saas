import { useState } from "react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Palette
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface TextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function TextEditor({ content, onChange }: TextEditorProps) {
  const [selectedText, setSelectedText] = useState("");
  
  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px', '64px'];
  const fontFamilies = ['Inter', 'Poppins', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Playfair Display', 'Merriweather'];
  
  const colors = [
    '#000000', '#1f2937', '#374151', '#6b7280',
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
    '#f43f5e', '#ffffff'
  ];
  
  return (
    <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-900">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50 dark:bg-gray-800">
        {/* Font Family */}
        <Select defaultValue="Inter">
          <SelectTrigger className="w-[140px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fontFamilies.map((font) => (
              <SelectItem key={font} value={font}>
                <span style={{ fontFamily: font }}>{font}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Font Size */}
        <Select defaultValue="16px">
          <SelectTrigger className="w-[90px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fontSizes.map((size) => (
              <SelectItem key={size} value={size}>{size}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Separator orientation="vertical" className="h-6" />
        
        {/* Headings */}
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Heading1 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Heading2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Heading3 className="w-4 h-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6" />
        
        {/* Text Formatting */}
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Bold className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Italic className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Underline className="w-4 h-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6" />
        
        {/* Text Color */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Type className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[240px]">
            <div>
              <Label className="text-sm mb-2 block">Text Color</Label>
              <div className="grid grid-cols-6 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => {}}
                  />
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Background Color */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Palette className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[240px]">
            <div>
              <Label className="text-sm mb-2 block">Background Color</Label>
              <div className="grid grid-cols-6 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => {}}
                  />
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <Separator orientation="vertical" className="h-6" />
        
        {/* Alignment */}
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <AlignLeft className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <AlignCenter className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <AlignRight className="w-4 h-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6" />
        
        {/* Lists */}
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <List className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <ListOrdered className="w-4 h-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6" />
        
        {/* Link */}
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <LinkIcon className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Editor Area */}
      <div 
        className="min-h-[200px] p-4 focus:outline-none"
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange(e.currentTarget.textContent || '')}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}

interface InlineTextEditorProps {
  text: string;
  onChange: (text: string) => void;
  className?: string;
}

export function InlineTextEditor({ text, onChange, className = "" }: InlineTextEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  
  return (
    <div className="relative">
      {showToolbar && (
        <div className="absolute top-[-50px] left-0 z-50 flex items-center gap-1 bg-white dark:bg-gray-800 border rounded-lg p-1 shadow-lg">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <Bold className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <Italic className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <Underline className="w-3.5 h-3.5" />
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <Type className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <LinkIcon className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
      <div
        className={`${className} ${isEditing ? 'outline outline-2 outline-purple-500 outline-offset-2' : ''}`}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onDoubleClick={() => setIsEditing(true)}
        onBlur={() => {
          setIsEditing(false);
          setShowToolbar(false);
        }}
        onMouseUp={() => {
          const selection = window.getSelection();
          if (selection && selection.toString().length > 0) {
            setShowToolbar(true);
          }
        }}
        onInput={(e) => onChange(e.currentTarget.textContent || '')}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    </div>
  );
}
