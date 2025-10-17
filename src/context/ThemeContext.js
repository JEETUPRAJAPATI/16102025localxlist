import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light'); // Default to light theme
  const [mounted, setMounted] = useState(false);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Prevent hydration mismatch by ensuring client-side only execution
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      // Apply the theme class to the <body>
      // document.body.className = theme === 'light' ? 'theme-light' : 'theme-dark';
      document.body.setAttribute('data-bs-theme', theme === 'light' ? 'light' : 'dark');
    }
  }, [theme, mounted]);

  // Prevent hydration mismatch by rendering consistent content initially
  if (!mounted) {
    return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
