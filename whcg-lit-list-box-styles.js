
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="whcg-lit-list-box-styles" theme-for="vaadin-list-box">
<template>
    <style>

      [part="items"] ::slotted(*) {
        flex: none;
      }

      [part="items"] ::slotted(vaadin-item) {
        cursor: default;
        outline: none;
        border-radius: var(--whcg-items-slotted-vaadinitem-border-radius);
        padding-left: var(--whcg-items-slotted-vaadinitem-padding-left);
        padding-right: var(--whcg-items-slotted-vaadinitem-padding-right);
        background-color: var(--whcg-items-slotted-vaadinitem-background-color);
      }

      [part="items"] ::slotted(vaadin-item:hover:not([disabled])) {
        background-color: var(--whcg-items-slotted-vaadinitem-hover-not-disabled-background-color);
      }


    </style>
  </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);

