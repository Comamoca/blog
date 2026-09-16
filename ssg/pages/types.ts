/** 一覧・ページネーションで共通して使う型 */
export type PostSummary = {
  title: string;
  url: string;
  description: string;
};

export type PageLink =
  | { page: number; url: string }
  | { omitted: true };

export type Pagination = {
  page: number;
  totalPages: number;
  previous: string | null;
  next: string | null;
};
