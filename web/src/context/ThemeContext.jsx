import React, { createContext, useContext, useState, useEffect } from 'react';

// Define theme objects with all needed properties
export const lightTheme = {
  name: "light",
  background: "#f8f8f8",
  surface: "#ffffff",
  card: "#ffffff",
  primary: "#b58863", // Light brown (chessboard dark square)
  secondary: "#eae0c8", // Beige (chessboard light square)
  accent: "#4a4a4a", // Dark charcoal
  textPrimary: "#1a1a1a", // Darker text for better contrast
  textSecondary: "#555555", // Darker secondary text
  border: "#dddddd",
  success: "#2e7d32", // Darker green for better contrast
  error: "#c62828", // Darker red for better contrast
  info: "#1565c0", // Darker blue for better contrast
  warning: "#ef6c00", // Darker orange for better contrast
  navBar: "#ffffff",
  navActive: "#b58863",
  inputBackground: "#ffffff",
  inputBorder: "#bbbbbb", // Darker border for better contrast
  buttonBackground: "#b58863",
  buttonText: "#ffffff",
  tableHeaderBg: "#f0f0f0",
  tableRowAlt: "#f5f5f5",
};

export const darkTheme = {
  name: "dark",
  background: "#1e1e1e",
  surface: "#2a2a2a",
  card: "#2a2a2a",
  primary: "#c9a96a", // Golden-sand tone (matches new theme)
  secondary: "#d6b26d", // Golden hover state
  accent: "#cccccc", // Light gray for icons/text
  textPrimary: "#f5f5f5", // Brighter white for better contrast
  textSecondary: "#cccccc", // Lighter gray for better contrast
  border: "#3a3a3a",
  success: "#66bb6a", 
  error: "#ef5350",
  info: "#42a5f5",
  warning: "#ffa726",
  navBar: "#1e1e1e",
  navActive: "#c9a96a", // Match our new golden accent
  inputBackground: "#2c2c2c",
  inputBorder: "#444444",
  buttonBackground: "#c9a96a", 
  buttonText: "#1e1e1e", // Dark text on golden button
  tableHeaderBg: "#333333",
  tableRowAlt: "#242424",
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