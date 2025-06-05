import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  applyFilterIf,
  queryFilter,
  gradeFilter,
  majorFilter,
  creditsFilter,
  scheduleFilter,
  filterLectures,
} from "./utils.lecture-filters";
import { LectureWithLowerCased } from "./types";
import * as utils from "./utils";

// parseSchedule 함수를 모킹
vi.mock("./utils", () => ({
  parseSchedule: vi.fn(),
}));

const mockParseSchedule = vi.mocked(utils.parseSchedule);

describe("applyFilterIf", () => {
  it("조건이 false일 때 항상 true를 반환한다", () => {
    const condition = () => false;
    const rule = () => false;
    const filter = applyFilterIf(condition, rule);

    const lecture = {} as LectureWithLowerCased;
    const options = { grades: [], days: [], times: [], majors: [] };

    expect(filter(lecture, options)).toBe(true);
  });

  it("조건이 true일 때 rule 함수의 결과를 반환한다", () => {
    const condition = () => true;
    const rule = vi.fn().mockReturnValue(false);
    const filter = applyFilterIf(condition, rule);

    const lecture = {} as LectureWithLowerCased;
    const options = { grades: [], days: [], times: [], majors: [] };

    expect(filter(lecture, options)).toBe(false);
    expect(rule).toHaveBeenCalledWith(lecture, options);
  });

  it("조건이 true일 때 rule 함수에 올바른 인자를 전달한다", () => {
    const condition = () => true;
    const rule = vi.fn().mockReturnValue(true);
    const filter = applyFilterIf(condition, rule);

    const lecture = { id: "CS101" } as LectureWithLowerCased;
    const options = { grades: [1, 2], days: [], times: [], majors: [] };

    filter(lecture, options);

    expect(rule).toHaveBeenCalledWith(lecture, options);
  });
});

describe("queryFilter", () => {
  const createLecture = (id: string, title: string): LectureWithLowerCased => ({
    id,
    title,
    credits: "3(0)",
    major: "SW융합대학<p>SW융합학부<p>SW융합경제경영전공",
    schedule: "월16~18(상경415)<p>수16~18(상경415)",
    grade: 1,
    lowerCasedId: id.toLowerCase(),
    lowerCasedTitle: title.toLowerCase(),
  });

  it("query가 없으면 모든 강의를 통과시킨다", () => {
    const lecture = createLecture("306770", "경제수학");
    const options = { grades: [], days: [], times: [], majors: [] };

    expect(queryFilter(lecture, options)).toBe(true);
  });

  it("query가 빈 문자열이면 모든 강의를 통과시킨다", () => {
    const lecture = createLecture("306770", "경제수학");
    const options = { query: "", grades: [], days: [], times: [], majors: [] };

    expect(queryFilter(lecture, options)).toBe(true);
  });

  it("query가 공백만 있으면 모든 강의를 통과시킨다", () => {
    const lecture = createLecture("306770", "경제수학");
    const options = {
      query: "   ",
      grades: [],
      days: [],
      times: [],
      majors: [],
    };

    expect(queryFilter(lecture, options)).toBe(true);
  });

  it("제목에 query가 포함되면 true를 반환한다", () => {
    const lecture = createLecture("306770", "경제수학");
    const options = {
      query: "경제",
      grades: [],
      days: [],
      times: [],
      majors: [],
    };

    expect(queryFilter(lecture, options)).toBe(true);
  });

  it("강의 ID에 query가 포함되면 true를 반환한다", () => {
    const lecture = createLecture("306770", "경제수학");
    const options = {
      query: "306770",
      grades: [],
      days: [],
      times: [],
      majors: [],
    };

    expect(queryFilter(lecture, options)).toBe(true);
  });

  it("대소문자를 구분하지 않고 검색한다 - 제목", () => {
    const lecture = createLecture("306770", "경제수학");
    const options = {
      query: "경제수학",
      grades: [],
      days: [],
      times: [],
      majors: [],
    };

    expect(queryFilter(lecture, options)).toBe(true);
  });

  it("대소문자를 구분하지 않고 검색한다 - ID", () => {
    const lecture = createLecture("CS101", "자료구조");
    const options = {
      query: "cs101",
      grades: [],
      days: [],
      times: [],
      majors: [],
    };

    expect(queryFilter(lecture, options)).toBe(true);
  });

  it("제목의 일부만 검색해도 찾는다", () => {
    const lecture = createLecture("306770", "경제수학");
    const options = {
      query: "수학",
      grades: [],
      days: [],
      times: [],
      majors: [],
    };

    expect(queryFilter(lecture, options)).toBe(true);
  });

  it("ID의 일부만 검색해도 찾는다", () => {
    const lecture = createLecture("306770", "경제수학");
    const options = {
      query: "770",
      grades: [],
      days: [],
      times: [],
      majors: [],
    };

    expect(queryFilter(lecture, options)).toBe(true);
  });

  it("제목과 ID 모두에 query가 없으면 false를 반환한다", () => {
    const lecture = createLecture("306770", "경제수학");
    const options = {
      query: "알고리즘",
      grades: [],
      days: [],
      times: [],
      majors: [],
    };

    expect(queryFilter(lecture, options)).toBe(false);
  });
});

