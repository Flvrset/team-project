export const combineDateAndTime = (date: Date | null, time: Date | null): Date | null => {
    if (!date || !time) return null;
    const result = new Date(date);
    result.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return result;
};

export const formatTimeWithoutSeconds = (timeString: string): string => {
    if (!timeString) return '';

    if (timeString.includes(':')) {
        const parts = timeString.split(':');
        if (parts.length >= 2) {
            return `${parts[0]}:${parts[1]}`;
        }
    }
    return timeString;
};
