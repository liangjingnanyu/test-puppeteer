import express from "express";
import puppeteer from "puppeteer";
import multer from "multer";
import path from "path";
import fs from "fs";
import cors from "cors";

const app = express();
const PORT = 3001;

// 🌐 中间件配置
app.use(cors()); // 允许跨域请求
app.use(express.json()); // 解析JSON请求体
app.use(express.static("public")); // 提供静态文件服务

// 📁 文件上传配置
// 配置multer用于处理图片上传
const upload = multer({
  dest: "uploads/", // 上传文件存储目录
  limits: {
    fileSize: 5 * 1024 * 1024, // 限制文件大小为5MB
  },
  fileFilter: (req, file, cb) => {
    // 只允许上传图片文件
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("只允许上传图片文件"));
    }
  },
});

// 🌍 全局变量
let browser = null; // Puppeteer浏览器实例
const pages = new Map(); // 存储页面实例

/**
 * 🔍 百度识图搜索核心函数
 * 
 * 这个函数是整个项目的核心，它使用Puppeteer自动化浏览器来：
 * 1. 打开百度识图页面
 * 2. 上传用户提供的图片
 * 3. 等待搜索结果加载
 * 4. 提取商品信息
 * 5. 监听网络请求用于分析和调试
 * 
 * @param {string} imagePath - 要搜索的图片文件路径
 * @returns {Object} 包含商品信息和网络数据的对象
 */
