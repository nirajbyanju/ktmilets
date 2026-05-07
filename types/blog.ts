export interface Blog {
    status: boolean;
    message: string;
    slug: string;
    content: string;
    blogDetails: Blogs;
    data: Blogs[];
    pagination: {
      total: number;
      per_page: number;
      current_page: number;
      last_page: number;
    };
    tocStructure: TableOfContentsItem[];
  
  }
export interface Blogs {
    id: number;
    title: string;
    slug: string;
    author: string;
    categoryId: number | string | null;
    category?: {
      id?: number;
      label?: string;
      name?: string;
    } | null;
    publishDate: string;
    publish_date: string;
    thumbnail: string | null;
    media: unknown;
    tags: string;
    excerpt: string;
    contentWithIds: string;
    content: string;
    status: string | number | null;
    isStatus: number;
    scheduledPublishDate: Date;
    viewCount: number;
    likeCount: number;
    tocStructure: TableOfContentsItem[];
    user: {
      id: number;
      username: string;
      email: string;
      profileImage: string;
      createdAt: string;
      updatedAt: string;
      full_name: string;
      profilePicture: string;
    };
    view_count: number;
    like_count: number;
    bookmark_count: number;
    verifiedBy: number;
    createdBy: number;
    updatedBy: number;
    createdAt: Date;
    updatedAt: Date;
 
  }

  export interface Category {
    id: number;
    label: string;
    count: number;
  }
  
  export interface TableOfContentsItem {
    id: string;
    text: string;
    level: number;
    index: number;
    children: TableOfContentsItem[];
  }
  
  
  export interface BlogsResponse {
    success: boolean;
    error?: {
      message?: string;
      error?: {
        validationErrors?: { [key: string]: string[] };
      };
    };
  }
