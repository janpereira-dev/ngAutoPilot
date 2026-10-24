# Testing a debounced search contract

Use this example when an existing Jest project has a latest-request-wins RxJS search. The example uses RxJS 7 and modern Jest fake timers; adapt imports and mock typing to the installed versions. It isolates the stream from Angular so TestBed is not needed. Test Angular integration separately when injection or rendered interaction is part of the change.

## Decide what cancellation means

For `map(trim) -> debounceTime(300) -> distinctUntilChanged() -> switchMap(search)`, a request becomes obsolete when the next distinct, debounced term reaches `switchMap`, not at the raw keystroke. The old request can still emit during that wait. Clearing input also waits 300 ms in this contract.

If the product requires immediate invalidation, use the raw normalized input as the outer switching boundary and put the wait before the new request inside it. A delay alone does not settle duplicate suppression, clearing behavior, or sharing between subscribers: define and test those decisions before changing the implementation.

Unsubscription prevents further emissions through the old inner subscription. It does not prove server-side work stopped. A `Subject` verifies stale-output rejection; a teardown spy verifies observable cleanup; a transport-specific integration test is needed to prove the actual HTTP cancellation contract.

## Complete example

This single test file exercises the stream with narrow typed dependencies, fresh mocks, one subscription per test, and unconditional cleanup. Keep the production function in its own module in a real application.

```ts
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Observable, Subject, Subscription, of, throwError } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';

interface Product {
  id: string;
  name: string;
}

interface ProductApi {
  search(term: string): Observable<Product[]>;
}

type ProductApiMock = jest.Mocked<Pick<ProductApi, 'search'>>;

function createSearchResults(
  terms$: Observable<string>,
  api: Pick<ProductApi, 'search'>,
): Observable<Product[]> {
  return terms$.pipe(
    map((term) => term.trim()),
    debounceTime(300),
    distinctUntilChanged(),
    switchMap((term) => term
      ? api.search(term).pipe(catchError(() => of<Product[]>([])))
      : of<Product[]>([])),
  );
}

describe('debounced product search', () => {
  let api: ProductApiMock;
  let terms$: Subject<string>;
  let results: Product[][];
  let subscription: Subscription;
  const current: Product[] = [{ id: '2', name: 'Current result' }];
  const old: Product[] = [{ id: '1', name: 'Old result' }];

  beforeEach(() => {
    jest.useFakeTimers();
    api = { search: jest.fn<ProductApi['search']>() };
    terms$ = new Subject<string>();
    results = [];
    subscription = createSearchResults(terms$, api)
      .subscribe((value) => results.push(value));
  });

  afterEach(() => {
    try {
      subscription?.unsubscribe();
      terms$?.complete();
    } finally {
      jest.clearAllTimers();
      jest.useRealTimers();
    }
  });

  it('returns empty results without calling the API for a trimmed empty term', () => {
    terms$.next('   ');
    jest.advanceTimersByTime(300);
    expect(api.search).not.toHaveBeenCalled();
    expect(results).toEqual([[]]);
  });

  it('waits until 300 ms and sends the normalized argument', () => {
    api.search.mockReturnValue(of(current));
    terms$.next(' angular ');
    jest.advanceTimersByTime(299);
    expect(api.search).not.toHaveBeenCalled();
    expect(results).toEqual([]);
    jest.advanceTimersByTime(1);
    expect(api.search).toHaveBeenCalledTimes(1);
    expect(api.search).toHaveBeenCalledWith('angular');
    expect(results).toEqual([current]);
  });

  it('restarts the debounce wait when another term arrives', () => {
    api.search.mockReturnValue(of(current));
    terms$.next('angular');
    jest.advanceTimersByTime(200);
    terms$.next('typescript');
    jest.advanceTimersByTime(299);
    expect(api.search).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(api.search).toHaveBeenCalledTimes(1);
    expect(api.search).toHaveBeenCalledWith('typescript');
  });

  it('does not repeat a request for the same normalized term', () => {
    api.search.mockReturnValue(of(current));
    terms$.next(' Angular ');
    jest.advanceTimersByTime(300);
    terms$.next('Angular');
    jest.advanceTimersByTime(300);
    expect(api.search).toHaveBeenCalledTimes(1);
    expect(api.search).toHaveBeenCalledWith('Angular');
    expect(results).toEqual([current]);
  });

  it('tears down the obsolete request and ignores its late response', () => {
    const first$ = new Subject<Product[]>();
    const second$ = new Subject<Product[]>();
    const teardown = jest.fn();
    api.search
      .mockReturnValueOnce(new Observable<Product[]>((subscriber) => {
        const inner = first$.subscribe(subscriber);
        return () => {
          inner.unsubscribe();
          teardown();
        };
      }))
      .mockReturnValueOnce(second$);

    terms$.next('angular');
    jest.advanceTimersByTime(300);
    terms$.next('typescript');
    jest.advanceTimersByTime(299);
    expect(teardown).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(teardown).toHaveBeenCalledTimes(1);
    expect(api.search.mock.calls).toEqual([['angular'], ['typescript']]);

    first$.next(old);
    second$.next(current);
    expect(results).toEqual([current]);
  });

  it('keeps the old request active until the new term passes the debounce', () => {
    const first$ = new Subject<Product[]>();
    const second$ = new Subject<Product[]>();
    api.search.mockReturnValueOnce(first$).mockReturnValueOnce(second$);
    terms$.next('angular');
    jest.advanceTimersByTime(300);
    terms$.next('typescript');
    jest.advanceTimersByTime(299);
    first$.next(old);
    expect(results).toEqual([old]);
    jest.advanceTimersByTime(1);
    second$.next(current);
    first$.next(old);
    expect(results).toEqual([old, current]);
  });

  it('emits a fallback and accepts the next search on the same subscription', () => {
    api.search
      .mockReturnValueOnce(throwError(() => new Error('Backend failure')))
      .mockReturnValueOnce(of(current));
    terms$.next('angular');
    jest.advanceTimersByTime(300);
    expect(results).toEqual([[]]);
    expect(subscription.closed).toBe(false);

    terms$.next('typescript');
    jest.advanceTimersByTime(300);
    expect(api.search.mock.calls).toEqual([['angular'], ['typescript']]);
    expect(results).toEqual([[], current]);
    expect(subscription.closed).toBe(false);
  });
});
```

