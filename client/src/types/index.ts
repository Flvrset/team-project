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

// Post types
export interface Post {
    post_id: number;
    user_id: number;
    city?: string;
    postal_code?: string;
    name?: string;
    surname?: string;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    description?: string;
    cost: number;
    pet_count?: number;
    pet_photos?: string[];
    pet_list?: string[];
    status?: string;
}

// Backend response types
export interface MyPostsResponse {
    post_lst: BackendPost[];
}

export interface BackendPost {
    post_id: number;
    user_id: number;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    description: string | null;
    cost: number;
    pet_lst: string[];
}

// Other shared types can be added here
export type PetSize = 'Mały' | 'Średni' | 'Duży';
export type PetType = 'Pies' | 'Kot' | 'Królik' | 'Papuga' | 'Fretka' | 'Inne';

export const PET_SIZES: PetSize[] = ['Mały', 'Średni', 'Duży'];
export const PET_TYPES: PetType[] = ['Pies', 'Kot', 'Królik', 'Papuga', 'Fretka', 'Inne'];