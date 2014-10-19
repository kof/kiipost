## Kiipost

This project has died on bootstrapping stage. I have opened the source for demonstration purpose as it contains application written using [famo.us](http://famo.us) and maybe you will find the RSS aggration service written in node 0.11 using ES6 generators interesting.

Current app uses mocked http api to work without server.
To run it with predefined user you need to mock the account:

```javascript
// some-user.js
module.exports = function(conf) {
    conf.twitter.accessToken = 'xxx'
    conf.twitter.accessTokenSecret = 'xxx'
    conf.twitter.userId = 'xxx'
}
```

```bash
# Env variables
ENV=local

# Build
gulp build -p some-user.js
```

## Problem
Its hard to keep track of specific interests. Social networks are full of noise. News websites are too broad.

## Solution
Kiipost is a personal mobile app that keeps people posted on the links they tweet. By analyzing those tweets our app is able to understand the personal interests of each user. The app then searches the web and updates its users with the latest relevant information, enabling them to stay in the know of their topics.
