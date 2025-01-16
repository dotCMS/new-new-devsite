import React, { useState, useCallback, useEffect } from 'react';

import SubNavTree from '@/components/navigation/SubNavTree';

const NavTree = React.memo(({ items, currentPath, level = 0 }) => {

  return (
    <div className="h-dvh  pr-6">
      <div className="space-y-2 min-w-72">
        {items.map((item) => (
          <div key={item.title}>
            <div className="py-1 font-semibold">{item.title}</div>
            <SubNavTree items={item.dotcmsdocumentationchildren} currentPath={currentPath} level="0"/>
          </div>
        ))}
      </div>
    </div>
  );
});

NavTree.displayName = 'NavTree';

export default NavTree; 