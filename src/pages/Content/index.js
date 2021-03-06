import { printLine } from './modules/print';

console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

printLine("Using the 'printLine' function from the Print Module");
async function glow(rgb) {
    let device = await openDevice();
    await colorize(device, rgb);
}

async function handleDisconnectClick() {
    let device = await openDevice();
    if (!device) return;
    let acolor = [0, 0, 0]; // off
    await colorize(device, acolor);
    await device.close();
}
async function openDevice() {
    const vendorId = 0x2c0d; // embrava.com
    const productId = 0x0010;  // blynclight standard
    const device_list = await navigator.hid.getDevices();
    let device = device_list.find(d => d.vendorId === vendorId && d.productId === productId);
    if (!device) {
        let devices = await navigator.hid.requestDevice({
            filters: [{ vendorId, productId }],
        });
        console.log("devices:", devices);
        device = devices[0];
        if (!device) return null;
    }
    if (!device.opened) {
        await device.open();
    }
    console.log("device opened:", device);
    return device;
}
async function colorize(device, [r, g, b]) {

    const sound = [0b010001, 0b010010, 0b010011, 0b010100, 0b010101, 0b010110, 0b010111, 0b011000, 0b011001, 0b011010,]

    var random = sound[Math.floor(Math.random() * 11)];

    console.log(random);
    if (!device) return;
    const data = Uint8Array.from([r, b, g, 0b010100, random, 0b000010, 0xFF, 0xFF22]);
    // 4th parameter is light control, 0 is stable, 70 is fast blink?, 100 is medium blink?
    try {
        await device.sendReport(0, data);    //If the HID device does not use report IDs, set reportId to 0.
    } catch (error) {
        console.error(error);
    }
}
// window.addEventListener("click", function (event) {
//     const color = Array.from({ length: 3 }, () => Math.floor(Math.random() * 255));
//     glow(color)
//     // Log the clicked element in the console
//     console.log(color);
// }, false);

window.onmessage = (event) => {

    // if (messageType in event.data && event.data.messageType == "Agent/ChatRequest") {
    //     const color = Array.from({ length: 3 }, () => Math.floor(Math.random() * 255));
    //     glow(color)
    //     console.log("NEW CHAT");
    //     console.log(`Received message: ${JSON.stringify(event.data, null, 2)}`);
    // }
    if (event.data.hasOwnProperty('messageType')) {
        const color = Array.from({ length: 3 }, () => Math.floor(Math.random() * 255));
        glow(color)
        console.log("NEW CHAT);
        console.log(`Received message: ${JSON.stringify(event.data, null, 2)}`);
    }
    else {
        console.log(`Received message: ${JSON.stringify(event.data, null, 2)}`);
    }
};