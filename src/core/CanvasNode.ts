import { buildPinId } from "./utils";

export interface InputPins {
    [key: string]: string | undefined
}

export interface ConnInfo {
    node: string;
    pin: string;
}

export function connToPinId(c : ConnInfo) {
    return buildPinId(c.node, c.pin);
}

export interface Connection {
    to: ConnInfo;
    from: ConnInfo;
}

export class CanvasNode {
    type: string;
    id: string;
    x: number;
    y: number;
    inputPins: InputPins;
    data?: any;

    constructor(d: any) {
        this.id = d.id;
        this.type = d.type;
        this.x = d.x;
        this.y = d.y;
        this.inputPins = {};
    }
}