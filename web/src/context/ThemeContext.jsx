import React, { createContext, useContext, useState, useEffect } from 'react';

// Define theme objects with all needed properties
export const lightTheme = {
  name: "light",
  background: "#ffffff",
  surface: "#f5f5f5",
  card: "#f0f0f0",
  primary: "#b58863", // Light brown (chessboard dark square)
  secondary: "#eae0c8", // Beige (chessboard light square)
  accent: "#4a4a4a", // Dark charcoal
  textPrimary: "#1e1e1e",
  textSecondary: "#4a4a4a",
  border: "#dcdcdc",
  success: "#4caf50",
  error: "#f44336",
  info: "#2196f3",
  warning: "#ff9800",
  navBar: "#ffffff",
  navActive: "#b58863",
  inputBackground: "#ffffff",
  inputBorder: "#cccccc",
  buttonBackground: "#b58863",
  buttonText: "#ffffff",
};

export const darkTheme = {
  name: "dark",
  background: "#1e1e1e",
  surface: "#2c2c2c",
  card: "#2a2a2a",
  primary: "#6a4e42", // Dark brown (deep wood tone)
  secondary: "#bca177", // Light caramel (for highlights)
  accent: "#cccccc", // Light gray for icons/text
  textPrimary: "#f0f0f0",
  textSecondary: "#aaaaaa",
  border: "#3a3a3a",
  success: "#66bb6a",
  error: "#ef5350",
  info: "#42a5f5",
  warning: "#ffa726",
  navBar: "#1e1e1e",
  navActive: "#bca177",
  inputBackground: "#2c2c2c",
  inputBorder: "#444444",
  buttonBackground: "#6a4e42",
  buttonText: "#ffffff",
};

// Create a context for theme management
const ThemeContext = createContext();

// Hook to use the theme context
export function useTheme() {
  return useContext(ThemeContext);
}

// Provider component that wraps app
export function ThemeProvider({ children }) {
  // Initialize theme from localStorage or default to system preference
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('chessClubTheme');
    
    if (savedTheme) {
      return savedTheme;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  };
  
  const [theme, setTheme] = useState(getInitialTheme);
  
  // Update body class and localStorage when theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('chessClubTheme', theme);
  }, [theme]);
  
  // Toggle between themes
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  
  // Get the current theme object based on the selected theme name
  const getCurrentTheme = () => {
    return theme === 'light' ? lightTheme : darkTheme;
  };
  
  const value = {
    theme,
    setTheme,
    toggleTheme,
    currentTheme: getCurrentTheme()
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}