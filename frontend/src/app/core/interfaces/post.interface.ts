import { BaseModel } from './base.interface';

export interface Post extends BaseModel {
  id: string;
  content: string;
  topic_id: string;
  created_by: string;
  expand?: {
    'created_by'?: {
      id: string;
      email: string;
      name?: string;
    };
    'topic'?: {
      id: string;
      title: string;
    }
  };
}
