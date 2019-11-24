import {html, render} from '../lit-html/lit-html.js';
import { WlElement } from './wl-element.js';
import { RestService } from '../services/rest.service.js';

export class WlPresents extends WlElement {

    constructor() {
        super();
        this.restService = new RestService();
    }
    get template() {
        return html`
    <div class="panel panel-default">
        <div class="panel-heading">
            ${this.isChangeFilters
                ? 'Wen beschenkst du?'
                : 'Was schenkst du ' + (this.selectedUser ? this.selectedUser.u_name + '?' : '...?')}
        </div>
    
        <div class="panel-body">
            <ul class="nav nav-tabs">
                ${this.otherUsers.map((user, i) => {return html`
                    <li role="presentation" class="${user === this.selectedUser ? 'active' : ''}" style="white-space:nowrap;">
                        <a @click=${() => this.clickedUser(user)} class="black
                            ${this.isChangeFilters || user !== this.selectedUser ? 'clickable' : ''}
                            ${this.filteredUserIds.indexOf(user.u_id) !== -1 ? 'bold' : ''}
                        ">
                            ${user.u_name}
                            ${this.isChangeFilters ? '' : html`<span class="badge">${this.countPresentsByCurrentUserMap[user.u_id]}/${this.countWishesMap[user.u_id]}</span>`}
                        </a>
                    </li>
                `;})}
                <li role="presentation" class="navbar-right"></li>
                <li role="presentation" class="navbar-right">
                    <button class="btn btn-default" @click=${() => this.setChangeFilters()}>
                        ${this.isChangeFilters ? 'zurück' : 'Wichtel setzen'}
                    </button>
                </li>
            </ul>
    
            ${this.isChangeFilters ? html`
                <div>
                    <br/>
                    Hier kannst du andere markieren/abwählen, um dir deine Wichtel zu merken.
                </div>` : ''}
    
                ${this.selectedUser ? html`
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <td>Beschreibung</td>
                            <td>URL (Optional)</td>
                            <td>Wer schenkt's?</td>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.selectedUserWishes.map((wish, i) => html`
                            <tr>
                                <td>${wish.w_descr}</td>
                                <td>${wish.w_link ? html`<a href="${wish.w_link}" target="_blank">${wish.w_link}</a>` : ''}</td>
                                <td>
                                    ${this.getGiversForWish(wish)}
                                    ${this.isWishSelected(wish)
                                        ? html`
                                            <button @click=${() => this.clickedUnselectWish(wish)} class="btn btn-default" ?disabled=${this.selectedPresent}>
                                                <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                                            </button>`
                                        : html`
                                            <button @click=${() => this.clickedSelectWish(wish)} class="btn btn-default" ?disabled=${this.selectedPresent}>
                                                <span class="glyphicon glyphicon-ok" aria-hidden="true"></span>
                                            </button>`}
                                </td>
                            </tr>
                        `)}
                        <tr class="no-hover">
                            <td colspan=3 style="text-align:center">Hier können Geschenke eingegeben werden, die sich ${this.selectedUser.u_name} nicht selbst gewünscht hat:</td>
                        </tr>
                        ${this.selectedUserUnwishedPresents.map((present, i) => {
                            return html`<tr id="u${i}">
                                <td>
                                    ${this.selectedPresent && this.selectedPresent == present 
                                        ? html`<input type="text" placeholder="Beschreibung" style='width:100%' value="${this.selectedPresent.p_pdescr}">`
                                        : present.p_pdescr}
                                </td>
                                <td>
                                    ${this.selectedPresent
                                        ? this.selectedPresent == present
                                            ? html`<input type="text" placeholder="URL (Optional)" style='width:100%' value="${this.selectedPresent.p_plink}">`
                                            : present.p_plink
                                        : html`
                                            <span>
                                                <a target="_blank" href="${present.p_plink}">${present.p_plink}</a>
                                            </span>
                                        `}
                                </td>
                                <td>
                                    ${this.getGiverForPresent(present)}
                                    ${present.p_giver === this.currentUserId
                                        ? this.selectedPresent && this.selectedPresent===present
                                            ? html`
                                                <button @click=${() => this.clickedSaveEdit(i, present)} class="btn btn-default">
                                                    <span class="glyphicon glyphicon-floppy-saved" aria-hidden="true"></span>
                                                </button>
                                                <button @click=${() => this.clickedResetEdit(i, present)} class="btn btn-default">
                                                    <span class="glyphicon glyphicon-floppy-remove" aria-hidden="true"></span>
                                                </button>`
                                            : html`
                                                <button @click=${() => this.clickedEdit(present)} class="btn btn-default" ?disabled=${this.selectedPresent && this.selectedPresent!==present}>
                                                    <span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>
                                                </button>
                                                <button @click=${() => this.clickedRemove(i, present)} class="btn btn-default" ?disabled=${this.selectedPresent && this.selectedPresent!==present}>
                                                    <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                                                </button>`
                                        : ''}
                                </td>
                            </tr>`
                        })}
                        <tr class="no-hover">
                            <td>
                                ${this.selectedPresent ? '' : html`
                                    <button @click=${() => this.clickedAddNew()} class="btn btn-default">
                                        <span class="glyphicon glyphicon-plus" aria-hidden="true"></span>
                                    </button>`}
                            </td>
                            <td></td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            ` : ''}
        </div>
    </div>`;
    }

    connectedCallback() {
        const currentUser = this.wlApp.currentUser
        if(currentUser === null)
        {
            // TODO: generisch zu loginseite routen
            this.wlApp.error('currentUser is null!', 'Kein angemeldeter Benutzer gefunden. Bitte neu anmelden.');
            return;
        }
        this.currentUserId = currentUser.id;

        this.restService.readFiltersForGiver(this.currentUserId).then(filters => {
            this.filters = filters
            this.filteredUserIds = filters.map(
                filter => filter.f_wisher
            )
        }).catch(
            error => this.wlApp.error(error, 'Ein Fehler ist aufgetreten')
        );

        this.restService.readUsers().then(users => {
            this.allUsers = users;
            this.otherUsers = users.filter(
                user => user.u_id !== this.currentUserId
            ).sort((a, b) => {
                if (a.u_name < b.u_name) return -1;
                else if (a.u_name > b.u_name) return 1;
                else return 0;
            });

            Promise.all([this.restService.readWishes(null), this.restService.readAllPresents()])
            .then(values => {
                let wishes = values[0];

                this.countWishesMap = {};
                this.otherUsers.forEach(
                    user => {
                        this.countWishesMap[user.u_id] = wishes.filter(
                            wish => wish.w_user === user.u_id
                        ).length;
                    }
                );

                this.allOtherWishes = wishes.filter(
                    wish => wish.w_user !== currentUser.u_id
                );

                let presents = values[1];
                this.allOtherPresents = presents.filter(
                    present => present.p_wisher !== this.currentUserId
                );

                this.presentsOfCurrentUser = presents.filter(
                    present => present.p_giver === this.currentUserId
                );
                
                this.countPresentsByCurrentUserMap = {};
                this.otherUsers.forEach(
                    user => {
                        this.countPresentsByCurrentUserMap[user.u_id] = this.presentsOfCurrentUser.filter(
                            present => present.p_wisher === user.u_id
                        ).length;

                        this.countWishesMap[user.u_id] = this.allOtherPresents.filter(
                            present => present.p_wisher === user.u_id && (present.p_wish == null || present.p_wish < 0)
                        ).length + this.countWishesMap[user.u_id];
                    }
                );

                this.render();

            })
            .catch(
                error => this.wlApp.error(error, 'Ein Fehler ist aufgetreten')
            );
        }).catch(
            error => this.wlApp.error(error, 'Ein Fehler ist aufgetreten')
        );
    }

    render() {
        render(this.template, this);
    }

    setChangeFilters()
    {
        // if change filter, no wishes shall be shown
        if(this.isChangeFilters !== true)
        {
            this.selectedUser = null;
            this.selectedUserPresents = null;
            this.selectedUserUnwishedPresents = null;
            this.selectedUserWishes = null;
        }
        this.isChangeFilters = !this.isChangeFilters;
        this.render();
    }

    clickedUser(user)
    {
        if(this.isChangeFilters)
            this.doSelectFilter(user);
        else
            this.doSelectUser(user);
        this.render();
    }
    
    doSelectFilter(user)
    {
        let index = this.filteredUserIds.indexOf(user.u_id);
        if(index !== -1)
        {
            // remove
            this.restService.delete(this.filters[index].f_id, 'filter').then(
                result => {
                    this.filters.splice(index, 1);
                    this.filteredUserIds.splice(index, 1);
                    this.render();
            }).catch(
                error => this.wlApp.error(error, 'Fehler beim Löschen')
            );
        }
        else
        {
            // add
            let newFilter = {
                f_id: null,
                f_giver: this.currentUserId,
                f_wisher: user.u_id
            };
            this.restService.createOrUpdate(newFilter, newFilter.f_id, 'filter').then(
                result => {
                    newFilter.f_id = result;
                    this.filters.push(newFilter);
                    this.filteredUserIds.push(newFilter.f_wisher);
                    this.render();
            }).catch(
                error => this.wlApp.error(error, 'Fehler beim Speichern')
            );
        }
    }

    doSelectUser(user)
    {
        this.selectedUser = user;

        this.selectedUserPresents = this.allOtherPresents.filter(
            present => user && present.p_wisher === user.u_id && present.p_wish !== null && present.p_wish >= 0
        );

        this.selectedUserUnwishedPresents = this.allOtherPresents.filter(
            present => user && present.p_wisher === user.u_id && (present.p_wish === null || present.p_wish < 0)
        );

        this.selectedUserWishes = this.allOtherWishes.filter(
            wish => user && wish.w_user === user.u_id
        );
    }

    isWishSelected(wish)
    {
        return this.presentsOfCurrentUser.findIndex(
            present => {
                //console.log(present.p_wish + "=" + wish.w_id + " " + (present.p_wish === wish.w_id));
                return present.p_wish === wish.w_id;
            }
        ) >= 0;
    }

    getGiversForWish(wish)
    {
        return this.selectedUserPresents.filter(
            p => p.p_wish === wish.w_id
        ).map(
            p => this.allUsers.find(
                    user => user.u_id === p.p_giver
                ).u_name
        );
    }

    getGiverForPresent(present)
    {
        return this.allUsers.find(
            user => user.u_id === present.p_giver
        ).u_name;
    }

    clickedSelectWish(wish)
    {
        const presentToStore = {
            p_id: null,
            p_wisher: wish.w_user,
            p_giver: this.currentUserId,
            p_wish: wish.w_id,
            p_pdescr: wish.w_descr,
            p_plink: wish.w_link
        };
        this.restService.createOrUpdate(presentToStore, presentToStore.p_id, 'present').then(
            result => {
                presentToStore.p_id = result;
                this.presentsOfCurrentUser.push(presentToStore);
                this.selectedUserPresents.push(presentToStore);
                this.countPresentsByCurrentUserMap[presentToStore.p_wisher]++;
                this.render();
        }).catch(
            error => this.wlApp.error(error, 'Fehler beim Speichern')
        );
    }
    clickedUnselectWish(wish)
    {
        const presentToDelete = this.presentsOfCurrentUser.find(
            present => present.p_wish === wish.w_id
        );
        this.restService.delete(presentToDelete.p_id, 'present').then(
            result => {
                this.presentsOfCurrentUser.splice(this.presentsOfCurrentUser.findIndex(p => p === presentToDelete), 1);
                this.selectedUserPresents.splice(this.selectedUserPresents.findIndex(p => p === presentToDelete), 1);
                this.countPresentsByCurrentUserMap[presentToDelete.p_wisher]--;
                this.render();
        }).catch(
            error => this.wlApp.error(error, 'Fehler beim Speichern')
        );
    }

    clickedEdit(present)
    {
        this.selectedPresent = present;
        this.render();
    }

    clickedResetEdit(index, present)
    {
        if(index > -1 && present.p_id <= 0)
        {
            // simply remove from list, if not yet persistent
            this.selectedUserUnwishedPresents.splice(index, 1);
            this.countWishesMap[present.p_wisher]--;
            this.countPresentsByCurrentUserMap[present.p_wisher]--;
        }
        this.selectedPresent = null;
        this.render();
    }

    clickedSaveEdit(i, present)
    {
        const tr = this.querySelector(present && i >= 0
            ? 'tbody tr#u' + i
            : 'tbody tr:last-child');
        let presentToSave = {
            "p_giver": present.p_giver,
            "p_id": present.p_id,
            "p_pdescr": tr.querySelector('td:nth-child(1) input').value,
            "p_plink": tr.querySelector('td:nth-child(2) input').value,
            "p_wish": present.p_wish,
            "p_wisher": present.p_wisher
        };
        this.restService.createOrUpdate(presentToSave, presentToSave.p_id, 'present').then(
            result => {
                this.selectedUserUnwishedPresents[i] = presentToSave;
                this.selectedPresent = null;
                this.render();
            }
        ).catch(
            error => {
                this.wlApp.error(error, 'Fehler beim Speichern');
                this.selectedPresent = null;
            }
        );
    }

    clickedRemove(index, present)
    {
        this.restService.delete(present.p_id, 'present').then(
            result => {
                this.selectedUserUnwishedPresents.splice(index, 1);
                this.countWishesMap[present.p_wisher]--;
                this.countPresentsByCurrentUserMap[present.p_wisher]--;
                this.render();
        }).catch(
            error => this.wlApp.error(error, 'Fehler beim Löschen')
        );
    }

    clickedAddNew(event)
    {
        let present = {
            p_id: -1,
            p_wisher: this.selectedUser.u_id,
            p_giver: this.currentUserId,
            p_wish: -1,
            p_pdescr: '',
            p_plink: ''
        };
        console.log(present);
        this.selectedUserUnwishedPresents.push(present);
        this.countWishesMap[present.p_wisher]++;
        this.countPresentsByCurrentUserMap[present.p_wisher]++;
        
        this.clickedEdit(present);
    }
}
customElements.define("wl-presents", WlPresents);