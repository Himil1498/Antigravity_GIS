
import type {
  ChartType,
  AxisType,
  LineStyle,
  YAxisType,
  LegendPosition,
  TableAlignment,
  TableColumnType,
  SortDirection
} from './analyticsEnums';

// Charts and Visualizations
export interface ChartConfiguration {
  id: string;
  type: ChartType;
  title: string;
  description?: string;
  data_source: DataSource;
  x_axis: AxisConfiguration;
  y_axis: AxisConfiguration;
  series: SeriesConfiguration[];
  styling: ChartStyling;
  interactions: ChartInteractions;
}

export interface DataSource {
  type: 'metric' | 'query' | 'api' | 'static';
  source: string;
  parameters?: Record<string, any>;
  refresh_interval?: number;
  cache_duration?: number;
}

export interface AxisConfiguration {
  title: string;
  type: AxisType;
  min?: number;
  max?: number;
  format?: string;
  unit?: string;
  grid: boolean;
  labels: boolean;
}

export interface SeriesConfiguration {
  name: string;
  type?: ChartType;
  data_field: string;
  color?: string;
  line_style?: LineStyle;
  marker?: boolean;
  fill?: boolean;
  stack?: string;
  y_axis?: YAxisType;
}

export interface ChartStyling {
  colors: string[];
  font_family: string;
  font_size: number;
  background_color: string;
  grid_color: string;
  legend: {
    show: boolean;
    position: LegendPosition;
  };
  animation: boolean;
  responsive: boolean;
}

export interface ChartInteractions {
  zoom: boolean;
  pan: boolean;
  selection: boolean;
  tooltip: boolean;
  crosshair: boolean;
  click_events: boolean;
  export: boolean;
}

// Table Configuration
export interface TableConfiguration {
  id: string;
  title: string;
  data_source: DataSource;
  columns: TableColumn[];
  pagination: TablePagination;
  sorting: TableSorting;
  filtering: TableFiltering;
  styling: TableStyling;
}

export interface TableColumn {
  field: string;
  title: string;
  type: TableColumnType;
  width?: number;
  format?: string;
  sortable: boolean;
  filterable: boolean;
  visible: boolean;
  alignment: TableAlignment;
  renderer?: string;
}

export interface TablePagination {
  enabled: boolean;
  page_size: number;
  page_sizes: number[];
  show_info: boolean;
  }

export interface TableSorting {
  enabled: boolean;
  multiple: boolean;
  default_sort?: {
    field: string;
    direction: SortDirection;
  };
}

export interface TableFiltering {
  enabled: boolean;
  quick_filter: boolean;
  advanced_filter: boolean;
  filter_operators: string[];
}

export interface TableStyling {
  striped_rows: boolean;
  bordered: boolean;
  hover_effect: boolean;
  compact: boolean;
  header_styling: Record<string, any>;
  row_styling: Record<string, any>;
}

