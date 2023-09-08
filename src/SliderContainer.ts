import 'toolcool-range-slider';
import { RangeSlider } from 'toolcool-range-slider';


export class SliderContainer extends HTMLElement {
    get range_min(): number {
        return Number(this.slider.value1);
    }

    set range_min(value: number) {
        this.slider.value1 = value;
    }

    get range_max(): number {
        return Number(this.slider.value2);
    }

    set range_max(value: number) {
        this.slider.value2 = value;
    }

    slider: RangeSlider;
    label_range_min: HTMLSpanElement;
    label_range_max: HTMLSpanElement;

    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        const wrapper = document.createElement("div");

        const title = document.createElement("span");
        title.textContent = "移動範囲: "
        wrapper.appendChild(title);

        const min = document.createElement("span");
        min.textContent = "0";
        wrapper.appendChild(min)
        this.label_range_min = min;

        const slider = document.createElement("tc-range-slider") as RangeSlider;
        slider.style.padding = "0 1em";
        slider.style.display = "inline-block";
        wrapper.appendChild(slider);
        this.slider = slider;


        const max = document.createElement("span");
        min.textContent = "100";
        wrapper.appendChild(max)
        this.label_range_max = max;

        this.shadowRoot?.append(wrapper);

        this.slider.addEventListener("change", (e) => {
            this.label_range_min.textContent = String(this.slider.value1)
            this.label_range_max.textContent = String(this.slider.value2);
        })

        this.slider.addEventListener("mouseup", (e) => {
            console.log(`min: ${this.range_min}, max: ${this.range_max}`)
        })
    }

    public InitializeSlider() {
        this.slider.min = 0;
        this.slider.max = 100;
        this.slider.step = 1;
        this.slider.value1 = 0;
        this.slider.value2 = 100;
        this.slider.sliderWidth = "200px";
        this.slider.style.padding = "0 1em";
    }
}