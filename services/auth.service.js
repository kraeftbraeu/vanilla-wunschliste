import { RestService } from './rest.service.js';
import { JwtService } from './jwt.service.js';
//import { environment } from '../../environments/environment';

export class AuthService
{
    static loginServerUrl = "http://localhost:3000/login.json";
    static pwChangeServerUrl = "changepw.json";
    //static loginServerUrl = environment.apiUrl + "login.php";
    //static pwChangeServerUrl = environment.apiUrl + "changepw.php";

    static login(username, password)
    {
        let headers = {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        };
        headers.method = 'POST';
        headers.body = {
            user: username,
            pw: password
        };
        return fetch(AuthService.loginServerUrl, headers)
        .then(response => response.json())
        .then(jsonContent => {
            document.getElementsByTagName('wl-app')[0].token = jsonContent.token;
        });
    }

    static changePassword(newPassword)
    {
        let headers = RestService.getRequestOptions(false);
        headers.method = 'POST';
        headers.body = {
            pw: newPassword
        };
        return fetch(AuthService.pwChangeServerUrl, headers)
        .then(response => response.json())
        .then(jsonContent => document.getElementsByTagName('wl-app')[0].token = jsonContent.token, false);
    }

    static isTokenValid(token)
    {
        if(token !== null)
        {
            let decodedJwt = JwtService.decodeJwt(token);
            return decodedJwt.exp.valueOf() * 1000 > new Date().valueOf();
        }
        return false;
    }
}