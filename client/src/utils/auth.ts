/* eslint-disable @typescript-eslint/no-explicit-any */
interface FetchOptions extends RequestInit {
    body?: any;
}

/**
 * Makes an authenticated fetch request with CSRF token
 * @param url - The URL to fetch
 * @param method - HTTP method (GET, POST, PUT, etc.)
 * @param options - Additional fetch options
 * @returns Promise with the fetch response
 */
export const fetchWithAuth = async (
    url: string,
    method: string = 'GET',
    options: FetchOptions = {}
): Promise<Response> => {
    const csrfCookie = document.cookie
        .split('; ')
        .find(cookie => cookie.startsWith('csrf_access_token='));

    const csrfToken = csrfCookie ? csrfCookie.split('=')[1] : '';

    const headerEntries: Record<string, string> = {
        'X-CSRF-TOKEN': csrfToken,
    };

    if (options.headers) {
        if (options.headers instanceof Headers) {
            options.headers.forEach((value, key) => {
                headerEntries[key] = value;
            });
        } else if (Array.isArray(options.headers)) {
            options.headers.forEach(([key, value]) => {
                headerEntries[key] = value;
            });
        } else {
            Object.assign(headerEntries, options.headers);
        }
    }

    if (!(options.body instanceof FormData)) {
        headerEntries['Content-Type'] = 'application/json';
    }

    const requestOptions: RequestInit = {
        method,
        headers: headerEntries,
        credentials: 'include',
        ...options
    };

    if (requestOptions.body && 
        !(requestOptions.body instanceof FormData) && 
        typeof requestOptions.body !== 'string') {
        requestOptions.body = JSON.stringify(requestOptions.body);
    }

    return fetch(url, requestOptions);
};

export const getWithAuth = (url: string, options: FetchOptions = {}) =>
    fetchWithAuth(url, 'GET', options);

export const postWithAuth = (url: string, data: any, options: FetchOptions = {}) =>
    fetchWithAuth(url, 'POST', { ...options, body: data });

export const putWithAuth = (url: string, data: any, options: FetchOptions = {}) =>
    fetchWithAuth(url, 'PUT', { ...options, body: data });

export const deleteWithAuth = (url: string, options: FetchOptions = {}) =>
    fetchWithAuth(url, 'DELETE', options);