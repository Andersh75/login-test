
import '@whcg/whcg-general-styles/font-icons.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="whcg-lit-dropdown-styles" theme-for="vaadin-dropdown-menu">
<template>
    <style>
    [part\$="button"] {
      flex: none;
      width: 1em;
      height: 1em;
      line-height: 1;
      font-size: 
      text-align: center;
      color: var(--whcg-dropdown-button-color);
      cursor: default;
    }

    [part\$="button"]:hover {
      color: var(--whcg-dropdown-button-hover-color);
    }

      [part="toggle-button"]::before {
        content: var(--lumo-icons-dropdown);
        font-family: "lumo-icons";
      }

    </style>
  </template>
</dom-module><dom-module id="whcg-lit-dropdown-menu-text-field" theme-for="vaadin-dropdown-menu-text-field">
  <template>
    <style>
      [part="input-field"] {
        cursor: default;
        outline: none;
        color: var(--whcg-dropdown-input-field-color);
      }
    </style>
  </template>
</dom-module><dom-module id="whcg-lit-dropdown-menu-overlay" theme-for="vaadin-dropdown-menu-overlay">
  <template>
    <style>



    [part="overlay"] {
      background-color: var(--whcg-dropdown-overlay-background-color);
      background-image: var(--whcg-dropdown-overlay-background-image);
      border-radius: var(--whcg-dropdown-overlay-border-radius);
      box-shadow: var(--whcg-dropdown-overlay-box-shadow);
      color: var(--whcg-dropdown-overlay-color);
    }

    [part="content"] {
      padding: var(--whcg-dropdown-content-padding);
    }

    [part="backdrop"] {
      background-color: var(--whcg-dropdown-backdrop-background-color);
      will-change: opacity;
    }



      [part~="overlay"] {
        min-width: var(--vaadin-dropdown-menu-text-field-width);
      }


    </style>
  </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);

