import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Star, Download, CheckCircle } from "lucide-react";
import { mockApps } from "../../lib/mock-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";

export function Marketplace() {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Marketplace</h1>
        <p className="text-gray-600 dark:text-gray-400">Extend your platform with apps and integrations</p>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Apps</TabsTrigger>
          <TabsTrigger value="installed">Installed</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockApps.map((app) => (
              <Card key={app.id}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <img src={app.icon} alt={app.name} className="w-12 h-12 rounded-lg" />
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{app.name}</CardTitle>
                      <Badge variant="outline">{app.category}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{app.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold">{app.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        ({app.installs.toLocaleString()} installs)
                      </span>
                    </div>
                    <span className="text-sm font-semibold">{app.price}</span>
                  </div>
                  {app.installed ? (
                    <Badge className="w-full justify-center bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Installed
                    </Badge>
                  ) : (
                    <Button className="w-full gap-2">
                      <Download className="w-4 h-4" />
                      Install
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="installed" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockApps.filter(app => app.installed).map((app) => (
              <Card key={app.id}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <img src={app.icon} alt={app.name} className="w-12 h-12 rounded-lg" />
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{app.name}</CardTitle>
                      <Badge variant="outline">{app.category}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{app.description}</p>
                  <Button variant="outline" className="w-full">Configure</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="featured" className="mt-6">
          <p className="text-center text-gray-500 py-12">Featured apps coming soon</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
