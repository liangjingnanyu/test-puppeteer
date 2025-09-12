# Puppeteer 最佳实践指南

## 📋 目录
- [基础配置](#基础配置)
- [性能优化](#性能优化)
- [错误处理](#错误处理)
- [安全考虑](#安全考虑)
- [调试技巧](#调试技巧)
- [常见问题](#常见问题)

## 🔧 基础配置

### 浏览器启动配置

```javascript
const browser = await puppeteer.launch({
  // 开发环境：显示浏览器窗口便于调试
  headless: false,
  
  // 生产环境：无头模式提高性能
  // headless: true,
  
  // 必要的启动参数
  args: [
    '--no-sandbox',                    // Docker/Linux 环境必需
    '--disable-setuid-sandbox',        // 配合 no-sandbox 使用
    '--disable-dev-shm-usage',         // 内存受限环境
    '--disable-gpu',                   // 服务器环境
    '--start-maximized',               // 确保页面完整显示
  ],
  
  // 使用系统默认视口
  defaultViewport: null,
  
  // 可选配置
  timeout: 30000,                      // 启动超时
  slowMo: 250,                         // 操作延迟（调试用）
});
```

### 页面配置

```javascript
const page = await browser.newPage();

// 设置用户代理（重要：避免被识别为爬虫）
await page.setUserAgent(
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
);

// 设置视口大小
await page.setViewport({
  width: 1920,
  height: 1080,
  deviceScaleFactor: 1,
});

// 设置额外的 HTTP 头
await page.setExtraHTTPHeaders({
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
});
```

## ⚡ 性能优化

### 1. 资源拦截

```javascript
// 拦截不必要的资源以提高性能
await page.setRequestInterception(true);

page.on('request', (request) => {
  const resourceType = request.resourceType();
  
  // 阻止加载图片、样式表、字体等（根据需要调整）
  if (['image', 'stylesheet', 'font'].includes(resourceType)) {
    request.abort();
  } else {
    request.continue();
  }
});
```

### 2. 等待策略

```javascript
// 根据场景选择合适的等待策略
await page.goto(url, {
  waitUntil: 'networkidle2',  // 网络空闲 500ms
  // waitUntil: 'domcontentloaded',  // DOM 加载完成（更快）
  // waitUntil: 'load',  // 所有资源加载完成
  timeout: 30000,
});

// 等待特定元素
await page.waitForSelector('.target-element', {
  visible: true,
  timeout: 15000,
});

// 等待网络请求
await page.waitForResponse(response => 
  response.url().includes('/api/data') && response.status() === 200
);
```

### 3. 页面池管理

```javascript
class PagePool {
  constructor(browser, maxPages = 5) {
    this.browser = browser;
    this.maxPages = maxPages;
    this.pages = [];
    this.busyPages = new Set();
  }

  async getPage() {
    // 查找空闲页面
    const freePage = this.pages.find(page => !this.busyPages.has(page));
    if (freePage) {
      this.busyPages.add(freePage);
      return freePage;
    }

    // 创建新页面（如果未达到上限）
    if (this.pages.length < this.maxPages) {
      const page = await this.browser.newPage();
      this.pages.push(page);
      this.busyPages.add(page);
      return page;
    }

    // 等待页面释放
    return new Promise((resolve) => {
      const checkForFreePage = () => {
        const freePage = this.pages.find(page => !this.busyPages.has(page));
        if (freePage) {
          this.busyPages.add(freePage);
          resolve(freePage);
        } else {
          setTimeout(checkForFreePage, 100);
        }
      };
      checkForFreePage();
    });
  }

  releasePage(page) {
    this.busyPages.delete(page);
  }
}
```

## 🛡️ 错误处理

### 1. 超时处理

```javascript
async function safeNavigate(page, url, options = {}) {
  const defaultOptions = {
    waitUntil: 'networkidle2',
    timeout: 30000,
  };

  try {
    await page.goto(url, { ...defaultOptions, ...options });
  } catch (error) {
    if (error.name === 'TimeoutError') {
      console.warn(`页面加载超时: ${url}`);
      // 可以选择继续执行或重试
      return false;
    }
    throw error;
  }
  return true;
}
```

### 2. 元素查找容错

```javascript
async function safeGetElement(page, selector, timeout = 5000) {
  try {
    await page.waitForSelector(selector, { timeout });
    return await page.$(selector);
  } catch (error) {
    console.warn(`元素未找到: ${selector}`);
    return null;
  }
}

async function safeGetText(page, selector) {
  const element = await safeGetElement(page, selector);
  if (!element) return '';
  
  try {
    return await page.evaluate(el => el.textContent.trim(), element);
  } catch (error) {
    console.warn(`获取文本失败: ${selector}`);
    return '';
  }
}
```

### 3. 重试机制

```javascript
async function withRetry(fn, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      console.warn(`操作失败，${delay}ms 后重试 (${i + 1}/${maxRetries}):`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // 指数退避
    }
  }
}
```

## 🔒 安全考虑

### 1. 输入验证

```javascript
function validateUrl(url) {
  try {
    const parsedUrl = new URL(url);
    // 只允许 HTTP/HTTPS 协议
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('不支持的协议');
    }
    return true;
  } catch (error) {
    throw new Error('无效的 URL');
  }
}
```

### 2. 文件上传安全

```javascript
const multer = require('multer');

const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 限制
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型'));
    }
  },
});
```

### 3. 资源清理

```javascript
class BrowserManager {
  constructor() {
    this.browser = null;
    this.pages = new Set();
  }

  async launch() {
    this.browser = await puppeteer.launch(/* config */);
    
    // 监听进程退出，确保清理资源
    process.on('SIGINT', () => this.cleanup());
    process.on('SIGTERM', () => this.cleanup());
  }

  async createPage() {
    const page = await this.browser.newPage();
    this.pages.add(page);
    
    // 页面关闭时从集合中移除
    page.on('close', () => this.pages.delete(page));
    
    return page;
  }

  async cleanup() {
    console.log('正在清理资源...');
    
    // 关闭所有页面
    for (const page of this.pages) {
      try {
        await page.close();
      } catch (error) {
        console.warn('关闭页面失败:', error);
      }
    }
    
    // 关闭浏览器
    if (this.browser) {
      await this.browser.close();
    }
    
    process.exit(0);
  }
}
```

## 🐛 调试技巧

### 1. 截图调试

```javascript
async function debugScreenshot(page, name = 'debug') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `debug-${name}-${timestamp}.png`;
  
  await page.screenshot({
    path: filename,
    fullPage: true,
  });
  
  console.log(`调试截图已保存: ${filename}`);
}
```

### 2. 网络监听

```javascript
function setupNetworkLogging(page) {
  page.on('request', request => {
    console.log('→', request.method(), request.url());
  });

  page.on('response', response => {
    console.log('←', response.status(), response.url());
  });

  page.on('requestfailed', request => {
    console.error('✗', request.method(), request.url(), request.failure().errorText);
  });
}
```

### 3. 控制台日志

```javascript
page.on('console', msg => {
  const type = msg.type();
  const text = msg.text();
  
  if (type === 'error') {
    console.error('页面错误:', text);
  } else if (type === 'warning') {
    console.warn('页面警告:', text);
  } else {
    console.log('页面日志:', text);
  }
});
```

## ❓ 常见问题

### 1. 内存泄漏

**问题**: 长时间运行后内存占用过高

**解决方案**:
- 及时关闭不需要的页面
- 使用页面池限制并发数量
- 定期重启浏览器实例
- 监控内存使用情况

```javascript
// 监控内存使用
setInterval(async () => {
  const memoryUsage = process.memoryUsage();
  console.log('内存使用:', {
    rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB',
    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
  });
}, 60000);
```

### 2. 元素定位失败

**问题**: 页面结构变化导致选择器失效

**解决方案**:
- 使用多个备选选择器
- 使用更稳定的属性（如 data-* 属性）
- 实现智能等待和重试机制

```javascript
async function findElementWithFallback(page, selectors) {
  for (const selector of selectors) {
    try {
      await page.waitForSelector(selector, { timeout: 2000 });
      return await page.$(selector);
    } catch (error) {
      continue;
    }
  }
  throw new Error('所有选择器都未找到元素');
}
```

### 3. 反爬虫检测

**问题**: 网站检测到自动化工具

**解决方案**:
- 使用真实的用户代理字符串
- 模拟人类行为（随机延迟、鼠标移动）
- 使用代理 IP 轮换
- 避免过于频繁的请求

```javascript
// 模拟人类行为
async function humanLikeClick(page, selector) {
  const element = await page.$(selector);
  const box = await element.boundingBox();
  
  // 随机点击位置
  const x = box.x + Math.random() * box.width;
  const y = box.y + Math.random() * box.height;
  
  // 鼠标移动到目标位置
  await page.mouse.move(x, y);
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
  
  // 点击
  await page.mouse.click(x, y);
}
```

## 📚 参考资源

- [Puppeteer 官方文档](https://pptr.dev/)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
- [Puppeteer 性能优化指南](https://github.com/puppeteer/puppeteer/blob/main/docs/guides/performance.md)

---

**注意**: 使用 Puppeteer 进行网页自动化时，请遵守目标网站的 robots.txt 和服务条款，避免对服务器造成过大负担。
