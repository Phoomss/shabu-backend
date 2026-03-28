import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  User,
  Role,
  Table,
  Session,
  Tier,
  MenuItem,
  Category,
  KitchenSection,
  Order,
  OrderItem,
  Ingredient,
  Invoice,
  VoidLog,
  ApiResponse,
  DashboardStats,
  CreateOrderDto,
  UpdateOrderItemStatusDto,
  VoidOrderItemDto,
  CreateSessionDto,
  UpdateSessionStatusDto,
  CreateInvoiceDto,
  CreateIngredientDto,
  UpdateIngredientStockDto,
  CreateMenuItemDto,
  CreateCategoryDto,
  CreateTierDto,
  CreateTableDto,
  CreateKitchenSectionDto,
  CreateRoleDto,
  CreateUserDto,
} from '@/types';

// ==================== AUTH ====================
export const useLogin = () => {
  return useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const response = await api.post<ApiResponse<{ user: User; accessToken: string }>>('/auth/login', data);
      return response.data.data;
    },
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
  });
};

export const useAuthMe = () => {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<User>>('/auth/me');
      return response.data.data;
    },
    retry: false,
  });
};

// ==================== USERS ====================
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<User[]>>('/users');
      return response.data.data;
    },
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['users', id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<User>>(`/users/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateUserDto) => {
      const response = await api.post<ApiResponse<User>>('/users', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateUserDto> }) => {
      const response = await api.patch<ApiResponse<User>>(`/users/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// ==================== ROLES ====================
export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Role[]>>('/role');
      return response.data.data;
    },
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateRoleDto) => {
      const response = await api.post<ApiResponse<Role>>('/role', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateRoleDto> }) => {
      const response = await api.patch<ApiResponse<Role>>(`/role/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/role/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
};

// ==================== TABLES ====================
export const useTables = () => {
  return useQuery({
    queryKey: ['tables'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Table[]>>('/tables');
      return response.data.data;
    },
  });
};

export const useTable = (id: number) => {
  return useQuery({
    queryKey: ['tables', id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Table>>(`/tables/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreateTable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateTableDto) => {
      const response = await api.post<ApiResponse<Table>>('/tables', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });
};

export const useUpdateTable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateTableDto> }) => {
      const response = await api.patch<ApiResponse<Table>>(`/tables/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });
};

export const useUpdateTableStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: Table['status'] }) => {
      const response = await api.patch<ApiResponse<Table>>(`/tables/${id}/status`, { status });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });
};

export const useDeleteTable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/tables/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });
};

// ==================== SESSIONS ====================
export const useSessions = () => {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Session[]>>('/sessions');
      return response.data.data;
    },
  });
};

export const useSession = (id: string) => {
  return useQuery({
    queryKey: ['sessions', id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Session>>(`/sessions/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useSessionByToken = (token: string) => {
  return useQuery({
    queryKey: ['sessions', 'token', token],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Session>>(`/sessions/qr/${token}`);
      return response.data.data;
    },
    enabled: !!token,
  });
};

export const useCreateSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateSessionDto) => {
      const response = await api.post<ApiResponse<Session>>('/sessions', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });
};

export const useUpdateSessionStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Session['status'] }) => {
      const response = await api.patch<ApiResponse<Session>>(`/sessions/${id}/status`, { status });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};

