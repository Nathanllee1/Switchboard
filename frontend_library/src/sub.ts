

export class Sub {

    cb:Function;

    constructor() {

    }

    onMessage(cb:Function) {
        this.cb = cb;
    }

    pushMessage(message:any) {
        this.cb(message);
    }
}