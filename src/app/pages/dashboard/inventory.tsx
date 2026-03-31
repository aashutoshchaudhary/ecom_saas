import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2,
  Package,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Grid3X3,
  X,
  Sparkles,
  Copy,
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../../components/ui/select";
import { mockProducts, mockProductVariants, statusColors } from "../../lib/mock-data";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Separator } from "../../components/ui/separator";
import { Switch } from "../../components/ui/switch";
import { toast } from "sonner";

export function Inventory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showVariantMatrix, setShowVariantMatrix] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stats = [
    {
      label: "Total Products",
      value: mockProducts.length,
      icon: Package,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      label: "Low Stock",
      value: mockProducts.filter(p => p.stock <= p.lowStockThreshold).length,
      icon: AlertTriangle,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20"
    },
    {
      label: "Total Value",
      value: `$${mockProducts.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    },
    {
      label: "Total Sales",
      value: mockProducts.reduce((sum, p) => sum + p.sales, 0).toLocaleString(),
      icon: TrendingUp,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    },
  ];

  const categories = ["Electronics", "Fitness", "Home"];

  // Variant matrix data
  const variantSizes = ["S", "M", "L"];
  const variantColors = ["Black", "White", "Blue"];

  const getVariant = (size: string, color: string) => {
    return mockProductVariants.find(
      v => v.attributes.size === size && v.attributes.color === color
    );
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Inventory</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage products, variants, and stock levels</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => toast.success("AI product descriptions generated!")}>
            <Sparkles className="w-4 h-4" />
            AI Generate
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600">
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>Add a new product with variants to your inventory</DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="basic">
                <TabsList className="mb-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="variants">Variants</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Product Name</Label>
                      <Input id="name" placeholder="Wireless Headphones" />
                    </div>
                    <div>
                      <Label htmlFor="sku">SKU</Label>
                      <Input id="sku" placeholder="WH-001" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <div className="flex gap-2 mt-2">
                      <Textarea id="description" placeholder="Product description..." rows={3} className="flex-1" />
                      <Button variant="outline" size="sm" className="gap-1 flex-shrink-0 self-start" onClick={() => toast.success("AI description generated!")}>
                        <Sparkles className="w-3 h-3" /> AI
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="price">Base Price</Label>
                      <Input id="price" type="number" placeholder="99.99" />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="variants" className="space-y-4">
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Variant Attributes</h4>
                    <p className="text-xs text-gray-500 mb-4">Define the attributes that create your product variants</p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Input placeholder="Attribute name (e.g. Size)" defaultValue="Size" className="w-40" />
                        <Input placeholder="Values (comma separated)" defaultValue="S, M, L, XL" className="flex-1" />
                        <Button variant="ghost" size="icon"><X className="w-4 h-4" /></Button>
                      </div>
                      <div className="flex items-center gap-3">
                        <Input placeholder="Attribute name" defaultValue="Color" className="w-40" />
                        <Input placeholder="Values" defaultValue="Black, White, Blue" className="flex-1" />
                        <Button variant="ghost" size="icon"><X className="w-4 h-4" /></Button>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Plus className="w-3 h-3" /> Add Attribute
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Track inventory per variant</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Different pricing per variant</Label>
                    <Switch defaultChecked />
                  </div>
                </TabsContent>

                <TabsContent value="pricing" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Cost Price</Label>
                      <Input type="number" placeholder="45.00" />
                    </div>
                    <div>
                      <Label>Selling Price</Label>
                      <Input type="number" placeholder="99.99" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Compare at Price</Label>
                      <Input type="number" placeholder="129.99" />
                    </div>
                    <div>
                      <Label>Tax Rate (%)</Label>
                      <Input type="number" placeholder="8.5" />
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <Label>Multi-Currency Pricing</Label>
                    <p className="text-xs text-gray-500 mb-3">Set custom prices for different currencies</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { code: "EUR", symbol: "€" },
                        { code: "GBP", symbol: "£" },
                        { code: "CAD", symbol: "C$" },
                      ].map((curr) => (
                        <div key={curr.code} className="flex items-center gap-2">
                          <span className="text-sm font-medium w-10">{curr.code}</span>
                          <Input type="number" placeholder={`${curr.symbol}0.00`} />
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button onClick={() => toast.success("Product added!")}>Add Product</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4 md:p-6">
                <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                <p className="text-lg md:text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Variant Matrix Modal */}
      {showVariantMatrix && (
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Grid3X3 className="w-5 h-5 text-purple-600" />
                <CardTitle>Variant Matrix - {mockProducts.find(p => p.id === showVariantMatrix)?.name}</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.success("Bulk changes saved!")}>
                  <Copy className="w-4 h-4" /> Bulk Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowVariantMatrix(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-tl-lg">Size / Color</th>
                    {variantColors.map(color => (
                      <th key={color} className="text-center p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">{color}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {variantSizes.map((size) => (
                    <tr key={size}>
                      <td className="p-3 border-b border-gray-200 dark:border-gray-700 font-medium">{size}</td>
                      {variantColors.map((color) => {
                        const variant = getVariant(size, color);
                        return (
                          <td key={`${size}-${color}`} className="p-2 border-b border-gray-200 dark:border-gray-700">
                            {variant ? (
                              <div className={`p-3 rounded-lg border ${
                                variant.stock === 0
                                  ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                                  : variant.stock < 20
                                  ? "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20"
                                  : "border-gray-200 dark:border-gray-700"
                              }`}>
                                <div className="text-xs text-gray-500 mb-1">{variant.sku}</div>
                                <div className="font-semibold text-sm">${variant.price}</div>
                                <div className={`text-xs mt-1 ${
                                  variant.stock === 0 ? "text-red-600" :
                                  variant.stock < 20 ? "text-yellow-600" : "text-gray-500"
                                }`}>
                                  {variant.stock === 0 ? "Out of stock" : `${variant.stock} in stock`}
                                </div>
                                <Input
                                  type="number"
                                  defaultValue={variant.stock}
                                  className="mt-2 h-7 text-xs"
                                  placeholder="Stock"
                                />
                              </div>
                            ) : (
                              <div className="p-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-center">
                                <Button variant="ghost" size="sm" className="text-xs">
                                  <Plus className="w-3 h-3 mr-1" /> Add
                                </Button>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => { toast.success("Variant inventory updated!"); setShowVariantMatrix(null); }}>
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>All Products ({filteredProducts.length})</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 sm:flex-none sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  {product.variants.length > 0 && (
                    <Badge className="absolute top-2 right-2 bg-purple-600">{product.variants.length} variants</Badge>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.sku}</p>
                    </div>
                    <Badge className={statusColors[product.status as keyof typeof statusColors]}>
                      {product.status === "out_of_stock" ? "Out" : "Active"}
                    </Badge>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Price</span>
                      <span className="font-semibold">${product.price}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Stock</span>
                      <span className={product.stock <= product.lowStockThreshold ? "text-yellow-600 dark:text-yellow-400 font-semibold" : ""}>
                        {product.stock} units
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Sales</span>
                      <span>{product.sales}</span>
                    </div>
                    {/* Variant colors preview */}
                    <div className="flex gap-1 mt-1">
                      {product.variants.map((v) => (
                        <span key={v} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">{v}</span>
                      ))}
                    </div>
                  </div>
                  {product.stock <= product.lowStockThreshold && (
                    <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs text-yellow-800 dark:text-yellow-400 flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3" />
                      Low stock alert
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowVariantMatrix(product.id)}
                      title="Variant Matrix"
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
