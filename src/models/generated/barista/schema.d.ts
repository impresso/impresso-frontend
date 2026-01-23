
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
        /** AIMessage */
        AIMessage: {
            /**
             * Content
             * @description The content of the LLM response.
             */
            content: string;
            /**
             * Reasoningcontent
             * @description The reasoning content of the LLM response.
             */
            reasoningContent?: string | null;
            /**
             * Source
             * @description Source message from the underlying system.
             */
            source?: {
                [key: string]: unknown;
            } | null;
            /** @description Structured response from Barista agent. */
            structuredResponse?: components["schemas"]["BaristaFormattedResponse"] | null;
            /**
             * Toolcalls
             * @description List of tool calls requested by the LLM.
             */
            toolCalls?: {
                [key: string]: unknown;
            }[] | null;
            /**
             * Type
             * @description The type of the message.
             * @default ai
             * @constant
             */
            type: "ai";
        };
        /** BaristaFormattedResponse */
        BaristaFormattedResponse: {
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
             * Searchquerysummary
             * @description Analysed summary of facets of the search query filters (facets tool call required).
             */
            searchQuerySummary?: string | null;
        };
        /** BaristaRequest */
        BaristaRequest: {
            /**
             * Message
             * @description The message to send to the Barista agent.
             */
            message: string;
            /**
             * Model Name
             * @description The name of the model to use.
             */
            model_name?: ("llama-3.3-70b-versatile" | "llama-3.1-8b-instant" | "qwen/qwen3-32b" | "openai/gpt-oss-20b") | null;
            /**
             * Session Id
             * @description Session ID for the conversation.
             */
            session_id?: string | null;
        };
        /** BaristaResponse */
        BaristaResponse: {
            /**
             * Messages
             * @description List of messages in the conversation.
             */
            messages: (components["schemas"]["HumanMessage"] | components["schemas"]["AIMessage"] | components["schemas"]["ToolMessage"])[];
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
            type: "hasTextContents" | "ocrQuality" | "contentLength" | "isFront" | "string" | "title" | "daterange" | "uid" | "copyright" | "partner" | "language" | "page" | "issue" | "newspaper" | "topic" | "year" | "type" | "sourceMedium" | "sourceType" | "country" | "mention" | "person" | "location" | "nag" | "org" | "regex" | "textReuseClusterSize" | "textReuseClusterLexicalOverlap" | "textReuseClusterDayDelta" | "contentItemId" | "textReusePassage" | "imageTechnique";
        };
        /**
         * Filters
         * @description Always use this tool to structure your response to the user.
         */
        Filters: {
            /**
             * Filters
             * @description List of filters to apply
             */
            filters?: components["schemas"]["Filter"][];
        };
        /** HTTPValidationError */
        HTTPValidationError: {
            /** Detail */
            detail?: components["schemas"]["ValidationError"][];
        };
        /** HumanMessage */
        HumanMessage: {
            /**
             * Content
             * @description The content of the human message.
             */
            content: string;
            /**
             * Source
             * @description Source message from the underlying system.
             */
            source?: {
                [key: string]: unknown;
            } | null;
            /**
             * Type
             * @description The type of the message.
             * @default human
             * @constant
             */
            type: "human";
        };
        /** ToolMessage */
        ToolMessage: {
            /**
             * Content
             * @description The content returned by the tool.
             */
            content: string;
            /**
             * Name
             * @description The name of the tool used.
             */
            name: string;
            /**
             * Source
             * @description Source message from the underlying system.
             */
            source?: {
                [key: string]: unknown;
            } | null;
            /**
             * Status
             * @description The status of the tool execution.
             */
            status: string;
            /** @description Structured response from Barista agent. */
            structuredResponse?: components["schemas"]["BaristaFormattedResponse"] | null;
            /**
             * Type
             * @description The type of the message.
             * @default tool
             * @constant
             */
            type: "tool";
        };
        /** ValidationError */
        ValidationError: {
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
