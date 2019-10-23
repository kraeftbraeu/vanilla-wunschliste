import {html, render} from '../lit-html/lit-html.js';
import { WlElement } from './wl-element.js';
import { RestService } from '../services/rest.service.js';

export class WlPresents extends WlElement {

    get template() {
        return html`
    <div class="panel panel-default">
        <div class="panel-heading">
            <span *ngIf="!isChangeFilters">
                Was schenkst du
                <span *ngIf="selectedUser">{{selectedUser.name}}?</span>
                <span *ngIf="!selectedUser">...?</span>
            </span>
            <span *ngIf="isChangeFilters">Wen beschenkst du?</span>
        </div>
    
        <div class="panel-body">
            <ul class="nav nav-tabs">
                <li role="presentation" *ngFor="let user of otherUsers; let i = index" [ngClass]="{'active': user===selectedUser}" style="white-space:nowrap;">
                    <a (click)="clickedUser(user, isChangeFilters)" class="black" [ngClass]="{
                        'clickable': isChangeFilters === true || user!==selectedUser, 
                        'bold': filteredUserIds.indexOf(user.id) !== -1
                    }">
                        {{user.name}}
                        <span class="badge" *ngIf="!isChangeFilters">{{countPresentsByCurrentUserMap.get(user.id)}}/{{countWishesMap.get(user.id)}}</span>
                    </a>
                </li>
                <li role="presentation" class="navbar-right"></li>
                <li role="presentation" class="navbar-right">
                    <button class="btn btn-default" (click)="setChangeFilters()">
                        <span *ngIf="isChangeFilters">zurück</span>
                        <span *ngIf="!isChangeFilters">Wichtel setzen</span>
                    </button>
                </li>
            </ul>
    
            <div *ngIf="isChangeFilters">
                <br/>
                Hier kannst du andere markieren/abwählen, um dir deine Wichtel zu merken.
            </div>
    
            <table class="table table-hover" *ngIf="selectedUser">
                <thead>
                    <tr>
                        <td>Beschreibung</td>
                        <td>URL (Optional)</td>
                        <td>Wer schenkt's?</td>
                    </tr>
                </thead>
                <tbody>
                    <tr *ngFor="let wish of selectedUserWishes; let i = index">
                        <td>{{wish.description}}</td>
                        <td><a href="{{wish.link}}" target="_blank" *ngIf="wish.link">{{wish.link}}</a></td>
                        <td>
                            {{getGiversForWish(wish)}}
                            <button *ngIf="isWishSelected(wish)" (click)="clickedUnselectWish(wish)" class="btn btn-default" [attr.disabled]="selectedPresent">
                                <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                            </button>
                            <button *ngIf="!isWishSelected(wish)" (click)="clickedSelectWish(wish)" class="btn btn-default" [attr.disabled]="selectedPresent">
                                <span class="glyphicon glyphicon-ok" aria-hidden="true"></span>
                            </button>
                        </td>
                    </tr>
                    <tr class="no-hover">
                        <td colspan=3 style="text-align:center">Hier können Geschenke eingegeben werden, die nicht vom Wünscher selbst formuliert wurden:</td>
                    </tr>
                    <tr *ngFor="let present of selectedUserUnwishedPresents; let i = index">
                        <td>
                            <span *ngIf="!selectedPresent || selectedPresent!=present">
                                {{present.description}}
                            </span>
                            <input *ngIf="selectedPresent && selectedPresent==present" type="text" [(ngModel)]="selectedPresent.description" placeholder="Beschreibung">
                        </td>
                        <td>
                            <span *ngIf="!selectedPresent">
                                <a target="_blank" href="{{present.link}}">{{present.link}}</a>
                            </span>
    
                            <span *ngIf="selectedPresent && selectedPresent!=present">
                                {{present.link}}
                            </span>
    
                            <input *ngIf="selectedPresent && selectedPresent==present" type="text" [(ngModel)]="selectedPresent.link" placeholder="URL (Optional)">
                        </td>
                        <td>
                            {{getGiverForPresent(present)}}
                            <span *ngIf="present.giverId === currentUserId">
                                <button *ngIf="!selectedPresent || selectedPresent!==present" (click)="clickedEdit(present)" class="btn btn-default" [attr.disabled]="selectedPresent && selectedPresent!==present">
                                    <span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>
                                </button>
                                <button *ngIf="!selectedPresent || selectedPresent!==present" (click)="clickedRemove(i, present)" class="btn btn-default" [attr.disabled]="selectedPresent && selectedPresent!==present">
                                    <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                                </button>
    
                                <button *ngIf="selectedPresent && selectedPresent===present" (click)="clickedSaveEdit(i, present)" class="btn btn-default">
                                    <span class="glyphicon glyphicon-ok" aria-hidden="true"></span>
                                </button>
                                <button *ngIf="selectedPresent && selectedPresent===present" (click)="clickedResetEdit(i, present)" class="btn btn-default">
                                    <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                                </button>
                            </span>
                        </td>
                    </tr>
                    <tr class="no-hover">
                        <td>
                            <button *ngIf="!selectedPresent" (click)="clickedAddNew()" class="btn btn-default">
                                <span class="glyphicon glyphicon-plus" aria-hidden="true"></span>
                            </button>
                        </td>
                        <td></td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
    
        </div>
    </div>`;
    }

