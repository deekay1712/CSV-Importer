import { Duplex } from 'stream';

export function bufferToStream(myBuffer) {
    let tmp = new Duplex();
    tmp.push(myBuffer);
    tmp.push(null);
    return tmp;
};
