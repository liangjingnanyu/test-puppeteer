import { defaultSetting } from '@/default-setting';

function HeaderTitle() {

  return (
      <div
        // style={{ width: defaultSetting.slideWidth }}
        className="flex justify-between items-center"
      >
        <div className='flex items-center gap-[4px] text-[20px] px-[24px] pr-0'>
           {/* <IconLog className='text-[20px] text-primary' /> */}
          <span className='font-bold text-[22px]'>{defaultSetting.defaultTitle}</span>
        </div>
      </div>

  );
}

export default HeaderTitle;
