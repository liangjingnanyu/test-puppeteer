前端技术栈:
React: ^19.1.1
React DOM: ^19.1.1  
React Router DOM: ^7.8.2
TypeScript: ~5.8.3
Vite: ^7.1.2
Ant Design: ^5.27.3
TailwindCSS: ^4.1.13

后端技术栈:
Express: ^4.18.2
Puppeteer: ^24.20.0
Multer: ^2.0.2
CORS: ^2.8.5

开发工具:
Concurrently: ^7.6.0
ESLint: ^9.33.0
TypeScript ESLint: ^8.39.1

常用模式:
createRoot(document.getElementById('root')!)
<ConfigProvider componentSize="middle" theme={{ cssVar: true }}>
React.lazy(() => import('@/pages/xxx'))
fetch(`${API_BASE}${endpoint}`, options)
const formData = new FormData()
app.use(cors())
app.use(multer().single('image'))
const browser = await puppeteer.launch()
className='flex justify-between p-4'
