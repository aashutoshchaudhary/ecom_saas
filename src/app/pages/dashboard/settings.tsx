import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Switch } from "../../components/ui/switch";
import { Separator } from "../../components/ui/separator";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { mockUser, mockCurrencies } from "../../lib/mock-data";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";
import { toast } from "sonner";
import {
  Globe,
  Smartphone,
  Bell,
  Shield,
  Palette,
  DollarSign,
  Download,
  Wifi,
  WifiOff,
} from "lucide-react";

export function Settings() {
  const [baseCurrency, setBaseCurrency] = useState("USD");
  const [autoDetectCurrency, setAutoDetectCurrency] = useState(true);
  const [pwaEnabled, setPwaEnabled] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1200px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account, preferences, and platform settings</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 h-auto">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="currency">Currency</TabsTrigger>
          <TabsTrigger value="pwa">PWA</TabsTrigger>
          <TabsTrigger value="notifications">Alerts</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={mockUser.avatar} />
                  <AvatarFallback>{mockUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline">Change Photo</Button>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG. Max 2MB</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue={mockUser.name} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={mockUser.email} />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="pst">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="est">Eastern (UTC-5)</SelectItem>
                      <SelectItem value="cst">Central (UTC-6)</SelectItem>
                      <SelectItem value="mst">Mountain (UTC-7)</SelectItem>
                      <SelectItem value="pst">Pacific (UTC-8)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={() => toast.success("Profile updated!")}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business */}
        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
              <CardDescription>Manage your business information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input id="businessName" defaultValue={mockUser.businessName} />
                </div>
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select defaultValue="ecommerce">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ecommerce">E-commerce</SelectItem>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="realestate">Real Estate</SelectItem>
                      <SelectItem value="fitness">Fitness</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="saas">SaaS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="address">Business Address</Label>
                <Input id="address" placeholder="123 Main St, City, State, ZIP" />
              </div>
              <div>
                <Label htmlFor="taxId">Tax ID / EIN</Label>
                <Input id="taxId" placeholder="XX-XXXXXXX" />
              </div>
              <Button onClick={() => toast.success("Business info updated!")}>Update Business Info</Button>
            </CardContent>
          </Card>

          {/* Multi-industry */}
          <Card>
            <CardHeader>
              <CardTitle>Multi-Industry Management</CardTitle>
              <CardDescription>Manage multiple business types under one account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockUser.industries.map((ind) => (
                <div key={ind.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{ind.icon}</span>
                    <div>
                      <p className="font-medium">{ind.name}</p>
                      <p className="text-sm text-gray-500">{ind.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {ind.id === mockUser.activeIndustry && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Active</Badge>
                    )}
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full gap-2">
                + Add Another Industry
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Currency */}
        <TabsContent value="currency" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Multi-Currency Settings
              </CardTitle>
              <CardDescription>Configure currency display and conversion for your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Base Currency</Label>
                <Select value={baseCurrency} onValueChange={setBaseCurrency}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCurrencies.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.symbol} {c.name} ({c.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Detect Currency</Label>
                  <p className="text-sm text-gray-500">Detect visitor's currency based on location</p>
                </div>
                <Switch checked={autoDetectCurrency} onCheckedChange={setAutoDetectCurrency} />
              </div>

              <Separator />

              <div>
                <Label className="mb-3 block">Enabled Currencies & Exchange Rates</Label>
                <div className="space-y-3">
                  {mockCurrencies.map((c) => (
                    <div key={c.code} className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-lg font-mono w-8">{c.symbol}</span>
                        <div>
                          <p className="font-medium text-sm">{c.name}</p>
                          <p className="text-xs text-gray-500">{c.code}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Input
                          type="number"
                          defaultValue={c.rate}
                          className="w-28 h-8 text-sm"
                          step="0.01"
                        />
                        <Switch defaultChecked={c.code !== "JPY"} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Currency Selector</Label>
                  <p className="text-sm text-gray-500">Display a currency selector on your storefront</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Button onClick={() => toast.success("Currency settings saved!")}>Save Currency Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PWA */}
        <TabsContent value="pwa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Progressive Web App (PWA)
              </CardTitle>
              <CardDescription>Configure your website as an installable app</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable PWA</Label>
                  <p className="text-sm text-gray-500">Allow users to install your website as a native-like app</p>
                </div>
                <Switch checked={pwaEnabled} onCheckedChange={setPwaEnabled} />
              </div>

              {pwaEnabled && (
                <>
                  <Separator />

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>App Name</Label>
                      <Input defaultValue="Modern Boutique" className="mt-2" />
                    </div>
                    <div>
                      <Label>Short Name</Label>
                      <Input defaultValue="Boutique" className="mt-2" />
                    </div>
                  </div>

                  <div>
                    <Label>App Description</Label>
                    <Input defaultValue="Shop premium products at Modern Boutique" className="mt-2" />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Theme Color</Label>
                      <div className="flex gap-2 mt-2">
                        <Input type="color" defaultValue="#8B5CF6" className="w-12 h-10 p-1" />
                        <Input defaultValue="#8B5CF6" className="flex-1" />
                      </div>
                    </div>
                    <div>
                      <Label>Background Color</Label>
                      <div className="flex gap-2 mt-2">
                        <Input type="color" defaultValue="#FFFFFF" className="w-12 h-10 p-1" />
                        <Input defaultValue="#FFFFFF" className="flex-1" />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-purple-600" />
                      <div>
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-gray-500">Send push notifications to app users</p>
                      </div>
                    </div>
                    <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {offlineMode ? <Wifi className="w-5 h-5 text-green-600" /> : <WifiOff className="w-5 h-5 text-gray-400" />}
                      <div>
                        <Label>Offline Mode</Label>
                        <p className="text-sm text-gray-500">Cache content for offline access</p>
                      </div>
                    </div>
                    <Switch checked={offlineMode} onCheckedChange={setOfflineMode} />
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <Download className="w-4 h-4" /> Install Preview
                    </h4>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xl">MB</span>
                      </div>
                      <div>
                        <p className="font-medium">Modern Boutique</p>
                        <p className="text-xs text-gray-500">modernboutique.ai</p>
                        <Badge variant="secondary" className="mt-1 text-xs">Installable</Badge>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <Button onClick={() => toast.success("PWA settings saved!")}>Save PWA Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control what alerts you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { label: "New Orders", desc: "Get notified when a customer places an order", default: true },
                { label: "Low Stock Alerts", desc: "Alert when products fall below threshold", default: true },
                { label: "Customer Signups", desc: "New customer registration notifications", default: false },
                { label: "Payment Received", desc: "Notification when payment is confirmed", default: true },
                { label: "AI Credit Usage", desc: "Alert when credits are running low", default: true },
                { label: "Weekly Reports", desc: "Receive weekly analytics summary", default: true },
                { label: "Security Alerts", desc: "Important security notifications", default: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <Label>{item.label}</Label>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                  <Switch defaultChecked={item.default} />
                </div>
              ))}
              <Button onClick={() => toast.success("Notification preferences saved!")}>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-4">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Add an extra layer of security</p>
                  </div>
                  <Switch />
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="font-medium mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                  <Button onClick={() => toast.success("Password updated!")}>Update Password</Button>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="font-medium mb-2">Active Sessions</h3>
                <div className="space-y-3">
                  {[
                    { device: "Chrome on macOS", location: "San Francisco, CA", active: true },
                    { device: "Safari on iPhone", location: "San Francisco, CA", active: false },
                  ].map((session, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-800">
                      <div>
                        <p className="font-medium text-sm">{session.device}</p>
                        <p className="text-xs text-gray-500">{session.location}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {session.active ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Current</Badge>
                        ) : (
                          <Button variant="ghost" size="sm" className="text-red-600">Revoke</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
