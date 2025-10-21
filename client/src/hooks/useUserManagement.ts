import { useState, useEffect } from 'react';
import { apiClient, type UserData, type CreateUserData, type UpdateUserData, type ShopData } from '@/lib/api';
import { toast } from 'sonner';

export function useUserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [shops, setShops] = useState<ShopData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all users
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getUsers();
      if (response.success && response.users) {
        // First, get all existing shops to avoid 404 errors
        const shopsResponse = await apiClient.getShops();
        const existingShops = shopsResponse.success ? shopsResponse.shops : [];
        const shopMap = new Map(existingShops.map(shop => [shop._id, shop]));

        // Populate shop information for users only if the shop exists
        const usersWithShops = response.users.map((user) => {
          if (user.shopId && shopMap.has(user.shopId)) {
            const shop = shopMap.get(user.shopId)!;
            return {
              ...user,
              shop: {
                _id: shop._id,
                name: shop.name,
                address: shop.address
              }
            } as UserData;
          }
          return user;
        });
        setUsers(usersWithShops);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch {
      toast.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all shops
  const fetchShops = async () => {
    try {
      const response = await apiClient.getShops();
      if (response.success && response.shops) {
        setShops(response.shops);
      }
    } catch {
      // Error fetching shops, continue silently
    }
  };

  // Create a new user
  const createUser = async (userData: CreateUserData) => {
    setIsSubmitting(true);
    try {
      const response = await apiClient.createUser(userData);
      if (response.success) {
        toast.success('User created successfully');
        await fetchUsers(); // Refresh the users list
        return { success: true };
      } else {
        toast.error(response.message || 'Failed to create user');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update an existing user
  const updateUser = async (id: string, userData: UpdateUserData) => {
    setIsSubmitting(true);
    try {
      const response = await apiClient.updateUser(id, userData);
      if (response.success) {
        toast.success('User updated successfully');
        await fetchUsers(); // Refresh the users list
        return { success: true };
      } else {
        toast.error(response.message || 'Failed to update user');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete a user
  const deleteUser = async (id: string) => {
    setIsSubmitting(true);
    try {
      const response = await apiClient.deleteUser(id);
      if (response.success) {
        toast.success('User deleted successfully');
        await fetchUsers(); // Refresh the users list
        return { success: true };
      } else {
        toast.error(response.message || 'Failed to delete user');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initialize data on mount
  useEffect(() => {
    fetchUsers();
    fetchShops();
  }, []);

  return {
    users,
    shops,
    isLoading,
    isSubmitting,
    fetchUsers,
    fetchShops,
    createUser,
    updateUser,
    deleteUser,
  };
}
