
import { defaultSetting } from '@/default-setting';
import HeaderTitle from './header-title';

function Header() {
  return (
    <div
      style={{ zIndex: 998, height: defaultSetting.headerHeight }}
      className="flex basis-[48px] justify-between items-center px-0 fixed top-0 right-0 left-0 text-white bg-[#191A1C]"
    >
      <HeaderTitle/>
    </div>
  )
}

export default Header;