    connectedCallback() {
        this.storageHandler.currentUser.subscribe(
            currentUser => {
                if(currentUser === null)
                {
                    this.alertService.error("Kein angemeldeter Benutzer gefunden. Bitte neu anmelden.");
                    return;
                }
                this.currentUserId = currentUser.id;

                this.restService.readFiltersForGiver(this.currentUserId).subscribe(
                    filters => {
                        this.filters = filters
                        this.filteredUserIds = filters.map(
                            filter => filter.wisherId
                        )
                    },
                    error => this.alertService.error(error)
                );

                this.restService.readUsers().subscribe(
                    users => {
                        this.allUsers = users;
                        this.otherUsers = users.filter(
                            user => user.id !== this.currentUserId
                        ).sort((a, b) => {
                            if (a.name < b.name) return -1;
                            else if (a.name > b.name) return 1;
                            else return 0;
                        });

                        this.restService.readWishes(null).subscribe(
                            wishes => {
                                this.otherUsers.forEach(
                                    user => {
                                        this.countWishesMap.set(user.id, wishes.filter(
                                            wish => wish.userId === user.id
                                        ).length);
                                    }
                                );

                                this.allOtherWishes = wishes.filter(
                                    wish => wish.userId !==currentUser.id
                                );
                            },
                            error => this.alertService.error(error)
                        );

                        this.restService.readAllPresents().subscribe(
                            presents => {
                                this.allOtherPresents = presents.filter(
                                    present => present.wisherId !== this.currentUserId
                                );

                                this.presentsOfCurrentUser = presents.filter(
                                    present => present.giverId === this.currentUserId
                                );
                                
                                this.otherUsers.forEach(
                                    user => {
                                        this.countPresentsByCurrentUserMap.set(user.id, this.presentsOfCurrentUser.filter(
                                            present => present.wisherId === user.id
                                        ).length);

                                        this.countWishesMap.set(user.id, this.allOtherPresents.filter(
                                            present => present.wisherId === user.id && (present.wishId==null ||present.wishId < 0)
                                        ).length + this.countWishesMap.get(user.id));
                                    }
                                );
                            },
                            error => this.alertService.error(error)
                        );
                    },
                    error => this.alertService.error(error)
                );
            },
            error => this.alertService.error(error)
        );
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
    }

    clickedUser(user, isChangeFilters)
    {
        if(isChangeFilters)
            this.doSelectFilter(user);
        else
            this.doSelectUser(user);
    }
    
    doSelectFilter(user)
    {
        console.log(user.id + ": " + user.toJson());
        let index = this.filteredUserIds.indexOf(user.id);
        if(index !== -1)
        {
            // remove
            this.restService.delete(this.filters[index]).subscribe(
                result => {
                    this.filters.splice(index, 1);
                    this.filteredUserIds.splice(index, 1);
                },
                error => this.alertService.error(error)
            );
        }
        else
        {
            // add
            let newFilter = new Filter(null, this.currentUserId, user.id);
            this.restService.createOrUpdate(newFilter).subscribe(
                result => {
                    newFilter.id = result;
                    this.filters.push(newFilter);
                    this.filteredUserIds.push(newFilter.wisherId);
                },
                error => this.alertService.error(error)
            );
        }
    }

