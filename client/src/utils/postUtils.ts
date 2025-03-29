import { BackendPost, Post } from "../types";

/**
 * Converts a backend post to the unified Post format
 */
export const convertBackendPost = (backendPost: BackendPost): Post => {
  return {
    post_id: backendPost.post_id,
    user_id: backendPost.user_id,
    start_date: backendPost.start_date,
    end_date: backendPost.end_date,
    start_time: backendPost.start_time,
    end_time: backendPost.end_time,
    description: backendPost.description || undefined,
    cost: backendPost.cost,
    pet_list: backendPost.pet_lst,
    pet_count: backendPost.pet_lst.length,
    status: backendPost.status,
    pending_applications: backendPost.pending_applications,
  };
};

/**
 * Converts an array of backend posts to the unified Post format
 */
export const convertBackendPosts = (backendPosts: BackendPost[]): Post[] => {
  return backendPosts.map(convertBackendPost);
};