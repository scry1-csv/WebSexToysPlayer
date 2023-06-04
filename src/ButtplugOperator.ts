declare module Buttplug {
    export function buttplugInit(): Promise<void>;
    export class ButtplugEmbeddedConnectorOptions {
        constructor();
    }
    export class ButtplugClient {
        constructor(clientName?: string);
        get Devices(): ButtplugClientDevice[];
        connect(options: ButtplugEmbeddedConnectorOptions): Promise<void>;
        startScanning(): Promise<void>;
        stopScanning(): Promise<void>;
        addListener(
            eventName: string,
            listener: (...args: any[]) => void
        ): ButtplugClient;
    }

    export class ButtplugClientDevice {
        get Name(): string;
        get Index(): number;
        get AllowedMessages(): ButtplugDeviceMessageType[];
        vibrate(speeds: number): Promise<void>;
        rotate(speeds: number, clockwise: boolean): Promise<void>;
        stop(): Promise<void>;
        batteryLevel(): Promise<number>;
    }

    export enum ButtplugDeviceMessageType {
        VibrateCmd = 0,
        RotateCmd = 1,
        LinearCmd = 2,
        StopDeviceCmd = 3,
        RawReadCmd = 4,
        RawWriteCmd = 5,
        RawSubscribeCmd = 6,
        RawUnsubscribeCmd = 7,
        BatteryLevelCmd = 8,
        RSSILevelCmd = 9,
    }
}

export class ButtplugOperator {
    private _initialized: boolean = false;
    private _connector!: Buttplug.ButtplugEmbeddedConnectorOptions;
    private _client!: Buttplug.ButtplugClient;

    Devices: {
        Viberators: Buttplug.ButtplugClientDevice[];
        Vorze_SA: Buttplug.ButtplugClientDevice[];
    } = { Viberators: [], Vorze_SA: [] };

    constructor() {
        console.log("buttplugOperator constructed.");
    }

    private ParseDeviceList() {
        this.Devices.Vorze_SA.splice(0);
        this.Devices.Viberators.splice(0);

        this._client.Devices.forEach(
            (device: Buttplug.ButtplugClientDevice) => {
                if (device.Name === "Vorze UFO SA") {
                    this.Devices.Vorze_SA.push(device);
                    device.rotate(0.4, true);
                    setTimeout(() => {
                        device.stop();
                    }, 600);
                }
                else if (
                    device.AllowedMessages.includes(
                        Buttplug.ButtplugDeviceMessageType.VibrateCmd
                    )
                ) {
                    this.Devices.Viberators.push(device);
                    device.vibrate(0.5);
                    setTimeout(() => {
                        device.stop();
                    }, 600);
                }
            }
        );

        console.log("Viberators:");
        this.Devices.Viberators.forEach((d) => {
            console.log("  " + d.Name);
        });
        console.log("Vorze_SA:");
        this.Devices.Vorze_SA.forEach((d) => {
            console.log("  " + d.Name);
        });
    }

    SendViberateMsg(power: number) {
        this.Devices.Viberators.forEach((device) => {
            device.vibrate(power);
        });
    }

    SendRotateMsg(power: number, clockwise: boolean) {
        this.Devices.Vorze_SA.forEach((device) => {
            device.rotate(power, clockwise);
        });
    }
    async Initialize() {
        if (!this._initialized) {
            await Buttplug.buttplugInit();
        }

        this._connector = new Buttplug.ButtplugEmbeddedConnectorOptions();
        this._client = new Buttplug.ButtplugClient();

        this._client.addListener("deviceadded", (device) => {
            console.log(`device added: ${device.Name}`);
            this.ParseDeviceList();
        });

        this._client.addListener(
            "deviceremoved",
            async (device: Buttplug.ButtplugClientDevice) => {
                console.log(`device removed: ${device.Name}`);
                this.ParseDeviceList();
            }
        );

        console.log("buttplugOperator try connect...");
        await this._client.connect(this._connector);

        this._initialized = true;
        console.log("buttplugOperator Initialized.");
    }

    async ConnectDevice() {
        if (this._client && this._connector) {
            await this._client.startScanning();
        } else {
            console.log("buttplugOperator connector missing.");
        }
    }
}
