import React, { useState, useCallback, useEffect } from 'react';

import SubNavTree from '@/components/navigation/SubNavTree';

const NavTree = React.memo(({ items, currentPath, level = 0 }) => {

  return (
    <div className="h-dvh">
      <div className="space-y-2 min-w-64 pb-12">
        {items.map((item) => (
          <div key={item.title} className="mb-5">
            <div className="py-1 px-2 font-semibold">{item.title}</div>
            <SubNavTree items={item.dotcmsdocumentationchildren} currentPath={currentPath} level="0"/>
          </div>
        ))}
      </div>
    </div>
  );
});

NavTree.displayName = 'NavTree';

export default NavTree; 