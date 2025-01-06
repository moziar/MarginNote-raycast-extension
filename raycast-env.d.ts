/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** undefined - Skip the unsigned mnaddon alert when open MarginNote */
  "skipAlert": boolean,
  /** Waiting Time - Wait for MarginNote to open, and then skip the alert */
  "waitingTime": "2" | "3" | "4" | "5" | "6"
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `search-notebook` command */
  export type SearchNotebook = ExtensionPreferences & {}
  /** Preferences accessible in the `take-note` command */
  export type TakeNote = ExtensionPreferences & {
  /** undefined - Show confetti when creating note successfully to celebrate */
  "showConfetti": boolean,
  /** Parent Note 1 - Just a note url, which to be used as the parent note of new note */
  "parentNote1": string,
  /** Parent Note 2 - You can also set the note alias */
  "parentNote2": string,
  /** Parent Note 3 - Exactly the same as above */
  "parentNote3"?: string,
  /** Parent Note 4 - Exactly the same as above */
  "parentNote4"?: string,
  /** Parent Note 5 - Exactly the same as above */
  "parentNote5"?: string,
  /** Common Tags - Tags that you usually use */
  "commonTags"?: string
}
  /** Preferences accessible in the `restart` command */
  export type Restart = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `search-notebook` command */
  export type SearchNotebook = {}
  /** Arguments passed to the `take-note` command */
  export type TakeNote = {}
  /** Arguments passed to the `restart` command */
  export type Restart = {}
}

