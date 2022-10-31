import { JSONObject } from "./JSONObject";

export interface BaseRequest extends JSONObject {
  controller: string;

  action: string;

  body?: JSONObject;
}
