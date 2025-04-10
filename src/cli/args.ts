import { parseArgs } from "util";

/**
 * Command line argument options type definition
 */
export interface CliOptions {
  /**
   * OpenAPI specification path (file path or URL)
   */
  openApiSpecPath: string;
}

/**
 * Parse command line arguments and return CliOptions
 * @returns Parsed command line arguments object
 * @throws Error if required arguments are missing
 * @see https://bun.sh/guides/process/argv
 */
export function parseCliArgs(): CliOptions {
  const { values } = parseArgs({
    args: Bun.argv,
    options: {
      api: {
        type: "string",
        required: true,
      },
    },
    strict: false,
    allowPositionals: true,
  });

  if (!values.api) {
    throw new Error("OpenAPI specification path is required (--api=<path>)");
  }

  return {
    openApiSpecPath: values.api as string,
  };
}
