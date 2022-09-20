import { Builder, WebDriver } from 'selenium-webdriver';
import 'selenium-webdriver/chrome';
import 'chromedriver';


// const rootURL = 'http://20.92.184.206:2999/';
const rootURL = 'http://localhost:2999/';
var driver: WebDriver;
jest.setTimeout(30 * 1000);
// jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000 * 60 * 5;

// beforeAll(async () => {
//   driver = await new Builder().forBrowser('chrome').build();
// });

// afterAll(async () => driver.quit());

// it('initialises the context', async () => {
//   await driver.get(rootURL);
// });

// it('should click on navbar button to display a drawer', async () => {
//   const anchor = await querySelector("[href='/en-US/firefox/']", driver);
//   const actual = await anchor.getText();
//   const expected = 'Firefox';
//   expect(actual).toEqual(expected);
// });

test('open rose app', async () => {
    driver = await new Builder().forBrowser('chrome').build();
    await driver.get(rootURL);
    let title = await driver.getTitle();
    const expected = 'Hello GeekReady 2022';
    expect(title).toBe(expected);
    setTimeout(() => {
        driver.quit();
    }, 20 * 1000);
});
