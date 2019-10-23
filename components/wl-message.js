import {html, render} from '../lit-html/lit-html.js';

export class WlMessage extends HTMLElement
{
    get template() {
        return (text, type) => html`
            <div class='panel panel-${type}'>
               <div class='panel-body'>${type}: ${text}</div>
            </div>`;
    }

    connectedCallback() {
        let type = this.getAttribute('type');
        if(!type || (type !== 'primary' && type !== 'success' && type !== 'info' && type !== 'warning' && type !== 'danger')) {
            type  ='info';
        }
        let text = this.getAttribute('text');
        render(this.template(text, type), this);
        setTimeout(() => this.parentElement.removeChild(this), 3000);
        
    }
}
customElements.define("wl-message", WlMessage);