// Validation utilities

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmail = (email) => {
  if (!email || typeof email !== "string") {
    return { valid: false, message: "Email is required" };
  }

  if (email.length > 100) {
    return { valid: false, message: "Email must be less than 100 characters" };
  }

  if (!emailRegex.test(email)) {
    return { valid: false, message: "Invalid email format" };
  }

  return { valid: true };
};

export const validateName = (name) => {
  if (!name || typeof name !== "string") {
    return { valid: false, message: "Name is required" };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    return { valid: false, message: "Name must be at least 2 characters long" };
  }

  if (trimmedName.length > 50) {
    return { valid: false, message: "Name must be less than 50 characters" };
  }

  return { valid: true };
};

export const validatePassword = (password) => {
  if (!password || typeof password !== "string") {
    return { valid: false, message: "Password is required" };
  }

  if (password.length < 6) {
    return {
      valid: false,
      message: "Password must be at least 6 characters long",
    };
  }

  if (password.length > 100) {
    return {
      valid: false,
      message: "Password must be less than 100 characters",
    };
  }

  return { valid: true };
};