// ==================== ORDERS ====================
export const useOrders = (sessionId?: string) => {
  return useQuery({
    queryKey: ['orders', sessionId],
    queryFn: async () => {
      const url = sessionId ? `/orders?sessionId=${sessionId}` : '/orders';
      const response = await api.get<ApiResponse<Order[]>>(url);
      return response.data.data;
    },
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Order>>(`/orders/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useKitchenOrders = (kitchenId?: number) => {
  return useQuery({
    queryKey: ['orders', 'kitchen', kitchenId],
    queryFn: async () => {
      const url = kitchenId ? `/orders/kitchen/${kitchenId}` : '/orders/kitchen';
      const response = await api.get<ApiResponse<OrderItem[]>>(url);
      return response.data.data;
    },
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateOrderDto) => {
      const response = await api.post<ApiResponse<Order>>('/orders', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Order['status'] }) => {
      const response = await api.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useUpdateOrderItemStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderItem['status'] }) => {
      const response = await api.patch<ApiResponse<OrderItem>>(`/orders/items/${id}/status`, { status } as UpdateOrderItemStatusDto);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useVoidOrderItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await api.post<ApiResponse<VoidLog>>(`/orders/items/${id}/void`, { reason } as VoidOrderItemDto);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['voids'] });
    },
  });
};

// ==================== MENU ITEMS ====================
export const useMenuItems = () => {
  return useQuery({
    queryKey: ['menu-items'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<MenuItem[]>>('/menu-items');
      return response.data.data;
    },
  });
};

export const useMenuItem = (id: string) => {
  return useQuery({
    queryKey: ['menu-items', id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<MenuItem>>(`/menu-items/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useMenuItemsByTier = (tierId: number) => {
  return useQuery({
    queryKey: ['menu-items', 'tier', tierId],
    queryFn: async () => {
      const response = await api.get<ApiResponse<MenuItem[]>>(`/menu-items/by-tier/${tierId}`);
      return response.data.data;
    },
    enabled: !!tierId,
  });
};

export const useCreateMenuItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateMenuItemDto) => {
      const response = await api.post<ApiResponse<MenuItem>>('/menu-items', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
    },
  });
};

export const useUpdateMenuItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateMenuItemDto> }) => {
      const response = await api.patch<ApiResponse<MenuItem>>(`/menu-items/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
    },
  });
};

export const useToggleMenuItemAvailability = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patch<ApiResponse<MenuItem>>(`/menu-items/${id}/availability`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
    },
  });
};

export const useDeleteMenuItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/menu-items/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
    },
  });
};

// ==================== CATEGORIES ====================
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Category[]>>('/categories');
      return response.data.data;
    },
  });
};

export const useCategory = (id: number) => {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Category>>(`/categories/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCategoryDto) => {
      const response = await api.post<ApiResponse<Category>>('/categories', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateCategoryDto> }) => {
      const response = await api.patch<ApiResponse<Category>>(`/categories/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/categories/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

// ==================== TIERS ====================
export const useTiers = () => {
  return useQuery({
    queryKey: ['tiers'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Tier[]>>('/tiers');
      return response.data.data;
    },
  });
};

export const useTier = (id: number) => {
  return useQuery({
    queryKey: ['tiers', id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Tier>>(`/tiers/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreateTier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateTierDto) => {
      const response = await api.post<ApiResponse<Tier>>('/tiers', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiers'] });
    },
  });
};

export const useUpdateTier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateTierDto> }) => {
      const response = await api.patch<ApiResponse<Tier>>(`/tiers/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiers'] });
    },
  });
};

export const useDeleteTier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/tiers/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiers'] });
    },
  });
};

// ==================== KITCHEN SECTIONS ====================
export const useKitchenSections = () => {
  return useQuery({
    queryKey: ['kitchen-sections'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<KitchenSection[]>>('/kitchens');
      return response.data.data;
    },
  });
};

export const useKitchenSection = (id: number) => {
  return useQuery({
    queryKey: ['kitchen-sections', id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<KitchenSection>>(`/kitchens/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreateKitchenSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateKitchenSectionDto) => {
      const response = await api.post<ApiResponse<KitchenSection>>('/kitchens', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-sections'] });
    },
  });
};

export const useUpdateKitchenSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateKitchenSectionDto> }) => {
      const response = await api.patch<ApiResponse<KitchenSection>>(`/kitchens/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-sections'] });
    },
  });
};

export const useDeleteKitchenSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/kitchens/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-sections'] });
    },
  });
};

// ==================== INGREDIENTS ====================
export const useIngredients = () => {
  return useQuery({
    queryKey: ['ingredients'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Ingredient[]>>('/ingredients');
      return response.data.data;
    },
  });
};

export const useIngredient = (id: number) => {
  return useQuery({
    queryKey: ['ingredients', id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Ingredient>>(`/ingredients/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreateIngredient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateIngredientDto) => {
      const response = await api.post<ApiResponse<Ingredient>>('/ingredients', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
  });
};

export const useUpdateIngredient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateIngredientDto> }) => {
      const response = await api.patch<ApiResponse<Ingredient>>(`/ingredients/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
  });
};

export const useUpdateIngredientStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, currentStock }: { id: number; currentStock: number }) => {
      const response = await api.patch<ApiResponse<Ingredient>>(`/ingredients/${id}/stock`, { currentStock } as UpdateIngredientStockDto);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
  });
};

export const useDeleteIngredient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/ingredients/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
  });
};

// ==================== INVOICES ====================
export const useInvoices = () => {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Invoice[]>>('/invoices');
      return response.data.data;
    },
  });
};

export const useInvoice = (id: number) => {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Invoice>>(`/invoices/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateInvoiceDto) => {
      const response = await api.post<ApiResponse<Invoice>>('/invoices', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });
};

// ==================== VOID LOGS ====================
export const useVoidLogs = () => {
  return useQuery({
    queryKey: ['voids'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<VoidLog[]>>('/voids');
      return response.data.data;
    },
  });
};

// ==================== DASHBOARD ====================
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats');
      return response.data.data;
    },
  });
};
