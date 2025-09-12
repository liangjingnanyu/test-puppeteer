import type { Request, Response } from 'express';
import fs from 'fs';
import { searchImageOnBaidu } from '../utils/puppeteer-util';

/**
 * 上传与识图控制器
 *
 * 主要负责处理图片上传并调用百度识图核心搜索逻辑。
 */
const uploadController = {
  /**
   * 上传图片并进行百度识图商品搜索
   *
   * 步骤：
   * 1. 校验上传文件
   * 2. 调用 Puppeteer 搜索图片商品信息
   * 3. 删除临时上传文件，返回结果
   * 4. 异常处理与资源清理
   *
   * @param req Express 请求对象，包含上传的图片文件
   * @param res Express 响应对象，返回搜索结果或错误信息
   */
  async uploadAndSearch(req: Request, res: Response) {
    try {
      // 1. 校验上传文件
      if (!req.file) {
        return res.status(400).json({ error: '请选择要上传的图片' });
      }
      // 2. 执行百度识图搜索
      const result = await searchImageOnBaidu(req.file.path);
      // 3. 删除临时文件，避免磁盘堆积
      fs.unlinkSync(req.file.path);
      // 4. 返回成功结果
      res.json({ success: true, message: '搜索完成', data: result });
    } catch (error: any) {
      // 5. 异常处理，确保临时文件被清理
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ success: false, error: error.message });
    }
  },
};
export default uploadController;
