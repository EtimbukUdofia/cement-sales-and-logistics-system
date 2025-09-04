import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/auth`
  : "http://localhost:5000/api/v0/auth";

axios.defaults.withCredentials = true;

type SignupData = {
  username: string;
  email: string;
  password: string;
}

type User = {
  id: string;
  username: string;
  email: string;
  role: "admin" | "salesPerson";
  shopId?: string;
}

type AuthState = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  hasCheckedAuth: boolean;
  signup: (userData: SignupData) => Promise<void>;
  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

type UserData = {
  username: string;
  email: string;
  password: string;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  isCheckingAuth: false,
  hasCheckedAuth: false,

  signup: async (userData: UserData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/signup`, userData);
      set({ user: response.data.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      let errorMessage = "An error occured while Signing Up";
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  checkAuth: async () => {
    const { hasCheckedAuth } = get();
    // Prevent double execution
    if (hasCheckedAuth) return;

    set({ isCheckingAuth: true, error: null, hasCheckedAuth: true });
    try {
      const response = await axios.get(`${API_URL}/check-auth`);
      set({ user: response.data.user, isAuthenticated: true, isCheckingAuth: false });
    } catch (error) {
      let errorMessage = "An error occurred while checking authentication";
      if (axios.isAxiosError(error) && error.response && error.response.status !== 401) {
        errorMessage = error.response.data.message || error.message;
        set({ error: errorMessage });
      } else if (error instanceof Error) {
        set({ error: error.message });
      }
      set({ user: null, isAuthenticated: false, isCheckingAuth: false });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      set({ user: response.data.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      let errorMessage = "An error occurred while logging in";
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(`${API_URL}/logout`);
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      let errorMessage = "An error occurred while logging out";
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
}));