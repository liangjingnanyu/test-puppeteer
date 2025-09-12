import { useState } from 'react';
import { Card, Button, Input, Space, Typography, Tag, message } from 'antd';
import { PlayCircleOutlined, PlusOutlined, LinkOutlined, StopOutlined } from '@ant-design/icons';
import { puppeteerApi } from '@/services/api';
import type { BrowserStatus } from '@/types';

const { Title, Text } = Typography;

/**
 * Puppeteer 控制台页面
 * 
 * 提供浏览器生命周期管理、页面操作、导航等功能
 */
export default function Basic() {
  const [browserStatus, setBrowserStatus] = useState<BrowserStatus>('未启动');
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);
  const [url, setUrl] = useState('https://www.baidu.com');
  const [initUrl, setInitUrl] = useState('https://www.baidu.com');
  const [loading, setLoading] = useState(false);

  /**
   * 启动浏览器
   */
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

  /**
   * 创建新页面
   */
  const createNewPage = async () => {
    setLoading(true);
    try {
      const response = await puppeteerApi.createPage();
      
      if (response.success) {
        setCurrentPageId('new-page-' + Date.now());
        message.success('新页面创建成功');
      } else {
        message.error(`创建页面失败: ${response.error}`);
      }
    } catch {
      message.error('创建页面时发生错误');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 页面导航
   */
  const navigateToUrl = async () => {
    if (!currentPageId) {
      message.warning('请先创建页面');
      return;
    }

    setLoading(true);
    try {
      const response = await puppeteerApi.navigate(url);
      
      if (response.success) {
        message.success(`成功导航到 ${url}`);
      } else {
        message.error(`导航失败: ${response.error}`);
      }
    } catch {
      message.error('页面导航时发生错误');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 关闭浏览器
   */
  const closeBrowser = async () => {
    setLoading(true);
    try {
      const response = await puppeteerApi.closeBrowser();
      
      if (response.success) {
        setBrowserStatus('未启动');
        setCurrentPageId(null);
        message.success('浏览器已关闭');
      } else {
        message.error(`关闭失败: ${response.error}`);
      }
    } catch {
      message.error('关闭浏览器时发生错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Title level={2}>Puppeteer 控制台</Title>
      
      {/* 状态信息卡片 */}
      <Card className="mb-6">
        <Space direction="vertical" size="middle" className="w-full">
          <div className="flex items-center gap-4">
            <Text strong>浏览器状态:</Text>
            <Tag color={browserStatus === '已启动' ? 'green' : 'default'}>
              {browserStatus}
            </Tag>
          </div>
          <div className="flex items-center gap-4">
            <Text strong>当前页面ID:</Text>
            <Text code>{currentPageId || '无'}</Text>
          </div>
        </Space>
      </Card>

      {/* 浏览器控制卡片 */}
      <Card title="浏览器控制" className="mb-6">
        <Space direction="vertical" size="large" className="w-full">
          <div className="flex items-center gap-3">
            <Input
              value={initUrl}
              onChange={(e) => setInitUrl(e.target.value)}
              placeholder="浏览器启动初始页面URL"
              className="flex-1"
              disabled={browserStatus === '已启动'}
            />
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={launchBrowser}
              disabled={browserStatus === '已启动'}
              loading={loading}
            >
              启动浏览器
            </Button>
          </div>
          
          <Space>
            <Button
              icon={<PlusOutlined />}
              onClick={createNewPage}
              disabled={browserStatus !== '已启动'}
              loading={loading}
            >
              创建新页面
            </Button>
            <Button
              danger
              icon={<StopOutlined />}
              onClick={closeBrowser}
              disabled={browserStatus !== '已启动'}
              loading={loading}
            >
              关闭浏览器
            </Button>
          </Space>
        </Space>
      </Card>

      {/* 页面导航卡片 */}
      <Card title="页面导航">
        <div className="flex items-center gap-3">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="输入要访问的URL"
            className="flex-1"
          />
          <Button
            type="primary"
            icon={<LinkOutlined />}
            onClick={navigateToUrl}
            disabled={!currentPageId}
            loading={loading}
          >
            访问网页
          </Button>
        </div>
      </Card>
    </div>
  );
}