async function searchImageOnBaidu(imagePath) {
  let page = null;
  
  // 📊 网络监听数据存储
  const requests = [];   // 存储所有网络请求
  const responses = [];  // 存储所有网络响应

  try {
    // 1. 检查浏览器实例
    if (!browser) {
      // 如果浏览器未启动，先启动浏览器
      browser = await puppeteer.launch({
        headless: true, // 显示浏览器窗口便于调试
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    }

    // 2. 创建新页面
    page = await browser.newPage();
    console.log("🚀 创建新页面成功");

    // 3. 启用请求拦截
    // 这允许我们监听和分析所有网络请求
    await page.setRequestInterception(true);

    // 4. 监听网络请求
    page.on("request", (request) => {
      // 记录请求信息用于分析
      requests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        postData: request.postData(),
      });
      
      // 继续请求（不阻止）
      request.continue();
    });

    // 5. 监听网络响应
    page.on("response", async (response) => {
      try {
        // 记录响应信息
        const responseData = {
          url: response.url(),
          status: response.status(),
          headers: response.headers(),
          body: null,
        };

        // 尝试获取响应内容（仅对小文件）
        if (response.headers()["content-length"] < 1000000) {
          try {
            responseData.body = await response.text();
          } catch (e) {
            // 某些响应可能无法读取，忽略错误
          }
        }

        responses.push(responseData);
      } catch (error) {
        console.error("处理响应时出错:", error);
      }
    });

    // 6. 设置用户代理
    // 模拟真实浏览器，避免被识别为爬虫
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    console.log("🕵️ 设置用户代理成功");

    // 7. 导航到百度识图页面
    console.log("🌐 正在导航到百度识图页面...");
    await page.goto("https://graph.baidu.com/pcpage/index?tpl_from=pc", {
      waitUntil: "networkidle2", // 等待网络空闲
      timeout: 30000, // 30秒超时
    });
    console.log("✅ 页面加载完成");

    // 8. 上传图片文件
    console.log("📤 正在上传图片...");
    const fileInput = await page.$('input[type="file"]');
    if (!fileInput) {
      throw new Error("未找到文件上传输入框");
    }
    
    await fileInput.uploadFile(imagePath);
    console.log("✅ 图片上传成功");

    // 9. 等待搜索结果加载
    console.log("⏳ 等待搜索结果加载...");
    // 使用setTimeout替代已废弃的waitForTimeout
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // 等待商品列表元素出现
    await page.waitForSelector(
      ".graph-product-list, .commodity-list, .similar-image-list",
      { timeout: 15000 }
    );
    console.log("✅ 搜索结果加载完成");

    // 10. 点击分类按钮并监听接口数据
    console.log("🔄 正在点击分类按钮...");
    
    // 设置接口监听
    let apiData = null;
    const apiPromise = new Promise((resolve) => {
      page.on('response', async (response) => {
        if (response.url().includes('https://graph.baidu.com/ajax/newgoodsset')) {
          try {
            console.log("📡 捕获到newgoodsset接口响应");
            const responseData = await response.json();
            apiData = responseData;
            console.log("✅ 接口数据获取成功");
            resolve(responseData);
          } catch (error) {
            console.error("❌ 解析接口数据失败:", error);
            resolve(null);
          }
        }
      });
    });

    // 查找并点击第二个分类按钮
    try {
      // 等待分类按钮列表出现
      await page.waitForSelector('.general-typelist li', { timeout: 10000 });
      
      // 获取所有分类按钮
      const categoryButtons = await page.$$('.general-typelist li');
      
      if (categoryButtons.length >= 2) {
        // 点击第二个按钮（索引为1）
        const secondButton = categoryButtons[1];
        const buttonText = await page.evaluate(el => el.textContent.trim(), secondButton);
        console.log(`🎯 点击分类按钮: ${buttonText}`);
        
        await secondButton.click();
        
        // 等待接口响应，最多等待10秒
        await Promise.race([
          apiPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('接口响应超时')), 10000))
        ]);
        
        console.log("✅ 分类切换完成，接口数据已获取");
      } else {
        console.log("⚠️ 未找到足够的分类按钮，跳过点击步骤");
      }
    } catch (error) {
      console.error("❌ 点击分类按钮失败:", error);
    }

    // 等待页面更新完成
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 11. 提取商品信息
    console.log("🔍 正在提取商品信息...");
    const products = await page.evaluate(() => {
      const productList = [];
      
      // 根据实际HTML结构优化选择器
      const selectors = [
        ".graph-product-list-item",           // 主要商品项选择器
        ".graph-product-list .graph-span6",   // 备用选择器
        ".product-item",                      // 通用商品项
        ".commodity-item",                    // 商品项备选
        "[data-show-log='true']"              // 带日志属性的商品项
      ];

      let items = [];
      // 尝试每个选择器直到找到商品元素
      for (const selector of selectors) {
        items = document.querySelectorAll(selector);
        if (items.length > 0) {
          console.log(`使用选择器找到 ${items.length} 个商品:`, selector);
          break;
        }
      }

      // 提取每个商品的信息
      items.forEach((item, index) => {
        try {
          // 提取商品描述（标题）- 根据实际HTML结构
          const titleElement = item.querySelector(
            ".graph-product-list-desc, .product-title, .title, .item-title, h3, .name"
          );
          const title = titleElement ? titleElement.textContent.trim() : `商品 ${index + 1}`;

          // 提取商品价格 - 根据实际HTML结构
          const priceElement = item.querySelector(
            ".graph-product-list-price, .product-price, .price, .item-price, .cost"
          );
          const price = priceElement ? priceElement.textContent.trim() : "价格未知";

          // 提取商品图片 - 从图片容器中获取
          const imgElement = item.querySelector(
            ".graph-product-list-img img, .product-img img, img"
          );
          const image = imgElement ? imgElement.src : "";

          // 提取商品链接 - 从整个商品容器或特定链接元素
          const linkElement = item.querySelector(
            ".graph-product-list-content, a"
          );
          const link = linkElement ? (linkElement.href || "") : "";

          // 提取商品来源 - 根据实际HTML结构
          const sourceElement = item.querySelector(
            ".graph-product-list-source, .product-source, .source, .shop-name, .platform"
          );
          const source = sourceElement ? sourceElement.textContent.trim() : "来源未知";

          // 只添加有效的商品信息
          if (title && title !== `商品 ${index + 1}` && price !== "价格未知") {
            productList.push({
              title,
              price,
              image,
              link,
              source,
            });
          }
        } catch (error) {
          // 如果提取某个商品信息时出错，记录错误但继续处理其他商品
          console.error(`提取第${index + 1}个商品信息时出错:`, error);
        }
      });

      // 如果没有找到商品，尝试输出页面结构用于调试
      if (productList.length === 0) {
        console.log("未找到商品，页面可能的商品容器:");
        const possibleContainers = document.querySelectorAll(
          "[class*='product'], [class*='item'], [class*='graph'], [data-v-c186e95e]"
        );
        possibleContainers.forEach((container, i) => {
          if (i < 5) { // 只输出前5个避免过多日志
            console.log(`容器${i + 1}:`, container.className, container.textContent?.substring(0, 100));
          }
        });
      }

      return productList; // 返回所有提取到的商品信息
    });

    console.log(`✅ 成功提取到 ${products.length} 个商品信息`);

    // 12. 返回结果（包含API数据和商品信息）
    const result = {
      products: products,
      apiData: apiData,
      totalProducts: products.length,
      hasApiData: !!apiData
    };

    console.log("\n📋 === 搜索结果汇总 ===");
    console.log(`商品数量: ${products.length}`);
    console.log(`API数据: ${apiData ? '已获取' : '未获取'}`);
    if (apiData) {
      console.log(`API数据预览:`, JSON.stringify(apiData).substring(0, 200) + '...');
    }

    // 13. 分析网络请求数据（用于调试和优化）
    console.log("\n📊 === 网络请求分析 ===");
    console.log(`总请求数: ${requests.length}`);
    console.log(`总响应数: ${responses.length}`);

    // 筛选可能包含商品数据的API请求
    // 这些请求通常包含我们需要的结构化数据
    const apiRequests = requests.filter(
      (req) =>
        req.url.includes("api") ||     // API接口
        req.url.includes("ajax") ||    // AJAX请求
        req.url.includes("search") ||  // 搜索相关
        req.url.includes("graph")      // 百度识图相关
    );

    console.log("\n🔍 === 可能的API请求 ===");
    apiRequests.forEach((req, index) => {
      console.log(`${index + 1}. ${req.method} ${req.url}`);
      if (req.postData) {
        // 显示POST请求的数据（截取前200字符避免过长）
        console.log(`   📤 POST数据: ${req.postData.substring(0, 200)}...`);
      }
    });

    // 筛选包含JSON数据的响应
    // JSON响应通常包含结构化的商品数据
    const jsonResponses = responses.filter(
      (res) =>
        res.headers["content-type"]?.includes("application/json") || // Content-Type为JSON
        (res.body && res.body.startsWith("{"))                      // 响应内容以{开头
    );

    console.log("\n📋 === JSON响应数据 ===");
    jsonResponses.forEach((res, index) => {
      console.log(`${index + 1}. ${res.url} (${res.status})`);
      if (res.body) {
        try {
          const jsonData = JSON.parse(res.body);
          console.log(`   📊 数据结构:`, Object.keys(jsonData));
          
          // 检查是否可能包含商品数据
          if (jsonData.data || jsonData.result || jsonData.items) {
            console.log(`   🎯 可能包含商品数据!`);
          }
        } catch (e) {
          console.log(`   ❌ JSON解析失败`);
        }
      }
    });

    // 🎯 返回搜索结果和网络数据
    return {
      success: true,
      products: products,
      apiData: apiData,
      totalProducts: products.length,
      hasApiData: !!apiData,
      networkData: {
        requests: requests.length,
        responses: responses.length,
        apiRequests: apiRequests.length,
        sampleRequests: apiRequests.slice(0, 3), // 返回前3个API请求作为样本
      },
    };
    
  } catch (error) {
    // 错误处理：记录错误信息并抛出
    console.error("❌ 百度识图搜索失败:", error);
    throw new Error(`搜索失败: ${error.message}`);
  } finally {
    // 清理工作：无论成功还是失败都要关闭页面
    if (page) {
      await page.close(); // 关闭页面释放资源
    }
  }
}

