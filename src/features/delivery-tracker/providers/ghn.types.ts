export interface IGhnTrackingLocation {
  address: string;
  ward_code: string;
  district_id: number;
  warehouse_id: number;
  next_warehouse_id?: number;
}

export interface IGhnTrackingExecutor {
  employee_id?: number;
  client_id?: number;
  name: string;
  phone: string;
}

export interface IGhnTrackingLog {
  order_code: string;
  action_code: string;
  status: string;
  status_name: string;
  location: IGhnTrackingLocation;
  executor: IGhnTrackingExecutor;
  action_at: string;
  sync_data_at: string | null;
}

export interface IGhnTrackingResponse {
  code: number;
  message: string;
  data?: {
    order_info: {
      order_code: string;
      status: string;
      status_name: string;
    };
    tracking_logs: IGhnTrackingLog[];
  };
}
