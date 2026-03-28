"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  Users,
  Utensils,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  activeTables: number;
  pendingOrders: number;
}

interface RecentOrder {
  id: string;
  tableNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface TableStatus {
  id: number;
  number: string;
  zone?: string;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "CLEANING";
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    todayRevenue: 0,
    todayOrders: 0,
    activeTables: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [tables, setTables] = useState<TableStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // In a real implementation, you would have a dedicated dashboard API endpoint
      // For now, we'll fetch data from multiple endpoints
      const [tablesRes] = await Promise.all([
        api.get("/tables").catch(() => ({ data: { data: [] } })),
      ]);

      setTables(tablesRes.data.data || []);

      // Mock stats for now - will be replaced with real API calls
      setStats({
        todayRevenue: 15420,
        todayOrders: 45,
        activeTables: 8,
        pendingOrders: 12,
      });

      setRecentOrders([
        {
          id: "ORD-001",
          tableNumber: "T1",
          totalAmount: 850,
          status: "CONFIRMED",
          createdAt: new Date().toISOString(),
        },
        {
          id: "ORD-002",
          tableNumber: "T5",
          totalAmount: 1200,
          status: "PENDING",
          createdAt: new Date().toISOString(),
        },
        {
          id: "ORD-003",
          tableNumber: "T3",
          totalAmount: 650,
          status: "CONFIRMED",
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge variant="success">ยืนยันแล้ว</Badge>;
      case "PENDING":
        return <Badge variant="warning">รอดำเนินการ</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">ยกเลิก</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTableStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return <Badge variant="success">ว่าง</Badge>;
      case "OCCUPIED":
        return <Badge variant="default">มีลูกค้า</Badge>;
      case "RESERVED":
        return <Badge variant="warning">จองไว้</Badge>;
      case "CLEANING":
        return <Badge variant="secondary">ทำความสะอาด</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500">ภาพรวมการขายและการจัดการร้าน</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รายได้วันนี้</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ฿{stats.todayRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              +20.1% จากเมื่อวาน
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ออเดอร์วันนี้</CardTitle>
            <Utensils className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayOrders}</div>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              +15% จากเมื่อวาน
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">โต๊ะที่ใช้งาน</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTables}</div>
            <p className="text-xs text-gray-500">
              จาก 20 โต๊ะ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รอดำเนินการ</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3 text-yellow-500" />
              ต้องจัดการ
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              ออเดอร์ล่าสุด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ออเดอร์</TableHead>
                  <TableHead>โต๊ะ</TableHead>
                  <TableHead>ยอดรวม</TableHead>
                  <TableHead>สถานะ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.tableNumber}</TableCell>
                    <TableCell>฿{order.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Table Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              สถานะโต๊ะ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {tables.length === 0 ? (
                <p className="text-gray-500 col-span-3 text-center py-4">
                  ยังไม่มีข้อมูลโต๊ะ
                </p>
              ) : (
                tables.map((table) => (
                  <Card key={table.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">โต๊ะ {table.number}</p>
                        <p className="text-xs text-gray-500">{table.zone || "-"}</p>
                      </div>
                      {getTableStatusBadge(table.status)}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
