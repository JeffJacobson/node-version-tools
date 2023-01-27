import { readFile } from "node:fs/promises";
import type { PathLike } from "node:fs";

// type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 0;
// type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
// type Day =
//   | `${Month}`
//   | 13
//   | 14
//   | 15
//   | 16
//   | 17
//   | 18
//   | 19
//   | 20
//   | 21
//   | 22
//   | 23
//   | 24
//   | 25
//   | 26
//   | 27
//   | 28
//   | 29
//   | 30
//   | 31;

// /**
//  * Represents a year. Since Node was started in the 21st century
//  * All years will begin with "20" until the next millennium.
//  * @todo This type will need to be updated hundreds of years from
//  * when this was written. (I doubt anyone will care about this by then.)
//  */
// type YearString = `20${Digit}${Digit}`;
// /**
//  * A string representation of a date. Year-Month-Day
//  */
// type DateString = `${YearString}-${Month}-${Day}`;

/**
 * As of the type of writing, all version numbers
 * are either integers or decimal values that are < 1 preceded
 * by a "v", with no "build" or "revision" values.
 */
type VersionName = `v${number}`;

/**
 * Information about a single node version.
 */
export interface NodeVersionInfo {
  start: Date;
  lts?: Date;
  maintenance: Date;
  end: Date;
  codename?: string;
}

export type NodeVersionListing = Record<VersionName, NodeVersionInfo>;

const defaultUrl = new URL(
  "https://raw.githubusercontent.com/nodejs/Release/main/schedule.json"
);

function isUrl(
  urlOrFilePath: PathLike
): urlOrFilePath is URL | `http${"s" | ""}://${string}` {
  return (
    urlOrFilePath instanceof URL ||
    (typeof urlOrFilePath === "string" && /https?:/i.test(urlOrFilePath))
  );
}

export async function getNodeVersionSchedule(urlOrFilePath: PathLike = defaultUrl) {
  let jsonString: string;
  if (isUrl(urlOrFilePath)) {
    const response = await fetch(urlOrFilePath);
    jsonString = await response.text();
  } else {
    jsonString = await readFile(urlOrFilePath, {
      encoding: "utf-8",
    });
  }

  function reviver(this: any, key: string, value: any) {
    if (/(start)|(lts)|(maintenance)|(end)/i.test(value)) {
      return new Date(value);
    }
    return value;
  }
  const vList: NodeVersionListing = JSON.parse(jsonString, reviver);

  return vList;
}
