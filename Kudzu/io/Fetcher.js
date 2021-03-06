import { waitFor } from "../events/waitFor";
import { createScript } from "../html/script";
import { dumpProgress } from "../tasks/progressCallback";
import { splitProgress } from "../tasks/splitProgress";
import { isDefined, isFunction, isNullOrUndefined, isXHRBodyInit } from "../typeChecks";
function normalizeMap(map, key, value) {
    if (isNullOrUndefined(map)) {
        map = new Map();
    }
    if (!map.has(key)) {
        map.set(key, value);
    }
    return map;
}
function trackXHRProgress(name, xhr, target, onProgress, skipLoading, prevTask) {
    return new Promise((resolve, reject) => {
        let done = false;
        let loaded = skipLoading;
        function maybeResolve() {
            if (loaded && done) {
                resolve();
            }
        }
        async function onError() {
            await prevTask;
            reject(xhr.status);
        }
        target.addEventListener("loadstart", async () => {
            await prevTask;
            onProgress(0, 1, name);
        });
        target.addEventListener("progress", async (ev) => {
            const evt = ev;
            await prevTask;
            onProgress(evt.loaded, Math.max(evt.loaded, evt.total), name);
            if (evt.loaded === evt.total) {
                loaded = true;
                maybeResolve();
            }
        });
        target.addEventListener("load", async () => {
            await prevTask;
            onProgress(1, 1, name);
            done = true;
            maybeResolve();
        });
        target.addEventListener("error", onError);
        target.addEventListener("abort", onError);
    });
}
function setXHRHeaders(xhr, method, path, xhrType, headers) {
    xhr.open(method, path);
    xhr.responseType = xhrType;
    if (headers) {
        for (const [key, value] of headers) {
            xhr.setRequestHeader(key, value);
        }
    }
}
async function blobToBuffer(blob) {
    const buffer = await blob.arrayBuffer();
    return {
        buffer,
        contentType: blob.type
    };
}
export class Fetcher {
    normalizeOnProgress(headers, onProgress) {
        if (isNullOrUndefined(onProgress)
            && isFunction(headers)) {
            onProgress = headers;
        }
        if (!isFunction(onProgress)) {
            onProgress = dumpProgress;
        }
        return onProgress;
    }
    normalizeHeaders(headers) {
        if (headers instanceof Map) {
            return headers;
        }
        return undefined;
    }
    async getXHR(path, xhrType, headers, onProgress) {
        const xhr = new XMLHttpRequest();
        const download = trackXHRProgress("downloading", xhr, xhr, onProgress, true, Promise.resolve());
        setXHRHeaders(xhr, "GET", path, xhrType, headers);
        xhr.send();
        await download;
        return xhr.response;
    }
    async postXHR(path, xhrType, obj, headers, onProgress) {
        const [upProg, downProg] = splitProgress(onProgress, [1, 1]);
        const xhr = new XMLHttpRequest();
        const upload = trackXHRProgress("uploading", xhr, xhr.upload, upProg, false, Promise.resolve());
        const download = trackXHRProgress("saving", xhr, xhr, downProg, true, upload);
        let body = null;
        if (isXHRBodyInit(obj)) {
            body = obj;
            if (obj instanceof Document) {
                headers = normalizeMap(headers, "Content-Type", "text/xml;charset=UTF-8");
            }
            else if (!(obj instanceof FormData)) {
                headers = normalizeMap(headers, "Content-Type", "application/octet-stream");
            }
        }
        else if (isDefined(obj)) {
            body = JSON.stringify(obj);
            headers = normalizeMap(headers, "Content-Type", "application/json;charset=UTF-8");
        }
        setXHRHeaders(xhr, "POST", path, xhrType, headers);
        if (isDefined(body)) {
            xhr.send(body);
        }
        else {
            xhr.send();
        }
        await upload;
        await download;
        return xhr.response;
    }
    async _getBuffer(path, headers, onProgress) {
        onProgress = this.normalizeOnProgress(headers, onProgress);
        headers = this.normalizeHeaders(headers);
        const blob = await this.getXHR(path, "blob", headers, onProgress);
        return await blobToBuffer(blob);
    }
    async getBuffer(path, headers, onProgress) {
        return await this._getBuffer(path, headers, onProgress);
    }
    async _postObjectForBuffer(path, obj, headers, onProgress) {
        onProgress = this.normalizeOnProgress(headers, onProgress);
        headers = this.normalizeHeaders(headers);
        const blob = await this.postXHR(path, "blob", obj, headers, onProgress);
        return await blobToBuffer(blob);
    }
    async postObjectForBuffer(path, obj, headers, onProgress) {
        return await this._postObjectForBuffer(path, obj, headers, onProgress);
    }
    async _getBlob(path, headers, onProgress) {
        onProgress = this.normalizeOnProgress(headers, onProgress);
        headers = this.normalizeHeaders(headers);
        return await this.getXHR(path, "blob", headers, onProgress);
    }
    async getBlob(path, headers, onProgress) {
        return this._getBlob(path, headers, onProgress);
    }
    async _postObjectForBlob(path, obj, headers, onProgress) {
        onProgress = this.normalizeOnProgress(headers, onProgress);
        headers = this.normalizeHeaders(headers);
        return await this.postXHR(path, "blob", obj, headers, onProgress);
    }
    async postObjectForBlob(path, obj, headers, onProgress) {
        return this._postObjectForBlob(path, obj, headers, onProgress);
    }
    async _getFile(path, headers, onProgress) {
        onProgress = this.normalizeOnProgress(headers, onProgress);
        headers = this.normalizeHeaders(headers);
        const blob = await this._getBlob(path, headers, onProgress);
        return URL.createObjectURL(blob);
    }
    async getFile(path, headers, onProgress) {
        return await this._getFile(path, headers, onProgress);
    }
    async _postObjectForFile(path, obj, headers, onProgress) {
        onProgress = this.normalizeOnProgress(headers, onProgress);
        headers = this.normalizeHeaders(headers);
        const blob = await this._postObjectForBlob(path, obj, headers, onProgress);
        return URL.createObjectURL(blob);
    }
    async postObjectForFile(path, obj, headers, onProgress) {
        return await this._postObjectForFile(path, obj, headers, onProgress);
    }
    async _getText(path, headers, onProgress) {
        onProgress = this.normalizeOnProgress(headers, onProgress);
        headers = this.normalizeHeaders(headers);
        return await this.getXHR(path, "text", headers, onProgress);
    }
    async getText(path, headers, onProgress) {
        return await this._getText(path, headers, onProgress);
    }
    async _postObjectForText(path, obj, headers, onProgress) {
        onProgress = this.normalizeOnProgress(headers, onProgress);
        headers = this.normalizeHeaders(headers);
        return this.postXHR(path, "text", obj, headers, onProgress);
    }
    async postObjectForText(path, obj, headers, onProgress) {
        return await this._postObjectForText(path, obj, headers, onProgress);
    }
    setDefaultAcceptType(headers, type) {
        if (!headers) {
            headers = new Map();
        }
        if (!headers.has("Accept")) {
            headers.set("Accept", type);
        }
        return headers;
    }
    async _getObject(path, headers, onProgress) {
        onProgress = this.normalizeOnProgress(headers, onProgress);
        headers = this.normalizeHeaders(headers);
        headers = this.setDefaultAcceptType(headers, "application/json");
        return await this.getXHR(path, "json", headers, onProgress);
    }
    async getObject(path, headers, onProgress) {
        return await this._getObject(path, headers, onProgress);
    }
    async _postObjectForObject(path, obj, headers, onProgress) {
        onProgress = this.normalizeOnProgress(headers, onProgress);
        headers = this.normalizeHeaders(headers);
        return await this.postXHR(path, "json", obj, headers, onProgress);
    }
    async postObjectForObject(path, obj, headers, onProgress) {
        return await this._postObjectForObject(path, obj, headers, onProgress);
    }
    async _postObject(path, obj, headers, onProgress) {
        onProgress = this.normalizeOnProgress(headers, onProgress);
        headers = this.normalizeHeaders(headers);
        await this.postXHR(path, "", obj, headers, onProgress);
    }
    async postObject(path, obj, headers, onProgress) {
        return await this._postObject(path, obj, headers, onProgress);
    }
    async _getXml(path, headers, onProgress) {
        onProgress = this.normalizeOnProgress(headers, onProgress);
        headers = this.normalizeHeaders(headers);
        const doc = await this.getXHR(path, "document", headers, onProgress);
        return doc.documentElement;
    }
    async getXml(path, headers, onProgress) {
        return await this._getXml(path, headers, onProgress);
    }
    async _postObjectForXml(path, obj, headers, onProgress) {
        onProgress = this.normalizeOnProgress(headers, onProgress);
        headers = this.normalizeHeaders(headers);
        const doc = await this.postXHR(path, "document", obj, headers, onProgress);
        return doc.documentElement;
    }
    async postObjectForXml(path, obj, headers, onProgress) {
        return await this._postObjectForXml(path, obj, headers, onProgress);
    }
    async loadScript(path, test, onProgress) {
        if (!test()) {
            const scriptLoadTask = waitFor(test);
            const file = await this.getFile(path, onProgress);
            createScript(file);
            await scriptLoadTask;
        }
        else if (onProgress) {
            onProgress(1, 1, "skip");
        }
    }
    async getWASM(path, imports, onProgress) {
        const wasmBuffer = await this.getBuffer(path, onProgress);
        if (wasmBuffer.contentType !== "application/wasm") {
            throw new Error("Server did not respond with WASM file. Was: " + wasmBuffer.contentType);
        }
        const wasmModule = await WebAssembly.instantiate(wasmBuffer.buffer, imports);
        return wasmModule.instance.exports;
    }
}
//# sourceMappingURL=Fetcher.js.map