export interface PasswordStrength {
  score: number; // 0-4
  feedback: string;
  isValid: boolean;
  checks: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;
  const isValid = score >= 4; // At least 4 out of 5 criteria

  let feedback = "";
  if (score === 0) {
    feedback = "Very Weak";
  } else if (score === 1 || score === 2) {
    feedback = "Weak";
  } else if (score === 3) {
    feedback = "Fair";
  } else if (score === 4) {
    feedback = "Good";
  } else {
    feedback = "Strong";
  }

  return {
    score,
    feedback,
    isValid,
    checks,
  };
}

export function getPasswordRequirements(): string[] {
  return [
    "At least 8 characters long",
    "Contains uppercase letter (A-Z)",
    "Contains lowercase letter (a-z)",
    "Contains number (0-9)",
    "Contains special character (!@#$%^&*)",
  ];
}
