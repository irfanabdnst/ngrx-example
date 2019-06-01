import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { throwError, of } from 'rxjs';
import { catchError, filter, map, mergeMap, withLatestFrom } from 'rxjs/operators';

import { AppState } from '../reducers';
import {
  AllCoursesLoaded,
  AllCoursesRequested,
  CourseActionTypes,
  CourseLoaded,
  CourseRequested,
  LessonsPageLoaded,
  LessonsPageRequested,
  LessonsPageCancelled
} from './course.actions';
import { allCoursesLoaded } from './course.selectors';
import { CoursesService } from './services/courses.service';

@Injectable()
export class CourseEffects {
  @Effect()
  loadCourse$ = this.actions$.pipe(
    ofType<CourseRequested>(CourseActionTypes.CourseRequested),
    mergeMap(action => this.coursesService.findCourseById(action.payload.courseId)),
    map(course => new CourseLoaded({ course })),
    catchError(err => {
      console.log('error loading course ', err);
      return throwError(err);
    })
  );

  @Effect()
  loadAllCourses$ = this.actions$.pipe(
    ofType<AllCoursesRequested>(CourseActionTypes.AllCoursesRequested),
    withLatestFrom(this.store.pipe(select(allCoursesLoaded))),
    filter(([action, allCoursesLoaded]) => !allCoursesLoaded),
    mergeMap(() => this.coursesService.findAllCourses()),
    map(courses => new AllCoursesLoaded({ courses })),
    catchError(err => {
      console.log('error loading all courses ', err);
      return throwError(err);
    })
  );

  @Effect()
  loadLessonsPage$ = this.actions$.pipe(
    ofType<LessonsPageRequested>(CourseActionTypes.LessonsPageRequested),
    mergeMap(({ payload }) =>
      this.coursesService
        .findLessons(payload.courseId, payload.page.pageIndex, payload.page.pageSize)
        .pipe(
          catchError(err => {
            console.log('error loading a lessons page', err);
            this.store.dispatch(new LessonsPageCancelled());
            return of([]);
          })
        )
    ),
    map(lessons => new LessonsPageLoaded({ lessons }))
  );

  constructor(
    private actions$: Actions,
    private coursesService: CoursesService,
    private store: Store<AppState>
  ) {}
}
