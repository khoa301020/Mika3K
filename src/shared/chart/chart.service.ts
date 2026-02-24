import { Injectable } from '@nestjs/common';
import QuickChart from 'quickchart-js';

@Injectable()
export class ChartService {
  create(config: any, width = 800, height = 400): string {
    return new QuickChart()
      .setConfig(config)
      .setWidth(width)
      .setHeight(height)
      .getUrl();
  }
}
