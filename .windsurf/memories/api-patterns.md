通用 API 请求封装模式：
```tsx
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '网络请求失败',
    };
  }
}
```

API 调用模式：
```tsx
const handleAction = async () => {
  setLoading(true);
  try {
    const response = await api.method(params);
    
    if (response.success) {
      message.success('操作成功');
      // 处理成功逻辑
    } else {
      message.error(`操作失败: ${response.error}`);
    }
  } catch {
    message.error('操作时发生错误');
  } finally {
    setLoading(false);
  }
};
```

FormData 上传模式：
```tsx
async uploadAndSearch(file: File): Promise<ApiResponse<SearchResult>> {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE}/upload-and-search`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '上传失败',
    };
  }
}
```

API 响应类型定义模式：
```tsx
interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
```

API 服务分组模式：
```tsx
export const puppeteerApi = {
  async launchBrowser(initialUrl: string): Promise<ApiResponse> {
    return apiRequest('/launch-browser', {
      method: 'POST',
      body: JSON.stringify({ initialUrl }),
    });
  },
};

export const imageSearchApi = {
  async uploadAndSearch(file: File): Promise<ApiResponse<SearchResult>> {
    // 实现
  },
};
```
