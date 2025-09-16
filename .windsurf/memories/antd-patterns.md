ConfigProvider 全局配置模式：
```tsx
<ConfigProvider
  componentSize="middle"
  theme={{
    cssVar: true,
  }}
>
  <App>
    <Content />
  </App>
</ConfigProvider>
```

App 静态方法使用模式：
```tsx
const { notification, message, modal } = App.useApp();

useEffect(() => {
  antdUtils.setMessageInstance(message);
  antdUtils.setNotificationInstance(notification);
  antdUtils.setModalInstance(modal);
}, [notification, message, modal]);
```

Card 布局模式：
```tsx
<Card title="标题" className="mb-6">
  <Space direction="vertical" size="large" className="w-full">
    <div>内容</div>
  </Space>
</Card>
```

Button 操作模式：
```tsx
<Button
  type="primary"
  icon={<PlayCircleOutlined />}
  onClick={handleAction}
  disabled={condition}
  loading={loading}
>
  按钮文本
</Button>
```

Input 输入模式：
```tsx
<Input
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="提示文本"
  className="flex-1"
  disabled={disabled}
/>
```

Space 布局模式：
```tsx
<Space direction="vertical" size="middle" className="w-full">
  <Space>
    <Button>按钮1</Button>
    <Button>按钮2</Button>
  </Space>
</Space>
```

Tag 状态显示模式：
```tsx
<Tag color={status === '已启动' ? 'green' : 'default'}>
  {status}
</Tag>
```

Typography 文本模式：
```tsx
const { Title, Text } = Typography;
<Title level={2}>标题</Title>
<Text strong>强调文本:</Text>
<Text code>代码文本</Text>
```

message 提示模式：
```tsx
message.success('操作成功');
message.error(`操作失败: ${error}`);
message.warning('警告信息');
```
