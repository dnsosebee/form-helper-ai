# Pairform
> **_NOTE:_**  This repo is under development. So far only the README is relevant.

Pairform is an ai-assisted tool for completing government forms. Pairform has two main interfaces -- on the left, a *chat and event log*, and on the right, a *form ui*. As a user of Pairform, you are free to fill out the form as normal without AI getting in the way. However, whenever you need help, the chat assistant is waiting for you and can assist you with *instructions that are contextualized to your current progress in the form* as well as *generative UI form elements* that bind to the form.

Why government forms? Because they are important, difficult, and our LLM (gpt-3.5) already has enough contextual information to answer questions about them. Another way to think about this project is "What if the collective internet knowledge of how to fill out government forms were integrated into an interface for filling out government forms".

## Development Plan
### Form Definitions
Forms will be defined using [JSON Schema](https://json-schema.org/) and their look will be customized using [React JSON Schema Form](https://rjsf-team.github.io/react-jsonschema-form/docs/).

We will start out with just one form, perhaps the w4. So we will need to make a JSON Schema for that. Shouldn't be too hard, but some manual labor to be sure!

### State Management
Pairform will be a NextJS app using the Vercel AI SDK for state management of chat data. State management for forms will be handled by React JSON Schema Form. All state will be client-side only, and later we can consider adding persistence.

### Chat Interface
The chat interface will stay up-to-date with the user's progress, displaying their edit history as well as clearly showing the currently next form item to fill out. There will be a text input for questions about the active step, which are answered by an LLM that has context of the user's progress so far and the form schema (or some useful subset of it). So the chat interface is a slower, simpler, and more conversational interface, whereas the form interface is fast and provides good contextual clues. The user gets the best of both worlds in that they may focus on one interface or the other, and while they do that the other interface reacts accordingly.

### Agent state machine
The chat log is driven in part by a deterministic finite-state machine that reacts to user events, and by a non-deterministic LLM agent that runs it's own FSM on the backend. The backend process will involve a "fan out" where first an LLM classifies the intent of the user question, then an LLM with full context of the user's progress answers the question and provides generative UI.

### Streaming generative UI
When getting LLM output we will stream JSON from OpenAI's function calling interface and optimistically parse it on the frontend. Once we know which Gen UI template we are using, we then basically hydrate a react component with whatever mixture of text and gen UI is streamed from OpenAI.

### Threading
Much like Slack/iMessage, we can have a threading feature where the user can reply to a question in particular. Similarly, the fact that a user fills out a question can be included in that thread.
