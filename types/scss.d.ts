declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}
declare module '*.css';

declare module 'pliny/search' {
  export const SearchProvider: any;
  export const SearchConfig: any;
}

declare module 'pliny/analytics' {
  export const Analytics: any;
  export const AnalyticsConfig: any;
}