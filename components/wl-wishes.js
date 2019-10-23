import {html, render} from '../lit-html/lit-html.js';
import { WlElement } from './wl-element.js';
import { RestService } from '../services/rest.service.js';

export class WlWishes extends WlElement {

    get template() {
        return (editWish = null) => {
            return html`
<div class="panel panel-default">
    <div class="panel-heading">Was wünschst du dir?</div>
    <div class="panel-body">
        <table class="table table-hover">
            <thead>
                <tr>
                    <td>Beschreibung</td>
                    <td>URL (Optional)</td>
                    <td></td>
                </tr>
            </thead>
            <tbody>
                ${this.wishes.map((wish, i) => html`
                <tr .wish=${wish}>
                    <td>
                        ${editWish && editWish === wish
                            ? html`<input type='text' placeholder='Beschreibung' style='width:100%' value='${wish.w_descr}' />`
                            : wish.w_descr
                        }
                    </td>
                    <td>
                        ${editWish && editWish === wish
                            ? html`<input type='text' placeholder='URL (Optional)' style='width:100%' value='${wish.w_link}' />`
                            : html`<a target="_blank" href="${wish.w_link}">${wish.w_link}</a>`
                        }
                    </td>
                    <td>
                        ${editWish && editWish === wish
                            ? html`
                                <button @click=${() => this.clickedSave(i, wish)} class="btn btn-default">
                                    <span class="glyphicon glyphicon-floppy-saved" aria-hidden="true"></span>
                                </button>
                                <button @click=${() => this.clickedReset()} class="btn btn-default">
                                    <span class="glyphicon glyphicon-floppy-remove" aria-hidden="true"></span>
                                </button>`
                            : html`
                                <button @click=${() => this.clickedEdit(wish)} class="btn btn-default" ?disabled=${editWish}>
                                    <span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>
                                </button>
                                <!--<button @click=${() => this.clickedReset()} class="btn btn-default" ?disabled=${editWish}>
                                    <span class="glyphicon glyphicon-trash" aria-hidden="true"></span>
                                </button>-->`
                        }
                    </td>
                </tr>
                `)}
                <tr class="no-hover">
                    <td>
                        ${editWish
                            ? ''
                            : html`
                                <button @click=${() => this.clickedAddNew()} class="btn btn-default" ?disabled=${editWish}>
                                    <span class="glyphicon glyphicon-plus" aria-hidden="true"></span>
                                </button>`}
                        ${this.equalsEmptyObject(editWish)
                            ? html`<input type='text' placeholder='Beschreibung' style='width:100%' />`
                            : ''
                        }
                    </td>
                    <td>
                        ${this.equalsEmptyObject(editWish)
                            ? html`<input type='text' placeholder='URL (Optional)' style='width:100%' />`
                            : ''
                        }
                    </td>
                    <td>
                        ${this.equalsEmptyObject(editWish)
                            ? html`
                                <button @click=${() => this.clickedReset()} class="btn btn-default">
                                    <span class="glyphicon glyphicon-trash" aria-hidden="true"></span>
                                </button>
                                <button @click=${() => this.clickedSave()} class="btn btn-default">
                                    <span class="glyphicon glyphicon-ok" aria-hidden="true"></span>
                                </button>`
                            : ''}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
        `};
    }

    equalsEmptyObject(obj) {
        return obj && Object.entries(obj).length===0;
    }

    connectedCallback() {

        const currentUser = this.wlApp.currentUser;

        if(currentUser == null) {
            document.getElementsByTagName('wl-app')[0].connectedCallback(); // TODO: test
        } else {
            RestService.readWishes(currentUser.id)
            .then(json => {
                this.wishes = json;
                render(this.template(), this);
            });
            /*RestService.readPresents(currentUser.id, false)
            .then(
                presents => {
                    this.acceptedWishIds = presents.content.map(present => present.p_wish).filter(wishId => wishId >= 0)
            });*/ // TODO: validate this when click on delete, not before
        }
    }

    clickedReset()
    {
        render(this.template(), this);
    }

    clickedEdit(wish)
    {
        render(this.template(wish), this);
    }

    clickedAddNew()
    {
        render(this.template({}), this);
    }

    clickedSave(i = -1, wish = null)
    {
        const tr = this.querySelector(wish && i >= 0
            ? 'tbody tr:nth-child(' + i + ')'
            : 'tbody tr:last-child');
        let wishToSave = {
            "w_descr": tr.querySelector('td:nth-child(1) input').value,
            "w_link": tr.querySelector('td:nth-child(2) input').value,
            "w_user": this.wlApp.currentUser.id
        };
        if(wish && i >= 0) {
            wishToSave.id = wish.w_id;
        }
        RestService.createOrUpdate(wishToSave, wish ? wish.w_id : -1, 'wish').then(json => {
            if(Number.isInteger(json) && json >= 0) {
                if(wish && i >= 0) {
                    this.wishes[i].w_descr = this.querySelector('tbody tr:nth-child(' + i + ') td:nth-child(1) input').value;
                    this.wishes[i].w_link = this.querySelector('tbody tr:nth-child(' + i + ') td:nth-child(2) input').value;
                } else {
                    wishToSave.w_id = json.content;
                    this.wishes.push(wishToSave);
                }
                this.wlApp.message('success', 'Änderungen erfolgreich gespeichert'); // TODO: oder raus?
                render(this.template(), this);
            } else {
                this.wlApp.message('danger', 'Fehler beim Speichern');
                console.error(json);
                render(this.template(), this);
            }
        }).catch(error => {
            this.wlApp.message('danger', 'Fehler beim Speichern');
            console.error(error);
            render(this.template(), this);
        });
    }

    /*clickedSaveNew()
    {
        const wish = {
            "w_descr": this.querySelector('tbody tr:last-child td:nth-child(1) input').value,
            "w_link": this.querySelector('tbody tr:last-child td:nth-child(2) input').value,
            "w_user": this.wlApp.currentUser.id
        };
        RestService.createOrUpdate(wish, -1, 'wish').then(json => {
            if(Number.isInteger(json) && json >= 0) {
                this.wlApp.message('success', 'Änderungen erfolgreich gespeichert'); // TODO: oder raus?
                this.wishes.push(wish);
                render(this.template(), this);
            } else {
                this.wlApp.message('danger', 'Fehler beim Speichern');
                console.error(json);
                render(this.template(), this);
            }
            render(this.template(), this);
        }).catch(error => {
            this.wlApp.message('danger', 'Fehler beim Speichern');
            console.error(error);
            render(this.template(), this);
        });
    }*/
}
customElements.define("wl-wishes", WlWishes);