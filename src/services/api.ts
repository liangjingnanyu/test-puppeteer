/**
 * API 服务层
 * 
 * 统一管理所有后端 API 调用，提供类型安全的接口
 */

import type { ApiResponse, SearchResult } from '@/types';

const API_BASE = 'http://localhost:3001/api';

/**
 * 通用 API 请求封装
 */
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

/**
 * Puppeteer 浏览器控制 API
 */
export const puppeteerApi = {
  /**
   * 启动浏览器
   */
  async launchBrowser(initialUrl: string = 'https://www.baidu.com'): Promise<ApiResponse> {
    return apiRequest('/launch-browser', {
      method: 'POST',
      body: JSON.stringify({ initialUrl }),
    });
  },

  /**
   * 创建新页面
   */
  async createPage(): Promise<ApiResponse> {
    return apiRequest('/create-page', {
      method: 'POST',
    });
  },

  /**
   * 页面导航
   */
  async navigate(url: string): Promise<ApiResponse> {
    return apiRequest('/navigate', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  },

  /**
   * 关闭浏览器
   */
  async closeBrowser(): Promise<ApiResponse> {
    return apiRequest('/close-browser', {
      method: 'POST',
    });
  },
};

/**
 * 图片识图搜索 API
 */
export const imageSearchApi = {
  /**
   * 上传图片并搜索
   */
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
        error: error instanceof Error ? error.message : '图片上传失败',
      };
    }
  },
};
