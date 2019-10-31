//import { environment } from '../../environments/environment';

export class RestService
{
    static serverUrl = "api.php/";
    static serverUrl = "http://127.0.0.1:3000/?path=";
    //static serverUrl = environment.apiUrl + "api.php/";

    static assertValidJsonResponse(response) {
        if(!response) {
            throw new Error('response may not be empty');
        }
        return response.json().then(json => {
            if(!json) {
                throw new Error('response must be json');
            } else if(!json.token) {
                throw new Error('response jwt must not be empty');
            }
            return json.content;
        });
    }

    static assertValidJsonResponseAndUpdateToken(response) {
        if(!response) {
            throw new Error('response may not be empty');
        }
        return response.json().then(json => {
            if(!json) {
                throw new Error('response must be json');
            } else if(!json.token) {
                throw new Error('response jwt must not be empty');
            }
            document.getElementsByTagName('wl-app')[0].token = json.token;
            return json.content;
        });
    }

    static readUsers()
    {
        return fetch(RestService.serverUrl + 'user/', RestService.getRequestOptions(true))
            .then(RestService.assertValidJsonResponse)
            .catch(RestService.handleError);
    }

    static readWishes(userId)
    {
        return fetch(RestService.serverUrl + (userId === null ? 'wish/' : 'wish/w_user/' + userId), RestService.getRequestOptions(true))
            .then(RestService.assertValidJsonResponse)
            .catch(RestService.handleError);
    }

    static readAllPresents()
    {
        return fetch(RestService.serverUrl + 'present/', RestService.getRequestOptions(true))
            .then(RestService.assertValidJsonResponse)
            .catch(RestService.handleError);
    }

    static readPresents(userId, isForGiver)
    {
        return fetch(RestService.serverUrl + (isForGiver ? 'present/p_giver/' : 'present/p_wisher/') + userId, RestService.getRequestOptions(true))
            .then(RestService.assertValidJsonResponse)
            .catch(RestService.handleError);
    }

    static readFiltersForGiver(giverId)
    {
        return fetch(RestService.serverUrl + 'filter/f_giver/' + giverId, RestService.getRequestOptions(true))
            .then(RestService.assertValidJsonResponse)
            .catch(RestService.handleError);
    }

    /** return the id */
    static createOrUpdate(dbObject, id, tablename)
    {
        let headers = RestService.getRequestOptions(true);
        headers.method = 'POST';
        headers.body = JSON.stringify(dbObject);

        const path = id <= 0 ? RestService.serverUrl + tablename : RestService.serverUrl + tablename + '/' + id;
        return fetch(path, headers)
            .then(RestService.assertValidJsonResponseAndUpdateToken);
    }

    static delete(dbObject, id, tablename)
    {
        let headers = RestService.getRequestOptions(false);
        headers.method = 'DELETE';
        fetch(RestService.serverUrl + tablename + "/" + id, headers)
            .then(() => console.log('deleted ' + tablename + ' ' + id))
            .catch((error) => console.error(error));

    }

    static deleteWish(wish, isForceDeletion)
    {
        if(isForceDeletion) {
            let headers = RestService.getRequestOptions(false);
            headers.method = 'DELETE';
            fetch(RestService.serverUrl + 'present/p_wish/' + wish.id, headers)
                .then(() => console.log('deleted presents for wish#' + wish.id))
                .catch((error) => console.error(error));
        }
        return RestService.delete(wish, 'wish');
    }

    static handleError(error)
    {
        console.error(error);
        //console.log("handleError: " + JSON.stringify(error));
        let errorMsg;
        if(error instanceof Response)
        {
            const body = error.json() || '';
            const err = body.error || JSON.stringify(body);
            errorMsg = `error ${error.status} - ${error.statusText || ''} ${err}`;
        }
        else
        {
            errorMsg = error.message ? error.message : error.toString();
        }
        console.error(errorMsg);
        return errorMsg;
    }

    static getRequestOptions(addContentTypeJson)
    {
        // create authorization header with jwt token
        let loginUser = document.getElementsByTagName('wl-app')[0].currentUser;
        if (loginUser && loginUser.jwt)
        {
            let headers;
            if(addContentTypeJson)
                headers = {
                    'Access-Control-Allow-Origin': '*',
                    'Authorization': loginUser.jwt,
                    'Content-Type': 'application/json'
                };
            else
                headers = {
                    'Access-Control-Allow-Origin': '*',
                    'Authorization': loginUser.jwt
                };
            return headers;
            //return new RequestOptions({ headers: headers });
        }
    }
}