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
    options: RequestInit = {}
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

export const getWithAuth = (url: string, options: RequestInit = {}) =>
    fetchWithAuth(url, 'GET', options);

export const postWithAuth = <T = unknown>(url: string, data: T, options: RequestInit = {}) =>
    fetchWithAuth(url, 'POST', { ...options, body: data as unknown as BodyInit });

export const putWithAuth = (url: string, data: unknown, options: RequestInit = {}) =>
    fetchWithAuth(url, 'PUT', { ...options, body: data as unknown as BodyInit });

export const deleteWithAuth = (url: string, options: RequestInit = {}) =>
    fetchWithAuth(url, 'DELETE', options);