## How To Use

### 1. install node modules
After cloning the repo, change current directory to repo's root folder:

RUN: `yarn install` or `npm install`

### 2. add local config file
RUN `cp ./config/default.json ./config/local.json`.


### 3. override local config file
**Contact [admin](mailto:oxddoxdd@gmail.com) to request following information.**

* server host 
* server port
* padlocal token
* server ca certification 

Then fill them into `local.json`.


*`local.json`has been ruled by .gitignore, credentials are safe to store.*


### 4. try the demo
RUN: `yarn run demo` or `npm run demo`
