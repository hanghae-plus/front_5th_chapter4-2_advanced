# 과제 체크포인트

## 과제 요구사항

- [x] [배포 후 url 제출](front-5th-chapter4-2-advanced-ten.vercel.app)
- [x] API 호출 최적화(`Promise.all` 이해)

- [x] SearchDialog 불필요한 연산 최적화
- [x] SearchDialog 불필요한 리렌더링 최적화

- [ ] 시간표 블록 드래그시 렌더링 최적화
- [ ] 시간표 블록 드롭시 렌더링 최적화

## 과제 셀프회고

### 1. 리액트 개발자 도구 이해하기

리액트 개발자 도구가 저에게 하나의 러닝 커브가 오는 과제 였습니다. 그렇기 때문에 과제 요구사항을 지키는게 조금 어려웠습니다. Profile 부분이 생소했기 때문에 요구사항을 수정하는데 어떤 식으로 비교를 진행해야할지가 너무 어려웠습니다. 개인적으로는 최적화를 확인할 수 있는 도구를 공부하는 것만 해도 한주가 필요할수도 있겠다 싶었습니다.

### 2. Promise.all과 캐싱

#### Promise.all

Promise.all은 배열안에 있는 비동기 함수를 병렬로 처리하는 함수입니다. 기존의 코드는 await 키워드가 있기 때문에 병렬로 처리되지 않고 순차대로 처리되는게 보여서 await 키워드를 모두 제거했습니다.

```tsx
const fetchAllLectures = async () =>
  await Promise.all([
    (console.log("API Call 1", performance.now()), await fetchMajors()),
    (console.log("API Call 2", performance.now()), await fetchLiberalArts()),
    (console.log("API Call 3", performance.now()), await fetchMajors()),
    (console.log("API Call 4", performance.now()), await fetchLiberalArts()),
    (console.log("API Call 5", performance.now()), await fetchMajors()),
    (console.log("API Call 6", performance.now()), await fetchLiberalArts()),
  ]);
```

#### 캐싱

fetchMajors와 fetchLiberalArts 함수는 여러번 호출되기 때문에 클로저를 이용해서 캐시를 하면 좋겠다는 요구사항이 있었습니다.

```ts
function cachedFetchResult<T>(fetchFunc: () => Promise<AxiosResponse<T>>) {
  let result: Promise<T> | null = null;

  return () => {
    if (!result) {
      result = fetchFunc()
        .then((res) => res.data)
        .catch((error) => {
          result = null;
          throw error;
        });
    }
    return result;
  };
}
```

기존의 axios 함수를 받아서 실행을 시키고, 이 값을 result에 할당시킨다음 result의 값이 있다면 axios 함수를 실행시키지 않도록 했습니다.

### 3. SearchDialog

#### 연산 최적화(filteredLectures, visibleLectures에 useMemo적용)

filteredLectures, visibleLectures의 연산값이 변경되지 않았을 때 불필요한 연산을 방지하도록 값을 memoization하는 과정을 가졌습니다.

#### 리렌더링 최적화

전공 목록을 조회하는 컴포넌트에서 모든 요소가 리렌더링 되고 있기 때문에 불필요하게 렌더링이 되지 않도록 개선이 필요했습니다.

MajorControl 컴포넌트를 만들고 부모 컴포넌트가 리렌더링이 일어나더라도 props의 변경이 없으면 자식 컴포넌트의 리렌더링이 일어나지 않는 memo 함수를 통해 불필요한 리렌더링을 방지했습니다.

### 아쉬웠던 점

1. 리액트 개발자 도구 개념 부족
2. 코드를 다 훑어보지 못함

<!-- 과제에 대한 회고를 작성해주세요 -->

<!-- ### 기술적 성장 -->

<!-- 예시
- 새로 학습한 개념
- 기존 지식의 재발견/심화
- 구현 과정에서의 기술적 도전과 해결
-->

<!-- ### 코드 품질 -->

<!-- 예시
- 특히 만족스러운 구현
- 리팩토링이 필요한 부분
- 코드 설계 관련 고민과 결정
-->

<!-- ### 학습 효과 분석 -->

<!-- 예시
- 가장 큰 배움이 있었던 부분
- 추가 학습이 필요한 영역
- 실무 적용 가능성
-->

<!-- ### 과제 피드백 -->

<!-- 예시
- 과제에서 모호하거나 애매했던 부분
- 과제에서 좋았던 부분
-->

<!-- ## 리뷰 받고 싶은 내용 -->

<!--
피드백 받고 싶은 내용을 구체적으로 남겨주세요
모호한 요청은 피드백을 남기기 어렵습니다.

참고링크: https://chatgpt.com/share/675b6129-515c-8001-ba72-39d0fa4c7b62

모호한 요청의 예시)
- 코드 스타일에 대한 피드백 부탁드립니다.
- 코드 구조에 대한 피드백 부탁드립니다.
- 개념적인 오류에 대한 피드백 부탁드립니다.
- 추가 구현이 필요한 부분에 대한 피드백 부탁드립니다.

구체적인 요청의 예시)
- 현재 함수와 변수명을 보면 직관성이 떨어지는 것 같습니다. 함수와 변수를 더 명확하게 이름 지을 수 있는 방법에 대해 조언해주실 수 있나요?
- 현재 파일 단위로 코드가 분리되어 있지만, 모듈화나 계층화가 부족한 것 같습니다. 어떤 기준으로 클래스를 분리하거나 모듈화를 진행하면 유지보수에 도움이 될까요?
- MVC 패턴을 따르려고 했는데, 제가 구현한 구조가 MVC 원칙에 맞게 잘 구성되었는지 검토해주시고, 보완할 부분을 제안해주실 수 있을까요?
- 컴포넌트 간의 의존성이 높아져서 테스트하기 어려운 상황입니다. 의존성을 낮추고 테스트 가능성을 높이는 구조 개선 방안이 있을까요?
-->
