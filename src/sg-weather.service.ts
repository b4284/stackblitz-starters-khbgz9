import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';
import { interval, take, lastValueFrom } from 'rxjs';

interface HighLowPair {
  high: number,
  low: number
}

interface Forecast {
  temperature: HighLowPair,
  relative_humidity: HighLowPair,
  date: string
}

interface WeatherItems {
  forecasts: Forecast[]
}

export interface SgWeather {
  items: WeatherItems[]
}

@Injectable({
  providedIn: 'root'
})
export class SgWeatherService {
  constructor(private http: HttpClient) {}

  get4DaysForecast(dateStr: string) {
    return this.http.get<SgWeather>(
      `https://api.data.gov.sg/v1/environment/4-day-weather-forecast?date=${dateStr}`
    );
  }

  async get30DaysForecast(startDate: string) {

    var dayData = new Map<string, number[]>();
    var lastForecastDay = new Date(startDate);
    var thirtyDay = new Date(startDate);
    thirtyDay.setDate(thirtyDay.getDate() + 30);
    var i = 0;

    while (lastForecastDay < thirtyDay) {
      var resp = await lastValueFrom(this.get4DaysForecast(lastForecastDay.toISOString().split('T')[0]));
      lastForecastDay.setDate(lastForecastDay.getDate() + 4);      

      resp.items.map(item => {
        item.forecasts.map(forecast => {
          dayData.set(forecast.date, [
            forecast.temperature.low, 
            forecast.temperature.high, 
            forecast.relative_humidity.low,
            forecast.relative_humidity.high]);
        });
      })

      // infinity loop fail safe
      if (i++ > 10) {
        break
      }
    }

    return dayData;
  }
}
