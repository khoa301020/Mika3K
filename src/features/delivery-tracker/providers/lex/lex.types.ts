export interface ILexTimelineEntry {
  status: string;
  processTime: number;
  shippingProvider: string;
  recipientType?: string;
  location?: string;
  epod?: string;
  photos?: string;
  reasonCode?: string;
}

export interface ILexDetailResponse {
  success: boolean;
  data?: {
    packageCode: string;
    trackingNumber: string;
    status: string;
    firstMileShippingProvider: string;
    lastMileShippingProvider: string;
    destinationCountry: string;
    timeline: ILexTimelineEntry[];
  };
}

export interface ILexListItem {
  trackingNumber: string;
  packageCode: string;
  packageStatus: string;
  firstMileShippingProvider: string;
  lastMileShippingProvider: string;
  originalTrackingNumber: string;
}

export interface ILexListResponse {
  success: boolean;
  data?: ILexListItem[];
}

/** LEX status code → human-readable Vietnamese label */
export const LEX_STATUS_LABELS: Record<string, string> = {
  cb_pre_accept: 'Đã được lấy bởi đơn vị vận chuyển',
  cb_pre_transport: 'Đang trên đường đến kho trung chuyển',
  cb_pre_delivering: 'Sắp đến kho trung chuyển',
  cb_pre_agent_sign: 'Đã đến kho trung chuyển',
  cb_pre_sign: 'Đã đến kho trung chuyển',
  cb_sign_in_success: 'Đã đến kho trung chuyển',
  cb_ib_success_in_sort_center: 'Đã đến trung tâm phân loại',
  cb_ob_success_in_sort_center: 'Đã rời khỏi trung tâm phân loại',
  cb_handover: 'Đã đến cảng và đang chờ thông quan xuất khẩu',
  cb_ex_customs_clearance_success: 'Đã được thông quan xuất khẩu',
  cb_uplifted: 'Đã được thông quan xuất khẩu và được nhập khẩu vào Việt Nam',
  cb_linehaul_arrival_success: 'Đã đến Việt Nam và đang làm thủ tục hải quan',
  cb_submit_to_customs: 'Đã nộp tờ khai hải quan',
  cb_customs_clearance_success: 'Hải quan đã thông quan',
  cb_released_from_custom_broker: 'Đã được thông quan xuất khẩu và được nhập khẩu vào Việt Nam',
  cb_handover_to_last_mile: 'Đã được bàn giao cho đơn vị vận chuyển nội địa',
  domestic_sc_sign_in_success: 'Đơn vị vận chuyển nội địa đã tiếp nhận',
  'domestic_pickup/sign_in_success': 'Đơn vị vận chuyển nội địa đã lấy đơn và đang hướng đến kho phân loại',
  'domestic_pickup/sign_in_failure': 'Đơn vị vận chuyển nội địa đang chờ lấy đơn',
  domestic_ib_success_in_sort_center: 'Đã đến kho trung chuyển và đang được phân loại',
  domestic_linehaul_packed: 'Đã được phân loại và sẽ sớm được chuyển đến kho trung chuyển',
  domestic_pkg_outbound_attendance: 'Đang trên đường đến kho trung chuyển',
  domestic_ob_success_in_sort_center: 'Đang trên đường đến cơ sở giao hàng gần bạn',
  domestic_package_stationed_in: 'Đã đến cơ sở giao hàng',
  domestic_package_stationed_out: 'Đã chỉ định tài xế giao hàng',
  domestic_out_for_delivery: 'Đơn hàng sẽ được giao trong hôm nay',
  domestic_about_to_deliver: 'Đơn hàng sẽ đến trong vòng một giờ tới',
  domestic_delivered: 'Đơn hàng của bạn đã được giao',
  domestic_return: 'Đơn hàng của bạn sẽ được hoàn về người bán',
  domestic_returned: 'Đơn hàng của bạn đã được hoàn về người bán',
  package_cancelled: 'Đơn hàng đã bị hủy',
};
