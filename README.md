# XCreator-Discord

- [x] Email list
- [x] Option delay
- [x] Password error
- [x] email error
- [x] Captcha manuel
- [x] auto give token
- [x] rate limit
- [x] use proxy
- [x] Auto captcha Click
- [x] auto join server
- [x] change avatar
- [x] change bio
- [x] save token in file
- [x] getProxyRandom
- [x] joinMultipleServer
- [ ] randomDelayWrite
- [x] Fix error Params

Voilà un petit script pour créer pleins  de compte discord gratuitement et sans api ou autre.

Ce script a été codé en **TypeScript**, du coup si vous voulez l'utiliser, vous allez d'abord devoir installer tous les modules puis de build en **JavaScript** ou de l'éxecuter avec une petite ligne

<h1>Pour installer  les modules</h1>
```
yarn
```

Avec **Npm**
```
npm i
```

<h1>Pour le lancer</h1>

Si vous avez installé **Yarn**
```
yarn start
```

Avec **Npm**
```
npm start
```

<h1>Pour le build</h1>

Si vous avez installé **Yarn**
```
yarn build
```

Avec **Npm**
```
npm run build
```

**Si vous voulez changer les email/mot de passe, vous devez faire ça:**
```
email:mdp
```

**Vous pouvez aussi modifier les paramètres dans le index.ts dans le dossier src:**
```javascript
clearConsole: true, //Permet que quand vous lancez le script, ça clear la console
emailFile: '...', //Chemin d'accès avec la list d'email et de mot de passe
saveFile: {
  path: '...', //Chemin d'accès pour sauvegarder les données
  infos: [ "token" ou "all" ] //Vous pouvez modifier par all pour tout sauvegarder
},
proxy: '...', //Vous pouvez mettre juste un proxy
proxyFile: '...', //Vous permet de mettre votre list de proxy (Chemin d'accès du fichier)
setBio: 'BleuNo', //Permet de définir une Bio
Avatar: '...', //Permet de mettre un Avatar au compte (Chemin d'accès du fichier)
inviteDiscord: ['https://discord.gg/xD4H93g96Y'],
writeDelay: 30, //Temps d'écriture
inputDelay: 500, //Temps entre chaque input
closingMenu: 3000, //Temps pour fermer le menu de démarrage
windowDelay: 2000, //Temps avant que le bot commance à créer le compte
useUserAgent: true, //Si vous voulez utiliser un User-Agent
autoClickCaptcha: true, //Si vous voulez que le bot fasse le captcha (Il peut ne pas réussir)
AntiDetection: true, //Si vous voulez être moins détecter par Discord
autoStart: true, //Pour lancer automatiquement le bot
autoCloseCmd: true //Pour fermer la console quand le bot a terminé
```
