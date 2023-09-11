import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ipcRenderer } from 'electron';
import { Button } from '@nextui-org/button';
import { Listbox } from '@nextui-org/listbox';
import { ListboxItem } from '@nextui-org/listbox';

function Home() {
  const [dirs, setDirs] = useState<string[]>([]);
  useEffect(() => {
    ipcRenderer.on('get-dir-reply', (event, arg) => {
      console.log(arg);
      setDirs(arg);
    });
    ipcRenderer.send('get-dir');
  }, []);

  return (
    <div>
      <Button color="primary">Button</Button>
      <Listbox
        className="p-0 gap-0 divide-y divide-default-300/50 dark:divide-default-100/80 bg-content1 max-w-[300px] overflow-visible shadow-small rounded-medium"
        itemClasses={{
          base: 'px-3 first:rounded-t-medium last:rounded-b-medium rounded-none gap-3 h-12 data-[hover=true]:bg-default-100/80',
        }}
      >
        {dirs?.map((dir) => (
          <ListboxItem key={dir} className="flex items-center justify-between"></ListboxItem>
        ))}
      </Listbox>
    </div>
  );
}

export default Home;
