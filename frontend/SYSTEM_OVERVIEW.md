# 🍲 Shabu System - Frontend

## ระบบจัดการร้านอาหารชาบู / Shabu Restaurant Management System

---

## 📖 ภาพรวมระบบ / System Overview

### 🇹🇭 ภาษาไทย

Frontend ของระบบ Shabu เป็นเว็บแอปพลิเคชันที่พัฒนาด้วย **Next.js 16 (App Router)** และ **React 19** ใช้ **TypeScript** เป็นหลักในการพัฒนา ออกแบบ UI ด้วย **Tailwind CSS** และใช้คอมโพเนนต์จาก **Radix UI** (ผ่าน shadcn) ระบบรองรับการทำงานแบบ Real-time ด้วย **Socket.IO Client** และจัดการ State ด้วย **Zustand**

### 🇬🇧 English

The Shabu System Frontend is a web application built with **Next.js 16 (App Router)** and **React 19**, primarily using **TypeScript**. The UI is designed with **Tailwind CSS** and uses components from **Radix UI** (via shadcn). The system supports real-time functionality with **Socket.IO Client** and manages state with **Zustand**.

---

## 🏗️ สถาปัตยกรรมระบบ / System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Devices                            │
│   (Desktop, Tablet, Mobile - POS, KDS, Customer Ordering)   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│         Next.js Frontend (Port 3001 / 3000)                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  App Router (Next.js 16) - Server & Client Components│  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  State Management: Zustand + React Query             │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Socket.IO Client (Real-time Updates)                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend API (NestJS - Port 3000)               │
│              (REST API + Socket.IO Gateway)                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 ฟีเจอร์หลัก / Key Features

### 1️⃣ ระบบ Authentication & Authorization

| 🇹🇭 ไทย | 🇬🇧 English |
|----------|-------------|
| เข้าสู่ระบบด้วย Username/Password | Login with Username/Password |
| จัดการ Token ด้วย Middleware | Token management with Middleware |
| ตรวจสอบสิทธิ์ตาม Role | Role-based access control |
| จัดการ Session อัตโนมัติ | Automatic session management |

### 2️⃣ ระบบ POS (Point of Sale)

| 🇹🇭 ไทย | 🇬🇧 English |
|----------|-------------|
| เลือกโต๊ะและสร้าง Session | Select table and create session |
| เพิ่มรายการอาหารลงตะกร้า | Add menu items to cart |
| ชำระเงินและออกใบเสร็จ | Checkout and generate invoice |
| อัปเดตสถานะแบบ Real-time | Real-time status updates |

### 3️⃣ ระบบ KDS (Kitchen Display System)

| 🇹🇭 ไทย | 🇬🇧 English |
|----------|-------------|
| แสดงออเดอร์ใหม่แบบ Real-time | Display new orders in real-time |
| แยกตามแผนกครัว (Hot, Cold, Bar, Dessert) | Filter by kitchen section |
| อัปเดตสถานะอาหาร (Pending → Preparing → Served) | Update order status |
| แจ้งเตือนออเดอร์ที่ยกเลิก | Alert for voided orders |

### 4️⃣ ระบบสั่งอาหารผ่าน QR (Customer Ordering)

| 🇹🇭 ไทย | 🇬🇧 English |
|----------|-------------|
| สแกน QR Code เพื่อสั่งอาหาร | Scan QR code to order |
| แสดงเมนูตาม Tier ที่เลือก | Show menu based on selected tier |
| ยืนยันออเดอร์ส่งเข้าครัว | Submit order to kitchen |
| ติดตามสถานะอาหาร | Track food preparation status |

### 5️⃣ ระบบจัดการข้อมูลหลังบ้าน / Admin Dashboard

| Module | Description (TH) | Description (EN) |
|--------|------------------|------------------|
| **Dashboard** | แผงควบคุมแสดงสถิติ | Analytics dashboard |
| **Users** | จัดการผู้ใช้งาน | User management |
| **Roles** | จัดการบทบาทและสิทธิ์ | Role management |
| **Tables** | จัดการโต๊ะและโซน | Table and zone management |
| **Sessions** | จัดการรอบการนั่ง | Session management |
| **Menus** | จัดการรายการเมนู | Menu item management |
| **Categories** | จัดการหมวดหมู่อาหาร | Food category management |
| **Tiers** | จัดการระดับราคา | Pricing tier management |
| **Kitchen Sections** | จัดการแผนกครัว | Kitchen section management |
| **Ingredients** | จัดการวัตถุดิบ | Ingredient management |
| **Orders** | ดูประวัติออเดอร์ | Order history |
| **Invoices** | ดูใบเสร็จ/ใบแจ้งหนี้ | Invoice management |
| **Void Logs** | ดูรายการยกเลิก | Void log audit |

---

