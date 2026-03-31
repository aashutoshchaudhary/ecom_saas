import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Settings,
  Palette,
  Box,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  CornerUpLeft,
  Image as ImageIcon,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface ElementPropertiesProps {
  element: {
    id: string;
    type: string;
    props: Record<string, any>;
    style?: Record<string, any>;
    locked?: boolean;
    visible?: boolean;
  };
  onUpdate: (id: string, updates: Partial<any>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}

const colors = [
  '#000000', '#1f2937', '#374151', '#6b7280', '#9ca3af',
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#06b6d4', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e',
  '#ffffff', 'transparent',
];

function ColorPicker({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 w-full p-2 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
          <div className="w-6 h-6 rounded border border-gray-300" style={{ backgroundColor: value || 'transparent' }} />
          <span className="text-sm flex-1 text-left">{label}</span>
          <span className="text-xs text-gray-400">{value || 'none'}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px]">
        <div>
          <Label className="text-sm mb-2 block">{label}</Label>
          <div className="grid grid-cols-6 gap-1.5">
            {colors.map((c) => (
              <button
                key={c}
                className={`w-8 h-8 rounded border-2 transition-transform hover:scale-110 ${
                  value === c ? 'border-purple-600 ring-2 ring-purple-200' : 'border-gray-200 dark:border-gray-600'
                }`}
                style={{ backgroundColor: c === 'transparent' ? undefined : c, backgroundImage: c === 'transparent' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%)' : undefined, backgroundSize: c === 'transparent' ? '8px 8px' : undefined, backgroundPosition: c === 'transparent' ? '0 0, 4px 4px' : undefined }}
                onClick={() => onChange(c)}
              />
            ))}
          </div>
          <div className="mt-2">
            <Input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#hex or rgb()"
              className="text-sm"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function ElementProperties({ element, onUpdate, onDelete, onDuplicate, onMoveUp, onMoveDown }: ElementPropertiesProps) {
  const updateProps = (updates: Record<string, any>) => {
    onUpdate(element.id, { props: { ...element.props, ...updates } });
  };

  const updateStyle = (updates: Record<string, any>) => {
    onUpdate(element.id, { style: { ...element.style, ...updates } });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <h3 className="font-semibold text-sm capitalize">{element.type.replace('-', ' ')} Properties</h3>
          </div>
          <Badge variant="outline" className="text-xs">{element.id.slice(0, 8)}</Badge>
        </div>
        {/* Quick Actions */}
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onMoveUp(element.id)} title="Move up">
            <ArrowUp className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onMoveDown(element.id)} title="Move down">
            <ArrowDown className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onDuplicate(element.id)} title="Duplicate">
            <Copy className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onUpdate(element.id, { visible: !element.visible })} title="Toggle visibility">
            {element.visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onUpdate(element.id, { locked: !element.locked })} title="Toggle lock">
            {element.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </Button>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => onDelete(element.id)} title="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="content" className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-3 rounded-none border-b">
          <TabsTrigger value="content" className="text-xs">Content</TabsTrigger>
          <TabsTrigger value="style" className="text-xs">Style</TabsTrigger>
          <TabsTrigger value="spacing" className="text-xs">Spacing</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          {/* CONTENT TAB */}
          <TabsContent value="content" className="p-4 space-y-4 m-0">
            {renderContentFields(element, updateProps)}
          </TabsContent>

          {/* STYLE TAB */}
          <TabsContent value="style" className="p-4 space-y-4 m-0">
            <ColorPicker label="Background Color" value={element.style?.backgroundColor || ''} onChange={(v) => updateStyle({ backgroundColor: v })} />
            <ColorPicker label="Text Color" value={element.style?.color || ''} onChange={(v) => updateStyle({ color: v })} />
            <ColorPicker label="Border Color" value={element.style?.borderColor || ''} onChange={(v) => updateStyle({ borderColor: v })} />

            <Separator />

            <div>
              <Label className="text-xs">Border Radius</Label>
              <div className="flex items-center gap-2 mt-1">
                <Slider
                  value={[parseInt(element.style?.borderRadius) || 0]}
                  onValueChange={([v]) => updateStyle({ borderRadius: `${v}px` })}
                  min={0} max={32} step={2}
                />
                <span className="text-xs text-gray-500 w-10 text-right">{parseInt(element.style?.borderRadius) || 0}px</span>
              </div>
            </div>

            <div>
              <Label className="text-xs">Border Width</Label>
              <div className="flex items-center gap-2 mt-1">
                <Slider
                  value={[parseInt(element.style?.borderWidth) || 0]}
                  onValueChange={([v]) => updateStyle({ borderWidth: `${v}px`, borderStyle: v > 0 ? 'solid' : 'none' })}
                  min={0} max={8} step={1}
                />
                <span className="text-xs text-gray-500 w-10 text-right">{parseInt(element.style?.borderWidth) || 0}px</span>
              </div>
            </div>

            <div>
              <Label className="text-xs">Opacity</Label>
              <div className="flex items-center gap-2 mt-1">
                <Slider
                  value={[parseFloat(element.style?.opacity ?? '1') * 100]}
                  onValueChange={([v]) => updateStyle({ opacity: (v / 100).toString() })}
                  min={0} max={100} step={5}
                />
                <span className="text-xs text-gray-500 w-10 text-right">{Math.round(parseFloat(element.style?.opacity ?? '1') * 100)}%</span>
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-xs">Shadow</Label>
              <Select value={element.style?.boxShadow || 'none'} onValueChange={(v) => updateStyle({ boxShadow: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="0 1px 3px rgba(0,0,0,0.12)">Small</SelectItem>
                  <SelectItem value="0 4px 6px rgba(0,0,0,0.1)">Medium</SelectItem>
                  <SelectItem value="0 10px 25px rgba(0,0,0,0.15)">Large</SelectItem>
                  <SelectItem value="0 20px 50px rgba(0,0,0,0.2)">XL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* SPACING TAB */}
          <TabsContent value="spacing" className="p-4 space-y-4 m-0">
            <div>
              <Label className="text-xs mb-2 block">Padding</Label>
              <div className="grid grid-cols-2 gap-2">
                {["Top", "Right", "Bottom", "Left"].map((dir) => (
                  <div key={dir} className="flex items-center gap-1">
                    <span className="text-xs text-gray-400 w-10">{dir}</span>
                    <Input
                      type="number"
                      className="h-8 text-xs"
                      value={parseInt(element.style?.[`padding${dir}`]) || 0}
                      onChange={(e) => updateStyle({ [`padding${dir}`]: `${e.target.value}px` })}
                      min={0}
                    />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-xs mb-2 block">Margin</Label>
              <div className="grid grid-cols-2 gap-2">
                {["Top", "Right", "Bottom", "Left"].map((dir) => (
                  <div key={dir} className="flex items-center gap-1">
                    <span className="text-xs text-gray-400 w-10">{dir}</span>
                    <Input
                      type="number"
                      className="h-8 text-xs"
                      value={parseInt(element.style?.[`margin${dir}`]) || 0}
                      onChange={(e) => updateStyle({ [`margin${dir}`]: `${e.target.value}px` })}
                      min={0}
                    />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-xs">Width</Label>
              <Select value={element.style?.width || 'auto'} onValueChange={(v) => updateStyle({ width: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="100%">Full Width</SelectItem>
                  <SelectItem value="75%">75%</SelectItem>
                  <SelectItem value="50%">50%</SelectItem>
                  <SelectItem value="33%">33%</SelectItem>
                  <SelectItem value="25%">25%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Max Width</Label>
              <Select value={element.style?.maxWidth || 'none'} onValueChange={(v) => updateStyle({ maxWidth: v === 'none' ? undefined : v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="640px">Small (640px)</SelectItem>
                  <SelectItem value="768px">Medium (768px)</SelectItem>
                  <SelectItem value="1024px">Large (1024px)</SelectItem>
                  <SelectItem value="1280px">XL (1280px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}

function renderContentFields(element: any, updateProps: (u: Record<string, any>) => void) {
  switch (element.type) {
    case "heading":
      return (
        <>
          <div>
            <Label className="text-xs">Text</Label>
            <Input className="mt-1" value={element.props.text} onChange={(e) => updateProps({ text: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Level</Label>
            <Select value={element.props.level} onValueChange={(v) => updateProps({ level: v })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="h1">H1 - Main Heading</SelectItem>
                <SelectItem value="h2">H2 - Section Heading</SelectItem>
                <SelectItem value="h3">H3 - Sub Heading</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Alignment</Label>
            <div className="flex gap-1 mt-1">
              {[{ v: "left", i: AlignLeft }, { v: "center", i: AlignCenter }, { v: "right", i: AlignRight }].map(({ v, i: Icon }) => (
                <Button key={v} variant={element.props.align === v ? "default" : "outline"} size="sm" className="h-8 w-8 p-0" onClick={() => updateProps({ align: v })}>
                  <Icon className="w-3.5 h-3.5" />
                </Button>
              ))}
            </div>
          </div>
        </>
      );
    case "paragraph":
      return (
        <>
          <div>
            <Label className="text-xs">Text</Label>
            <textarea className="mt-1 w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm min-h-[100px]" value={element.props.text} onChange={(e) => updateProps({ text: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Alignment</Label>
            <div className="flex gap-1 mt-1">
              {[{ v: "left", i: AlignLeft }, { v: "center", i: AlignCenter }, { v: "right", i: AlignRight }, { v: "justify", i: AlignJustify }].map(({ v, i: Icon }) => (
                <Button key={v} variant={element.props.align === v ? "default" : "outline"} size="sm" className="h-8 w-8 p-0" onClick={() => updateProps({ align: v })}>
                  <Icon className="w-3.5 h-3.5" />
                </Button>
              ))}
            </div>
          </div>
        </>
      );
    case "quote":
      return (
        <>
          <div>
            <Label className="text-xs">Quote Text</Label>
            <textarea className="mt-1 w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm min-h-[80px]" value={element.props.text} onChange={(e) => updateProps({ text: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Author</Label>
            <Input className="mt-1" value={element.props.author || ''} onChange={(e) => updateProps({ author: e.target.value })} />
          </div>
        </>
      );
    case "button":
      return (
        <>
          <div>
            <Label className="text-xs">Button Text</Label>
            <Input className="mt-1" value={element.props.text} onChange={(e) => updateProps({ text: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">URL</Label>
            <Input className="mt-1" value={element.props.url || ''} onChange={(e) => updateProps({ url: e.target.value })} placeholder="https://..." />
          </div>
          <div>
            <Label className="text-xs">Variant</Label>
            <Select value={element.props.variant} onValueChange={(v) => updateProps({ variant: v })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primary</SelectItem>
                <SelectItem value="outline">Outline</SelectItem>
                <SelectItem value="ghost">Ghost</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Size</Label>
            <Select value={element.props.size || 'md'} onValueChange={(v) => updateProps({ size: v })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="md">Medium</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Show Arrow</Label>
            <Switch checked={element.props.showArrow || false} onCheckedChange={(v) => updateProps({ showArrow: v })} />
          </div>
        </>
      );
    case "image":
      return (
        <>
          <div>
            <Label className="text-xs">Image URL</Label>
            <Input className="mt-1" value={element.props.src || ''} onChange={(e) => updateProps({ src: e.target.value })} placeholder="https://..." />
          </div>
          <div>
            <Label className="text-xs">Alt Text</Label>
            <Input className="mt-1" value={element.props.alt || ''} onChange={(e) => updateProps({ alt: e.target.value })} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Rounded Corners</Label>
            <Switch checked={element.props.rounded} onCheckedChange={(v) => updateProps({ rounded: v })} />
          </div>
          <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => toast.info("Upload functionality - connect storage")}>
            <ImageIcon className="w-4 h-4" /> Upload Image
          </Button>
        </>
      );
    case "divider":
      return (
        <>
          <div>
            <Label className="text-xs">Style</Label>
            <Select value={element.props.style} onValueChange={(v) => updateProps({ style: v })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="dashed">Dashed</SelectItem>
                <SelectItem value="dotted">Dotted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Thickness</Label>
            <Slider value={[element.props.thickness]} onValueChange={([v]) => updateProps({ thickness: v })} min={1} max={8} step={1} />
          </div>
        </>
      );
    case "spacer":
      return (
        <div>
          <Label className="text-xs">Height (px)</Label>
          <div className="flex items-center gap-2 mt-1">
            <Slider value={[element.props.height]} onValueChange={([v]) => updateProps({ height: v })} min={8} max={200} step={8} />
            <span className="text-xs text-gray-500 w-10">{element.props.height}px</span>
          </div>
        </div>
      );
    case "countdown":
      return (
        <>
          <div>
            <Label className="text-xs">Label</Label>
            <Input className="mt-1" value={element.props.label} onChange={(e) => updateProps({ label: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Target Date</Label>
            <Input className="mt-1" type="datetime-local" value={element.props.targetDate?.slice(0, 16)} onChange={(e) => updateProps({ targetDate: e.target.value })} />
          </div>
        </>
      );
    case "alert":
      return (
        <>
          <div>
            <Label className="text-xs">Type</Label>
            <Select value={element.props.type} onValueChange={(v) => updateProps({ type: v })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Message</Label>
            <Input className="mt-1" value={element.props.message} onChange={(e) => updateProps({ message: e.target.value })} />
          </div>
        </>
      );
    case "announcement":
      return (
        <>
          <div>
            <Label className="text-xs">Text</Label>
            <Input className="mt-1" value={element.props.text} onChange={(e) => updateProps({ text: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Background Color</Label>
            <Input className="mt-1" type="color" value={element.props.bgColor} onChange={(e) => updateProps({ bgColor: e.target.value })} />
          </div>
        </>
      );
    case "product-card":
      return (
        <>
          <div>
            <Label className="text-xs">Product Name</Label>
            <Input className="mt-1" value={element.props.name} onChange={(e) => updateProps({ name: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Price</Label>
            <Input className="mt-1" type="number" value={element.props.price} onChange={(e) => updateProps({ price: parseFloat(e.target.value) })} />
          </div>
          <div>
            <Label className="text-xs">Rating</Label>
            <Slider value={[element.props.rating * 10]} onValueChange={([v]) => updateProps({ rating: v / 10 })} min={0} max={50} step={5} />
          </div>
          <div>
            <Label className="text-xs">Image URL</Label>
            <Input className="mt-1" value={element.props.image || ''} onChange={(e) => updateProps({ image: e.target.value })} placeholder="https://..." />
          </div>
        </>
      );
    case "list":
      return (
        <>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Ordered List</Label>
            <Switch checked={element.props.ordered} onCheckedChange={(v) => updateProps({ ordered: v })} />
          </div>
          <div>
            <Label className="text-xs mb-2 block">Items</Label>
            {element.props.items.map((item: string, i: number) => (
              <div key={i} className="flex gap-1 mb-1">
                <Input className="text-sm h-8" value={item} onChange={(e) => {
                  const items = [...element.props.items];
                  items[i] = e.target.value;
                  updateProps({ items });
                }} />
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => {
                  updateProps({ items: element.props.items.filter((_: any, j: number) => j !== i) });
                }}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full mt-1 gap-1" onClick={() => updateProps({ items: [...element.props.items, "New item"] })}>
              <Plus className="w-3 h-3" /> Add Item
            </Button>
          </div>
        </>
      );
    case "table":
      return (
        <>
          <div>
            <Label className="text-xs mb-2 block">Headers</Label>
            {element.props.headers.map((h: string, i: number) => (
              <Input key={i} className="text-sm h-8 mb-1" value={h} onChange={(e) => {
                const headers = [...element.props.headers];
                headers[i] = e.target.value;
                updateProps({ headers });
              }} />
            ))}
          </div>
          <Button variant="outline" size="sm" className="w-full gap-1" onClick={() => {
            updateProps({
              headers: [...element.props.headers, `Col ${element.props.headers.length + 1}`],
              rows: element.props.rows.map((r: string[]) => [...r, ""])
            });
          }}>
            <Plus className="w-3 h-3" /> Add Column
          </Button>
        </>
      );
    case "stats-row":
      return (
        <div>
          <Label className="text-xs mb-2 block">Stats</Label>
          {element.props.stats.map((stat: { label: string; value: string }, i: number) => (
            <div key={i} className="grid grid-cols-2 gap-1 mb-2">
              <Input className="text-sm h-8" placeholder="Value" value={stat.value} onChange={(e) => {
                const stats = [...element.props.stats];
                stats[i] = { ...stats[i], value: e.target.value };
                updateProps({ stats });
              }} />
              <Input className="text-sm h-8" placeholder="Label" value={stat.label} onChange={(e) => {
                const stats = [...element.props.stats];
                stats[i] = { ...stats[i], label: e.target.value };
                updateProps({ stats });
              }} />
            </div>
          ))}
          <Button variant="outline" size="sm" className="w-full gap-1" onClick={() => updateProps({ stats: [...element.props.stats, { label: "Label", value: "0" }] })}>
            <Plus className="w-3 h-3" /> Add Stat
          </Button>
        </div>
      );
    case "code":
      return (
        <>
          <div>
            <Label className="text-xs">Language</Label>
            <Select value={element.props.language} onValueChange={(v) => updateProps({ language: v })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="typescript">TypeScript</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="css">CSS</SelectItem>
                <SelectItem value="python">Python</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Code</Label>
            <textarea className="mt-1 w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-900 text-green-400 font-mono text-xs min-h-[120px]" value={element.props.code} onChange={(e) => updateProps({ code: e.target.value })} />
          </div>
        </>
      );
    case "video":
      return (
        <>
          <div>
            <Label className="text-xs">Video URL</Label>
            <Input className="mt-1" value={element.props.url} onChange={(e) => updateProps({ url: e.target.value })} placeholder="YouTube or Vimeo embed URL" />
          </div>
          <div>
            <Label className="text-xs">Aspect Ratio</Label>
            <Select value={element.props.aspectRatio} onValueChange={(v) => updateProps({ aspectRatio: v })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="16/9">16:9</SelectItem>
                <SelectItem value="4/3">4:3</SelectItem>
                <SelectItem value="1/1">1:1</SelectItem>
                <SelectItem value="21/9">21:9</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      );
    case "form":
      return (
        <>
          <div>
            <Label className="text-xs">Submit Button Text</Label>
            <Input className="mt-1" value={element.props.submitText} onChange={(e) => updateProps({ submitText: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs mb-2 block">Fields ({element.props.fields.length})</Label>
            {element.props.fields.map((field: any, i: number) => (
              <div key={i} className="flex gap-1 mb-1 items-center">
                <Badge variant="outline" className="text-[10px] flex-shrink-0">{field.type}</Badge>
                <Input className="text-xs h-7" value={field.label} onChange={(e) => {
                  const fields = [...element.props.fields];
                  fields[i] = { ...fields[i], label: e.target.value };
                  updateProps({ fields });
                }} />
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => {
                  updateProps({ fields: element.props.fields.filter((_: any, j: number) => j !== i) });
                }}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full mt-1 gap-1" onClick={() => updateProps({ fields: [...element.props.fields, { type: "text", label: "New Field", placeholder: "Enter value" }] })}>
              <Plus className="w-3 h-3" /> Add Field
            </Button>
          </div>
        </>
      );
    default:
      return (
        <div className="text-sm text-gray-500 text-center py-4">
          <p>Edit properties for this {element.type} element</p>
          <div className="mt-4 space-y-2">
            {Object.entries(element.props).map(([key, value]) => (
              <div key={key}>
                <Label className="text-xs capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                {typeof value === 'string' ? (
                  <Input className="mt-1 text-sm" value={value} onChange={(e) => updateProps({ [key]: e.target.value })} />
                ) : typeof value === 'number' ? (
                  <Input className="mt-1 text-sm" type="number" value={value} onChange={(e) => updateProps({ [key]: parseFloat(e.target.value) })} />
                ) : typeof value === 'boolean' ? (
                  <div className="mt-1"><Switch checked={value} onCheckedChange={(v) => updateProps({ [key]: v })} /></div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      );
  }
}
