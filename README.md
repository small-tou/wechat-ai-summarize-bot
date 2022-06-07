# Quick Start with Demo
### 0. Apply Token
You need PadLocal token to run this demo. [How to Apply Token](https://github.com/padlocal/wechaty-puppet-padlocal/wiki/How-to-Apply-Token)

### 1. Prepare Node Environment
[Install Node](https://nodejs.org/), 16 LTS version is recommended.
```
$ node --version // >= v16.0.0
``` 
### 2. Clone the [wechaty-puppet-padlocal-demo](https://github.com/padlocal/wechaty-puppet-padlocal-demo) project.

```
$ git clone git@github.com:padlocal/wechaty-puppet-padlocal-demo.git
```
Then install Node dependencies.
```
$ cd wechaty-puppet-padlocal-demo
$ npm install
``` 

### 3. Set you PadLocal Token in [`main.ts`](https://github.com/padlocal/wechaty-puppet-padlocal-demo/blob/master/main.ts)
https://github.com/padlocal/wechaty-puppet-padlocal-demo/blob/42d2ab8dcfeff2b2be1f6b8b2e09d0f5fc0fdc11/main.ts#L10-L12

_[Optional]_ Uncomment following code to turn on debug log
https://github.com/padlocal/wechaty-puppet-padlocal-demo/blob/42d2ab8dcfeff2b2be1f6b8b2e09d0f5fc0fdc11/main.ts#L5-L8


### 4. Run the demo
```
$ npm run demo
```
![carbon](https://user-images.githubusercontent.com/64943823/117439626-a6cde080-af65-11eb-85a5-815aa422b5c5.png)
