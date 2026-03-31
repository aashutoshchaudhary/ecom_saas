import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Sparkles, Wand2, Image as ImageIcon, Download, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Slider } from "../ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { toast } from "sonner";

interface AIImageGeneratorProps {
  onImageGenerated?: (imageUrl: string) => void;
  productContext?: {
    name?: string;
    category?: string;
    description?: string;
  };
}

export function AIImageGenerator({ onImageGenerated, productContext }: AIImageGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState("realistic");
  const [imageSize, setImageSize] = useState("1024x1024");
  const [quality, setQuality] = useState(80);
  
  const styles = [
    { id: "realistic", name: "Realistic", preview: "📸" },
    { id: "artistic", name: "Artistic", preview: "🎨" },
    { id: "minimalist", name: "Minimalist", preview: "⚪" },
    { id: "vibrant", name: "Vibrant", preview: "🌈" },
    { id: "professional", name: "Professional", preview: "💼" },
    { id: "lifestyle", name: "Lifestyle", preview: "🏖️" }
  ];
  
  const sizes = [
    { value: "512x512", label: "Square Small (512x512)" },
    { value: "1024x1024", label: "Square Large (1024x1024)" },
    { value: "1024x768", label: "Landscape (1024x768)" },
    { value: "768x1024", label: "Portrait (768x1024)" },
    { value: "1920x1080", label: "Wide (1920x1080)" }
  ];
  
  const mockGeneratedImages = [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop",
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=800&fit=crop",
    "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&h=800&fit=crop"
  ];
  
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      setGeneratedImages(mockGeneratedImages);
      setIsGenerating(false);
      toast.success("Images generated successfully!");
    }, 2000);
  };
  
  const handleEnhancePrompt = () => {
    let enhanced = prompt;
    
    if (productContext) {
      enhanced = `${productContext.name || 'product'}, ${prompt}, ${selectedStyle} style, professional product photography`;
    } else {
      enhanced = `${prompt}, ${selectedStyle} style, high quality, professional`;
    }
    
    setPrompt(enhanced);
    toast.success("Prompt enhanced with AI!");
  };
  
  const handleUseImage = (imageUrl: string) => {
    if (onImageGenerated) {
      onImageGenerated(imageUrl);
    }
    toast.success("Image applied to your design!");
  };
  
  const handleDownload = (imageUrl: string) => {
    toast.success("Image downloaded!");
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-6 h-6 text-purple-600" />
        <h3 className="text-xl font-semibold">AI Image Generator</h3>
        <Badge className="bg-purple-600">Powered by AI</Badge>
      </div>
      
      <Tabs defaultValue="generate">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="enhance">Enhance Existing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generate" className="space-y-6">
          {/* Product Context */}
          {productContext && (
            <Card className="p-4 bg-purple-50 dark:bg-purple-900/20">
              <div className="flex items-start gap-3">
                <ImageIcon className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Product Context</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {productContext.name && <><strong>Name:</strong> {productContext.name}<br /></>}
                    {productContext.category && <><strong>Category:</strong> {productContext.category}<br /></>}
                    {productContext.description && <><strong>Description:</strong> {productContext.description}</>}
                  </p>
                </div>
              </div>
            </Card>
          )}
          
          {/* Prompt Input */}
          <div>
            <Label>Image Description</Label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Describe the image you want to generate..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                onClick={handleEnhancePrompt}
                className="gap-2"
              >
                <Wand2 className="w-4 h-4" />
                Enhance
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Tip: Be specific about style, colors, lighting, and composition
            </p>
          </div>
          
          {/* Style Selection */}
          <div>
            <Label>Style</Label>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {styles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedStyle === style.id
                      ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                  }`}
                >
                  <div className="text-3xl mb-2">{style.preview}</div>
                  <div className="text-sm font-medium">{style.name}</div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Size Selection */}
          <div>
            <Label>Image Size</Label>
            <Select value={imageSize} onValueChange={setImageSize}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sizes.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Quality Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Quality</Label>
              <span className="text-sm text-gray-500">{quality}%</span>
            </div>
            <Slider
              value={[quality]}
              onValueChange={([value]) => setQuality(value)}
              min={50}
              max={100}
              step={10}
            />
          </div>
          
          {/* Generate Button */}
          <Button 
            className="w-full gap-2" 
            size="lg"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Images
              </>
            )}
          </Button>
          
          {/* Generated Images */}
          {generatedImages.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Generated Images</h4>
              <div className="grid grid-cols-2 gap-4">
                {generatedImages.map((image, idx) => (
                  <Card key={idx} className="overflow-hidden group">
                    <div className="relative">
                      <ImageWithFallback
                        src={image}
                        alt={`Generated ${idx + 1}`}
                        className="w-full aspect-square object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleUseImage(image)}
                          className="gap-1"
                        >
                          <ImageIcon className="w-4 h-4" />
                          Use
                        </Button>
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => handleDownload(image)}
                          className="gap-1"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="enhance" className="space-y-6">
          <Card className="p-8 text-center">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="font-semibold mb-2">Enhance Existing Images</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Upload an image to enhance with AI - improve resolution, fix lighting, remove backgrounds
            </p>
            <Button variant="outline" className="gap-2">
              <ImageIcon className="w-4 h-4" />
              Upload Image
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Compact version for quick access
export function QuickAIImageGenerator({ onImageGenerated }: { onImageGenerated?: (imageUrl: string) => void }) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleQuickGenerate = () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    
    setIsGenerating(true);
    
    setTimeout(() => {
      const mockImage = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop";
      if (onImageGenerated) {
        onImageGenerated(mockImage);
      }
      setIsGenerating(false);
      toast.success("Image generated!");
      setPrompt("");
    }, 1500);
  };
  
  return (
    <div className="flex gap-2">
      <Input
        placeholder="Describe image..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="flex-1"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleQuickGenerate();
          }
        }}
      />
      <Button 
        onClick={handleQuickGenerate}
        disabled={isGenerating}
        className="gap-2"
      >
        {isGenerating ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        Generate
      </Button>
    </div>
  );
}
