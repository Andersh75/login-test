import { html } from '@polymer/lit-element';
export const flex = html`<style>
    .flex {
      display: flex;
    }

    .flex-row {  
      flex-direction: row;
    }

    .flex-column {  
      flex-direction: column;
    }

    ::slotted(.flex) {
      display: flex;
    }

    ::slotted(.flex-row) {  
      flex-direction: row;
    }

    ::slotted(.flex-column) {  
      flex-direction: column;
    }

    :host(.flex) {
      display: flex;
    }

    :host(.flex-row) {  
      flex-direction: row;
    }

    :host(.flex-column) {  
      flex-direction: column;
    }
  </style>`;

