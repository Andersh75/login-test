const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="whcg-overlay">
  <template>
    <style>
      :host {
        top: var(--parmaco-space-m);
        right: var(--parmaco-space-m);
        bottom: var(--parmaco-space-m);
        left: var(--parmaco-space-m);
        /* Workaround for Edge issue (only on Surface), where an overflowing vaadin-list-box inside vaadin-dropdown-menu-overlay makes the overlay transparent */
        outline: 1px solid transparent;
      }

      [part="overlay"] {
        background-color: var(--parmaco-base-color);
        background-image: linear-gradient(var(--parmaco-tint-5pct), var(--parmaco-tint-5pct));
        border-radius: var(--parmaco-border-radius);
        box-shadow: 0 0 0 1px var(--whcg-shade-5pct), var(--whcg-box-shadow-m);
        color: var(--parmaco-black-text-color);
        font-family: var(--parmaco-font-family);
        font-size: var(--parmaco-font-size-m);
        font-weight: 400;
        line-height: var(--parmaco-line-height-m);
        letter-spacing: 0;
        text-transform: none;
        -webkit-text-size-adjust: 100%;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      [part="content"] {
        padding: var(--parmaco-space-xs);
      }

      [part="backdrop"] {
        background-color: var(--parmaco-shade-20pct);
¨
        will-change: opacity;
      }

      @keyframes lumo-overlay-backdrop-enter {
        0% {
          opacity: 0;
        }
      }

      :host([closing]) [part="backdrop"] {

      }

      @keyframes lumo-overlay-backdrop-exit {
        100% {
          opacity: 0;
        }
      }

      @keyframes lumo-overlay-dummy-animation {
        0% {
          opacity: 1;
        }
        100% {
          opacity: 1;
        }
      }
    </style>
  </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