describe("gradeFilter", () => {
  const createLecture = (grade: number): LectureWithLowerCased => ({
    id: "306770",
    title: "경제수학",
    credits: "3(0)",
    major: "SW융합대학<p>SW융합학부<p>SW융합경제경영전공",
    schedule: "월16~18(상경415)<p>수16~18(상경415)",
    grade,
    lowerCasedId: "306770",
    lowerCasedTitle: "경제수학",
  });

  it("grades 배열이 비어있으면 모든 강의를 통과시킨다", () => {
    const lecture = createLecture(1);
    const options = { grades: [], days: [], times: [], majors: [] };

    expect(gradeFilter(lecture, options)).toBe(true);
  });

  it("강의 학년이 grades에 포함되면 true를 반환한다", () => {
    const lecture = createLecture(1);
    const options = { grades: [1, 2, 3], days: [], times: [], majors: [] };

    expect(gradeFilter(lecture, options)).toBe(true);
  });

  it("강의 학년이 grades에 포함되지 않으면 false를 반환한다", () => {
    const lecture = createLecture(4);
    const options = { grades: [1, 2, 3], days: [], times: [], majors: [] };

    expect(gradeFilter(lecture, options)).toBe(false);
  });

  it("여러 학년 중 하나와 일치하면 true를 반환한다", () => {
    const lecture = createLecture(2);
    const options = { grades: [2, 4], days: [], times: [], majors: [] };

    expect(gradeFilter(lecture, options)).toBe(true);
  });
});

describe("majorFilter", () => {
  const createLecture = (major: string): LectureWithLowerCased => ({
    id: "306770",
    title: "경제수학",
    credits: "3(0)",
    major,
    schedule: "월16~18(상경415)<p>수16~18(상경415)",
    grade: 1,
    lowerCasedId: "306770",
    lowerCasedTitle: "경제수학",
  });

  it("majors 배열이 비어있으면 모든 강의를 통과시킨다", () => {
    const lecture = createLecture(
      "SW융합대학<p>SW융합학부<p>SW융합경제경영전공"
    );
    const options = { grades: [], days: [], times: [], majors: [] };

    expect(majorFilter(lecture, options)).toBe(true);
  });

  it("강의 전공이 majors에 포함되면 true를 반환한다", () => {
    const lecture = createLecture(
      "SW융합대학<p>SW융합학부<p>SW융합경제경영전공"
    );
    const options = {
      grades: [],
      days: [],
      times: [],
      majors: ["SW융합대학<p>SW융합학부<p>SW융합경제경영전공", "컴퓨터공학과"],
    };

    expect(majorFilter(lecture, options)).toBe(true);
  });

  it("강의 전공이 majors에 포함되지 않으면 false를 반환한다", () => {
    const lecture = createLecture("기계공학과");
    const options = {
      grades: [],
      days: [],
      times: [],
      majors: ["SW융합대학<p>SW융합학부<p>SW융합경제경영전공", "컴퓨터공학과"],
    };

    expect(majorFilter(lecture, options)).toBe(false);
  });

  it("복잡한 전공 문자열도 정확히 일치시킨다", () => {
    const lecture = createLecture("공학대학<p>전자공학과<p>전자공학전공");
    const options = {
      grades: [],
      days: [],
      times: [],
      majors: ["공학대학<p>전자공학과<p>전자공학전공"],
    };

    expect(majorFilter(lecture, options)).toBe(true);
  });
});

