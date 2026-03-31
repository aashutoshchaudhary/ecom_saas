import { useState, useEffect, useCallback, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { 
  Sparkles, Save, Eye, Smartphone, Monitor, Tablet,
  Plus, Type, Image as ImageIcon, Video, Layout,
  Palette, Settings, Undo, Redo, Zap, Layers, Package,
  History, RotateCcw, Coins, GripVertical, Trash2,
  Copy, EyeOff, ChevronRight as ChevronRightIcon,
  Square, Minus, Code, Link as LinkIcon,
  MapPin, Timer, Star, Share2, FileText,
  Columns, SeparatorHorizontal, ArrowRight, Play, Quote,
  List, CheckSquare, Calendar, Mail, Phone, MessageSquare,
  ShoppingCart, Heart, Bookmark, Award, AlertCircle, Info,
  Megaphone, Table, BarChart3, PieChart, Globe, Lock,
  Upload, Search, PanelLeft, PanelRight,
  ZoomIn, ZoomOut, Pencil,
  X, ChevronUp, ChevronDown as ChevronDownIcon,
  Wand2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import { Slider } from "../../components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "../../components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip";
import { toast } from "sonner";
import { builderSections, colorSchemes, industryPlugins } from "../../lib/builder-data";
import { mockAiVersions } from "../../lib/mock-data";
import { websitesApi } from "../../lib/api/websites";
import { aiApi } from "../../lib/api/ai";
import { dataProvider } from "../../lib/data-provider";
import { sectionComponents } from "../../components/builder/section-components";
import { elementTypes, elementCategories, RenderElement } from "../../components/builder/element-types";
import { ElementProperties } from "../../components/builder/element-properties";
import { AIImageGenerator, QuickAIImageGenerator } from "../../components/builder/ai-image-generator";
import { AnimationEditor } from "../../components/builder/animation-editor";

// Types
interface CanvasElement {
  id: string;
  type: string;
  props: Record<string, any>;
  style?: Record<string, any>;
  locked?: boolean;
  visible?: boolean;
}

interface CanvasSection {
  id: string;
  type: string;
  component: string;
  props: any;
  visible: boolean;
  locked?: boolean;
  animations?: string[];
  elements?: CanvasElement[];
}

interface PageDef {
  id: string;
  name: string;
  path: string;
  sections: CanvasSection[];
  isHome?: boolean;
}

const ItemType = {
  SECTION: 'section',
  NEW_SECTION: 'new-section',
  ELEMENT: 'element',
  NEW_ELEMENT: 'new-element',
  LAYER_ITEM: 'layer-item',
};

// Draggable element from toolbox
function DraggableElementItem({ element }: { element: typeof elementTypes[0] }) {
  const [{ isDragging }, drag] = useDrag({
    type: ItemType.NEW_ELEMENT,
    item: { element },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const Icon = element.icon;
  return (
    <div
      ref={drag}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 cursor-move hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all ${isDragging ? 'opacity-40' : ''}`}
    >
      <Icon className="w-4 h-4 text-gray-500" />
      <span className="text-xs">{element.name}</span>
    </div>
  );
}

// Draggable section from library
function DraggableSectionItem({ section }: { section: typeof builderSections[0] }) {
  const [{ isDragging }, drag] = useDrag({
    type: ItemType.NEW_SECTION,
    item: { section },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  return (
    <div ref={drag} className={`cursor-move ${isDragging ? 'opacity-40' : ''}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
        <div className="aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
          <img src={section.thumbnail} alt={section.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <GripVertical className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        <div className="p-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium truncate">{section.name}</h4>
            {section.requiredPlugin && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Plugin</Badge>}
          </div>
        </div>
      </Card>
    </div>
  );
}

// Layer item component
function LayerItem({ 
  item, isSelected, onSelect, onToggleVisible, onDelete, onLock, depth = 0 
}: {
  item: CanvasSection | CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onToggleVisible: () => void;
  onDelete: () => void;
  onLock: () => void;
  depth?: number;
}) {
  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer text-xs transition-colors ${
        isSelected ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
      style={{ paddingLeft: `${8 + depth * 16}px` }}
    >
      <GripVertical className="w-3 h-3 text-gray-400 flex-shrink-0 cursor-move" />
      <span className="flex-1 truncate">{('component' in item) ? (builderSections.find(s => s.component === (item as CanvasSection).component)?.name || (item as CanvasSection).type) : (item as CanvasElement).type}</span>
      <button onClick={(e) => { e.stopPropagation(); onToggleVisible(); }} className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
        {(item.visible !== false) ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-gray-400" />}
      </button>
      <button onClick={(e) => { e.stopPropagation(); onLock(); }} className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
        {item.locked ? <Lock className="w-3 h-3 text-orange-500" /> : <Lock className="w-3 h-3 text-gray-300" />}
      </button>
      <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-0.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded">
        <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-500" />
      </button>
    </div>
  );
}

export function WebsiteBuilder() {
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [zoom, setZoom] = useState(100);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [leftTab, setLeftTab] = useState<string>("elements");
  const [rightTab, setRightTab] = useState<string>("properties");
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [undoStack, setUndoStack] = useState<PageDef[][]>([]);
  const [redoStack, setRedoStack] = useState<PageDef[][]>([]);
  const [selectedColorScheme, setSelectedColorScheme] = useState(colorSchemes[0]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [websiteId, setWebsiteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dirty, setDirty] = useState(false);

  // Pages
  const [pages, setPages] = useState<PageDef[]>([
    { id: "home", name: "Home", path: "/", sections: [], isHome: true },
    { id: "about", name: "About", path: "/about", sections: [] },
    { id: "products", name: "Products", path: "/products", sections: [] },
    { id: "contact", name: "Contact", path: "/contact", sections: [] },
    { id: "blog", name: "Blog", path: "/blog", sections: [] },
  ]);
  const [selectedPageId, setSelectedPageId] = useState("home");
  const currentPage = pages.find(p => p.id === selectedPageId) || pages[0];

  // Load website from backend on mount
  useEffect(() => {
    (async () => {
      try {
        const website = await dataProvider.getWebsite();
        if (website && website.id) {
          setWebsiteId(website.id);
          // Load pages from backend
          try {
            const pagesRes = await websitesApi.listPages(website.id);
            if (pagesRes?.data?.length) {
              const loaded: PageDef[] = pagesRes.data.map((p: any) => ({
                id: p.id,
                name: p.title,
                path: p.path || `/${p.slug}`,
                sections: p.sections || [],
                isHome: p.isHomepage,
              }));
              setPages(loaded);
              const home = loaded.find(p => p.isHome);
              if (home) setSelectedPageId(home.id);
            }
          } catch {}
          // Load structure if pages are embedded
          if (website.structure?.pages) {
            const loaded: PageDef[] = website.structure.pages.map((p: any, i: number) => ({
              id: p.id || `page-${i}`,
              name: p.name,
              path: p.slug || p.path || '/',
              sections: p.sections || [],
              isHome: p.isHome || i === 0,
            }));
            if (loaded.length > 0 && loaded[0].sections.length > 0) {
              setPages(loaded);
              setSelectedPageId(loaded[0].id);
            }
          }
        }
      } catch {}
    })();
  }, []);

  // Auto-save every 30 seconds when dirty
  useEffect(() => {
    if (!dirty || !websiteId) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      handleSave(true);
    }, 30000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [dirty, pages, websiteId]);

  // Selection
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const selectedSection = currentPage.sections.find(s => s.id === selectedSectionId) || null;
  const selectedElement = selectedSection?.elements?.find(e => e.id === selectedElementId) || null;

  const pushUndo = () => {
    setUndoStack(prev => [...prev.slice(-20), JSON.parse(JSON.stringify(pages))]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack(r => [...r, JSON.parse(JSON.stringify(pages))]);
    setPages(prev);
    setUndoStack(u => u.slice(0, -1));
    toast.success("Undone");
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(u => [...u, JSON.parse(JSON.stringify(pages))]);
    setPages(next);
    setRedoStack(r => r.slice(0, -1));
    toast.success("Redone");
  };

  const updateCurrentPage = (updater: (page: PageDef) => PageDef) => {
    pushUndo();
    setPages(pages.map(p => p.id === selectedPageId ? updater(p) : p));
    setDirty(true);
  };

  const addSection = (sectionDef: typeof builderSections[0]) => {
    const newSection: CanvasSection = {
      id: `section-${Date.now()}`,
      type: sectionDef.type,
      component: sectionDef.component,
      props: { ...sectionDef.props },
      visible: true,
      animations: sectionDef.animations,
      elements: [],
    };
    updateCurrentPage(p => ({ ...p, sections: [...p.sections, newSection] }));
    toast.success(`${sectionDef.name} added!`);
  };

  const addElement = (elementDef: typeof elementTypes[0], targetSectionId?: string) => {
    const sectionId = targetSectionId || selectedSectionId;
    if (!sectionId) {
      // Create a blank container section first
      const containerId = `section-${Date.now()}`;
      const newEl: CanvasElement = {
        id: `el-${Date.now()}`,
        type: elementDef.type,
        props: { ...elementDef.defaultProps },
        visible: true,
      };
      const newSection: CanvasSection = {
        id: containerId,
        type: 'custom',
        component: 'CustomSection',
        props: { title: 'Custom Section' },
        visible: true,
        elements: [newEl],
      };
      updateCurrentPage(p => ({ ...p, sections: [...p.sections, newSection] }));
      setSelectedSectionId(containerId);
      setSelectedElementId(newEl.id);
      toast.success(`${elementDef.name} added in new section`);
      return;
    }
    const newEl: CanvasElement = {
      id: `el-${Date.now()}`,
      type: elementDef.type,
      props: { ...elementDef.defaultProps },
      visible: true,
    };
    updateCurrentPage(p => ({
      ...p,
      sections: p.sections.map(s => s.id === sectionId ? { ...s, elements: [...(s.elements || []), newEl] } : s),
    }));
    setSelectedElementId(newEl.id);
    toast.success(`${elementDef.name} added`);
  };

  const deleteSection = (id: string) => {
    updateCurrentPage(p => ({ ...p, sections: p.sections.filter(s => s.id !== id) }));
    if (selectedSectionId === id) { setSelectedSectionId(null); setSelectedElementId(null); }
    toast.success("Section deleted");
  };

  const duplicateSection = (id: string) => {
    updateCurrentPage(p => {
      const idx = p.sections.findIndex(s => s.id === id);
      if (idx < 0) return p;
      const dup = { ...JSON.parse(JSON.stringify(p.sections[idx])), id: `section-${Date.now()}` };
      const newSections = [...p.sections];
      newSections.splice(idx + 1, 0, dup);
      return { ...p, sections: newSections };
    });
    toast.success("Section duplicated");
  };

  const moveSectionUp = (id: string) => {
    updateCurrentPage(p => {
      const idx = p.sections.findIndex(s => s.id === id);
      if (idx <= 0) return p;
      const ns = [...p.sections];
      [ns[idx - 1], ns[idx]] = [ns[idx], ns[idx - 1]];
      return { ...p, sections: ns };
    });
  };

  const moveSectionDown = (id: string) => {
    updateCurrentPage(p => {
      const idx = p.sections.findIndex(s => s.id === id);
      if (idx < 0 || idx >= p.sections.length - 1) return p;
      const ns = [...p.sections];
      [ns[idx], ns[idx + 1]] = [ns[idx + 1], ns[idx]];
      return { ...p, sections: ns };
    });
  };

  const updateElement = (elementId: string, updates: Partial<CanvasElement>) => {
    updateCurrentPage(p => ({
      ...p,
      sections: p.sections.map(s => ({
        ...s,
        elements: s.elements?.map(e => e.id === elementId ? { ...e, ...updates, props: updates.props ? { ...e.props, ...updates.props } : e.props, style: updates.style ? { ...e.style, ...updates.style } : e.style } : e)
      }))
    }));
  };

  const deleteElement = (elementId: string) => {
    updateCurrentPage(p => ({
      ...p,
      sections: p.sections.map(s => ({ ...s, elements: s.elements?.filter(e => e.id !== elementId) })),
    }));
    if (selectedElementId === elementId) setSelectedElementId(null);
    toast.success("Element deleted");
  };

  const duplicateElement = (elementId: string) => {
    updateCurrentPage(p => ({
      ...p,
      sections: p.sections.map(s => {
        const idx = s.elements?.findIndex(e => e.id === elementId) ?? -1;
        if (idx < 0 || !s.elements) return s;
        const dup = { ...JSON.parse(JSON.stringify(s.elements[idx])), id: `el-${Date.now()}` };
        const els = [...s.elements];
        els.splice(idx + 1, 0, dup);
        return { ...s, elements: els };
      })
    }));
    toast.success("Element duplicated");
  };

  const moveElementUp = (elementId: string) => {
    updateCurrentPage(p => ({
      ...p,
      sections: p.sections.map(s => {
        if (!s.elements) return s;
        const idx = s.elements.findIndex(e => e.id === elementId);
        if (idx <= 0) return s;
        const els = [...s.elements];
        [els[idx - 1], els[idx]] = [els[idx], els[idx - 1]];
        return { ...s, elements: els };
      })
    }));
  };

  const moveElementDown = (elementId: string) => {
    updateCurrentPage(p => ({
      ...p,
      sections: p.sections.map(s => {
        if (!s.elements) return s;
        const idx = s.elements.findIndex(e => e.id === elementId);
        if (idx < 0 || idx >= s.elements.length - 1) return s;
        const els = [...s.elements];
        [els[idx], els[idx + 1]] = [els[idx + 1], els[idx]];
        return { ...s, elements: els };
      })
    }));
  };

  const addPage = () => {
    const id = `page-${Date.now()}`;
    setPages([...pages, { id, name: "New Page", path: `/${id}`, sections: [] }]);
    setSelectedPageId(id);
    toast.success("New page created");
  };

  const deletePage = (id: string) => {
    if (pages.length <= 1) return;
    setPages(pages.filter(p => p.id !== id));
    if (selectedPageId === id) setSelectedPageId(pages[0].id);
    toast.success("Page deleted");
  };

  const handleSave = useCallback(async (auto = false) => {
    setSaving(true);
    try {
      if (websiteId) {
        const structure = { pages: pages.map(p => ({ id: p.id, name: p.name, slug: p.path, isHome: p.isHome, sections: p.sections })) };
        await websitesApi.updateStructure(websiteId, structure);
        // Also save each page's sections individually
        for (const page of pages) {
          try { await websitesApi.updatePageSections(websiteId, page.id, page.sections); } catch {}
        }
      } else {
        // Create a new website if none exists
        const website = await websitesApi.create({ name: 'My Website' });
        setWebsiteId(website.id);
        const structure = { pages: pages.map(p => ({ id: p.id, name: p.name, slug: p.path, isHome: p.isHome, sections: p.sections })) };
        await websitesApi.updateStructure(website.id, structure);
      }
      setDirty(false);
      setLastSaved(new Date());
      toast.success(auto ? "Auto-saved" : "Website saved successfully!");
    } catch (err) {
      // Save locally as fallback
      try { localStorage.setItem('sf_builder_pages', JSON.stringify(pages)); } catch {}
      if (!auto) toast.success("Saved locally (backend unavailable)");
    } finally {
      setSaving(false);
    }
  }, [websiteId, pages]);

  const handlePublish = useCallback(async () => {
    setPublishing(true);
    try {
      if (!websiteId) await handleSave();
      if (websiteId) {
        await websitesApi.publish(websiteId);
        toast.success("Website published successfully!");
      }
    } catch {
      toast.error("Publish failed. Please try again.");
    } finally {
      setPublishing(false);
    }
  }, [websiteId, handleSave]);

  const handleAiGenerate = useCallback(async () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    try {
      const result = await aiApi.generateWebsite({
        businessName: aiPrompt,
        industry: 'general',
        description: aiPrompt,
        goals: 'Create a professional website',
      });
      if (result && (result as any).pages) {
        const genPages: PageDef[] = (result as any).pages.map((p: any, i: number) => ({
          id: p.id || `gen-${Date.now()}-${i}`,
          name: p.name,
          path: p.slug || '/',
          sections: (p.sections || []).map((s: any) => ({
            id: s.id || `section-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            type: s.type || 'hero',
            component: s.component || 'HeroGradient',
            props: s.props || {},
            visible: true,
            elements: [],
          })),
          isHome: p.isHome || i === 0,
        }));
        if (genPages.length > 0) {
          pushUndo();
          setPages(genPages);
          setSelectedPageId(genPages[0].id);
          setDirty(true);
          toast.success("AI generated your website! Review and customize.");
        }
      }
      setShowAiAssistant(false);
      setAiPrompt("");
    } catch {
      toast.error("AI generation failed. Try again or build manually.");
    } finally {
      setAiGenerating(false);
    }
  }, [aiPrompt]);

  const viewModeWidths: Record<string, string> = {
    desktop: "w-full",
    tablet: "max-w-[768px]",
    mobile: "max-w-[375px]",
  };

  const installedPlugins = industryPlugins.filter(p => p.installed);
  const availableSections = builderSections.filter(section => {
    if (!section.requiredPlugin) return true;
    return installedPlugins.some(p => p.id === section.requiredPlugin);
  });
  const sectionsByCategory = availableSections.reduce((acc, section) => {
    if (!acc[section.category]) acc[section.category] = [];
    acc[section.category].push(section);
    return acc;
  }, {} as Record<string, typeof availableSections>);

  const elementsByCategory = elementTypes.reduce((acc, el) => {
    if (!acc[el.category]) acc[el.category] = [];
    acc[el.category].push(el);
    return acc;
  }, {} as Record<string, typeof elementTypes>);

  // Canvas drop handler
  const [{ isOver: canvasIsOver }, canvasDrop] = useDrop({
    accept: [ItemType.NEW_SECTION, ItemType.NEW_ELEMENT],
    drop: (item: any, monitor) => {
      if (monitor.didDrop()) return;
      if (item.section) addSection(item.section);
      if (item.element) addElement(item.element);
    },
    collect: (monitor) => ({ isOver: monitor.isOver({ shallow: true }) }),
  });

  return (
    <DndProvider backend={HTML5Backend}>
      <TooltipProvider delayDuration={300}>
        <div className="h-[calc(100vh-4rem)] flex flex-col bg-gray-50 dark:bg-gray-950">
          {/* Top Toolbar */}
          <div className="h-12 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-3 gap-2 flex-shrink-0">
            {/* Left tools */}
            <div className="flex items-center gap-1.5">
              <Tooltip><TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowLeftPanel(!showLeftPanel)}>
                  <PanelLeft className="w-4 h-4" />
                </Button>
              </TooltipTrigger><TooltipContent>Toggle Left Panel</TooltipContent></Tooltip>

              <Separator orientation="vertical" className="h-5" />

              {/* View Mode */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
                {([
                  { mode: "desktop", icon: Monitor },
                  { mode: "tablet", icon: Tablet },
                  { mode: "mobile", icon: Smartphone },
                ] as const).map(({ mode, icon: Icon }) => (
                  <Tooltip key={mode}><TooltipTrigger asChild>
                    <button
                      onClick={() => setViewMode(mode)}
                      className={`p-1.5 rounded-md transition-colors ${viewMode === mode ? 'bg-white dark:bg-gray-700 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  </TooltipTrigger><TooltipContent className="capitalize">{mode}</TooltipContent></Tooltip>
                ))}
              </div>

              <Separator orientation="vertical" className="h-5" />

              {/* Zoom */}
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setZoom(Math.max(50, zoom - 10))}>
                  <ZoomOut className="w-3.5 h-3.5" />
                </Button>
                <span className="text-xs w-10 text-center">{zoom}%</span>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setZoom(Math.min(200, zoom + 10))}>
                  <ZoomIn className="w-3.5 h-3.5" />
                </Button>
              </div>

              <Separator orientation="vertical" className="h-5" />

              {/* Page Selector */}
              <Select value={selectedPageId} onValueChange={setSelectedPageId}>
                <SelectTrigger className="h-8 w-[140px] text-xs">
                  <FileText className="w-3.5 h-3.5 mr-1.5" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pages.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} {p.isHome && "(Home)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Center tools */}
            <div className="flex items-center gap-1">
              <Tooltip><TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleUndo} disabled={undoStack.length === 0}>
                  <Undo className="w-4 h-4" />
                </Button>
              </TooltipTrigger><TooltipContent>Undo (Ctrl+Z)</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleRedo} disabled={redoStack.length === 0}>
                  <Redo className="w-4 h-4" />
                </Button>
              </TooltipTrigger><TooltipContent>Redo (Ctrl+Y)</TooltipContent></Tooltip>
            </div>

            {/* Right tools */}
            <div className="flex items-center gap-1.5">
              <Tooltip><TooltipTrigger asChild>
                <Button variant={showAiAssistant ? "default" : "ghost"} size="sm" className="h-8 gap-1.5" onClick={() => { setShowAiAssistant(!showAiAssistant); setShowVersionHistory(false); }}>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline text-xs">AI</span>
                </Button>
              </TooltipTrigger><TooltipContent>AI Assistant</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild>
                <Button variant={showVersionHistory ? "default" : "ghost"} size="sm" className="h-8 gap-1.5" onClick={() => { setShowVersionHistory(!showVersionHistory); setShowAiAssistant(false); }}>
                  <History className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline text-xs">Versions</span>
                </Button>
              </TooltipTrigger><TooltipContent>Version History</TooltipContent></Tooltip>

              <Separator orientation="vertical" className="h-5" />

              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                <Eye className="w-3.5 h-3.5" /> Preview
              </Button>
              <Button size="sm" onClick={() => handleSave()} disabled={saving} className="h-8 gap-1.5 text-xs">
                <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : dirty ? 'Save*' : 'Saved'}
              </Button>
              <Button size="sm" onClick={handlePublish} disabled={publishing} className="h-8 gap-1.5 text-xs bg-gradient-to-r from-purple-600 to-blue-600 hidden md:flex">
                {publishing ? 'Publishing...' : 'Publish'}
              </Button>
              {lastSaved && <span className="text-[10px] text-gray-400 hidden lg:block">Last saved: {lastSaved.toLocaleTimeString()}</span>}

              <Separator orientation="vertical" className="h-5" />

              <Tooltip><TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowRightPanel(!showRightPanel)}>
                  <PanelRight className="w-4 h-4" />
                </Button>
              </TooltipTrigger><TooltipContent>Toggle Right Panel</TooltipContent></Tooltip>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* === LEFT PANEL === */}
            {showLeftPanel && (
              <div className="w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col flex-shrink-0">
                <Tabs value={leftTab} onValueChange={setLeftTab} className="h-full flex flex-col">
                  <TabsList className="w-full grid grid-cols-5 rounded-none border-b h-10 flex-shrink-0">
                    <Tooltip><TooltipTrigger asChild>
                      <TabsTrigger value="elements" className="text-xs px-1"><Plus className="w-3.5 h-3.5" /></TabsTrigger>
                    </TooltipTrigger><TooltipContent>Elements</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild>
                      <TabsTrigger value="sections" className="text-xs px-1"><Layout className="w-3.5 h-3.5" /></TabsTrigger>
                    </TooltipTrigger><TooltipContent>Sections</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild>
                      <TabsTrigger value="layers" className="text-xs px-1"><Layers className="w-3.5 h-3.5" /></TabsTrigger>
                    </TooltipTrigger><TooltipContent>Layers</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild>
                      <TabsTrigger value="pages" className="text-xs px-1"><FileText className="w-3.5 h-3.5" /></TabsTrigger>
                    </TooltipTrigger><TooltipContent>Pages</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild>
                      <TabsTrigger value="theme" className="text-xs px-1"><Palette className="w-3.5 h-3.5" /></TabsTrigger>
                    </TooltipTrigger><TooltipContent>Theme</TooltipContent></Tooltip>
                  </TabsList>

                  {/* Elements Tab */}
                  <TabsContent value="elements" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full">
                      <div className="p-3 space-y-4">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                          <Input placeholder="Search elements..." className="pl-8 h-8 text-xs" />
                        </div>

                        <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <p className="text-[11px] text-purple-700 dark:text-purple-300">Drag elements to the canvas or click to add them to the selected section.</p>
                        </div>

                        {Object.entries(elementsByCategory).map(([category, elements]) => (
                          <div key={category}>
                            <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">{category}</h3>
                            <div className="grid grid-cols-2 gap-1.5">
                              {elements.map(el => (
                                <div
                                  key={el.id}
                                  onClick={() => addElement(el)}
                                  className="cursor-pointer"
                                >
                                  <DraggableElementItem element={el} />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}

                        {/* Upload Section */}
                        <Separator />
                        <div>
                          <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Upload</h3>
                          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center hover:border-purple-400 transition-colors cursor-pointer">
                            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                            <p className="text-xs text-gray-500">Drop images, videos, or files</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, SVG, MP4, PDF</p>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  {/* Sections Tab */}
                  <TabsContent value="sections" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full">
                      <div className="p-3 space-y-4">
                        {Object.entries(sectionsByCategory).map(([category, sections]) => (
                          <div key={category}>
                            <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              {category}
                              <Badge variant="secondary" className="text-[10px] h-4 px-1">{sections.length}</Badge>
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                              {sections.map(s => (
                                <div key={s.id} onClick={() => addSection(s)} className="cursor-pointer">
                                  <DraggableSectionItem section={s} />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  {/* Layers Tab */}
                  <TabsContent value="layers" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full">
                      <div className="p-2 space-y-0.5">
                        {currentPage.sections.length === 0 ? (
                          <div className="text-center py-12 text-gray-400">
                            <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-xs">No layers yet</p>
                          </div>
                        ) : (
                          currentPage.sections.map((section) => (
                            <div key={section.id}>
                              <LayerItem
                                item={section}
                                isSelected={selectedSectionId === section.id && !selectedElementId}
                                onSelect={() => { setSelectedSectionId(section.id); setSelectedElementId(null); }}
                                onToggleVisible={() => updateCurrentPage(p => ({ ...p, sections: p.sections.map(s => s.id === section.id ? { ...s, visible: !s.visible } : s) }))}
                                onDelete={() => deleteSection(section.id)}
                                onLock={() => updateCurrentPage(p => ({ ...p, sections: p.sections.map(s => s.id === section.id ? { ...s, locked: !s.locked } : s) }))}
                              />
                              {section.elements?.map(el => (
                                <LayerItem
                                  key={el.id}
                                  item={el}
                                  isSelected={selectedElementId === el.id}
                                  onSelect={() => { setSelectedSectionId(section.id); setSelectedElementId(el.id); }}
                                  onToggleVisible={() => updateElement(el.id, { visible: el.visible === false ? true : false } as any)}
                                  onDelete={() => deleteElement(el.id)}
                                  onLock={() => updateElement(el.id, { locked: !el.locked } as any)}
                                  depth={1}
                                />
                              ))}
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  {/* Pages Tab */}
                  <TabsContent value="pages" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full">
                      <div className="p-3 space-y-2">
                        <Button variant="outline" size="sm" className="w-full gap-2 h-8 text-xs" onClick={addPage}>
                          <Plus className="w-3.5 h-3.5" /> Add Page
                        </Button>
                        {pages.map(page => (
                          <div
                            key={page.id}
                            onClick={() => setSelectedPageId(page.id)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                              selectedPageId === page.id ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                          >
                            <FileText className="w-4 h-4 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{page.name}</p>
                              <p className="text-[10px] text-gray-500 truncate">{page.path}</p>
                            </div>
                            <Badge variant="secondary" className="text-[10px] h-4 px-1">{page.sections.length}</Badge>
                            {!page.isHome && (
                              <button onClick={(e) => { e.stopPropagation(); deletePage(page.id); }} className="p-0.5 hover:bg-red-100 rounded">
                                <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  {/* Theme Tab */}
                  <TabsContent value="theme" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full">
                      <div className="p-3 space-y-4">
                        <div>
                          <Label className="text-xs mb-2 block">Color Schemes</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {colorSchemes.map(scheme => (
                              <button
                                key={scheme.id}
                                onClick={() => setSelectedColorScheme(scheme)}
                                className={`p-2.5 rounded-lg border-2 transition-all ${
                                  selectedColorScheme.id === scheme.id ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                                }`}
                              >
                                <div className="flex gap-1 mb-1.5">
                                  <div className="w-5 h-5 rounded" style={{ backgroundColor: scheme.primary }} />
                                  <div className="w-5 h-5 rounded" style={{ backgroundColor: scheme.secondary }} />
                                  <div className="w-5 h-5 rounded" style={{ backgroundColor: scheme.accent }} />
                                </div>
                                <div className="text-[10px] font-medium">{scheme.name}</div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <Label className="text-xs">Typography</Label>
                          <Select defaultValue="Inter">
                            <SelectTrigger className="mt-1.5 h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {['Inter', 'Poppins', 'Roboto', 'Open Sans', 'Playfair Display', 'Montserrat'].map(f => (
                                <SelectItem key={f} value={f}>{f}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-xs">Border Radius</Label>
                          <Select defaultValue="md">
                            <SelectTrigger className="mt-1.5 h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="sm">Small</SelectItem>
                              <SelectItem value="md">Medium</SelectItem>
                              <SelectItem value="lg">Large</SelectItem>
                              <SelectItem value="full">Full</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Separator />

                        <div>
                          <Label className="text-xs">Custom CSS</Label>
                          <textarea
                            className="mt-1.5 w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-900 text-green-400 font-mono text-[11px] min-h-[80px]"
                            placeholder=".custom-class { }"
                          />
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* === CANVAS === */}
            <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-950 relative" ref={canvasDrop}>
              <div className="p-4 md:p-6 flex justify-center min-h-full">
                <div
                  className={`${viewModeWidths[viewMode]} transition-all duration-300 mx-auto`}
                  style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                >
                  {currentPage.sections.length === 0 ? (
                    <div className={`min-h-[600px] border-4 border-dashed rounded-2xl flex items-center justify-center transition-colors ${
                      canvasIsOver ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900'
                    }`}>
                      <div className="text-center p-8">
                        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Plus className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Start Building Your Page</h3>
                        <p className="text-gray-500 text-sm max-w-md mb-4">
                          Drag sections or elements from the left panel, or use AI to generate content
                        </p>
                        <div className="flex gap-2 justify-center flex-wrap">
                          <Button variant="outline" size="sm" className="gap-2" onClick={() => setLeftTab("sections")}>
                            <Layout className="w-4 h-4" /> Browse Sections
                          </Button>
                          <Button variant="outline" size="sm" className="gap-2" onClick={() => setLeftTab("elements")}>
                            <Plus className="w-4 h-4" /> Add Elements
                          </Button>
                          <Button size="sm" className="gap-2" onClick={() => { setShowAiAssistant(true); toast.success("AI is ready to generate your page! (50 credits)"); }}>
                            <Sparkles className="w-4 h-4" /> Generate with AI
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-gray-900 shadow-2xl rounded-lg overflow-hidden">
                      {currentPage.sections.map((section) => {
                        const SectionComponent = (sectionComponents as any)[section.component];
                        const isSelected = selectedSectionId === section.id;

                        return (
                          <div key={section.id} className="relative group">
                            {/* Section Hover Controls */}
                            <div className={`absolute top-2 right-2 z-20 flex gap-1 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                              <Button size="sm" variant="secondary" className="h-7 w-7 p-0 shadow-md" onClick={() => moveSectionUp(section.id)}>
                                <ChevronUp className="w-3.5 h-3.5" />
                              </Button>
                              <Button size="sm" variant="secondary" className="h-7 w-7 p-0 shadow-md" onClick={() => moveSectionDown(section.id)}>
                                <ChevronDownIcon className="w-3.5 h-3.5" />
                              </Button>
                              <Button size="sm" variant="secondary" className="h-7 w-7 p-0 shadow-md" onClick={() => duplicateSection(section.id)}>
                                <Copy className="w-3.5 h-3.5" />
                              </Button>
                              <Button size="sm" variant="secondary" className="h-7 w-7 p-0 shadow-md" onClick={() => {
                                setSelectedSectionId(section.id);
                                setSelectedElementId(null);
                                setShowRightPanel(true);
                                setRightTab("properties");
                              }}>
                                <Settings className="w-3.5 h-3.5" />
                              </Button>
                              <Button size="sm" variant="secondary" className="h-7 w-7 p-0 shadow-md text-red-500" onClick={() => deleteSection(section.id)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>

                            {/* Section Label */}
                            <div className={`absolute top-2 left-2 z-20 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                              <Badge className="bg-purple-600 text-[10px]">
                                {builderSections.find(s => s.component === section.component)?.name || section.type}
                              </Badge>
                            </div>

                            <div
                              onClick={() => { setSelectedSectionId(section.id); setSelectedElementId(null); }}
                              className={`relative cursor-pointer transition-all ${
                                isSelected ? 'ring-2 ring-purple-600 ring-inset' : 'hover:ring-1 hover:ring-purple-300 hover:ring-inset'
                              }`}
                            >
                              {section.visible !== false ? (
                                <>
                                  {SectionComponent ? (
                                    <SectionComponent data={section.props} isEditing={isSelected} />
                                  ) : (
                                    <div className="p-8 min-h-[100px]">
                                      <p className="text-sm text-gray-500 mb-3">Custom Section</p>
                                    </div>
                                  )}

                                  {/* Render inline elements */}
                                  {section.elements && section.elements.length > 0 && (
                                    <div className="px-6 py-4 space-y-3">
                                      {section.elements.map(el => (
                                        el.visible !== false && (
                                          <div
                                            key={el.id}
                                            onClick={(e) => { e.stopPropagation(); setSelectedSectionId(section.id); setSelectedElementId(el.id); }}
                                            style={el.style || {}}
                                          >
                                            <RenderElement
                                              element={el}
                                              isSelected={selectedElementId === el.id}
                                              onSelect={() => { setSelectedSectionId(section.id); setSelectedElementId(el.id); }}
                                            />
                                          </div>
                                        )
                                      ))}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="p-12 bg-gray-100 dark:bg-gray-800 text-center">
                                  <EyeOff className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                                  <p className="text-xs text-gray-500">Section hidden</p>
                                </div>
                              )}
                            </div>

                            {/* Add between sections */}
                            <div className="h-0 relative z-10">
                              <div className="absolute inset-x-0 -bottom-3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="sm" variant="outline" className="h-6 px-2 bg-white dark:bg-gray-800 shadow-lg text-[10px]">
                                  <Plus className="w-3 h-3 mr-1" /> Add Section
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* === RIGHT PANEL === */}
            {showRightPanel && (
              <div className="w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col flex-shrink-0">
                {/* If element selected, show element properties */}
                {selectedElement ? (
                  <ElementProperties
                    element={selectedElement}
                    onUpdate={(id, updates) => updateElement(id, updates)}
                    onDelete={deleteElement}
                    onDuplicate={duplicateElement}
                    onMoveUp={moveElementUp}
                    onMoveDown={moveElementDown}
                  />
                ) : selectedSection ? (
                  /* Section properties */
                  <div className="h-full flex flex-col">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        <h3 className="text-sm font-semibold">Section Properties</h3>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setSelectedSectionId(null); setSelectedElementId(null); }}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <Tabs value={rightTab} onValueChange={setRightTab} className="flex-1 flex flex-col">
                      <TabsList className="w-full grid grid-cols-3 rounded-none border-b h-9 flex-shrink-0">
                        <TabsTrigger value="properties" className="text-xs">Props</TabsTrigger>
                        <TabsTrigger value="animations" className="text-xs">Animate</TabsTrigger>
                        <TabsTrigger value="ai" className="text-xs">AI Tools</TabsTrigger>
                      </TabsList>

                      <ScrollArea className="flex-1">
                        <TabsContent value="properties" className="p-3 space-y-3 m-0">
                          <div>
                            <Label className="text-xs">Section Type</Label>
                            <Input value={selectedSection.component} disabled className="mt-1 h-8 text-xs" />
                          </div>
                          {selectedSection.props.title !== undefined && (
                            <div>
                              <Label className="text-xs">Title</Label>
                              <Input
                                value={selectedSection.props.title}
                                onChange={(e) => updateCurrentPage(p => ({
                                  ...p,
                                  sections: p.sections.map(s => s.id === selectedSection.id ? { ...s, props: { ...s.props, title: e.target.value } } : s)
                                }))}
                                className="mt-1 h-8 text-xs"
                              />
                            </div>
                          )}
                          {selectedSection.props.subtitle !== undefined && (
                            <div>
                              <Label className="text-xs">Subtitle</Label>
                              <Input
                                value={selectedSection.props.subtitle}
                                onChange={(e) => updateCurrentPage(p => ({
                                  ...p,
                                  sections: p.sections.map(s => s.id === selectedSection.id ? { ...s, props: { ...s.props, subtitle: e.target.value } } : s)
                                }))}
                                className="mt-1 h-8 text-xs"
                              />
                            </div>
                          )}
                          {selectedSection.props.ctaText !== undefined && (
                            <div>
                              <Label className="text-xs">CTA Text</Label>
                              <Input
                                value={selectedSection.props.ctaText}
                                onChange={(e) => updateCurrentPage(p => ({
                                  ...p,
                                  sections: p.sections.map(s => s.id === selectedSection.id ? { ...s, props: { ...s.props, ctaText: e.target.value } } : s)
                                }))}
                                className="mt-1 h-8 text-xs"
                              />
                            </div>
                          )}

                          <Separator />

                          <div>
                            <Label className="text-xs mb-2 block">Quick Actions</Label>
                            <div className="grid grid-cols-2 gap-1.5">
                              <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => deleteSection(selectedSection.id)}>
                                <Trash2 className="w-3 h-3 mr-1" /> Delete
                              </Button>
                              <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => duplicateSection(selectedSection.id)}>
                                <Copy className="w-3 h-3 mr-1" /> Duplicate
                              </Button>
                              <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => moveSectionUp(selectedSection.id)}>
                                <ChevronUp className="w-3 h-3 mr-1" /> Move Up
                              </Button>
                              <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => moveSectionDown(selectedSection.id)}>
                                <ChevronDownIcon className="w-3 h-3 mr-1" /> Move Down
                              </Button>
                            </div>
                          </div>

                          <Separator />

                          <div>
                            <Label className="text-xs mb-2 block">Add Element to Section</Label>
                            <div className="grid grid-cols-3 gap-1.5">
                              {elementTypes.slice(0, 9).map(el => {
                                const Icon = el.icon;
                                return (
                                  <Button
                                    key={el.id}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-[10px] gap-1 px-1.5"
                                    onClick={() => addElement(el, selectedSection.id)}
                                  >
                                    <Icon className="w-3 h-3" /> {el.name.split(' ')[0]}
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="animations" className="p-3 m-0">
                          <AnimationEditor
                            elementId={selectedSection.id}
                            currentAnimation={selectedSection.animations?.[0]}
                            onAnimationChange={(config) => {
                              updateCurrentPage(p => ({
                                ...p,
                                sections: p.sections.map(s => s.id === selectedSection.id ? { ...s, animations: [config.type] } : s)
                              }));
                              toast.success("Animation updated!");
                            }}
                          />
                        </TabsContent>

                        <TabsContent value="ai" className="p-3 m-0">
                          <AIImageGenerator
                            productContext={{ name: selectedSection.props.title, description: selectedSection.props.subtitle }}
                            onImageGenerated={(url) => {
                              updateCurrentPage(p => ({
                                ...p,
                                sections: p.sections.map(s => s.id === selectedSection.id ? { ...s, props: { ...s.props, image: url } } : s)
                              }));
                            }}
                          />
                        </TabsContent>
                      </ScrollArea>
                    </Tabs>
                  </div>
                ) : showAiAssistant ? (
                  /* AI Assistant Panel */
                  <div className="h-full flex flex-col">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2 flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <h3 className="text-sm font-semibold">AI Assistant</h3>
                    </div>
                    <ScrollArea className="flex-1 p-3">
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                          <p className="text-xs">I can help you:</p>
                          <ul className="text-xs mt-1.5 space-y-0.5 ml-3">
                            <li>• Generate entire pages with AI</li>
                            <li>• Create product descriptions</li>
                            <li>• Generate images for sections</li>
                            <li>• Suggest color schemes & layouts</li>
                            <li>• Optimize for SEO & mobile</li>
                            <li>• Add animations & interactions</li>
                          </ul>
                        </div>

                        <div>
                          <Label className="text-xs mb-1.5 block">Quick AI Image</Label>
                          <QuickAIImageGenerator />
                        </div>

                        <Separator />

                        <div className="space-y-1.5">
                          <h4 className="text-xs font-semibold">Quick Actions</h4>
                          {[
                            { label: "Generate Full Page", icon: Wand2, credits: 100 },
                            { label: "Regenerate Design", icon: RotateCcw, credits: 50 },
                            { label: "Write Descriptions", icon: Pencil, credits: 10 },
                            { label: "Optimize for Mobile", icon: Smartphone, credits: 20 },
                            { label: "AI SEO Suggestions", icon: Search, credits: 15 },
                          ].map(action => (
                            <Button
                              key={action.label}
                              variant="outline"
                              size="sm"
                              className="w-full justify-between text-xs h-8"
                              onClick={() => toast.success(`${action.label}... (${action.credits} credits)`)}
                            >
                              <span className="flex items-center gap-1.5">
                                <action.icon className="w-3 h-3" /> {action.label}
                              </span>
                              <Badge variant="secondary" className="text-[10px] h-4 px-1">{action.credits}cr</Badge>
                            </Button>
                          ))}
                        </div>

                        <Separator />

                        <div className="p-2.5 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Coins className="w-3.5 h-3.5 text-orange-600" />
                            <span className="text-xs font-medium">Credits Balance: 1,250</span>
                          </div>
                          <p className="text-[10px] text-gray-500">AI operations consume credits based on complexity</p>
                        </div>
                      </div>
                    </ScrollArea>
                    <div className="p-3 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
                      <div className="flex gap-1.5">
                        <Input
                          placeholder="Ask AI anything..."
                          className="h-8 text-xs"
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && aiPrompt.trim()) handleAiGenerate();
                          }}
                        />
                        <Button size="sm" className="h-8 w-8 p-0" onClick={handleAiGenerate} disabled={aiGenerating}>
                          {aiGenerating ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : showVersionHistory ? (
                  /* Version History Panel */
                  <div className="h-full flex flex-col">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2 flex-shrink-0">
                      <History className="w-4 h-4 text-purple-600" />
                      <h3 className="text-sm font-semibold">Version History</h3>
                    </div>
                    <ScrollArea className="flex-1 p-3">
                      <div className="space-y-3">
                        <Button className="w-full gap-2 h-8 text-xs" onClick={() => toast.success("New version created! (50 credits)")}>
                          <RotateCcw className="w-3.5 h-3.5" /> Regenerate New Version
                        </Button>
                        {mockAiVersions.map(version => (
                          <div
                            key={version.id}
                            className={`rounded-lg border overflow-hidden cursor-pointer transition-all ${
                              version.status === "current" ? "border-purple-300 ring-2 ring-purple-200 dark:border-purple-700" : "border-gray-200 dark:border-gray-700 hover:border-purple-200"
                            }`}
                          >
                            <img src={version.thumbnail} alt={version.name} className="w-full h-28 object-cover" />
                            <div className="p-2.5">
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="text-xs font-medium">{version.name}</span>
                                <Badge variant={version.status === "current" ? "default" : "secondary"} className="text-[10px]">{version.status}</Badge>
                              </div>
                              <p className="text-[10px] text-gray-500">{new Date(version.createdAt).toLocaleString()}</p>
                              {version.status !== "current" && (
                                <div className="flex gap-1.5 mt-2">
                                  <Button variant="outline" size="sm" className="flex-1 text-[10px] h-7" onClick={() => toast.success(`Restored ${version.name}`)}>Restore</Button>
                                  <Button variant="ghost" size="sm" className="text-[10px] h-7">Compare</Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                ) : (
                  /* Default right panel - getting started */
                  <div className="h-full flex flex-col">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
                      <h3 className="text-sm font-semibold">Quick Start</h3>
                    </div>
                    <ScrollArea className="flex-1 p-3">
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                          <h4 className="text-xs font-semibold mb-1">Getting Started</h4>
                          <p className="text-[11px] text-gray-600 dark:text-gray-400">
                            Select a section or element on the canvas to edit its properties here.
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <h4 className="text-xs font-semibold">Keyboard Shortcuts</h4>
                          {[
                            { key: "Ctrl+Z", desc: "Undo" },
                            { key: "Ctrl+Y", desc: "Redo" },
                            { key: "Ctrl+S", desc: "Save" },
                            { key: "Ctrl+D", desc: "Duplicate" },
                            { key: "Delete", desc: "Remove selected" },
                            { key: "Ctrl+C/V", desc: "Copy/Paste" },
                          ].map(shortcut => (
                            <div key={shortcut.key} className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">{shortcut.desc}</span>
                              <Badge variant="outline" className="text-[10px] font-mono">{shortcut.key}</Badge>
                            </div>
                          ))}
                        </div>

                        <Separator />

                        <div className="space-y-1.5">
                          <h4 className="text-xs font-semibold">Compliance</h4>
                          <div className="grid grid-cols-2 gap-1.5">
                            {[
                              { label: "PCI DSS L1", color: "text-blue-600" },
                              { label: "SOC 2 Type II", color: "text-green-600" },
                              { label: "GDPR Ready", color: "text-purple-600" },
                              { label: "256-bit SSL", color: "text-orange-600" },
                            ].map(badge => (
                              <div key={badge.label} className="flex items-center gap-1 text-[10px]">
                                <Lock className={`w-3 h-3 ${badge.color}`} />
                                <span>{badge.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </TooltipProvider>
    </DndProvider>
  );
}
