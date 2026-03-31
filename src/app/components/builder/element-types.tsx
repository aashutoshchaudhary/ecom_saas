import { useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import {
  Type,
  Image as ImageIcon,
  Square,
  Minus,
  Video,
  Code,
  Link as LinkIcon,
  MapPin,
  Timer,
  Star,
  Share2,
  FileText,
  Navigation,
  Columns,
  SeparatorHorizontal,
  ArrowRight,
  Play,
  Quote,
  List,
  CheckSquare,
  Calendar,
  Mail,
  Phone,
  MessageSquare,
  ShoppingCart,
  Heart,
  Bookmark,
  Award,
  AlertCircle,
  Info,
  Megaphone,
  Table,
  BarChart3,
  PieChart,
  Globe,
} from "lucide-react";

export interface ElementType {
  id: string;
  type: string;
  name: string;
  icon: any;
  category: string;
  defaultProps: Record<string, any>;
}

export const elementTypes: ElementType[] = [
  // Text Elements
  { id: "heading", type: "heading", name: "Heading", icon: Type, category: "Text", defaultProps: { text: "Heading Text", level: "h2", align: "left" } },
  { id: "paragraph", type: "paragraph", name: "Paragraph", icon: FileText, category: "Text", defaultProps: { text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", align: "left" } },
  { id: "quote", type: "quote", name: "Block Quote", icon: Quote, category: "Text", defaultProps: { text: "The best way to predict the future is to create it.", author: "Peter Drucker" } },
  { id: "list", type: "list", name: "List", icon: List, category: "Text", defaultProps: { items: ["First item", "Second item", "Third item"], ordered: false } },
  { id: "checklist", type: "checklist", name: "Checklist", icon: CheckSquare, category: "Text", defaultProps: { items: [{ text: "Task one", checked: true }, { text: "Task two", checked: false }, { text: "Task three", checked: false }] } },

  // Media Elements
  { id: "image", type: "image", name: "Image", icon: ImageIcon, category: "Media", defaultProps: { src: "", alt: "Image", width: "100%", rounded: true } },
  { id: "video", type: "video", name: "Video Embed", icon: Video, category: "Media", defaultProps: { url: "https://www.youtube.com/embed/dQw4w9WgXcQ", aspectRatio: "16/9" } },
  { id: "gallery", type: "gallery", name: "Image Gallery", icon: Columns, category: "Media", defaultProps: { images: [], columns: 3 } },

  // Layout Elements
  { id: "button", type: "button", name: "Button", icon: Square, category: "Layout", defaultProps: { text: "Click Me", variant: "primary", size: "md", url: "#" } },
  { id: "button-group", type: "button-group", name: "Button Group", icon: Columns, category: "Layout", defaultProps: { buttons: [{ text: "Primary", variant: "primary" }, { text: "Secondary", variant: "outline" }] } },
  { id: "divider", type: "divider", name: "Divider", icon: Minus, category: "Layout", defaultProps: { style: "solid", color: "#e5e7eb", thickness: 1 } },
  { id: "spacer", type: "spacer", name: "Spacer", icon: SeparatorHorizontal, category: "Layout", defaultProps: { height: 40 } },
  { id: "columns", type: "columns", name: "Columns", icon: Columns, category: "Layout", defaultProps: { count: 2, gap: 24 } },
  { id: "card", type: "card", name: "Card", icon: Square, category: "Layout", defaultProps: { title: "Card Title", description: "Card description text", hasImage: true } },

  // Interactive Elements
  { id: "form", type: "form", name: "Form", icon: Mail, category: "Interactive", defaultProps: { fields: [{ type: "text", label: "Name", placeholder: "Enter your name" }, { type: "email", label: "Email", placeholder: "Enter your email" }, { type: "textarea", label: "Message", placeholder: "Your message" }], submitText: "Submit" } },
  { id: "countdown", type: "countdown", name: "Countdown", icon: Timer, category: "Interactive", defaultProps: { targetDate: "2026-12-31T00:00:00", label: "Sale Ends In" } },
  { id: "social-links", type: "social-links", name: "Social Links", icon: Share2, category: "Interactive", defaultProps: { links: [{ platform: "twitter", url: "#" }, { platform: "instagram", url: "#" }, { platform: "facebook", url: "#" }, { platform: "linkedin", url: "#" }] } },
  { id: "map", type: "map", name: "Map Embed", icon: MapPin, category: "Interactive", defaultProps: { location: "San Francisco, CA", zoom: 13 } },

  // Commerce Elements
  { id: "product-card", type: "product-card", name: "Product Card", icon: ShoppingCart, category: "Commerce", defaultProps: { name: "Product Name", price: 99.99, image: "", rating: 4.5 } },
  { id: "price-tag", type: "price-tag", name: "Price Display", icon: Award, category: "Commerce", defaultProps: { price: 99.99, originalPrice: 149.99, currency: "$" } },
  { id: "rating", type: "rating", name: "Star Rating", icon: Star, category: "Commerce", defaultProps: { rating: 4.5, maxRating: 5, showCount: true, count: 128 } },

  // Data Display
  { id: "table", type: "table", name: "Table", icon: Table, category: "Data", defaultProps: { headers: ["Name", "Value", "Status"], rows: [["Item 1", "$99", "Active"], ["Item 2", "$149", "Pending"], ["Item 3", "$79", "Active"]] } },
  { id: "stats-row", type: "stats-row", name: "Stats Row", icon: BarChart3, category: "Data", defaultProps: { stats: [{ label: "Users", value: "10K+" }, { label: "Revenue", value: "$5M+" }, { label: "Growth", value: "150%" }] } },

  // Alerts & Notices
  { id: "alert", type: "alert", name: "Alert Banner", icon: AlertCircle, category: "Notices", defaultProps: { type: "info", message: "This is an informational message.", dismissible: true } },
  { id: "announcement", type: "announcement", name: "Announcement Bar", icon: Megaphone, category: "Notices", defaultProps: { text: "Free shipping on orders over $50!", bgColor: "#7c3aed" } },

  // Code & Embed
  { id: "code", type: "code", name: "Code Block", icon: Code, category: "Advanced", defaultProps: { code: "const hello = () => {\n  console.log('Hello World!');\n};", language: "javascript" } },
  { id: "embed", type: "embed", name: "HTML Embed", icon: Globe, category: "Advanced", defaultProps: { html: "<div>Custom HTML content</div>" } },
];

export const elementCategories = Array.from(new Set(elementTypes.map(e => e.category)));

// Element renderers for the canvas
export function RenderElement({ element, isSelected, onSelect }: {
  element: { id: string; type: string; props: Record<string, any> };
  isSelected: boolean;
  onSelect: () => void;
}) {
  const wrapperClass = `relative cursor-pointer group ${isSelected ? 'ring-2 ring-purple-600 ring-offset-1' : 'hover:ring-1 hover:ring-purple-300 hover:ring-offset-1'}`;

  switch (element.type) {
    case "heading": {
      const Tag = (element.props.level || "h2") as keyof JSX.IntrinsicElements;
      return (
        <div className={wrapperClass} onClick={onSelect}>
          <Tag className={`${element.props.level === 'h1' ? 'text-4xl' : element.props.level === 'h3' ? 'text-xl' : 'text-3xl'} font-bold`} style={{ textAlign: element.props.align }}>
            {element.props.text}
          </Tag>
        </div>
      );
    }
    case "paragraph":
      return (
        <div className={wrapperClass} onClick={onSelect}>
          <p className="text-gray-700 dark:text-gray-300" style={{ textAlign: element.props.align }}>
            {element.props.text}
          </p>
        </div>
      );
    case "quote":
      return (
        <div className={wrapperClass} onClick={onSelect}>
          <blockquote className="border-l-4 border-purple-600 pl-6 py-2 italic text-gray-700 dark:text-gray-300">
            <p className="text-lg mb-2">"{element.props.text}"</p>
            {element.props.author && <cite className="text-sm text-gray-500">— {element.props.author}</cite>}
          </blockquote>
        </div>
      );
    case "list":
      return (
        <div className={wrapperClass} onClick={onSelect}>
          {element.props.ordered ? (
            <ol className="list-decimal list-inside space-y-1">
              {element.props.items.map((item: string, i: number) => <li key={i}>{item}</li>)}
            </ol>
          ) : (
            <ul className="list-disc list-inside space-y-1">
              {element.props.items.map((item: string, i: number) => <li key={i}>{item}</li>)}
            </ul>
          )}
        </div>
      );
    case "checklist":
      return (
        <div className={wrapperClass} onClick={onSelect}>
          <div className="space-y-2">
            {element.props.items.map((item: { text: string; checked: boolean }, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${item.checked ? 'bg-purple-600 border-purple-600 text-white' : 'border-gray-300'}`}>
                  {item.checked && <CheckSquare className="w-3 h-3" />}
                </div>
                <span className={item.checked ? 'line-through text-gray-400' : ''}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      );
    case "image":
      return (
        <div className={wrapperClass} onClick={onSelect}>
          {element.props.src ? (
            <ImageWithFallback
              src={element.props.src}
              alt={element.props.alt}
              className={`w-full object-cover ${element.props.rounded ? 'rounded-lg' : ''}`}
              style={{ maxHeight: 400 }}
            />
          ) : (
            <div className={`w-full h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${element.props.rounded ? 'rounded-lg' : ''}`}>
              <div className="text-center text-gray-400">
                <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">Click to add image</p>
              </div>
            </div>
          )}
        </div>
      );
    case "video":
      return (
        <div className={wrapperClass} onClick={onSelect}>
          <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: element.props.aspectRatio }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Play className="w-8 h-8 text-white ml-1" />
              </div>
            </div>
            <div className="absolute bottom-4 left-4 text-white text-sm opacity-70">Video Embed</div>
          </div>
        </div>
      );
    case "button":
      return (
        <div className={wrapperClass} onClick={onSelect}>
          <div className="flex" style={{ justifyContent: element.props.align || 'flex-start' }}>
            <button className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              element.props.variant === 'primary' ? 'bg-purple-600 text-white hover:bg-purple-700' :
              element.props.variant === 'outline' ? 'border-2 border-purple-600 text-purple-600 hover:bg-purple-50' :
              'bg-gray-200 text-gray-800 hover:bg-gray-300'
            } ${element.props.size === 'lg' ? 'px-8 py-4 text-lg' : element.props.size === 'sm' ? 'px-4 py-2 text-sm' : ''}`}>
              {element.props.text}
              {element.props.showArrow && <ArrowRight className="w-4 h-4 ml-2 inline" />}
            </button>
          </div>
        </div>
      );
    case "button-group":
      return (
        <div className={wrapperClass} onClick={onSelect}>
          <div className="flex gap-3 flex-wrap">
            {element.props.buttons.map((btn: { text: string; variant: string }, i: number) => (
              <button key={i} className={`px-6 py-3 rounded-lg font-medium ${
                btn.variant === 'primary' ? 'bg-purple-600 text-white' : 'border-2 border-gray-300 text-gray-700 dark:text-gray-300'
              }`}>
                {btn.text}
              </button>
            ))}
          </div>
        </div>
      );
    case "divider":
      return (
        <div className={wrapperClass} onClick={onSelect}>
          <hr style={{ borderColor: element.props.color, borderWidth: element.props.thickness, borderStyle: element.props.style }} />
        </div>
      );
    case "spacer":
      return (
        <div className={wrapperClass} onClick={onSelect}>
          <div className="border border-dashed border-gray-200 dark:border-gray-700 rounded opacity-50" style={{ height: element.props.height }}>
            <div className="flex items-center justify-center h-full text-xs text-gray-400">
              {element.props.height}px spacer
            </div>
          </div>
        </div>
      );
    case "card":
      return (
        <div className={wrapperClass} onClick={onSelect}>
          <Card className="overflow-hidden">
            {element.props.hasImage && (
              <div className="h-48 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30" />
            )}
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{element.props.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{element.props.description}</p>
            </div>
          </Card>
        </div>
      );
    case "form":
      return (
        <div className={wrapperClass} onClick={onSelect}>
          <Card className="p-6">
            <form className="space-y-4" onSubmit={e => e.preventDefault()}>
              {element.props.fields.map((field: any, i: number) => (
                <div key={i}>
                  <label className="block text-sm font-medium mb-1">{field.label}</label>
                  {field.type === "textarea" ? (
                    <textarea className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" placeholder={field.placeholder} rows={3} />
                  ) : (
                    <input type={field.type} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" placeholder={field.placeholder} />
                  )}
                </div>
              ))}
              <button className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium">{element.props.submitText}</button>
            </form>
          </Card>
        </div>
      );
    case "countdown":
      return (
        <div className={wrapperClass} onClick={onSelect}>
          <div className="text-center py-6">
            <p className="text-sm text-gray-500 mb-3">{element.props.label}</p>
            <div className="flex justify-center gap-4">
              {["Days", "Hours", "Min", "Sec"].map((unit, i) => (
                <div key={unit} className="bg-gray-900 dark:bg-gray-800 text-white rounded-lg p-4 min-w-[70px]">
                  <div className="text-3xl font-bold">{[276, 14, 32, 8][i]}</div>
                  <div className="text-xs text-gray-400 mt-1">{unit}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    case "social-links":
      return (
        <div className={wrapperClass} onClick={onSelect}>
          <div className="flex gap-3 justify-center">
            {element.props.links.map((link: { platform: string }, i: number) => (
              <div key={i} className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors cursor-pointer">
                <Globe className="w-5 h-5" />
              </div>
            ))}
          </div>
        </div>
      );
    case "map":
      return (
        <div className={wrapperClass} onClick={onSelect}>
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MapPin className="w-10 h-10 mx-auto mb-2" />
              <p className="text-sm">{element.props.location}</p>
              <p className="text-xs text-gray-400">Map Embed</p>
            </div>
          </div>
        </div>
      );
    case "product-card":
      return (
        <div className={wrapperClass} onClick={onSelect}>
          <Card className="overflow-hidden max-w-sm">
            <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              {element.props.image ? (
                <ImageWithFallback src={element.props.image} alt={element.props.name} className="w-full h-full object-cover" />
              ) : (
                <ShoppingCart className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center gap-1 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(element.props.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <h3 className="font-semibold">{element.props.name}</h3>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xl font-bold">${element.props.price}</span>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm">Add to Cart</button>
              </div>
            </div>
          </Card>
        </div>
      );
    case "price-tag":
      return (
        <div className={wrapperClass} onClick={onSelect}>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-purple-600">{element.props.currency}{element.props.price}</span>
            {element.props.originalPrice && (
              <span className="text-lg text-gray-400 line-through">{element.props.currency}{element.props.originalPrice}</span>
            )}
            {element.props.originalPrice && (
              <Badge className="bg-red-500">
                {Math.round((1 - element.props.price / element.props.originalPrice) * 100)}% OFF
              </Badge>
            )}
          </div>
        </div>
      );
    case "rating":
      return (
        <div className={wrapperClass} onClick={onSelect}>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[...Array(element.props.maxRating)].map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < Math.floor(element.props.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="font-semibold">{element.props.rating}</span>
            {element.props.showCount && <span className="text-gray-500 text-sm">({element.props.count} reviews)</span>}
          </div>
        </div>
      );
    case "table":
      return (
        <div className={wrapperClass} onClick={onSelect}>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  {element.props.headers.map((h: string, i: number) => (
                    <th key={i} className="px-4 py-3 text-left text-sm font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {element.props.rows.map((row: string[], i: number) => (
                  <tr key={i} className="border-t">
                    {row.map((cell: string, j: number) => (
                      <td key={j} className="px-4 py-3 text-sm">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    case "stats-row":
      return (
        <div className={wrapperClass} onClick={onSelect}>
          <div className="grid grid-cols-3 gap-6">
            {element.props.stats.map((stat: { label: string; value: string }, i: number) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-purple-600">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      );
    case "alert":
      return (
        <div className={wrapperClass} onClick={onSelect}>
          <div className={`p-4 rounded-lg flex items-center gap-3 ${
            element.props.type === 'info' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300' :
            element.props.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300' :
            element.props.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300' :
            'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
          }`}>
            {element.props.type === 'info' ? <Info className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            <p className="text-sm">{element.props.message}</p>
          </div>
        </div>
      );
    case "announcement":
      return (
        <div className={wrapperClass} onClick={onSelect}>
          <div className="py-3 px-6 text-center text-white font-medium rounded-lg" style={{ backgroundColor: element.props.bgColor }}>
            <Megaphone className="w-4 h-4 inline mr-2" />
            {element.props.text}
          </div>
        </div>
      );
    case "code":
      return (
        <div className={wrapperClass} onClick={onSelect}>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
            <code>{element.props.code}</code>
          </pre>
        </div>
      );
    case "embed":
      return (
        <div className={wrapperClass} onClick={onSelect}>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
            <Code className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Custom HTML Embed</p>
            <p className="text-xs text-gray-400 mt-1">Content will render on preview</p>
          </div>
        </div>
      );
    default:
      return (
        <div className={wrapperClass} onClick={onSelect}>
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center text-gray-500">
            Unknown element: {element.type}
          </div>
        </div>
      );
  }
}