## 📂 โครงสร้างโปรเจกต์ / Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth pages (login)
│   │   │   ├── login/
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/        # Admin dashboard pages
│   │   │   ├── dashboard/      # Main dashboard
│   │   │   ├── pos/            # Point of Sale
│   │   │   ├── kds/            # Kitchen Display System
│   │   │   ├── users/          # User management
│   │   │   ├── roles/          # Role management
│   │   │   ├── tables/         # Table management
│   │   │   ├── sessions/       # Session management
│   │   │   ├── menus/          # Menu management
│   │   │   ├── categories/     # Category management
│   │   │   ├── tiers/          # Tier management
│   │   │   ├── kitchen-sections/
│   │   │   ├── ingredients/    # Ingredient management
│   │   │   ├── orders/         # Order management
│   │   │   ├── invoices/       # Invoice management
│   │   │   └── void-logs/      # Void log audit
│   │   ├── order/              # Customer QR ordering page
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── ui/                 # Reusable UI components (shadcn)
│   │   ├── pos/                # POS-specific components
│   │   └── providers/          # Context providers
│   ├── lib/
│   │   ├── api.ts              # API client (Axios)
│   │   ├── socket.ts           # Socket.IO client
│   │   └── utils.ts            # Utility functions
│   ├── stores/
│   │   ├── authStore.ts        # Authentication state (Zustand)
│   │   └── cartStore.tsx       # Shopping cart state (Zustand)
│   ├── types/
│   │   └── index.ts            # TypeScript type definitions
│   └── middleware.ts           # Next.js Middleware (auth guard)
├── public/                     # Static assets
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
└── components.json             # shadcn configuration
```

---

## 🛠️ เทคโนโลยีที่ใช้ / Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| **Framework** | Next.js | 16.2 |
| **React** | React | 19.2 |
| **Language** | TypeScript | 5.x |
| **Styling** | Tailwind CSS | 4.x |
| **UI Components** | Radix UI + shadcn | Latest |
| **Icons** | Lucide React | 0.577 |
| **State Management** | Zustand | 5.0 |
| **Data Fetching** | TanStack React Query | 5.94 |
| **HTTP Client** | Axios | 1.13 |
| **Real-time** | Socket.IO Client | 4.8 |
| **Forms** | React Hook Form | 7.72 |
| **Validation** | Zod | 4.3 |
| **QR Code** | qrcode.react | 4.2 |
| **Notifications** | Sonner | 2.0 |
| **Theming** | next-themes | 0.4 |

---

## 🚀 การติดตั้งและรันโปรเจกต์ / Installation & Running

### ข้อกำหนดระบบ / Requirements

- Node.js >= 18
- npm หรือ pnpm

### ขั้นตอนการติดตั้ง / Installation Steps

```bash
# 1. ติดตั้ง Dependencies / Install dependencies
$ npm install

# 2. ตั้งค่า Environment Variables / Setup environment
# สร้างไฟล์ .env.local และเพิ่ม:
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000

# 3. รัน Development Server / Start development server
$ npm run dev

# 4. Build for Production / Build for production
$ npm run build

# 5. Start Production Server / Start production server
$ npm run start
```

### Environment Variables / ตัวแปรสภาพแวดล้อม

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# Socket.IO Configuration
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000

# (Optional) Application Settings
NEXT_PUBLIC_APP_NAME=Shabu System
```

---

## 📡 API Integration / การเชื่อมต่อ API

### API Client (`src/lib/api.ts`)

ใช้ **Axios** เป็น HTTP Client พร้อม Interceptor สำหรับ:
- เพิ่ม JWT Token ใน headers อัตโนมัติ
- จัดการ Error responses
- Refresh token เมื่อหมดอายุ

### Socket.IO Client (`src/lib/socket.ts`)

เชื่อมต่อแบบ Real-time กับ Backend สำหรับ:
- แจ้งเตือนออเดอร์ใหม่
- อัปเดตสถานะอาหาร
- เปลี่ยนสถานะโต๊ะ
- แจ้งเตือนวัตถุดิบต่ำ

---

## 🔔 Real-time Events / อีเวนต์แบบ Real-time

### Events ที่ Frontend รับจาก Backend

| Event Name | Description (TH) | Description (EN) |
|------------|------------------|------------------|
| `menu:availability_changed` | เปลี่ยนความพร้อมของเมนู | Menu availability changed |
| `kitchen:new_order` | ออเดอร์ใหม่เข้าครัว | New order in kitchen |
| `kitchen:void_order` | ยกเลิกออเดอร์ | Order voided |
| `order:status_changed` | เปลี่ยนสถานะออเดอร์ | Order status changed |
| `order:item_status_changed` | เปลี่ยนสถานะรายการอาหาร | Order item status changed |
| `table:status_changed` | เปลี่ยนสถานะโต๊ะ | Table status changed |
| `session:status_changed` | เปลี่ยนสถานะ Session | Session status changed |
| `session:time_warning` | เตือนเวลาใกล้หมด | Session time warning |
| `ingredient:low_stock` | เตือนวัตถุดิบต่ำ | Low stock alert |
| `invoice:new` | ใบแจ้งหนี้ใหม่ | New invoice created |

