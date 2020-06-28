﻿import { TestState } from "./TestState.js";

export class TestScore {
    constructor(name) {
        this.name = name;
        this.state = TestState.found;
        this.messages = [];
    }
    start() {
        this.state |= TestState.started;
    }
    success() {
        this.state |= TestState.succeeded;
    }
    fail(message) {
        this.state |= TestState.failed;
        this.messages.push(message);
    }
    finish(value) {
        this.state |= TestState.completed;
        if (!!value) {
            this.messages.push(value);
        }
    }
}
