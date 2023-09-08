import * as Buttplug from "buttplug";

export class ButtplugOperator {
    private _client: Buttplug.ButtplugClient = new Buttplug.ButtplugClient(
        "ButtplugOperator"
    );

    private _deviceRefleshedEvents: Array<() => void> = [];

    Devices: {
        Viberators: Buttplug.ButtplugClientDevice[];
        Rotators: Buttplug.ButtplugClientDevice[];
        Linears: Buttplug.ButtplugClientDevice[];
    } = { Viberators: [], Rotators: [], Linears: [] };

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

    async connectToServer(url: string) {
        const connector = new Buttplug.ButtplugBrowserWebsocketClientConnector(
            url
        );
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

        for (const device of this._client.devices) {
            {
                if (device.vibrateAttributes.length > 0) {
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
                } else if (device.messageAttributes.LinearCmd) {
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

    async ConnectDevice() {
        if (this._client.connected) {
            await this._client.startScanning();
        } else {
            console.log("buttplug client is not connected.");
        }
    }
}
