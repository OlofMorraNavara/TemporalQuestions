import { TibcoPayloadConverter } from "./src/payload-converter";
import { TibcoList } from "./src/types/tibco/TibcoList";
import { TibcoDuration } from "./src/types/tibco/TibcoDuration";

describe("Test payload converter class", () => {
  test("Input payload without classes does not change", () => {
    const input = { a: 1, b: "2", c: true };
    const converter = new TibcoPayloadConverter();
    expect(input).toEqual(converter.fromPayload(converter.toPayload(input)));
  });

  test("Input payload with random class forgets class", () => {
    class Test {}

    const input = { a: new Test() };
    const converter = new TibcoPayloadConverter();
    expect({ a: {} }).toEqual(
      converter.fromPayload(converter.toPayload(input)),
    );
  });

  test("Input payload with TibcoList class does not change", () => {
    const input = { a: new TibcoList() };
    const converter = new TibcoPayloadConverter();

    let output: { a: any } = converter.fromPayload(converter.toPayload(input));
    expect(output.a).toBeInstanceOf(TibcoList);
  });

  test("Input payload with TibcoList class with items does not change", () => {
    const tibcoList = new TibcoList([{ b: 1 }]);
    const input = { a: tibcoList };
    const converter = new TibcoPayloadConverter();

    let output: { a: any } = converter.fromPayload(converter.toPayload(input));
    expect(output.a).toStrictEqual(tibcoList);
  });

  test("Input payload with nested TibcoList class with items does not change", () => {
    const tibcoList = new TibcoList([{ c: 1 }]);
    const input = { a: { b: tibcoList } };
    const converter = new TibcoPayloadConverter();

    let output: { a: any } = converter.fromPayload(converter.toPayload(input));
    expect(output.a.b).toBeInstanceOf(TibcoList);
    expect(output.a.b).toStrictEqual(tibcoList);
  });

  test("Input payload with TibcoDuration class does not change", () => {
    const tibcoDuration = new TibcoDuration(1, 0, 0, 0, 0, 0, 100);
    const input = { a: tibcoDuration };
    const converter = new TibcoPayloadConverter();

    let output: { a: any } = converter.fromPayload(converter.toPayload(input));

    expect(output.a).toBeInstanceOf(TibcoDuration);
    expect(output.a).toStrictEqual(tibcoDuration);
  });

  test("Input payload with TibcoDuration class does not change", () => {
    const tibcoDuration = new TibcoDuration(1, 0, 0, 0, 0, 0, 100);
    const input = tibcoDuration;
    const converter = new TibcoPayloadConverter();

    let output: any = converter.fromPayload(converter.toPayload(input));

    expect(output).toBeInstanceOf(TibcoDuration);
    expect(output).toStrictEqual(tibcoDuration);
  });

  test("Input payload with array of Tibco objects does not change", () => {
    const tibcoDuration1 = new TibcoDuration(1, 0, 0, 0, 0, 0, 100);
    const tibcoDuration2 = new TibcoDuration(2, 0, 0, 0, 0, 0, 100);
    const input = [tibcoDuration1, tibcoDuration2];
    const converter = new TibcoPayloadConverter();

    let output: any = converter.fromPayload(converter.toPayload(input));

    expect(output).toStrictEqual([tibcoDuration1, tibcoDuration2]);
  });

  test("Input payload with object containing array and tibco Tibco object does not change", () => {
    const tibcoDuration1 = new TibcoDuration(1, 0, 0, 0, 0, 0, 100);
    const tibcoDuration2 = new TibcoDuration(2, 0, 0, 0, 0, 0, 100);
    const tibcoDuration3 = new TibcoDuration(3, 0, 0, 0, 0, 0, 100);
    const input = { tibcoDuration1, a: [tibcoDuration2, tibcoDuration3] };
    const converter = new TibcoPayloadConverter();

    let output: any = converter.fromPayload(converter.toPayload(input));

    expect(output).toStrictEqual({
      tibcoDuration1,
      a: [tibcoDuration2, tibcoDuration3],
    });
  });

  test("Input payload with TibcoDuration class nested does not change", () => {
    const tibcoDuration1 = new TibcoDuration(1, 0, 0, 0, 0, 0, 100);
    const tibcoDuration2 = new TibcoDuration(2, 0, 0, 0, 0, 0, 100);
    const tibcoDuration3 = new TibcoDuration(3, 0, 0, 0, 0, 0, 100);
    const tibcoDuration4 = new TibcoDuration(4, 0, 0, 0, 0, 0, 100);
    const input = { a: { c: tibcoDuration1}, b: { d: { e: tibcoDuration2, f: [tibcoDuration3, tibcoDuration4]}} };
    const converter = new TibcoPayloadConverter();

    let output: { a: { c: any}, b: { d: { e: any, f: [any, any]}} } = converter.fromPayload(converter.toPayload(input));

    expect(output).toStrictEqual(input);
  });
});
