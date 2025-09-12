/**
 * 路由统一注册
 *
 * - 负责将所有 API 路由集中管理，便于维护和扩展
 * - 支持中间件灵活组合
 */
import { Router } from 'express';
import puppeteerController from './controllers/puppeteer';
import uploadController from './controllers/upload';
import multerMiddleware from './middlewares/multer';

const router = Router();

// === Puppeteer 浏览器相关 API ===
router.post('/launch-browser', puppeteerController.launchBrowser); // 启动浏览器
router.post('/create-page', puppeteerController.createPage);       // 创建新页面
router.post('/navigate', puppeteerController.navigate);            // 页面导航
router.post('/close-browser', puppeteerController.closeBrowser);   // 关闭浏览器

// === 图片上传与识图 API ===
router.post('/upload-and-search', multerMiddleware.single('image'), uploadController.uploadAndSearch); // 上传图片并识图

export default router;
