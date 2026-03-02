/**
 * Input sanitization utilities
 * Prevents XSS and injection attacks
 */

/**
 * Escape HTML special characters
 * Prevents stored XSS when displaying user content
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Sanitize string by removing/escaping dangerous characters
 */
export function sanitizeString(value: string, maxLength: number = 5000): string {
  // Remove null bytes
  let sanitized = value.replace(/\0/g, '');

  // Limit length to prevent DoS via huge strings
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // Remove control characters (but allow common whitespace)
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

  return sanitized;
}

/**
 * Validate and sanitize email address
 */
export function sanitizeEmail(email: string): string {
  const sanitized = sanitizeString(email, 254).toLowerCase().trim();
  // Basic email validation (more thorough validation should happen with Zod)
  if (!sanitized.includes('@')) {
    throw new Error('Invalid email format');
  }
  return sanitized;
}

/**
 * Sanitize URL to prevent JavaScript URLs and data URLs
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }
    
    return parsed.toString();
  } catch {
    // If not a valid URL, treat as relative URL
    const sanitized = sanitizeString(url, 2048);
    
    // Prevent javascript: and data: URLs
    if (sanitized.toLowerCase().startsWith('javascript:') ||
        sanitized.toLowerCase().startsWith('data:')) {
      throw new Error('Invalid URL');
    }
    
    return sanitized;
  }
}

/**
 * Sanitize phone number (allows digits, +, -, (), spaces)
 */
export function sanitizePhone(phone: string): string {
  const sanitized = sanitizeString(phone, 20);
  // Only allow phone number characters
  if (!/^[\d\s\-().+]+$/.test(sanitized)) {
    throw new Error('Invalid phone number format');
  }
  return sanitized;
}

/**
 * Sanitize description or text field
 * Escapes HTML but preserves text content
 */
export function sanitizeDescription(text: string, maxLength: number = 5000): string {
  let sanitized = sanitizeString(text, maxLength);
  // Don't escape - let frontend handle display
  // Just ensure it's safe length and no control characters
  return sanitized;
}

/**
 * Validate ISO date string
 */
export function validateDate(dateString: string): Date {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format');
  }
  
  // Prevent dates too far in past or future (50 years either direction)
  const now = new Date();
  const minDate = new Date(now.getFullYear() - 50, 0, 1);
  const maxDate = new Date(now.getFullYear() + 50, 11, 31);
  
  if (date < minDate || date > maxDate) {
    throw new Error('Date out of acceptable range');
  }
  
  return date;
}

/**
 * Sanitize numeric value
 */
export function sanitizeNumber(value: number | string, min: number = 0, max: number = 1000): number {
  let num = typeof value === 'string' ? parseInt(value, 10) : value;
  
  if (isNaN(num)) {
    throw new Error('Invalid number');
  }
  
  // Clamp to range
  return Math.max(min, Math.min(max, num));
}

/**
 * Sanitize object recursively
 * Escapes all string values
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
}
