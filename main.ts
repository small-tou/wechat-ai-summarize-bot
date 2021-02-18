import { PuppetPadlocal } from "wechaty-puppet-padlocal";
import { Contact, log, Message, ScanStatus, Wechaty } from "wechaty";

const puppet = new PuppetPadlocal({
    token: "YOUR_PADLOCAL_TOKEN"
})

const bot = new Wechaty({
    name: "TestBot",
    puppet,
})

    .on("scan", (qrcode: string, status: ScanStatus) => {
        if (status === ScanStatus.Waiting && qrcode) {
            const qrcodeImageUrl = [
                'https://wechaty.js.org/qrcode/',
                encodeURIComponent(qrcode),
            ].join('')

            log.info("TestBot", `onScan: ${ScanStatus[status]}(${status}) - ${qrcodeImageUrl}`);

            require('qrcode-terminal').generate(qrcode, { small: true })  // show qrcode on console
        } else {
            log.info("TestBot", `onScan: ${ScanStatus[status]}(${status})`);
        }
    })

    .on("login", (user: Contact) => {
        log.info("TestBot", `${user} login`);
    })

    .on("logout", (user: Contact, reason: string) => {
        log.info("TestBot", `${user} logout, reason: ${reason}`);
    })

    .on("message", async (message: Message) => {
        log.info("TestBot", `on message: ${message.toString()}`);
    })

    .on("error", (error) => {
        log.error("TestBot", 'on error: ', error.stack);
    })


bot.start().then(() => {
    log.info("TestBot", "started.");
});