    doSelectUser(user)
    {
        this.selectedUser = user;

        this.selectedUserPresents = this.allOtherPresents.filter(
            present => user && present.wisherId === user.id && present.wishId !== null && present.wishId >= 0
        );

        this.selectedUserUnwishedPresents = this.allOtherPresents.filter(
            present => user && present.wisherId === user.id && (present.wishId === null || present.wishId < 0)
        );

        this.selectedUserWishes = this.allOtherWishes.filter(
            wish => user && wish.userId === user.id
        );
    }

    isWishSelected(wish)
    {
        return this.presentsOfCurrentUser.findIndex(
            present => {
                //console.log(present.wishId + "=" + wish.id + " " + (present.wishId === wish.id));
                return present.wishId === wish.id;
            }
        ) >= 0;
    }

    getGiversForWish(wish)
    {
        return this.selectedUserPresents.filter(
            p => p.wishId === wish.id
        ).map(
            p => this.allUsers.find(
                    user => user.id === p.giverId
                ).name
        );
    }

    getGiverForPresent(present)
    {
        return this.allUsers.find(
            user => user.id === present.giverId
        ).name;
    }

    clickedSelectWish(wish)
    {
        this.createPresent(new Present(null,
                                       wish.userId,
                                       this.currentUserId,
                                       wish.id,
                                       wish.description,
                                       wish.link));
    }

    createPresent(present)
    {
        this.restService.createOrUpdate(present).subscribe(
            result => {
                present.id = result;
                this.presentsOfCurrentUser.push(present);
                this.selectedUserPresents.push(present);
                this.countPresentsByCurrentUserMap.set(present.wisherId, this.countPresentsByCurrentUserMap.get(present.wisherId) + 1);
            },
            error => {
                this.alertService.error(error);
            }
        );
    }

    clickedUnselectWish(wish)
    {
        this.deletePresent(this.presentsOfCurrentUser.find(
            present => present.wishId === wish.id
        ));
    }

    deletePresent(present)
    {
        this.restService.delete(present).subscribe(
            result => {
                this.presentsOfCurrentUser.splice(this.presentsOfCurrentUser.findIndex(p => p === present), 1);
                this.selectedUserPresents.splice(this.selectedUserPresents.findIndex(p => p === present), 1);
                this.countPresentsByCurrentUserMap.set(present.wisherId, this.countPresentsByCurrentUserMap.get(present.wisherId) - 1);
            },
            error => {
                this.alertService.error(error);
            }
        );
    }

    clickedEdit(present)
    {
        this.selectedPresent = present;
        this.oldDescr = present.description;
        this.oldLink = present.link;
    }

    clickedResetEdit(index, present)
    {
        if(index > -1 && present.id <= 0)
        {
            // remove from list, if not yet persistent
            this.selectedUserUnwishedPresents.splice(index, 1);
            this.countWishesMap.set(present.wisherId, this.countWishesMap.get(present.wisherId) - 1);
            this.countPresentsByCurrentUserMap.set(present.wisherId, this.countPresentsByCurrentUserMap.get(present.wisherId) - 1);
        }

        this.selectedPresent = null;
        this.oldDescr = null;
        this.oldLink = null;
    }

    clickedSaveEdit(index, present)
    {
        this.restService.createOrUpdate(present).subscribe(
            result => {},
            error => {
                this.alertService.error(error);
                present.description = this.oldDescr;
                present.link = this.oldLink;
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
        this.restService.delete(present).subscribe(
            result => {
                console.log('deleted present#' + present.id);
                this.selectedUserUnwishedPresents.splice(index, 1);
                this.countWishesMap.set(present.wisherId, this.countWishesMap.get(present.wisherId) - 1);
                this.countPresentsByCurrentUserMap.set(present.wisherId, this.countPresentsByCurrentUserMap.get(present.wisherId) - 1);
            },
            error => console.error(error)
        );
    }

    clickedAddNew(event)
    {
        let present = new Present(-1, this.selectedUser.id, this.currentUserId, -1, '', '');
        this.selectedUserUnwishedPresents.push(present);
        this.countWishesMap.set(present.wisherId, this.countWishesMap.get(present.wisherId) + 1);
        this.countPresentsByCurrentUserMap.set(present.wisherId, this.countPresentsByCurrentUserMap.get(present.wisherId) + 1);
        
        this.clickedEdit(present);
    }
}
customElements.define("wl-presents", WlPresents);