---

## 🎨 UI Components / คอมโพเนนต์

### shadcn/ui Components

โปรเจกต์ใช้คอมโพเนนต์จาก [shadcn/ui](https://ui.shadcn.com) ซึ่งสร้างจาก **Radix UI** Primitives:

- Button, Input, Form
- Dialog, Alert, Toast
- Table, Card, Badge
- Select, Dropdown Menu
- Tabs, Accordion
- And more...

### Custom Components

- **POS Components** (`src/components/pos/`) - คอมโพเนนต์สำหรับหน้า POS
- **Providers** (`src/components/providers/`) - Context providers ต่างๆ

---

## 📊 State Management / การจัดการ State

### Zustand Stores

| Store | Description |
|-------|-------------|
| `authStore.ts` | จัดการข้อมูลผู้ใช้และ Authentication state |
| `cartStore.tsx` | จัดการตะกร้าสินค้าสำหรับ POS และ Customer Ordering |

### React Query

ใช้ **TanStack React Query** สำหรับ:
- Data fetching และ caching
- Auto revalidation
- Optimistic updates

---

## 🔐 Authentication Flow / กระบวนการยืนยันตัวตน

```
1. User Login → POST /auth/login
2. Receive JWT Token → Store in memory (Zustand)
3. Middleware checks token on protected routes
4. API requests include token in Authorization header
5. Token refresh automatically when expired
6. Logout → Clear token and redirect to login
```

### Protected Routes

Middleware (`src/middleware.ts`) ป้องกันหน้าที่ต้อง Authentication:
- `/dashboard/*`
- `/pos/*`
- `/kds/*`
- `/order/*`

---

## 📱 Responsive Design / การออกแบบ Responsive

- **Desktop First** - ออกแบบสำหรับ Desktop เป็นหลัก
- **Mobile Support** - รองรับการใช้งานบน Mobile และ Tablet
- **Touch Friendly** - ปุ่มและ Interactive elements มีขนาดเหมาะสม

---

## 🎨 Styling / การตกแต่ง

### Tailwind CSS

ใช้ **Tailwind CSS v4** สำหรับ styling:
- Utility-first approach
- Dark mode support (via next-themes)
- Custom design tokens

### Custom CSS

- Global styles in `src/app/globals.css`
- Custom animations and transitions

---

## 🧪 การทดสอบ / Testing

```bash
# Run linting
$ npm run lint

# (Future) Add unit tests with Jest/React Testing Library
# (Future) Add E2E tests with Playwright/Cypress
```

---

## 📱 Pages Overview / ภาพรวมหน้าต่างๆ

### Public Pages

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | หน้าเข้าสู่ระบบ |
| Customer Ordering | `/order/[token]` | หน้าสั่งอาหารผ่าน QR |

### Protected Pages (Dashboard)

| Page | Route | Role Required |
|------|-------|---------------|
| Dashboard | `/dashboard` | All authenticated users |
| POS | `/pos` | STAFF, MANAGER, OWNER |
| KDS | `/kds` | KITCHEN, MANAGER, OWNER |
| Users | `/users` | MANAGER, OWNER |
| Tables | `/tables` | MANAGER, OWNER |
| Sessions | `/sessions` | MANAGER, OWNER |
| Menus | `/menus` | MANAGER, OWNER |
| Invoices | `/invoices` | MANAGER, OWNER |
| Void Logs | `/void-logs` | MANAGER, OWNER |

---

## 🔄 Development Workflow / ขั้นตอนการพัฒนา

### Adding a New Feature

1. Create new route in `src/app/`
2. Add API service in `src/lib/`
3. Define types in `src/types/`
4. Create components in `src/components/`
5. Add state management if needed in `src/stores/`
6. Test with backend API

### Adding a New API Endpoint

1. Add endpoint function in `src/lib/api.ts`
2. Define request/response types in `src/types/`
3. Use React Query hook in components
4. Handle loading and error states

---

## 📞 Support / การสนับสนุน

สำหรับคำถามหรือปัญหาในการใช้งาน:

- 📧 Email: [ติดต่อทีมพัฒนา / Contact dev team]
- 📖 Backend API Docs: `http://localhost:3000/api-docs`
- 🐛 Issues: [GitHub Issues]

---

## 📄 License / ใบอนุญาต

UNLICENSED - © Shabu System. All rights reserved.

---

## 🙏 Acknowledgments / ขอบคุณ

Built with ❤️ using:
- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Socket.IO](https://socket.io/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [TanStack Query](https://tanstack.com/query)

---

<div align="center">

**🍲 Shabu System - Frontend**

*ระบบจัดการร้านอาหารชาบูแบบครบวงจร | Comprehensive Shabu Restaurant Management System*

---

Made with TypeScript, Next.js & React

</div>
