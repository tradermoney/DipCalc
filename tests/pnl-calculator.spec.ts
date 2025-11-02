import { test, expect } from '@playwright/test';

test.describe('现货P&L计算器', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:41303/pnl');
    await page.waitForLoadState('networkidle');
  });

  test('页面加载测试', async ({ page }) => {
    await expect(page).toHaveTitle(/加密货币现货抄底计算器/);
    await expect(page.locator('h4')).toContainText('现货P&L计算器');
    await expect(page.locator('button', { hasText: /计算/ })).toBeVisible();
    await expect(page.getByLabel('交易对符号')).toBeVisible();
  });

  test('基础输入测试 - 计算未实现盈亏', async ({ page }) => {
    await page.getByLabel('交易对符号').fill('BTC/USDT');
    await page.getByText('添加买入', { exact: true }).click();
    await page.waitForSelector('table tbody tr');
    await page.waitForTimeout(1000);

    // 等待trade ID生成并使用data-testid
    const tradeRow = page.locator('table tbody tr').first();
    const tradeId = await tradeRow.getAttribute('data-id') || '';

    const priceInput = page.getByTestId(`trade-price-${tradeId}`).locator('input');
    const amountInput = page.getByTestId(`trade-amount-${tradeId}`).locator('input');

    await priceInput.fill('50000');
    await amountInput.fill('0.1');

    await page.getByLabel('当前价格').fill('55000');
    await page.waitForTimeout(1000);

    await page.locator('button', { hasText: /计算/ }).click();
    await page.waitForTimeout(2000);

    await expect(page.locator('text=投资回报率').first()).toBeVisible();
    await expect(page.locator('text=未实现盈亏').first()).toBeVisible();
  });

  test('完整交易测试 - 计算已实现盈亏', async ({ page }) => {
    await page.getByLabel('交易对符号').fill('BTC/USDT');
    await page.getByText('添加买入', { exact: true }).click();
    await page.waitForSelector('table tbody tr');
    await page.waitForTimeout(1000);

    // 买入记录
    const buyRow = page.locator('table tbody tr').first();
    const buyTradeId = await buyRow.getAttribute('data-id') || '';

    await page.getByTestId(`trade-price-${buyTradeId}`).locator('input').fill('50000');
    await page.getByTestId(`trade-amount-${buyTradeId}`).locator('input').fill('0.1');
    await page.getByTestId(`trade-feerate-${buyTradeId}`).locator('input').fill('0.1');

    await page.getByLabel('当前价格').fill('55000');

    // 添加卖出记录
    await page.getByText('添加卖出', { exact: true }).click();
    await page.waitForSelector('table tbody tr:nth-child(2)');
    await page.waitForTimeout(1000);

    const sellRow = page.locator('table tbody tr').nth(1);
    const sellTradeId = await sellRow.getAttribute('data-id') || '';

    await page.getByTestId(`trade-price-${sellTradeId}`).locator('input').fill('60000');
    await page.getByTestId(`trade-amount-${sellTradeId}`).locator('input').fill('0.05');

    await page.locator('button', { hasText: /计算/ }).click();
    await page.waitForTimeout(2000);

    await expect(page.locator('text=已实现盈亏').first()).toBeVisible();
  });

  test('清空功能测试', async ({ page }) => {
    await page.getByLabel('交易对符号').fill('BTC/USDT');
    await page.getByText('添加买入', { exact: true }).click();
    await page.waitForSelector('table tbody tr');
    await page.waitForTimeout(1000);

    await page.locator('button', { hasText: /清空/ }).click();
    await page.waitForTimeout(500);

    await expect(page.getByLabel('交易对符号')).toHaveValue('');
  });

  test('计算按钮测试', async ({ page }) => {
    await page.getByLabel('交易对符号').fill('ETH/USDT');
    await page.getByText('添加买入', { exact: true }).click();
    await page.waitForSelector('table tbody tr');
    await page.waitForTimeout(1000);

    const buyRow = page.locator('table tbody tr').first();
    const tradeId = await buyRow.getAttribute('data-id') || '';

    await page.getByTestId(`trade-price-${tradeId}`).locator('input').fill('3000');
    await page.getByTestId(`trade-amount-${tradeId}`).locator('input').fill('1');

    await page.getByLabel('当前价格').fill('3500');

    const calculateButton = page.locator('button', { hasText: /计算/ });
    await expect(calculateButton).toBeVisible();
    await calculateButton.click();
    await page.waitForTimeout(2000);

    await expect(page.locator('h5').first()).toBeVisible();
  });

  test('盈亏平衡价格计算测试', async ({ page }) => {
    await page.getByLabel('交易对符号').fill('BTC/USDT');
    await page.getByText('添加买入', { exact: true }).click();
    await page.waitForSelector('table tbody tr');
    await page.waitForTimeout(1000);

    const buyRow = page.locator('table tbody tr').first();
    const tradeId = await buyRow.getAttribute('data-id') || '';

    await page.getByTestId(`trade-price-${tradeId}`).locator('input').fill('50000');
    await page.getByTestId(`trade-amount-${tradeId}`).locator('input').fill('1');

    await page.getByLabel('当前价格').fill('45000');

    await page.locator('button', { hasText: /计算/ }).click();
    await page.waitForTimeout(2000);

    await expect(page.locator('text=盈亏平衡价', { exact: true }).first()).toBeVisible();
  });

  test('响应式设计测试', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h4')).toContainText('现货P&L计算器');
    await expect(page.getByLabel('交易对符号')).toBeVisible();
  });
});
