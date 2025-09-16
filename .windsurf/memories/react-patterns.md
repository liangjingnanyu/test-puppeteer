函数组件 + Hooks 模式：
```tsx
export default function ComponentName() {
  const [state, setState] = useState<Type>(initialValue);
  const [loading, setLoading] = useState(false);
  
  const handleAction = async () => {
    setLoading(true);
    try {
      // 异步操作
    } catch {
      // 错误处理
    } finally {
      setLoading(false);
    }
  };
  
  return <div>JSX</div>;
}
```

状态管理模式：
```tsx
// 简单状态
const [value, setValue] = useState<string>('');

// 复杂状态
interface State {
  data: Data[];
  loading: boolean;
  error: string | null;
}
const [state, setState] = useState<State>({
  data: [],
  loading: false,
  error: null
});
```

事件处理模式：
```tsx
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  // 处理逻辑
};

const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};
```

条件渲染模式：
```tsx
{loading && <Spin />}
{error && <Alert message={error} type="error" />}
{data.length > 0 ? <List /> : <Empty />}
```

列表渲染模式：
```tsx
{items.map((item, index) => (
  <Item key={item.id || index} data={item} />
))}
```
