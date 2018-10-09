import { LitElement, html } from '@polymer/lit-element';

export class XRadiogroup extends LitElement {
    static get properties() {
        return {
          selected: {type: String, reflect: true}
        };
      }
    
    render() {
        return html`
            <slot @slotchange=${this.onSlotchange.bind(this)}></slot>
        `
    }

    onCheckedChanged(e) {
        if(e.detail.value) {
            console.log('e');
            console.log(e);
            this.selected = e.path[0].attributes['name'].value;
            console.log('selected');
            console.log(this.selected);
            this.dispatchEvent(new CustomEvent('selected-changed', {
                detail: {
                  selected: this.selected
                }
              }));
            let buttons = this.shadowRoot.querySelector('slot').assignedNodes().filter((node) => { return node.nodeName !== '#text'; });
            buttons.forEach(button => {
                if(button !== e.path[0]) {
                    button.removeAttribute('checked')
                }
            });
        }
    }

    onSlotchange({target}) {
        let buttons = target.assignedNodes();
        buttons.forEach(button => {
            button.addEventListener('checked-changed', this.onCheckedChanged.bind(this))
        })
      }
}

customElements.define('x-radiogroup', XRadiogroup);