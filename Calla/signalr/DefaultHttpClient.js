// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
import { AbortError } from "./Errors";
import { FetchHttpClient } from "./FetchHttpClient";
import { HttpClient } from "./HttpClient";
import { XhrHttpClient } from "./XhrHttpClient";
/** Default implementation of {@link @microsoft/signalr.HttpClient}. */
export class DefaultHttpClient extends HttpClient {
    /** Creates a new instance of the {@link @microsoft/signalr.DefaultHttpClient}, using the provided {@link @microsoft/signalr.ILogger} to log messages. */
    constructor(logger) {
        super();
        if (typeof fetch !== "undefined") {
            this.httpClient = new FetchHttpClient(logger);
        }
        else if (typeof XMLHttpRequest !== "undefined") {
            this.httpClient = new XhrHttpClient(logger);
        }
        else {
            throw new Error("No usable HttpClient found.");
        }
    }
    /** @inheritDoc */
    send(request) {
        // Check that abort was not signaled before calling send
        if (request.abortSignal && request.abortSignal.aborted) {
            return Promise.reject(new AbortError());
        }
        if (!request.method) {
            return Promise.reject(new Error("No method defined."));
        }
        if (!request.url) {
            return Promise.reject(new Error("No url defined."));
        }
        return this.httpClient.send(request);
    }
}
//# sourceMappingURL=DefaultHttpClient.js.map