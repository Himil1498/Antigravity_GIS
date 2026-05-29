import apiService from "./api";

export interface ApiAnnotation {
    method: string;
    path: string;
    description: string;
    usage_example?: string;
    response_schema?: string;
    last_updated?: string;
    source?: string;
}

export interface ApiDocsResponse {
    count: number;
    apis: ApiAnnotation[];
}

export const fetchApiDocs = async (): Promise<ApiDocsResponse> => {
    const response = await apiService.get<ApiDocsResponse>("/system/api-docs");
    return response.data;
};

export const updateApiAnnotation = async (data: Partial<ApiAnnotation>): Promise<ApiAnnotation> => {
    const response = await apiService.post("/system/api-docs/update", data);
    return response.data;
};
