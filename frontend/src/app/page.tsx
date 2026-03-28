"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, LayoutDashboard, LogIn } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    // Auto redirect to dashboard if already logged in
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🍲</div>
          <h1 className="text-3xl font-bold text-red-600">Shabu Restaurant</h1>
          <p className="text-gray-500 mt-1">ระบบจัดการร้านชาบู</p>
        </div>

        {/* Options */}
        <div className="space-y-4">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>ยินดีต้อนรับ</CardTitle>
              <CardDescription>กรุณาเลือกตัวเลือกด้านล่าง</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/login">
                <Button className="w-full gap-2" size="lg">
                  <LogIn className="h-5 w-5" />
                  เข้าสู่ระบบ
                </Button>
              </Link>

              <Link href="/pos">
                <Button className="w-full gap-2" variant="outline" size="lg">
                  <Utensils className="h-5 w-5" />
                  ไปที่ POS
                </Button>
              </Link>

              <Link href="/dashboard">
                <Button className="w-full gap-2" variant="ghost" size="lg">
                  <LayoutDashboard className="h-5 w-5" />
                  Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-gray-500">
            © 2026 Shabu Restaurant POS System
          </p>
        </div>
      </div>
    </div>
  );
}
