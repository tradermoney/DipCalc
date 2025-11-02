import { test, expect } from '@playwright/test';

test.describe('现货P&L计算器', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到PnL页面
    await page.goto('http://localhost:41303/pnl');
    // 等待页面加载
    await page.waitForLoadState('networkidle');
  });

  test('页面加载测试', async ({ page }) => {
    // 检查标题
    await expect(page).toHaveTitle(/加密货币现货抄底计算器/);

    // 检查页面标题文本
    const title = page.locator('h4');
    await expect(title).toContainText('现货P&L计算器');

    // 检查计算器按钮存在
    await expect(page.locator('button', { hasText: /计算/ })).toBeVisible();

    // 检查交易对符号输入字段存在
    await expect(page.getByLabel('交易对符号')).toBeVisible();
  });

  test('基础输入测试 - 计算未实现盈亏', async ({ page }) => {
    // 输入交易对 - 通过label定位
    await page.getByLabel('交易对符号').fill('BTC/USDT');

    // 添加交易记录
    await page.getByText('添加买入', { exact: true }).click();

    // 等待表格行出现
    await page.waitForSelector('table tbody tr', { timeout: 15000 });

    // 等待React状态更新
    await page.waitForTimeout(1000);

    // 使用evaluate找到输入框，然后使用type方法逐步输入
    // 先通过evaluate找到输入框的引用
    const inputInfo = await page.evaluate(() => {
      const inputs = document.querySelectorAll('table input:not([type="checkbox"])');
      return {
        count: inputs.length,
        indices: inputs.length >= 4 ? [1, 2] : []
      };
    });

    // 使用locator找到特定输入框并使用fill
    if (inputInfo.count >= 4) {
      // 获取表格行的引用，以便后续操作
      await page.evaluate(() => {
        window.tableInputs = document.querySelectorAll('table input:not([type="checkbox"])');
      });
    }

    const inputResult = await page.evaluate((indices) => {
      const result: any = {};
      try {
        const inputs = (window as any).tableInputs as NodeListOf<HTMLInputElement>;
        if (inputs && inputs.length >= 4) {
          const priceInput = inputs[indices[0]];
          const amountInput = inputs[indices[1]];

          // 清空并输入新值
          priceInput.value = '';
          amountInput.value = '';

          result.success = true;
          result.priceCleared = priceInput.value === '';
          result.amountCleared = amountInput.value === '';
        }
      } catch (error) {
        result.success = false;
        result.error = error.message;
      }
      return result;
    }, inputInfo.indices);

    console.log('清空结果:', JSON.stringify(inputResult, null, 2));

    // 现在使用fill方法逐步输入
    const priceInputLocator = page.locator('table tbody tr').nth(0).locator('input').nth(1);
    const amountInputLocator = page.locator('table tbody tr').nth(0).locator('input').nth(2);

    await priceInputLocator.fill('50000');
    await amountInputLocator.fill('0.1');
      const result: any = {};
      try {
        const table = document.querySelector('table');
        const tbody = table?.querySelector('tbody');
        const rows = tbody?.querySelectorAll('tr');
        // 使用:not([type="checkbox"])来排除复选框，因为MUI TextField默认是type="text"
        const inputs = document.querySelectorAll('table input:not([type="checkbox"])');

        result.tableExists = !!table;
        result.tbodyExists = !!tbody;
        result.rowCount = rows?.length || 0;
        result.inputCount = inputs.length;
        result.inputs = Array.from(inputs).map(inp => ({ type: inp.type, value: inp.value, placeholder: inp.getAttribute('placeholder') }));

        // inputs[1] = 价格, inputs[2] = 数量, inputs[3] = 手续费率
        if (inputs.length >= 4) {
          const priceInput = inputs[1] as HTMLInputElement;
          const amountInput = inputs[2] as HTMLInputElement;

          // 使用更完整的事件序列来触发React
          // 价格输入
          priceInput.focus();
          priceInput.value = '';
          priceInput.dispatchEvent(new Event('input', { bubbles: true }));
          priceInput.value = '50000';
          priceInput.dispatchEvent(new Event('input', { bubbles: true }));
          priceInput.dispatchEvent(new Event('change', { bubbles: true }));
          priceInput.dispatchEvent(new Event('keyup', { bubbles: true }));
          priceInput.dispatchEvent(new Event('blur', { bubbles: true }));

          // 数量输入
          amountInput.focus();
          amountInput.value = '';
          amountInput.dispatchEvent(new Event('input', { bubbles: true }));
          amountInput.value = '0.1';
          amountInput.dispatchEvent(new Event('input', { bubbles: true }));
          amountInput.dispatchEvent(new Event('change', { bubbles: true }));
          amountInput.dispatchEvent(new Event('keyup', { bubbles: true }));
          amountInput.dispatchEvent(new Event('blur', { bubbles: true }));

          result.success = true;
          result.priceSet = priceInput.value;
          result.amountSet = amountInput.value;
        } else {
          result.success = false;
          result.reason = '输入框不足';
        }
      } catch (error) {
        result.success = false;
        result.error = error.message;
      }
      return result;
    });

    // 打印结果
    console.log('使用fill输入完成');

    // 额外等待React状态更新
    await page.waitForTimeout(1000);

    // 输入当前价格
    await page.getByLabel('当前价格').fill('55000');

    // 等待当前价格输入生效
    await page.waitForTimeout(500);

    // 点击计算按钮
    const calculateButton = page.locator('button', { hasText: /计算/ });
    await calculateButton.click();

    // 等待计算结果
    await page.waitForTimeout(2000);

    // 检查计算状态
    const calcResult = await page.evaluate(() => {
      const result: any = {};
      // 检查PnLResults组件是否存在
      const resultsSection = document.querySelector('[data-testid="pnl-results"], .MuiCard-root, .MuiGrid-container');
      result.resultsSectionExists = !!resultsSection;
      result.resultsHTML = resultsSection?.innerHTML?.substring(0, 200) || 'N/A';

      // 检查是否有错误提示
      const alerts = document.querySelectorAll('.MuiAlert-root, [role="alert"]');
      result.alertCount = alerts.length;
      result.alerts = Array.from(alerts).map(al => al.textContent);

      // 检查投资回报率文本
      const roiText = document.querySelector('*');
      const roiElements = Array.from(document.querySelectorAll('*')).filter(el =>
        el.textContent?.includes('投资回报率')
      );
      result.roiElementsFound = roiElements.length;
      result.roiElementHTML = roiElements[0]?.outerHTML?.substring(0, 200) || 'N/A';

      return result;
    });

    console.log('计算结果检查:', JSON.stringify(calcResult, null, 2));

    // 检查ROI显示
    const roiText = page.locator('text=投资回报率').first();
    await expect(roiText).toBeVisible();

    // 检查未实现盈亏显示
    const unrealizedPnL = page.locator('text=未实现盈亏').first();
    await expect(unrealizedPnL).toBeVisible();

    // 检查计算结果不为空（应该有具体的数值显示）
    const resultsContainer = page.locator('h5').first();
    await expect(resultsContainer).toContainText(/[+-]/);
  });

  test('完整交易测试 - 计算已实现盈亏', async ({ page }) => {
    // 输入基础交易信息
    await page.getByLabel('交易对符号').fill('BTC/USDT');

    // 添加交易记录
    await page.getByText('添加买入', { exact: true }).click();

    // 等待表格行出现
    await page.waitForSelector('table tbody tr', { timeout: 15000 });

    // 等待React状态更新
    await page.waitForTimeout(1000);

    // 使用evaluate直接操作DOM
    await page.evaluate(() => {
      const inputs = document.querySelectorAll('table input[type="number"]');
      console.log('找到输入框数量:', inputs.length);
      if (inputs.length >= 3) {
        // 输入价格
        inputs[0].value = '50000';
        inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
        inputs[0].dispatchEvent(new Event('change', { bubbles: true }));
        // 输入数量
        inputs[1].value = '0.1';
        inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
        inputs[1].dispatchEvent(new Event('change', { bubbles: true }));
        // 输入手续费率
        inputs[2].value = '0.1';
        inputs[2].dispatchEvent(new Event('input', { bubbles: true }));
        inputs[2].dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    // 输入当前价格
    await page.getByLabel('当前价格').fill('55000');

    // 添加卖出记录
    await page.getByText('添加卖出', { exact: true }).click();

    // 等待表格行出现
    await page.waitForSelector('table tbody tr:nth-child(2)', { timeout: 15000 });

    // 等待React状态更新
    await page.waitForTimeout(1000);

    // 使用evaluate直接操作DOM，设置卖出记录
    await page.evaluate(() => {
      const inputs = document.querySelectorAll('table input[type="number"]');
      if (inputs.length >= 6) {
        // 第二行是卖出记录（索引3-5）
        (inputs[3] as HTMLInputElement).value = '60000';
        (inputs[3] as HTMLInputElement).dispatchEvent(new Event('input', { bubbles: true }));
        (inputs[4] as HTMLInputElement).value = '0.05';
        (inputs[4] as HTMLInputElement).dispatchEvent(new Event('input', { bubbles: true }));
        (inputs[5] as HTMLInputElement).value = '0.1';
        (inputs[5] as HTMLInputElement).dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    // 点击计算按钮
    const calculateButton = page.locator('button', { hasText: /计算/ });
    await calculateButton.click();

    // 等待计算结果
    await page.waitForTimeout(2000);

    // 检查已实现盈亏显示
    const realizedPnL = page.locator('text=已实现盈亏').first();
    await expect(realizedPnL).toBeVisible();
  });

  test('清空功能测试', async ({ page }) => {
    // 输入交易对符号
    await page.getByLabel('交易对符号').fill('BTC/USDT');

    // 添加交易记录
    await page.getByText('添加买入', { exact: true }).click();

    // 等待表格行出现
    await page.waitForSelector('table tbody tr', { timeout: 15000 });

    // 等待React状态更新
    await page.waitForTimeout(1000);

    // 使用evaluate直接操作DOM
    await page.evaluate(() => {
      const inputs = document.querySelectorAll('table input[type="number"]');
      if (inputs.length >= 1) {
        (inputs[0] as HTMLInputElement).value = '50000';
        (inputs[0] as HTMLInputElement).dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    // 点击清空按钮
    const clearButton = page.locator('button', { hasText: /清空/ });
    await clearButton.click();

    // 等待清空完成
    await page.waitForTimeout(500);

    // 检查交易对符号输入框是否被清空
    const symbolInput = page.getByLabel('交易对符号');
    await expect(symbolInput).toHaveValue('');
  });

  test('计算按钮测试', async ({ page }) => {
    // 输入基础数据
    await page.getByLabel('交易对符号').fill('ETH/USDT');

    // 添加交易记录
    await page.getByText('添加买入', { exact: true }).click();

    // 等待表格行出现
    await page.waitForSelector('table tbody tr', { timeout: 15000 });

    // 等待React状态更新
    await page.waitForTimeout(1000);

    // 使用evaluate直接操作DOM
    await page.evaluate(() => {
      const inputs = document.querySelectorAll('table input[type="number"]');
      if (inputs.length >= 3) {
        (inputs[0] as HTMLInputElement).value = '3000';
        (inputs[0] as HTMLInputElement).dispatchEvent(new Event('input', { bubbles: true }));
        (inputs[1] as HTMLInputElement).value = '1';
        (inputs[1] as HTMLInputElement).dispatchEvent(new Event('input', { bubbles: true }));
        (inputs[2] as HTMLInputElement).value = '0.1';
        (inputs[2] as HTMLInputElement).dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    // 输入当前价格
    await page.getByLabel('当前价格').fill('3500');

    // 点击计算按钮
    const calculateButton = page.locator('button', { hasText: /计算/ });
    await expect(calculateButton).toBeVisible();
    await calculateButton.click();

    // 等待计算完成
    await page.waitForTimeout(2000);

    // 检查结果是否显示
    const resultsSection = page.locator('h5').first();
    await expect(resultsSection).toBeVisible();
  });

  test('盈亏平衡价格计算测试', async ({ page }) => {
    // 输入交易对符号
    await page.getByLabel('交易对符号').fill('BTC/USDT');

    // 添加交易记录
    await page.getByText('添加买入', { exact: true }).click();

    // 等待表格行出现
    await page.waitForSelector('table tbody tr', { timeout: 15000 });

    // 等待React状态更新
    await page.waitForTimeout(1000);

    // 使用evaluate直接操作DOM
    await page.evaluate(() => {
      const inputs = document.querySelectorAll('table input[type="number"]');
      if (inputs.length >= 3) {
        (inputs[0] as HTMLInputElement).value = '50000';
        (inputs[0] as HTMLInputElement).dispatchEvent(new Event('input', { bubbles: true }));
        (inputs[1] as HTMLInputElement).value = '1';
        (inputs[1] as HTMLInputElement).dispatchEvent(new Event('input', { bubbles: true }));
        (inputs[2] as HTMLInputElement).value = '0.1';
        (inputs[2] as HTMLInputElement).dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    // 当前价格设为低于买入价，测试亏损情况
    await page.getByLabel('当前价格').fill('45000');

    // 点击计算按钮
    const calculateButton = page.locator('button', { hasText: /计算/ });
    await calculateButton.click();

    // 等待计算完成
    await page.waitForTimeout(2000);

    // 检查盈亏平衡价显示（使用exact避免匹配到两个元素）
    const breakEvenPrice = page.locator('text=盈亏平衡价', { exact: true }).first();
    await expect(breakEvenPrice).toBeVisible();

    // 盈亏平衡价应该略高于买入价（因为有手续费）
    const breakEvenValue = await breakEvenPrice.locator('..').locator('h5').textContent();
    console.log('盈亏平衡价:', breakEvenValue);
  });

  test('响应式设计测试', async ({ page }) => {
    // 测试移动端视图
    await page.setViewportSize({ width: 375, height: 667 });

    // 检查页面在小屏幕上是否正常显示
    await expect(page.locator('h4')).toContainText('现货P&L计算器');

    // 检查交易对符号输入字段在移动端是否可见
    await expect(page.getByLabel('交易对符号')).toBeVisible();
  });
});
