import StoreServiceUtils from './store-service.utils';

export class StoreService {

    private readonly s: StoreServiceUtils = new StoreServiceUtils();

    constructor() {
        this.s.configKey = 'story-teller-3d-config';
        this.s.accountKey = 'story-teller-3d-auth-account';
    }
    
    setConfig(config: any) : void {
        this.s.setConfig(config);
    }

    getConfig() : any {
        return this.s.getConfig();
    }

    setSessionValue(key: string, value: string) {
        this.s.setSessionValue(key, value);
    }

    getSessionValue(key: string): string {
        return this.s.getSessionValue(key);
    }

    removeSessionItem(key: string) {
        this.s.removeSessionItem(key);
    }

    setLocalValue(key: string, value: string) {
        this.s.setLocalValue(key, value);
    }

    getLocalValue(key: string): string {
        return this.s.getLocalValue(key);
    }

    removeLocalItem(key: string) {
        this.s.removeLocalItem(key);
    }

    getValue(key: string, cacheLocation: string) {
        return this.s.getValue(key, cacheLocation);
    }

    setValue(key: string, value: string, cacheLocation: string) {
        this.s.setValue(key, value, cacheLocation);
    }

    removeItem(key: string, cacheLocation: string) {
        this.s.removeItem(key, cacheLocation);
    }

    getAuthAccount(cacheLocation: string): any {
        return this.s.getAuthAccount(cacheLocation);
    }

    setAuthAccount(account: any, cacheLocation: string) {
        this.s.setAuthAccount(account, cacheLocation);
    }

    removeAuthAccount(cacheLocation: string) {
        this.s.removeAuthAccount(cacheLocation);
    }

}
