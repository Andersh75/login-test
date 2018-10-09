import './version.js';
import '@polymer/polymer/lib/elements/custom-style.js';
const styleElementGrid = document.createElement('dom-module');

styleElementGrid.innerHTML = `
  <template><style>
      .col1span1 {
        grid-column: col-start 1 / span 1;
      }

      .col1span2 {
        grid-column: col-start 1 / span 2;
      }

      .col1span3 {
        grid-column: col-start 1 / span 3;
      }

      .col1span4 {
        grid-column: col-start 1 / span 4;
      }

      .col1span5 {
        grid-column: col-start 1 / span 5;
      }

      .col1span6 {
        grid-column: col-start 1 / span 6;
      }

      .col1span7 {
        grid-column: col-start 1 / span 7;
      }


      .col1span8 {
        grid-column: col-start 1 / span 8;
      }

      .col1span9 {
          grid-column: col-start 1 / span 9;
      }

      .col1span10 {
        grid-column: col-start 1 / span 10;
      }


      .col1span11 {
        grid-column: col-start 1 / span 11;
      }

      .col1span12 {
          grid-column: col-start 1 / span 12;
      }

      
      .col2span1 {
        grid-column: col-start 2 / span 1;
      }


      .col2span2 {
        grid-column: col-start 2 / span 2;
      }

      .col2span3 {
        grid-column: col-start 2 / span 3;
      }

      .col2span4 {
        grid-column: col-start 2 / span 4;
      }


      .col2span5 {
        grid-column: col-start 2 / span 5;
      }

      .col2span6 {
        grid-column: col-start 2 / span 6;
      }

      .col2span7 {
        grid-column: col-start 2 / span 7;
      }


      .col2span8 {
        grid-column: col-start 2 / span 8;
      }

      .col2span9 {
        grid-column: col-start 2 / span 9;
      }

      .col2span10 {
        grid-column: col-start 2 / span 10;
      }


      .col2span11 {
        grid-column: col-start 2 / span 11;
      }


      .col3span1 {
        grid-column: col-start 3 / span 1;
      }


      .col3span2 {
        grid-column: col-start 3 / span 2;
      }

      .col3span3 {
        grid-column: col-start 3 / span 3;
      }

      .col3span4 {
        grid-column: col-start 3 / span 4;
      }


      .col3span5 {
        grid-column: col-start 3 / span 5;
      }

      .col3span6 {
        grid-column: col-start 3 / span 6;
      }

      .col3span7 {
        grid-column: col-start 3 / span 7;
      }


      .col3span8 {
        grid-column: col-start 3 / span 8;
      }

      .col3span9 {
        grid-column: col-start 3 / span 9;
      }

      .col3span10 {
        grid-column: col-start 3 / span 10;
      }

      .col4span1 {
        grid-column: col-start 4 / span 1;
      }

      .col4span2 {
        grid-column: col-start 4 / span 2;
      }

      .col4span3 {
        grid-column: col-start 4 / span 3;
      }

      .col4span4 {
        grid-column: col-start 4 / span 4;
      }


      .col4span5 {
        grid-column: col-start 4 / span 5;
      }

      .col4span6 {
        grid-column: col-start 4 / span 6;
      }

      .col4span7 {
        grid-column: col-start 4 / span 7;
      }


      .col4span8 {
        grid-column: col-start 4 / span 8;
      }

      .col4span9 {
        grid-column: col-start 4 / span 9;
      }

      
      .col5span1 {
        grid-column: col-start 5 / span 1;
      }

      .col5span2 {
        grid-column: col-start 5 / span 2;
      }

      .col5span3 {
        grid-column: col-start 5 / span 3;
      }

      .col5span4 {
        grid-column: col-start 5 / span 4;
      }


      .col5span5 {
        grid-column: col-start 5 / span 5;
      }

      .col5span6 {
        grid-column: col-start 5 / span 6;
      }

      .col5span7 {
        grid-column: col-start 5 / span 7;
      }


      .col5span8 {
        grid-column: col-start 5 / span 8;
      }

      .col6span1 {
        grid-column: col-start 6 / span 1;
      }

      .col6span2 {
        grid-column: col-start 6 / span 2;
      }

      .col6span3 {
        grid-column: col-start 6 / span 3;
      }

      .col6span4 {
        grid-column: col-start 6 / span 4;
      }


      .col6span5 {
        grid-column: col-start 6 / span 5;
      }

      .col6span6 {
        grid-column: col-start 6 / span 6;
      }

      .col6span7 {
        grid-column: col-start 6 / span 7;
      }


      .col7span1 {
        grid-column: col-start 7 / span 1;
      }

      .col7span2 {
        grid-column: col-start 7 / span 2;
      }

      .col7span3 {
        grid-column: col-start 7 / span 3;
      }

      .col7span4 {
        grid-column: col-start 7 / span 4;
      }


      .col7span5 {
        grid-column: col-start 7 / span 5;
      }

      .col7span6 {
        grid-column: col-start 7 / span 6;
      }

      .col8span1 {
        grid-column: col-start 8 / span 1;
      }

      .col8span2 {
        grid-column: col-start 8 / span 2;
      }

      .col8span3 {
        grid-column: col-start 8 / span 3;
      }

      .col8span4 {
        grid-column: col-start 8 / span 4;
      }


      .col8span5 {
        grid-column: col-start 8 / span 5;
      }

      .col9span1 {
        grid-column: col-start 9 / span 1;
      }

      .col9span2 {
        grid-column: col-start 9 / span 2;
      }

      .col9span3 {
        grid-column: col-start 9 / span 3;
      }

      .col9span4 {
        grid-column: col-start 9 / span 4;
      }


      .col10span1 {
        grid-column: col-start 10 / span 1;
      }

      .col10span2 {
        grid-column: col-start 10 / span 2;
      }

      .col10span3 {
        grid-column: col-start 10 / span 3;
      }


      .col11span1 {
        grid-column: col-start 11 / span 1;
      }

      .col11span2 {
        grid-column: col-start 11 / span 2;
      }

      .col12span1 {
        grid-column: col-start 12 / span 1;
      }

      .grid-1 {
        display: grid;
        grid-template-columns: repeat(1, [col-start] 1fr);
        grid-gap: 20px;
      }

      .grid-2 {
        display: grid;
        grid-template-columns: repeat(2, [col-start] 1fr);
        grid-gap: 20px;
      }

      .grid-3 {
        display: grid;
        grid-template-columns: repeat(3, [col-start] 1fr);
        grid-gap: 20px;
      }

      .grid-4 {
        display: grid;
        grid-template-columns: repeat(4, [col-start] 1fr);
        grid-gap: 20px;
      }

      .grid-5 {
        display: grid;
        grid-template-columns: repeat(5, [col-start] 1fr);
        grid-gap: 20px;
      }

      .grid-6 {
        display: grid;
        grid-template-columns: repeat(6, [col-start] 1fr);
        grid-gap: 20px;
      }

      .grid-7 {
        display: grid;
        grid-template-columns: repeat(7, [col-start] 1fr);
        grid-gap: 20px;
      }

      .grid-8 {
        display: grid;
        grid-template-columns: repeat(8, [col-start] 1fr);
        grid-gap: 20px;
      }

      .grid-9 {
        display: grid;
        grid-template-columns: repeat(9, [col-start] 1fr);
        grid-gap: 20px;
      }

      .grid-10 {
        display: grid;
        grid-template-columns: repeat(10, [col-start] 1fr);
        grid-gap: 20px;
      }

      .grid-11 {
        display: grid;
        grid-template-columns: repeat(11, [col-start] 1fr);
        grid-gap: 20px;
      }

      .grid-12 {
        display: grid;
        grid-template-columns: repeat(12, [col-start] 1fr);
        grid-gap: 20px;
      }








  </style></template>`;

styleElementGrid.register('style-element-grid');
