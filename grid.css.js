import { html } from '@polymer/lit-element';
export const grid = html`<style>
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





      ::slotted(.col1span1) {
        grid-column: col-start 1 / span 1;
      }

      ::slotted(.col1span2) {
        grid-column: col-start 1 / span 2;
      }

      ::slotted(.col1span3) {
        grid-column: col-start 1 / span 3;
      }

      ::slotted(.col1span4) {
        grid-column: col-start 1 / span 4;
      }

      ::slotted(.col1span5) {
        grid-column: col-start 1 / span 5;
      }

      ::slotted(.col1span6) {
        grid-column: col-start 1 / span 6;
      }

      ::slotted(.col1span7) {
        grid-column: col-start 1 / span 7;
      }

      ::slotted(.col1span8) {
        grid-column: col-start 1 / span 8;
      }

      ::slotted(.col1span9) {
          grid-column: col-start 1 / span 9;
      }

      ::slotted(.col1span10) {
        grid-column: col-start 1 / span 10;
      }

      ::slotted(.col1span11) {
        grid-column: col-start 1 / span 11;
      }

      ::slotted(.col1span12) {
          grid-column: col-start 1 / span 12;
      }
      
      ::slotted(.col2span1) {
        grid-column: col-start 2 / span 1;
      }

      ::slotted(.col2span2) {
        grid-column: col-start 2 / span 2;
      }

      ::slotted(.col2span3) {
        grid-column: col-start 2 / span 3;
      }

      ::slotted(.col2span4) {
        grid-column: col-start 2 / span 4;
      }

      ::slotted(.col2span4) {
          grid-column: col-start 2 / span 4;
      }

      ::slotted(.col2span5) {
        grid-column: col-start 2 / span 5;
      }

      ::slotted(.col2span6) {
        grid-column: col-start 2 / span 6;
      }

      ::slotted(.col2span7) {
        grid-column: col-start 2 / span 7;
      }


      ::slotted(.col2span8) {
        grid-column: col-start 2 / span 8;
      }

      ::slotted(.col2span9) {
        grid-column: col-start 2 / span 9;
      }

      ::slotted(.col2span10) {
        grid-column: col-start 2 / span 10;
      }


      ::slotted(.col2span11) {
        grid-column: col-start 2 / span 11;
      }


      ::slotted(.col3span1) {
        grid-column: col-start 3 / span 1;
      }


      ::slotted(.col3span2) {
        grid-column: col-start 3 / span 2;
      }

      ::slotted(.col3span3) {
        grid-column: col-start 3 / span 3;
      }

      ::slotted(.col3span4) {
        grid-column: col-start 3 / span 4;
      }

      ::slotted(.col3span5) {
        grid-column: col-start 3 / span 5;
      }

      ::slotted(.col3span6) {
        grid-column: col-start 3 / span 6;
      }

      ::slotted(.col3span7) {
        grid-column: col-start 3 / span 7;
      }


      ::slotted(.col3span8) {
        grid-column: col-start 3 / span 8;
      }

      ::slotted(.col3span9) {
        grid-column: col-start 3 / span 9;
      }

      ::slotted(.col3span10) {
        grid-column: col-start 3 / span 10;
      }

      ::slotted(.col4span1) {
        grid-column: col-start 4 / span 1;
      }

      ::slotted(.col4span2) {
        grid-column: col-start 4 / span 2;
      }

      ::slotted(.col4span3) {
        grid-column: col-start 4 / span 3;
      }

      ::slotted(.col4span4) {
        grid-column: col-start 4 / span 4;
      }


      ::slotted(.col4span5) {
        grid-column: col-start 4 / span 5;
      }

      ::slotted(.col4span6) {
        grid-column: col-start 4 / span 6;
      }

      ::slotted(.col4span7) {
        grid-column: col-start 4 / span 7;
      }


      ::slotted(.col4span8) {
        grid-column: col-start 4 / span 8;
      }

      ::slotted(.col4span9) {
        grid-column: col-start 4 / span 9;
      }

      
      ::slotted(.col5span1) {
        grid-column: col-start 5 / span 1;
      }

      ::slotted(.col5span2) {
        grid-column: col-start 5 / span 2;
      }

      ::slotted(.col5span3) {
        grid-column: col-start 5 / span 3;
      }

      ::slotted(.col5span4) {
        grid-column: col-start 5 / span 4;
      }


      ::slotted(.col5span5) {
        grid-column: col-start 5 / span 5;
      }

      ::slotted(.col5span6) {
        grid-column: col-start 5 / span 6;
      }

      ::slotted(.col5span7) {
        grid-column: col-start 5 / span 7;
      }


      ::slotted(.col5span8) {
        grid-column: col-start 5 / span 8;
      }

      ::slotted(.col6span1) {
        grid-column: col-start 6 / span 1;
      }

      ::slotted(.col6span2) {
        grid-column: col-start 6 / span 2;
      }

      ::slotted(.col6span3) {
        grid-column: col-start 6 / span 3;
      }

      ::slotted(.col6span4) {
        grid-column: col-start 6 / span 4;
      }


      ::slotted(.col6span5) {
        grid-column: col-start 6 / span 5;
      }

      ::slotted(.col6span6) {
        grid-column: col-start 6 / span 6;
      }

      ::slotted(.col6span7) {
        grid-column: col-start 6 / span 7;
      }


      ::slotted(.col7span1) {
        grid-column: col-start 7 / span 1;
      }

      ::slotted(.col7span2) {
        grid-column: col-start 7 / span 2;
      }

      ::slotted(.col7span3) {
        grid-column: col-start 7 / span 3;
      }

      ::slotted(.col7span4) {
        grid-column: col-start 7 / span 4;
      }


      ::slotted(.col7span5) {
        grid-column: col-start 7 / span 5;
      }

      ::slotted(.col7span6) {
        grid-column: col-start 7 / span 6;
      }

      ::slotted(.col8span1) {
        grid-column: col-start 8 / span 1;
      }

      ::slotted(.col8span2) {
        grid-column: col-start 8 / span 2;
      }

      ::slotted(.col8span3) {
        grid-column: col-start 8 / span 3;
      }

      ::slotted(.col8span4) {
        grid-column: col-start 8 / span 4;
      }


      ::slotted(.col8span5) {
        grid-column: col-start 8 / span 5;
      }

      ::slotted(.col9span1) {
        grid-column: col-start 9 / span 1;
      }

      ::slotted(.col9span2) {
        grid-column: col-start 9 / span 2;
      }

      ::slotted(.col9span3) {
        grid-column: col-start 9 / span 3;
      }

      ::slotted(.col9span4) {
        grid-column: col-start 9 / span 4;
      }


      ::slotted(.col10span1) {
        grid-column: col-start 10 / span 1;
      }

      ::slotted(.col10span2) {
        grid-column: col-start 10 / span 2;
      }

      ::slotted(.col10span3) {
        grid-column: col-start 10 / span 3;
      }


      ::slotted(.col11span1) {
        grid-column: col-start 11 / span 1;
      }

      ::slotted(.col11span2) {
        grid-column: col-start 11 / span 2;
      }

      ::slotted(.col12span1) {
        grid-column: col-start 12 / span 1;
      }

      ::slotted(.grid-1) {
        display: grid;
        grid-template-columns: repeat(1, [col-start] 1fr);
        grid-gap: 20px;
      }

      ::slotted(.grid-2) {
        display: grid;
        grid-template-columns: repeat(2, [col-start] 1fr);
        grid-gap: 20px;
      }

      ::slotted(.grid-3) {
        display: grid;
        grid-template-columns: repeat(3, [col-start] 1fr);
        grid-gap: 20px;
      }

      ::slotted(.grid-4) {
        display: grid;
        grid-template-columns: repeat(4, [col-start] 1fr);
        grid-gap: 20px;
      }

      ::slotted(.grid-5) {
        display: grid;
        grid-template-columns: repeat(5, [col-start] 1fr);
        grid-gap: 20px;
      }

      ::slotted(.grid-6) {
        display: grid;
        grid-template-columns: repeat(6, [col-start] 1fr);
        grid-gap: 20px;
      }

      ::slotted(.grid-7) {
        display: grid;
        grid-template-columns: repeat(7, [col-start] 1fr);
        grid-gap: 20px;
      }

      ::slotted(.grid-8) {
        display: grid;
        grid-template-columns: repeat(8, [col-start] 1fr);
        grid-gap: 20px;
      }

      ::slotted(.grid-9) {
        display: grid;
        grid-template-columns: repeat(9, [col-start] 1fr);
        grid-gap: 20px;
      }

      ::slotted(.grid-10) {
        display: grid;
        grid-template-columns: repeat(10, [col-start] 1fr);
        grid-gap: 20px;
      }

      ::slotted(.grid-11) {
        display: grid;
        grid-template-columns: repeat(11, [col-start] 1fr);
        grid-gap: 20px;
      }

      ::slotted(.grid-12) {
        display: grid;
        grid-template-columns: repeat(12, [col-start] 1fr);
        grid-gap: 20px;
      }


      :host(.col1span1) {
        grid-column: col-start 1 / span 1;
      }

      :host(.col1span2) {
        grid-column: col-start 1 / span 2;
      }

      :host(.col1span3) {
        grid-column: col-start 1 / span 3;
      }

      :host(.col1span4) {
        grid-column: col-start 1 / span 4;
      }

      :host(.col1span5) {
        grid-column: col-start 1 / span 5;
      }

      :host(.col1span6) {
        grid-column: col-start 1 / span 6;
      }

      :host(.col1span7) {
        grid-column: col-start 1 / span 7;
      }

      :host(.col1span8) {
        grid-column: col-start 1 / span 8;
      }

      :host(.col1span9) {
          grid-column: col-start 1 / span 9;
      }

      :host(.col1span10) {
        grid-column: col-start 1 / span 10;
      }

      :host(.col1span11) {
        grid-column: col-start 1 / span 11;
      }

      :host(.col1span12) {
          grid-column: col-start 1 / span 12;
      }
      
      :host(.col2span1) {
        grid-column: col-start 2 / span 1;
      }

      :host(.col2span2) {
        grid-column: col-start 2 / span 2;
      }

      :host(.col2span3) {
        grid-column: col-start 2 / span 3;
      }

      :host(.col2span4) {
        grid-column: col-start 2 / span 4;
      }

      :host(.col2span5) {
        grid-column: col-start 2 / span 5;
      }

      :host(.col2span6) {
        grid-column: col-start 2 / span 6;
      }

      :host(.col2span7) {
        grid-column: col-start 2 / span 7;
      }


      :host(.col2span8) {
        grid-column: col-start 2 / span 8;
      }

      :host(.col2span9) {
        grid-column: col-start 2 / span 9;
      }

      :host(.col2span10) {
        grid-column: col-start 2 / span 10;
      }


      :host(.col2span11) {
        grid-column: col-start 2 / span 11;
      }


      :host(.col3span1) {
        grid-column: col-start 3 / span 1;
      }


      :host(.col3span2) {
        grid-column: col-start 3 / span 2;
      }

      :host(.col3span3) {
        grid-column: col-start 3 / span 3;
      }

      :host(.col3span4) {
        grid-column: col-start 3 / span 4;
      }


      :host(.col3span5) {
        grid-column: col-start 3 / span 5;
      }

      :host(.col3span6) {
        grid-column: col-start 3 / span 6;
      }

      :host(.col3span7) {
        grid-column: col-start 3 / span 7;
      }


      :host(.col3span8) {
        grid-column: col-start 3 / span 8;
      }

      :host(.col3span9) {
        grid-column: col-start 3 / span 9;
      }

      :host(.col3span10) {
        grid-column: col-start 3 / span 10;
      }

      :host(.col4span1) {
        grid-column: col-start 4 / span 1;
      }

      :host(.col4span2) {
        grid-column: col-start 4 / span 2;
      }

      :host(.col4span3) {
        grid-column: col-start 4 / span 3;
      }

      :host(.col4span4) {
        grid-column: col-start 4 / span 4;
      }


      :host(.col4span5) {
        grid-column: col-start 4 / span 5;
      }

      :host(.col4span6) {
        grid-column: col-start 4 / span 6;
      }

      :host(.col4span7) {
        grid-column: col-start 4 / span 7;
      }


      :host(.col4span8) {
        grid-column: col-start 4 / span 8;
      }

      :host(.col4span9) {
        grid-column: col-start 4 / span 9;
      }

      
      :host(.col5span1) {
        grid-column: col-start 5 / span 1;
      }

      :host(.col5span2) {
        grid-column: col-start 5 / span 2;
      }

      :host(.col5span3) {
        grid-column: col-start 5 / span 3;
      }

      :host(.col5span4) {
        grid-column: col-start 5 / span 4;
      }


      :host(.col5span5) {
        grid-column: col-start 5 / span 5;
      }

      :host(.col5span6) {
        grid-column: col-start 5 / span 6;
      }

      :host(.col5span7) {
        grid-column: col-start 5 / span 7;
      }


      :host(.col5span8) {
        grid-column: col-start 5 / span 8;
      }

      :host(.col6span1) {
        grid-column: col-start 6 / span 1;
      }

      :host(.col6span2) {
        grid-column: col-start 6 / span 2;
      }

      :host(.col6span3) {
        grid-column: col-start 6 / span 3;
      }

      :host(.col6span4) {
        grid-column: col-start 6 / span 4;
      }


      :host(.col6span5) {
        grid-column: col-start 6 / span 5;
      }

      :host(.col6span6) {
        grid-column: col-start 6 / span 6;
      }

      :host(.col6span7) {
        grid-column: col-start 6 / span 7;
      }


      :host(.col7span1) {
        grid-column: col-start 7 / span 1;
      }

      :host(.col7span2) {
        grid-column: col-start 7 / span 2;
      }

      :host(.col7span3) {
        grid-column: col-start 7 / span 3;
      }

      :host(.col7span4) {
        grid-column: col-start 7 / span 4;
      }


      :host(.col7span5) {
        grid-column: col-start 7 / span 5;
      }

      :host(.col7span6) {
        grid-column: col-start 7 / span 6;
      }

      :host(.col8span1) {
        grid-column: col-start 8 / span 1;
      }

      :host(.col8span2) {
        grid-column: col-start 8 / span 2;
      }

      :host(.col8span3) {
        grid-column: col-start 8 / span 3;
      }

      :host(.col8span4) {
        grid-column: col-start 8 / span 4;
      }

      :host(.col8span5) {
        grid-column: col-start 8 / span 5;
      }

      :host(.col9span1) {
        grid-column: col-start 9 / span 1;
      }

      :host(.col9span2) {
        grid-column: col-start 9 / span 2;
      }

      :host(.col9span3) {
        grid-column: col-start 9 / span 3;
      }

      :host(.col9span4) {
        grid-column: col-start 9 / span 4;
      }


      :host(.col10span1) {
        grid-column: col-start 10 / span 1;
      }

      :host(.col10span2) {
        grid-column: col-start 10 / span 2;
      }

      :host(.col10span3) {
        grid-column: col-start 10 / span 3;
      }


      :host(.col11span1) {
        grid-column: col-start 11 / span 1;
      }

      :host(.col11span2) {
        grid-column: col-start 11 / span 2;
      }

      :host(.col12span1) {
        grid-column: col-start 12 / span 1;
      }

      :host(.grid-1) {
        display: grid;
        grid-template-columns: repeat(1, [col-start] 1fr);
        grid-gap: 20px;
      }

      :host(.grid-2) {
        display: grid;
        grid-template-columns: repeat(2, [col-start] 1fr);
        grid-gap: 20px;
      }

      :host(.grid-3) {
        display: grid;
        grid-template-columns: repeat(3, [col-start] 1fr);
        grid-gap: 20px;
      }

      :host(.grid-4) {
        display: grid;
        grid-template-columns: repeat(4, [col-start] 1fr);
        grid-gap: 20px;
      }

      :host(.grid-5) {
        display: grid;
        grid-template-columns: repeat(5, [col-start] 1fr);
        grid-gap: 20px;
      }

      :host(.grid-6) {
        display: grid;
        grid-template-columns: repeat(6, [col-start] 1fr);
        grid-gap: 20px;
      }

      :host(.grid-7) {
        display: grid;
        grid-template-columns: repeat(7, [col-start] 1fr);
        grid-gap: 20px;
      }

      :host(.grid-8) {
        display: grid;
        grid-template-columns: repeat(8, [col-start] 1fr);
        grid-gap: 20px;
      }

      :host(.grid-9) {
        display: grid;
        grid-template-columns: repeat(9, [col-start] 1fr);
        grid-gap: 20px;
      }

      :host(.grid-10) {
        display: grid;
        grid-template-columns: repeat(10, [col-start] 1fr);
        grid-gap: 20px;
      }

      :host(.grid-11) {
        display: grid;
        grid-template-columns: repeat(11, [col-start] 1fr);
        grid-gap: 20px;
      }

      :host(.grid-12) {
        display: grid;
        grid-template-columns: repeat(12, [col-start] 1fr);
        grid-gap: 20px;
      }
  </style>`;
