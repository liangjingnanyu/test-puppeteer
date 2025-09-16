src/
├── App.tsx                    # 应用根组件，配置 Antd ConfigProvider
├── main.tsx                   # 应用入口文件
├── index.css                  # 全局样式文件
├── vite-env.d.ts             # Vite 环境类型定义
├── assets/
│   └── react.svg             # React 图标资源
├── layouts/                   # 布局组件目录
│   ├── index.tsx             # 布局入口文件
│   ├── commonPage/           # 通用页面布局
│   ├── content/              # 内容区域布局
│   ├── header/               # 头部布局
│   └── slide/                # 侧边栏布局
├── pages/                     # 页面组件目录
│   ├── basic/                # Puppeteer 基础控制页面
│   │   └── index.tsx         # 浏览器生命周期管理界面
│   └── image-recognition/    # 图片识图搜索页面
│       └── index.tsx         # 图片上传和搜索界面
├── router/                    # 路由配置目录
│   ├── index.tsx             # 路由提供者组件
│   └── router.tsx            # 路由配置文件
├── services/                  # 服务层目录
│   └── api.ts                # API 接口封装
├── types/                     # 类型定义目录
│   └── index.ts              # 通用类型定义
└── utils/                     # 工具函数目录
    └── antd.tsx              # Antd 工具类封装

server.js                      # Express 后端服务器
uploads/                       # 图片上传存储目录
