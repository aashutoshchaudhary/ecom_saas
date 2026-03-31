import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { CheckCircle } from "lucide-react";

const integrations = [
  { id: "google", name: "Google Analytics", description: "Track website traffic", icon: "📊", connected: true },
  { id: "facebook", name: "Facebook Pixel", description: "Track conversions", icon: "📘", connected: false },
  { id: "mailchimp", name: "Mailchimp", description: "Email marketing", icon: "📧", connected: true },
  { id: "zapier", name: "Zapier", description: "Automate workflows", icon: "⚡", connected: false },
  { id: "shipstation", name: "ShipStation", description: "Shipping automation", icon: "📦", connected: false },
  { id: "quickbooks", name: "QuickBooks", description: "Accounting integration", icon: "💰", connected: false },
];

export function Integrations() {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Integrations</h1>
        <p className="text-gray-600 dark:text-gray-400">Connect your favorite tools and services</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <Card key={integration.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl">
                    {integration.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {integration.name}
                      {integration.connected && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{integration.description}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant={integration.connected ? "outline" : "default"} className="w-full">
                {integration.connected ? "Configure" : "Connect"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
