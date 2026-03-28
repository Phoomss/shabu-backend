"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { getSocket } from "@/lib/socket";
import api from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  ChefHat,
  Timer,
  XCircle,
  Eye,
} from "lucide-react";
import type { OrderItem, KitchenSection } from "@/types";
import { Socket } from "socket.io-client";

interface OrderItemWithSession extends OrderItem {
  orderId: string;
  tableNumber: string;
  tableId: number;
  createdAt: string;
}

export default function KDSPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<OrderItemWithSession[]>([]);
  const [kitchenSections, setKitchenSections] = useState<KitchenSection[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isVoidDialogOpen, setIsVoidDialogOpen] = useState(false);
  const [selectedVoidItem, setSelectedVoidItem] = useState<OrderItemWithSession | null>(null);

  useEffect(() => {
    fetchOrders();
    fetchKitchenSections();

    // Initialize socket
    const s = getSocket();
    setSocket(s);

    // Join kitchen room for real-time updates
    s.on("connect", () => {
      console.log("Socket connected");
      // Optionally join specific kitchen room
      // s.emit("kitchen:join", { kitchenId: 1 });
    });

    // Listen for new orders
    s.on("kitchen:new_order", (data) => {
      console.log("New order in kitchen:", data);
      fetchOrders();
      toast.success("📋 ออเดอร์ใหม่เข้ามา!");
    });

    // Listen for order item status changes
    s.on("order:item_status_changed", (data) => {
      console.log("Order item status changed:", data);
      fetchOrders();
    });

    // Listen for void orders
    s.on("kitchen:void_order", (data) => {
      console.log("Order voided:", data);
      fetchOrders();
      toast.warning(`⚠️ ยกเลิกออเดอร์: ${data.reason}`);
    });

    return () => {
      s.off("connect");
      s.off("kitchen:new_order");
      s.off("order:item_status_changed");
      s.off("kitchen:void_order");
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders/kitchen");
      setOrders(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  const fetchKitchenSections = async () => {
    try {
      const res = await api.get("/kitchens");
      setKitchenSections(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch kitchen sections:", error);
    }
  };

  const updateOrderStatus = async (
    orderItemId: string,
    status: "PREPARING" | "SERVED"
  ) => {
    try {
      await api.patch(`/orders/items/${orderItemId}/status`, { status });
      toast.success("อัปเดตสถานะสำเร็จ");
      fetchOrders();

      // Emit socket event for real-time update
      socket?.emit("update-order-item", {
        orderItemId,
        status,
      });
    } catch (error: any) {
      console.error("Failed to update status:", error);
      toast.error(error.response?.data?.message || "ไม่สามารถอัปเดตได้");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="warning" className="gap-1">
            <Clock className="h-3 w-3" />
            รอดำเนินการ
          </Badge>
        );
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

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000); // minutes

    if (diff < 1) return "เพิ่งสั่ง";
    if (diff < 60) return `${diff} นาทีที่แล้ว`;
    const hours = Math.floor(diff / 60);
    return `${hours} ชม. ${diff % 60} นาทีที่แล้ว`;
  };

  const groupedOrders = orders
    .filter((order) => {
      if (selectedSection === "all") return true;
      return order.kitchen.id.toString() === selectedSection;
    })
    .reduce(
      (acc, order) => {
        const key = order.orderId;
        if (!acc[key]) {
          acc[key] = {
            orderId: order.orderId,
            tableNumber: order.tableNumber,
            tableId: order.tableId,
            createdAt: order.createdAt,
            items: [],
          };
        }
        acc[key].items.push(order);
        return acc;
      },
      {} as Record<
        string,
        {
          orderId: string;
          tableNumber: string;
          tableId: number;
          createdAt: string;
          items: OrderItemWithSession[];
        }
      >
    );

  // Sort by time (oldest first)
  const sortedGroups = Object.values(groupedOrders).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  const preparingCount = orders.filter((o) => o.status === "PREPARING").length;
  const servedCount = orders.filter((o) => o.status === "SERVED").length;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kitchen Display System</h1>
          <p className="text-gray-500">ระบบจัดการออเดอร์ห้องครัว</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <Badge variant="warning" className="gap-1">
              <Clock className="h-3 w-3" />
              {pendingCount}
            </Badge>
            <Badge variant="default" className="gap-1">
              <ChefHat className="h-3 w-3" />
              {preparingCount}
            </Badge>
            <Badge variant="success" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              {servedCount}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Timer className="h-4 w-4" />
            <span>อัปเดต: {new Date().toLocaleTimeString("th-TH")}</span>
          </div>
        </div>
      </div>

      {/* Kitchen Section Filter */}
      <Tabs value={selectedSection} onValueChange={setSelectedSection}>
        <TabsList>
          <TabsTrigger value="all">ทั้งหมด ({sortedGroups.length})</TabsTrigger>
          {kitchenSections.map((section) => {
            const count = sortedGroups.filter((group) =>
              group.items.some((item) => item.kitchen.id === section.id)
            ).length;
            return (
              <TabsTrigger key={section.id} value={section.id.toString()}>
                {section.name} ({count})
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Orders Grid */}
      <ScrollArea className="flex-1">
        {sortedGroups.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-500">
            <div className="text-center">
              <ChefHat className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">ไม่มีออเดอร์ในห้องครัว</p>
              <p className="text-sm">ออเดอร์ใหม่จะปรากฏที่นี่</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedGroups.map((orderGroup) => (
              <Card
                key={orderGroup.orderId}
                className={`border-l-4 ${
                  orderGroup.items.some((item) => item.status === "PENDING")
                    ? "border-l-red-500"
                    : "border-l-green-500"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      โต๊ะ {orderGroup.tableNumber}
                    </CardTitle>
                    <Badge variant="outline" className="gap-1">
                      <Timer className="h-3 w-3" />
                      {getTimeAgo(orderGroup.createdAt)}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    Order: {orderGroup.orderId.slice(-8)}
                  </p>
                </CardHeader>
                <Separator />
                <CardContent className="space-y-2">
                  {orderGroup.items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-lg ${
                        item.status === "VOIDED"
                          ? "bg-red-50 opacity-60"
                          : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="font-bold text-lg">{item.quantity}x</span>
                          <div>
                            <p className="font-medium">{item.menuItem.name}</p>
                            <p className="text-xs text-gray-500">{item.kitchen.name}</p>
                          </div>
                        </div>
                        {getStatusBadge(item.status)}
                      </div>
                      {item.status !== "VOIDED" && item.status !== "SERVED" && (
                        <div className="flex gap-2">
                          {item.status === "PENDING" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() =>
                                updateOrderStatus(item.id, "PREPARING")
                              }
                            >
                              <ChefHat className="h-4 w-4 mr-1" />
                              เริ่มทำ
                            </Button>
                          )}
                          {item.status === "PREPARING" && (
                            <Button
                              size="sm"
                              variant="default"
                              className="flex-1"
                              onClick={() => updateOrderStatus(item.id, "SERVED")}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              เสิร์ฟ
                            </Button>
                          )}
                        </div>
                      )}
                      {item.status === "VOIDED" && (
                        <p className="text-xs text-red-600 mt-1">
                          ยกเลิกโดยผู้จัดการ
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