describe("creditsFilter", () => {
  const createLecture = (credits: string): LectureWithLowerCased => ({
    id: "306770",
    title: "경제수학",
    credits,
    major: "SW융합대학<p>SW융합학부<p>SW융합경제경영전공",
    schedule: "월16~18(상경415)<p>수16~18(상경415)",
    grade: 1,
    lowerCasedId: "306770",
    lowerCasedTitle: "경제수학",
  });

  it("credits가 설정되지 않으면 모든 강의를 통과시킨다", () => {
    const lecture = createLecture("3(0)");
    const options = { grades: [], days: [], times: [], majors: [] };

    expect(creditsFilter(lecture, options)).toBe(true);
  });

  it("credits가 undefined이면 모든 강의를 통과시킨다", () => {
    const lecture = createLecture("3(0)");
    const options = {
      credits: undefined,
      grades: [],
      days: [],
      times: [],
      majors: [],
    };

    expect(creditsFilter(lecture, options)).toBe(true);
  });

  it("강의 학점이 credits로 시작하면 true를 반환한다", () => {
    const lecture = createLecture("3(0)");
    const options = { credits: 3, grades: [], days: [], times: [], majors: [] };

    expect(creditsFilter(lecture, options)).toBe(true);
  });

  it("강의 학점이 credits로 시작하지 않으면 false를 반환한다", () => {
    const lecture = createLecture("2(0)");
    const options = { credits: 3, grades: [], days: [], times: [], majors: [] };

    expect(creditsFilter(lecture, options)).toBe(false);
  });

  it("1학점 강의를 정확히 필터링한다", () => {
    const lecture = createLecture("1(0)");
    const options = { credits: 1, grades: [], days: [], times: [], majors: [] };

    expect(creditsFilter(lecture, options)).toBe(true);
  });

  it("학점 문자열에 괄호가 있어도 정확히 매칭한다", () => {
    const lecture = createLecture("3(3)");
    const options = { credits: 3, grades: [], days: [], times: [], majors: [] };

    expect(creditsFilter(lecture, options)).toBe(true);
  });
});

