// Pet types
export interface Pet {
    pet_id: number;
    pet_name: string;
    type: PetType;
    race: string;
    size: PetSize;
    birth_date: string;
    creation_date: string;
    photo?: string;
    description?: string;
}

// Other shared types can be added here
export type PetSize = 'Mały' | 'Średni' | 'Duży';
export type PetType = 'Pies' | 'Kot' | 'Królik' | 'Papuga' | 'Fretka' | 'Inne';

export const PET_SIZES: PetSize[] = ['Mały', 'Średni', 'Duży'];
export const PET_TYPES: PetType[] = ['Pies', 'Kot', 'Królik', 'Papuga', 'Fretka', 'Inne'];