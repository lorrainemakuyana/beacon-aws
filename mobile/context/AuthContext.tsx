import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User as FirebaseUser } from "firebase/auth";
import {
  loginWithEmail,
  registerWithEmail,
  logout,
  resetPassword,
  onChangeAuth,
  AuthState,
  restoreLoginFromStorage,
} from "@/firebase/services/auth";
import { User } from "@/interfaces";
import Logo from "@/assets/images/logo.png";
import { Image, View } from "react-native";
import { router } from "expo-router";
import { getUser } from "@/firebase/services/users";

interface AuthContextType {
  user: User | null;
  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;

  // Utility functions
  refreshUserProfile: () => Promise<void>;
  clearError: () => void;
  isAuthenticated: boolean;

  // State
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state
  useEffect(() => {
    let unsubscribe = () => {};

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const restoredUser = await restoreLoginFromStorage();

        if (restoredUser) {
          setUser(restoredUser);
          setLoading(false);
          // still attach listener to keep in sync
        }
      } catch (err: any) {
        console.warn("restoreLoginFromStorage failed:", err);
      }

      // Attach auth state change listener
      unsubscribe = onChangeAuth(async (firebaseUser) => {
        setLoading(true);
        setError(null);

        try {
          if (firebaseUser) {
            const user = await getUser(firebaseUser.uid); 
            setUser(user);
          } else {
            setUser(null);
          }
        } catch (err: any) {
          console.error("Auth state change error:", err);
          setError(err.message || "An authentication error occurred");
        } finally {
          setLoading(false);
        }
      });
    })();

    return () => unsubscribe();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const user = await loginWithEmail(
        email,
        password,
      );
      setUser(user);
    } catch (err: any) {
      setError(err.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const user = await registerWithEmail(email, password, firstName, lastName);
      setUser(user);
    } catch (err: any) {
      setError(err.message || "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Google login function (placeholder - needs implementation)
  const googleLogin = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Implement Google Sign-In for React Native
      // This requires additional setup with @react-native-google-signin/google-signin
      throw new Error("Google Sign-In not yet implemented");
    } catch (err: any) {
      setError(err.message || "Google login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const signOut = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await logout();
      setUser(null);
    } catch (err: any) {
      setError(err.message || "Logout failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reset password function
  const resetUserPassword = async (email: string): Promise<void> => {
    setError(null);

    try {
      await resetPassword(email);
    } catch (err: any) {
      setError(err.message || "Password reset failed");
      throw err;
    }
  };

  // Refresh user profile
  const refreshUserProfile = async (): Promise<void> => {
    if (!user) return;

    try {
      const _user = await getUser(user.uid);
      setUser(_user);
    } catch (err: any) {
      console.error("Failed to refresh user profile:", err);
      setError(err.message || "Failed to refresh profile");
    }
  };

  // Clear error
  const clearError = () => setError(null);

  const value: AuthContextType = {
    // State
    user,
    loading,
    error,
    isAuthenticated: !!user,

    // Actions
    login,
    register,
    loginWithGoogle: googleLogin,
    logout: signOut,
    resetPassword: resetUserPassword,
    refreshUserProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
): React.FC<P> => {
  const WrappedComponent: React.FC<P> = (props: P) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
      return (
        <View>
          <Image
            source={Logo}
            style={{ width: 200, height: 200 }}
            resizeMode="contain"
          />
        </View>
      );
    }

    if (!isAuthenticated) {
      router.replace("/auth");
      return null;
    }

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name || "Component"})`;

  return WrappedComponent;
};

// Hook for auth guards
export const useAuthGuard = () => {
  const { isAuthenticated, loading, user } = useAuth();

  return {
    isAuthenticated,
    loading,
    user,
    canAccess: (requiredRole?: string) => {
      if (!isAuthenticated || !user) return false;
      if (!requiredRole) return true;

      // Role hierarchy: owner > coordinator > collaborator > volunteer
      const roleHierarchy = {
        volunteer: 0,
        collaborator: 1,
        coordinator: 2,
        owner: 3,
      };

      const userRoleLevel =
        roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;
      const requiredRoleLevel =
        roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

      return userRoleLevel >= requiredRoleLevel;
    },
  };
};
