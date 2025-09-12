import { defaultSetting } from "@/default-setting";
import SlideMenu from "./menu";

function SlideIndex() {
  function renderMenu() {
    return <SlideMenu />;
  }

  return (
    <div
      style={{
        width: defaultSetting.slideWidth,
        top: defaultSetting.headerHeight,
      }}
      className="menu-slide bg-transparent transition-all fixed box-border left-0 bottom-0 overflow-y-auto border-r border-r-1 border-[#e9e9e9] px-[16px]"
    >
      {renderMenu()}
    </div>
  );
}

export default SlideIndex;
