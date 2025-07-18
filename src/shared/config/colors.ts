export const colors = {
  // Page backgrounds
  pageBackground: {
    light: "bg-gradient-to-br from-blue-50 via-white to-indigo-50",
    dark: "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900",
    combined:
      "bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900",
  },

  // Primary colors
  primary: {
    light: "from-blue-500 to-indigo-500",
    dark: "from-blue-600 to-indigo-600",
    hover: "from-blue-600 to-indigo-600",
  },

  // Text colors
  text: {
    primary: {
      light: "text-gray-900",
      dark: "text-white",
    },
    secondary: {
      light: "text-gray-600",
      dark: "text-gray-300",
    },
    muted: {
      light: "text-gray-500",
      dark: "text-gray-400",
    },
  },

  // Background colors
  background: {
    card: {
      light: "bg-white",
      dark: "bg-gray-800",
    },
    cardHover: {
      light: "hover:bg-gray-50",
      dark: "hover:bg-gray-700",
    },
  },

  // Border colors
  border: {
    light: "border-gray-200",
    dark: "border-gray-700",
  },

  // Gradient text
  gradientText: {
    primary:
      "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent",
  },

  // Feature card colors
  features: {
    analysis: {
      icon: {
        light: "bg-blue-100",
        dark: "bg-blue-900/30",
      },
      text: {
        light: "text-blue-600",
        dark: "text-blue-400",
      },
    },
    training: {
      icon: {
        light: "bg-green-100",
        dark: "bg-green-900/30",
      },
      text: {
        light: "text-green-600",
        dark: "text-green-400",
      },
    },
    progress: {
      icon: {
        light: "bg-purple-100",
        dark: "bg-purple-900/30",
      },
      text: {
        light: "text-purple-600",
        dark: "text-purple-400",
      },
    },
  },

  // Button colors
  button: {
    primary: {
      background: "bg-gradient-to-r from-blue-500 to-indigo-500",
      hover: "bg-gradient-to-r from-blue-600 to-indigo-600",
      text: "text-white",
    },
    secondary: {
      background: "border-2 border-blue-500",
      text: {
        light: "text-blue-600",
        dark: "text-blue-400",
      },
      hover: {
        light: "hover:bg-blue-50",
        dark: "hover:bg-blue-900/20",
      },
    },
  },

  // Shadow colors
  shadow: {
    card: "shadow-lg",
    cardHover: "hover:shadow-xl",
    button: "shadow-md",
    buttonHover: "hover:shadow-lg",
  },

  // Status filter colors
  statusFilters: {
    all: {
      border: "border-gray-400 dark:border-gray-500",
      text: "text-gray-100 dark:text-white",
      bg: "bg-white/10 dark:bg-gray-800/40",
      activeBg: "bg-white/20 dark:bg-gray-700/60",
      hover: "hover:bg-white/20 dark:hover:bg-gray-700/40",
      accent: "border-l-4 border-gray-400 dark:border-gray-500",
    },
    notLearned: {
      border: "border-[#ff6b6b]",
      text: "text-[#ff6b6b] font-semibold",
      bg: "bg-[#ff6b6b]/10",
      activeBg: "bg-[#ff6b6b]/20",
      hover: "hover:bg-[#ff6b6b]/20",
      accent: "border-l-4 border-[#ff6b6b]",
    },
    beginner: {
      border: "border-[#ffb347]",
      text: "text-[#ffb347] font-semibold",
      bg: "bg-[#ffb347]/10",
      activeBg: "bg-[#ffb347]/20",
      hover: "hover:bg-[#ffb347]/20",
      accent: "border-l-4 border-[#ffb347]",
    },
    basic: {
      border: "border-[#ffd600]",
      text: "text-[#ffd600] font-semibold",
      bg: "bg-[#ffd600]/10",
      activeBg: "bg-[#ffd600]/20",
      hover: "hover:bg-[#ffd600]/20",
      accent: "border-l-4 border-[#ffd600]",
    },
    intermediate: {
      border: "border-[#64b5f6]",
      text: "text-[#64b5f6] font-semibold",
      bg: "bg-[#64b5f6]/10",
      activeBg: "bg-[#64b5f6]/20",
      hover: "hover:bg-[#64b5f6]/20",
      accent: "border-l-4 border-[#64b5f6]",
    },
    advanced: {
      border: "border-[#43e97b]",
      text: "text-[#43e97b] font-semibold",
      bg: "bg-[#43e97b]/10",
      activeBg: "bg-[#43e97b]/20",
      hover: "hover:bg-[#43e97b]/20",
      accent: "border-l-4 border-[#43e97b]",
    },
    wellKnown: {
      border: "border-[#b388ff]",
      text: "text-[#b388ff] font-semibold",
      bg: "bg-[#b388ff]/10",
      activeBg: "bg-[#b388ff]/20",
      hover: "hover:bg-[#b388ff]/20",
      accent: "border-l-4 border-[#b388ff]",
    },
    mastered: {
      border: "border-[#18ffff]",
      text: "text-[#18ffff] font-semibold",
      bg: "bg-[#18ffff]/10",
      activeBg: "bg-[#18ffff]/20",
      hover: "hover:bg-[#18ffff]/20",
      accent: "border-l-4 border-[#18ffff]",
    },
  },
} as const;

// Helper function to get page background
export const getPageBackground = () => colors.pageBackground.combined;

// Helper function to get responsive background
export const getResponsiveBackground = (isDark: boolean = false) =>
  isDark ? colors.pageBackground.dark : colors.pageBackground.light;
