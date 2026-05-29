
// Common types used across the application

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface TimeRange {
  startTime: string;
  endTime: string;
  timezone?: string;
}

