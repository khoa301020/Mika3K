export interface ISpxResponse {
  retcode: number;
  data: {
    sls_tracking_info: {
      sls_tn: string;
      client_order_id: string;
      records: ISpxRecord[];
    };
    order_info?: {
      spx_tn: string;
      tracking_code_group_name: string;
    };
  };
  message: string;
}

export interface ISpxRecord {
  tracking_code: string;
  tracking_name: string;
  description: string;
  display_flag: number;
  actual_time: number;
  current_location: ISpxLocation;
  next_location: ISpxLocation;
  milestone_code: number;
  milestone_name: string;
  buyer_description: string;
  seller_description: string;
}

export interface ISpxLocation {
  location_name: string;
  location_type_name: string;
  lng: string;
  lat: string;
  full_address: string;
}
