const { Builder } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
jest.setTimeout(60 * 1000);
let opts = new chrome.Options();
opts.setAcceptInsecureCerts(true);
// opts.setBrowserVersion('93');
// opts.setPlatform('Windows 10');
let capabilities = {
    enableVNC: true
}
console.log(process.env.TEST_ENV);
const $path = `../../public/assets/config/func-test-config${process.env.TEST_ENV === 'CI' ? '' : '.local'}.json`;
let cfg = require($path);
console.log(cfg);

test('Open rose app', async () => {
    let driver = await new Builder()
        .usingServer(cfg.remoteServerUrl)
        .withCapabilities(capabilities)
        .forBrowser('chrome')
        .setChromeOptions(opts)
        .build();
    try {
        await driver.get(cfg.appUrl)
    }
    finally {
        setTimeout(async () => {
            await driver.quit();
        }, 20 * 1000);
    }
});

