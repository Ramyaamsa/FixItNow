import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeFormat'
})
export class TimeFormatPipe implements PipeTransform {

  transform(value: number): string {
    const hours: number = Math.floor(value / 3600);
    const minutes: number = Math.floor((value % 3600) / 60);
    const seconds: number = Math.floor(value % 60);
    
    const formattedTime: string = `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(seconds)}`;
    
    return formattedTime;
  }

  transformHM(value: number): string {
    const hours: number = Math.floor(value / 3600);
    const minutes: number = Math.floor((value % 3600) / 60);
    
    const formattedTime: string = `${this.padZero(hours)}:${this.padZero(minutes)}`;
    
    return formattedTime;
  }
  
  private padZero(value: number): string {
    return value.toString().padStart(2, '0');
  }

  dateCustom(value: 'today' | 'previous' | 'week' | 'month' | 'year'): string {
    const today = new Date();

    switch (value) {
      case 'today':
        return this.formatDate(today);

      case 'previous':
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        return this.formatDate(yesterday);

      case 'week':
        const startOfWeek = new Date(today);
        const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)

        startOfWeek.setDate(today.getDate() - dayOfWeek);
        return this.formatDate(startOfWeek);

      case 'month':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        // const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return this.formatDate(startOfMonth);

      case 'year':
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        // const endOfYear = new Date(today.getFullYear(), 11, 31);
        return this.formatDate(startOfYear);

      default:
        return '';
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${day}-${month}-${year}`;
  }
}
