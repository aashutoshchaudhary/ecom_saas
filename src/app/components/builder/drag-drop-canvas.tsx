import { useState, useCallback } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { 
  GripVertical, 
  Trash2, 
  Copy, 
  Eye, 
  EyeOff, 
  Settings,
  ChevronUp,
  ChevronDown,
  Plus
} from "lucide-react";
import { sectionComponents } from "./section-components";
import { builderSections, type BuilderSection } from "../../lib/builder-data";
import { toast } from "sonner";

interface CanvasSection {
  id: string;
  type: string;
  component: string;
  props: any;
  visible: boolean;
  animations?: string[];
}

interface DragDropCanvasProps {
  sections: CanvasSection[];
  onSectionsChange: (sections: CanvasSection[]) => void;
  onSectionEdit: (section: CanvasSection) => void;
  selectedSectionId?: string;
}

const ItemType = {
  SECTION: 'section',
  NEW_SECTION: 'new-section'
};

function DraggableSection({
  section,
  index,
  moveSection,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleVisibility,
  isSelected
}: {
  section: CanvasSection;
  index: number;
  moveSection: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (section: CanvasSection) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  isSelected: boolean;
}) {
  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemType.SECTION,
    item: { index, section },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });
  
  const [, drop] = useDrop({
    accept: ItemType.SECTION,
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveSection(item.index, index);
        item.index = index;
      }
    }
  });
  
  const SectionComponent = (sectionComponents as any)[section.component];
  
  if (!SectionComponent) {
    return (
      <div className="p-8 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg">
        <p className="text-red-600 dark:text-red-400">Component not found: {section.component}</p>
      </div>
    );
  }
  
  return (
    <div
      ref={(node) => preview(drop(node))}
      className={`relative group ${isDragging ? 'opacity-50' : ''} ${
        isSelected ? 'ring-2 ring-purple-600 ring-offset-2' : ''
      }`}
      onClick={() => onEdit(section)}
    >
      {/* Drag Handle and Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div 
          ref={drag}
          className="cursor-move bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <GripVertical className="w-5 h-5" />
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(section);
          }}
        >
          <Settings className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility(section.id);
          }}
        >
          {section.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(section.id);
          }}
        >
          <Copy className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(section.id);
          }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Section Label */}
      <div className="absolute top-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <Badge className="bg-purple-600">
          {builderSections.find(s => s.component === section.component)?.name || section.type}
        </Badge>
      </div>
      
      {/* Section Content */}
      {section.visible ? (
        <SectionComponent data={section.props} isEditing={isSelected} />
      ) : (
        <div className="p-12 bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
          <EyeOff className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Section hidden</p>
        </div>
      )}
      
      {/* Add Section Button (between sections) */}
      <div className="h-0 relative">
        <div className="absolute inset-x-0 -top-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="outline"
            className="bg-white dark:bg-gray-800 shadow-lg"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function DropZone({
  onDrop,
  isEmpty
}: {
  onDrop: (sectionType: BuilderSection) => void;
  isEmpty: boolean;
}) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemType.NEW_SECTION,
    drop: (item: { section: BuilderSection }) => {
      onDrop(item.section);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  });
  
  if (!isEmpty) return null;
  
  return (
    <div
      ref={drop}
      className={`min-h-[400px] border-4 border-dashed rounded-2xl flex items-center justify-center transition-colors ${
        isOver && canDrop
          ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
          : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'
      }`}
    >
      <div className="text-center p-8">
        <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plus className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Start Building</h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          Drag and drop sections from the sidebar to start creating your page
        </p>
      </div>
    </div>
  );
}

export function DragDropCanvas({
  sections,
  onSectionsChange,
  onSectionEdit,
  selectedSectionId
}: DragDropCanvasProps) {
  const moveSection = useCallback((dragIndex: number, hoverIndex: number) => {
    const updatedSections = [...sections];
    const [removed] = updatedSections.splice(dragIndex, 1);
    updatedSections.splice(hoverIndex, 0, removed);
    onSectionsChange(updatedSections);
  }, [sections, onSectionsChange]);
  
  const handleAddSection = (sectionType: BuilderSection) => {
    const newSection: CanvasSection = {
      id: `section-${Date.now()}`,
      type: sectionType.type,
      component: sectionType.component,
      props: sectionType.props,
      visible: true,
      animations: sectionType.animations
    };
    onSectionsChange([...sections, newSection]);
    toast.success(`${sectionType.name} added!`);
  };
  
  const handleDeleteSection = (id: string) => {
    onSectionsChange(sections.filter(s => s.id !== id));
    toast.success("Section deleted");
  };
  
  const handleDuplicateSection = (id: string) => {
    const section = sections.find(s => s.id === id);
    if (section) {
      const duplicated = {
        ...section,
        id: `section-${Date.now()}`
      };
      const index = sections.findIndex(s => s.id === id);
      const updated = [...sections];
      updated.splice(index + 1, 0, duplicated);
      onSectionsChange(updated);
      toast.success("Section duplicated");
    }
  };
  
  const handleToggleVisibility = (id: string) => {
    onSectionsChange(
      sections.map(s => 
        s.id === id ? { ...s, visible: !s.visible } : s
      )
    );
  };
  
  const handleMoveUp = (index: number) => {
    if (index > 0) {
      moveSection(index, index - 1);
    }
  };
  
  const handleMoveDown = (index: number) => {
    if (index < sections.length - 1) {
      moveSection(index, index + 1);
    }
  };
  
  return (
    <div className="relative">
      {sections.length === 0 ? (
        <DropZone onDrop={handleAddSection} isEmpty={true} />
      ) : (
        <div className="space-y-4">
          {sections.map((section, index) => (
            <DraggableSection
              key={section.id}
              section={section}
              index={index}
              moveSection={moveSection}
              onEdit={onSectionEdit}
              onDelete={handleDeleteSection}
              onDuplicate={handleDuplicateSection}
              onToggleVisibility={handleToggleVisibility}
              isSelected={section.id === selectedSectionId}
            />
          ))}
          
          {/* Add Section at End */}
          <div className="p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-center cursor-pointer">
            <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">Drag a section here to add it</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Draggable section from library
export function DraggableSectionLibraryItem({ section }: { section: BuilderSection }) {
  const [{ isDragging }, drag] = useDrag({
    type: ItemType.NEW_SECTION,
    item: { section },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });
  
  return (
    <div
      ref={drag}
      className={`cursor-move ${isDragging ? 'opacity-50' : ''}`}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img 
            src={section.thumbnail} 
            alt={section.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-3">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-sm">{section.name}</h4>
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
          <Badge variant="outline" className="text-xs">{section.category}</Badge>
          {section.requiredPlugin && (
            <Badge variant="secondary" className="text-xs ml-1">Plugin</Badge>
          )}
        </div>
      </Card>
    </div>
  );
}

// Wrapper with DndProvider
export function DragDropCanvasWrapper(props: DragDropCanvasProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <DragDropCanvas {...props} />
    </DndProvider>
  );
}
