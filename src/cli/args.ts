import { parseArgs } from "node:util";

/**
 * Command line argument options type definition
 */
export interface CliOptions {
  /**
   * The path or URL to the OpenAPI specification file.
   */
  openApiSpecPath: string;
}

/**
 * Parses command-line arguments using Node.js's built-in `util.parseArgs`.
 * It specifically looks for the required '--api' argument which specifies
 * the path or URL to the OpenAPI specification.
 *
 * @returns {CliOptions} An object containing the parsed command-line options.
 * @throws {Error} Throws an error if the required '--api' argument is missing.
 * @see https://nodejs.org/api/util.html#utilparseargsconfig
 */
export function parseCliArgs(): CliOptions {
  const { values } = parseArgs({
    options: {
      api: {
        type: "string",
        required: true,
      },
    },
    strict: true, // Throw on unknown options
    allowPositionals: false, // Don't allow positional arguments for now
  });

  if (!values.api || typeof values.api !== "string") {
    const message = "The --api=<spec_path_or_url> argument is required.";
    throw new Error(message);
  }

  return {
    openApiSpecPath: values.api,
  };
}
