import {html, render} from '../lit-html/lit-html.js';
import { WlMessage } from './wl-message.js';
import { WlLogin } from './wl-login.js';
import { WlHome } from './wl-home.js';
import { WlWishes } from './wl-wishes.js';
import { WlPresents } from './wl-presents.js';
import { JwtService } from '../services/jwt.service.js';

export default class WlApp extends HTMLElement
{
    get template() {
        return (currentUser, year, daysLeftToChristmas) => html`
        <nav class="navbar navbar-default">
            <div class="container-fluid">
                <div class="navbar-header">
                    <button type="button" class="navbar-toggle">
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button>
                    <span class="navbar-toggle navbar-right" style="border:0">${currentUser ? currentUser.username : ''}</span>
                    <a class="navbar-brand" href="">Wunschliste</a>
                </div>
                <div class="collapse navbar-collapse" id="myNavbar">
                ${currentUser
                    ? html`
                        <ul class="nav navbar-nav">
                            <li class='clickable home login'><a @click=${() => this.openPage('home')}>Start</a></li>
                            <li class='clickable wishes'><a @click=${() => this.openPage('wishes')}>Wünsche</a></li>
                            <li class='clickable presents'><a @click=${() => this.openPage('presents')}>Geschenke</a></li>
                        </ul>
                        <form class="navbar-form navbar-right" action="" method="post" role="search">
                            <span id="jsLogoutForm" style="padding-left:15px; padding-right:15px;">
                                <span class="glyphicon glyphicon-user" aria-hidden="true"></span>
                                <span id="jsLoginName">${currentUser.username}</span>
                            </span>
                            <a type="button" class="btn btn-default" @click=${() => this.openPage('logout')} *ngIf="(currentUser|async)">Logout</a>
                        </form>`
                    : html``}
                </div>
            </div>
        </nav>
        <div class="container">
            <div id="wl-message"></div>
            <div id="wl-content"></div>
        </div>
        <footer class="footer">
            <div class="container">
                <p class="text-muted">
                © Krämer ${year}
                <span>| ${daysLeftToChristmas} Tage bis Weihnachten</span>
                </p>
            </div>
        </footer>
        `;
    }

    set token(token) {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        if(token) {
            let decodedJwt = JwtService.decodeJwt(token);
            this.currentUser = {
                "id": decodedJwt.u_id,
                "username": decodedJwt.u_name,
                "jwt": token
            };
        } else {
            this.currentUser = null;
        }
    }

    set jwt(jwt) {
        this.currentUser.jwt = jwt;
    }

    message(type, text) {
        render(html`<wl-message type=${type} text=${text}></wl-message>`, document.getElementById('wl-message'));
    }

    connectedCallback() {
        this.doRendering();
    }

    doRendering() {
        const currentUser = this.currentUser;
        const year = new Date().getFullYear();
        const days = Math.floor((new Date(year, 11, 24).getTime() - new Date().getTime()) / 1000 / 3600 / 24);
        render(this.template(currentUser, year, days), this);
        console.log("read user", currentUser);
        if(currentUser) {
            const hash = window.location.hash;
            if(hash && hash.length > 1 && hash !== '#login') {
                this.openPage(window.location.hash.substr(1));
            } else {
                this.openPage('home');
            }
        }
        else 
            this.openPage('login');
    }

    openPage(page) {
        console.log('open ' + page);
        const content = document.getElementById('wl-content');
        if(content) {
            while(content.lastChild)
                content.removeChild(content.lastChild);
            content.appendChild(document.createElement('wl-' + page));

            window.location = window.location.protocol + '//' + window.location.host + window.location.pathname + '#' + page;
            
            document.querySelectorAll('nav ul.navbar-nav li').forEach(li => {
                if(li.classList.contains(page)) {
                    li.classList.add('active'); // TODO: bootstrap css für selected finden
                } else {
                    li.classList.remove('active');
                }
            });

            /*window.history.pushState(
                {},
                'wl-' + page,
                window.location.origin + 'wl-' + page
            );*/
        }
    }
}
customElements.define("wl-app", WlApp);