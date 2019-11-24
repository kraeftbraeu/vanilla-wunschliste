import {html, render} from '../lit-html/lit-html.js';
import { WlElement } from './wl-element.js';
import { AuthService } from '../services/auth.service.js';
//import { AlertService } from '../services/alert.service.js';

export class WlLogin extends WlElement
{
    constructor() {
        super();
        this.authService = new AuthService();
    }

    get template() {
        return html`
        <div class="panel panel-default">
            <div class="panel-heading">Anmeldung</div>
            <div class="panel-body">
                <div class="form-group wlun">
                    <label for="wlun">Benutzername</label>
                    <input type="text" class="form-control" name="wlun" id="wlun" placeholder="Benutzername" required />
                    <div class="help-block invisible">Bitte Benutzernamen angeben</div>
                </div>
                <div class="form-group wlpw">
                    <label for="wlpw">Passwort</label>
                    <input type="password" class="form-control" name="wlpw" id="wlpw" placeholder="Passwort" required />
                    <div class="help-block invisible">Bitte Passwort angeben</div>
                </div>
                <div class="form-group">
                    <button @click=${() => this.login()} class="btn btn-default">anmelden</button>
                    <img class="invisible" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
                </div>
            </div>
        </div>
        `;
    }

    connectedCallback()
    {
        // reset login status
        console.log('logout');
        this.wlApp.currentUser = null;

        render(this.template, this);

        // get return url from route parameters or default to '/'
        //this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    login()
    {
        const isUsernameEmpty = document.getElementById('wlun').value === '';
        const isPasswordEmpty = document.getElementById('wlpw').value === '';
        if(isUsernameEmpty || isPasswordEmpty) {
            if(isUsernameEmpty) {
                document.querySelector('.wlun .help-block').classList.remove('invisible');
            }
            if(isPasswordEmpty) {
                document.querySelector('.wlpw .help-block').classList.remove('invisible');
            }
        } else {
            //this.loading = true;
            this.authService.login(document.getElementById('wlun').value, document.getElementById('wlpw').value)
            .then(
                () => document.getElementsByTagName('wl-app')[0].connectedCallback()
            )
            .catch(
                //error => AlertService.error(error)
                error => console.error(error)
            );
        }
    }
}
customElements.define("wl-login", WlLogin);