import * as z from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { JsonSchema7ObjectType } from "zod-to-json-schema/src/parsers/object";

export const FormValues = z
  .object({
    username: z
      .string()
      .min(2, {
        message: "Username must be at least 2 characters.",
      })
      .describe(
        "This is your public display name. It can be your real name or a pseudonym. You can only change this once every 30 days."
      )
      .max(30, {
        message: "Username must not be longer than 30 characters.",
      })
      .describe(
        "This is your public display name. It can be your real name or a pseudonym. You can only change this once every 30 days."
      ),
    email: z
      .string({
        required_error: "Please select an email to display.",
      })
      .email()
      .describe("You can manage verified email addresses in your email settings."),
    bio: z.string().max(160).min(4),
    // urls: z
    //   .array(
    //     z.object({
    //       value: z.string().url({ message: "Please enter a valid URL." }),
    //     })
    //   )
    //   .optional()
    //   .describe("Add links to your website, blog, or social media profiles."),
  })
  .describe("Your public profile.");
export type FormValues = z.infer<typeof FormValues>;

const profileFormJsonSchema = zodToJsonSchema(FormValues) as JsonSchema7ObjectType;
const getInputNames = (schema: JsonSchema7ObjectType): string[] => Object.keys(schema.properties);

export const FIELD_TARGETS = getInputNames(profileFormJsonSchema).map((name) => `field.${name}`);
