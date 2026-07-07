/**
 * Authentication service using Firebase Auth
 * Handles login, registration, and user management
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential,
  AuthError,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { User, COLLECTIONS } from "../../interfaces";
import { auth, firestore } from "../config";
import { validateEmail, sanitizeUserData } from "@/utils/validations";
import { getUser, updateUser, getCurrentUser } from "./users";

// Auth state management
export interface AuthState {
  firebaseUser: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  error: string | null;
}

// Login with email and password
export const loginWithEmail = async (
  email: string,
  password: string,
): Promise<User | null> => {
  try {
    if (!validateEmail(email)) {
      throw new Error("Please enter a valid email address");
    }

    if (!password || password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }

    // Sign in with Firebase Auth
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth,
      email.toLowerCase().trim(),
      password,
    );

    // Get user profile from Firestore
    const user = await getUser(userCredential.user.uid);

    if (!user) {
      throw new Error("User profile not found");
    }

    // Persist credentials for auto-login fallback on React Native where
    // firebase JS SDK persistence may not be available. WARNING: storing
    // raw passwords in AsyncStorage is insecure. Prefer SecureStore/Keychain
    // in production (expo-secure-store or react-native-keychain).
    try {
      await AsyncStorage.setItem(
        "@beacon:auth_credentials_v1",
        JSON.stringify({ email: email.toLowerCase().trim(), password }),
      );
    } catch (err) {
      // non-fatal
      console.warn("Failed to persist auth credentials:", err);
    }

    // Update last active timestamp
    await updateUser(userCredential.user.uid, { lastActive: Date.now() });

    return user;
  } catch (error: any) {
    console.error("Login error:", error);
    return null;
  }
};

// Register with email and password
export const registerWithEmail = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: "volunteer" | "coordinator" | "collaborator" | "owner" = "volunteer",
): Promise<User | null> => {
  try {
    if (!validateEmail(email)) {
      throw new Error("Please enter a valid email address");
    }

    if (!password || password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }

    if (!firstName.trim() || !lastName.trim()) {
      throw new Error("First name and last name are required");
    }

    // Create user with Firebase Auth
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email.toLowerCase().trim(),
      password,
    );

    const displayName = `${firstName.trim()} ${lastName.trim()}`;

    // Update Firebase Auth profile
    await updateProfile(userCredential.user, {
      displayName,
    });

    // Create user profile in Firestore
    const user: User = {
      uid: userCredential.user.uid,
      email: userCredential.user.email!,
      displayName,
      role,
      createdAt: Date.now(),
      lastActive: Date.now(),
      skills: [],
    };

    await setDoc(
      doc(firestore, COLLECTIONS.USERS, userCredential.user.uid),
      sanitizeUserData(user),
    );

    // Send email verification
    await sendEmailVerification(userCredential.user);

    return user;
  } catch (error: any) {
    console.error("Registration error:", error);
    return null;
  }
};

// Sign out
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);

    await AsyncStorage.removeItem("@beacon:auth_credentials_v1");
  } catch (error: any) {
    console.error("Logout error:", error);
    throw new Error("Failed to sign out. Please try again.");
  }
};

// Attempt to restore login from stored credentials. Returns the user/profile
// pair on success or null on failure. Call this early (e.g., in AuthContext
// initialization) to auto-sign-in the user.
export const restoreLoginFromStorage = async (): Promise<User | null> => {
  try {
    const raw = await AsyncStorage.getItem("@beacon:auth_credentials_v1");
    if (!raw) return null;
    const { email, password } = JSON.parse(raw);
    if (!email || !password) return null;

    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );

    const user = await getUser(userCredential.user.uid);
    if (!user) return null;

    await updateUser(userCredential.user.uid, { lastActive: Date.now() });

    return user;
  } catch (error: any) {
    console.warn("Auto-restore login failed:", error);
    return null;
  }
};

// Reset password
export const resetPassword = async (email: string): Promise<void> => {
  try {
    if (!validateEmail(email)) {
      throw new Error("Please enter a valid email address");
    }

    await sendPasswordResetEmail(auth, email.toLowerCase().trim());
  } catch (error: any) {
    console.error("Password reset error:", error);
    throw new Error(getAuthErrorMessage(error));
  }
};

// Auth state listener
export const onChangeAuth = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Resend email verification
export const resendEmailVerification = async (): Promise<void> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error("No user is currently signed in");
    }

    if (user.emailVerified) {
      throw new Error("Email is already verified");
    }

    await sendEmailVerification(user);
  } catch (error: any) {
    console.error("Resend verification error:", error);
    throw new Error(getAuthErrorMessage(error));
  }
};

// Delete user account
export const deleteUserAccount = async (): Promise<void> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error("No user is currently signed in");
    }

    // Delete user profile from Firestore
    await deleteDoc(doc(firestore, COLLECTIONS.USERS, user.uid));

    // Delete Firebase Auth account
    await user.delete();
  } catch (error: any) {
    console.error("Delete account error:", error);
    throw new Error(getAuthErrorMessage(error));
  }
};

// Helper function to convert Firebase Auth errors to user-friendly messages
const getAuthErrorMessage = (error: AuthError | Error): string => {
  if ("code" in error) {
    switch (error.code) {
      case "auth/user-not-found":
        return "No account found with this email address.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/email-already-in-use":
        return "An account with this email address already exists.";
      case "auth/weak-password":
        return "Password is too weak. Please choose a stronger password.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/user-disabled":
        return "This account has been disabled. Please contact support.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later.";
      case "auth/network-request-failed":
        return "Network error. Please check your connection and try again.";
      case "auth/requires-recent-login":
        return "This operation requires recent authentication. Please sign in again.";
      default:
        return (
          error.message || "An authentication error occurred. Please try again."
        );
    }
  }

  return error.message || "An unexpected error occurred. Please try again.";
};

