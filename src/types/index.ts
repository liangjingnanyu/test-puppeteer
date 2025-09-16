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

// 百度识图 API 列表项（根据返回结构提炼，可扩展）
export interface BaiduApiItem {
  brand: string;
  buyurl: string;
  category_duomo: string;
  cps_token?: string;
  data_source?: string;
  data_source_item?: unknown;
  desc: string;
  extra_params?: string;
  imgurl: string;
  is_cps?: number;
  is_self?: number;
  itemId?: string;
  miniAppRecall?: number;
  miniapp_agent?: string;
  miniapp_id?: string;
  mypos?: string[];
  product_source?: string;
  rank_level?: number | null;
  real_price?: string;
  retrievalMode?: string;
  source?: string;
  sourceIcon?: string;
  text?: string;
  coupons_url?: string;
  cps_pid?: string;
  goodsShowInfo?: string;
  original?: string;
  promotion?: string;
  quota?: string;
  shopName?: string;
  attributes?: unknown[];
  tags?: string[];
  originalText?: string;
  discountText?: string;
}

// 百度识图 API 数据结构
export interface BaiduApiData {
  data: {
    list: BaiduApiItem[];
    noMore: boolean;
  };
  status: number;
}

// 网络总结数据（计数与采样）
export interface NetworkSummary {
  requests: number;
  responses: number;
  apiRequests: number;
  sampleRequests: NetworkRequest[];
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

// 搜索结果数据（/api/upload-and-search 返回）
export interface SearchResult {
  products: Product[];
  apiData?: BaiduApiData | null;
  totalProducts?: number;
  hasApiData?: boolean;
  networkData?: NetworkSummary;
}
