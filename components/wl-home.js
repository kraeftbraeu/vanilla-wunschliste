import {html, render} from '../lit-html/lit-html.js';
import { WlElement } from './wl-element.js';

export class WlHome extends WlElement
{
    get template() {
        return (currentUser, year) => html`
<div class="panel panel-default">
    <div class="panel-heading">Willkommen bei Krämer Wunschliste ${year}</div>
    <div class="panel-body">
        <h1>Hallo ${currentUser==null?null:currentUser.username}!</h1>
    </div>
</div>
<div class="panel panel-default">
    <div class="panel-heading">Passwort ändern</div>
    <div class="panel-body">
        <form name="form" novalidate>
            <div class="form-group wlpw1">
                <label for="wlpw1">Neues Passwort</label>
                <input type="password" class="form-control" id="wlpw1" formControlName="wlpw1" placeholder="Neues Passwort" />
                <div class="help-block invisible">Bitte Passwort angeben</div>
            </div>
            <div class="form-group wlpw2">
                <label for="wlpw2">Wiederholen</label>
                <input type="password" class="form-control" id="wlpw2" formControlName="wlpw2" placeholder="Wiederholen" />
                <div class="help-block invisible">Bitte Passwort wiederholen</div>
            </div>
            <div class="form-group">
                <button @click=${() => this.clickedDoubleCheckSubmit()} class="btn btn-default">Passwort ändern</button>
                <div id="doubleCheckSubmit" class="invisible">
                    Möchtest du dein Passwort wirklich ändern?
                    <button @click=${() => this.clickedChangePassword()} class="btn btn-success">Ja</button>
                    <img class="invisible" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
                    <button @click=${() => this.clickedReset()} class="btn btn-danger">Nein</button>
                </div>
            </div>
        </form>
    </div>
</div>
        `;
    }

    isWlpw1Valid(changes) {
        console.log("wlpw1valid: " + changes && changes.wlpw1);
        return changes && changes.wlpw1;
    }

    isWlpw2Valid(changes) {
        console.log("wlpw2valid: " + changes && (!changes.wlpw1 || (changes.wlpw2 && changes.wlpw1 === changes.wlpw2)));
        return changes && (!changes.wlpw1 || (changes.wlpw2 && changes.wlpw1 === changes.wlpw2));
    }

    connectedCallback()
    {
        render(this.template(this.wlApp.currentUser, 2019), this);
    }

    clickedDoubleCheckSubmit()
    {
        if(this.isWlpw1Valid && this.isWlpw2Valid) {
            document.getElementById('doubleCheckSubmit').classList.remove('invisible');
            document.querySelector('.wlpw1 .help-block').classList.add('invisible');
            document.querySelector('.wlpw2 .help-block').classList.add('invisible');
        } else {
            if(!this.isWlpw1Valid) {
                document.querySelector('.wlpw1 .help-block').classList.remove('invisible');
            }
            if(!this.isWlpw2Valid) {
                document.getElementById('.wlpw2 .help-block').classList.remove('invisible');
            }
        }
    }

    clickedReset()
    {
        document.getElementById('doubleCheckSubmit').classList.add('invisible');
        document.getElementById('loading').classList.add('invisible');
        document.querySelector('.wlpw1 .help-block').classList.add('invisible');
        document.querySelector('.wlpw2 .help-block').classList.add('invisible');
    }

    clickedChangePassword()
    {
        document.getElementById('loading').classList.remove('invisible');
        AuthService.changePassword(document.getElementById('wlpw1').value)
        .then(
            () => {
                AlertService.success("Das Ändern des Passworts war erfolgreich.");
                document.getElementById('doubleCheckSubmit').classList.add('invisible');
                document.getElementById('loading').classList.add('invisible');
            }
        )
        .catch(
            (error) => {
                AlertService.error(error);
                document.getElementById('doubleCheckSubmit').classList.add('invisible');
                document.getElementById('loading').classList.add('invisible');
            }
        );
    }
}
customElements.define("wl-home", WlHome);