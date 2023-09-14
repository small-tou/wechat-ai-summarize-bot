import React, { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';
import { Button } from '@nextui-org/button';
import { Listbox, ListboxItem } from '@nextui-org/listbox';
import { Navbar, NavbarBrand } from '@nextui-org/navbar';
import { QRCodeCanvas } from 'qrcode.react';
import {  Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/modal';
import { Input } from '@nextui-org/input';

import toast from 'react-hot-toast';
import { Chip, ModalFooter } from '@nextui-org/react';
import { Header } from '../components/Header';
import { useConfig } from '../hooks/useConfig';

type IChatFile = {
  name: string;
  info?: { chatCount: number; chatMembers: string[]; chatMembersCount: number; chatLetters: number };
  hasSummarized: boolean;
  hasImage: boolean;
  hasAudio: boolean;
};

function Home() {
  const {showConfigModal, setShowConfigModal} = useConfig();
  const [config, setConfig] = useState({
    PADLOCAL_API_KEY: '',
    DIFY_API_KEY: '',
    AZURE_TTS_APPKEY: '',
    AZURE_TTS_REGION: '',
  });
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
    ipcRenderer.on('get-all-dirs-reply', (event, arg) => {
      console.log(arg);
      setDirs(arg);
      if (arg.length&&!selectedDirPath) {
        setSelectedDirPath(arg[0].path);
      }
    });
    setInterval(()=>{
      ipcRenderer.send('get-all-dirs');
    },1000*60)
    ipcRenderer.send('get-all-dirs');
    ipcRenderer.send('start-robot')
    ipcRenderer.on('toast', (event, arg) => {
      console.log('toast', arg)
      toast(arg);
    });
    ipcRenderer.on('scan-wait', (event, arg) => {
      console.log(arg);
      setQrCode(arg);
    });

    ipcRenderer.on('login', (event, arg) => {
      setQrCode(null);
    });
    ipcRenderer.on('login', (event, arg) => {
      setQrCode(null);
    });
    ipcRenderer.on('show-config', (event, arg) => {
      console.log('show-config', arg)
      setShowConfigModal(true);
      setConfig(arg)
    });
    ipcRenderer.on('summarize-end',()=>{
      ipcRenderer.send('get-all-dirs');
    })
  }, []);

  function submitSummarize(dateDir: string, chatFileName: string) {
    ipcRenderer.send('summarize',{
      dateDir,
      chatFileName
    });
  }
  function sendSummarize(dateDir: string, chatFileName: string) {
    ipcRenderer.send('send-summarize',{
      dateDir,
      chatFileName
    });
  }

  return (
    <div style={{padding:'0 20px'}}>
      <Header active={'home'}/>
      {
        dirs.length == 0 ? <div style={{
          display: 'flex',
          justifyContent: 'center',
          height: '100vh',
          width: '100vw',
          alignItems: 'center',
        }}>暂无记录</div> : <div
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
              className='p-0 gap-0 divide-y divide-default-300/50 dark:divide-default-100/80 bg-content1 max-w-[300px] overflow-visible shadow-small '
              itemClasses={{
                base: 'px-3 first:rounded-t-medium last:rounded-b-medium rounded-none gap-3 h-12 data-[hover=true]:bg-default-100/80',
              }}
            >
              {dirs?.map((dir) => (
                <ListboxItem
                  key={dir.path}
                  className='flex items-center justify-between'
                  onClick={() => {
                    setSelectedDirPath(dir.path);
                  }}
                  style={{
                    background:dir.path == selectedDirPath?'#f3f3f3':'none'
                  }}
                  endContent={
                    <div className='flex items-center gap-1 text-default-400'>
                      <span className='text-small'>{dir.chatFiles.length}</span>
                      <svg
                        aria-hidden='true'
                        fill='none'
                        focusable='false'
                        height='1em'
                        role='presentation'
                        stroke='currentColor'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='1.5'
                        viewBox='0 0 24 24'
                        width='1em'
                        className='text-xl'
                      >
                        <path d='m9 18 6-6-6-6' />
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
              className='p-0 gap-0 divide-y divide-default-300/50 dark:divide-default-100/80 bg-content1 max-w-[300px] overflow-visible shadow-small  '
              itemClasses={{
                base: 'px-3 first:rounded-t-medium last:rounded-b-medium rounded-none gap-3 h-12 data-[hover=true]:bg-default-100/80',
              }}
            >
              {selectedDir?.chatFiles.map((dir) => (
                <ListboxItem
                  key={dir.name}
                  className='flex items-center justify-between '
                  style={{
                    borderBottom: '1px solid #f3f3f3',
                  }}
                  endContent={
                    <div className='flex items-center gap-2 text-default-400'>
                      <span
                        className='text-small'
                        style={{
                          fontSize: '12px',
                          color: '#aaa',
                          wordWrap:"normal",
                          wordBreak:'keep-all'
                        }}
                      >
                        {dir.hasSummarized ? '已总结' : null}
                      </span>

                      <Button size='sm' onClick={() => {
                        ipcRenderer.send('show-file',selectedDir.path+'/'+ dir.name)
                      }}>查看</Button>
                      <Button size='sm' onClick={() => {
                        submitSummarize(selectedDir.path, dir.name);
                      }}
                      color={"primary"}>运行</Button>
                      <Button size='sm' onClick={() => {
                        sendSummarize(selectedDir.path, dir.name);
                      }}
                      color={'secondary'}
                      >发送</Button>
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
      }

      <Modal isOpen={!!qrCode} style={{ width: '320px' }}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>请扫码登录</ModalHeader>
              <ModalBody style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '30px',
              }}>
                <QRCodeCanvas value={qrCode} size={200} />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={showConfigModal}  closeButton={false}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>配置</ModalHeader>
              <ModalBody style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '30px',
              }}>
                <p >如何获取配置：<a href={'https://wx.zhinang.ai'} target={"_blank"}>点击查看</a></p>
                <Input required  label={'PADLOCAL_API_KEY'} value={config.PADLOCAL_API_KEY} onChange={(e)=>{
                  setConfig({
                    ...config,
                    PADLOCAL_API_KEY: e.target.value
                  })
                }}/>
                <Input required label={'DIFY_API_KEY'} value={config.DIFY_API_KEY} onChange={(e)=>{
                  setConfig({
                    ...config,
                    DIFY_API_KEY: e.target.value
                  })
                }}/>
                <Input label={'AZURE_TTS_APPKEY'} value={config.AZURE_TTS_APPKEY} onChange={(e)=>{
                  setConfig({
                    ...config,
                    AZURE_TTS_APPKEY: e.target.value
                  })
                }}/>
                <Input label={'AZURE_TTS_REGION'} value={config.AZURE_TTS_REGION} onChange={(e)=>{
                  setConfig({
                    ...config,
                    AZURE_TTS_REGION: e.target.value
                  })
                }}/>
              </ModalBody>
              <ModalFooter>
                <Button onClick={()=>{
                  ipcRenderer.send('save-config', config);
                  setShowConfigModal(false);
                }}>保存</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

export default Home;
