import { ChatContainer, ChatInput, ChatProvider, createClient, MessageList, MessageLoading } from 'uikit.chat';
import styles from '../styles/ChatGPT.module.scss';
import { useEffect } from 'react';
import { ipcRenderer } from 'electron';


export default function Chat(props: {
  date: string;
  roomName: string;
}) {
  const chatuiClient = createClient();
  chatuiClient.chatboxStore.on('submit', (message) => {
    ipcRenderer.send('send-chat-content', {
      roomName: props.roomName.replace('.txt', ''),
      content: message,
    });
  });

  useEffect(() => {
    chatuiClient.messageStore.clear();
    ipcRenderer.send('get-chat-content', {
      date: props.date,
      roomName: props.roomName,
    });
    const timer = setInterval(() => {
      ipcRenderer.send('get-chat-content', {
        date: props.date,
        roomName: props.roomName,
      });
    }, 1000);
    ipcRenderer.on('chat-content-replay', (event, args) => {
      console.log('chat-replay', args);
      if (args.date == props.date && args.roomName == props.roomName) {
        args.chats.forEach((chat) => {
          chatuiClient.messageStore.addMessageDirect({
            id: chat.name + chat.content + chat.time,
            role: 'assistant',
            content: chat.content,
            external: {
              userName: chat.name,
              time: chat.time,
            },
            typing: false,
            timestamp: (new Date(chat.time)).getTime(),
          });
        });
        chatuiClient.messageStore.emit('change');
      } else {
      }

    });
    return () => {
      timer && clearInterval(timer);
      ipcRenderer.removeAllListeners('chat-content-replay');
    };
  }, []);
  return <ChatProvider client={chatuiClient!}>
    <div className={styles['chatgpt-container']}>
      <div className={styles['chatgpt-container-inner']}>
        <ChatContainer>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
            }}
          >
            <MessageList
              header={(message) => {
                return <div className={styles['chatgpt-ui-message-header']}>
                  <div className={styles['chatgpt-ui-message-header-name']}>
                    {message.external.userName}：
                  </div>

                </div>;
              }}

              content={(message) => {
                return <>
                  <div
                    className={[
                      styles['chatgpt-ui-message'],
                      message.typingStatus == 'typing'
                        ? styles['chatgpt-ui-message-typing']
                        : '',
                    ].join(' ')}
                  >

                    <div
                      dangerouslySetInnerHTML={{
                        __html: message.formatedContent || '',
                      }}
                    ></div>
                  </div>
                </>;
              }}
            >
              <MessageLoading></MessageLoading>
            </MessageList>
            <ChatInput />
          </div>
        </ChatContainer>
      </div>
    </div>
  </ChatProvider>;
}