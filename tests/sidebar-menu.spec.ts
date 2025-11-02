import { test, expect } from '@playwright/test';

test.describe('侧边栏菜单验收测试', () => {
  test('首页侧边栏菜单验证', async ({ page }) => {
    // 导航到首页
    await page.goto('http://localhost:41303/');
    await page.waitForLoadState('networkidle');

    // 检查页面是否加载
    await expect(page).toHaveTitle(/加密货币现货抄底计算器/);

    // 检查侧边栏菜单标题 - 使用正确的标题
    const sidebarTitle = page.getByText('DipCalc', { exact: true });
    await expect(sidebarTitle).toBeVisible();

    // 检查是否有现货P&L菜单项（注意标签是'现货P&L'不是'现货P&L计算'）
    const pnlMenuItem = page.getByText('现货P&L', { exact: true });
    await expect(pnlMenuItem).toBeVisible();

    console.log('✅ 现货P&L菜单项存在并可见');
  });

  test('直接访问PnL页面', async ({ page }) => {
    // 直接导航到PnL页面
    await page.goto('http://localhost:41303/pnl');
    await page.waitForLoadState('networkidle');

    // 检查PnL页面是否正确加载
    await expect(page).toHaveTitle(/加密货币现货抄底计算器/);

    // 检查PnL页面标题
    const pnlTitle = page.locator('h4');
    await expect(pnlTitle).toContainText('现货P&L计算器');

    // 检查交易对符号输入字段是否存在
    await expect(page.getByLabel('交易对符号')).toBeVisible();

    console.log('✅ PnL页面正确加载');
  });

  test('从首页点击PnL菜单', async ({ page }) => {
    // 导航到首页
    await page.goto('http://localhost:41303/');
    await page.waitForLoadState('networkidle');

    // 点击PnL菜单项
    const pnlMenuItem = page.getByText('现货P&L', { exact: true });
    await pnlMenuItem.click();

    // 等待页面跳转
    await page.waitForURL('**/pnl');

    // 检查是否成功跳转到PnL页面
    await expect(page).toHaveURL(/.*\/pnl/);

    // 检查PnL页面内容
    const pnlTitle = page.locator('h4');
    await expect(pnlTitle).toContainText('现货P&L计算器');

    console.log('✅ 成功从首页跳转到PnL页面');
  });

  test('验证visualization页面已删除', async ({ page }) => {
    // 尝试访问已删除的visualization页面
    const response = await page.goto('http://localhost:41303/visualization');

    // 应该返回200，但会显示默认页面（因为是SPA路由）
    // 但不应该有VisualizationPage组件
    await expect(page).not.toHaveURL(/.*\/visualization.*/);

    console.log('✅ /visualization 路径已被移除或重定向');
  });
});
