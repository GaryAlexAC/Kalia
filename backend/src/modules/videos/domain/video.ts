export type Video = Readonly<{
  id: string;
  title: string;
  description: string | null;
  category: string;
  topic: string | null;
  tiktokVideoId: string;
  sourceUrl: string;
  durationSeconds: number | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}>;
