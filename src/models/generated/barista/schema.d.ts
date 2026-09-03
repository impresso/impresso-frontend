
/* eslint-disable */
/**
 * This file was automatically generated from OpenAPI specification.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source OpenAPI spec,
 * and regenerate this file.
 */

export type paths = {
    "/chat": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Chat Endpoint */
        post: operations["chat_endpoint_chat_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/chat/history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Chat History Endpoint */
        get: operations["chat_history_endpoint_chat_history_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/chat/stream": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Chat Stream Endpoint
         * @description Stream agent responses as they are generated.
         *     Each chunk is a JSON object representing a BaristaResponse update.
         */
        post: operations["chat_stream_endpoint_chat_stream_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
};
export type webhooks = Record<string, never>;
export type components = {
    schemas: {
        /** BaristaAIMessage */
        BaristaAIMessage: {
            /**
             * Content
             * @description The content of the LLM response.
             */
            content: string;
            /**
             * Id
             * @description Unique identifier for the message.
             */
            id?: string;
            /**
             * Reasoningcontent
             * @description The reasoning content of the LLM response.
             */
            reasoningContent?: string | null;
            /**
             * Sessionid
             * @description Session ID for the conversation.
             */
            sessionId: string;
            /** @description Structured response from Barista agent. */
            structuredResponse?: components["schemas"]["BaristaFormattedResponse"] | null;
            /**
             * Toolcalls
             * @description List of tool calls requested by the LLM.
             */
            toolCalls?: components["schemas"]["BaristaToolCall"][] | null;
            /**
             * Type
             * @description The type of the message.
             * @default ai
             * @constant
             */
            type: "ai";
        };
        /** BaristaErrorMessage */
        BaristaErrorMessage: {
            /**
             * Content
             * @description The content of the error message.
             */
            content: string;
            /**
             * Sessionid
             * @description Session ID for the conversation.
             */
            sessionId: string;
            /**
             * Type
             * @description The type of the message.
             * @default error
             * @constant
             */
            type: "error";
        };
        /** BaristaFormattedResponse */
        BaristaFormattedResponse: {
            /**
             * Assistantclarification
             * @description Message used when the user request does not match search construction,             web app guidance, or search analysis. Clarifies the assistant's role and redirects the user.
             */
            assistantClarification?: string | null;
            /**
             * Impressohelp
             * @description Help message to the user about how to use the Impresso Barista.
             */
            impressoHelp?: string | null;
            /** @description The search query filters to use for retrieving data. */
            searchQuery?: components["schemas"]["Filters"] | null;
            /**
             * Searchquerydestination
             * @description The destination of the search query results (content item by default).
             */
            searchQueryDestination?: ("content_items" | "text_reuse" | "images") | null;
            /**
             * Searchquerysteps
             * @description Step-by-step narration of how the search query was constructed.
             */
            searchQuerySteps?: string[] | null;
            /**
             * Searchquerysummary
             * @description Analysed summary of facets of the search query filters (facets tool call required).
             */
            searchQuerySummary?: string | null;
        };
        /** BaristaHumanMessage */
        BaristaHumanMessage: {
            /**
             * Content
             * @description The content of the human message.
             */
            content: string;
            /**
             * Id
             * @description Unique identifier for the message.
             */
            id?: string;
            /**
             * Intent
             * @description The intent of the human message, if it can be determined.
             */
            intent?: string | null;
            /**
             * Prohibitedfiltertypes
             * @description Filter types the agent should not use when building search queries.
             */
            prohibitedFilterTypes?: string[] | null;
            /** @description The search query context included with the human message, if any. */
            searchQuery?: components["schemas"]["Filters"] | null;
            /**
             * Sessionid
             * @description Session ID for the conversation.
             */
            sessionId: string;
            /**
             * Suggestedconversationtitle
             * @description A suggested title for the conversation.
             */
            suggestedConversationTitle?: string | null;
            /**
             * Type
             * @description The type of the message.
             * @default human
             * @constant
             */
            type: "human";
        };
        /** BaristaRequest */
        BaristaRequest: {
            /**
             * Additionalinstructions
             * @description Additional instructions to guide the agent's response. This is an extra added in             addition to the system prompt.
             */
            additionalInstructions?: string | null;
            /**
             * Agenttype
             * @description The type of agent to use.
             * @default router
             * @enum {string}
             */
            agentType: "react" | "router" | "skills";
            /**
             * Message
             * @description The message to send to the Barista agent.
             */
            message: string;
            /**
             * Modelid
             * @description The ID of the model to use.
             */
            modelId?: ("llama-3.3-70b-versatile" | "llama-3.1-8b-instant" | "qwen/qwen3-32b" | "openai/gpt-oss-20b" | "openai/gpt-oss-120b") | null;
            /**
             * Prohibitedfiltertypes
             * @description A list of filter types that the agent should not be using in the search query it builds. These types are still understood.
             */
            prohibitedFilterTypes?: string[] | null;
            /** @description Current query filters for the context, if different from the last set in the conversation. */
            searchQuery?: components["schemas"]["Filters"] | null;
            /**
             * Sessionid
             * @description Session ID for the conversation.
             */
            sessionId?: string;
        };
        /** BaristaResponse */
        BaristaResponse: {
            /**
             * Messages
             * @description List of messages in the conversation.
             */
            messages: (components["schemas"]["BaristaHumanMessage"] | components["schemas"]["BaristaAIMessage"] | components["schemas"]["BaristaToolMessage"] | components["schemas"]["BaristaErrorMessage"])[];
        };
        /** BaristaToolCall */
        BaristaToolCall: {
            /**
             * Args
             * @description The arguments to pass to the tool
             */
            args: {
                [key: string]: unknown;
            };
            /**
             * Id
             * @description Unique identifier for the tool call.
             */
            id?: string;
            /**
             * Name
             * @description The name of the tool to call.
             */
            name: string;
        };
        /** BaristaToolMessage */
        BaristaToolMessage: {
            /**
             * Content
             * @description The content returned by the tool.
             */
            content: string;
            /**
             * Id
             * @description Unique identifier for the message.
             */
            id?: string;
            /**
             * Name
             * @description The name of the tool used.
             */
            name: string;
            /**
             * Sessionid
             * @description Session ID for the conversation.
             */
            sessionId: string;
            /**
             * Status
             * @description The status of the tool execution.
             */
            status: string;
            /** @description Structured response from Barista agent. */
            structuredResponse?: components["schemas"]["BaristaFormattedResponse"] | null;
            /**
             * Toolcallid
             * @description The ID of the tool call that this message is responding to, if applicable.
             */
            toolCallId?: string | null;
            /**
             * Type
             * @description The type of the message.
             * @default tool
             * @constant
             */
            type: "tool";
        };
        /**
         * Filter
         * @description Impresso Search Filter
         */
        Filter: {
            /**
             * Context
             * @description Filter context
             * @default include
             * @enum {string}
             */
            context: "include" | "exclude";
            /**
             * Op
             * @description Filter operator. Choice depends on filter type and context.
             * @default AND
             * @enum {string}
             */
            op: "AND" | "OR";
            /**
             * Precision
             * @description Filter precision
             * @default exact
             * @enum {string}
             */
            precision: "exact" | "partial" | "fuzzy" | "soft";
            /**
             * Q
             * @description Value depends on the filter type. For boolean filters - not required. Non-string types should be converted to string.
             */
            q?: string[] | string;
            /**
             * Type
             * @description Filter type
             * @enum {string}
             */
            type: "hasTextContents" | "ocrQuality" | "contentLength" | "isFront" | "string" | "title" | "daterange" | "uid" | "copyright" | "partner" | "language" | "page" | "issue" | "newspaper" | "topic" | "year" | "type" | "sourceMedium" | "sourceType" | "country" | "mention" | "person" | "location" | "nag" | "organisation" | "regex" | "textReuseClusterSize" | "textReuseClusterLexicalOverlap" | "textReuseClusterDayDelta" | "contentItemId" | "textReusePassage" | "imageTechnique";
        };
        /**
         * Filters
         * @description Use this tool to parse search query.
         */
        Filters: {
            /**
             * Filters
             * @description List of filters
             */
            filters?: components["schemas"]["Filter"][];
        };
        /** HTTPValidationError */
        HTTPValidationError: {
            /** Detail */
            detail?: components["schemas"]["ValidationError"][];
        };
        /** ValidationError */
        ValidationError: {
            /** Context */
            ctx?: Record<string, never>;
            /** Input */
            input?: unknown;
            /** Location */
            loc: (string | number)[];
            /** Message */
            msg: string;
            /** Error Type */
            type: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
};
export type $defs = Record<string, never>;
export interface operations {
    chat_endpoint_chat_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BaristaRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BaristaResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    chat_history_endpoint_chat_history_get: {
        parameters: {
            query: {
                agentType?: "react" | "router" | "skills";
                sessionId: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BaristaResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    chat_stream_endpoint_chat_stream_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BaristaRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
}
