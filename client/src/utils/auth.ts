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

    const requestOptions: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
            ...(options.headers || {})
        },
        credentials: 'include',
        ...options
    };

    if (requestOptions.body && typeof requestOptions.body !== 'string') {
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