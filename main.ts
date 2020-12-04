import {PuppetPadlocal} from "wechaty-puppet-padlocal";
import {Contact, Message, ScanStatus, Wechaty} from "wechaty";
require('console-stamp')(console);

const puppet = new PuppetPadlocal({
    token: "YOUR_PADLOCAL_TOKEN"
})

const bot = new Wechaty({
    name: "TestBot",
    puppet,
})

.on("scan", (qrcode: string, status: ScanStatus) => {
    if (status === ScanStatus.Waiting && qrcode) {
        const qrcodeImageUrl = ["https://api.qrserver.com/v1/create-qr-code/?data=", encodeURIComponent(qrcode)].join("");
        console.log("TestBot", `onScan: ${ScanStatus[status]}(${status}) - ${qrcodeImageUrl}`);
    } else {
        console.log("TestBot", `onScan: ${ScanStatus[status]}(${status})`);
    }
})

.on("login", (user: Contact) => {
    console.log("TestBot", `${user} login`);
})

.on("logout", (user: Contact, reason: string) => {
    console.log("TestBot", `${user} logout, reason: ${reason}`);
})

.on("message", async (message: Message) => {
    console.log("TestBot", `on message: ${message.toString()}`);
})


bot.start().then(() => {
    console.log("TestBot", "started.");
});

