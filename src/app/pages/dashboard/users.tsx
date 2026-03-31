import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Switch } from "../../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Separator } from "../../components/ui/separator";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import {
  Users as UsersIcon,
  UserPlus,
  Search,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Key,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Upload,
  Download,
  Filter,
  UserCog,
  Lock,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { BulkUpload } from "../../components/bulk-upload";
import { toast } from "sonner";

const mockTeamUsers = [
  { id: "1", name: "Sarah Johnson", email: "sarah@modernboutique.ai", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop", role: "Owner", department: "Management", status: "active", lastLogin: "2026-03-30T10:30:00", permissions: ["all"] },
  { id: "2", name: "Marcus Chen", email: "marcus@modernboutique.ai", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop", role: "Admin", department: "Operations", status: "active", lastLogin: "2026-03-30T09:15:00", permissions: ["dashboard", "orders", "inventory", "customers", "payments", "analytics", "settings"] },
  { id: "3", name: "Emily Rodriguez", email: "emily@modernboutique.ai", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop", role: "Editor", department: "Marketing", status: "active", lastLogin: "2026-03-29T16:45:00", permissions: ["dashboard", "blog", "marketing", "website"] },
  { id: "4", name: "David Kim", email: "david@modernboutique.ai", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop", role: "Support", department: "Customer Service", status: "active", lastLogin: "2026-03-30T08:00:00", permissions: ["dashboard", "orders", "customers"] },
  { id: "5", name: "Lisa Wang", email: "lisa@modernboutique.ai", avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop", role: "Viewer", department: "Finance", status: "active", lastLogin: "2026-03-28T14:20:00", permissions: ["dashboard", "analytics", "payments"] },
  { id: "6", name: "Tom Wilson", email: "tom@modernboutique.ai", avatar: "", role: "Editor", department: "Marketing", status: "invited", lastLogin: "", permissions: ["dashboard", "blog", "marketing"] },
  { id: "7", name: "Ana Patel", email: "ana@modernboutique.ai", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop", role: "Admin", department: "Operations", status: "deactivated", lastLogin: "2026-03-15T10:00:00", permissions: [] },
];

const roles = [
  { id: "owner", name: "Owner", description: "Full access to everything. Cannot be removed.", icon: ShieldAlert, color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", permissions: ["all"] },
  { id: "admin", name: "Admin", description: "Full access except billing & ownership transfer.", icon: ShieldCheck, color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400", permissions: ["dashboard", "orders", "inventory", "customers", "payments", "analytics", "marketing", "blog", "website", "plugins", "integrations", "settings"] },
  { id: "editor", name: "Editor", description: "Can manage content, blog, and website builder.", icon: Edit, color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", permissions: ["dashboard", "blog", "marketing", "website"] },
  { id: "support", name: "Support", description: "Can view/manage orders and customer inquiries.", icon: UsersIcon, color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", permissions: ["dashboard", "orders", "customers"] },
  { id: "viewer", name: "Viewer", description: "Read-only access to dashboard and analytics.", icon: Eye, color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400", permissions: ["dashboard", "analytics"] },
];

const allPermissions = [
  { id: "dashboard", name: "Dashboard", description: "View dashboard home" },
  { id: "website", name: "Website Builder", description: "Edit website content and design" },
  { id: "orders", name: "Orders", description: "View and manage orders" },
  { id: "inventory", name: "Inventory", description: "Manage products and stock" },
  { id: "customers", name: "Customers", description: "View and manage customers" },
  { id: "payments", name: "Payments", description: "View payment details and invoices" },
  { id: "analytics", name: "Analytics", description: "View analytics and reports" },
  { id: "marketing", name: "Marketing", description: "Manage campaigns and emails" },
  { id: "blog", name: "Blog", description: "Create and manage blog posts" },
  { id: "plugins", name: "Plugins", description: "Install and configure plugins" },
  { id: "integrations", name: "Integrations", description: "Manage third-party integrations" },
  { id: "settings", name: "Settings", description: "Manage platform settings" },
  { id: "billing", name: "Billing", description: "View and manage billing" },
  { id: "users", name: "User Management", description: "Invite and manage team members" },
];

export function UsersManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [users, setUsers] = useState(mockTeamUsers);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === "all" || u.role.toLowerCase() === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleInvite = () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    toast.success(`Invitation sent to ${inviteEmail}`);
    setUsers([...users, {
      id: `${Date.now()}`,
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      avatar: "",
      role: inviteRole.charAt(0).toUpperCase() + inviteRole.slice(1),
      department: "",
      status: "invited",
      lastLogin: "",
      permissions: roles.find(r => r.id === inviteRole)?.permissions || [],
    }]);
    setInviteEmail("");
    setShowInvite(false);
  };

  const handleStatusChange = (userId: string, newStatus: string) => {
    setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    toast.success(`User ${newStatus === 'deactivated' ? 'deactivated' : 'activated'}`);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <UsersIcon className="w-8 h-8 text-purple-600" />
            <h1 className="text-2xl md:text-3xl font-bold">Users & Roles</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Manage team members, roles, and permissions</p>
        </div>
        <div className="flex gap-2">
          <BulkUpload type="users" />
          <Dialog open={showInvite} onOpenChange={setShowInvite}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="w-4 h-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Email Address</Label>
                  <Input className="mt-1" type="email" placeholder="member@company.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                </div>
                <div>
                  <Label>Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {roles.filter(r => r.id !== "owner").map(role => (
                        <SelectItem key={role.id} value={role.id}>
                          <div className="flex items-center gap-2">
                            <role.icon className="w-4 h-4" />
                            {role.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    {roles.find(r => r.id === inviteRole)?.description}
                  </p>
                </div>
                <Button className="w-full gap-2" onClick={handleInvite}>
                  <Mail className="w-4 h-4" /> Send Invitation
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Total Members</p><p className="text-2xl font-bold">{users.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Active</p><p className="text-2xl font-bold text-green-600">{users.filter(u => u.status === "active").length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Invited</p><p className="text-2xl font-bold text-blue-600">{users.filter(u => u.status === "invited").length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Deactivated</p><p className="text-2xl font-bold text-gray-400">{users.filter(u => u.status === "deactivated").length}</p></CardContent></Card>
        <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"><CardContent className="p-4"><p className="text-sm opacity-90">Roles</p><p className="text-2xl font-bold">{roles.length}</p></CardContent></Card>
      </div>

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        {/* MEMBERS TAB */}
        <TabsContent value="members" className="mt-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search members..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-[180px]"><Filter className="w-4 h-4 mr-2" /><SelectValue placeholder="Filter by role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left p-4 text-sm font-medium">Member</th>
                    <th className="text-left p-4 text-sm font-medium">Role</th>
                    <th className="text-left p-4 text-sm font-medium hidden md:table-cell">Department</th>
                    <th className="text-left p-4 text-sm font-medium hidden lg:table-cell">Last Login</th>
                    <th className="text-left p-4 text-sm font-medium">Status</th>
                    <th className="text-right p-4 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={roles.find(r => r.name === user.role)?.color || ''}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="p-4 hidden md:table-cell text-sm text-gray-600">{user.department || "—"}</td>
                      <td className="p-4 hidden lg:table-cell text-sm text-gray-500">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className={
                          user.status === "active" ? "text-green-600 border-green-300" :
                          user.status === "invited" ? "text-blue-600 border-blue-300" :
                          "text-gray-400 border-gray-300"
                        }>
                          {user.status === "active" && <CheckCircle className="w-3 h-3 mr-1" />}
                          {user.status === "invited" && <Clock className="w-3 h-3 mr-1" />}
                          {user.status === "deactivated" && <XCircle className="w-3 h-3 mr-1" />}
                          {user.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem><Edit className="w-4 h-4 mr-2" /> Edit Role</DropdownMenuItem>
                            <DropdownMenuItem><Key className="w-4 h-4 mr-2" /> Reset Password</DropdownMenuItem>
                            {user.status === "active" ? (
                              <DropdownMenuItem onClick={() => handleStatusChange(user.id, "deactivated")} className="text-red-600">
                                <XCircle className="w-4 h-4 mr-2" /> Deactivate
                              </DropdownMenuItem>
                            ) : user.status === "deactivated" ? (
                              <DropdownMenuItem onClick={() => handleStatusChange(user.id, "active")} className="text-green-600">
                                <CheckCircle className="w-4 h-4 mr-2" /> Reactivate
                              </DropdownMenuItem>
                            ) : null}
                            {user.status === "invited" && (
                              <DropdownMenuItem><Mail className="w-4 h-4 mr-2" /> Resend Invite</DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ROLES TAB */}
        <TabsContent value="roles" className="mt-6 space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <Card key={role.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${role.color}`}>
                        <role.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{role.name}</CardTitle>
                        <p className="text-xs text-gray-500">
                          {users.filter(u => u.role.toLowerCase() === role.id).length} members
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{role.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.includes("all") ? (
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Full Access</Badge>
                    ) : (
                      role.permissions.slice(0, 4).map(p => (
                        <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                      ))
                    )}
                    {!role.permissions.includes("all") && role.permissions.length > 4 && (
                      <Badge variant="secondary" className="text-xs">+{role.permissions.length - 4} more</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />

          {/* Permission Matrix */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Permission Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="w-full">
                <div className="min-w-[700px]">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 text-sm font-medium">Permission</th>
                        {roles.map(r => (
                          <th key={r.id} className="text-center p-3 text-sm font-medium">{r.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {allPermissions.map((perm) => (
                        <tr key={perm.id} className="border-b">
                          <td className="p-3">
                            <p className="text-sm font-medium">{perm.name}</p>
                            <p className="text-xs text-gray-500">{perm.description}</p>
                          </td>
                          {roles.map(r => (
                            <td key={r.id} className="text-center p-3">
                              {r.permissions.includes("all") || r.permissions.includes(perm.id) ? (
                                <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                              ) : (
                                <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ACTIVITY TAB */}
        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { user: "Sarah Johnson", action: "Updated website builder settings", time: "2 minutes ago", type: "settings" },
                  { user: "Marcus Chen", action: "Processed order #ORD-2453", time: "15 minutes ago", type: "order" },
                  { user: "Emily Rodriguez", action: "Published blog post 'Spring Collection'", time: "1 hour ago", type: "content" },
                  { user: "David Kim", action: "Responded to customer inquiry", time: "2 hours ago", type: "support" },
                  { user: "Sarah Johnson", action: "Invited Tom Wilson as Editor", time: "3 hours ago", type: "user" },
                  { user: "Marcus Chen", action: "Updated inventory for 12 products", time: "5 hours ago", type: "inventory" },
                  { user: "Lisa Wang", action: "Exported analytics report", time: "Yesterday", type: "analytics" },
                  { user: "Sarah Johnson", action: "Deactivated Ana Patel's account", time: "3 days ago", type: "user" },
                ].map((activity, i) => (
                  <div key={i} className="flex items-center gap-4 py-2">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      activity.type === 'settings' ? 'bg-purple-500' :
                      activity.type === 'order' ? 'bg-blue-500' :
                      activity.type === 'content' ? 'bg-green-500' :
                      activity.type === 'support' ? 'bg-yellow-500' :
                      activity.type === 'user' ? 'bg-red-500' :
                      activity.type === 'inventory' ? 'bg-orange-500' :
                      'bg-gray-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span> {activity.action}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Compliance Badges */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-6 justify-center">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-sm font-semibold">SOC 2 Compliant</p>
                <p className="text-xs text-gray-500">Type II Certified</p>
              </div>
            </div>
            <Separator orientation="vertical" className="h-10 hidden md:block" />
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-sm font-semibold">PCI DSS</p>
                <p className="text-xs text-gray-500">Level 1 Certified</p>
              </div>
            </div>
            <Separator orientation="vertical" className="h-10 hidden md:block" />
            <div className="flex items-center gap-2">
              <Lock className="w-6 h-6 text-purple-600" />
              <div>
                <p className="text-sm font-semibold">GDPR Ready</p>
                <p className="text-xs text-gray-500">Data Protection</p>
              </div>
            </div>
            <Separator orientation="vertical" className="h-10 hidden md:block" />
            <div className="flex items-center gap-2">
              <Key className="w-6 h-6 text-orange-600" />
              <div>
                <p className="text-sm font-semibold">256-bit SSL</p>
                <p className="text-xs text-gray-500">End-to-end Encryption</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
