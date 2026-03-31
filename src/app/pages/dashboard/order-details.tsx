import { useParams, Link, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";
import { 
  ArrowLeft, 
  Download, 
  MapPin, 
  CreditCard, 
  Package,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { mockOrders, statusColors } from "../../lib/mock-data";
import { Separator } from "../../components/ui/separator";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

export function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [refundAmount, setRefundAmount] = useState("");
  
  const order = mockOrders.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Order not found</p>
          <Link to="/dashboard/orders">
            <Button className="mt-4">Back to Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "long", 
      day: "numeric", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleStatusUpdate = (status: string) => {
    toast.success(`Order ${status}!`);
  };

  const handleRefund = (type: "full" | "partial") => {
    if (type === "partial" && (!refundAmount || parseFloat(refundAmount) <= 0)) {
      toast.error("Please enter a valid refund amount");
      return;
    }
    const amount = type === "full" ? order.total : parseFloat(refundAmount);
    toast.success(`Refund of $${amount.toFixed(2)} processed successfully`);
  };

  const handleCancelOrder = () => {
    toast.success("Order cancelled successfully");
    setTimeout(() => navigate("/dashboard/orders"), 1000);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Order {order.id}</h1>
            <p className="text-gray-600 dark:text-gray-400">{formatDate(order.date)}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Invoice</span>
          </Button>
          <Badge className={`${statusColors[order.status as keyof typeof statusColors]} px-4 py-2`}>
            {order.status}
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Products */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.products.map((product, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Quantity: {product.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${(product.price * product.quantity).toFixed(2)}</p>
                        <p className="text-sm text-gray-500">${product.price.toFixed(2)} each</p>
                      </div>
                    </div>
                    {index < order.products.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tax</span>
                  <span>$0.00</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Order Placed</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(order.date)}
                    </p>
                  </div>
                </div>
                {order.status !== "cancelled" && (
                  <>
                    <div className="flex gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        order.status === "processing" || order.status === "completed"
                          ? "bg-blue-100 dark:bg-blue-900/30"
                          : "bg-gray-100 dark:bg-gray-800"
                      }`}>
                        <Clock className={`w-5 h-5 ${
                          order.status === "processing" || order.status === "completed"
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-400"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Processing</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {order.status === "processing" || order.status === "completed" 
                            ? "In progress" 
                            : "Pending"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        order.status === "completed"
                          ? "bg-green-100 dark:bg-green-900/30"
                          : "bg-gray-100 dark:bg-gray-800"
                      }`}>
                        <Package className={`w-5 h-5 ${
                          order.status === "completed"
                            ? "text-green-600 dark:text-green-400"
                            : "text-gray-400"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Delivered</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {order.status === "completed" ? "Completed" : "Pending"}
                        </p>
                      </div>
                    </div>
                  </>
                )}
                {order.status === "cancelled" && (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Order Cancelled</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Cancelled by customer</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={order.avatar} />
                  <AvatarFallback>{order.customer.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{order.customer}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{order.email}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full">View Profile</Button>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{order.shippingAddress}</p>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-1">{order.paymentMethod}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">•••• 4242</p>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Order Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.status === "pending" && (
                <Button 
                  className="w-full" 
                  onClick={() => handleStatusUpdate("marked as processing")}
                >
                  Mark as Processing
                </Button>
              )}
              {order.status === "processing" && (
                <Button 
                  className="w-full"
                  onClick={() => handleStatusUpdate("marked as completed")}
                >
                  Mark as Completed
                </Button>
              )}
              
              {order.status !== "cancelled" && (
                <>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        Full Refund
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Issue Full Refund?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will refund ${order.total.toFixed(2)} to the customer. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRefund("full")}>
                          Confirm Refund
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        Partial Refund
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Issue Partial Refund</AlertDialogTitle>
                        <AlertDialogDescription>
                          Enter the amount to refund (Max: ${order.total.toFixed(2)})
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="py-4">
                        <Label htmlFor="refundAmount">Refund Amount</Label>
                        <Input
                          id="refundAmount"
                          type="number"
                          placeholder="0.00"
                          max={order.total}
                          value={refundAmount}
                          onChange={(e) => setRefundAmount(e.target.value)}
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRefund("partial")}>
                          Confirm Refund
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        Cancel Order
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will cancel the order and notify the customer. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Order</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleCancelOrder}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Cancel Order
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
