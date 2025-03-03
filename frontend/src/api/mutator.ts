import axios, { AxiosRequestConfig } from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not defined');
}

// エラーハンドリング
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) {
      console.log('Request canceled');
      return Promise.reject(error);
    }
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const customAxios = <T>(config: AxiosRequestConfig): Promise<T> => {
  const controller = new AbortController();
  const promise = axiosInstance({
    ...config,
    signal: config.signal || controller.signal,
  }).then(({ data }) => data);

  // @ts-ignore
  promise.cancel = () => {
    controller.abort();
  };

  return promise;
};

export default customAxios;
