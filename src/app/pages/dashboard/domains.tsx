import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Separator } from "../../components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../../components/ui/dialog";
import {
  Globe,
  Mail,
  Plus,
  Search,
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  Trash2,
  RefreshCw,
  Inbox,
  HardDrive,
} from "lucide-react";
import { mockDomains, mockEmails } from "../../lib/mock-data";
import { toast } from "sonner";

export function Domains() {
  const [searchDomain, setSearchDomain] = useState("");
  const [searchResults, setSearchResults] = useState<{ domain: string; available: boolean; price: string }[]>([]);

  const handleSearch = () => {
    if (!searchDomain) return;
    setSearchResults([
      { domain: `${searchDomain}.com`, available: true, price: "$12.99/yr" },
      { domain: `${searchDomain}.io`, available: true, price: "$39.99/yr" },
      { domain: `${searchDomain}.ai`, available: false, price: "$69.99/yr" },
      { domain: `${searchDomain}.co`, available: true, price: "$24.99/yr" },
    ]);
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "connected": case "active": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending": return <Clock className="w-4 h-4 text-yellow-500" />;
      case "failed": return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "connected": case "active": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "failed": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default: return "";
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-8 h-8 text-purple-600" />
            <h1 className="text-2xl md:text-3xl font-bold">Domains & Email</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Manage custom domains, SSL certificates, and business email addresses
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Domains</p>
                <p className="text-3xl font-bold">{mockDomains.length}</p>
              </div>
              <Globe className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Email Accounts</p>
                <p className="text-3xl font-bold">{mockEmails.length}</p>
              </div>
              <Mail className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">SSL Active</p>
                <p className="text-3xl font-bold">{mockDomains.filter(d => d.ssl).length}</p>
              </div>
              <Shield className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Unread Emails</p>
                <p className="text-3xl font-bold">{mockEmails.reduce((s, e) => s + e.unread, 0)}</p>
              </div>
              <Inbox className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="domains">
        <TabsList>
          <TabsTrigger value="domains">Custom Domains</TabsTrigger>
          <TabsTrigger value="email">Business Email</TabsTrigger>
          <TabsTrigger value="search">Search & Purchase</TabsTrigger>
        </TabsList>

        <TabsContent value="domains" className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Connected Domains</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Connect Domain
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Connect a Domain</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Domain Name</Label>
                    <Input placeholder="yourdomain.com" className="mt-2" />
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">DNS Configuration</h4>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex justify-between">
                        <span>Type: A Record</span>
                        <code className="bg-gray-100 dark:bg-gray-800 px-2 rounded">76.76.21.21</code>
                      </div>
                      <div className="flex justify-between">
                        <span>Type: CNAME</span>
                        <code className="bg-gray-100 dark:bg-gray-800 px-2 rounded">cname.siteforge.ai</code>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full" onClick={() => toast.success("Domain connection initiated!")}>
                    Verify & Connect
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {mockDomains.map((domain) => (
            <Card key={domain.id}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Globe className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{domain.domain}</h3>
                        {domain.primary && <Badge>Primary</Badge>}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          {statusIcon(domain.status)}
                          <Badge className={statusColor(domain.status)}>
                            {domain.status}
                          </Badge>
                        </span>
                        <span>Expires: {new Date(domain.expiresAt).toLocaleDateString()}</span>
                        {domain.ssl && (
                          <span className="flex items-center gap-1 text-green-600">
                            <Shield className="w-3 h-3" /> SSL
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 mr-4">
                      <Label className="text-sm">Auto-Renew</Label>
                      <Switch defaultChecked={domain.autoRenew} />
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit
                    </Button>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      DNS
                    </Button>
                    {!domain.primary && (
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="email" className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Business Email Accounts</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Email Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Business Email</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Email Address</Label>
                    <div className="flex gap-2 mt-2">
                      <Input placeholder="name" className="flex-1" />
                      <span className="flex items-center text-gray-500">@</span>
                      <Input defaultValue="modernboutique.ai" className="flex-1" disabled />
                    </div>
                  </div>
                  <div>
                    <Label>Display Name</Label>
                    <Input placeholder="John Doe" className="mt-2" />
                  </div>
                  <div>
                    <Label>Password</Label>
                    <Input type="password" className="mt-2" />
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-sm font-medium">Included with plan:</p>
                    <ul className="text-sm text-gray-500 mt-1 space-y-1">
                      <li>10 GB storage per mailbox</li>
                      <li>IMAP/POP3/SMTP access</li>
                      <li>Spam & virus protection</li>
                    </ul>
                  </div>
                  <Button className="w-full" onClick={() => toast.success("Email account created!")}>
                    Create Email Account
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {mockEmails.map((email) => (
            <Card key={email.id}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Mail className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{email.email}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <Badge className={statusColor(email.status)}>
                          {statusIcon(email.status)} {email.status}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <HardDrive className="w-3 h-3" />
                          {email.storage}
                        </span>
                        {email.unread > 0 && (
                          <Badge variant="secondary">{email.unread} unread</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Open Mailbox</Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="search" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Search & Purchase a Domain</CardTitle>
              <CardDescription>Find the perfect domain for your business</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Enter your desired domain name..."
                    value={searchDomain}
                    onChange={(e) => setSearchDomain(e.target.value)}
                    className="pl-9"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch}>Search</Button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-3">
                  {searchResults.map((result) => (
                    <div
                      key={result.domain}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800"
                    >
                      <div className="flex items-center gap-3">
                        {result.available ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                        <span className="font-medium">{result.domain}</span>
                        <Badge className={result.available
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }>
                          {result.available ? "Available" : "Taken"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{result.price}</span>
                        {result.available && (
                          <Button size="sm" onClick={() => toast.success(`${result.domain} purchased!`)}>
                            Purchase
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
