import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import 'zone.js';
import { HttpClientModule } from '@angular/common/http';
import { SgWeatherService } from './sg-weather.service';
import { importProvidersFrom } from '@angular/core';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import { AgGridModule } from 'ag-grid-angular'; // Angular Grid Logic
import { ColDef } from 'ag-grid-community'; // Column Definitions Interface

interface ForecastRow {
  date: string,
  tempLow: string,
  tempHigh: string,
  humLow: string,
  humHigh: string
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HttpClientModule, HighchartsChartModule, AgGridModule],
  template: `
    Start date:

    <input #queryDate type="date" value="2019-11-24" />

    <button type="button" class="btn btn-primary" (click)="updateWeather(queryDate.value)">Go</button>

    <highcharts-chart [Highcharts]="Highcharts" [options]="chartOptions" [(update)]="chartUpdateFlag"></highcharts-chart>

    <ag-grid-angular [rowData]="rowData" [columnDefs]="colDefs" class="ag-theme-quartz" style="height: 300px; width: 100%;"></ag-grid-angular>
  `,
})
export class App {
  name = 'Angular';

  constructor(private sgWeatherService: SgWeatherService) {}

  Highcharts: typeof Highcharts = Highcharts;
  chartUpdateFlag = true;
  chartOptions: Highcharts.Options = {
    series: [
      { type: 'line', name: 'Temp Low', yAxis: 0 },
      { type: 'line', name: 'Temp High', yAxis: 0 },
      { type: 'line', name: 'Humid Low', yAxis: 1 },
      { type: 'line', name: 'Humid High', yAxis: 1 },
    ],
    chart: {
      height: 500,
    },
    yAxis: [
      {
        title: {
          text: 'Temperature (°C)',
        },
      },
      {
        title: {
          text: 'Humidity (%)',
        },
        opposite: true,
      },
    ],
  };

  async updateWeather(dateStr: string) {

    var fc = await this.sgWeatherService.get30DaysForecast(dateStr);

    this.chartOptions = {
      title: { text: `${dateStr} 30 Days Forecast` },
      xAxis: {
        categories: Array.from(fc.keys()),
      },
      series: [
        {
          data: Array.from(fc.values()).map((x) => x[0]),
          type: 'line',
        },
        {
          data: Array.from(fc.values()).map((x) => x[1]),
          type: 'line',
        },
        {
          data: Array.from(fc.values()).map((x) => x[2]),
          type: 'line',
        },
        {
          data: Array.from(fc.values()).map((x) => x[3]),
          type: 'line',
        },
      ],
    };

    this.rowData = Array.from(fc.keys()).map<ForecastRow>(x => {
      return {
        date: x,
        tempLow: fc.get(x)![0].toString() ?? "",
        tempHigh: fc.get(x)![1].toString() ?? "",
        humLow: fc.get(x)![2].toString() ?? "",
        humHigh: fc.get(x)![3].toString() ?? ""
      }
    });
  }


  // Row Data: The data to be displayed.
  rowData : ForecastRow[] = [];

  // Column Definitions: Defines & controls grid columns.
  colDefs: ColDef<ForecastRow>[] = [
    { field: 'date' },
    { field: 'tempLow' },
    { field: 'tempHigh' },
    { field: 'humLow' },
    { field: 'humHigh' },
  ];
}

bootstrapApplication(App, {
  providers: [importProvidersFrom(HttpClientModule)],
});
