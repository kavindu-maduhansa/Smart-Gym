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

export const validatePhone = (phone) => {
  if (!phone || typeof phone !== "string") {
    return { valid: false, message: "Phone number is required" };
  }

  const trimmedPhone = phone.trim();
  const phoneRegex = /^[\d\s\-\+\(\)]{10,15}$/;

  if (!phoneRegex.test(trimmedPhone)) {
    return {
      valid: false,
      message: "Invalid phone number format (10-15 digits)",
    };
  }

  return { valid: true };
};

export const validateBio = (bio) => {
  if (!bio || typeof bio !== "string") {
    return { valid: false, message: "Bio is required" };
  }

  const trimmedBio = bio.trim();

  if (trimmedBio.length < 20) {
    return {
      valid: false,
      message: "Bio must be at least 20 characters long",
    };
  }

  if (trimmedBio.length > 500) {
    return {
      valid: false,
      message: "Bio must be less than 500 characters",
    };
  }

  return { valid: true };
};

export const validateExperienceYears = (years) => {
  if (years === undefined || years === null) {
    return { valid: false, message: "Experience years is required" };
  }

  const yearsNum = Number(years);

  if (isNaN(yearsNum)) {
    return { valid: false, message: "Experience years must be a number" };
  }

  if (yearsNum < 0) {
    return { valid: false, message: "Experience years cannot be negative" };
  }

  if (yearsNum > 50) {
    return { valid: false, message: "Experience years must be less than 50" };
  }

  return { valid: true };
};

export const validateSpecializations = (specializations) => {
  if (!Array.isArray(specializations)) {
    return { valid: false, message: "Specializations must be an array" };
  }

  if (specializations.length === 0) {
    return { valid: false, message: "At least one specialization is required" };
  }

  if (specializations.length > 10) {
    return { valid: false, message: "Maximum 10 specializations allowed" };
  }

  for (const spec of specializations) {
    if (typeof spec !== "string" || spec.trim().length < 2) {
      return {
        valid: false,
        message: "Each specialization must be at least 2 characters",
      };
    }
    if (spec.trim().length > 50) {
      return {
        valid: false,
        message: "Each specialization must be less than 50 characters",
      };
    }
  }

  return { valid: true };
};

export const validateTrainerStatus = (status) => {
  const validStatuses = ["active", "inactive", "on_leave"];

  if (!status || typeof status !== "string") {
    return { valid: false, message: "Status is required" };
  }

  if (!validStatuses.includes(status)) {
    return {
      valid: false,
      message: "Invalid status. Must be 'active', 'inactive', or 'on_leave'",
    };
  }

  return { valid: true };
};

export const validateAvailability = (availability) => {
  if (!Array.isArray(availability)) {
    return { valid: false, message: "Availability must be an array" };
  }

  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

  for (const slot of availability) {
    if (!slot.dayOfWeek && slot.dayOfWeek !== 0) {
      return { valid: false, message: "Each availability slot must have a dayOfWeek (0-6)" };
    }

    const day = Number(slot.dayOfWeek);
    if (isNaN(day) || day < 0 || day > 6) {
      return { valid: false, message: "dayOfWeek must be between 0 (Sunday) and 6 (Saturday)" };
    }

    if (!slot.startTime || !timeRegex.test(slot.startTime)) {
      return { valid: false, message: "Invalid startTime format (use HH:mm)" };
    }

    if (!slot.endTime || !timeRegex.test(slot.endTime)) {
      return { valid: false, message: "Invalid endTime format (use HH:mm)" };
    }

    const startMins = parseInt(slot.startTime.split(':')[0]) * 60 + parseInt(slot.startTime.split(':')[1]);
    const endMins = parseInt(slot.endTime.split(':')[0]) * 60 + parseInt(slot.endTime.split(':')[1]);

    if (startMins >= endMins) {
      return { valid: false, message: "startTime must be before endTime" };
    }
  }

  return { valid: true };
};
