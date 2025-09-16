import { useState } from "react";
import {
  Card,
  Button,
  Upload,
  Typography,
  Image,
  Tag,
  message,
  Spin,
  Tabs,
} from "antd";
import { UploadOutlined, SearchOutlined, EyeOutlined } from "@ant-design/icons";
import { imageSearchApi } from "@/services/api";
import type { Product, SearchResult } from "@/types";
import JsonEditor from "@/components/JsonEditor";

const { Title, Text } = Typography;

/**
 * 百度识图商品搜索页面
 *
 * 提供图片上传、识图搜索、商品展示等功能
 */
export default function ImageRecognition() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchMessage, setSearchMessage] = useState("");
  const [resultRaw, setResultRaw] = useState<SearchResult | null>(null);
  const [activeTab, setActiveTab] = useState<string>("list");

  /**
   * 处理文件上传
   */
  const handleUpload = (file: File): boolean => {
    setSelectedFile(file);
    setProducts([]);
    setSearchMessage("");
    setResultRaw(null);

    return false; // 阻止自动上传
  };

  /**
   * 图片搜索功能
   */
  const handleImageSearch = async () => {
    if (!selectedFile) {
      message.warning("请先选择图片文件");
      return;
    }

    setIsSearching(true);
    setSearchMessage("正在搜索中...");
    setProducts([]);
    setResultRaw(null);

    try {
      const response = await imageSearchApi.uploadAndSearch(selectedFile);

      if (response.success && response.data) {
        const result = response.data as SearchResult;
        setProducts(result.products || []);
        setResultRaw(result);
        setSearchMessage(
          `搜索完成，找到 ${result.products?.length || 0} 个商品`
        );
        message.success("搜索完成");
      } else {
        setSearchMessage(`搜索失败: ${response.error}`);
        message.error(`搜索失败: ${response.error}`);
      }
    } catch {
      const errorMsg = "搜索失败，请检查网络连接";
      setSearchMessage(errorMsg);
      message.error(errorMsg);
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * 移除文件
   */
  const handleRemove = () => {
    setSelectedFile(null);
    setProducts([]);
    setSearchMessage("");
    setResultRaw(null);
  };

  return (
    <div className="p-4 h-screen flex flex-col">
      <Title level={2} className="mb-4 flex-shrink-0">
        百度识图商品搜索
      </Title>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        {/* 左侧：图片上传和控制区域 */}
        <div className="lg:col-span-1 flex flex-col">
          <Card title="图片上传" className="flex-1 flex flex-col">
            <div className="flex-1 flex flex-col">
              {/* 上传和搜索按钮 */}
              <div className="mb-4 flex gap-2">
                <Upload
                  accept="image/*"
                  beforeUpload={handleUpload}
                  showUploadList={false}
                  multiple={false}
                  className="flex-1"
                >
                  <Button
                    icon={<UploadOutlined />}
                    size="large"
                    block
                    type="dashed"
                  >
                    选择图片
                  </Button>
                </Upload>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={handleImageSearch}
                  disabled={!selectedFile || isSearching}
                  loading={isSearching}
                  size="large"
                >
                  {isSearching ? "搜索中" : "识图搜索"}
                </Button>
              </div>

              {/* 图片列表 */}
              <div className="flex-1 min-h-0">
                {selectedFile ? (
                  <div className="h-full flex flex-col">
                    <div className="mb-3">
                      <Text strong className="text-sm">
                        已选择:{" "}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        {selectedFile.name}
                      </Text>
                    </div>

                    {/* 图片预览 - 自适应高度 */}
                    <div className="flex-1 min-h-0 mb-4">
                      <div className="relative w-full h-full">
                        <Image
                          src={URL.createObjectURL(selectedFile)}
                          alt="预览图片"
                          className="w-full h-full object-cover rounded-lg border border-gray-200"
                          style={{ maxHeight: "100%" }}
                        />
                        <Button
                          type="text"
                          danger
                          size="small"
                          className="absolute top-2 right-2 bg-white shadow-sm"
                          onClick={handleRemove}
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                    <div className="text-center">
                      <UploadOutlined className="text-4xl text-gray-300 mb-2" />
                      <Text type="secondary">暂无图片</Text>
                    </div>
                  </div>
                )}
              </div>

              {/* 搜索状态 */}
              {searchMessage && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {isSearching && <Spin size="small" />}
                    <Text strong className="text-sm">
                      状态:
                    </Text>
                    <Text className="text-sm">{searchMessage}</Text>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* 右侧：商品搜索结果 */}
        <div className="lg:col-span-2 flex flex-col min-h-0">
          <Card
            title={
              products.length > 0
                ? `搜索结果 (${products.length} 个商品)`
                : "搜索结果"
            }
            className="flex-1"
            styles={{
              body: {
                padding: "16px",
                height: "calc(100vh - 200px)",
                overflowY: "auto",
                overflowX: "hidden"
              }
            }}
          >
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: 'list',
                  label: '商品列表',
                  children: (
                    products.length > 0 ? (
                      <div className="grid grid-cols-3 gap-4">
                        {products.map((product: Product, index: number) => (
                          <div key={index} className="mb-4">
                            <Card
                              hoverable
                              className="h-auto"
                              styles={{
                                body: {
                                  padding: "12px"
                                }
                              }}
                              cover={
                                product.image ? (
                                  <div className="h-64">
                                    <Image
                                      alt={product.title}
                                      src={product.image}
                                      className="w-full h-full rounded-lg"
                                      preview={{
                                        mask: (
                                          <div className="flex items-center justify-center">
                                            <EyeOutlined className="text-white text-lg mr-2" />
                                            <span className="text-white">预览</span>
                                          </div>
                                        ),
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="h-24 bg-gray-100 flex items-center justify-center">
                                    <Text type="secondary">暂无图片</Text>
                                  </div>
                                )
                              }
                            >
                              <div className="space-y-2">
                                <Text
                                  strong
                                  className="text-xs leading-tight block"
                                  style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    lineHeight: '1.4'
                                  }}
                                  title={product.title}
                                >
                                  {product.title}
                                </Text>

                                <Text strong className="text-red-500 text-sm block">
                                  {product.price}
                                </Text>

                                <div className="flex items-center justify-between">
                                  {product.source && (
                                    <Tag color="blue" className="text-xs">
                                      {product.source}
                                    </Tag>
                                  )}

                                  <Button
                                    type="link"
                                    size="small"
                                    icon={<EyeOutlined />}
                                    className="p-0 h-auto text-xs"
                                    onClick={() => {
                                      if (product.link) {
                                        window.open(product.link, "_blank");
                                      } else {
                                        message.info("暂无商品链接");
                                      }
                                    }}
                                  >
                                    查看
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center">
                        <EyeOutlined className="text-6xl text-gray-300 mb-4" />
                        <Text type="secondary" className="text-lg">
                          上传图片开始识图搜索
                        </Text>
                      </div>
                    )
                  )
                },
                {
                  key: 'json',
                  label: 'JSON 数据',
                  children: (
                    <div className="h-full">
                      <JsonEditor value={resultRaw?.apiData ?? {}} height="60vh" />
                    </div>
                  )
                }
              ]}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
