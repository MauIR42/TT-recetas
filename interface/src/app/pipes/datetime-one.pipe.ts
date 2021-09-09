import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'datetimeOne'
})
export class DatetimeOnePipe implements PipeTransform {

  transform(value: any, ...args: unknown[]): unknown {
    return moment(value).utcOffset('-05:00').format("DD-MM-YYYY HH:mm");
  }

}
