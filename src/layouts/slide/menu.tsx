import { Menu } from 'antd';
import { type MenuItemType } from 'antd/es/menu/interface';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useMatches } from 'react-router-dom';
import { pageRoutes } from '@/router/router';
import './menu.css';

interface MenuVO {
  parentId?: string;
  name?: string;
  // icon?: string;
  icon?: string | React.ReactNode;
  type?: number;
  route?: string;
  filePath?: string;
  orderNumber?: number;
  url?: string;
}
type MenuObj = MenuVO & { children?: MenuObj[], path?: string };

function SlideMenu() {

  const matches = useMatches();

  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [selectKeys, setSelectKeys] = useState<string[]>([]);


  useEffect(() => {
    const [match] = matches || [];
    if (match) {
      // 获取当前匹配的路由，默认为最后一个
      const route = matches[matches.length - 1];

      // 让当前菜单和所有上级菜单高亮显示
      setSelectKeys([route.pathname]);
    }
  }, [matches]);


  const treeMenuData = useCallback((menus: MenuObj[]): MenuItemType[] => {
    return (menus)
      .map((menu: MenuObj) => {
        const children = menu?.children || [];
        return {
          key: menu.path || '',
          label: <Link to={menu.path || ''}>{menu.name}</Link>,
          // icon: menu.icon && antdIcons[menu.icon] && React.createElement(antdIcons[menu.icon]),
          icon: menu.icon,
          children: children.length ? treeMenuData(children || []) : null,
        };
      })
  }, []);

  const menuData = useMemo(() => {
    return treeMenuData(
      (pageRoutes || [])
    );
  }, [pageRoutes, treeMenuData]);


  return (
    <Menu
      className='bg-transparent'
      mode="inline"
      selectedKeys={selectKeys}
      style={{ height: '100%', borderRight: 0 }}
      items={menuData}
      openKeys={openKeys}
      onOpenChange={setOpenKeys}
    />
  )
}

export default SlideMenu;
