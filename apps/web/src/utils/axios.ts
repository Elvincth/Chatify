import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { showNotification } from "@mantine/notifications";
import { has } from "lodash";
import { getCookie } from "cookies-next";

const onRequest = async (req: AxiosRequestConfig) => {
  const token = getCookie("access-token"); //TODO: Get token from cookie
  req.headers = req.headers ?? {};

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
};

const showErrorNotification = (e: AxiosError) => {
  let message = "An error occurred";

  if (has(e, "response.data.message")) {
    //@ts-ignore
    message = e.response.data.message;
  }

  showNotification({
    color: "red",
    title: "Error",
    message,
  });
};

const onRequestError = (error: AxiosError): Promise<AxiosError> => {
  console.error(`[request error`, error);
  showErrorNotification(error);
  return Promise.reject(error);
};

const onResponse = async (res: AxiosResponse) => {
  return res;
};

const onResponseError = (error: AxiosError): Promise<AxiosError> => {
  console.log(`[response error]`, error);
  showErrorNotification(error);
  return Promise.reject(error);
};

const withInterceptors = (axiosInstance: AxiosInstance) => {
  axiosInstance.interceptors.request.use(onRequest, onRequestError);
  axiosInstance.interceptors.response.use(onResponse, onResponseError);
  return axiosInstance;
};

export const axiosInstance = withInterceptors(
  axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
  })
);

//For SWR
export const fetcher = (url: string) =>
  axiosInstance.get(url).then((res) => res.data);
