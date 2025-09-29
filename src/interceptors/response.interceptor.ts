import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
    return next.handle().pipe(
      map((data: any) => {
        return {
          success: true,
          message: data?.message || 'Request successful',
          data: data?.data ?? data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
