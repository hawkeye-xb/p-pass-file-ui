let themeChangeHandler: ((theme: 'light' | 'dark') => void) | null = null;

export const themeService = {
  setTheme(theme: 'light' | 'dark') {
    if (theme === 'dark') {
      document.body.setAttribute('arco-theme', 'dark');
    } else {
      document.body.removeAttribute('arco-theme');
    }
  },

  async init() {
    // 获取当前主题
    const theme = await window.electron?.theme.getCurrentTheme();
    if (theme) {
      this.setTheme(theme);
    }

    // 监听系统主题变化
    themeChangeHandler = (theme: 'light' | 'dark') => {
      this.setTheme(theme);
    };
    window.electron?.theme.onThemeChange(themeChangeHandler);
  },

  cleanup() { // 全局的，其实不用管
    if (themeChangeHandler) {
      window.electron?.theme.removeThemeChangeListener();
      themeChangeHandler = null;
    }
  }
};