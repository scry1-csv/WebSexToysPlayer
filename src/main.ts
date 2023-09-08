import { Controller } from "./Controller"

import { SliderContainer } from "./SliderContainer";
customElements.define("slider-container", SliderContainer);

let c: Controller;

async function main() {
    console.log("main loaded.");

    c = new Controller();
}

window.onload = main;
