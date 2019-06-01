import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { Store, select } from '@ngrx/store';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { AppState } from '../../reducers';
import { PageQuery, LessonsPageRequested } from '../course.actions';
import { Lesson } from '../model/lesson';
import { selectLessonsPage } from '../course.selectors';
import { tap, catchError } from 'rxjs/operators';

export class LessonsDataSource implements DataSource<Lesson> {
  private lessonsSubject = new BehaviorSubject<Lesson[]>([]);

  constructor(private store: Store<AppState>) {}

  loadLessons(courseId: number, page: PageQuery) {
    this.store
      .pipe(
        select(selectLessonsPage(courseId, page)),
        tap(lessons => {
          if (lessons.length > 0) {
            this.lessonsSubject.next(lessons);
          } else {
            this.store.dispatch(new LessonsPageRequested({ courseId, page }));
          }
        }),
        catchError(err => of([]))
      )
      .subscribe();
  }

  connect(collectionViewer: CollectionViewer): Observable<Lesson[]> {
    console.log('Connecting data source');
    return this.lessonsSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.lessonsSubject.complete();
  }
}
