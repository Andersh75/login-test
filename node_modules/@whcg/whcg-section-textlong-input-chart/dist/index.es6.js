import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import '@whcg/whcg-general-styles/grid.js';

class WhcgSectionTextlongInputChart extends PolymerElement {
  static get template() {
    return html`
    <style include = "style-element-grid">

        .section {
            padding-top: 130px;
        }

        .headline {
            padding-top: 32px;
            font-family: var(--parmaco-font-family);
            font-size: var(--parmaco-font-size-xl);
            color: var(--parmaco-base-color-100pct);   
        }
       
        .content {
            grid-template-rows: auto 350px;
        }

        .content-text{
            padding-top: 33px;
            font-family: var(--parmaco-font-family);
            font-size: var(--parmaco-font-size-s);
            font-weight: var(--parmaco-font-weight-normal);
            color: var(--parmaco-base-color-100pct);
        }

        .content-inputbox {
        }

        .content-chart {
            padding-top: 33px;
        }

    </style>

    <div class="grid-12 section">
        <div class="col2span2 headline">
            <slot name="title"></slot>
        </div>

        <div class="col4span8 grid-8 content">
            <div class="col1span8 content-text">
                <slot name="text"></slot>
            </div>
            <div class="col1span3 content-inputbox">
                <slot name="input"></slot>
            </div>
            <div class="col4span5 content-chart">
                <slot name="chart"></slot>
            </div>
        </div>
    </div>
  `;
  }
}

window.customElements.define('whcg-section-textlong-input-chart', WhcgSectionTextlongInputChart);

export { WhcgSectionTextlongInputChart };
