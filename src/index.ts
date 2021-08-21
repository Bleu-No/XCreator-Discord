import Nav from './navigator';
import { readFileSync } from 'fs';
import { join } from 'path';

const nav = new Nav({
    clearConsole: true,
    emailFile: join(__dirname, '..', 'files', 'email.txt'),
    saveFile: {
        path: join(__dirname, '..', 'files', 'tokens.txt'),
        infos: [ "token" ]
    },
    setBio: 'BleuNo',
    inviteDiscord: ['https://discord.gg/xD4H93g96Y'],
    writeDelay: 30,
    inputDelay: 500,
    closingMenu: 3000,
    windowDelay: 2000,
    useUserAgent: true,
    autoClickCaptcha: true,
    AntiDetection: true
});