import React, { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';
import { Button } from '@nextui-org/button';
import { Listbox, ListboxItem } from '@nextui-org/listbox';
import { QRCodeCanvas } from 'qrcode.react';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/modal';
import { Input } from '@nextui-org/input';

import toast from 'react-hot-toast';
import { ModalFooter } from '@nextui-org/react';
import { Header } from '../components/Header';
import { useConfig } from '../hooks/useConfig';
import moment from 'moment';

type IChatFile = {
  name: string;
  info?: { chatCount: number; chatMembers: string[]; chatMembersCount: number; chatLetters: number };
  hasSummarized: boolean;
  hasImage: boolean;
  hasAudio: boolean;
  sended: boolean;
  send_time: number;
};

function Home() {
  const { showConfigModal, setShowConfigModal } = useConfig();
  const [config, setConfig] = useState({
    PADLOCAL_API_KEY: '',
    DIFY_API_KEY: '',
    AZURE_TTS_APPKEY: '',
    AZURE_TTS_REGION: '',
    CUT_LENGTH: 10000,
    LAST_MESSAGE: '',
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
    setSelectedDir(dirs.find((dir) => dir.path === selectedDirPath));
  }, [dirs]);

  useEffect(() => {
    ipcRenderer.on('get-all-dirs-reply', (event, arg) => {
      console.log('get-all-dirs-reply', arg);
      setDirs(arg);
      if (arg.length && !selectedDirPath) {
        setSelectedDirPath(arg[0].path);
      } else {
        const _selectedDirPath = selectedDirPath;
        setSelectedDirPath(_selectedDirPath);
        // setSelectedDirPath(selectedDirPath);
        // setSelectedDir(null);
        // setTimeout(() => {
        //   setSelectedDir(dirs.find((dir) => dir.path === selectedDirPath));
        // }, 300);
      }
    });
    setInterval(() => {
      ipcRenderer.send('get-all-dirs');
    }, 1000 * 20);
    ipcRenderer.send('get-all-dirs');
    ipcRenderer.send('start-robot');
    ipcRenderer.on('toast', (event, arg) => {
      console.log('toast', arg);
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
      console.log('show-config', arg);
      setShowConfigModal(true);
      setConfig(arg);
    });
    ipcRenderer.on('summarize-end', () => {
      ipcRenderer.send('get-all-dirs');
    });
  }, []);

  function submitSummarize(dateDir: string, chatFileName: string) {
    ipcRenderer.send('summarize', {
      dateDir,
      chatFileName,
    });
  }

  function sendSummarize(dateDir: string, chatFileName: string) {
    ipcRenderer.send('send-summarize', {
      dateDir,
      chatFileName,
    });
  }

  return (
    <div style={{ padding: '0 20px' }}>
      <Header active={'home'} />
      {dirs.length == 0 ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            height: '100vh',
            width: '100vw',
            alignItems: 'center',
          }}
        >
          暂无记录
        </div>
      ) : (
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
                  style={{
                    background: dir.path == selectedDirPath ? '#f3f3f3' : 'none',
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
                          wordWrap: 'normal',
                          wordBreak: 'keep-all',
                        }}
                      >
                        {dir.hasImage ? '已总结' : null}
                      </span>
                      <span
                        className="text-small"
                        style={{
                          fontSize: '12px',
                          color: '#aaa',
                          wordWrap: 'normal',
                          wordBreak: 'keep-all',
                          lineBreak: 'normal',
                        }}
                      >
                        {dir.sended ? `已发送` : null}
                      </span>
                      <span
                        className="text-small"
                        style={{
                          fontSize: '12px',
                          color: '#aaa',
                          wordWrap: 'normal',
                          wordBreak: 'keep-all',
                          lineBreak: 'normal',
                        }}
                      >
                        {dir.send_time ? `(${moment(dir.send_time).format('HH:mm')})` : null}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => {
                          submitSummarize(selectedDir.path, dir.name);
                        }}
                        color={'primary'}
                        style={{
                          height: '27px',
                          width: '30px',
                          padding: '0 8px',
                        }}
                      >
                        总结
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          ipcRenderer.send('show-file', selectedDir.path + '/' + dir.name);
                        }}
                        isDisabled={!dir.hasImage}
                        style={{
                          height: '27px',
                          width: '30px',
                        }}
                      >
                        查看
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => {
                          sendSummarize(selectedDir.path, dir.name);
                        }}
                        isDisabled={!dir.hasImage}
                        color={'secondary'}
                        style={{
                          height: '27px',
                          width: '30px',
                        }}
                      >
                        发送
                      </Button>
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
      )}

      <Modal
        isOpen={!!qrCode}
        style={{ width: '320px' }}
        backdrop={'blur'}
        onClose={() => {
          setQrCode(null);
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">请扫码登录</ModalHeader>
              <ModalBody
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: '30px',
                }}
              >
                <QRCodeCanvas value={qrCode} size={200} />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={showConfigModal} hideCloseButton={true} backdrop={'blur'}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 " style={{ justifyContent: 'center' }}>
                配置
              </ModalHeader>
              <ModalBody
                style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  marginBottom: '30px',
                }}
              >
                <p style={{ fontSize: '12px' }}>
                  必须正确配置才能正常运行，关于如何获取这些配置：
                  <a
                    href={'#'}
                    onClick={() => {
                      ipcRenderer.send('open-url', 'https://github.com/aoao-eth/wechat-ai-summarize-bot');
                    }}
                    style={{
                      color: 'blue',
                    }}
                  >
                    点击查看
                  </a>
                </p>
                <Input
                  required
                  label={'PADLOCAL token'}
                  value={config.PADLOCAL_API_KEY}
                  onChange={(e) => {
                    setConfig({
                      ...config,
                      PADLOCAL_API_KEY: e.target.value,
                    });
                  }}
                />
                <Input
                  required
                  label={'DIFY apikey'}
                  value={config.DIFY_API_KEY}
                  onChange={(e) => {
                    setConfig({
                      ...config,
                      DIFY_API_KEY: e.target.value,
                    });
                  }}
                />
                <Input
                  label={'AZURE_TTS_APPKEY'}
                  value={config.AZURE_TTS_APPKEY}
                  onChange={(e) => {
                    setConfig({
                      ...config,
                      AZURE_TTS_APPKEY: e.target.value,
                    });
                  }}
                />
                <Input
                  label={'AZURE_TTS_REGION'}
                  value={config.AZURE_TTS_REGION}
                  onChange={(e) => {
                    setConfig({
                      ...config,
                      AZURE_TTS_REGION: e.target.value,
                    });
                  }}
                />
                <Input
                  label={'每次总结截取的字数，视您使用的模型而定'}
                  type={'number'}
                  value={String(config.CUT_LENGTH || 10000)}
                  onChange={(e) => {
                    setConfig({
                      ...config,
                      CUT_LENGTH: Number(e.target.value),
                    });
                  }}
                />
                <Input
                  label={'发送群聊后的文字'}
                  value={
                    config.LAST_MESSAGE ||
                    '主人们，智囊 AI 为您奉上今日群聊总结，祝您用餐愉快！由开源项目 wx.zhinang.ai 生成'
                  }
                  onChange={(e) => {
                    setConfig({
                      ...config,
                      LAST_MESSAGE: e.target.value,
                    });
                  }}
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  onClick={() => {
                    ipcRenderer.send('save-config', config);
                    setShowConfigModal(false);
                  }}
                  color={'primary'}
                >
                  保存
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

export default Home;
