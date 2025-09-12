import type { Request, Response } from 'express';
import { getBrowser, setBrowser, getPages, addPage, clearPages } from '../utils/puppeteer-util';
import puppeteer from 'puppeteer';

/**
 * Puppeteer 控制器
 *
 * 负责浏览器生命周期管理、页面操作、导航等自动化核心 API。
 * 每个方法均为 Express 路由处理函数。
 */
const puppeteerController = {
  /**
   * 启动 Puppeteer 浏览器实例
   *
   * - 若已有实例则先关闭
   * - 支持自定义初始页面 URL
   * - 自动新建页面并设置 UserAgent
   *
   * @param req.body.initialUrl 启动时访问的初始网址
   */
  async launchBrowser(req: Request, res: Response) {
    try {
      const { initialUrl = 'https://www.baidu.com' } = req.body;
      let browser = getBrowser();
      if (browser) {
        await browser.close();
        setBrowser(null);
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
      setBrowser(browser);
      const page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );
      await page.goto(initialUrl, { waitUntil: 'networkidle2' });
      addPage(page);
      res.json({ success: true, message: '浏览器启动成功' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
  /**
   * 创建新页面
   *
   * - 需保证浏览器已启动
   * - 新页面自动设置 UserAgent
   */
  async createPage(req: Request, res: Response) {
    try {
      const browser = getBrowser();
      if (!browser) return res.status(400).json({ error: '浏览器未启动' });
      const page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );
      addPage(page);
      res.json({ success: true, message: '页面创建成功' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
  /**
   * 页面导航
   *
   * - 需保证浏览器已启动
   * - 默认使用最后一个页面进行导航
   * @param req.body.url 目标网址
   */
  async navigate(req: Request, res: Response) {
    try {
      const browser = getBrowser();
      if (!browser) return res.status(400).json({ error: '浏览器未启动' });
      const pages = getPages();
      const page = pages[pages.length - 1];
      const { url } = req.body;
      await page.goto(url, { waitUntil: 'networkidle2' });
      res.json({ success: true, message: `成功导航到 ${url}` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
  /**
   * 关闭 Puppeteer 浏览器实例
   *
   * - 自动清理所有页面引用
   * - 支持幂等调用
   */
  async closeBrowser(req: Request, res: Response) {
    try {
      const browser = getBrowser();
      if (browser) {
        await browser.close();
        setBrowser(null);
        clearPages();
      }
      res.json({ success: true, message: '浏览器已关闭' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};
export default puppeteerController;
