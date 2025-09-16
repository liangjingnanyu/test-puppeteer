import { Router } from 'express';
import { launchBrowser, createPage, navigate, closeBrowser } from '../services/puppeteer.js';

const router = Router();

router.post('/launch-browser', async (req, res) => {
  try {
    const { initialUrl = '' } = req.body ?? {};
    await launchBrowser(initialUrl);
    res.json({ success: true, message: '浏览器启动成功' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/create-page', async (_req, res) => {
  try {
    await createPage();
    res.json({ success: true, message: '页面创建成功' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/navigate', async (req, res) => {
  try {
    const { url } = req.body ?? {};
    if (!url) return res.status(400).json({ success: false, error: '缺少 url 参数' });
    await navigate(url);
    res.json({ success: true, message: `成功导航到 ${url}` });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/close-browser', async (_req, res) => {
  try {
    await closeBrowser();
    res.json({ success: true, message: '浏览器已关闭' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
