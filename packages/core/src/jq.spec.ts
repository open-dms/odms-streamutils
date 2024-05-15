import { describe, expect, it } from "bun:test";
import { jq } from "./jq";
import { finished, pipeline } from "stream/promises";

describe("jq", () => {
  it("should filter json string", async () => {
    const results: Array<string> = [];
    await finished(
      jq(".data[].id as $id | {id:$id}")
        .on("data", (data: string) => results.push(data))
        .end(JSON.stringify({ data: [{ id: 1 }, { id: 2 }] }))
    );
    expect(results).toEqual([`{\"id\":1}\n{\"id\":2}`]);
  });

  it("should filter parsed json object", async () => {
    const results: Array<string> = [];
    await finished(
      jq(".data[].id as $id | {id:$id}")
        .on("data", (data: string) => results.push(data))
        .end({ data: [{ id: 1 }, { id: 2 }] })
    );
    expect(results).toEqual([`{\"id\":1}\n{\"id\":2}`]);
  });

  it("should output numbers", async () => {
    const results: Array<string> = [];
    await finished(
      jq("..|.data?[]?.id")
        .on("data", (data: string) => results.push(data))
        .end({ data: [{ id: 1 }, { id: 2 }] })
    );
    expect(results).toEqual(["1\n2"]);
  });

  it("should output strings", async () => {
    const results: Array<string> = [];
    await finished(
      jq("..|.data?[]?.id")
        .on("data", (data: string) => results.push(data))
        .end({ data: [{ id: "1" }, { id: "2" }] })
    );
    expect(results).toEqual([`"1"\n"2"`]);
  });
});
