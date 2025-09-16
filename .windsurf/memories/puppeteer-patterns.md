浏览器生命周期管理模式：
```tsx
const [browserStatus, setBrowserStatus] = useState<BrowserStatus>('未启动');
const [currentPageId, setCurrentPageId] = useState<string | null>(null);

const launchBrowser = async () => {
  setLoading(true);
  try {
    const response = await puppeteerApi.launchBrowser(initUrl);
    if (response.success) {
      setBrowserStatus('已启动');
      message.success('浏览器启动成功');
    } else {
      message.error(`启动失败: ${response.error}`);
    }
  } catch {
    message.error('启动浏览器时发生错误');
  } finally {
    setLoading(false);
  }
};
```

页面操作状态管理模式：
```tsx
const [url, setUrl] = useState('https://www.baidu.com');
const [initUrl, setInitUrl] = useState('https://www.baidu.com');
const [loading, setLoading] = useState(false);

const navigateToUrl = async () => {
  if (!currentPageId) {
    message.warning('请先创建页面');
    return;
  }
  // 导航逻辑
};
```

条件渲染控制模式：
```tsx
<Button
  type="primary"
  onClick={launchBrowser}
  disabled={browserStatus === '已启动'}
  loading={loading}
>
  启动浏览器
</Button>

<Button
  onClick={createNewPage}
  disabled={browserStatus !== '已启动'}
  loading={loading}
>
  创建新页面
</Button>
```

状态标签显示模式：
```tsx
<Tag color={browserStatus === '已启动' ? 'green' : 'default'}>
  {browserStatus}
</Tag>

<Text code>{currentPageId || '无'}</Text>
```

文件上传处理模式：
```tsx
const handleFileUpload = async (file: File) => {
  if (!file.type.startsWith('image/')) {
    message.error('请选择图片文件');
    return;
  }
  
  setUploading(true);
  try {
    const response = await imageSearchApi.uploadAndSearch(file);
    if (response.success && response.data) {
      setSearchResults(response.data.products);
      message.success(`找到 ${response.data.products.length} 个相关商品`);
    } else {
      message.error(`搜索失败: ${response.error}`);
    }
  } catch {
    message.error('上传图片时发生错误');
  } finally {
    setUploading(false);
  }
};
```

Puppeteer API 调用模式：
```tsx
export const puppeteerApi = {
  async launchBrowser(initialUrl: string = 'https://www.baidu.com'): Promise<ApiResponse> {
    return apiRequest('/launch-browser', {
      method: 'POST',
      body: JSON.stringify({ initialUrl }),
    });
  },

  async createPage(): Promise<ApiResponse> {
    return apiRequest('/create-page', { method: 'POST' });
  },

  async navigate(url: string): Promise<ApiResponse> {
    return apiRequest('/navigate', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  },

  async closeBrowser(): Promise<ApiResponse> {
    return apiRequest('/close-browser', { method: 'POST' });
  },
};
```
