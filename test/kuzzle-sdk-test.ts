/**
 * This file only purpose is to check that type remains compliant with the spec for user usage.
 * This is not meant to be executed. It is only a compilation check along the test battery.
 *
 * If you see red warning, it's likely that you broke the code somewhere and introduced a breaking change.
 *
 * TODO: This can be safely removed when test will be migrated to TypeScript.
 *
 * Inspired by TS standard from DefinitelyTyped
 * @see https://github.com/DefinitelyTyped/DefinitelyTyped#my-package-teststs
 */
import { Kuzzle } from "../src/Kuzzle";
import WebSocket from "../src/protocols/WebSocket";
const kuzzle = new Kuzzle(new WebSocket("toto"));

// Events
kuzzle.on("connected", () => {});
kuzzle.on("callbackError", ({ error, notification }) => {});
kuzzle.on(
  "discarded",
  ({
    action,
    controller,
    _id,
    body,
    collection,
    index,
    jwt,
    requestId,
    volatile,
  }) => {}
);
kuzzle.on("disconnected", ({ origin }) => {});
kuzzle.on("loginAttempt", ({ success, error }) => {});

// Methods
kuzzle.connect().then(() => {});
kuzzle.disconnect();
kuzzle.isAuthenticated().then(() => {});
kuzzle.query({ controller: "auth", action: "login" }).then(() => {});

kuzzle.authenticator = () => Promise.resolve();
kuzzle.authenticator().then(() => {});
kuzzle.authenticate().then(() => {});
kuzzle
  .login("local", { username: "ScreamZ", password: "some_password" })
  .then(() => {});
kuzzle.logout().then(() => {});
