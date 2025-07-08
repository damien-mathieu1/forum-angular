import { BaseModel } from './base.interface';


export interface Topic extends BaseModel {
  id: string;
  title: string;
  created_by: string; // User ID
  expand?: {
    'created_by'?: {
      id: string;
      email: string;
      name?: string;
    };
  };
  created: string;
  updated: string;
  collectionId: string;
  collectionName: string;
}
