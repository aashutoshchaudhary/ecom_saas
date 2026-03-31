import { useState } from "react";
import { Card } from "../ui/card";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Play, Pause, RotateCcw, Zap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Switch } from "../ui/switch";
import { animations } from "../../lib/builder-data";

interface AnimationEditorProps {
  elementId?: string;
  currentAnimation?: string;
  onAnimationChange?: (animation: AnimationConfig) => void;
}

export interface AnimationConfig {
  type: string;
  duration: number;
  delay: number;
  easing: string;
  repeat: boolean;
  triggerOn: 'load' | 'scroll' | 'hover' | 'click';
}

export function AnimationEditor({ elementId, currentAnimation, onAnimationChange }: AnimationEditorProps) {
  const [config, setConfig] = useState<AnimationConfig>({
    type: currentAnimation || 'fade-in',
    duration: 600,
    delay: 0,
    easing: 'ease-out',
    repeat: false,
    triggerOn: 'scroll'
  });
  
  const [isPlaying, setIsPlaying] = useState(false);
  
  const easingOptions = [
    { value: 'linear', label: 'Linear' },
    { value: 'ease', label: 'Ease' },
    { value: 'ease-in', label: 'Ease In' },
    { value: 'ease-out', label: 'Ease Out' },
    { value: 'ease-in-out', label: 'Ease In Out' },
    { value: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', label: 'Bounce' },
    { value: 'cubic-bezier(0.34, 1.56, 0.64, 1)', label: 'Spring' }
  ];
  
  const triggerOptions = [
    { value: 'load', label: 'On Page Load', icon: '⚡' },
    { value: 'scroll', label: 'On Scroll Into View', icon: '👁️' },
    { value: 'hover', label: 'On Hover', icon: '👆' },
    { value: 'click', label: 'On Click', icon: '👉' }
  ];
  
  const entranceAnimations = animations.filter(a => a.type === 'entrance');
  const exitAnimations = animations.filter(a => a.type === 'exit');
  
  const handleConfigChange = (updates: Partial<AnimationConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    if (onAnimationChange) {
      onAnimationChange(newConfig);
    }
  };
  
  const handlePreview = () => {
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), config.duration + config.delay);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Animations</h3>
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={handlePreview}
            disabled={isPlaying}
            className="gap-2"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                Playing
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Preview
              </>
            )}
          </Button>
          <Button size="sm" variant="ghost">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="entrance" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="entrance">Entrance</TabsTrigger>
          <TabsTrigger value="exit">Exit</TabsTrigger>
        </TabsList>
        
        <TabsContent value="entrance" className="space-y-6">
          {/* Animation Type */}
          <div>
            <Label className="mb-3 block">Animation Type</Label>
            <div className="grid grid-cols-2 gap-3">
              {entranceAnimations.map((anim) => (
                <button
                  key={anim.id}
                  onClick={() => handleConfigChange({ type: anim.id })}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    config.type === anim.id
                      ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                  }`}
                >
                  <div className="font-medium mb-1">{anim.name}</div>
                  <div className="text-xs text-gray-500">{anim.duration}ms</div>
                </button>
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="exit" className="space-y-6">
          <div>
            <Label className="mb-3 block">Exit Animation</Label>
            <div className="grid grid-cols-2 gap-3">
              {exitAnimations.map((anim) => (
                <button
                  key={anim.id}
                  onClick={() => handleConfigChange({ type: anim.id })}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    config.type === anim.id
                      ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                  }`}
                >
                  <div className="font-medium mb-1">{anim.name}</div>
                  <div className="text-xs text-gray-500">{anim.duration}ms</div>
                </button>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Trigger */}
      <div>
        <Label className="mb-3 block">Trigger</Label>
        <div className="grid grid-cols-2 gap-3">
          {triggerOptions.map((trigger) => (
            <button
              key={trigger.value}
              onClick={() => handleConfigChange({ triggerOn: trigger.value as any })}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                config.triggerOn === trigger.value
                  ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{trigger.icon}</span>
                <span className="text-sm font-medium">{trigger.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Duration */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Duration</Label>
          <span className="text-sm text-gray-500">{config.duration}ms</span>
        </div>
        <Slider
          value={[config.duration]}
          onValueChange={([value]) => handleConfigChange({ duration: value })}
          min={100}
          max={2000}
          step={100}
        />
      </div>
      
      {/* Delay */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Delay</Label>
          <span className="text-sm text-gray-500">{config.delay}ms</span>
        </div>
        <Slider
          value={[config.delay]}
          onValueChange={([value]) => handleConfigChange({ delay: value })}
          min={0}
          max={2000}
          step={100}
        />
      </div>
      
      {/* Easing */}
      <div>
        <Label>Easing Function</Label>
        <Select 
          value={config.easing} 
          onValueChange={(value) => handleConfigChange({ easing: value })}
        >
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {easingOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Repeat */}
      <div className="flex items-center justify-between">
        <div>
          <Label>Repeat Animation</Label>
          <p className="text-sm text-gray-500">Loop the animation continuously</p>
        </div>
        <Switch
          checked={config.repeat}
          onCheckedChange={(checked) => handleConfigChange({ repeat: checked })}
        />
      </div>
      
      {/* Preview Card */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <div className="text-center">
          <div 
            className={`inline-block ${isPlaying ? 'animate-pulse' : ''}`}
            style={{
              animation: isPlaying ? `${config.type} ${config.duration}ms ${config.easing} ${config.delay}ms` : 'none'
            }}
          >
            <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Zap className="w-12 h-12 text-white" />
            </div>
            <div className="font-semibold">Preview Element</div>
          </div>
        </div>
      </Card>
      
      {/* Quick Presets */}
      <div>
        <Label className="mb-3 block">Quick Presets</Label>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => handleConfigChange({
              type: 'fade-in',
              duration: 600,
              delay: 0,
              easing: 'ease-out',
              triggerOn: 'scroll'
            })}
          >
            Subtle Fade
          </Button>
          <Button
            variant="outline"
            onClick={() => handleConfigChange({
              type: 'slide-up',
              duration: 800,
              delay: 200,
              easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
              triggerOn: 'scroll'
            })}
          >
            Slide & Bounce
          </Button>
          <Button
            variant="outline"
            onClick={() => handleConfigChange({
              type: 'zoom-in',
              duration: 500,
              delay: 0,
              easing: 'ease-out',
              triggerOn: 'hover'
            })}
          >
            Hover Zoom
          </Button>
          <Button
            variant="outline"
            onClick={() => handleConfigChange({
              type: 'bounce-in',
              duration: 1000,
              delay: 0,
              easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
              triggerOn: 'load'
            })}
          >
            Playful Bounce
          </Button>
        </div>
      </div>
    </div>
  );
}

// Compact animation selector
export function QuickAnimationSelector({ 
  value, 
  onChange 
}: { 
  value?: string; 
  onChange: (animation: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="No animation" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">No Animation</SelectItem>
        {animations.map((anim) => (
          <SelectItem key={anim.id} value={anim.id}>
            {anim.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
