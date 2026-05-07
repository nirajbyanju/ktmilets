import {
    getAllBlogs,
    getBlogByID,
    createBlog,
    updateBlog,
    updateStatusBlog,
    deleteBlog
  } from '@/apis/blog.api';
  import type { QueryParamsRecord } from '@/apis/queryParams';
  import { Blogs, Blog } from '@/types/blog'; // Corrected the typo in the path
  import _ from 'lodash';
  import {create} from 'zustand';
  
  interface BlogState {
    Blogs: Blogs[] | null;
    Blog: Blog | null;
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    getAllBlogs: (page: number, search: FormData | QueryParamsRecord) => Promise<Blog | null>;
    createBlog: (Blog: FormData) => Promise<void>; 
    getBlog: (id: number) => Promise<Blogs | Blog | null>;
    updateBlog: (id: number, Blog: FormData) => Promise<void>;
    deleteBlog: (id: number) => Promise<void>;
    updateStatusBlog: (id: number, Blog: FormData) => Promise<void>;
  }
  
  export const useBlogStore = create<BlogState>((set, get) => ({
    Blogs: null,
    Blog: null,
    total: 0,
    per_page: 10,
    current_page: 1,
    last_page: 0,
  
  getAllBlogs: async  (page: number, formData: FormData | QueryParamsRecord = {}) => {
    try {
      const profiles =  await getAllBlogs(page, formData);
      if (profiles) {
        set({ 
          Blogs: profiles.data, 
          total: profiles.pagination.total, 
          last_page: profiles.pagination.last_page,
          current_page: profiles.pagination.current_page
        });
      }
      return profiles; 
    } catch (error) {
      throw error; 
    }
  },
  
    createBlog: async (formData: FormData) => {
      try {
        const newProfile = await createBlog(formData);
        set((state) => ({
          Blogs: [...state.Blogs??[], newProfile],
        }));
      }    
      catch (error) {
        console.error('Failed to create company profile:', error);
        throw error;
      }
    },
  
    getBlog: async (id: number) => {
      try {
        if (_.isEmpty(get().Blogs)) {
            const profile = await getBlogByID(id);
            set({ Blog: profile });
            return profile;
        } else {
          const profile = get().Blogs?.find((p) => p.id === id);
          return profile ?? null;
        }
      } catch (error) {
        console.error(`Failed to fetch company profile with id ${id}:`, error);
        throw error;
      }
    },
    
    
  
  
    /**
     * Updates an existing company profile and updates the state.
     * @param Blog - The FormData containing the updated Blog.
     */
    updateBlog: async (id: number, formData: FormData) => {
      try {
        const updatedProfile = await updateBlog(id,formData);
        set((state) => ({
          Blogs: state.Blogs?.map((profile) =>
            profile.id === updatedProfile.id ? updatedProfile : profile
          ),
        }));
      } catch (error) {
        console.error('Failed to update company profile:', error);
        throw error;
      }
    },

    updateStatusBlog: async (id: number, formData: FormData) => {
      try {
        const updatedProfile = await updateStatusBlog(id,formData);
        set((state) => ({
          Blogs: state.Blogs?.map((profile) =>
            profile.id === updatedProfile.id ? updatedProfile : profile
          ),
        }));
      } catch (error) {
        console.error('Failed to update company profile Status:', error);
        throw error;
      }
    },


    /**
     * Deletes a company profile by ID and updates the state.
     * @param id - The ID of the company profile to delete.
     */
    deleteBlog: async (id: number) => {
      try {
        await deleteBlog(id);
        const currentProfiles = get().Blogs;
        if (Array.isArray(currentProfiles)) {
          set({
            Blogs: currentProfiles.filter((profile) => profile.id !== id),
          });
        } else {
          console.error('Error: companyProfiles is not an array.');
        }
      } catch (error) {
        console.error(`Failed to delete company profile with id ${id}:`, error);
        throw error;
      }
    }
  }));

  export default useBlogStore;
