import styles from '../styles/index.module.scss';
import Link from 'next/link';
import { Tooltip } from '@nextui-org/tooltip';
import { useConfig } from '../hooks/useConfig';
import { useEffect } from 'react';
import { ipcRenderer } from 'electron';

export default function Twitter(props: any) {
  return (
    <svg
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      p-id="2009"
      width="20"
      height="20"
      {...props}
    >
      <path
        d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m215.3 337.7c0.3 4.7 0.3 9.6 0.3 14.4 0 146.8-111.8 315.9-316.1 315.9-63 0-121.4-18.3-170.6-49.8 9 1 17.6 1.4 26.8 1.4 52 0 99.8-17.6 137.9-47.4-48.8-1-89.8-33-103.8-77 17.1 2.5 32.5 2.5 50.1-2-50.8-10.3-88.9-55-88.9-109v-1.4c14.7 8.3 32 13.4 50.1 14.1-30.9-20.6-49.5-55.3-49.5-92.4 0-20.7 5.4-39.6 15.1-56 54.7 67.4 136.9 111.4 229 116.1C492 353.1 548.4 292 616.2 292c32 0 60.8 13.4 81.1 35 25.1-4.7 49.1-14.1 70.5-26.7-8.3 25.7-25.7 47.4-48.8 61.1 22.4-2.4 44-8.6 64-17.3-15.1 22.2-34 41.9-55.7 57.6z"
        fill="#1296DB"
        p-id="2010"
      ></path>
    </svg>
  );
}

export function Header(props: { active: string }) {


  return (
    <div className={styles["chat-header"]}>
      <div className={styles["chat-header-inner"]}>
        <div className={styles["chat-header-left"]}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <a
              href="/"
              style={{
                textDecoration: "none",
              }}
            >
              <span

                className={styles["chat-header-title"]}
              >
                微信群聊总结智囊
                <span
                  style={{
                    fontSize: "12px",
                    color: "#444",
                    paddingLeft: "5px",
                  }}
                >
                  zhinang.ai
                </span>
              </span>
            </a>
            <div
              className={[styles["navs"]].join(" ")}
              style={{
                display: "flex",
                gap: "5px",
                alignItems: "center",
                marginLeft: "30px",
              }}
            >
              <Link
                href="#"
                style={{
                  fontSize: "14px",
                  color:
                    props.active == "home"
                      ? "var(--nextui-colors-primaryLightContrast)"
                      : "#111",
                  background:
                    props.active == "home"
                      ? "var(--nextui-colors-primaryLight)"
                      : "none",
                  padding: "7px 15px",
                  borderRadius: "10px",
                  fontWeight: 500,
                }}
                className={styles["navs-link"]}
              >
                群聊
              </Link>
              <Link
                href="https://zhinang.ai"
                target={"_blank"}
                className={styles["navs-link"]}
                style={{
                  fontSize: "14px",
                  color:
                    props.active == "chat"
                      ? "var(--nextui-colors-primaryLightContrast)"
                      : "#111",
                  background:
                    props.active == "chat"
                      ? "var(--nextui-colors-primaryLight)"
                      : "none",
                  padding: "7px 15px",
                  borderRadius: "10px",
                  fontWeight: 500,
                }}
              >
                智囊
              </Link>
              <Link
                href="#"
                style={{
                  fontSize: "14px",
                  color:
                    props.active == "bots"
                      ? "var(--nextui-colors-primaryLightContrast)"
                      : "#111",
                  background:
                    props.active == "bots"
                      ? "var(--nextui-colors-primaryLight)"
                      : "none",
                  padding: "7px 15px",
                  borderRadius: "10px",
                  fontWeight: 500,
                }}
                className={styles["navs-link"]}
                onClick={()=>{
                  ipcRenderer.send('show-config');
                }}
              >
                设置
              </Link>

            </div>
          </div>
        </div>
        <div className={styles["chat-header-right"]}>
          <div className={[styles["header-links"], "hide_in_mobile"].join(" ")}>


            <a href="https://twitter.com/zhinang_ai">
              <Tooltip content="Twitter" color="success" placement="bottom">
                <Twitter />
              </Tooltip>
            </a>
            {/* <a href="https://github.com/GPTNow-im">
              <Tooltip
                content="Github Opensource"
                color="success"
                placement="bottom"
              >
                <Github />
              </Tooltip>
            </a> */}

          </div>
        </div>
      </div>
    </div>
  );
}
