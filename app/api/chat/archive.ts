// const recipe_response_functions: ChatCompletionCreateParams.Function[] = [
//   {
//     name: "create_recipes_response",
//     description: "Create a response to the user based on the recipes they want.",
//     parameters: {
//       type: "object",
//       properties: {
//         introduction: {
//           type: "string",
//           description:
//             "The introduction to the response. Can be something like 'Here are some recipes for you:', but more creative to fit the user's question.",
//         },
//         recipes: {
//           type: "array",
//           items: {
//             type: "object",
//             properties: {
//               context: {
//                 type: "string",
//                 description:
//                   'Context to be provided above the link to this particular recipe. For example, "A delicious vegan soup".',
//               },
//               link: {
//                 type: "string",
//                 description: "A link to the recipe.",
//               },
//             },
//             required: ["context", "link"],
//           },
//         },
//         followUp1: {
//           type: "string",
//           description:
//             "A follow up question that the user may want to ask you. For example, 'Would you like to see more recipes?'",
//         },
//         followUp2: {
//           type: "string",
//           description:
//             "A follow up question that the user may want to ask you. For example, 'Would you like to see more recipes?'. Must differ from followUp1.",
//         },
//       },
//       required: ["introduction", "recipes", "followUp1", "followUp2"],
//     },
//   },
// ];


// const intent_classification_functions: ChatCompletionCreateParams.Function[] = [
//   {
//     name: "classify_intent",
//     description:
//       "Determine if user wants a list of recipes, or if they want general information about RecipeBot.",
//     parameters: {
//       type: "object",
//       properties: {
//         intent: {
//           type: "string",
//           enum: ["recipes", "general_info"],
//           description: "The user intent classification.",
//         },
//       },
//       required: ["intent"],
//     },
//   },
// ];



// const form_assistant_response_functions: ChatCompletionCreateParams.Function[] = [
//   {
//     name: "create_form_assistant_response",
//     description: "Your response to the user, describing the smallest possible step they can take towards completing the form. If you don't know what they should do next, your instruction should be for the user to provide you with information, and your suggestions should be for events that allow the user to provide you with information within the chat.",
//     parameters: zodToJsonSchema(formAssistantResponseZodSchema),
//   },
// ];

export { };
