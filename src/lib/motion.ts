export const pageTransition = {
  initial: { opacity: 0, y: 18, filter: "blur(10px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: {
    opacity: 0,
    y: -12,
    filter: "blur(8px)",
    transition: { duration: 0.24, ease: [0.4, 0, 1, 1] as const },
  },
};

export const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.06,
    },
  },
};

export const cardReveal = {
  hidden: { opacity: 0, y: 22, scale: 0.98 },
  show: (index = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.34,
      delay: Math.min(index * 0.03, 0.18),
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};
