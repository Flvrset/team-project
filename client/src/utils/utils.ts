export const combineDateAndTime = (date: Date | null, time: Date | null): Date | null => {
    if (!date || !time) return null;
    const result = new Date(date);
    result.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return result;
};
