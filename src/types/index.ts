/**
 * 共用类型定义
 * 
 * 定义前端和后端通用的数据结构，确保类型一致性
 */

// 商品信息接口
export interface Product {
  title: string;
  price: string;
  image: string;
  link: string;
  source: string;
  index?: number;
}

// 网络请求接口
export interface NetworkRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  postData?: string | undefined;
}

// 网络响应接口
export interface NetworkResponse {
  url: string;
  status: number;
  headers: Record<string, string>;
  body: string | null;
}

// API 响应基础接口
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// 浏览器状态类型
export type BrowserStatus = '未启动' | '已启动';

// 搜索结果数据
export interface SearchResult {
  products: Product[];
  networkData?: {
    requests: NetworkRequest[];
    responses: NetworkResponse[];
  };
}
