/**
 * Express 应用入口
 *
 * - 启动服务监听端口
 * 
 */
import express from 'express';
import cors from 'cors';
import path from 'path';
import routes from './routes';

const app = express();
const PORT = 3001;

// === 全局中间件 ===
app.use(cors()); // 允许跨域请求
app.use(express.json()); // 解析 JSON 请求体
app.use(express.static(path.resolve(process.cwd(), 'public'))); // 提供静态文件服务

// === 路由注册 ===
app.use('/api', routes);

// === 根路由（健康检查） ===
app.get('/', (_req, res) => {
  res.send('Puppeteer 图片搜索服务器运行中 🚀');
});

// === 启动服务监听端口 ===
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log('📋 可用的API接口:');
  console.log('  POST /api/launch-browser - 启动浏览器');
  console.log('  POST /api/create-page - 创建新页面');
  console.log('  POST /api/navigate - 页面导航');
  console.log('  POST /api/close-browser - 关闭浏览器');
  console.log('  POST /api/upload-and-search - 上传图片并搜索');
});

// === 优雅关闭，自动释放 Puppeteer 资源 ===
import { getBrowser } from './utils/puppeteer-util';
process.on('SIGINT', async () => {
  console.log('\n🛑 正在关闭服务器...');
  const browser = getBrowser();
  if (browser) {
    await browser.close();
  }
  process.exit(0);
});