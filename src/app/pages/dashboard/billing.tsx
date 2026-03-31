import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { 
  CreditCard, 
  Download, 
  FileText, 
  DollarSign,
  TrendingUp,
  Calendar,
  Check,
  AlertCircle
} from "lucide-react";
import { paymentProcessors, recurringBillingOptions } from "../../lib/builder-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import { toast } from "sonner";

interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  items: {
    description: string;
    quantity: number;
    price: number;
  }[];
}

const mockInvoices: Invoice[] = [
  {
    id: '1',
    number: 'INV-2026-001',
    date: '2026-03-01',
    dueDate: '2026-03-31',
    amount: 299.00,
    status: 'paid',
    items: [
      { description: 'Pro Plan Subscription', quantity: 1, price: 79.00 },
      { description: 'E-commerce Pro Plugin', quantity: 1, price: 49.00 },
      { description: 'Real Estate Pro Plugin', quantity: 1, price: 59.00 },
      { description: 'Portfolio & Creative Plugin', quantity: 1, price: 29.00 },
      { description: 'Additional Storage (100GB)', quantity: 1, price: 19.00 },
      { description: 'Priority Support', quantity: 1, price: 29.00 },
      { description: 'Custom Domain', quantity: 1, price: 15.00 },
      { description: 'SSL Certificate', quantity: 1, price: 20.00 }
    ]
  },
  {
    id: '2',
    number: 'INV-2026-002',
    date: '2026-02-01',
    dueDate: '2026-02-28',
    amount: 149.00,
    status: 'paid',
    items: [
      { description: 'Pro Plan Subscription', quantity: 1, price: 79.00 },
      { description: 'E-commerce Pro Plugin', quantity: 1, price: 49.00 },
      { description: 'Additional Storage (50GB)', quantity: 1, price: 11.00 },
      { description: 'Custom Domain', quantity: 1, price: 10.00 }
    ]
  },
  {
    id: '3',
    number: 'INV-2026-003',
    date: '2026-04-01',
    dueDate: '2026-04-30',
    amount: 329.00,
    status: 'pending',
    items: [
      { description: 'Pro Plan Subscription', quantity: 1, price: 79.00 },
      { description: 'E-commerce Pro Plugin', quantity: 1, price: 49.00 },
      { description: 'Real Estate Pro Plugin', quantity: 1, price: 59.00 },
      { description: 'Fitness & Wellness Plugin', quantity: 1, price: 45.00 },
      { description: 'Portfolio & Creative Plugin', quantity: 1, price: 29.00 },
      { description: 'Additional Storage (150GB)', quantity: 1, price: 29.00 },
      { description: 'Priority Support', quantity: 1, price: 29.00 },
      { description: 'Custom Domain', quantity: 1, price: 10.00 }
    ]
  }
];

