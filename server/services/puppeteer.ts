import puppeteer, { Browser, HTTPRequest, HTTPResponse, Page } from 'puppeteer';

let browser: Browser | null = null;

export async function launchBrowser(initialUrl: string = ''): Promise<void> {
  if (browser) {
    await browser.close();
  }

  browser = await puppeteer.launch({
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--start-maximized',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
    ],
    defaultViewport: null,
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  if (initialUrl) {
    await page.goto(initialUrl, { waitUntil: 'networkidle2' });
  }
}

export async function createPage(): Promise<void> {
  if (!browser) throw new Error('浏览器未启动，请先启动浏览器');
  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );
}

export async function navigate(url: string): Promise<void> {
  if (!browser) throw new Error('浏览器未启动');
  const pages = await browser.pages();
  const page = pages[pages.length - 1];
  await page.goto(url, { waitUntil: 'networkidle2' });
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

export interface NetworkRequestInfo {
  url: string;
  method: string;
  headers: Record<string, string>;
  postData?: string | undefined;
}

export interface NetworkResponseInfo {
  url: string;
  status: number;
  headers: Record<string, string>;
  body: string | null;
}

export interface SearchResultData {
  products: Array<{ title: string; price: string; image: string; link: string; source: string }>;
  apiData: unknown;
  totalProducts: number;
  hasApiData: boolean;
  networkData: {
    requests: number;
    responses: number;
    apiRequests: number;
    sampleRequests: NetworkRequestInfo[];
  };
}

export async function searchImageOnBaidu(imagePath: string): Promise<SearchResultData> {
  let page: Page | null = null;
  const requests: NetworkRequestInfo[] = [];
  const responses: NetworkResponseInfo[] = [];

  try {
    if (!browser) {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }

    page = await browser.newPage();

    await page.setRequestInterception(true);

    page.on('request', (request: HTTPRequest) => {
      requests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        postData: request.postData() ?? undefined,
      });
      request.continue();
    });

    page.on('response', async (response: HTTPResponse) => {
      try {
        const info: NetworkResponseInfo = {
          url: response.url(),
          status: response.status(),
          headers: response.headers(),
          body: null,
        };
        const lenStr = response.headers()['content-length'];
        const len = typeof lenStr === 'string' ? parseInt(lenStr, 10) : NaN;
        if (!Number.isNaN(len) && len < 1000000) {
          try {
            info.body = await response.text();
          } catch {
            /* ignore response body parse error */
          }
        }
        responses.push(info);
      } catch {
        /* ignore response handling error */
      }
    });

    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    await page.goto('https://graph.baidu.com/pcpage/index?tpl_from=pc', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    const fileInput = await page.$('input[type="file"]');
    if (!fileInput) throw new Error('未找到文件上传输入框');
    await fileInput.uploadFile(imagePath);

    // 初步等待页面渲染
    await new Promise((r) => setTimeout(r, 3000));
    // 尝试等待常见结果容器，失败则走兜底等待，不中断流程
    try {
      await page.waitForSelector('.graph-product-list, .commodity-list, .similar-image-list', { timeout: 25000 });
    } catch {
      // 兜底等待：尝试等待任何图片元素或再延时一段时间
      await page.waitForSelector('img', { timeout: 15000 }).catch(() => {});
      await new Promise((r) => setTimeout(r, 2000));
    }

    let apiData: unknown = null;
    const apiPromise = new Promise((resolve) => {
      page!.on('response', async (response) => {
        if (response.url().includes('https://graph.baidu.com/ajax/newgoodsset')) {
          try {
            const data = await response.json();
            apiData = data;
            resolve(data);
          } catch {
            resolve(null);
          }
        }
      });
    });

    try {
      await page.waitForSelector('.general-typelist li', { timeout: 10000 });
      const categoryButtons = await page.$$('.general-typelist li');
      if (categoryButtons.length >= 2) {
        const secondButton = categoryButtons[1];
        await secondButton.click();
        await Promise.race([apiPromise, new Promise((_, rej) => setTimeout(() => rej(new Error('接口响应超时')), 10000))]);
      }
    } catch {
      /* ignore category switching error */
    }

    await new Promise((r) => setTimeout(r, 2000));

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const products = await page.evaluate(() => {
      const productList: Array<{ title: string; price: string; image: string; link: string; source: string }> = [];
      const selectors = [
        '.graph-product-list-item',
        '.graph-product-list .graph-span6',
        '.product-item',
        '.commodity-item',
        "[data-show-log='true']",
      ];
      const d = (globalThis as any).document as any;
      let items: any[] = [];
      for (const selector of selectors) {
        const found = d.querySelectorAll(selector) as any;
        if (found.length > 0) {
          items = Array.from(found as any);
          break;
        }
      }
      items.forEach((item, index) => {
        try {
          const titleElement = (item as any).querySelector(
            '.graph-product-list-desc, .product-title, .title, .item-title, h3, .name'
          );
          const title = titleElement ? (titleElement.textContent || '').trim() : `商品 ${index + 1}`;

          const priceElement = (item as any).querySelector(
            '.graph-product-list-price, .product-price, .price, .item-price, .cost'
          );
          const price = priceElement ? (priceElement.textContent || '').trim() : '价格未知';

          const imgElement = (item as any).querySelector('.graph-product-list-img img, .product-img img, img');
          const image = imgElement ? (imgElement as any).src : '';

          const linkElement = (item as any).querySelector('.graph-product-list-content, a');
          const link = linkElement ? (((linkElement as any).href as string) || '') : '';

          const sourceElement = (item as any).querySelector(
            '.graph-product-list-source, .product-source, .source, .shop-name, .platform'
          );
          const source = sourceElement ? (sourceElement.textContent || '').trim() : '来源未知';

          if (title && title !== `商品 ${index + 1}` && price !== '价格未知') {
            productList.push({ title, price, image, link, source });
          }
        } catch {
          /* ignore single item parse error */
        }
      });
      return productList;
    });

    const apiRequests = requests.filter(
      (req) => req.url.includes('api') || req.url.includes('ajax') || req.url.includes('search') || req.url.includes('graph')
    );

    return {
      products,
      apiData,
      totalProducts: products.length,
      hasApiData: !!apiData,
      networkData: {
        requests: requests.length,
        responses: responses.length,
        apiRequests: apiRequests.length,
        sampleRequests: apiRequests.slice(0, 3),
      },
    };
  } finally {
    if (page) await page.close();
  }
}
