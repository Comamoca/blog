import * as log from "jsr:@std/log";

log.setup({
  handlers: {
    console: new log.ConsoleHandler("DEBUG"),
    file: new log.FileHandler("DEBUG", {
      filename: "./log.txt",
      formatter: (record) => `${record.levelName} ${record.msg}`,
    }),
  },

  loggers: {
    default: {
      level: "DEBUG",
      // handlers: ["console", "file"], // for debug
      handlers: ["file"],
    },

    tasks: {
      level: "ERROR",
      handlers: ["console"],
    },
  },
});

export const logger = log.getLogger();
