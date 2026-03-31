import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Mail, MessageSquare, Send } from "lucide-react";

export function Marketing() {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Marketing</h1>
        <p className="text-gray-600 dark:text-gray-400">Email campaigns and promotional tools</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <Mail className="w-8 h-8 text-purple-600 mb-2" />
            <CardTitle>Email Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Create Campaign</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <MessageSquare className="w-8 h-8 text-blue-600 mb-2" />
            <CardTitle>SMS Marketing</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Send SMS</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Send className="w-8 h-8 text-green-600 mb-2" />
            <CardTitle>Abandoned Cart</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Configure</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
