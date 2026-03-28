"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";
import api from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Utensils,
  ShoppingCart,
  Plus,
  Minus,
  Clock,
  CheckCircle,
  AlertCircle,
  ChefHat,
  Timer,
} from "lucide-react";
import type { MenuItem, Session, Order } from "@/types";
import { Socket } from "socket.io-client";
import Image from "next/image";

interface CartItem extends MenuItem {
  quantity: number;
}

export default function CustomerOrderPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [session, setSession] = useState<Session | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!token) {
      toast.error("Token ไม่ถูกต้อง");
      router.push("/");
      return;
    }

    fetchData();

    // Initialize socket
    const s = getSocket();
    setSocket(s);

    // Join session room
    s.on("connect", () => {
      console.log("Socket connected");
      // s.emit("session:join", { sessionId: session?.id });
    });

    // Listen for order status updates
    s.on("order:item_status_changed", (data) => {
      console.log("Order item status changed:", data);
      fetchOrders();
    });

    // Listen for menu availability changes
    s.on("menu:availability_changed", (data) => {
      console.log("Menu availability changed:", data);
      setMenuItems((prev) =>
        prev.map((item) =>
          item.id === data.menuItemId ? { ...item, isAvailable: data.isAvailable } : item
        )
      );
      if (!data.isAvailable) {
        toast.warning(`${data.name} หมดชั่วคราว`);
      }
    });

    // Listen for session time warnings
    s.on("session:time_warning", (data) => {
      if (data.sessionId === session?.id) {
        toast.warning(`⏰ เวลาเหลือ ${data.minutesLeft} นาที`);
      }
    });

    return () => {
      s.off("connect");
      s.off("order:item_status_changed");
      s.off("menu:availability_changed");
      s.off("session:time_warning");
    };
  }, [token, router]);

  // Update timer every minute
  useEffect(() => {
    if (!session) return;

    const updateTimer = () => {
      const now = Date.now();
      const end = new Date(session.endTime).getTime();
      const remaining = Math.max(0, end - now);
      setTimeLeft(Math.floor(remaining / 60000)); // minutes
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);

    return () => clearInterval(interval);
  }, [session]);

  const fetchData = async () => {
    try {
      const [sessionRes, menuRes] = await Promise.all([
        api.get(`/sessions/qr/${token}`).catch(() => ({ data: { data: null } })),
        api.get("/menu-items").catch(() => ({ data: { data: [] } })),
      ]);

      if (!sessionRes.data.data) {
        toast.error("ไม่พบข้อมูล Session");
        router.push("/");
        return;
      }

      setSession(sessionRes.data.data);
      setMenuItems(menuRes.data.data || []);
      await fetchOrders();
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (!session) return;
    try {
      const res = await api.get(`/orders?sessionId=${session.id}`).catch(() => ({ data: { data: [] } }));
      setOrders(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  const addToCart = (item: MenuItem) => {
    if (!item.isAvailable) {
      toast.warning("เมนูนี้หมดชั่วคราว");
      return;
    }

    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.id === itemId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const submitOrder = async () => {
    if (!session || cart.length === 0) return;

    try {
      const orderItems = cart.map((item) => ({
        menuItemId: item.id,
        quantity: item.quantity,
      }));

      console.log("Submitting order:", {
        sessionId: session.id,
        items: orderItems,
      });

      const response = await api.post("/orders", {
        sessionId: session.id,
        items: orderItems,
      });

      console.log("Order created:", response.data);

      toast.success("ส่งออเดอร์สำเร็จ!");
      setCart([]);
      fetchOrders();

      // Emit socket event
      socket?.emit("new-order", {
        sessionId: session.id,
        items: orderItems,
      });
    } catch (error: any) {
      console.error("Failed to submit order:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "ส่งออเดอร์ไม่สำเร็จ");
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="warning" className="gap-1">
            <Clock className="h-3 w-3" />
            รอยืนยัน
          </Badge>
        );
      case "CONFIRMED":
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            ยืนยันแล้ว
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            ยกเลิก
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getItemStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="warning">รอดำเนินการ</Badge>;
      case "PREPARING":
        return (
          <Badge variant="default" className="gap-1">
            <ChefHat className="h-3 w-3" />
            กำลังทำ
          </Badge>
        );
      case "SERVED":
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            เสิร์ฟแล้ว
          </Badge>
        );
      case "VOIDED":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            ยกเลิก
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.quantity, 0);

  const categories = Array.from(
    new Map(
      menuItems.map((item) => [item.category.id, item.category])
    ).values()
  );

  const filteredItems = selectedCategory === "all"
    ? menuItems
    : menuItems.filter((item) => item.category.id.toString() === selectedCategory);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">🍲 Shabu Restaurant</h1>
              <p className="text-sm text-gray-500">
                โต๊ะ {session.table.number} - {session.tier.name}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Timer className="h-4 w-4" />
                <span className={timeLeft < 15 ? "text-red-600 font-bold" : ""}>
                  {timeLeft} นาที
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOrderHistoryOpen(true)}
              >
                ประวัติออเดอร์
              </Button>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4 text-sm">
            <Badge variant={session.status === "ACTIVE" ? "success" : "secondary"}>
              {session.status === "ACTIVE" ? "กำลังทาน" : "ปิดโต๊ะแล้ว"}
            </Badge>
            {timeLeft < 15 && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                เวลาใกล้หมด
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
            {categories.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Menu Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className={`cursor-pointer transition-all ${
                item.isAvailable
                  ? "hover:shadow-lg hover:scale-105"
                  : "opacity-50 cursor-not-allowed"
              }`}
              onClick={() => addToCart(item)}
            >
              <div className="aspect-square relative bg-gray-100 rounded-t-lg overflow-hidden">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Utensils className="h-12 w-12 text-gray-300" />
                  </div>
                )}
                {!item.isAvailable && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="destructive">หมด</Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-3">
                <p className="font-medium text-sm line-clamp-2">{item.name}</p>
                <p className="text-xs text-gray-500">{item.category.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Floating Cart */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                <span className="font-medium">ตะกร้าสินค้า ({cartTotal} รายการ)</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setCart([])}>
                ล้างตะกร้า
              </Button>
            </div>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Plus className="h-4 w-4 rotate-45" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Separator className="my-3" />
            <div className="flex gap-2">
              <Button className="flex-1" size="lg" onClick={submitOrder}>
                ส่งออเดอร์ ({cartTotal} รายการ)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Order History Dialog */}
      <Dialog open={isOrderHistoryOpen} onOpenChange={setIsOrderHistoryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>ประวัติออเดอร์</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[400px]">
            {orders.length === 0 ? (
              <p className="text-center text-gray-500 py-8">ยังไม่มีออเดอร์</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleString("th-TH")}
                          </p>
                        </div>
                        {getOrderStatusBadge(order.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {order.items.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{item.quantity}x</Badge>
                              <span>{item.menuItem.name}</span>
                            </div>
                            {getItemStatusBadge(item.status)}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
