import Axios from "axios";
import { getSession } from "next-auth/react";
import urljoin from "url-join";
import { config } from "../utils/config";
import https from "https";

const axios = Axios.create({
  baseURL: urljoin(config.backendUrl, "api"),
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
});

axios.interceptors.request.use(async (config: any) => {
  const session = await getSession();

  config.headers.Authorization = `Bearer ${session?.accessToken}`;

  return config;
});

export default axios;
