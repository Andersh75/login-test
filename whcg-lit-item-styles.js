
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="whcg-lit-item-styles" theme-for="vaadin-item">
<template>
    <style>
      :host {
        display: flex;
        align-items: center;
        box-sizing: border-box;
        font-size: var(--whcg-host-font-size);
        
        padding: 0.5em 1em;
        min-height: var(--whcg-host-min-height);
      }

      :host([disabled]) {
        cursor: default;
        pointer-events: none;
      }


      :host::before {
        display: block;
        content: var(--whcg-host-before-content);
        font-family: var(--whcg-host-before-font-family);
        font-size: var(--whcg-host-before-font-size);
        line-height: 1;
        font-weight: normal;
        width: 1em;
        height: 1em;
        margin-top: var(--whcg-host-before-margin-top);
        margin-bottom: var(--whcg-host-before-margin-bottom);
        margin-left: var(--whcg-host-before-margin-left);
        margin-right: var(--whcg-host-before-margin-right);
        color: var(--whcg-host-before-color);
        flex: none;
        opacity: 0;
      }

      :host([selected])::before {
        opacity: 1;
      }


      [part="content"] {
        font-family: var(--whcg-content-font-family);
        font-size: var(--whcg-content-font-size);
        line-height: var(--whcg-content-line-height);
        flex: auto;
        color: var(--whcg-content-color);
      }

      :host([selected]) [part="content"] {
        color: var(--whcg-content-host-selected-color);
      }

      :host([disabled]) [part="content"] {
        flex: auto;
        color: var(--whcg-content-host-disabled-color);
      }
    </style>
  </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);