describe("scheduleFilter", () => {
  const createLecture = (schedule: string): LectureWithLowerCased => ({
    id: "306770",
    title: "경제수학",
    credits: "3(0)",
    major: "SW융합대학<p>SW융합학부<p>SW융합경제경영전공",
    schedule,
    grade: 1,
    lowerCasedId: "306770",
    lowerCasedTitle: "경제수학",
  });

  beforeEach(() => {
    mockParseSchedule.mockClear();
  });

  it("days와 times가 모두 비어있으면 모든 강의를 통과시킨다", () => {
    const lecture = createLecture("월16~18(상경415)<p>수16~18(상경415)");
    const options = { grades: [], days: [], times: [], majors: [] };

    expect(scheduleFilter(lecture, options)).toBe(true);
    expect(mockParseSchedule).not.toHaveBeenCalled();
  });

  it("days가 설정되어 있고 일치하는 요일이 있으면 true를 반환한다", () => {
    const lecture = createLecture("월16~18(상경415)<p>수16~18(상경415)");
    mockParseSchedule.mockReturnValue([
      { day: "월", range: [16, 17, 18], room: "상경415" },
      { day: "수", range: [16, 17, 18], room: "상경415" },
    ]);

    const options = { grades: [], days: ["월"], times: [], majors: [] };

    expect(scheduleFilter(lecture, options)).toBe(true);
    expect(mockParseSchedule).toHaveBeenCalledWith(
      "월16~18(상경415)<p>수16~18(상경415)"
    );
  });

  it("days가 설정되어 있고 일치하는 요일이 없으면 false를 반환한다", () => {
    const lecture = createLecture("월16~18(상경415)<p>수16~18(상경415)");
    mockParseSchedule.mockReturnValue([
      { day: "월", range: [16, 17, 18], room: "상경415" },
      { day: "수", range: [16, 17, 18], room: "상경415" },
    ]);

    const options = { grades: [], days: ["화"], times: [], majors: [] };

    expect(scheduleFilter(lecture, options)).toBe(false);
  });

  it("여러 요일 중 하나라도 일치하면 true를 반환한다", () => {
    const lecture = createLecture("월16~18(상경415)<p>수16~18(상경415)");
    mockParseSchedule.mockReturnValue([
      { day: "월", range: [16, 17, 18], room: "상경415" },
      { day: "수", range: [16, 17, 18], room: "상경415" },
    ]);

    const options = { grades: [], days: ["화", "수"], times: [], majors: [] };

    expect(scheduleFilter(lecture, options)).toBe(true);
  });

  it("times가 설정되어 있고 일치하는 시간이 있으면 true를 반환한다", () => {
    const lecture = createLecture("월16~18(상경415)<p>수16~18(상경415)");
    mockParseSchedule.mockReturnValue([
      { day: "월", range: [16, 17, 18], room: "상경415" },
      { day: "수", range: [16, 17, 18], room: "상경415" },
    ]);

    const options = { grades: [], days: [], times: [16], majors: [] };

    expect(scheduleFilter(lecture, options)).toBe(true);
  });

  it("times가 설정되어 있고 일치하는 시간이 없으면 false를 반환한다", () => {
    const lecture = createLecture("월16~18(상경415)<p>수16~18(상경415)");
    mockParseSchedule.mockReturnValue([
      { day: "월", range: [16, 17, 18], room: "상경415" },
      { day: "수", range: [16, 17, 18], room: "상경415" },
    ]);

    const options = { grades: [], days: [], times: [1], majors: [] };

    expect(scheduleFilter(lecture, options)).toBe(false);
  });

  it("여러 시간 중 하나라도 일치하면 true를 반환한다", () => {
    const lecture = createLecture("월16~18(상경415)<p>수16~18(상경415)");
    mockParseSchedule.mockReturnValue([
      { day: "월", range: [16, 17, 18], room: "상경415" },
      { day: "수", range: [16, 17, 18], room: "상경415" },
    ]);

    const options = { grades: [], days: [], times: [1, 17], majors: [] };

    expect(scheduleFilter(lecture, options)).toBe(true);
  });

  it("days와 times가 모두 설정되어 있고 둘 다 만족하면 true를 반환한다", () => {
    const lecture = createLecture("월16~18(상경415)<p>수16~18(상경415)");
    mockParseSchedule.mockReturnValue([
      { day: "월", range: [16, 17, 18], room: "상경415" },
      { day: "수", range: [16, 17, 18], room: "상경415" },
    ]);

    const options = { grades: [], days: ["월"], times: [16], majors: [] };

    expect(scheduleFilter(lecture, options)).toBe(true);
  });

  it("days와 times가 모두 설정되어 있고 days가 만족하지 않으면 false를 반환한다", () => {
    const lecture = createLecture("월16~18(상경415)<p>수16~18(상경415)");
    mockParseSchedule.mockReturnValue([
      { day: "월", range: [16, 17, 18], room: "상경415" },
      { day: "수", range: [16, 17, 18], room: "상경415" },
    ]);

    const options = { grades: [], days: ["화"], times: [16], majors: [] };

    expect(scheduleFilter(lecture, options)).toBe(false);
  });

  it("days와 times가 모두 설정되어 있고 times가 만족하지 않으면 false를 반환한다", () => {
    const lecture = createLecture("월16~18(상경415)<p>수16~18(상경415)");
    mockParseSchedule.mockReturnValue([
      { day: "월", range: [16, 17, 18], room: "상경415" },
      { day: "수", range: [16, 17, 18], room: "상경415" },
    ]);

    const options = { grades: [], days: ["월"], times: [1], majors: [] };

    expect(scheduleFilter(lecture, options)).toBe(false);
  });

  it("schedule이 빈 문자열이면 빈 배열로 처리하고 false를 반환한다", () => {
    const lecture = createLecture("");
    const options = { grades: [], days: ["월"], times: [], majors: [] };

    expect(scheduleFilter(lecture, options)).toBe(false);
    expect(mockParseSchedule).not.toHaveBeenCalled();
  });

  it("schedule이 null이면 빈 배열로 처리한다", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lecture = createLecture(null as any);

    const options = { grades: [], days: ["월"], times: [], majors: [] };

    expect(scheduleFilter(lecture, options)).toBe(false);
    expect(mockParseSchedule).not.toHaveBeenCalled();
  });

  it("복잡한 시간 범위도 정확히 처리한다", () => {
    const lecture = createLecture("월1~3(공학관101)<p>금10~12(과학관201)");
    mockParseSchedule.mockReturnValue([
      { day: "월", range: [1, 2, 3], room: "공학관101" },
      { day: "금", range: [10, 11, 12], room: "과학관201" },
    ]);

    const options = { grades: [], days: ["금"], times: [11], majors: [] };

    expect(scheduleFilter(lecture, options)).toBe(true);
  });
});

