React: ^19.1.0
React DOM: ^19.1.0
React Router DOM: ^7.6.2
TypeScript: ~5.8.3
Vite: ^6.3.5
Ant Design: ^5.26.0
Ant Design Pro Components: ^2.8.9
Zustand: ^5.0.5
Axios: ^1.9.0
Tailwind CSS: ^3.4.17
Ahooks: ^3.8.5
Lodash ES: ^4.17.21
Dayjs: ^1.11.13
XLSX: ^0.18.5
File Saver: ^2.0.5
Classnames: ^2.5.1
createRoot(document.getElementById('root')!)
<ConfigProvider componentSize="middle" theme={{ cssVar: true }}>
<AuthGuard><Layout /></AuthGuard>
React.lazy(() => import('@/pages/xxx'))
create<State & Action>()
devtools(persist())
useRequest(apiFunction)
axios.create({ timeout, baseURL, withCredentials })
className='flex justify-between p-[16px]'
import { map, filter, omit } from 'lodash-es'
dayjs().format('YYYY-MM-DD HH:mm:ss')
XLSX.utils.json_to_sheet(data)
saveAs(blob, filename)