// 🚀 启动浏览器 API
// 这个接口用于启动 Puppeteer 控制的 Chrome 浏览器实例
app.post("/api/launch-browser", async (req, res) => {
  try {
    // 如果已有浏览器实例在运行，先关闭它
    if (browser) {
      await browser.close();
    }

    // 从请求体中获取初始页面URL，默认为百度首页
    const { initialUrl = "https://www.baidu.com" } = req.body;

    // 🔧 启动浏览器配置详解
    browser = await puppeteer.launch({
      // === 基础配置 ===
      headless: false, // 是否无头模式
      // false: 显示浏览器窗口，便于调试和观察自动化过程
      // true: 后台运行，不显示窗口，适合生产环境

      // === 启动参数配置 ===
      args: [
        // 🛡️ 安全相关参数
        "--no-sandbox", 
        // 作用: 禁用Chrome沙盒模式
        // 使用场景: Docker容器、Linux服务器环境必需
        // 注意: 会降低安全性，仅在受控环境使用

        "--disable-setuid-sandbox",
        // 作用: 禁用setuid沙盒
        // 使用场景: 配合--no-sandbox使用，解决权限问题

        // 💾 内存和性能相关参数
        "--disable-dev-shm-usage",
        // 作用: 禁用/dev/shm共享内存使用
        // 使用场景: 内存受限环境，避免内存不足错误
        // 原理: 使用磁盘而非内存存储临时文件

        "--disable-gpu",
        // 作用: 禁用GPU硬件加速
        // 使用场景: 服务器环境通常没有GPU，避免相关错误
        // 影响: 可能略微降低渲染性能

        // 🖥️ 窗口和显示相关参数
        "--start-maximized",
        // 作用: 启动时最大化浏览器窗口
        // 使用场景: 确保页面完整显示，避免响应式布局影响

        // 🔒 安全策略相关参数（仅测试环境）
        "--disable-web-security",
        // 作用: 禁用同源策略等Web安全限制
        // 使用场景: 跨域测试、本地开发
        // ⚠️ 警告: 生产环境不建议使用

        // 🎨 渲染相关参数
        "--disable-features=VizDisplayCompositor",
        // 作用: 禁用Chrome的显示合成器功能
        // 使用场景: 解决某些渲染兼容性问题
      ],

      // === 视口配置 ===
      defaultViewport: null,
      // 作用: 使用系统默认视口大小而非Puppeteer默认的800x600
      // 好处: 页面显示更接近真实用户环境

      // === 其他可选配置 ===
      // executablePath: '/path/to/chrome', // 指定Chrome可执行文件路径
      // userDataDir: './chrome-user-data', // 自定义用户数据目录
      // timeout: 30000, // 启动超时时间（毫秒）
      // slowMo: 250, // 每个操作之间的延迟（毫秒），便于观察
    });

    // 📄 创建新页面并配置
    const page = await browser.newPage();
    
    // 🕵️ 设置用户代理字符串
    // 作用: 模拟真实浏览器，避免被网站识别为爬虫
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    
    // 🌐 导航到初始页面
    await page.goto(initialUrl, { 
      waitUntil: "networkidle2" // 等待网络空闲2秒，确保页面完全加载
    });

    res.json({ success: true, message: "浏览器启动成功" });
  } catch (error) {
    console.error("❌ 启动浏览器失败:", error);
    res.status(500).json({ error: error.message });
  }
});

