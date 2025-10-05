export interface Document {
  id: string;
  title: string;
  slug: string;
  type: string;
  publish_date: string;
  date_created?: string;
  description?: string;
  audit_institution?: string;
  cover_image?: string;
  file?: {
    id: string;
    type: string;
    filesize: string;
    filename_download: string;
  };
}
