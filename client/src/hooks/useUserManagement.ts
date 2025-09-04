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
        // Populate shop information for users
        const usersWithShops = await Promise.all(
          response.users.map(async (user) => {
            if (user.shopId) {
              try {
                const shopResponse = await apiClient.getShopById(user.shopId);
                if (shopResponse.success && shopResponse.shop) {
                  return {
                    ...user,
                    shop: {
                      _id: shopResponse.shop._id,
                      name: shopResponse.shop.name,
                      address: shopResponse.shop.address
                    }
                  } as UserData;
                }
              } catch {
                // Error fetching shop details, skip
              }
            }
            return user;
          })
        );
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
