import * as Buttplug from "buttplug";
import { ButtplugWasmClientConnector } from "buttplug-wasm";

export class ButtplugOperator {
    private _client: Buttplug.ButtplugClient = new Buttplug.ButtplugClient();

    private _deviceRefleshedEvents: Array<() => void> = [];

    public UFOTWReverseLR: boolean = false;

    Devices: {
        Viberators: Buttplug.ButtplugClientDevice[];
        Rotators: Buttplug.ButtplugClientDevice[];
        Linears: Buttplug.ButtplugClientDevice[];
        UFOTW: Buttplug.ButtplugClientDevice[];
    } = { Viberators: [], Rotators: [], Linears: [], UFOTW: [] };

    constructor() {
        console.log("buttplugOperator constructed.");

        this._client.addListener(
            "deviceadded",
            async (device: Buttplug.ButtplugClientDevice) => {
                console.log(`device added: ${device.name}`);
                this.ParseDeviceList();
            }
        );

        this._client.addListener(
            "deviceremoved",
            (device: Buttplug.ButtplugClientDevice) => {
                console.log(`device removed: ${device.name}`);
                this.ParseDeviceList();
            }
        );
    }

    async connectWasm(): Promise<boolean> {
        ButtplugWasmClientConnector.activateLogging();
        return this.connect(new ButtplugWasmClientConnector());
    }

    async connectWebsocket(url: string) {
        const connector = new Buttplug.ButtplugBrowserWebsocketClientConnector(
            url
        );
        return this.connect(connector);
    }

    async connect(connector: Buttplug.IButtplugClientConnector) {
        try {
            await this._client.connect(connector);
        } catch (e) {
            console.log(`${e}`);
            if (e instanceof Buttplug.ButtplugError) {
                console.log("this is a buttplug error");
                if (e instanceof Buttplug.ButtplugClientConnectorException) {
                    console.log("This is a connector error");
                } else {
                    console.log("Was another type of error");
                }
            }
            return false;
        }
        return true;
    }

    public AddDevicesRefleshedEvents(event: () => void) {
        this._deviceRefleshedEvents.push(event);
    }

    private ParseDeviceList() {
        this.Devices.Viberators.splice(0);
        this.Devices.Rotators.splice(0);
        this.Devices.Linears.splice(0);
        this.Devices.UFOTW.splice(0);

        for (const device of this._client.devices) {
            {
                if (device.name === 'Vorze UFO TW') {
                    this.Devices.UFOTW.push(device);
                    device.rotate([[0.3, true], [0.3, false]]);
                    setTimeout(() => {
                        device.stop();
                    }, 600);
                }
                else if (device.vibrateAttributes.length > 0) {
                    this.Devices.Viberators.push(device);
                    device.vibrate(0.5);
                    setTimeout(() => {
                        device.stop();
                    }, 600);
                } else if (device.rotateAttributes.length > 0) {
                    this.Devices.Rotators.push(device);
                    device.rotate(0.5, true);
                    setTimeout(() => {
                        device.stop();
                    }, 600);
                } else if (device.linearAttributes.length > 0) {
                    this.Devices.Linears.push(device);
                    device.linear(0, 1000);
                    setTimeout(() => {
                        device.linear(0.5, 1000);
                    }, 1000);
                    setTimeout(() => {
                        device.linear(0, 1000);
                    }, 2000);

                }
            }

            console.log("Viberators:");
            for (const d of this.Devices.Viberators) {
                console.log("  " + d.name);
            }
            console.log("Rotators:");
            for (const d of this.Devices.Rotators) {
                console.log("  " + d.name);
            }
            console.log("Linears:");
            for (const d of this.Devices.Linears) {
                console.log("  " + d.name);
            }
        }

        for (const f of this._deviceRefleshedEvents) {
            f();
        }
    }

    StopAllDevices() {
        for (const d of this.Devices.Viberators) {
            d.stop();
        }
        for (const d of this.Devices.Rotators) {
            d.stop();
        }
        for (const d of this.Devices.Linears) {
            d.stop();
        }
        for (const d of this.Devices.UFOTW) {
            d.stop();
        }
    }

    SendViberateMsg(power: number) {
        this.Devices.Viberators.forEach((device) => {
            device.vibrate(power);
        });
    }

    SendRotateMsg(power: number, clockwise: boolean) {
        this.Devices.Rotators.forEach((device) => {
            device.rotate(power, clockwise);
        });
    }

    SendLinearMsg(position: number, duration: number) {
        this.Devices.Linears.forEach((device) => {
            device.linear(position, duration);
        });
    }

    SendUFOTWMsg(leftPower: number, leftClockwise: boolean, rightPower: number, rightClockwise: boolean) {
        this.Devices.UFOTW.forEach((device) => {
            if (this.UFOTWReverseLR)
                device.rotate([[rightPower, rightClockwise], [leftPower, leftClockwise]]);
            else
                device.rotate([[leftPower, leftClockwise], [rightPower, rightClockwise]]);
        });
    }

    async ConnectDevice() {
        if (this._client.connected) {
            await this._client.startScanning();
        } else {
            console.log("buttplug client is not connected.");
        }
    }
}
