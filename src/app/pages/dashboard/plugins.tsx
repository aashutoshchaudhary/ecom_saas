import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { 
  Download, 
  CheckCircle, 
  Lock, 
  Search,
  Star,
  Settings,
  Zap,
  Package,
  TrendingUp
} from "lucide-react";
import { industryPlugins, type Plugin } from "../../lib/builder-data";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Progress } from "../../components/ui/progress";
import { toast } from "sonner";

export function Plugins() {
  const [searchQuery, setSearchQuery] = useState("");
  const [installedPlugins, setInstalledPlugins] = useState<string[]>(
    industryPlugins.filter(p => p.installed).map(p => p.id)
  );
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  
  const userPlan = 'pro'; // Mock user plan
  
  const canInstall = (plugin: Plugin) => {
    const planHierarchy = ['free', 'starter', 'pro', 'enterprise'];
    return planHierarchy.indexOf(userPlan) >= planHierarchy.indexOf(plugin.requiredPlan);
  };
  
  const handleInstall = (plugin: Plugin) => {
    if (!canInstall(plugin)) {
      toast.error(`This plugin requires ${plugin.requiredPlan} plan or higher`);
      return;
    }
    
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          setInstalledPlugins([...installedPlugins, plugin.id]);
          resolve(true);
        }, 2000);
      }),
      {
        loading: `Installing ${plugin.name}...`,
        success: `${plugin.name} installed successfully!`,
        error: 'Failed to install plugin'
      }
    );
  };
  
  const handleUninstall = (pluginId: string) => {
    setInstalledPlugins(installedPlugins.filter(id => id !== pluginId));
    toast.success("Plugin uninstalled");
  };
  
  const filteredPlugins = industryPlugins.filter(plugin =>
    plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plugin.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plugin.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const categories = Array.from(new Set(industryPlugins.map(p => p.category)));
  
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Package className="w-8 h-8 text-purple-600" />
          <h1 className="text-2xl md:text-3xl font-bold">Plugins</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Extend your website builder with industry-specific features and components
        </p>
      </div>
      
      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Installed</p>
                <p className="text-3xl font-bold">{installedPlugins.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Available</p>
                <p className="text-3xl font-bold">{industryPlugins.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
                <p className="text-3xl font-bold">{categories.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Your Plan</p>
                <p className="text-3xl font-bold capitalize">{userPlan}</p>
              </div>
              <Zap className="w-8 h-8" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search plugins..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Plugins</TabsTrigger>
          <TabsTrigger value="installed">
            Installed ({installedPlugins.length})
          </TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="free">Free</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlugins.map((plugin) => {
              const isInstalled = installedPlugins.includes(plugin.id);
              const hasAccess = canInstall(plugin);
              
              return (
                <Card key={plugin.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{plugin.icon}</div>
                        <div>
                          <CardTitle className="text-lg">{plugin.name}</CardTitle>
                          <Badge variant="outline" className="mt-1">{plugin.category}</Badge>
                        </div>
                      </div>
                      {!hasAccess && <Lock className="w-5 h-5 text-gray-400" />}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {plugin.description}
                    </p>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold mb-2">Features:</h4>
                      <ul className="space-y-1">
                        {plugin.features.slice(0, 3).map((feature, idx) => (
                          <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      {plugin.features.length > 3 && (
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="p-0 h-auto mt-1"
                          onClick={() => setSelectedPlugin(plugin)}
                        >
                          +{plugin.features.length - 3} more features
                        </Button>
                      )}
                    </div>
                    
                    <div className="mt-auto">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xl font-bold">
                          {plugin.isPaid ? `$${plugin.price}` : 'Free'}
                        </div>
                        <Badge variant={hasAccess ? "default" : "secondary"}>
                          {plugin.requiredPlan}
                        </Badge>
                      </div>
                      
                      {isInstalled ? (
                        <div className="flex gap-2">
                          <Badge className="flex-1 justify-center bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 py-2">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Installed
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleUninstall(plugin.id)}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              className="w-full gap-2"
                              variant={hasAccess ? "default" : "outline"}
                              disabled={!hasAccess}
                            >
                              {hasAccess ? (
                                <>
                                  <Download className="w-4 h-4" />
                                  Install
                                </>
                              ) : (
                                <>
                                  <Lock className="w-4 h-4" />
                                  Requires {plugin.requiredPlan}
                                </>
                              )}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <div className="flex items-center gap-3 mb-2">
                                <div className="text-5xl">{plugin.icon}</div>
                                <div>
                                  <DialogTitle className="text-2xl">{plugin.name}</DialogTitle>
                                  <Badge variant="outline" className="mt-1">{plugin.category}</Badge>
                                </div>
                              </div>
                              <DialogDescription>{plugin.description}</DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-6 mt-4">
                              {/* Features */}
                              <div>
                                <h3 className="font-semibold mb-3">All Features</h3>
                                <div className="grid md:grid-cols-2 gap-2">
                                  {plugin.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm">
                                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                      {feature}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Sections */}
                              <div>
                                <h3 className="font-semibold mb-3">Included Sections</h3>
                                <div className="flex flex-wrap gap-2">
                                  {plugin.sections.map((section) => (
                                    <Badge key={section} variant="outline">{section}</Badge>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Components */}
                              <div>
                                <h3 className="font-semibold mb-3">Components</h3>
                                <div className="flex flex-wrap gap-2">
                                  {plugin.components.map((component) => (
                                    <Badge key={component} variant="secondary">{component}</Badge>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Pricing */}
                              <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">One-time payment</p>
                                    <p className="text-4xl font-bold mt-1">
                                      {plugin.isPaid ? `$${plugin.price}` : 'Free'}
                                    </p>
                                  </div>
                                  <Button 
                                    size="lg"
                                    onClick={() => {
                                      handleInstall(plugin);
                                      setSelectedPlugin(null);
                                    }}
                                    disabled={!hasAccess}
                                    className="gap-2"
                                  >
                                    <Download className="w-5 h-5" />
                                    Install Now
                                  </Button>
                                </div>
                              </Card>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="installed" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlugins.filter(p => installedPlugins.includes(p.id)).map((plugin) => (
              <Card key={plugin.id}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">{plugin.icon}</div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{plugin.name}</CardTitle>
                      <Badge variant="outline" className="mt-1">{plugin.category}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {plugin.description}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 gap-2">
                      <Settings className="w-4 h-4" />
                      Configure
                    </Button>
                    <Button 
                      variant="ghost"
                      onClick={() => handleUninstall(plugin.id)}
                    >
                      Uninstall
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="popular" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlugins.slice(0, 6).map((plugin) => (
              <Card key={plugin.id}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">{plugin.icon}</div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{plugin.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{plugin.category}</Badge>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">Popular</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="free" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlugins.filter(p => !p.isPaid).map((plugin) => (
              <Card key={plugin.id}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">{plugin.icon}</div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{plugin.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{plugin.category}</Badge>
                        <Badge className="bg-green-600">Free</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
