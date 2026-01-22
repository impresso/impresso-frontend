
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
            /** Impresso Help */
            impresso_help: string | null;
            search_query: components["schemas"]["Filters"] | null;
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
         * @description Single filter
         */
        Filter: {
            /** @default include */
            context: components["schemas"]["FilterContext"];
            /** @default AND */
            op: components["schemas"]["FilterOperator"];
            /** @default exact */
            precision: components["schemas"]["FilterPrecision"];
            /**
             * Q
             * @description Query string or list of strings to filter by.
             * @example Format: `YYYY-MM-DDT00:00:00Z TO YYYY-MM-DDT00:00:00Z` for `type=daterange`.
             * @example Format: [<id_1>, <id_2>] for `type=person` or `type=location`. The IDs must be resolved using the appropriate tool.
             * @example Format: [<term_1>, <term_2>] for `type=string`. If the keyword is a named entity, first try to resolve it using the appropriate tool to get its ID.
             */
            q?: string | string[] | null;
            type: components["schemas"]["FilterType"];
        };
        /**
         * FilterContext
         * @enum {string}
         */
        FilterContext: "include" | "exclude";
        /**
         * FilterOperator
         * @enum {string}
         */
        FilterOperator: "AND" | "OR";
        /**
         * FilterPrecision
         * @enum {string}
         */
        FilterPrecision: "exact" | "partial" | "fuzzy" | "soft";
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
        /**
         * FilterType
         * @enum {string}
         */
        FilterType: "uid" | "hasTextContents" | "title" | "isFront" | "page" | "issue" | "string" | "entity" | "newspaper" | "daterange" | "language" | "type" | "regex" | "person" | "location" | "org" | "topic" | "collection" | "ocrQuality" | "contentLength" | "country" | "accessRight" | "partner" | "month" | "textReuseClusterSize" | "textReuseClusterLexicalOverlap" | "textReuseClusterDayDelta" | "textReuseCluster" | "mentionFunction" | "nag" | "wikidataId" | "dataDomain" | "copyright";
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
