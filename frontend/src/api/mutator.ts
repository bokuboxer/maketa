import axios, { AxiosRequestConfig } from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// エラーハンドリング
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const customAxios = async <T>(config: AxiosRequestConfig): Promise<T> => {
  if (config.url && config.url.includes("/stream")) {
    return new Promise<T>((resolve, reject) => {
      if (!config.url) return reject(new Error("URL is required"));

      axios
        .post(config.url, config.data, {
          headers: { "Content-Type": "application/json" },
          responseType: "stream",
        })
        .then((response) => {
          const reader = response.data;
          let result = "";

          reader.on("data", (chunk: Buffer) => {
            result += chunk.toString();
          });

          reader.on("end", () => {
            resolve(result as unknown as T);
          });

          reader.on("error", (error: Error) => {
            reject(error);
          });
        })
        .catch(reject);
    });
  }

  // 通常の API リクエスト
  const response = await axios(config);
  return response.data;
};
