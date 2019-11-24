//import { environment } from '../../environments/environment';

export class RestService
{
    //serverUrl = "api.php/";
    //serverUrl = "http://127.0.0.1:3000/?path=";
    serverUrl = "https://mk4-a.srv.sixhop.net/restservice/api.php/";

    assertValidJsonResponse(response) {
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

    assertValidJsonResponseAndUpdateToken(response) {
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

    readUsers()
    {
        return fetch(this.serverUrl + 'user/', {
            headers: this.getRequestOptions(true)
        })
            .then(this.assertValidJsonResponse)
            .catch(this.handleError);
    }

    readWishes(userId)
    {
        return fetch(this.serverUrl + (userId === null ? 'wish/' : 'wish/w_user/' + userId), {
            headers: this.getRequestOptions(true)
        })
            .then(this.assertValidJsonResponse)
            .catch(this.handleError);
    }

    readAllPresents()
    {
        return fetch(this.serverUrl + 'present/', {
            headers: this.getRequestOptions(true)
        })
            .then(this.assertValidJsonResponse)
            .catch(this.handleError);
    }

    readPresents(userId, isForGiver)
    {
        return fetch(this.serverUrl + (isForGiver ? 'present/p_giver/' : 'present/p_wisher/') + userId, {
            headers: this.getRequestOptions(true)
        })
            .then(this.assertValidJsonResponse)
            .catch(this.handleError);
    }

    readFiltersForGiver(giverId)
    {
        return fetch(this.serverUrl + 'filter/f_giver/' + giverId, {
            headers: this.getRequestOptions(true)
        })
            .then(this.assertValidJsonResponse)
            .catch(this.handleError);
    }

    /** return the id */
    createOrUpdate(dbObject, id, tablename)
    {
        const path = id <= 0 ? this.serverUrl + tablename : this.serverUrl + tablename + '/' + id;
        const method = id <= 0 ? 'POST' : 'PUT';
        return fetch(path, {
            method: method,
            headers: this.getRequestOptions(true),
            body: JSON.stringify(dbObject)
        })
            .then(this.assertValidJsonResponseAndUpdateToken);
    }

    delete(id, tablename)
    {
        return fetch(this.serverUrl + tablename + "/" + id, {
            method: 'DELETE',
            headers: this.getRequestOptions(false)
        })
            .then(() => console.log('deleted ' + tablename + ' ' + id))
            .catch((error) => console.error(error));

    }

    deleteWish(wish, isForceDeletion)
    {
        if(isForceDeletion) {
            fetch(this.serverUrl + 'present/p_wish/' + wish.id, {
                method: 'DELETE',
                headers: this.getRequestOptions(false)
            })
                .then(() => console.log('deleted presents for wish#' + wish.id))
                .catch((error) => console.error(error));
        }
        return this.delete(wish.w_id, 'wish');
    }

    handleError(error)
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

    getRequestOptions(addContentTypeJson)
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