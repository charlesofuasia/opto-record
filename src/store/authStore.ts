import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types/user';

interface AuthState {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;

    // Actions
    setUser: (user: User | null) => void;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    fetchUser: () => Promise<void>;
    clearUser: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isLoading: false,
            isAuthenticated: false,

            setUser: (user) =>
                set({
                    user,
                    isAuthenticated: !!user,
                }),

            login: async (username: string, password: string) => {
                set({ isLoading: true });
                try {
                    const res = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password }),
                    });

                    if (!res.ok) {
                        const err = await res.json();
                        throw new Error(err.error || err.message || 'Login failed');
                    }

                    const data = await res.json();
                    set({
                        user: data.user,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            logout: async () => {
                set({ isLoading: true });
                try {
                    await fetch('/api/auth/logout', {
                        method: 'POST',
                    });
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                    });
                } catch (error) {
                    console.error('Logout error:', error);
                    // Clear state even if API call fails
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                    });
                }
            },

            fetchUser: async () => {
                set({ isLoading: true });
                try {
                    const res = await fetch('/api/users/me');

                    if (!res.ok) {
                        throw new Error('Failed to fetch user');
                    }

                    const user = await res.json();
                    set({
                        user,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error) {
                    console.error('Fetch user error:', error);
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                    });
                    throw error;
                }
            },

            clearUser: () => {
                set({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            },
        }),
        {
            name: 'auth-storage', // name of the item in localStorage
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated
            }), // only persist user and isAuthenticated
        }
    )
);
