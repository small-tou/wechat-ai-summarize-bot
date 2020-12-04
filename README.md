## How To Use

### 1. check node version, need to be $ge than v12.0.0
```
node --version // >= v12.0.0
``` 

### 2. install node modules
After cloning the repo, change current directory to repo's root folder:

RUN: `yarn install` or `npm install`


### 3. apply padlocal token
**Contact [admin](mailto:oxddoxdd@gmail.com) to apply PadLocal token.**

Then replace _YOUR_PADLOCAL_TOKEN_ with granted token in main.ts:
```
const puppet = new PuppetPadlocal({
    token: "YOUR_PADLOCAL_TOKEN"
})
```


### 4. try the demo
RUN: `yarn run demo` or `npm run demo`

```
$ yarn run demo
$ ./node_modules/.bin/ts-node main.ts
[Fri Oct 09 2020 00:00:00] [LOG]    TestBot started.
[Fri Oct 09 2020 00:00:00] [LOG]    TestBot Contact<${YOUR ACCOUNT NICK NAME}> login
[Fri Oct 09 2020 00:00:00] [LOG]    TestBot ready.


# bot is ready, all setup work has been done.
# when new message comes, following logs will be printed.

[Fri Oct 09 2020 00:00:01] [LOG]    TestBot on message: Message#Text ...
```
