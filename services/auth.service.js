import { RestService } from './rest.service.js';
import { JwtService } from './jwt.service.js';

export class AuthService
{
    constructor() {
        this.jwtService = new JwtService();
        this.restService = new RestService();
    }

    //loginServerUrl = "http://localhost:3000/login.json";
    //pwChangeServerUrl = "changepw.json";
    loginServerUrl = "https://mk4-a.srv.sixhop.net/restservice/login.php";
    pwChangeServerUrl = "https://mk4-a.srv.sixhop.net/restservice/changepw.php";

    login(username, password)
    {
        return fetch(this.loginServerUrl, {
            method: "POST",
            body: JSON.stringify({
                user: username,
                pw: password
            }),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(jsonContent => {
            document.getElementsByTagName('wl-app')[0].token = jsonContent.token;
        });
    }

    changePassword(newPassword)
    {
        let headers = this.restService.getRequestOptions(false);
        headers.method = 'POST';
        headers.body = {
            pw: newPassword
        };
        return fetch(this.pwChangeServerUrl, {
            headers: headers
        })
        .then(response => response.json())
        .then(jsonContent => document.getElementsByTagName('wl-app')[0].token = jsonContent.token, false);
    }

    isTokenValid(token)
    {
        if(token !== null)
        {
            let decodedJwt = this.jwtService.decodeJwt(token);
            return decodedJwt.exp.valueOf() * 1000 > new Date().valueOf();
        }
        return false;
    }
}