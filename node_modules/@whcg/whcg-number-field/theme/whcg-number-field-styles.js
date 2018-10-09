const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="whcg-number-field-styles" theme-for="vaadin-text-field">
  <template>
    <style>

    :host::before {
      font-size: var(--whcg-host-before-font-size);
      height: var(--whcg-host-before-height);
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
    }
    
    :host {        
      font-size: var(--whcg-host-font-size);
      padding-top: var(--whcg-host-padding-top);
      padding-bottom: var(--whcg-host-padding-bottom);
      padding-left: var(--whcg-host-padding-left);
      padding-right: var(--whcg-host-padding-right);
      box-sizing: border-box;
    }

    :host([has-label]) {
      padding-top: var(--whcg-host-haslabel-padding-top);
      padding-bottom: var(--whcg-host-haslabel-padding-bottom);
      padding-left: var(--whcg-host-haslabel-padding-left);
      padding-right: var(--whcg-host-haslabel-padding-right);
    }

    [part="label"] {
      font-weight: var(--whcg-label-font-weight);
      font-size: var(--whcg-label-font-size);
      font-family: var(--whcg-label-font-family);
      line-height: 1;
      color: var(--whcg-label-color);
      align-self: flex-start;
      padding-top: var(--whcg-label-padding-top);
      padding-bottom: var(--whcg-label-padding-bottom);
      padding-right: var(--whcg-label-padding-right);
      padding-left: var(--whcg-label-padding-left);

      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      position: relative;
      max-width: 100%;
      box-sizing: border-box;
    }

    :host(.dark) [part="label"] {
      color: var(--whcg-label-host__dark-color);
    }

    :host([focused]:not([readonly])) [part="label"] {
      color: var(--whcg-label-host-focused-not-readonly-color);
    }

    :host(:hover:not([focused])) [part="label"] {
      color: var(--whcg-label-host-hover-not-focused-color);
    }

    :host([focused]) [part="label"] {
      color: var(--whcg-label-host-focused-color);
    }

    [part="input-field"] {
      font-size: var(--whcg-input-field-font-size);
      font-weight: var(--whcg-input-field-font-weight);
      font-family: var(--whcg-input-field-font-family);
      line-height: 1;
      
      background-color: var(--whcg-input-field-background-color);
      border-radius: var(--whcg-input-field-border-radius);
      border-style: var(--whcg-input-field-border-style);
      border-width: var(--whcg-input-field-border-width);
      border-color: var(--whcg-input-field-border-color);
      padding-top: var(--whcg-input-field-padding-top);
      padding-bottom: var(--whcg-input-field-padding-bottom);
      padding-left: var(--whcg-input-field-padding-left);
      padding-right: var(--whcg-input-field-padding-right);

      position: relative;
      cursor: text;
      box-sizing: border-box;
    }

    :host(.dark) [part="input-field"] {
      background-color: var(--whcg-input-field-host__dark-background-color);
    }
    :host(.shadow) [part="input-field"] {
      box-shadow: var(--whcg-input-field-host__shadow-box-shadow);
    }


    [part="value"] {
      cursor: inherit;
      color: var(--whcg-value-color);
      min-height: var(--whcg-value-min-height);
      padding: 0 0.25em;
    }

    :host(.dark) [part="value"] {
      color: var(--whcg-value-host__dark-color);
    }


    [part="value"]::placeholder {
      color: var(--whcg-value-placeholder-color);;
    }



  </style>
  </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);