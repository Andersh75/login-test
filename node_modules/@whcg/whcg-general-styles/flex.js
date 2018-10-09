import './version.js';
import '@polymer/polymer/lib/elements/custom-style.js';
const styleElementGrid = document.createElement('dom-module');

styleElementGrid.innerHTML = `
  <template><style>
    .flex {
      display: flex;
    }

    .flex-row {  
      flex-direction: row;
    }

    .flex-column {  
      flex-direction: column;
    }

  </style></template>`;

styleElementGrid.register('style-element-flex');
