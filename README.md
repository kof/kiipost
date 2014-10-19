## Kiipost

This project has died on bootstrapping stage. I have opened the source for demonstration purpose as it contains application written using [famo.us](http://famo.us) and maybe you will find the RSS aggregation service and website data extraction similar to [embedly](http://embed.ly) written in node 0.11 using ES6 generators interesting.

## Problem
Its hard to keep track of specific interests. Social networks are full of noise. News websites are too broad.

## Solution
Kiipost is a personal mobile app that keeps people posted on the links they tweet. By analyzing those tweets our app is able to understand the personal interests of each user. The app then searches the web and updates its users with the latest relevant information, enabling them to stay in the know of their topics.

## Build

- Install node: 0.11.x
- Install mongodb: 2.6.2 (optionally)
- Install dependencies: `npm i`
- Write profile mock file to run without real twitter login

```javascript
// some-user.js
module.exports = function(conf) {
    conf.twitter.accessToken = 'xxx'
    conf.twitter.accessTokenSecret = 'xxx'
    conf.twitter.userId = 'xxx'
}
```
- Setup env variables
  - write env file `local`
```bash
# local
export ENV=local
export MONGO_URL=mongodb://127.0.0.1:27019/kiipost
export PORT=3000
export SENTRY_DSN=''
```
  - load variables `source local`
- build `gulp build -p some-user.js`

