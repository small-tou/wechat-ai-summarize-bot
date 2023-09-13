import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ipcRenderer } from 'electron';
import { Button } from '@nextui-org/button';
import { Listbox } from '@nextui-org/listbox';
import { ListboxItem } from '@nextui-org/listbox';
import {
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from '@nextui-org/react';
import toast from 'react-hot-toast';

type IChatFile = {
  name: string;
  info?: { chatCount: number; chatMembers: string[]; chatMembersCount: number; chatLetters: number };
  hasSummarized: boolean;
  hasImage: boolean;
  hasAudio: boolean;
};

function Home() {
  const [qrCode, setQrCode] = useState<string>();
  const [dirs, setDirs] = useState<
    {
      path: string;
      chatFiles: IChatFile[];
      allFiles: string[];
    }[]
  >([]);

  const [selectedDir, setSelectedDir] = useState<{
    path: string;
    chatFiles: IChatFile[];
    allFiles: string[];
  } | null>(null);

  const [selectedDirPath, setSelectedDirPath] = useState<string | null>(null);

  useEffect(() => {
    setSelectedDir(dirs.find((dir) => dir.path === selectedDirPath));
  }, [selectedDirPath]);

  useEffect(() => {
    ipcRenderer.on('get-dir-reply', (event, arg) => {
      console.log(arg);
      setDirs(arg);
      setSelectedDirPath(arg[0].path);
    });
    ipcRenderer.send('get-dir');
    ipcRenderer.on('toast', (event, arg) => {
      toast(arg);
    });
    ipcRenderer.on('scan-wait', (event, arg) => {
      console.log(arg);
      setQrCode(arg);
    });
    ipcRenderer.on('login', (event, arg) => {
      setQrCode(null);
    });
  }, []);

  return (
    <div>
      <Navbar>
        <NavbarBrand>
          <p className="font-bold text-inherit">Weixin Summarize</p>
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem isActive>
            <Link color="foreground" href="#">
              群聊
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="#" aria-current="page">
              监控
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link color="foreground" href="#">
              设置
            </Link>
          </NavbarItem>
        </NavbarContent>
      </Navbar>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          height: '100vh',
        }}
      >
        <div
          style={{
            width: '300px',
            overflowY: 'auto',
            height: '100%',
          }}
        >
          <Listbox
            className="p-0 gap-0 divide-y divide-default-300/50 dark:divide-default-100/80 bg-content1 max-w-[300px] overflow-visible shadow-small "
            itemClasses={{
              base: 'px-3 first:rounded-t-medium last:rounded-b-medium rounded-none gap-3 h-12 data-[hover=true]:bg-default-100/80',
            }}
          >
            {dirs?.map((dir) => (
              <ListboxItem
                key={dir.path}
                className="flex items-center justify-between"
                onClick={() => {
                  setSelectedDirPath(dir.path);
                }}
                endContent={
                  <div className="flex items-center gap-1 text-default-400">
                    <span className="text-small">{dir.chatFiles.length}</span>
                    <svg
                      aria-hidden="true"
                      fill="none"
                      focusable="false"
                      height="1em"
                      role="presentation"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      width="1em"
                      className="text-xl"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </div>
                }
              >
                <div>{dir.path}</div>
              </ListboxItem>
            ))}
          </Listbox>
        </div>
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            height: '100%',
          }}
        >
          <Listbox
            className="p-0 gap-0 divide-y divide-default-300/50 dark:divide-default-100/80 bg-content1 max-w-[300px] overflow-visible shadow-small  "
            itemClasses={{
              base: 'px-3 first:rounded-t-medium last:rounded-b-medium rounded-none gap-3 h-12 data-[hover=true]:bg-default-100/80',
            }}
          >
            {selectedDir?.chatFiles.map((dir) => (
              <ListboxItem
                key={dir.name}
                className="flex items-center justify-between "
                style={{
                  borderBottom: '1px solid #f3f3f3',
                }}
                endContent={
                  <div className="flex items-center gap-2 text-default-400">
                    <span
                      className="text-small"
                      style={{
                        fontSize: '12px',
                        color: '#aaa',
                      }}
                    >
                      {dir.hasSummarized ? '已总结' : null}
                    </span>
                    <Button size="sm">运行</Button>
                  </div>
                }
                description={
                  <div className={'gap-2 flex'} style={{}}>
                    <span
                      style={{
                        fontSize: '12px',
                        color: '#aaa',
                      }}
                      className={'text-slate-100'}
                    >
                      对话数{' '}
                      <span
                        style={{
                          color: '#444',
                        }}
                      >
                        {dir.info?.chatCount}
                      </span>
                    </span>
                    <span
                      style={{
                        fontSize: '12px',
                        color: '#aaa',
                      }}
                      className={'text-slate-100'}
                    >
                      对话人数{' '}
                      <span
                        style={{
                          color: '#444',
                        }}
                      >
                        {dir.info?.chatMembersCount}
                      </span>
                    </span>
                    <span
                      style={{
                        fontSize: '12px',
                        color: '#aaa',
                      }}
                      className={'text-slate-100'}
                    >
                      对话字数{' '}
                      <span
                        style={{
                          color: '#444',
                        }}
                      >
                        {dir.info?.chatLetters}
                      </span>
                    </span>
                  </div>
                }
              >
                <div className={'text-medium'}>{dir.name}</div>
              </ListboxItem>
            ))}
          </Listbox>
        </div>
      </div>
      <Modal isOpen={!!qrCode}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">请扫码登录</ModalHeader>
              <ModalBody>
                <img
                  src={qrCode}
                  style={{
                    width: '300px',
                    height: '300px',
                  }}
                />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

export default Home;
