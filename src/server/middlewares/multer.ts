/**
 * 上传中间件配置（multer）
 *
 * 用于处理图片文件上传，包含存储目录、大小限制、类型校验等。
 *
 * - 存储路径：uploads/
 * - 文件大小限制：5MB
 * - 只允许 image/* 类型，其他类型直接拒绝
 *
 * 用法：配合 Express 路由使用，req.file 即为上传后的图片文件对象。
 */
import multer from 'multer';

const upload = multer({
  dest: 'uploads/', // 上传文件存储目录
  limits: { fileSize: 5 * 1024 * 1024 }, // 限制文件大小为5MB
  /**
   * 文件类型过滤，仅允许图片
   * @param req Express 请求对象
   * @param file 上传的文件对象
   * @param cb 回调函数，控制是否接受该文件
   */
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      // 非图片类型，直接报错
      cb(new Error('只允许上传图片文件'));
    }
  },
});

export default upload;

