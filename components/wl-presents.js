import {html, render} from '../lit-html/lit-html.js';
import { WlElement } from './wl-element.js';
import { RestService } from '../services/rest.service.js';

export class WlPresents extends WlElement {

    get template() {
        return html`
    <div class="panel panel-default">
        <div class="panel-heading">
            ${this.isChangeFilters
                ? 'Wen beschenkst du?'
                : 'Was schenkst du' + (this.selectedUser ? this.selectedUser.name + '?' : '...?')}
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
                            <td colspan=3 style="text-align:center">Hier können Geschenke eingegeben werden, die nicht vom Wünscher selbst formuliert wurden:</td>
                        </tr>
                        ${this.selectedUserUnwishedPresents.map((present, i) => {
                            html`<tr>
                                <td>
                                    ${this.selectedPresent && this.selectedPresent == present 
                                        ? html`<input type="text" placeholder="Beschreibung" value="${this.selectedPresent.description}">`
                                        : present.description}
                                </td>
                                <td>
                                    ${this.selectedPresent
                                        ? this.selectedPresent == present
                                            ? html`<input type="text" placeholder="URL (Optional)" value="${this.selectedPresent.link}">`
                                            : present.link
                                        : html`
                                            <span>
                                                <a target="_blank" href="${present.link}">${present.link}</a>
                                            </span>
                                        `}
                                </td>
                                <td>
                                    ${this.getGiverForPresent(present)}
                                    ${present.giverId === currentUserId
                                        ? this.selectedPresent && this.selectedPresent===present
                                            ? html`
                                                <button @click=${() => this.clickedSaveEdit(i, present)} class="btn btn-default">
                                                    <span class="glyphicon glyphicon-ok" aria-hidden="true"></span>
                                                </button>
                                                <button @click=${() => this.clickedResetEdit(i, present)} class="btn btn-default">
                                                    <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
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
                                <button *ngIf="!this.selectedPresent" (click)="clickedAddNew()" class="btn btn-default">
                                    <span class="glyphicon glyphicon-plus" aria-hidden="true"></span>
                                </button>
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

    setCountWishesMap(userid, count) {
        this[userid] = count;
    }

    connectedCallback() {
        const currentUser = this.wlApp.currentUser
        if(currentUser === null)
        {
            this.wlApp.message('danger', 'Kein angemeldeter Benutzer gefunden. Bitte neu anmelden.');
            return;
        }
        this.currentUserId = currentUser.id;

        RestService.readFiltersForGiver(this.currentUserId).then(filters => {
            this.filters = filters
            this.filteredUserIds = filters.map(
                filter => filter.f_wisher
            )
        }).catch(error => {
            this.wlApp.message('danger', 'Ein Fehler ist aufgetreten');
            console.error(error);
        });

        RestService.readUsers().then(users => {
            this.allUsers = users;
            this.otherUsers = users.filter(
                user => user.u_id !== this.currentUserId
            ).sort((a, b) => {
                if (a.u_name < b.u_name) return -1;
                else if (a.u_name > b.u_name) return 1;
                else return 0;
            });
            // output: allUsers, otherUsers

            Promise.all([RestService.readWishes(null), RestService.readAllPresents()])
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

                render(this.template, this);

            })
            .catch(error => {
                this.wlApp.message('danger', 'Ein Fehler ist aufgetreten');
                console.error(error);
            });
        }).catch(error => {
            this.wlApp.message('danger', 'Ein Fehler ist aufgetreten');
            console.error(error);
        });
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
        render(this.template, this);
    }

    clickedUser(user)
    {
        if(this.isChangeFilters)
            this.doSelectFilter(user);
        else
            this.doSelectUser(user);
        render(this.template, this);
    }
    
    doSelectFilter(user)
    {
        let index = this.filteredUserIds.indexOf(user.u_id);
        if(index !== -1)
        {
            // remove
            RestService.delete(this.filters[index]).then(
                result => {
                    this.filters.splice(index, 1);
                    this.filteredUserIds.splice(index, 1);
            }).catch(
                error => this.alertService.error(error)
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
            RestService.createOrUpdate(newFilter).then(
                result => {
                    newFilter.f_id = result;
                    this.filters.push(newFilter);
                    this.filteredUserIds.push(newFilter.f_wisher);
            }).catch(
                error => this.alertService.error(error)
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
                ).p_name
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
        this.createPresent({
            p_id: null,
            p_wisher: wish_w_user,
            p_giver: this.currentUserId,
            p_wish: wish.w_id,
            p_pdescr: wish.w_descr,
            p_plink: wish.w_link
        });
    }

    createPresent(present)
    {
        RestService.createOrUpdate(present).then(
            result => {
                present.p_id = result;
                this.presentsOfCurrentUser.push(present);
                this.selectedUserPresents.push(present);
                this.countPresentsByCurrentUserMap.set(present.p_wisher, this.countPresentsByCurrentUserMap.get(present.p_wisher) + 1);
        }).catch(
            error => {
                this.alertService.error(error);
            }
        );
    }

    clickedUnselectWish(wish)
    {
        this.deletePresent(this.presentsOfCurrentUser.find(
            present => present.p_wish === wish.w_id
        ));
    }

    deletePresent(present)
    {
        RestService.delete(present).then(
            result => {
                this.presentsOfCurrentUser.splice(this.presentsOfCurrentUser.findIndex(p => p === present), 1);
                this.selectedUserPresents.splice(this.selectedUserPresents.findIndex(p => p === present), 1);
                this.countPresentsByCurrentUserMap.set(present.p_wisher, this.countPresentsByCurrentUserMap.get(present.p_wisher) - 1);
        }).catch(
            error => {
                this.alertService.error(error);
            }
        );
    }

    clickedEdit(present)
    {
        this.selectedPresent = present;
        this.oldDescr = present.p_descr;
        this.oldLink = present.p_link;
    }

    clickedResetEdit(index, present)
    {
        if(index > -1 && present.p_id <= 0)
        {
            // remove from list, if not yet persistent
            this.selectedUserUnwishedPresents.splice(index, 1);
            this.countWishesMap.set(present.p_wisher, this.countWishesMap.get(present.p_wisher) - 1);
            this.countPresentsByCurrentUserMap.set(present.p_wisher, this.countPresentsByCurrentUserMap.get(present.p_wisher) - 1);
        }

        this.selectedPresent = null;
        this.oldDescr = null;
        this.oldLink = null;
    }

    clickedSaveEdit(index, present)
    {
        RestService.createOrUpdate(present).then(
            result => {}
        ).catch(
            error => {
                this.alertService.error(error);
                present.p_descr = this.oldDescr;
                present.p_link = this.oldLink;
            },
            () => {
                this.oldDescr = null;
                this.oldLink = null;
                this.selectedPresent = null;
            }
        );
    }

    clickedRemove(index, present)
    {
        RestService.delete(present).then(
            result => {
                console.log('deleted present#' + present.p_id);
                this.selectedUserUnwishedPresents.splice(index, 1);
                this.countWishesMap.set(present.p_wisher, this.countWishesMap.get(present.p_wisher) - 1);
                this.countPresentsByCurrentUserMap.set(present.p_wisher, this.countPresentsByCurrentUserMap.get(present.p_wisher) - 1);
        }).catch(
            error => console.error(error)
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
        this.selectedUserUnwishedPresents.push(present);
        this.countWishesMap.set(present.p_wisher, this.countWishesMap.get(present.p_wisher) + 1);
        this.countPresentsByCurrentUserMap.set(present.p_wisher, this.countPresentsByCurrentUserMap.get(present.p_wisher) + 1);
        
        this.clickedEdit(present);
    }
}
customElements.define("wl-presents", WlPresents);