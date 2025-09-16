import app from './app.js';
import { closeBrowser } from './services/puppeteer.js';

const PORT = 3001;

const server = app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log('📋 可用的API接口:');
  console.log('  POST /api/launch-browser - 启动浏览器');
  console.log('  POST /api/create-page - 创建新页面');
  console.log('  POST /api/navigate - 页面导航');
  console.log('  POST /api/close-browser - 关闭浏览器');
  console.log('  POST /api/upload-and-search - 上传图片并搜索');
});

async function gracefulShutdown() {
  console.log('\n🛑 正在关闭服务器...');
  try {
    await closeBrowser();
  } catch (err) {
    console.error('关闭浏览器时发生错误:', (err as Error).message);
  }
  server.close(() => process.exit(0));
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
