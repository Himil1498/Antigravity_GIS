
import { apiService } from "./api/index";

export interface ColumnSchema {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
  character_maximum_length: number | null;
}

export interface Relationship {
  column: string;
  targetTable: string;
  targetColumn: string;
}

export interface TableSchema {
  name: string;
  type: string;
  description?: string;
  columns: ColumnSchema[];
  relationships: {
    outgoing: Relationship[];
    incoming: Array<{ sourceTable: string; sourceColumn: string; targetColumn: string }>;
  };
}

export const getDatabaseSchemaAPI = async (): Promise<TableSchema[]> => {
  const response = await apiService.get("/system/schema");
  return response.data.data;
};

export const executeQueryAPI = async (query: string): Promise<{ data: any[]; rowCount: number }> => {
  const response = await apiService.post("/system/schema/query", { query });
  return response.data;
};

export const updateAnnotationAPI = async (tableName: string, description: string): Promise<any> => {
   const response = await apiService.post("/system/schema/annotate", { tableName, description });
   return response.data;
};
