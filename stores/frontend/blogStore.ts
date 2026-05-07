import { getAllBlogs, getBlogsDetails, getBlogsViewing } from "@/apis/frontend/blog.api";
import { Blogs, Blog } from "@/types/blog";
import { create } from "zustand";
import _ from 'lodash';


interface BlogState {
  BlogsData: Blogs[] | null;
  BlogData: Blog | null;
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  getAllBlogs: (page: number, search: string) => Promise<Blog | null>;
  getBlogsDetails: (slug: string) => Promise<Blog | null>;
  getBlogsViewing: (id: number) => Promise<Blog | null>;
}

export const useBlogStore = create<BlogState>((set, get) => ({
  BlogsData: null,
  BlogData: null,
  total: 0,
  per_page: 10,
  current_page: 1,
  last_page: 0,

  getAllBlogs: async  (page: number, formData: any="") => {
    try {
      const profiles =  await getAllBlogs(page, formData);
      if (profiles) {
        set({ 
          BlogsData: profiles.data, 
        });
      }
      console.log("Profiles", profiles);  
      return profiles; 
    } catch (error) {
      console.error('Failed to fetch company profiles:', error);
      throw error; 
    }
  },

  getBlogsDetails: async (slug) => {
    try {
      if (_.isEmpty(get().BlogsData)) {
        const response = await getBlogsDetails(slug);
        const profile = (response as any);
        set({ BlogData: profile });
        return profile;
      } else {
        const profile = get().BlogsData?.find((p) => p.slug === slug);
        return profile ?? null;
      }
    } catch (error) {
      console.error(`Failed to fetch company profile with id ${slug}:`, error);
      throw error;
    }
  },

  getBlogsViewing: async (id: number) => {
    try {
      if (_.isEmpty(get().BlogsData)) {
        const response = await getBlogsViewing(id);
        const profile = (response as any);
        set({ BlogData: profile });
        return profile;
      } else {
        const profile = get().BlogsData?.find((p) => p.id === id);
        return profile ?? null;
      }
    } catch (error) {
      console.error(`Failed to fetch company profile with id ${id}:`, error);
      throw error;
    }
  },
}));

export default useBlogStore;
