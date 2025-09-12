import { Outlet } from "react-router-dom";
import { defaultSetting } from "@/default-setting";

function Content() {
  return (
    <div
      className="transition-all mt-header bg-[var(--ant-color-bg-container)] m-0 z-1 p-[0px]"
      style={{
        marginLeft: defaultSetting.slideWidth,
        marginTop: defaultSetting.headerHeight,
        height: `calc(100vh - ${defaultSetting.headerHeight}px)`,
        width: `calc(100vw - ${defaultSetting.slideWidth}px)`,
      }}
    >
      <Outlet />
    </div>
  );
}

export default Content;
