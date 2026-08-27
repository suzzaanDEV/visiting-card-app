// Framer Motion animation presets and transition variants for Cardly
export const transitions = {
  default: { type: 'spring', stiffness: 300, damping: 30 },
  smooth: { type: 'tween', ease: 'easeInOut', duration: 0.3 },
  slow: { type: 'tween', ease: 'easeInOut', duration: 0.5 },
  bounce: { type: 'spring', stiffness: 400, damping: 15 }
};

export const variants = {
  // Fade in elements
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2, ease: 'easeIn' }
    }
  },

  // Slide up and fade in
  slideUp: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 25 }
    },
    exit: {
      opacity: 0,
      y: 20,
      transition: { duration: 0.2, ease: 'easeIn' }
    }
  },

  // Slide down and fade in (for banner notification, dropdowns, headers)
  slideDown: {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 25 }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.2, ease: 'easeIn' }
    }
  },

  // Pop up overlay (for Modals)
  modal: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: 'spring', stiffness: 400, damping: 30 }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2, ease: 'easeIn' }
    }
  },

  // Stagger wrapper
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05
      }
    }
  },

  // Hover scale states
  hover: {
    scale: 1.02,
    y: -4,
    transition: { type: 'spring', stiffness: 400, damping: 20 }
  },

  tap: {
    scale: 0.98
  }
};
