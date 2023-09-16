import styles from '../styles/index.module.scss';
import Link from 'next/link';
import { ipcRenderer } from 'electron';
import Github from './icon/Github';
import Twitter from './icon/Twitter';
import { useEffect, useState } from 'react';
import { Chip } from '@nextui-org/react';
import { SuccessIcon } from './icon/SuccessIcon';
import { ErrorIcon } from './icon/ErrorIcon';

export function Header(props: { active: string }) {
  const [botStatus, setBotStatus] = useState('启动中');
  useEffect(() => {
    ipcRenderer.on('bot-status-reply', (event, args) => {
      setBotStatus(args.status);
    });
    setInterval(() => {
      ipcRenderer.send('get-bot-status');
    }, 3000);
  }, []);

  return (
    <div className={styles['chat-header']}>
      <div className={styles['chat-header-inner']}>
        <div className={styles['chat-header-left']}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <a
              href="/"
              style={{
                textDecoration: 'none',
              }}
            >
              <span className={styles['chat-header-title']}>
                智囊 AI
                <span
                  style={{
                    fontSize: '12px',
                    color: '#444',
                    paddingLeft: '5px',
                  }}
                >
                  群聊总结
                </span>
              </span>
            </a>
            <div
              className={[styles['navs']].join(' ')}
              style={{
                display: 'flex',
                gap: '5px',
                alignItems: 'center',
                marginLeft: '30px',
              }}
            >
              <Link
                href="#"
                style={{
                  fontSize: '14px',
                  color: props.active == 'home' ? 'blue' : '#111',
                  background: props.active == 'home' ? '#cee4fe' : 'none',
                  padding: '7px 15px',
                  borderRadius: '10px',
                  fontWeight: 500,
                }}
                className={styles['navs-link']}
              >
                群聊管理
              </Link>
              <Link
                href="#"
                onClick={() => {
                  ipcRenderer.send('open-url', 'https://zhinang.ai');
                }}
                className={styles['navs-link']}
                style={{
                  fontSize: '14px',
                  color: props.active == 'chat' ? 'var(--nextui-colors-primaryLightContrast)' : '#111',
                  background: props.active == 'chat' ? 'var(--nextui-colors-primaryLight)' : 'none',
                  padding: '7px 15px',
                  borderRadius: '10px',
                  fontWeight: 500,
                }}
              >
                智囊 AI 官网（免费 GPT 工具）
              </Link>
              <Link
                href="#"
                style={{
                  fontSize: '14px',
                  color: props.active == 'bots' ? 'var(--nextui-colors-primaryLightContrast)' : '#111',
                  background: props.active == 'bots' ? 'var(--nextui-colors-primaryLight)' : 'none',
                  padding: '7px 15px',
                  borderRadius: '10px',
                  fontWeight: 500,
                }}
                className={styles['navs-link']}
                onClick={() => {
                  ipcRenderer.send('show-config');
                }}
              >
                设置
              </Link>
            </div>
          </div>
        </div>
        <div className={styles['chat-header-right']}>
          <div className={[styles['header-links'], 'hide_in_mobile'].join(' ')}>
            <Chip
              startContent={
                ['错误', '已停止', '已退出'].includes(botStatus) ? <ErrorIcon size={14} /> : <SuccessIcon size={14} />
              }
              variant="flat"
              color={['错误', '已停止', '已退出'].includes(botStatus) ? 'danger' : 'success'}
              style={{
                paddingLeft: '10px',
              }}
            >
              <span
                style={{
                  wordBreak: 'keep-all',
                }}
              >
                {botStatus}
              </span>
            </Chip>
            <a
              onClick={() => {
                ipcRenderer.send('open-url', 'https://twitter.com/aoao_eth');
              }}
            >
              <Twitter />
            </a>
            <a
              onClick={() => {
                ipcRenderer.send('open-url', 'https://github.com/aoao-eth/wechat-ai-summarize-bot');
              }}
            >
              <Github />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
