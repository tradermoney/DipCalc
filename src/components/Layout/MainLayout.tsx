import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Fab, Tooltip } from '@mui/material';
import { Menu, MenuOpen } from '@mui/icons-material';

import { TopNavigation } from '../Navigation/TopNavigation';
import { SideNavigation } from './SideNavigation';
import { dataAccessLayer } from '../../services/database';
import { UserSettings } from '../../types';
import { PyramidPage } from '../../pages/Pyramid';
import { DCAPage } from '../../pages/DCA';
import { ATRPage } from '../../pages/ATR';
import { PnLPage } from '../../pages/PnL';

// 导入重构后的组件
import HomePageRefactored from '../../pages/Home/HomePageRefactored';
import { GridDipPageRefactored } from '../../pages/GridDip/GridDipPageRefactored';
import { RSIPageRefactored } from '../../pages/RSI/RSIPageRefactored';

interface MainLayoutProps {
  children?: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settings, setSettings] = useState<UserSettings | null>(null);

  // 初始化设置
  useEffect(() => {
    const initSettings = async () => {
      try {
        let userSettings = await dataAccessLayer.getSettings();
        if (!userSettings) {
          userSettings = await dataAccessLayer.getDefaultSettings();
          await dataAccessLayer.saveSettings(userSettings);
        }
        setSettings(userSettings);
        setDarkMode(userSettings.theme === 'dark');
      } catch (error) {
        console.error('Failed to load settings:', error);
        const defaultSettings = await dataAccessLayer.getDefaultSettings();
        setSettings(defaultSettings);
      }
    };

    initSettings();
  }, []);

  // 创建主题
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", "Noto Sans SC", sans-serif',
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: darkMode ? '#2b2b2b' : '#f1f1f1',
            },
            '&::-webkit-scrollbar-thumb': {
              background: darkMode ? '#555' : '#888',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: darkMode ? '#777' : '#555',
            },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            width: 280,
            '@media (max-width: 960px)': {
              width: 240,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
          },
        },
      },
    },
  });

  const handleThemeToggle = async () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (settings) {
      const updatedSettings = {
        ...settings,
        theme: newDarkMode ? 'dark' as const : 'light' as const
      };
      setSettings(updatedSettings);
      
      try {
        await dataAccessLayer.saveSettings(updatedSettings);
      } catch (error) {
        console.error('Failed to save theme setting:', error);
      }
    }
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSettingsClick = () => {
    // TODO: 打开设置对话框
    console.log('Settings clicked');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', position: 'relative' }}>
          <TopNavigation
            darkMode={darkMode}
            onThemeToggle={handleThemeToggle}
            onSettingsClick={handleSettingsClick}
            onMenuToggle={handleSidebarToggle}
          />
          
          <SideNavigation 
            open={sidebarOpen} 
            onClose={() => setSidebarOpen(false)}
          />
          
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: { xs: 2, sm: 3 },
              mt: 8, // 为顶部导航栏留出空间
              ml: { xs: 0, md: sidebarOpen ? '280px' : 0 }, // 为侧边栏留出空间
              transition: 'margin-left 0.3s',
              minHeight: 'calc(100vh - 64px)',
              overflow: 'auto',
              width: { xs: '100%', md: 'auto' },
              maxWidth: 'none',
              boxSizing: 'border-box',
            }}
          >
            <Routes>
              <Route path="/" element={<HomePageRefactored />} />
              <Route path="/pnl" element={<PnLPage />} />
              <Route path="/grid-dip" element={<GridDipPageRefactored />} />
              <Route path="/pyramid" element={<PyramidPage />} />
              <Route path="/rsi" element={<RSIPageRefactored />} />
              <Route path="/dca" element={<DCAPage />} />
              <Route path="/atr" element={<ATRPage />} />
              {/* 重定向未知路由到首页 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            {children}
          </Box>
          
          {/* 侧边栏切换按钮 */}
          <Fab
            color="primary"
            size="small"
            sx={{
              position: 'fixed',
              bottom: 16,
              left: 16,
              transition: 'left 0.3s',
              zIndex: 1000,
              display: { xs: 'none', md: 'flex' }, // 只在中等屏幕以上显示
            }}
            onClick={handleSidebarToggle}
          >
            <Tooltip title={sidebarOpen ? '收起菜单' : '展开菜单'}>
              {sidebarOpen ? <MenuOpen /> : <Menu />}
            </Tooltip>
          </Fab>
        </Box>
      </Router>
    </ThemeProvider>
  );
};