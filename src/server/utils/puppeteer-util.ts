import puppeteer, { Browser, Page } from 'puppeteer';

let browser: Browser | null = null;
const pages: Page[] = [];

export function getBrowser() {
  return browser;
}
export function setBrowser(b: Browser | null) {
  browser = b;
}
export function getPages() {
  return pages;
}
export function addPage(page: Page) {
  pages.push(page);
}
export function clearPages() {
  pages.length = 0;
}

/**
 * 🔍 百度识图搜索核心函数
 * 
 * 该函数使用 Puppeteer 自动化浏览器实现：
 * 1. 打开百度识图页面
 * 2. 上传图片
 * 3. 等待并抓取商品信息
 * 4. 监听网络请求与响应，便于调试和数据分析
 *
 * @param imagePath 要搜索的图片文件路径
 * @returns 商品信息与网络数据
 */
// 网络请求/响应类型定义
export interface NetworkRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  postData?: string | undefined;
}
export interface NetworkResponse {
  url: string;
  status: number;
  headers: Record<string, string>;
  body: string | null;
}
export interface Product {
  title: string;
  price: string;
  image: string;
  link: string;
  source: string;
}

export async function searchImageOnBaidu(imagePath: string) {
  let page: Page | null = null;
  const requests: NetworkRequest[] = [];
  const responses: NetworkResponse[] = [];
  try {
    // 1. 检查浏览器实例
    if (!browser) {
      // 如果浏览器未启动，先启动浏览器
      browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    }
    // 2. 创建新页面
    page = await browser.newPage();

    // 3. 启用请求拦截，便于监听所有网络流量
    await page.setRequestInterception(true);
    // 4. 监听网络请求
    page.on('request', (request) => {
      // 记录请求信息用于后续分析
      const req: NetworkRequest = {
        url: request.url(),
        method: request.method(),
        headers: request.headers() as Record<string, string>,
        postData: request.postData(),
      };
      requests.push(req);
      request.continue(); // 不阻断请求
    });
    // 5. 监听网络响应
    page.on('response', async (response) => {
      try {
        const res: NetworkResponse = {
          url: response.url(),
          status: response.status(),
          headers: response.headers() as Record<string, string>,
          body: null,
        };
        // content-length 头为字符串，需要转为 number 再比较，避免大文件导致内存溢出
        const contentLength = Number(response.headers()['content-length']);
        if (!isNaN(contentLength) && contentLength < 1000000) {
          try {
            res.body = await response.text();
          } catch {
            res.body = null;
          }
        }
        responses.push(res);
      } catch {
        responses.push({
          url: response.url(),
          status: response.status(),
          headers: response.headers() as Record<string, string>,
          body: null,
        });
      }
    });

    // 6. 设置用户代理，模拟真实浏览器，避免被识别为爬虫
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // 7. 导航到百度识图页面
    await page.goto('https://graph.baidu.com/pcpage/index?tpl_from=pc', { waitUntil: 'networkidle2', timeout: 30000 });

    // 8. 上传图片
    const fileInput = await page.$('input[type="file"]');
    if (!fileInput) throw new Error('未找到文件上传输入框');
    await fileInput.uploadFile(imagePath);

    // 9. 等待结果加载（可根据实际情况调整等待时间）
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await page.waitForSelector('.graph-product-list, .commodity-list, .similar-image-list', { timeout: 15000 });

    // 10. 提取商品信息
    const products: Product[] = await page.evaluate(() => {
      const productList: Product[] = [];
      // 多个选择器兼容不同页面结构
      const selectors = [
        '.graph-product-list .product-item',
        '.commodity-list .commodity-item',
        '.similar-image-list .similar-image-item',
        '.result-item',
        "[data-module='commodity']",
      ];
      let items = [] as unknown as NodeListOf<Element>;
      // 尝试每个选择器，直到找到商品元素
      for (const selector of selectors) {
        items = document.querySelectorAll(selector);
        if (items.length > 0) break;
      }
      // 提取每个商品的信息
      items.forEach((item: Element, index: number) => {
        try {
          // 商品标题
          const titleElement = item.querySelector('.product-title, .title, .item-title, h3, .name');
          const title = titleElement ? titleElement.textContent!.trim() : `商品 ${index + 1}`;
          // 商品价格
          const priceElement = item.querySelector('.product-price, .price, .item-price, .cost');
          const price = priceElement ? priceElement.textContent!.trim() : '价格未知';
          // 商品图片
          const imgElement = item.querySelector('img');
          const image = imgElement ? (imgElement as HTMLImageElement).src : '';
          // 商品链接
          const linkElement = item.querySelector('a');
          const link = linkElement ? (linkElement as HTMLAnchorElement).href : '';
          // 商品来源
          const sourceElement = item.querySelector('.product-source, .source, .shop-name, .platform');
          const source = sourceElement ? sourceElement.textContent!.trim() : '来源未知';
          // 只添加有效的商品信息
          if (title && title !== `商品 ${index + 1}`) {
            productList.push({ title, price, image, link, source });
          }
        } catch {
          // 某个商品提取失败，忽略继续
        }
      });
      return productList;
    });
    // 返回商品和网络分析数据
    return {
      products,
      networkData: { requests, responses },
    };
  } catch (error: any) {
    // 错误处理：抛出详细信息
    throw new Error(error.message);
  } finally {
    // 无论成功与否都关闭页面，释放资源
    if (page) await page.close();
  }
}