For an immediate-clear contract, add a test that sends an empty term while a request is in flight and asserts both cleanup and clearing at the required time. Do not silently reinterpret the delayed-clear example as immediate clearing.

## Evidence, not a coverage slogan

Each assertion should fail for a plausible regression. Removing normalization breaks the whitespace case; changing the delay breaks the 299/300 boundary; failing to reset the wait breaks the burst case; removing deduplication breaks repeated normalized input; concurrent inner requests break the stale-response and teardown case; moving error handling outside the inner request can break later searches.

These are counterexamples to reason about, not a claim that Stryker generates every transformation. In particular, automatic `switchMap` to `mergeMap` replacement is not guaranteed. If mutation tooling is available, report its actual configured operators and results. Otherwise label a deliberately changed implementation as a manual regression experiment. Line and branch coverage alone establish neither cancellation nor recovery.

## Sources

- [RxJS 7.8.2 switchMap implementation](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/switchMap.ts): previous-inner unsubscription occurs on the source emission reaching the operator.
- [RxJS 7.8.2 debounceTime implementation](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/debounceTime.ts): delayed emission and reset behavior.
- [RxJS marble testing](https://rxjs.dev/guide/testing/marble-testing): use `TestScheduler` subscription assertions when virtual-time diagrams express the contract more clearly.
- [Jest timer mocks](https://jestjs.io/docs/timer-mocks) and [typed mock functions](https://jestjs.io/docs/mock-function-api): clock control and mock typing.
- [Stryker supported mutators](https://stryker-mutator.io/docs/mutation-testing-elements/supported-mutators/): verify generated mutations rather than assuming operator swaps.
