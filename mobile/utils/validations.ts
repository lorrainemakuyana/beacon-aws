export const validateRegistrationData = (data: {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}): string | null => {
  const { email, password, confirmPassword, firstName, lastName } = data;

  if (!firstName.trim()) {
    return "First name is required";
  }

  if (!lastName.trim()) {
    return "Last name is required";
  }

  if (!validateEmail(email)) {
    return "Please enter a valid email address";
  }

  if (!password || password.length < 6) {
    return "Password must be at least 6 characters long";
  }

  if (password !== confirmPassword) {
    return "Passwords do not match";
  }

  return null;
};

export const validateLoginData = (data: {
  email: string;
  password: string;
}): string | null => {
  const { email, password } = data;

  if (!validateEmail(email)) {
    return "Please enter a valid email address";
  }

  if (!password) {
    return "Password is required";
  }

  return null;
};

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10;
};

// Data transformation utilities
export const sanitizeUserData = (userData: any) => {
  return {
    ...userData,
    email: userData.email?.toLowerCase().trim(),
    displayName: userData.displayName?.trim(),
    createdAt: createTimestamp(),
    lastActive: createTimestamp(),
  };
};

export const sanitizeEventData = (eventData: any) => {
  return {
    ...eventData,
    title: eventData.title?.trim(),
    description: eventData.description?.trim(),
    createdAt: createTimestamp(),
    updatedAt: createTimestamp(),
  };
};

// Utility functions
const createTimestamp = () => {
  return Date.now();
};