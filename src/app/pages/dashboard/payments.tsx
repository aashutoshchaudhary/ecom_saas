import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { CreditCard, Plus, CheckCircle } from "lucide-react";

const paymentMethods = [
  { id: "stripe", name: "Stripe", description: "Accept credit cards & digital wallets", logo: "💳", connected: true },
  { id: "paypal", name: "PayPal", description: "Accept PayPal payments", logo: "🅿️", connected: true },
  { id: "clover", name: "Clover", description: "POS and payment processing", logo: "🍀", connected: false },
  { id: "nmi", name: "NMI", description: "Network Merchants payment gateway", logo: "💼", connected: false },
];

export function Payments() {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Payment Methods</h1>
        <p className="text-gray-600 dark:text-gray-400">Connect and manage payment providers</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {paymentMethods.map((method) => (
          <Card key={method.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl">
                    {method.logo}
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {method.name}
                      {method.connected && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{method.description}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant={method.connected ? "outline" : "default"} className="w-full">
                {method.connected ? "Configure" : "Connect"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
