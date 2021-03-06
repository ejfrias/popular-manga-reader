import { Injectable } from '@angular/core';
import { Subscription, BehaviorSubject, EMPTY } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Storage } from '@ionic/storage';
import { retryWithBackoff } from './http-operator';
import { catchError, shareReplay } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class DataLoaderService {
    // public api_endpoint;

    // private onChangeSubject: BehaviorSubject<any[]> = new BehaviorSubject([]);

    constructor(
        private http: HttpClient,
        private storage: Storage
    ) { }

    // onChanged(callback): Subscription {
    //     return this.onChangeSubject.subscribe(callback);
    // }

    /**
     * Load either all data or specific data.
     * @param force Whether to load just specific data or all data.
     *  Boolean: True to load all data from http, false to try to load from storage
     *  String: load detail
     */
    async load(endpoint, force: boolean | string = true): Promise<boolean | any> {
        if (typeof force === 'string') {
            return await this.httpGet(`${environment.api}/${endpoint}`);
        } else {            
            return force ?
                this.loadFromHttp(endpoint) :
                (await this.loadFromStorage(endpoint) || await this.loadFromHttp(endpoint));
        }
    }

    async loadFromHttp(endpoint): Promise<boolean | any> {
        const data = await this.httpGet(`${environment.api}/${endpoint}`);
        if (data) {
            this.storage.set(endpoint, {
                date: Date.now(),
                data: data,
            });
            return data;
        }

        return false;
    }

    async loadFromStorage(endpoint): Promise<boolean | any> {
        return null;
    }

    async post(endpoint, data) {
        return await this.httpPost(`${environment.api}/${endpoint}`, data);
    }

    async put(endpoint, data) {
        if (data.PK || data.id) {
            if (data.id) {
                return await this.httpPut(`${environment.api}/${endpoint}/${data.id}`, data);
            } else {
                return await this.httpPut(`${environment.api}/${endpoint}/${data.PK}`, data);
            }
        } else {
            return await this.httpPut(`${environment.api}/${endpoint}`, data);
        }
    }

    async destroy(endpoint, data) {
        if (!data.id && data.PK) {
            data.id = data.PK;
        }
        return await this.httpDelete(`${environment.api}/${endpoint}/${data.id}`, data);
    }

    async status(endpoint, data) {
        if (!data.id && data.PK) {
            data.id = data.PK;
        }
        return await this.httpPut(`${environment.api}/${endpoint}/${data.id}/status`, data);
    }

    async httpPost(url, data) {
        if (url.indexOf('http') !== 0) {
            url = this.url(url);
        }

        try {
            const result = await this.http.post(url, data).pipe(
                retryWithBackoff(1000, 3),
                catchError(error => {
                    return EMPTY;
                }),
                shareReplay()
            ).toPromise();
            return result;
        } catch (e) {
            return {
                success: 0,
                message: e.message
            };
        }
    }

    async httpPut(url, data) {
        if (url.indexOf('http') !== 0) {
            url = this.url(url);
        }

        try {
            const result = await this.http.put(url, data).pipe(
                retryWithBackoff(1000, 3),
                catchError(error => {
                    return EMPTY;
                }),
                shareReplay()
            ).toPromise();
            return result;
        } catch (e) {
            return {
                success: 0,
                message: e.message
            };
        }
    }

    async httpGet(url) {
        // if (url.indexOf('http') !== 0) {
        //     url = this.url(url);
        // }

        try {
            const result = await this.http.get(url).pipe(
                retryWithBackoff(1000, 3),
                catchError(error => {
                    return EMPTY;
                }),
                shareReplay()
            ).toPromise();
            return result;
        } catch (e) {
            return {
                success: 0,
                message: e.message
            };
        }
    }

    async httpDelete(url, data) {
        if (url.indexOf('http') !== 0) {
            url = this.url(url);
        }

        try {
            const result = await this.http.delete(url, data).pipe(
                retryWithBackoff(1000, 3),
                catchError(error => {
                    return EMPTY;
                }),
                shareReplay()
            ).toPromise();
            return result;
        } catch (e) {
            return {
                success: 0,
                message: e.message
            };
        }
    }

    url(endpoint) {
        return `${environment.api}/${endpoint}`;
    }
}