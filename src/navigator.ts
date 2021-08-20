import { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';

import prompts from 'prompts';
import chalk from 'chalk';
import figlet from 'figlet';
import consola, { Consola } from 'consola';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { AccountInfo, SettingsNavigator, SaveAccountInfo } from './interface';
import { userAgent } from './userAgents';
import { join } from 'path';
import * as Data from './data';

export default class Navigator {

    private browser: Browser;
    private page: Page;
    private logger: Consola = consola;

    private url: string = "https://discord.com/register";
    private emailList: Array<string>;
    private account: AccountInfo;
    private m: Array<string> = ["J", "F","M","A","Ma","Ju","Jul","Au","S","O","N","D"];
    private a: Array<string>  = ["2000", "1990", "1995", "2003", "2002", "2001"]; 

    private windowDelay: number = 2000;
    private inputDelay: number = 2000;
    private writeDelay: number = 100;
    private selectorDelay: number = 500;
    private closingMenu: number = 5000;
    private viewNavigator: boolean = true;
    private emailFile: string;
    private inviteDiscord: string[] = null;
    private saveFile: SaveAccountInfo = null;
    private Avatar: string = null;
    private setBio: string = null;
    private proxy: string = null;
    private autoClickCaptcha: boolean = false;
    private useUserAgent: boolean = false;
    private AntiDetection: boolean = false;
    private setUserAgent: string = null;
    private clearConsole: boolean = false;
    private proxyFile: string = null;
    private theProxy: string = null;
    private closeCmd: boolean = false;
    /*
        */

    constructor(options: SettingsNavigator) {
        if(options.windowDelay) this.windowDelay = options.windowDelay;
        if(options.inputDelay) this.inputDelay = options.inputDelay;
        if(options.writeDelay) this.writeDelay = options.writeDelay;
        if(options.selectorDelay) this.selectorDelay = options.selectorDelay;
        if(options.viewNavigator) this.viewNavigator = options.viewNavigator;
        if(options.emailFile) this.emailFile = options.emailFile;
        if(options.inviteDiscord) this.inviteDiscord = options.inviteDiscord;
        if(options.Avatar) this.Avatar = options.Avatar;
        if(options.setBio) this.setBio = options.setBio;
        if(options.saveFile) this.saveFile = options.saveFile;
        if(options.closingMenu) this.closingMenu = options.closingMenu;
        if(options.proxy) this.proxy = options.proxy;
        if(options.autoClickCaptcha) this.autoClickCaptcha = options.autoClickCaptcha;
        if(options.useUserAgent) this.useUserAgent = options.useUserAgent;
        if(options.AntiDetection) this.AntiDetection = options.AntiDetection;
        if(options.proxyFile) this.proxyFile = options.proxyFile;
        if(options.autoCloseCmd) this.closeCmd = options.autoCloseCmd;

        if(options.clearConsole) this.clearConsole = options.clearConsole;

        if(this.clearConsole) console.clear();

        this.initProxy();

        if(options.autoStart) this.init(); else this.mainConsole();
    }

    async init() {

        await this.plugins();
        await this.loadEmailsFile();
        await this.newBrowsers();

        if(this.proxy || this.proxyFile) this.logger.success('Used proxy: ' + this.theProxy);

        this.listen();

        this.logger.info(Data.message.launch);

        try {
            await this.page.goto(this.url, { waitUntil: 'networkidle0' });
        } catch(e) {
            this.browser.close();
            this.logger.fatal(Data.message.failProxy);
            if(this.closeCmd) process.kill(process.pid, 'SIGTERM'); else process.exit();
            return;
        }

        await this.wait(this.windowDelay);

        this.page.on('request', req => {
            req.
        })

        this.logger.info(Data.message.getInfoAccount);
        this.account = await this.getInfoAccount();
        this.logger.success(`Account info: [ Name: ${this.account.name}, Email: ${this.account.email}, Password: ${this.account.password} ]`);

        await this.creatingAccount();
        await this.wait(this.windowDelay);
        await this.page.keyboard.press("Tab");
        await this.wait(this.selectorDelay);

        await this.selector(this.m[Math.floor(Math.random() * this.m.length)]);
        await this.selector(String(Math.floor(Math.random() * 29) + 1));
        await this.selector(this.a[Math.floor(Math.random() * this.a.length)]);

        await this.wait(this.windowDelay);
        await this.checkBox();
        await this.wait(this.windowDelay);
        await this.clickButton();
        await this.wait(this.windowDelay);
    }

    listen() {
        this.page.on('response', async (res) => {
            const register = Data.URL.register;
            const main = Data.URL.mainGuild;
            const verifyTel = "https://discord.com/api/v9/users/@me/settings";

            if(res.request().method() === "POST" && res.url() == register) {
                const resJson = await res.json();

                if(resJson.message === "Invalid Form Body" && resJson.errors.email) {
                    this.logger.warn(Data.message.invalidEmail);
                    await this.changeEmail();
                    await this.wait(1500);
                    await this.clickButton();
                    return;
                }

                if(resJson.message === "Invalid Form Body" && resJson.errors.username) {
                    this.logger.warn(Data.message.usernameInvalid);
                    await this.changeUsername();
                    await this.wait(1500);
                    await this.clickButton();
                    return;
                }

                if(resJson.message === "Invalid Form Body" && resJson.errors.password) {
                    this.logger.warn(Data.message.passwordInvalid);
                    await this.changePassword();
                    await this.wait(1500);
                    await this.clickButton();
                    return;
                }

                if(resJson.message === "You are being rate limited.") {
                    this.logger.error(Data.message.rateLimit);
                    this.logger.warn('Please wait...');
                    this.rateLimit();
                    return;
                }

                if(resJson.captcha_sitekey) {
                    if(this.autoClickCaptcha) {
                        this.autoClickCaptchaFunc();
                    } else {
                        this.logger.warn(Data.message.resolveCaptcha);
                    }
                    return;
                }
        
                if(resJson.token)
                    return this.finish(resJson.token)
            } else if(res.request().method() === "GET" && res.url() === main) {
                this.logger.info(Data.message.closeMainMenu);
                await this.wait(this.closingMenu);
                await this.closeButtonCreate();
                this.mainMenu();
            } else if(res.request().method() === "PATCH" && res.url() === verifyTel) {
                const resJson = await res.json();

                if(resJson.message && resJson.message === "You need to verify your account in order to perform this action.") {
                    this.browser.close();
                    this.logger.fatal('Account blocked !!');
                    if(this.closeCmd) process.kill(process.pid, 'SIGTERM'); else process.exit();
                }
            }
        });
    }

    async autoClickCaptchaFunc() {
        try {
            this.logger.warn('Bypassing captcha...')
            await this.wait(2000);
            await this.page.waitForSelector('iframe')
            await this.wait(1000);
            await this.page.waitForSelector('.title-jXR8lp.marginBottom8-AtZOdT.base-1x0h_U.size24-RIRrxO')
            await this.page.click('.title-jXR8lp.marginBottom8-AtZOdT.base-1x0h_U.size24-RIRrxO');
            await this.page.keyboard.press("Tab");
            await this.wait(500);
            await this.page.keyboard.press("Enter");
        } catch {
            this.logger.error('Fail to bypass captcha !');
        }
    }

    async skipTuto() {
        return new Promise(async (resolve): Promise<void> => {
            await this.page.click(Data.Button.openInviteGuild);
            await this.wait(500);
            await this.page.click(Data.Button.skipTuto);
            await this.wait(500);
            resolve(0);
        });
    }

    async rateLimit() {
        try {
            await this.wait(30000);
            await this.page.waitForSelector('.button-3k0cO7:not([disabled])');
            await this.wait(500);
            await this.clickButton();
        } catch {
            this.logger.fatal('Fail rate limit !');
            await this.wait(500);
            this.logger.warn('Restarting...');
            await this.wait(1000);
            this.browser.close();
            this.browser.disconnect();
            this.browser = null;
            if(this.clearConsole) console.clear();
            this.init();
        }
    }

    async mainMenu() {
        this.logger.info(Data.message.skipTuto);
        await this.wait(this.inputDelay);
        await this.skipTuto();
        if(this.setBio || this.Avatar) {
            await this.openParams();
            await this.wait(1000);
        }
        if(this.Avatar) {
            this.logger.info(Data.message.setAvatar);
            await this.wait(this.inputDelay);
            await this.setAvatar();
        }
        if(this.setBio) {
            this.logger.info(Data.message.setBio);
            await this.wait(this.inputDelay);
            await this.changeBio();
        }
        if(this.inviteDiscord) {
            this.logger.info(Data.message.joinServer);
            await this.wait(this.inputDelay);
            for await(let inv of this.inviteDiscord) {
                await this.joinGuild(inv);
                await this.wait(1000);
            }
        }
        this.logger.success('FINISH !!');
        await this.wait(3000);
        this.browser.close();
        if(this.closeCmd) process.kill(process.pid, 'SIGTERM'); else process.exit();
    }

    setAvatar() {
        return new Promise(async (resolve): Promise<void> => {
            if(!existsSync(this.Avatar)) {
                this.logger.error(Data.message.failAvatar);
                resolve(0)
                return;
            }
            await this.page.evaluate(() => {
                let tab = <any>document.querySelector('[aria-controls=\'Profile Customization-tab\']');
                tab.click();
            });
            await this.wait(500);
            await this.page.waitForSelector('.fileInput-23-d-3');
            await this.wait(500);
            //await this.page.click('.fileInput-23-d-3')
            //await this.wait(1000);
            const input = await this.page.$('input[type="file"]')
            await input.uploadFile(this.Avatar);
            await this.wait(1500);
            await this.page.evaluate(() => {
                document.querySelectorAll('div').forEach((el) => {
                    if(el.innerHTML === "Apply") {
                        el.click()
                        return
                    }
                });
            });
            await this.wait(500);
            await this.page.waitForSelector(Data.Button.saveParams);
            await this.page.click(Data.Button.saveParams);
            await this.wait(1000);
            resolve(0)
        });
    }

    changeBio() {
       return new Promise(async (resolve): Promise<void> => {
            await this.page.evaluate(() => {
                let tab = <any>document.querySelector('[aria-controls=\'Profile Customization-tab\']');
                tab.click();
            });
            await this.wait(1000);
            let input = await this.page.$(Data.Button.bioBox);
            await input.click({ clickCount: 3 });
            await this.wait(1000);
            await this.page.focus(Data.Button.bioBox);
            await this.page.keyboard.type(this.setBio.toString(), { delay: this.writeDelay });
            await this.wait(1500);
            await this.page.waitForSelector(Data.Button.saveParams);
            await this.page.click(Data.Button.saveParams);
            await this.wait(1500);
            await this.leaveParams();
            await this.wait(1000);
            resolve(0);
       });
    }

    joinGuild(invite: string) {
        return new Promise(async (resolve): Promise<void> => {
            this.logger.warn(`Joining ${invite}...`);
            await this.wait(500);
            await this.page.waitForSelector(Data.Button.openInviteGuild)
            await this.page.click(Data.Button.openInviteGuild);
            await this.wait(500);
            await this.page.waitForSelector(Data.Button.joinButtonGuild)
            await this.page.click(Data.Button.joinButtonGuild);
            await this.wait(500);
            await this.page.waitForSelector(Data.Button.textboxInviteGuild)
            await this.page.focus(Data.Button.textboxInviteGuild);
            await this.page.keyboard.type(invite, { delay: this.writeDelay });
            await this.wait(500);
            await this.page.click(Data.Button.joinButtonBoxGuild);
            await this.wait(500);
            resolve(0)
        });
    }

    async leaveParams() {
        Promise.all([
            await this.page.click(Data.Button.leaveParams)
        ]);
    }

    async openParams() {
        Promise.all([
            await this.page.evaluate(() => {
                let t = <any>document.querySelectorAll('.button-14-BFJ.enabled-2cQ-u7.button-38aScr.lookBlank-3eh9lL.colorBrand-3pXr91.grow-q77ONN')[2];
                t.click();
            })
        ]);
    }

    async closeButtonCreate() {
        try {
            Promise.all([
                await this.page.waitForSelector(Data.Button.closeButtonCreate),
                await this.page.click(Data.Button.closeButtonCreate)
            ]);
        } catch {}
    }

    async changeUsername() {
        this.logger.info(Data.message.modifUsername);
        Promise.all([
            this.account.name = this.randomChars(5, this.account.name),
            await this.writeInput('username', this.account.name, true),
            await this.wait(this.inputDelay),
        ]);
    }

    async changePassword() {
        this.logger.info(Data.message.modifPassword);
        Promise.all([
            this.account.password = this.randomChars(5, this.account.password),
            await this.writeInput('password', this.account.password, true),
            await this.wait(this.inputDelay),
        ]);
    }

    async changeEmail() {
        this.logger.info(Data.message.modifEmail);
        Promise.all([
            this.account.email = this.randomChars(5, this.account.name)+"@gmail.com",
            this.account.name = this.randomChars(5, this.account.name),
            await this.writeInput('email', this.account.email, true),
            await this.wait(this.inputDelay),
            await this.writeInput('username', this.account.name, true),
            await this.wait(this.inputDelay),
        ]);
    }

    async finish(token: string) {
        this.logger.success(Data.message.createdAccount);
        this.logger.success('Token: ' + token);
        await this.saveTokens(token);
    }

    saveTokens(token: string) {
        this.logger.info(Data.message.saveAccount);
        return new Promise(async (resolve): Promise<void> => {
            if(!this.saveFile || this.saveFile.infos.length == 0) return resolve(0);

            if(!existsSync(this.saveFile.path)) {
                try {writeFileSync(this.saveFile.path, '' , { encoding: 'utf8' });} catch {this.logger.error('Error save account !');}
            }

            try {
                let content = readFileSync(this.saveFile.path, { encoding: 'utf8'});
                let data = "";
                if(this.saveFile.infos.includes("all")) {
                    data = `${this.account.email}:${this.account.password}:${this.account.name}:${token}\n`;
                } else if(this.saveFile.infos.includes("token")) {
                    data = `${token}\n`;
                } else {
                    let infos = ["email", "password", "username", "token"];
                    this.saveFile.infos.map((el) => infos.includes(el) ? data += el
                        .replace("password", this.account.password)
                        .replace("email", this.account.email)
                        .replace("username", this.account.name)
                        .replace("token", token) : null );
                    data = data.replace(/:$/g, "");
                    data+="\n";
                }
                writeFileSync(this.saveFile.path, content+=data, { encoding: 'utf8' });
            } catch {
                this.logger.error(Data.message.errorSaveAccount);
                return;
            }

            this.logger.success(Data.message.successSaveAccount);
            resolve(0);
        });
    }

    async clickButton() {
        Promise.all([
            await this.page.evaluate(() => {
                const btn = <any>document.querySelector('.button-3k0cO7');
                btn.click();
            })
        ]);
    }

    async checkBox() {
        Promise.all([
            await this.page.evaluate(() => {
                let els = <any>document.querySelectorAll('*')
                for (let el of els) {
                    if(el.className && el.className.includes && el.className.includes('inputDefault-3JxKJ2')) {
                        el.click();
                    }
                }
            })
        ]);
    }

    async selector(value: string) {
        Promise.all([
            await this.wait(this.selectorDelay),
            await this.page.keyboard.type(value, { delay: 200 }),
            await this.wait(this.selectorDelay),
            await this.page.keyboard.press("Enter")
        ]);
    }

    writeInput(name: string, text: string, clear: boolean = false) {
        return new Promise(async (resolve): Promise<void> => {
            if(clear) { 
                let input = await this.page.$(`[name=${name}]`);
                await input.click({ clickCount: 3 });
                await this.wait(this.inputDelay);
            }
            await this.page.focus(`[name=${name}]`);
            await this.page.keyboard.type(text, { delay: this.writeDelay });
            resolve(0);
        });
    }

    async creatingAccount() {
        this.logger.info(Data.message.createAccount);
        Promise.all([
            await this.writeInput('email', this.account.email),
            await this.wait(this.inputDelay),
            await this.writeInput('username', this.account.name),
            await this.wait(this.inputDelay),
            await this.writeInput('password', this.account.password),
        ]);
    }

    getInfoAccount(): AccountInfo {
        let data: string = this.emailList[Math.floor(Math.random() * this.emailList.length)];
        return {
            email: String(data.split(":")[0]),
            password: String(data.split(":")[1]),
            name: String(data.split("@")[0])
        }
    }

    plugins() {
        this.logger.info(Data.message.loadPlugins);
        Promise.all([ 
            puppeteer.use(StealthPlugin()),
            puppeteer.use(AdblockerPlugin({ blockTrackers: true }))
        ]);
    }

    loadEmailsFile() {
        this.logger.info(Data.message.loadEmail);
        try {
            this.emailList = readFileSync(this.emailFile, { encoding: 'utf8' }).split('\r\n');
        } catch {
            this.logger.fatal('Impossible to find the email file!');
            this.browser.close();
            if(this.closeCmd) process.kill(process.pid, 'SIGTERM'); else process.exit();
        }
    }

    async newBrowsers() {
        this.logger.info(Data.message.createBrowser);
        return new Promise(async (resolve): Promise<void> => {
             if(this.AntiDetection) {
                this.setUserAgent = this.getUserAgent();
                this.browser = await puppeteer.launch(<any>{ headless: this.viewNavigator ? false : true,
                    args:[
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-seccomp-filter-sandbox',
                        'blink-settings=imagesEnabled=true',
                        '--disable-blink-features=AutomationControlled',
                        '--disable-user-media-security',
                        '--allow-http-screen-capture',
                        '--disable-popup-blocking',
                        '--disable-session-crashed-bubble',
                        '--disable-client-side-phishing-detection',
                        '--disable-cast',
                        '--disable-cast-streaming-hw-encoding',
                        this.theProxy ? `--proxy-server=${this.theProxy}` : '',
                        this.useUserAgent ? `user-agent=${this.setUserAgent}` : ''
                    ]
                });
            } else {
                this.browser = await puppeteer.launch(<any>{ headless: this.viewNavigator ? false : true});
            }
            this.page = await this.browser.newPage()
            resolve(0);
        });
    }

    wait(time: number) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }

    randomChars(length: number, text: string) {
        let chars = "azertyuiopqsdfghjklmwxcvbn";
        for(let i = 0; i < length; i++) 
            text += chars.charAt(Math.floor(Math.random() * chars.length));
        return text;
    }

    getUserAgent() {
        return userAgent[Math.floor(Math.random() * userAgent.length)];
    }

    initProxy() {
        if(this.proxy && this.proxy !== "") {
            this.theProxy = this.proxy;
        } else if(this.proxyFile && this.proxyFile.length != 0) {
            if(!existsSync(this.proxyFile)) {
                this.logger.fatal('Invalid file proxy !');
                this.browser.close();
                if(this.closeCmd) process.kill(process.pid, 'SIGTERM'); else process.exit();
                return;
            }
            const proxyList = readFileSync(this.proxyFile, { encoding: 'utf8' }).split("\r\n");
            const proxy = proxyList[Math.floor(Math.random() * proxyList.length)];
            this.proxy = proxy;
            this.theProxy = proxy;
        }
    }

    mainConsole() {
        return new Promise(async (resolve): Promise<void> => {

            figlet('XCreator', 'ANSI Shadow', async (err, data) => {
                if(err) return;
                console.log(chalk.red(data));
                console.log(' ');
                console.log(`${chalk.magenta("[[---->> ")}   ${chalk.blue("By Bleu#7728")}   ${chalk.magenta(" <<----]]")}`);
                console.log(' ');
                console.log(`${chalk.gray("[(---->> ")}   ${chalk.yellow("Settings")}   ${chalk.gray(" <<----)]")}`);

                for(let infox in this.classSettings) {
                    console.log(`[${chalk.redBright('~')}] ${chalk.gray(infox)} !> ${chalk.cyanBright(this.classSettings[infox])}`);
                }

                console.log(' ');

                const response = await prompts({
                    type: 'confirm',
                    name: 'value',
                    message: 'Do you want to continue'
                });

                if(response.value) {
                    if(this.clearConsole) console.clear();
                    return this.init();
                } else {
                    this.browser.close();
                    if(this.closeCmd) process.kill(process.pid, 'SIGTERM'); else process.exit();
                }
            });
        });
    }

    get classSettings(): SettingsNavigator {
        return {
            clearConsole: this.clearConsole,
            windowDelay: this.windowDelay,
            inputDelay: this.inputDelay,
            writeDelay: this.writeDelay,
            selectorDelay: this.selectorDelay,
            closingMenu: this.closingMenu,
            viewNavigator: this.viewNavigator,
            inviteDiscord: this.inviteDiscord,
            Avatar: this.Avatar,
            setBio: this.setBio,
            saveFile: this.saveFile,
            emailFile: this.emailFile,
            proxy: this.proxy,
            proxyFile: this.proxyFile,
            useUserAgent: this.useUserAgent,
            autoClickCaptcha: this.autoClickCaptcha,
            AntiDetection: this.AntiDetection,
            autoCloseCmd: this.closeCmd
        }
    }
}