describe("filterLectures", () => {
  const createLecture = (
    id: string,
    title: string,
    grade: number,
    major: string,
    credits: string,
    schedule: string = ""
  ): LectureWithLowerCased => ({
    id,
    title,
    credits,
    major,
    schedule,
    grade,
    lowerCasedId: id.toLowerCase(),
    lowerCasedTitle: title.toLowerCase(),
  });

  beforeEach(() => {
    mockParseSchedule.mockClear();
  });

  it("모든 필터 조건이 비어있으면 모든 강의를 반환한다", () => {
    const lectures = [
      createLecture(
        "306770",
        "경제수학",
        1,
        "SW융합대학<p>SW융합학부<p>SW융합경제경영전공",
        "3(0)"
      ),
      createLecture("CS102", "알고리즘", 2, "컴퓨터공학과", "3(0)"),
    ];

    const options = { grades: [], days: [], times: [], majors: [] };

    expect(filterLectures(lectures, options)).toEqual(lectures);
  });

  it("query 필터만 적용한다", () => {
    const lectures = [
      createLecture("306770", "경제수학", 1, "SW융합대학", "3(0)"),
      createLecture("CS102", "알고리즘", 2, "컴퓨터공학과", "3(0)"),
      createLecture("MATH101", "경영수학", 1, "수학과", "3(0)"),
    ];

    const options = {
      query: "수학",
      grades: [],
      days: [],
      times: [],
      majors: [],
    };

    const result = filterLectures(lectures, options);
    expect(result).toHaveLength(2);
    expect(result.map((l) => l.id)).toEqual(["306770", "MATH101"]);
  });

  it("grade 필터만 적용한다", () => {
    const lectures = [
      createLecture("306770", "경제수학", 1, "SW융합대학", "3(0)"),
      createLecture("CS102", "알고리즘", 2, "컴퓨터공학과", "3(0)"),
      createLecture("MATH101", "미적분학", 1, "수학과", "3(0)"),
    ];

    const options = { grades: [1], days: [], times: [], majors: [] };

    const result = filterLectures(lectures, options);
    expect(result).toHaveLength(2);
    expect(result.map((l) => l.id)).toEqual(["306770", "MATH101"]);
  });

  it("여러 필터를 조합해서 적용한다", () => {
    // 각 스케줄에 따라 다른 파싱 결과를 반환하도록 설정
    mockParseSchedule.mockImplementation((schedule) => {
      if (schedule === "월16~18(상경415)") {
        return [{ day: "월", range: [16, 17, 18], room: "상경415" }];
      }
      if (schedule === "화1~2") {
        return [{ day: "화", range: [1, 2], room: "" }];
      }
      if (schedule === "수10~12") {
        return [{ day: "수", range: [10, 11, 12], room: "" }];
      }
      return [];
    });

    const lectures = [
      createLecture(
        "306770",
        "경제수학",
        1,
        "SW융합대학<p>SW융합학부<p>SW융합경제경영전공",
        "3(0)",
        "월16~18(상경415)"
      ),
      createLecture("CS102", "알고리즘", 2, "컴퓨터공학과", "3(0)", "화1~2"),
      createLecture(
        "ECON101",
        "경제학원론",
        1,
        "SW융합대학<p>SW융합학부<p>SW융합경제경영전공",
        "3(0)",
        "수10~12"
      ),
    ];

    const options = {
      query: "경제",
      grades: [1],
      days: ["월"],
      times: [],
      majors: ["SW융합대학<p>SW융합학부<p>SW융합경제경영전공"],
    };

    const result = filterLectures(lectures, options);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("306770");
  });

  it("조건에 맞지 않는 강의는 필터링된다", () => {
    const lectures = [
      createLecture(
        "306770",
        "경제수학",
        1,
        "SW융합대학<p>SW융합학부<p>SW융합경제경영전공",
        "3(0)"
      ),
      createLecture("CS102", "알고리즘", 2, "컴퓨터공학과", "3(0)"),
      createLecture("EE101", "전자회로", 1, "전자공학과", "3(0)"),
    ];

    const options = {
      grades: [1],
      days: [],
      times: [],
      majors: ["SW융합대학<p>SW융합학부<p>SW융합경제경영전공"],
    };

    const result = filterLectures(lectures, options);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("306770");
  });

  it("모든 조건을 만족하지 않으면 빈 배열을 반환한다", () => {
    const lectures = [
      createLecture("306770", "경제수학", 1, "SW융합대학", "3(0)"),
      createLecture("CS102", "알고리즘", 2, "컴퓨터공학과", "3(0)"),
    ];

    const options = {
      query: "물리학",
      grades: [3],
      days: [],
      times: [],
      majors: ["기계공학과"],
    };

    const result = filterLectures(lectures, options);
    expect(result).toHaveLength(0);
  });

  it("credits 필터도 정확히 적용한다", () => {
    const lectures = [
      createLecture("306770", "경제수학", 1, "SW융합대학", "3(0)"),
      createLecture("CS102", "알고리즘", 2, "컴퓨터공학과", "2(0)"),
      createLecture("MATH101", "미적분학", 1, "수학과", "3(3)"),
    ];

    const options = { credits: 3, grades: [], days: [], times: [], majors: [] };

    const result = filterLectures(lectures, options);
    expect(result).toHaveLength(2);
    expect(result.map((l) => l.id)).toEqual(["306770", "MATH101"]);
  });

  it("schedule 필터도 정확히 적용한다", () => {
    // 첫 번째 강의의 스케줄
    mockParseSchedule.mockReturnValueOnce([
      { day: "월", range: [16, 17, 18], room: "상경415" },
      { day: "수", range: [16, 17, 18], room: "상경415" },
    ]);
    // 두 번째 강의의 스케줄
    mockParseSchedule.mockReturnValueOnce([
      { day: "화", range: [1, 2], room: "공학관101" },
    ]);
    // 세 번째 강의의 스케줄
    mockParseSchedule.mockReturnValueOnce([
      { day: "금", range: [10, 11, 12], room: "과학관201" },
    ]);

    const lectures = [
      createLecture(
        "306770",
        "경제수학",
        1,
        "SW융합대학",
        "3(0)",
        "월16~18(상경415)<p>수16~18(상경415)"
      ),
      createLecture(
        "CS102",
        "알고리즘",
        2,
        "컴퓨터공학과",
        "3(0)",
        "화1~2(공학관101)"
      ),
      createLecture(
        "MATH101",
        "미적분학",
        1,
        "수학과",
        "3(0)",
        "금10~12(과학관201)"
      ),
    ];

    const options = { grades: [], days: ["월"], times: [], majors: [] };

    const result = filterLectures(lectures, options);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("306770");
  });

  it("빈 강의 배열에 대해서도 안전하게 동작한다", () => {
    const lectures: LectureWithLowerCased[] = [];
    const options = {
      query: "경제",
      grades: [1],
      days: [],
      times: [],
      majors: [],
    };

    const result = filterLectures(lectures, options);
    expect(result).toEqual([]);
  });

  it("모든 필터가 복합적으로 적용되는 복잡한 시나리오", () => {
    mockParseSchedule.mockReturnValue([
      { day: "월", range: [16, 17, 18], room: "상경415" },
      { day: "수", range: [16, 17, 18], room: "상경415" },
    ]);

    const lectures = [
      createLecture(
        "306770",
        "경제수학",
        1,
        "SW융합대학<p>SW융합학부<p>SW융합경제경영전공",
        "3(0)",
        "월16~18(상경415)<p>수16~18(상경415)"
      ),
      createLecture(
        "306771",
        "경제학원론",
        1,
        "SW융합대학<p>SW융합학부<p>SW융합경제경영전공",
        "3(0)",
        "월16~18(상경415)<p>수16~18(상경415)"
      ),
      createLecture("CS102", "자료구조", 2, "컴퓨터공학과", "3(0)", "화1~2"),
      createLecture(
        "306772",
        "경영학개론",
        2,
        "SW융합대학<p>SW융합학부<p>SW융합경제경영전공",
        "2(0)",
        "월16~18"
      ),
    ];

    const options = {
      query: "경제",
      grades: [1],
      days: ["월"],
      times: [16],
      majors: ["SW융합대학<p>SW융합학부<p>SW융합경제경영전공"],
      credits: 3,
    };

    const result = filterLectures(lectures, options);
    expect(result).toHaveLength(2);
    expect(result.map((l) => l.id)).toEqual(["306770", "306771"]);
  });
});
