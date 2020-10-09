import {PuppetPadlocal} from "wechaty-puppet-padlocal";
import {Contact, Friendship, Message, Room, RoomInvitation, ScanStatus, Wechaty} from "wechaty";
import * as config from "config";
require('console-stamp')(console);

const host: string = config.get("padLocal.host");
const port: number = config.get("padLocal.port");
const token: string = config.get("padLocal.token");
const serverCAFilePath: string = config.get("padLocal.serverCAFilePath");

const puppet = new PuppetPadlocal({
    endpoint: `${host}:${port}`,
    token,
    serverCAFilePath
})

const bot =  new Wechaty({
    name: "TestBot",
    puppet,
});

type PrepareBotFunc = (bot: Wechaty) => Promise<void>;

async function prepareSingedOnBot(prepareBotFunc?: PrepareBotFunc): Promise<Wechaty> {
    bot.on("scan", (qrcode: string, status: ScanStatus) => {
        if (status === ScanStatus.Waiting && qrcode) {
            const qrcodeImageUrl = ["https://api.qrserver.com/v1/create-qr-code/?data=", encodeURIComponent(qrcode)].join("");
            console.log("TestBot", `onScan: ${ScanStatus[status]}(${status}) - ${qrcodeImageUrl}`);
        } else {
            console.log("TestBot", `onScan: ${ScanStatus[status]}(${status})`);
        }
    });

    bot.on("login", (user: Contact) => {
        console.log("TestBot", `${user} login`);
    });

    bot.on("logout", (user: Contact) => {
        console.log("TestBot", `${user} logout`);
    });

    await bot.start();

    console.log("TestBot", "started.");

    await prepareBotFunc?.(bot);

    await bot.ready();

    console.log("TestBot", "ready.");

    return bot;
}

async function main() {
    await prepareSingedOnBot(async (bot) => {
        bot.on("message", async (message: Message) => {
            console.log("TestBot", `on message: ${message.toString()}`);
        });

        bot.on("friendship", async (friendship: Friendship) => {
            console.log("TestBot", `on friendship: ${friendship.toJSON()}`);
        });

        bot.on("room-invite", async (roomInvite: RoomInvitation) => {
            console.log("TestBot", `on room invite: ${await roomInvite.toJSON()}`);
        });

        bot.on("room-join", async (room: Room, inviteeList: Contact[], inviter: Contact, date) => {
            console.log(
                "TestBot",
                `on room join: ${room.toString()}, ${inviteeList.map((i) => i.toString())}, ${inviter.toString()}, ${date}`
            );
        });

        bot.on("room-leave", async (room: Room, leaverList: Contact[], remover?: Contact, date?: Date) => {
            console.log(
                "TestBot",
                `on room leave: ${room.toString()}, ${leaverList.map((l) => l.toString())}, ${remover?.toString()} ${date}`
            );
        });

        bot.on("room-topic", async (room: Room, newTopic: string, oldTopic: string, changer: Contact, date?: Date) => {
            console.log("TestBot", `on room topic: ${room.toString()}, ${newTopic}, ${oldTopic}, ${changer.toString()}, ${date}`);
        });
    });
}

main().then()
