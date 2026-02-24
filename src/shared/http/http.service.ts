import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppHttpService {
  private readonly logger = new Logger(AppHttpService.name);

  constructor(private readonly httpService: HttpService) {}

  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return firstValueFrom(this.httpService.get<T>(url, config));
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return firstValueFrom(this.httpService.post<T>(url, data, config));
  }

  async head(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return firstValueFrom(this.httpService.head(url, config));
  }

  async getHtml(url: string): Promise<string | null> {
    try {
      const { data } = await this.get<string>(url);
      return data;
    } catch (error: any) {
      if (error?.response?.status === 404) return null;
      throw error;
    }
  }

  async checkContentLength(url: string): Promise<number> {
    try {
      const response = await this.head(url);
      const contentLength = response.headers['content-length'];
      return contentLength ? parseInt(contentLength, 10) : 0;
    } catch {
      return 0;
    }
  }
}
