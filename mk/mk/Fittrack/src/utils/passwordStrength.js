/**
 * Password Strength Checker
 * Returns: { score: 0-4, label, color, percentage, checks }
 * 
 * 0 = Very Weak (red)
 * 1 = Weak (orange)
 * 2 = Fair (yellow)
 * 3 = Strong (green)
 * 4 = Very Strong (bright green)
 */

export const checkPasswordStrength = (password) => {
  if (!password) {
    return { score: 0, label: '', color: '#666', percentage: 0, checks: [] };
  }

  const checks = [
    { label: '8+ characters', passed: password.length >= 8 },
    { label: 'Uppercase letter', passed: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', passed: /[a-z]/.test(password) },
    { label: 'Number (0-9)', passed: /[0-9]/.test(password) },
    { label: 'Special character (!@#$%)', passed: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ];

  const passedCount = checks.filter(c => c.passed).length;
  
  // Calculate score (0-4)
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

  // Cap at 4
  score = Math.min(score, 4);

  const levels = [
    { label: 'Very Weak', color: '#ef4444' },    // Red
    { label: 'Weak', color: '#f97316' },          // Orange
    { label: 'Fair', color: '#eab308' },          // Yellow
    { label: 'Strong', color: '#22c55e' },        // Green
    { label: 'Very Strong', color: '#10b981' },   // Bright Green
  ];

  return {
    score,
    label: levels[score].label,
    color: levels[score].color,
    percentage: (passedCount / checks.length) * 100,
    checks,
  };
};
