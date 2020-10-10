## How To Use

### 1. check node version, need to be $ge than v12.0.0
```
node --version // >= v12.0.0
``` 

### 2. install node modules
After cloning the repo, change current directory to repo's root folder:

RUN: `yarn install` or `npm install`

### 3. add local config file
RUN `cp ./config/default.json ./config/local.json`.


### 4. override local config file
**Contact [admin](mailto:oxddoxdd@gmail.com) to request following information.**

* server host 
* server port
* padlocal token
* server ca certification 

Then fill them into `local.json`.


*`local.json`has been ruled by .gitignore, credentials are safe to store.*


### 5. try the demo
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
