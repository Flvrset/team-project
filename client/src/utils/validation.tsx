/* eslint-disable no-useless-escape */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
    return password.length >= 8;
};

export const validatePhoneNumber = (phone: string): string | undefined => {
    const phoneRegex = /^[0-9]{9}$/;
    if (!phone) return "Numer telefonu jest wymagany";
    if (!phoneRegex.test(phone)) return "Nieprawidłowy format numeru (wymagane 9 cyfr)";
    return undefined;
};


export const validateMaxLength = (value: string, field: string, maxLength: number): string | undefined => {
    if (value && value.length > maxLength) {
        return `${field} nie może przekraczać ${maxLength} znaków`;
    }
    return undefined;
};
