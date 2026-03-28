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
import { Clock, CheckCircle, AlertCircle, ChefHat, Timer } from "lucide-react";
import type { OrderItem } from "@/types";
import { Socket } from "socket.io-client";

interface OrderItemWithSession extends OrderItem {
  orderId: string;
  tableNumber: string;
  createdAt: string;
}

export default function KDSPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<OrderItemWithSession[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderItemWithSession[]>(
    []
  );
  const [kitchenSections, setKitchenSections] = useState<
    { id: number; name: string }[]
  >([]);
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    fetchOrders();
    fetchKitchenSections();

    // Initialize socket
    const s = getSocket();
    setSocket(s);

    s.on("new-order", (data) => {
      console.log("New order received:", data);
      fetchOrders();
      toast.success("ออเดอร์ใหม่เข้ามา!");
    });

    s.on("order-updated", (data) => {
      console.log("Order updated:", data);
      fetchOrders();
    });

    return () => {
      s.off("new-order");
      s.off("order-updated");
    };
  }, []);

  useEffect(() => {
    if (selectedSection === "all") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(
        orders.filter((order) => order.kitchen.id.toString() === selectedSection)
      );
    }
  }, [orders, selectedSection]);

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
      const res = await api.get("/kitchen-sections");
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
      await api.patch(`/order-items/${orderItemId}/status`, { status });
      toast.success("อัปเดตสถานะสำเร็จ");
      fetchOrders();

      // Emit socket event
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

  const groupedOrders = filteredOrders.reduce(
    (acc, order) => {
      const key = order.orderId;
      if (!acc[key]) {
        acc[key] = {
          orderId: order.orderId,
          tableNumber: order.tableNumber,
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
        createdAt: string;
        items: OrderItemWithSession[];
      }
    >
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kitchen Display System</h1>
          <p className="text-gray-500">ระบบจัดการออเดอร์ห้องครัว</p>
        </div>
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-600">
            อัปเดตล่าสุด: {new Date().toLocaleTimeString("th-TH")}
          </span>
        </div>
      </div>

      {/* Kitchen Section Filter */}
      <Tabs value={selectedSection} onValueChange={setSelectedSection}>
        <TabsList>
          <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
          {kitchenSections.map((section) => (
            <TabsTrigger key={section.id} value={section.id.toString()}>
              {section.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Orders Grid */}
      <ScrollArea className="flex-1">
        {Object.keys(groupedOrders).length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-500">
            <div className="text-center">
              <ChefHat className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">ไม่มีออเดอร์ในห้องครัว</p>
              <p className="text-sm">ออเดอร์ใหม่จะปรากฏที่นี่</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(groupedOrders).map((orderGroup) => (
              <Card key={orderGroup.orderId} className="border-l-4 border-l-red-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      โต๊ะ {orderGroup.tableNumber}
                    </CardTitle>
                    <Badge variant="outline">
                      {getTimeAgo(orderGroup.createdAt)}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    ออเดอร์: {orderGroup.orderId.slice(-8)}
                  </p>
                </CardHeader>
                <Separator />
                <CardContent className="space-y-3">
                  {orderGroup.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-2 p-2 bg-gray-50 rounded"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">{item.quantity}x</span>
                          <span className="font-medium">{item.menuItem.name}</span>
                        </div>
                        <div className="mt-1">{getStatusBadge(item.status)}</div>
                      </div>
                      <div className="flex gap-1">
                        {item.status === "PENDING" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateOrderStatus(item.id, "PREPARING")
                            }
                          >
                            เริ่มทำ
                          </Button>
                        )}
                        {item.status === "PREPARING" && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => updateOrderStatus(item.id, "SERVED")}
                          >
                            เสิร์ฟ
                          </Button>
                        )}
                      </div>
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