export function Billing() {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentMethods, setPaymentMethods] = useState([
    { id: '1', type: 'Visa', last4: '4242', expiry: '12/28', isDefault: true },
    { id: '2', type: 'Mastercard', last4: '5555', expiry: '06/27', isDefault: false }
  ]);
  
  const handleDownloadInvoice = (invoice: Invoice) => {
    toast.success(`Downloading invoice ${invoice.number}`);
  };
  
  const handlePayInvoice = (invoice: Invoice) => {
    toast.success(`Payment initiated for ${invoice.number}`);
  };
  
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="w-8 h-8 text-purple-600" />
          <h1 className="text-2xl md:text-3xl font-bold">Billing & Invoices</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your payment methods, invoices, and billing settings
        </p>
      </div>
      
      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Spend</p>
                <p className="text-3xl font-bold">$777</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
                <p className="text-3xl font-bold">$329</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-3xl font-bold">1</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Next Billing</p>
                <p className="text-xl font-bold">Apr 30</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="processors">Payment Processors</TabsTrigger>
          <TabsTrigger value="recurring">Recurring Billing</TabsTrigger>
        </TabsList>
        
        {/* Invoices Tab */}
        <TabsContent value="invoices" className="mt-6 space-y-4">
          {mockInvoices.map((invoice) => (
            <Card key={invoice.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{invoice.number}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <span>Issued: {new Date(invoice.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="mt-2">
                        <Badge 
                          className={
                            invoice.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            invoice.status === 'overdue' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }
                        >
                          {invoice.status === 'paid' && <Check className="w-3 h-3 mr-1" />}
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-2xl font-bold">${invoice.amount.toFixed(2)}</p>
                    <div className="flex gap-2 mt-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedInvoice(invoice)}
                          >
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Invoice {invoice.number}</DialogTitle>
                          </DialogHeader>
                          
                          {selectedInvoice && (
                            <div className="space-y-6">
                              {/* Invoice Header */}
                              <div className="flex items-start justify-between pb-6 border-b">
                                <div>
                                  <div className="text-2xl font-bold mb-1">Your Company</div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    123 Business St<br />
                                    San Francisco, CA 94102<br />
                                    contact@yourcompany.com
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-xl font-bold mb-1">{selectedInvoice.number}</div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Date: {new Date(selectedInvoice.date).toLocaleDateString()}<br />
                                    Due: {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Bill To */}
                              <div>
                                <h3 className="font-semibold mb-2">Bill To:</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Customer Name<br />
                                  customer@email.com
                                </p>
                              </div>
                              
                              {/* Items */}
                              <div>
                                <table className="w-full">
                                  <thead>
                                    <tr className="border-b">
                                      <th className="text-left py-3 font-semibold">Description</th>
                                      <th className="text-right py-3 font-semibold w-20">Qty</th>
                                      <th className="text-right py-3 font-semibold w-24">Price</th>
                                      <th className="text-right py-3 font-semibold w-24">Total</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {selectedInvoice.items.map((item, idx) => (
                                      <tr key={idx} className="border-b">
                                        <td className="py-3">{item.description}</td>
                                        <td className="py-3 text-right">{item.quantity}</td>
                                        <td className="py-3 text-right">${item.price.toFixed(2)}</td>
                                        <td className="py-3 text-right font-semibold">
                                          ${(item.quantity * item.price).toFixed(2)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  <tfoot>
                                    <tr>
                                      <td colSpan={3} className="py-3 text-right font-semibold">Total:</td>
                                      <td className="py-3 text-right text-2xl font-bold">
                                        ${selectedInvoice.amount.toFixed(2)}
                                      </td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                              
                              {/* Actions */}
                              <div className="flex gap-3 pt-4 border-t">
                                <Button 
                                  className="flex-1 gap-2"
                                  onClick={() => handleDownloadInvoice(selectedInvoice)}
                                >
                                  <Download className="w-4 h-4" />
                                  Download PDF
                                </Button>
                                {selectedInvoice.status !== 'paid' && (
                                  <Button 
                                    variant="outline" 
                                    className="flex-1"
                                    onClick={() => handlePayInvoice(selectedInvoice)}
                                  >
                                    Pay Now
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => handleDownloadInvoice(invoice)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      
                      {invoice.status !== 'paid' && (
                        <Button 
                          size="sm"
                          onClick={() => handlePayInvoice(invoice)}
                        >
                          Pay Now
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        {/* Payment Methods Tab */}
        <TabsContent value="payment-methods" className="mt-6 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Saved Payment Methods</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <CreditCard className="w-4 h-4" />
                  Add Payment Method
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Payment Method</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Card Number</Label>
                    <Input placeholder="1234 5678 9012 3456" className="mt-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Expiry</Label>
                      <Input placeholder="MM/YY" className="mt-2" />
                    </div>
                    <div>
                      <Label>CVV</Label>
                      <Input placeholder="123" className="mt-2" />
                    </div>
                  </div>
                  <div>
                    <Label>Cardholder Name</Label>
                    <Input placeholder="John Doe" className="mt-2" />
                  </div>
                  <Button className="w-full">Add Card</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {paymentMethods.map((method) => (
            <Card key={method.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold">{method.type} ending in {method.last4}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Expires {method.expiry}
                      </div>
                      {method.isDefault && (
                        <Badge className="mt-2">Default</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!method.isDefault && (
                      <Button variant="outline" size="sm">
                        Set as Default
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        {/* Payment Processors Tab */}
        <TabsContent value="processors" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {paymentProcessors.map((processor) => (
              <Card key={processor.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{processor.icon}</div>
                    <div>
                      <CardTitle>{processor.name}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {processor.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {processor.features.map((feature) => (
                        <Badge key={feature} variant="outline">{feature}</Badge>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Transaction Fee</p>
                        <p className="font-semibold">{processor.transactionFee}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Fee</p>
                        <p className="font-semibold">
                          {processor.monthlyFee === 0 ? 'Free' : `$${processor.monthlyFee}`}
                        </p>
                      </div>
                    </div>
                    
                    <Button className="w-full mt-4">Connect {processor.name}</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Recurring Billing Tab */}
        <TabsContent value="recurring" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recurring Billing Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Billing Frequency</Label>
                <Select defaultValue="monthly">
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {recurringBillingOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name} - {option.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Pay</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Automatically charge your default payment method
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Reminders</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Send invoice reminders 3 days before due date
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Usage-Based Billing</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Include usage charges in monthly invoice
                  </p>
                </div>
                <Switch />
              </div>
              
              <Button className="w-full mt-4">Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
