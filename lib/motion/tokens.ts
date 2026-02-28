export const duration = {
  instant: 0.08, // 80ms
  fast: 0.12,    // 120ms
  normal: 0.16,  // 160ms
  slow: 0.22,    // 220ms
  drawer: 0.24,  // 240ms
};

export const ease = {
  // iOS-like easeOut: cubic-bezier(0.16, 1, 0.3, 1)
  easeOut: [0.16, 1, 0.3, 1] as const,
  // Standard easeInOut: cubic-bezier(0.4, 0, 0.2, 1)
  easeInOut: [0.4, 0, 0.2, 1] as const,
  // Gentle spring for tactile feedback
  springSoft: {
    type: "spring",
    stiffness: 500,
    damping: 30,
    mass: 1,
  },
  // Slightly bouncier spring for emphasis (use sparingly)
  springTactile: {
    type: "spring",
    stiffness: 400,
    damping: 25,
    mass: 1,
  }
};

export const delay = {
  fast: 0.04,
  normal: 0.08,
};