// 📄 创建新页面 API
app.post("/api/create-page", async (req, res) => {
  try {
    if (!browser) {
      return res.status(400).json({ error: "浏览器未启动，请先启动浏览器" });
    }

    const page = await browser.newPage();
    
    // 设置用户代理
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    res.json({ success: true, message: "页面创建成功" });
  } catch (error) {
    console.error("❌ 创建页面失败:", error);
    res.status(500).json({ error: error.message });
  }
});

// 🌐 页面导航 API
app.post("/api/navigate", async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!browser) {
      return res.status(400).json({ error: "浏览器未启动" });
    }

    const pages = await browser.pages();
    const page = pages[pages.length - 1]; // 使用最后一个页面
    
    await page.goto(url, { waitUntil: "networkidle2" });
    
    res.json({ success: true, message: `成功导航到 ${url}` });
  } catch (error) {
    console.error("❌ 页面导航失败:", error);
    res.status(500).json({ error: error.message });
  }
});

// 🔒 关闭浏览器 API
app.post("/api/close-browser", async (req, res) => {
  try {
    if (browser) {
      await browser.close();
      browser = null;
    }
    
    res.json({ success: true, message: "浏览器已关闭" });
  } catch (error) {
    console.error("❌ 关闭浏览器失败:", error);
    res.status(500).json({ error: error.message });
  }
});

// 📤 图片上传和搜索 API
// 这是主要的业务接口，处理图片上传并执行百度识图搜索
app.post("/api/upload-and-search", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "请选择要上传的图片" });
    }

    console.log("📤 收到图片上传请求:", req.file.originalname);
    
    // 执行百度识图搜索
    const result = await searchImageOnBaidu(req.file.path);
    
    // 清理上传的临时文件
    fs.unlinkSync(req.file.path);
    
    res.json({
      success: true,
      message: "搜索完成",
      data: result,
    });
    
  } catch (error) {
    console.error("❌ 图片搜索失败:", error);
    
    // 清理上传的临时文件（如果存在）
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 🏠 根路径
app.get("/", (req, res) => {
  res.send("Puppeteer 图片搜索服务器运行中 🚀");
});

// 🎧 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log("📋 可用的API接口:");
  console.log("  POST /api/launch-browser - 启动浏览器");
  console.log("  POST /api/create-page - 创建新页面");
  console.log("  POST /api/navigate - 页面导航");
  console.log("  POST /api/close-browser - 关闭浏览器");
  console.log("  POST /api/upload-and-search - 上传图片并搜索");
});

// 🛑 优雅关闭
process.on("SIGINT", async () => {
  console.log("\n🛑 正在关闭服务器...");
  if (browser) {
    await browser.close();
  }
  process.exit(0);
});
