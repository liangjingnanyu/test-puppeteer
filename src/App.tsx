import { App as AntdApp, ConfigProvider } from "antd";
import RootRouterProvider from '@/router/index';

function App() {
  return (
    <ConfigProvider
      componentSize="middle"
      theme={{
        cssVar: true,
      }}
    >
      <AntdApp>
        <RootRouterProvider />
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
