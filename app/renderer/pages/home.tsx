import React, { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';
import { Button } from '@nextui-org/button';
import { Listbox, ListboxItem } from '@nextui-org/listbox';
import { QRCodeCanvas } from 'qrcode.react';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/modal';
import { Input } from '@nextui-org/input';

import toast from 'react-hot-toast';
import { Checkbox, ModalFooter, Select, SelectItem } from '@nextui-org/react';
import { Header } from '../components/Header';
import { useConfig } from '../hooks/useConfig';
import moment from 'moment';
import Chat from '../components/Chat';

type IChatFile = {
  name: string;
  info?: { chatCount: number; chatMembers: string[]; chatMembersCount: number; chatLetters: number };
  hasSummarized: boolean;
  hasImage: boolean;
  hasAudio: boolean;
  sended: boolean;
  send_time: number;
};
/**
 *  中文（吴语，简体）  wuu-CN-XiaotongNeural2（女）
 * wuu-CN-YunzheNeural2（男）
 * yue-CN  中文（粤语，简体）  yue-CN-XiaoMinNeural1，2（女）
 * yue-CN-YunSongNeural1，2（男）
 * zh-CN  中文（普通话，简体）  zh-CN-XiaoxiaoNeural（女）
 * zh-CN-YunxiNeural（男）
 * zh-CN-YunjianNeural（男）
 * zh-CN-XiaoyiNeural（女）
 * zh-CN-YunyangNeural（男）
 * zh-CN-XiaochenNeural（女）
 * zh-CN-XiaohanNeural（女）
 * zh-CN-XiaomengNeural（女）
 * zh-CN-XiaomoNeural（女）
 * zh-CN-XiaoqiuNeural（女）
 * zh-CN-XiaoruiNeural（女）
 * zh-CN-XiaoshuangNeural（女性、儿童）
 * zh-CN-XiaoxuanNeural（女）
 * zh-CN-XiaoyanNeural（女）
 * zh-CN-XiaoyouNeural（女性、儿童）
 * zh-CN-XiaozhenNeural（女）
 * zh-CN-YunfengNeural（男）
 * zh-CN-YunhaoNeural（男）
 * zh-CN-YunxiaNeural（男）
 * zh-CN-YunyeNeural（男）
 * zh-CN-YunzeNeural（男）
 * zh-CN-henan  中文（中原官话河南，简体）  zh-CN-henan-YundengNeural2（男）
 * zh-CN-liaoning  中文（东北官话，简体）  zh-CN-liaoning-XiaobeiNeural1，2（女）
 * zh-CN-shaanxi  中文（中原官话陕西，简体）  zh-CN-shaanxi-XiaoniNeural1，2（女）
 * zh-CN-shandong  中文（冀鲁官话，简体）  zh-CN-shandong-YunxiangNeural2（男）
 * zh-CN-sichuan  中文（西南普通话，简体）  zh-CN-sichuan-YunxiNeural1，2（男）
 * zh-HK  中文(粤语，繁体)  zh-HK-HiuMaanNeural（女）
 * zh-HK-WanLungNeural（男）
 * zh-HK-HiuGaaiNeural（女）
 * zh-TW  中文（台湾普通话，繁体）  zh-TW-HsiaoChenNeural（女）
 * zh-TW-YunJheNeural（男）
 * zh-TW-HsiaoYuNeural（女）
 */
const AZURE_TTS_NAMES = [
  {
    name: '中文（吴语，简体）  wuu-CN-XiaotongNeural2（女）',
    value: 'wuu-CN-XiaotongNeural2',
  },
  {
    name: 'wuu-CN-YunzheNeural2（男）',
    value: 'wuu-CN-YunzheNeural2',
  },
  {
    name: 'yue-CN  中文（粤语，简体）  yue-CN-XiaoMinNeural1，2（女）',
    value: 'yue-CN-XiaoMinNeural1',
  },
  {
    name: 'yue-CN-YunSongNeural1，2（男）',
    value: 'yue-CN-YunSongNeural1',
  },
  {
    name: 'zh-CN  中文（普通话，简体）  zh-CN-XiaoxiaoNeural（女）',
    value: 'zh-CN-XiaoxiaoNeural',
  },
  {
    name: 'zh-CN-YunxiNeural（男）',
    value: 'zh-CN-YunxiNeural',
  },
  {
    name: 'zh-CN-YunjianNeural（男）',
    value: 'zh-CN-YunjianNeural',
  },
  {
    name: 'zh-CN-XiaoyiNeural（女）',
    value: 'zh-CN-XiaoyiNeural',
  },
  {
    name: 'zh-CN-YunyangNeural（男）',
    value: 'zh-CN-YunyangNeural',
  },
  {
    name: 'zh-CN-XiaochenNeural（女）',
    value: 'zh-CN-XiaochenNeural',
  },
  {
    name: 'zh-CN-XiaohanNeural（女）',
    value: 'zh-CN-XiaohanNeural',
  },
  {
    name: 'zh-CN-XiaomengNeural（女）',
    value: 'zh-CN-XiaomengNeural',
  },
  {
    name: 'zh-CN-XiaomoNeural（女）',
    value: 'zh-CN-XiaomoNeural',
  },
  {
    name: 'zh-CN-XiaoqiuNeural（女）',
    value: 'zh-CN-XiaoqiuNeural',
  },
  {
    name: 'zh-CN-XiaoruiNeural（女）',
    value: 'zh-CN-XiaoruiNeural',
  },
  {
    name: 'zh-CN-XiaoshuangNeural（女性、儿童）',
    value: 'zh-CN-XiaoshuangNeural',
  },
  {
    name: 'zh-CN-XiaoxuanNeural（女）',
    value: 'zh-CN-XiaoxuanNeural',
  },
  {
    name: 'zh-CN-XiaoyanNeural（女）',
    value: 'zh-CN-XiaoyanNeural',
  },
  {
    name: 'zh-CN-XiaoyouNeural（女性、儿童）',
    value: 'zh-CN-XiaoyouNeural',
  },
  {
    name: 'zh-CN-XiaozhenNeural（女）',
    value: 'zh-CN-XiaozhenNeural',
  },
  {
    name: 'zh-CN-YunfengNeural（男）',
    value: 'zh-CN-YunfengNeural',
  },
  {
    name: 'zh-CN-YunhaoNeural（男）',
    value: 'zh-CN-YunhaoNeural',
  },
  {
    name: 'zh-CN-YunxiaNeural（男）',
    value: 'zh-CN-YunxiaNeural',
  },
  {
    name: 'zh-CN-YunyeNeural（男）',
    value: 'zh-CN-YunyeNeural',
  },
  {
    name: 'zh-CN-YunzeNeural（男）',
    value: 'zh-CN-YunzeNeural',
  },
  {
    name: 'zh-CN-henan  中文（中原官话河南，简体）  zh-CN-henan-YundengNeural2（男）',
    value: 'zh-CN-henan-YundengNeural2',
  },
  {
    name: 'zh-CN-liaoning  中文（东北官话，简体）  zh-CN-liaoning-XiaobeiNeural1，2（女）',
    value: 'zh-CN-liaoning-XiaobeiNeural1',
  },
  {
    name: 'zh-CN-shaanxi  中文（中原官话陕西，简体）  zh-CN-shaanxi-XiaoniNeural1，2（女）',
    value: 'zh-CN-shaanxi-XiaoniNeural1',
  },
  {
    name: 'zh-CN-shandong  中文（冀鲁官话，简体）  zh-CN-shandong-YunxiangNeural2（男）',
    value: 'zh-CN-shandong-YunxiangNeural2',
  },
  {
    name: 'zh-CN-sichuan  中文（西南普通话，简体）  zh-CN-sichuan-YunxiNeural1，2（男）',
    value: 'zh-CN-sichuan-YunxiNeural1',
  },
  {
    name: 'zh-HK  中文(粤语，繁体)  zh-HK-HiuMaanNeural（女）',
    value: 'zh-HK-HiuMaanNeural',
  },
  {
    name: 'zh-HK-WanLungNeural（男）',
    value: 'zh-HK-WanLungNeural',
  },
  {
    name: 'zh-HK-HiuGaaiNeural（女）',
    value: 'zh-HK-HiuGaaiNeural',
  },
  {
    name: 'zh-TW  中文（台湾普通话，繁体）  zh-TW-HsiaoChenNeural（女）',
    value: 'zh-TW-HsiaoChenNeural',
  },
  {
    name: 'zh-TW-YunJheNeural（男）',
    value: 'zh-TW-YunJheNeural',
  },
  {
    name: 'zh-TW-HsiaoYuNeural（女）',
    value: 'zh-TW-HsiaoYuNeural',
  },
];

function Home() {
  const [chatModal, setChatModal] = useState({
    show: false,
    date: '',
    roomName: '',
  });
  const { showConfigModal, setShowConfigModal } = useConfig();
  const [config, setConfig] = useState({
    PADLOCAL_API_KEY: '',
    DIFY_API_KEY: '',
    AZURE_TTS_APPKEY: '',
    AZURE_TTS_REGION: '',
    CUT_LENGTH: 10000,
    LAST_MESSAGE: '',
    AUTO_ACCEPT_FRIEND: false,
    AZURE_TTS_VOICE_NAME: 'zh-CN-XiaoshuangNeural',
    AZURE_ENDPOINT: '',
    AZURE_API_VERSION: '',
    AZURE_API_KEY: '',
    AZURE_MODEL_ID: 'gpt-3.5-turbo',
    ENABLE_AUTO_REPLY: false,
    AZURE_REPLY_KEYWORDS: 'zhinang 智囊',
    AZURE_REPLY_LIMIT: 10,
  });
  const [qrCode, setQrCode] = useState<string | null>();
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
    setSelectedDir(dirs.find((dir) => dir.path === selectedDirPath)!);
  }, [selectedDirPath]);

  useEffect(() => {
    setSelectedDir(dirs.find((dir) => dir.path === selectedDirPath)!);
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
              {selectedDir
                ? selectedDir!.chatFiles.map((dir) => (
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
                              setChatModal({
                                show: true,
                                date: selectedDir.path,
                                roomName: dir.name,
                              });
                            }}
                            color={'primary'}
                            style={{
                              height: '27px',
                              width: '30px',
                              padding: '0 8px',
                            }}
                          >
                            对话
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              submitSummarize(selectedDir.path, dir.name);
                            }}
                            color={'warning'}
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
                            检查
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
                  ))
                : null}
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
                  alignItems: 'flex-start',
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
                  value={config.LAST_MESSAGE}
                  onChange={(e) => {
                    setConfig({
                      ...config,
                      LAST_MESSAGE: e.target.value,
                    });
                  }}
                />
                {/*<Checkbox*/}
                {/*  checked={config.AUTO_ACCEPT_FRIEND}*/}
                {/*  onChange={(e) => {*/}
                {/*    setConfig({*/}
                {/*      ...config,*/}
                {/*      AUTO_ACCEPT_FRIEND: e.target.checked,*/}
                {/*    });*/}
                {/*  }}*/}
                {/*>*/}
                {/*  自动接受好友请求*/}
                {/*</Checkbox>*/}

                <Checkbox
                  checked={config.ENABLE_AUTO_REPLY}
                  onChange={(e) => {
                    setConfig({
                      ...config,
                      ENABLE_AUTO_REPLY: e.target.checked,
                    });
                  }}
                >
                  开启自动群回复
                </Checkbox>
                {config.ENABLE_AUTO_REPLY ? (
                  <>
                    <Input
                      label={
                        'AZURE_ENDPOINT 用来群内自动回复，例如：https://xxx.openai.azure.com/openai/deployments/xxxxxx'
                      }
                      value={config.AZURE_ENDPOINT}
                      onChange={(e) => {
                        setConfig({
                          ...config,
                          AZURE_ENDPOINT: e.target.value,
                        });
                      }}
                    />

                    <Input
                      label={'AZURE_API_VERSION 用来群内自动回复'}
                      value={config.AZURE_API_VERSION}
                      onChange={(e) => {
                        setConfig({
                          ...config,
                          AZURE_API_VERSION: e.target.value,
                        });
                      }}
                    />

                    <Input
                      label={'AZURE_API_KEY 用来群内自动回复'}
                      value={config.AZURE_API_KEY}
                      onChange={(e) => {
                        setConfig({
                          ...config,
                          AZURE_API_KEY: e.target.value,
                        });
                      }}
                    />

                    <Input
                      label={'AZURE_MODEL_ID 模型名'}
                      value={config.AZURE_MODEL_ID}
                      onChange={(e) => {
                        setConfig({
                          ...config,
                          AZURE_MODEL_ID: e.target.value,
                        });
                      }}
                    />
                    <Input
                      label={'AZURE_REPLY_KEYWORDS 触发回复的关键词，空格隔开'}
                      value={config.AZURE_REPLY_KEYWORDS}
                      onChange={(e) => {
                        setConfig({
                          ...config,
                          AZURE_REPLY_KEYWORDS: e.target.value,
                        });
                      }}
                    />
                    <Input
                      type={'number'}
                      label={'每个群每天可以回应多少次'}
                      value={String(config.AZURE_REPLY_LIMIT)}
                      onChange={(e) => {
                        setConfig({
                          ...config,
                          AZURE_REPLY_LIMIT: Number(e.target.value),
                        });
                      }}
                    />
                  </>
                ) : null}

                <Select
                  label="语音风格"
                  value={config.AZURE_TTS_VOICE_NAME}
                  onChange={(e) => {
                    setConfig({
                      ...config,
                      AZURE_TTS_VOICE_NAME: e.target.value,
                    });
                  }}
                >
                  {AZURE_TTS_NAMES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.name}
                    </SelectItem>
                  ))}
                </Select>
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
      {chatModal.show ? (
        <Modal
          isOpen={true}
          onClose={() => {
            setChatModal({
              show: false,
              roomName: '',
              date: '',
            });
          }}
          size={'3xl'}
          backdrop={'blur'}
        >
          <ModalContent>
            <ModalHeader>{chatModal.roomName} 的实时对话</ModalHeader>
            <Chat date={chatModal.date} roomName={chatModal.roomName} />
          </ModalContent>
        </Modal>
      ) : null}
    </div>
  );
}

export default Home;
