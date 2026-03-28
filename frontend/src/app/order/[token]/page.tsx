"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { getSocket } from "@/lib/socket";
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
import { Utensils, ShoppingCart, Plus, Minus, Clock, CheckCircle } from "lucide-react";
import type { MenuItem, Session } from "@/types";
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
  const [orders, setOrders] = useState<any[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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

    s.on("order-status-update", (data) => {
      console.log("Order status updated:", data);
      fetchOrders();
      toast.success("สถานะออเดอร์อัปเดตแล้ว");
    });

    return () => {
      s.off("order-status-update");
    };
  }, [token, router]);

  const fetchData = async () => {
    try {
      const [sessionRes, menuRes] = await Promise.all([
        api.get(`/sessions/token/${token}`).catch(() => ({ data: { data: null } })),
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
      const res = await api.get(`/orders/session/${session.id}`);
      setOrders(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  const addToCart = (item: MenuItem) => {
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
        kitchenId: item.kitchen.id,
        quantity: item.quantity,
      }));

      await api.post("/orders", {
        sessionId: session.id,
        items: orderItems,
      });

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
        return <Badge variant="destructive">ยกเลิก</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.quantity, 0);

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">🍲 Shabu Restaurant</h1>
              <p className="text-sm text-gray-500">
                โต๊ะ {session.table.number} - {session.tier.name}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsOrderHistoryOpen(true)}
            >
              ประวัติออเดอร์
            </Button>
          </div>
          <div className="mt-3 flex items-center gap-4 text-sm">
            <Badge variant={session.status === "ACTIVE" ? "success" : "secondary"}>
              {session.status === "ACTIVE" ? "กำลังทาน" : "ปิดโต๊ะแล้ว"}
            </Badge>
            <span className="text-gray-500">
              เวลาที่เหลือ: {Math.max(0, Math.floor((new Date(session.endTime).getTime() - Date.now()) / 60000))} นาที
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 pb-32">
        {/* Menu Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {menuItems
            .filter((item) => item.isAvailable)
            .map((item) => (
              <Card
                key={item.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
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
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
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
                ส่งออเดอร์
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
                        <CardTitle className="text-base">
                          {new Date(order.createdAt).toLocaleTimeString("th-TH")}
                        </CardTitle>
                        {getOrderStatusBadge(order.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {order.items.map((item: any) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>
                              {item.quantity}x {item.menuItem.name}
                            </span>
                            <Badge variant="outline">{item.status}</Badge>
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
