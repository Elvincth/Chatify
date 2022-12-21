export interface IResponse {
  success: boolean;
  code: number;
  message: string;
  errorCode?: string;
  data?: any;
}
