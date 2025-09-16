import { Router } from 'express';
import fs from 'fs';
import upload from '../middlewares/upload.js';
import { searchImageOnBaidu } from '../services/puppeteer.js';

const router = Router();

router.post('/upload-and-search', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: '请选择要上传的图片' });
    }

    const result = await searchImageOnBaidu(req.file.path);

    // 清理临时文件
    fs.unlink(req.file.path, () => {});

    res.json({ success: true, message: '搜索完成', data: result });
  } catch (error) {
    const err = error as Error;
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, () => {});
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
